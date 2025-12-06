import React, { useEffect, useState, useRef } from "react";
import "./Resources.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchSummaryData, clearFilterData } from "../../../Redux/Action/filterAction";
import throttle from "lodash.throttle";
import ResourceDetails from "../Analyze/ResourceDetails";

const Resources = ({ chipsHeight }) => {
  const dispatch = useDispatch();
  const data1 = useSelector((state) => state.caseData.caseData);
  const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
  const { data, page, totalPages, selectedResource: selectedFromRedux } = useSelector((state) => state.filterData);

  const summaryData = data;

  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [allResources, setAllResources] = useState([]);

  // Infinite Scroll Refs
  const sidebarRef = useRef(null);
  const scrollDirectionRef = useRef(null);
  const isFirstMount = useRef(true);
  const lastFetchedPageRef = useRef(null);
  const fetchInProgressRef = useRef(false);
  const scrollTriggeredFetchRef = useRef(false);
  const scrollLockRef = useRef(false);
  const isProgrammaticScroll = useRef(false);

  // Track previous filter to detect actual changes
  const filterRef = useRef(null);

  // ✅ FIX: Add timeout refs to force unlock after delay
  const scrollLockTimeoutRef = useRef(null);
  const programmaticScrollTimeoutRef = useRef(null);

  console.log("Resources:", allResources, "Redux Page:", page, "Locks:", {
    scrollLock: scrollLockRef.current,
    isProgrammatic: isProgrammaticScroll.current,
    fetchInProgress: fetchInProgressRef.current
  });

  // ✅ Helper function to clear all locks
  const clearAllLocks = () => {
    console.log("🔓 Clearing all locks");
    scrollLockRef.current = false;
    isProgrammaticScroll.current = false;
    fetchInProgressRef.current = false;

    // Clear any pending timeouts
    if (scrollLockTimeoutRef.current) {
      clearTimeout(scrollLockTimeoutRef.current);
      scrollLockTimeoutRef.current = null;
    }
    if (programmaticScrollTimeoutRef.current) {
      clearTimeout(programmaticScrollTimeoutRef.current);
      programmaticScrollTimeoutRef.current = null;
    }
  };

  // ✅ Fetch Data Function with improved lock management
  const fetchData = async (pageNum) => {
    if (!data1?.id) {
      console.log("⚠️ No case ID");
      return;
    }

    if (lastFetchedPageRef.current === pageNum) {
      console.log("⚠️ Already fetched page:", pageNum);
      return;
    }

    if (fetchInProgressRef.current) {
      console.log("⚠️ Fetch already in progress, skipping");
      return;
    }

    console.log("📥 Fetching page:", pageNum);
    fetchInProgressRef.current = true;
    lastFetchedPageRef.current = pageNum;
    setLoading(true);

    // ✅ Safety timeout - force unlock after 5 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn("⚠️ Fetch took too long, forcing unlock");
      clearAllLocks();
    }, 5000);

    try {
      await dispatch(
        fetchSummaryData({
          case_id: String(data1.id),
          ...(caseFilter?.file_type && { file_type: caseFilter.file_type }),
          ...(caseFilter?.aggs_fields && { aggsFields: caseFilter.aggs_fields }),
          ...(caseFilter?.sentiment && { sentiments: caseFilter.sentiment }),
          ...(Array.isArray(caseFilter?.target) && {
            targets: caseFilter.target.map((t) => String(t.value)),
          }),
          ...(caseFilter?.keyword?.length > 0 && { keyword: caseFilter.keyword }),
          ...(caseFilter?.unified_type?.length > 0 && { unified_type: caseFilter.unified_type }),
          ...(caseFilter?.eventtypestring?.length > 0 && { eventtypestring: caseFilter.eventtypestring }),
          ...(caseFilter?.mobilenumber?.length > 0 && { mobilenumber: caseFilter.mobilenumber }),
          ...(caseFilter?.socialmedia_hashtags?.length > 0 && { socialmedia_hashtags: caseFilter.socialmedia_hashtags }),
          ...(caseFilter?.socialmedia_from_id?.length > 0 && { socialmedia_from_id: caseFilter.socialmedia_from_id }),
          ...(caseFilter?.socialmedia_from_screenname?.length > 0 && {
            socialmedia_from_screenname: caseFilter.socialmedia_from_screenname,
          }),
          ...(caseFilter?.serverip?.length > 0 && { serverip: caseFilter.serverip }),
          ...(caseFilter?.latitude && { latitude: caseFilter.latitude }),
          ...(caseFilter?.longitude && { longitude: caseFilter.longitude }),
          ...(caseFilter?.start_time && { starttime: caseFilter.start_time }),
          ...(caseFilter?.end_time && { endtime: caseFilter.end_time }),
          ...(caseFilter?.loc?.length > 0 && { loc: caseFilter.loc }),
          ...(caseFilter?.emails?.length > 0 && { emails: caseFilter.emails }),
          ...(caseFilter?.event?.length > 0 && { event: caseFilter.event }),
          ...(caseFilter?.date?.length > 0 && { date: caseFilter.date }),
          ...(caseFilter?.person?.length > 0 && { person: caseFilter.person }),
          ...(caseFilter?.org?.length > 0 && { org: caseFilter.org }),
          ...(caseFilter?.language?.length > 0 && { language: caseFilter.language }),
          
          page: pageNum,
          itemsPerPage: 50,
        })
      );

      console.log("✅ Fetch completed for page:", pageNum);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      // On error, reset everything
      clearAllLocks();
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
      fetchInProgressRef.current = false;

      // ✅ Clear scroll lock after a short delay to allow scroll reposition
      scrollLockTimeoutRef.current = setTimeout(() => {
        scrollLockRef.current = false;
        console.log("🔓 Scroll lock cleared");
      }, 1000);
    }
  };

  // Reset ONLY when case/filter actually changes
  useEffect(() => {
    const filterString = JSON.stringify({ caseId: data1?.id, filters: caseFilter });

    if (filterRef.current !== null && filterRef.current !== filterString) {
      console.log("🔄 Filter changed - Resetting to page 1");

      // Clear all locks and timeouts
      clearAllLocks();

      // Reset all state
      setAllResources([]);
      setSelectedResource(null);
      lastFetchedPageRef.current = null;
      isFirstMount.current = true;
      scrollTriggeredFetchRef.current = false;

      // Reset Redux page to 1 and fetch
      dispatch(clearFilterData());
      setTimeout(() => fetchData(1), 0);
    } else if (filterRef.current === null && data1?.id) {
      console.log("📌 Initial case set - fetching page:", page || 1);
      fetchData(page || 1);
    }

    filterRef.current = filterString;
  }, [data1?.id, JSON.stringify(caseFilter), dispatch]);

  // Fetch when page changes (excluding scroll-triggered changes)
  useEffect(() => {
    if (scrollTriggeredFetchRef.current) {
      console.log("🔄 Scroll triggered fetch - skipping useEffect");
      scrollTriggeredFetchRef.current = false;
      return;
    }

    if (data1?.id && page && page !== lastFetchedPageRef.current) {
      console.log("📄 Page changed externally to:", page);
      fetchData(page);
    }
  }, [page, data1?.id]);

  // Update UI when data changes
  useEffect(() => {
    if (summaryData && Array.isArray(summaryData) && summaryData.length > 0) {
      setAllResources(summaryData);

      if (selectedFromRedux && summaryData.some(r => r.row_id === selectedFromRedux.row_id)) {
        setSelectedResource(selectedFromRedux);
      } else {
        setSelectedResource(summaryData[0]);
      }
    } else if (summaryData && Array.isArray(summaryData) && summaryData.length === 0) {
      setAllResources([]);
      setSelectedResource(null);
    }
  }, [summaryData, selectedFromRedux]);

  // ♾️ Infinite Scroll Handler
  useEffect(() => {
    const container = sidebarRef.current;
    if (!container) return;

    const handleInfiniteScroll = throttle(() => {
      // ✅ More detailed lock checking with console logs
      if (fetchInProgressRef.current) {
        console.log("⏸️ Fetch in progress, ignoring scroll");
        return;
      }
      if (isProgrammaticScroll.current) {
        console.log("⏸️ Programmatic scroll, ignoring");
        return;
      }
      if (scrollLockRef.current) {
        console.log("⏸️ Scroll locked, ignoring");
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      const isAtTop = scrollTop < 10;

      console.log("📜 Scroll position:", {
        scrollTop: scrollTop.toFixed(0),
        isAtTop,
        isAtBottom,
        page,
        totalPages
      });

      if (isAtBottom && page < totalPages) {
        console.log("⬇️ Bottom reached — fetching next page", page + 1);
        scrollDirectionRef.current = "down";
        scrollTriggeredFetchRef.current = true;
        scrollLockRef.current = true;
        fetchData(page + 1);
      } else if (isAtTop && page > 1) {
        console.log("⬆️ Top reached — fetching previous page", page - 1);
        scrollDirectionRef.current = "up";
        scrollTriggeredFetchRef.current = true;
        scrollLockRef.current = true;
        fetchData(page - 1);
      }
    }, 300);

    container.addEventListener("scroll", handleInfiniteScroll);
    return () => {
      handleInfiniteScroll.cancel();
      container.removeEventListener("scroll", handleInfiniteScroll);
    };
  }, [page, totalPages]);

  // 🪄 Scroll reposition after page change
  useEffect(() => {
    const container = sidebarRef.current;
    if (!container || !summaryData?.length) return;

    if (isFirstMount.current) {
      setTimeout(() => {
        const offset = 20;
        const scrollTop = Math.max(offset, 0);
        container.scrollTo({ top: scrollTop, behavior: "auto" });
        isFirstMount.current = false;
      }, 100);
      return;
    }

    // ✅ Improved programmatic scroll with proper timeout management
    if (scrollDirectionRef.current === "up" && page > 1) {
      setTimeout(() => {
        isProgrammaticScroll.current = true;
        const newScrollTop = container.scrollHeight * 0.4;

        console.log("🔼 Repositioning scroll after UP fetch");
        container.scrollTo({ top: newScrollTop, behavior: "smooth" });

        // ✅ Clear programmatic flag with timeout ref
        programmaticScrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
          console.log("🔓 Programmatic scroll flag cleared (UP)");
        }, 1000);

        scrollDirectionRef.current = null;
      }, 100);
    } else if (scrollDirectionRef.current === "down" && page < totalPages) {
      setTimeout(() => {
        isProgrammaticScroll.current = true;
        const newScrollTop = container.scrollHeight * 0.6 - container.clientHeight;

        console.log("🔽 Repositioning scroll after DOWN fetch");
        container.scrollTo({ top: newScrollTop, behavior: "smooth" });

        // ✅ Clear programmatic flag with timeout ref
        programmaticScrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
          console.log("🔓 Programmatic scroll flag cleared (DOWN)");
        }, 1000);

        scrollDirectionRef.current = null;
      }, 100);
    }
  }, [summaryData, page, totalPages]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllLocks();
    };
  }, []);

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
  };

  return (
    <ResourceDetails
      isListView={true}
      resources={allResources}
      selectedResource={selectedResource}
      loading={loading}
      hasMore={page < totalPages}
      handleResourceClick={handleResourceClick}
      sidebarRef={sidebarRef}
      showCommentPopup={true}
      showPopup={showPopup}
      setShowPopup={setShowPopup}
      title="Resources Insights"
      chipsHeight={chipsHeight}
    />
  );
};

export default Resources;