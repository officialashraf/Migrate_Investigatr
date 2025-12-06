// import React, { useState, useCallback, useRef } from "react";
// import { Card, CardContent, Typography, Grid } from "@mui/material";
// import styles from './graphicalData.module.css'
// import LineGraph from "./lineChart";
// import KeywordChart from "./keywordChart";
// import SentimentPieChart from "./sentimentPiechart";
// import LocationBar from "./locationBar";
// import DateBar from "./dateBar";
// import EventBar from "./eventBar";
// import PersonBar from "./personBar";
// import LanguageBar from "./languageBar";
// import OrgBar from "./orgBar";
// import LazyLoadWrapper from "./lazyLoadWrapper";
// import CaseSummary from "./casesummary";
// import CaseEventtypestring from "./caseEventtypestring";
// import PropTypes from "prop-types";

// const Header = ({ title }) => (
//   <div style={{ color: "white", paddingLeft: "20px", fontSize: "16px", marginBottom: "10px" }}>
//     {title}
//   </div>
// );

// const ChartCard = ({ title, height = 350, children, show = true, xs = 6 }) => {
//   if (!show) return null;

//   return (
//     <Grid item xs={xs} p={1}>
//       <Header title={title} />
//       <Card sx={{ height: `${height}px`, backgroundColor: "#101D2B", borderRadius: '25px' }}>
//         <CardContent>
//           <LazyLoadWrapper height={height - 50}>
//             {children}
//           </LazyLoadWrapper>
//         </CardContent>
//       </Card>
//     </Grid>
//   );
// };

// const GraphicalData = () => {
//   const [dataStates, setDataStates] = useState({
//     timeline: true,
//     platforms: true,
//     sentiment: true,
//     keywords: true,
//     locations: true,
//     eventTypes: true,
//     events: true,
//     time: true,
//     persons: true,
//     languages: true,
//     organizations: true
//   });

//   const chartConfigs = [
//     { key: 'timeline', title: 'Timelines', component: LineGraph, xs: 12, height: 300 },
//     { key: 'platforms', title: 'Platforms', component: CaseSummary },
//     { key: 'sentiment', title: 'Sentiments', component: SentimentPieChart },
//     { key: 'keywords', title: 'Keywords', component: KeywordChart },
//     { key: 'locations', title: 'Locations', component: LocationBar },
//     { key: 'eventTypes', title: 'Event Types', component: CaseEventtypestring },
//     { key: 'events', title: 'Events', component: EventBar },
//     { key: 'time', title: 'Time', component: DateBar },
//     { key: 'persons', title: 'Persons', component: PersonBar },
//     { key: 'languages', title: 'Languages', component: LanguageBar },
//     { key: 'organizations', title: 'Organizations', component: OrgBar }
//   ];
// const callbacksRef = useRef({});

// chartConfigs.forEach(({ key }) => {
//   if (!callbacksRef.current[key]) {
//     callbacksRef.current[key] = (hasData) => {
//       setDataStates(prev => {
//         if (prev[key] === hasData) return prev; // no change → no re-render
//         return { ...prev, [key]: hasData };
//       });
//     };
//   }
// });
//   const hasAnyData = Object.values(dataStates).some(Boolean);
//   return (
//     <div className={styles.responsiveContainer}>
//       <Grid 
//         container 
//         spacing={1} 
//         p={1} 
//         className={styles.responsiveGrid}
//         sx={{
//           background: "#080E17",
//           height: '66vh',
//           overflowY: 'auto',
//           overflowX: 'hidden'
//         }}
//       >
//          {hasAnyData ? (
//           chartConfigs.map(({ key, title, component: Component, xs = 6, height = 350 }) => (
//             <ChartCard key={key} title={title} height={height} show={dataStates[key]} xs={xs}>
//               <Component onDataCheck={callbacksRef.current[key]} />
//             </ChartCard>
//           ))
//         ) : (
//           <Grid item xs={12}>
//             <p
//              align="center"
//               sx={{ color: "white", padding: "150px" }}
//             >
//                No Data Found
//             </p>
//           </Grid>
//         )}
//       </Grid>
//     </div>
//   );
// };

// Header.propTypes = {
//   title: PropTypes.string.isRequired
// };

// ChartCard.propTypes = {
//   title: PropTypes.string.isRequired,
//   height: PropTypes.number,
//   children: PropTypes.node.isRequired,
//   show: PropTypes.bool
// };

// export default React.memo(GraphicalData);

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, Grid } from "@mui/material";
import { useSelector } from 'react-redux';
import styles from './graphicalData.module.css'
import LineGraph from "./lineChart";
import KeywordChart from "./keywordChart";
import SentimentPieChart from "./sentimentPiechart";
import LocationBar from "./locationBar";
import DateBar from "./dateBar";
import EventBar from "./eventBar";
import PersonBar from "./personBar";
import LanguageBar from "./languageBar";
import OrgBar from "./orgBar";
import LazyLoadWrapper from "./lazyLoadWrapper";
import CaseSummary from "./casesummary";
import CaseEventtypestring from "./caseEventtypestring";
import PropTypes from "prop-types";
import StaticalCaseSummary from "./statistical";
import SubscribeCaseSummary from "./subscribe";
import EmailChart from "./EmailChart";
import PhoneNumberChart from "./phoneNumberChart";
import ServerIPChart from "./serverIP";
import mobileNumberChart from "./mobileNumberGrapgh";

const Header = React.memo(({ title }) => (
  <div style={{ color: "white", paddingLeft: "20px", fontSize: "16px", marginBottom: "10px" }}>
    {title}
  </div>
));

const ChartCard = React.memo(({ title, height = 350, children, show = true, xs = 6 }) => {
  return (
    <Grid item xs={xs} p={1} style={{ display: show ? "block" : "none" }}>
      <Header title={title} />
      <Card sx={{ height: `${height}px`, backgroundColor: "#101D2B", borderRadius: '25px' }}>
        <CardContent>
          <LazyLoadWrapper height={height - 50}>
            {children}
          </LazyLoadWrapper>
        </CardContent>
      </Card>
    </Grid>
  );
});


const GraphicalData = ({chipsHeight}) => {
  const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
  const containerRef = useRef(null);
  const [dataStates, setDataStates] = useState({
    timeline: true,
    platforms: true,
    sentiment: true,
    keywords: true,
    locations: true,
    eventTypes: true,
    events: true,
    time: true,
    persons: true,
    languages: true,
    organizations: true,
    staticalCaseSummary: true,
    subscribeCaseSummary: true,
    emails: true,
    phoneNumber: true,
    mobileNumber: true,
    serverIP: true
  });

  // Memoize chart configs to prevent recreation on every render
  const chartConfigs = useMemo(() => [
    { key: 'timeline', title: 'Timelines', component: LineGraph, xs: 12, height: 300 },
    { key: 'platforms', title: 'Platforms', component: CaseSummary },
    { key: 'sentiment', title: 'Sentiments', component: SentimentPieChart },
    { key: 'keywords', title: 'Hashtags', component: KeywordChart },
    { key: 'locations', title: 'Locations', component: LocationBar },
    { key: 'emails', title: `Email ID's`, component: EmailChart },
    { key: 'phoneNumber', title: 'OSINT Phone Numbers', component: PhoneNumberChart },
    { key: 'eventTypes', title: 'Event Types', component: CaseEventtypestring },
    { key: 'events', title: 'Events', component: EventBar },
    { key: 'time', title: 'Times', component: DateBar },
    { key: 'persons', title: 'Persons', component: PersonBar },
    { key: 'languages', title: 'Languages', component: LanguageBar },
    { key: 'organizations', title: 'Organizations', component: OrgBar },
    { key: 'staticalCaseSummary', title: 'IPDR Statistics', component: StaticalCaseSummary },
    { key: 'subscribeCaseSummary', title: 'IPDR Subscribers', component: SubscribeCaseSummary }, 
    { key: 'serverIP', title: `Server IP's`, component: ServerIPChart },
    { key: 'mobileNumber', title: 'IPDR Mobile Numbers', component: mobileNumberChart },
  ], []);

  // Stable callback references using useRef
  const callbacksRef = useRef({});
  
  // Create callbacks only once
  useMemo(() => {
    chartConfigs.forEach(({ key }) => {
      if (!callbacksRef.current[key]) {
        callbacksRef.current[key] = (hasData) => {
          setDataStates(prev => {
            if (prev[key] === hasData) return prev; // Prevent unnecessary updates
            return { ...prev, [key]: hasData };
          });
        };
      }
    });
  }, [chartConfigs]);

  // Detect reset more efficiently
  const isResetDetected = useMemo(() => {
    if (!caseFilter) return false;
    
    return !caseFilter.keyword?.length &&
           !caseFilter.file_type?.length &&
           !caseFilter.aggs_fields?.length &&
           !caseFilter.target?.length &&
           !caseFilter.sentiment?.length &&
           !caseFilter.start_time &&
           !caseFilter.end_time && 
            !caseFilter.unified_type?.length &&
            !caseFilter.eventtypestring?.length &&
            !caseFilter.mobilenumber?.length &&
            !caseFilter.socialmedia_from_id?.length &&
            !caseFilter.socialmedia_from_screenname?.length &&
            !caseFilter.socialmedia_hashtags?.length &&
            !caseFilter.serverip?.length &&
            !caseFilter.latitude &&
            !caseFilter.longitude &&
            !caseFilter.loc && 
            !caseFilter.emails && 
            !caseFilter.event && 
            !caseFilter.date && 
            !caseFilter.person && 
            !caseFilter.org && 
            !caseFilter.languages

           
  }, [caseFilter]);

  // Handle reset only when actually needed
  useEffect(() => {
    if (isResetDetected) {
      console.log("Reset detected, resetting data states");
      setDataStates({
        timeline: true,
        platforms: true,
        sentiment: true,
        keywords: true,
        locations: true,
        eventTypes: true,
        events: true,
        time: true,
        persons: true,
        languages: true,
        organizations: true,
        staticalCaseSummary: true,
        subscribeCaseSummary: true,
        emails: true,
        phoneNumber: true,
        mobileNumber: true,
        serverIP: true,
        latitude: true,
        longitude: true,
      });
    }
  }, [isResetDetected]);
useEffect(() => {
  // jab bhi redux filter change ho, sabhi charts ko visible bana do
  setDataStates(prev =>
    Object.fromEntries(Object.keys(prev).map(key => [key, true]))
  );
}, [caseFilter]);

  useEffect(() => {
    const scrollKey = "graphicalDataScrollPos";
    const container = containerRef.current;
    
    if (!container) return;

    // ✅ Restore scroll position
    const savedPos = localStorage.getItem(scrollKey);
    if (savedPos && !isNaN(savedPos)) {
      setTimeout(() => {
        container.scrollTop = parseInt(savedPos, 10);
      }, 100);
    }

    // ✅ Save scroll position on every scroll
    const handleScrollSave = () => {
      localStorage.setItem(scrollKey, container.scrollTop.toString());
    };

    container.addEventListener("scroll", handleScrollSave);
     return () => {
    container.removeEventListener("scroll", handleScrollSave);
    // localStorage.removeItem(scrollKey); // Add this line
  };

  }, []);


  const hasAnyData = useMemo(() => 
    Object.values(dataStates).some(Boolean), 
    [dataStates]
  );

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
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {hasAnyData ? (
          chartConfigs.map(({ key, title, component: Component, xs = 6, height = 350 }) => (
            <ChartCard 
              key={key} 
              title={title} 
              height={height} 
              show={dataStates[key]} 
              xs={xs}
            >
              <Component
                onDataCheck={callbacksRef.current[key]}
              />
            </ChartCard>
          ))
        ) : (
          <Grid item xs={12}>
            <p
              align="center"
              sx={{ padding: "150px", color: "white" }}
            >
              No Data Found
            </p>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
  children: PropTypes.node.isRequired,
  show: PropTypes.bool,
  xs: PropTypes.number
};

export default React.memo(GraphicalData);