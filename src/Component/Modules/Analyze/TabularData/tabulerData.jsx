import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSummaryData, setSelectedResource } from "../../../../Redux/Action/filterAction";
import Loader from "../../Layout/loader";
import axios from "axios";
import Cookies from "js-cookie";
import CommonTableComponent from "../../../Common/Table/CommonTableComponent";

const TabulerData = ({ chipsHeight, setActiveView }) => {
  const dispatch = useDispatch();
  const caseData = useSelector((state) => state.caseData.caseData);
  const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
  const {
    data,
    headers,
    page,
    totalPages,
    loading,
    error,
    totalResults,
  } = useSelector((state) => state.filterData);

  const [columnMapping, setColumnMapping] = useState([]);

  // ✅ FIX 1: Track previous filter to detect changes
  const filterRef = useRef(null);
  const lastFetchedPageRef = useRef(null);

  // Group color logic
  const groupColors = {};
  const getGroupColor = (groupName) => {
    if (groupColors[groupName]) return groupColors[groupName];
    const colorList = [
      "#000000ff", "#4B0082ff", "#006400ff", "#8B0000ff",
      "#8B4513ff", "#2F4F4Fff", "#3A3A00ff", "#483D8Bff",
    ];
    const color = colorList[Object.keys(groupColors).length % colorList.length];
    groupColors[groupName] = color;
    return color;
  };

  const handleRowClick = (itemData) => {
    dispatch(setSelectedResource(itemData));
    if (setActiveView) {
      setActiveView();
    }
  };

  // ✅ Fetch column mapping once
  useEffect(() => {
    const fetchMapping = async () => {
      try {
        const token = Cookies.get("accessToken");
        const response = await axios.get(
          `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/mappings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        setColumnMapping(response.data);
      } catch (error) {
        console.error("Mapping fetch failed", error);
      }
    };
    fetchMapping();
  }, []);

  // ✅ Build payload helper function
  const buildPayload = (pageNum) => {
    const rawPayload = {
      case_id: String(caseData.id),
      file_type: caseFilter?.file_type,
      starttime: caseFilter?.start_time,
      endtime: caseFilter?.end_time,
      aggsFields: caseFilter?.aggs_fields,
      keyword: caseFilter?.keyword,
      sentiments: caseFilter?.sentiment,
      targets: Array.isArray(caseFilter?.target)
        ? caseFilter.target.map(t => String(t.value))
        : [],
      unified_type: caseFilter?.unified_type,
      eventtypestring: caseFilter?.eventtypestring,
      mobilenumber: caseFilter?.mobilenumber,
      socialmedia_hashtags: caseFilter?.socialmedia_hashtags,
      socialmedia_from_id: caseFilter?.socialmedia_from_id,
      socialmedia_from_screenname: caseFilter?.socialmedia_from_screenname,
      serverip: caseFilter?.serverip,
      latitude: caseFilter?.latitude,
      longitude: caseFilter?.longitude,
      loc: caseFilter?.loc,
      emails: caseFilter?.emails,
      event: caseFilter?.event,
      date: caseFilter?.date,
      person: caseFilter?.person,
      org: caseFilter?.org,
      language: caseFilter?.language,
      page: pageNum,
      itemsPerPage: 50,
    };

    // Filter out empty values
    return Object.fromEntries(
      Object.entries(rawPayload).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
      )
    );
  };

  // ✅ FIX 2: Reset ONLY when case/filter actually changes
  useEffect(() => {
    if (!caseData?.id) return;

    const filterString = JSON.stringify({ caseId: caseData.id, filters: caseFilter });

    // Check if filter actually changed
    if (filterRef.current !== null && filterRef.current !== filterString) {
      console.log("🔄 Filter changed - Resetting to page 1");

      // Reset state
      lastFetchedPageRef.current = null;
      dispatch(setSelectedResource(null));

      // ✅ Fetch page 1 with new filters
      const payload = buildPayload(1);
      console.log("📤 Fetching with new filters:", payload);
      dispatch(fetchSummaryData(payload));
    } else if (filterRef.current === null) {
      // ✅ First time case is set - fetch current page
      console.log("📌 Initial case set - fetching page:", page || 1);
      const payload = buildPayload(page || 1);
      dispatch(fetchSummaryData(payload));
    }

    filterRef.current = filterString;
  }, [caseData?.id, JSON.stringify(caseFilter), dispatch]);

  // ✅ FIX 3: Fetch when page changes from pagination
  useEffect(() => {
    if (!caseData?.id) return;

    // Only fetch if page actually changed and it's different from last fetched
    if (page && page !== lastFetchedPageRef.current) {
      console.log("📄 Page changed to:", page);
      lastFetchedPageRef.current = page;

      const payload = buildPayload(page);
      console.log("📤 Fetching page:", payload);
      dispatch(fetchSummaryData(payload));
    }
  }, [page, caseData?.id, dispatch]);

  // ✅ Handle page change from table
  const handlePageChange = (newPage) => {
    if (newPage !== page && newPage >= 1 && newPage <= totalPages) {
      console.log("🔢 User changed page to:", newPage);
      dispatch(setSelectedResource(null));

      // This will trigger the useEffect above
      lastFetchedPageRef.current = newPage;
      const payload = buildPayload(newPage);
      dispatch(fetchSummaryData(payload));
    }
  };

  if (loading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  return (
    <CommonTableComponent
      data={data}
      onDoubleClick={handleRowClick}
      chipsHeight={chipsHeight}
      tabulerDynamic
      headers={headers}
      loading={loading}
      error={error}
      currentPage={page}
      totalPages={totalPages}
      totalResults={totalResults}
      handlePageChange={handlePageChange}
      columnMapping={columnMapping}
      useColumnMapping={true}
      groupColors={groupColors}
      getGroupColor={getGroupColor}
      showGroupHeaders={true}
      specialColumns={[
        "socialmedia_hashtags", "targets", "person", "gpe", "unified_case_id",
        "org", "loc", "event", "time", "date", "money", "sentiment", "product",
        "quantity", "law", "language", "phone_numbers", "emails",
        "socialmedia_from_id", "socialmedia_from_screenname", "serverip",
        "unified_type", "eventtypestring", "mobilenumber", "socialmedia_usermentions"
      ]}
    />
  );
};

export default TabulerData;