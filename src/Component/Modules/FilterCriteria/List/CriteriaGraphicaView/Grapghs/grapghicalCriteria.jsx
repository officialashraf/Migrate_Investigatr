import React, { useEffect, useRef, useState, useMemo } from "react";
import { Card, CardContent, Grid } from "@mui/material";
import { useSelector } from "react-redux";
import styles from "../../../../Analyze/GraphicalData/graphicalData.module.css";
import LineGrapgh from "./criteriaLineChart";
import CriteriaKwywordChart from "./criteriaKeywordCloude";
import SentimentPieChart from "./criteriaSentiment";
import DateGraph from "./dateGraph";
import EventGraph from "./eventGarph";
import PersonGraph from "./personGarph";
import OrgGraph from "./organisationGraph";
import LanguageGraph from "./languageGraph";
import LocationGraph from "./locationGraph";
import LazyLoadWrapper from "../../../../Analyze/GraphicalData/lazyLoadWrapper";
import SearchSummary from "./searchSummary";
import PropTypes from "prop-types";
import SearchEventypestring from "./serachEventypesrting";
import StaticalSearchSummary from "./staticalSearchSummary";
import SubscribeSummary from "../subscribeSummary";
import CriteriaEmailChart from "./emailGraph";
import CriteriaPhoneNumberChart from "./phoneNumberGraph";
import ServerIPChart from "./serverIPGraph";
import MobileNumberGraph from "./mobileNumberGraph";

const Header = React.memo(({ title }) => (
  <div
    style={{
      color: "white",
      paddingLeft: "20px",
      fontSize: "16px",
      marginBottom: "10px",
    }}
  >
    {title}
  </div>
));

const ChartCard = React.memo(
  ({ title, height = 350, children, show = true, xs = 6 }) => {
    return (
      <Grid item xs={xs} p={1} style={{ display: show ? "block" : "none" }}>
        <Header title={title} />
        <Card
          sx={{
            height: `${height}px`,
            backgroundColor: "#101D2B",
            borderRadius: "25px",
          }}
        >
          <CardContent>
            <LazyLoadWrapper height={height - 50}>{children}</LazyLoadWrapper>
          </CardContent>
        </Card>
      </Grid>
    );
  }
);

const GraphicalCriteria = ({chipsHeight}) => {
  const caseFilter = useSelector(
    (state) => state.criteriaKeywords?.queryPayload
  );
  const summaryData = useSelector((state) => state.summaryData);
 const containerRef = useRef(null);
  //  state initialization
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [dataStates, setDataStates] = useState({
    timeline: true,
    platforms: true,
    sentiments: true,
    keywords: true,
    locations: true,
    eventTypes: true,
    events: true,
    time: true,
    persons: true,
    languages: true,
    organizations: true,
    staticalSearchSummary: true,
    subscribeSummary: true,
    emails: true,
    phoneNumber: true,
    mobileNumber: true,
    serverIP: true,
  });

  //  Chart configurations
  const chartConfigs = useMemo(
    () => [
      { key: "timeline", title: "Timelines", component: LineGrapgh, xs: 12, height: 300 },
      { key: "platforms", title: "Platforms", component: SearchSummary },
      { key: "sentiment", title: "Sentiments", component: SentimentPieChart },
      { key: "keywords", title: "Hashtags", component: CriteriaKwywordChart },
      { key: "locations", title: "Locations", component: LocationGraph },
      { key: "emails", title: `Email ID's`, component: CriteriaEmailChart },
      { key: "phoneNumber", title: "OSINT Phone Numbers", component: CriteriaPhoneNumberChart },
      { key: "eventTypes", title: "Event Types", component: SearchEventypestring },
      { key: "events", title: "Events", component: EventGraph },
      { key: "time", title: "Times", component: DateGraph },
      { key: "persons", title: "Persons", component: PersonGraph },
      { key: "languages", title: "Languages", component: LanguageGraph },
      { key: "organizations", title: "Organizations", component: OrgGraph },
      { key: "staticalSearchSummary", title: "IPDR Statistics", component: StaticalSearchSummary },
      { key: "subscribeSummary", title: "IPDR Subscribers", component: SubscribeSummary },
      { key: "serverIP", title: `Server IP's`, component: ServerIPChart },
      { key: "mobileNumber", title: `IPDR Mobile Numbers`, component: MobileNumberGraph },
    ],
    []
  );

  //  Detect if filters are empty
  const isFilterEmpty = useMemo(() => {
    if (!caseFilter) return true;
    return (
      !caseFilter.case_id?.length &&
      !caseFilter.keyword?.length &&
      !caseFilter.file_type?.length &&
      !caseFilter.aggs_fields?.length &&
      !caseFilter.targets?.length &&
      !caseFilter.sentiments?.length &&
      !caseFilter.unified_type?.length &&
      !caseFilter.eventtypestring?.length &&
      !caseFilter.mobilenumber?.length &&
      !caseFilter.socialmedia_from_id?.length &&
      !caseFilter.socialmedia_from_screenname?.length &&
      !caseFilter.socialmedia_hashtags?.length &&
      !caseFilter.serverip?.length &&
      !caseFilter.start_time &&
      !caseFilter.end_time &&
      !caseFilter.latitude &&
      !caseFilter.longitude
    );
  }, [caseFilter]);

  //  Remove skip flag when filters are empty
  useEffect(() => {
    if (isFilterEmpty && sessionStorage.getItem("skipNextApiCall") === "true") {
      sessionStorage.removeItem("skipNextApiCall");
    }
  }, [isFilterEmpty]);
  //  Handle actual first load (no API call)
  useEffect(() => {
    if (!isFilterEmpty) {
      setIsFirstLoad(false);
    }
  
    if (isFilterEmpty) {
      setIsFirstLoad(true);
    }
  }, [isFilterEmpty]);

  //  Reset state of data visibility when filter clears
  useEffect(() => {
    if (isFilterEmpty) {
      setDataStates({
        timeline: true,
        platforms: true,
        sentiments: true,
        keywords: true,
        locations: true,
        eventTypes: true,
        events: true,
        time: true,
        persons: true,
        languages: true,
        organizations: true,
        staticalSearchSummary: true,
        subscribeSummary: true,
        emails: true,
        phoneNumber: true,
        mobileNumber: true,
        serverIP: true,
        latitude: true,
        longitude: true,
      });
    }
  }, [isFilterEmpty]);

useEffect(() => {
  const scrollKey = "graphicalScrollPos";
  const container = containerRef.current;
  if (!container) return;

  // Restore position after mount
  const savedPos = localStorage.getItem(scrollKey);
  if (savedPos && !isNaN(savedPos)) {
    requestAnimationFrame(() => {
      container.scrollTop = parseInt(savedPos, 10);
    });
  }

  const handleScrollSave = () => {
    localStorage.setItem(scrollKey, container.scrollTop.toString());
  };

  container.addEventListener("scroll", handleScrollSave);

   return () => {
    container.removeEventListener("scroll", handleScrollSave);
    // localStorage.removeItem(scrollKey); // Add this line
  };
}, [isFirstLoad]);



  //  Stable callbacks for child charts
  const callbacksRef = useRef({});
  useMemo(() => {
    chartConfigs.forEach(({ key }) => {
      if (!callbacksRef.current[key]) {
        callbacksRef.current[key] = (hasData) => {
          setDataStates((prev) => {
            if (prev[key] === hasData) return prev;
            return { ...prev, [key]: hasData };
          });
        };
      }
    });
  }, [chartConfigs]);
    

  if (isFirstLoad) { 
    return (
        <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8',
        fontSize: '12px',
        textAlign: 'center',
        padding: '20px'
      }}>
        {/* Please enter a search criteria to view the graphs */}
      </div>
    );
  }
  return (
    <div className={styles.responsiveContainer}>
      <Grid
      ref={containerRef}
        container
        spacing={1}
        p={1}
        className={styles.responsiveGrid}
        sx={{
           marginTop:'5px',
          background: "#080E17",
          maxHeight: `calc(80vh - ${chipsHeight}px)`, 
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {chartConfigs.map(({ key, title, component: Component, xs = 6, height = 350 }) => (
          <ChartCard
            key={key}
            title={title}
            height={height}
            show={dataStates[key]}
            xs={xs}
          >
            <Component
              onDataCheck={callbacksRef.current[key]}
              shouldFetch={!isFilterEmpty && sessionStorage.getItem("skipNextApiCall") !== "true"}
            />
          </ChartCard>
        ))}
      </Grid>
    </div>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
  children: PropTypes.node.isRequired,
  show: PropTypes.bool,
  xs: PropTypes.number,
};

export default React.memo(GraphicalCriteria);
