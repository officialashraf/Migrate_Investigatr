import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import axios from 'axios';
import throttle from 'lodash.throttle';
import { setPage, setSearchResults } from '../../../../Redux/Action/criteriaAction';
import ResourceDetails from '../../Analyze/ResourceDetails';

const ScrollCriteriaViewer = ({chipsHeight}) => {
    const dispatch = useDispatch();
    const token = Cookies.get('accessToken');
    const [selectedResource, setSelectedResource] = useState(null);
    const { currentPage, totalPages, searchResults, selectedResource: selectedFromRedux } = useSelector((state) => state.search || {});
    const payload = useSelector((state) => state.criteriaKeywords?.queryPayload || '');
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const payloadRef = useRef(null);

    // Infinite Scroll Refs
    const containerRef = useRef(null);
    const scrollDirectionRef = useRef(null);
    const isFirstMount = useRef(true);
    const lastFetchedPageRef = useRef(null);
    const fetchInProgressRef = useRef(false);
    const scrollTriggeredFetchRef = useRef(false);
    const scrollLockRef = useRef(false);
    const isProgrammaticScroll = useRef(false);
   const chipsHeight1 = chipsHeight 
    console.log("SearchResults:", searchResults, "Current Page:", currentPage);

    // Check if query is empty (same logic as MapViewSearch)
    

    //  Fetch Data Function
    const fetchPageData = async (page) => {
        if (!payload || fetchInProgressRef.current || lastFetchedPageRef.current === page) {
            console.log("⚠️ Skipping fetch - already in progress or same page");
            return;
        }

        console.log(" Fetching page:", page);
        fetchInProgressRef.current = true;
        lastFetchedPageRef.current = page;
        setLoading(true);

        try {
            const isValid = (v) =>
                Array.isArray(v) ? v.length > 0 :
                    typeof v === 'string' ? v.trim() !== '' :
                        v !== null && v !== undefined;

            const filteredPayload = {};
            Object.entries(payload).forEach(([key, value]) => {
                if (isValid(value)) {
                    if (key === "targets" && Array.isArray(value)) {
                        filteredPayload[key] = value.map(v =>
                            typeof v === "object" && v !== null ? String(v.value) : v
                        );
                    } else {
                        filteredPayload[key] = value;
                    }
                }
            });
            const rangeDays = Number(window.runtimeConfig.VITE_APP_DEFAULT_RANGE_DAYS) || 180;
            const DEFAULT_END = new Date().toISOString();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - rangeDays);
            const DEFAULT_START = startDate.toISOString();

            const paginatedQuery = {
                ...filteredPayload,
                page: page,
                size: 50,
                start_time: filteredPayload?.start_time || DEFAULT_START,
                end_time: filteredPayload?.end_time ||DEFAULT_END,
            };

            const response = await axios.post(
                `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
                paginatedQuery,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            dispatch(
                setSearchResults({
                    results: response.data.results || [],
                    total_pages: response.data.total_pages || 1,
                    total_results: response.data.total_results || 0,
                })
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            fetchInProgressRef.current = false;
            scrollLockRef.current = false;
        }
    };

    //  Reset ONLY when payload actually changes (not on mount)
    useEffect(() => {
        const payloadString = JSON.stringify(payload);
        
        // Check if payload actually changed
        if (payloadRef.current !== null && payloadRef.current !== payloadString) {
            console.log(" Payload changed - Resetting to page 1");
            setSelectedResource(null);
            lastFetchedPageRef.current = null;
            fetchInProgressRef.current = false;
            isFirstMount.current = true;
            scrollLockRef.current = false;
            isProgrammaticScroll.current = false;
            scrollTriggeredFetchRef.current = false;
            fetchPageData();
            // Reset to page 1 and fetch
            if (!isFirstMount.current) { 
                fetchPageData();
            } else {
                isFirstMount.current = false; // Set to false after the first check
            }
            dispatch(setPage(1));
            setTimeout(() => fetchPageData(1), 0);
        } else if (payloadRef.current === null && payload && Object.keys(payload).length > 0) {
            // First time payload is set - fetch current page (don't reset)
            console.log(" Initial payload set - fetching current page:", currentPage || 1);
            fetchPageData(currentPage || 1);
        }
        
        payloadRef.current = payloadString;
    }, [JSON.stringify(payload), dispatch]);

    // Fetch when currentPage changes
    useEffect(() => {
        if (scrollTriggeredFetchRef.current) {
            console.log("Scroll triggered fetch - skipping useEffect");
            scrollTriggeredFetchRef.current = false;
            return;
        }
        if (payload && currentPage && currentPage !== lastFetchedPageRef.current) {
            console.log(" CurrentPage changed externally to:", currentPage);
            fetchPageData(currentPage);
        }
    }, [currentPage, payload]);

    // Update UI when searchResults changes
    useEffect(() => {
        if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
            // Priority: Check if Redux (table click) has set a resource
            if (selectedFromRedux && searchResults.some(r => r.row_id === selectedFromRedux.row_id)) {
                setSelectedResource(selectedFromRedux);
            } else {
                // Default: First item in the current result set
                setSelectedResource(searchResults[0]);
            }
        } else if (searchResults && Array.isArray(searchResults) && searchResults.length === 0) {
            setSelectedResource(null);
        }
    }, [searchResults, selectedFromRedux]);

    // ♾️ Infinite Scroll Handler (Top & Bottom touch only)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleInfiniteScroll = throttle(() => {
            if (fetchInProgressRef.current || isProgrammaticScroll.current || scrollLockRef.current) {
                console.log(" Scroll handler paused", { 
                    fetchInProgress: fetchInProgressRef.current, 
                    isProgrammatic: isProgrammaticScroll.current, 
                    scrollLock: scrollLockRef.current 
                });
                return;
            }

            const { scrollTop, scrollHeight, clientHeight } = container;
            const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
            const isAtTop = scrollTop < 10;

            console.log(" Scroll position:", { 
                scrollTop, 
                isAtTop, 
                isAtBottom, 
                currentPage, 
                totalPages,
                canGoUp: currentPage > 1,
                canGoDown: currentPage < totalPages
            });

            if (isAtBottom && currentPage < totalPages) {
                console.log(" Bottom reached — fetching next page", currentPage + 1);
                scrollDirectionRef.current = "down";
                scrollTriggeredFetchRef.current = true;
                scrollLockRef.current = true;
                const nextPage = currentPage + 1;
                dispatch(setPage(nextPage));
                fetchPageData(nextPage);
            } else if (isAtTop && currentPage > 1) {
                console.log("Top reached — fetching previous page", currentPage - 1);
                scrollDirectionRef.current = "up";
                scrollTriggeredFetchRef.current = true;
                scrollLockRef.current = true;
                const prevPage = currentPage - 1;
                dispatch(setPage(prevPage));
                fetchPageData(prevPage);
            }
        }, 200);

        container.addEventListener("scroll", handleInfiniteScroll);
        return () => {
            handleInfiniteScroll.cancel();
            container.removeEventListener("scroll", handleInfiniteScroll);
        };
    }, [currentPage, totalPages, dispatch]);

    // 🪄 Scroll reposition after page change
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !searchResults?.length) return;

        if (isFirstMount.current) {
            // First load: scroll near top with some space
            setTimeout(() => {
                const offset = 20;
                const scrollTop = Math.max(offset, 0);
                container.scrollTo({ top: scrollTop, behavior: "auto" });
                isFirstMount.current = false;
            }, 100);
            return;
        }

        // Programmatic reposition after top/bottom fetch
        if (scrollDirectionRef.current === "up" && currentPage > 1) {
            setTimeout(() => {
                isProgrammaticScroll.current = true;
                const newScrollTop = container.scrollHeight * 0.4;
                container.scrollTo({ top: newScrollTop, behavior: "smooth" });
                setTimeout(() => {
                    isProgrammaticScroll.current = false;
                }, 800);
                scrollDirectionRef.current = null;
            }, 100);
        } else if (scrollDirectionRef.current === "down" && currentPage < totalPages) {
            setTimeout(() => {
                isProgrammaticScroll.current = true;
                const newScrollTop = container.scrollHeight * 0.6 - container.clientHeight;
                container.scrollTo({ top: newScrollTop, behavior: "smooth" });
                setTimeout(() => {
                    isProgrammaticScroll.current = false;
                }, 800);
                scrollDirectionRef.current = null;
            }, 100);
        }
    }, [searchResults, currentPage, totalPages]);

    const handleResourceClick = (item) => {
        console.log("Selected Resource:", item);
        setSelectedResource(item);
    };

    const isQueryEmpty = (payload) => {
        if (!payload || typeof payload !== 'object') return true;

        const ignoredKeys = ['page', 'size'];

        return Object.entries(payload)
            .filter(([key]) => !ignoredKeys.includes(key))
            .every(([, value]) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0));
    };

    // Don't render component until real query exists
    if (isQueryEmpty(payload)) {
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
                {/* Please enter a search criteria to view resources */}
            </div>
        );
    }

    return (
        <ResourceDetails
            isListView={true}
            resources={searchResults}
            selectedResource={selectedResource}
            loading={loading}
            hasMore={currentPage < totalPages}
            handleResourceClick={handleResourceClick}
            sidebarRef={containerRef}
            showCommentPopup={false}
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            title="Resources Insights"
            chipsHeight={chipsHeight1}
        />
    );
}

export default ScrollCriteriaViewer;


// import { useEffect, useState, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import Cookies from 'js-cookie';
// import axios from 'axios';
// import throttle from 'lodash.throttle';
// import { setPage, setSearchResults } from '../../../../Redux/Action/criteriaAction';
// import ResourceDetails from '../../Analyze/ResourceDetails';

// const ScrollCriteriaViewer = () => {
//     const dispatch = useDispatch();
//     const token = Cookies.get('accessToken');
//     const [selectedResource, setSelectedResource] = useState(null);
//     const { currentPage, totalPages, searchResults } = useSelector((state) => state.search || {});
//     const payload = useSelector((state) => state.criteriaKeywords?.queryPayload || '');
//     const [loading, setLoading] = useState(false);
//     const [showPopup, setShowPopup] = useState(false);
//     const payloadRef = useRef(null);

//     // Infinite Scroll Refs
//     const containerRef = useRef(null);
//     const scrollDirectionRef = useRef(null);
//     const isFirstMount = useRef(true);
//     const lastFetchedPageRef = useRef(null);
//     const fetchInProgressRef = useRef(false);
//     const scrollTriggeredFetchRef = useRef(false);
//     const scrollLockRef = useRef(false);
//     const isProgrammaticScroll = useRef(false);

//     console.log("SearchResults:", searchResults, "Current Page:", currentPage);

//     // 📡 Fetch Data Function
//     const fetchPageData = async (page) => {
//         if (!payload || fetchInProgressRef.current || lastFetchedPageRef.current === page) {
//             console.log("⚠️ Skipping fetch - already in progress or same page");
//             return;
//         }

//         console.log("📥 Fetching page:", page);
//         fetchInProgressRef.current = true;
//         lastFetchedPageRef.current = page;
//         setLoading(true);

//         try {
//             const isValid = (v) =>
//                 Array.isArray(v) ? v.length > 0 :
//                     typeof v === 'string' ? v.trim() !== '' :
//                         v !== null && v !== undefined;

//             const filteredPayload = {};
//             Object.entries(payload).forEach(([key, value]) => {
//                 if (isValid(value)) {
//                     if (key === "targets" && Array.isArray(value)) {
//                         filteredPayload[key] = value.map(v =>
//                             typeof v === "object" && v !== null ? String(v.value) : v
//                         );
//                     } else {
//                         filteredPayload[key] = value;
//                     }
//                 }
//             });

//             const paginatedQuery = {
//                 ...filteredPayload,
//                 page: page,
//                 size: 50,
//             };

//             const response = await axios.post(
//                 `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
//                 paginatedQuery,
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${token}`,
//                     }
//                 }
//             );

//             dispatch(
//                 setSearchResults({
//                     results: response.data.results || [],
//                     total_pages: response.data.total_pages || 1,
//                     total_results: response.data.total_results || 0,
//                 })
//             );
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//             fetchInProgressRef.current = false;
//             scrollLockRef.current = false;
//         }
//     };

//     // 🧼 Reset ONLY when payload actually changes (not on mount)
//     useEffect(() => {
//         const payloadString = JSON.stringify(payload);
        
//         // Check if payload actually changed
//         if (payloadRef.current !== null && payloadRef.current !== payloadString) {
//             console.log("🧽 Payload changed - Resetting to page 1");
//             setSelectedResource(null);
//             lastFetchedPageRef.current = null;
//             fetchInProgressRef.current = false;
//             isFirstMount.current = true;
//             scrollLockRef.current = false;
//             isProgrammaticScroll.current = false;
//             scrollTriggeredFetchRef.current = false;
            
//             // Reset to page 1 and fetch
//             dispatch(setPage(1));
//             setTimeout(() => fetchPageData(1), 0);
//         } else if (payloadRef.current === null && payload && Object.keys(payload).length > 0) {
//             // First time payload is set - fetch current page (don't reset)
//             console.log("🆕 Initial payload set - fetching current page:", currentPage || 1);
//             fetchPageData(currentPage || 1);
//         }
        
//         payloadRef.current = payloadString;
//     }, [JSON.stringify(payload), dispatch]);

//     // 🔁 Fetch when currentPage changes
//     useEffect(() => {
//         if (scrollTriggeredFetchRef.current) {
//             console.log("✅ Scroll triggered fetch - skipping useEffect");
//             scrollTriggeredFetchRef.current = false;
//             return;
//         }
//         if (payload && currentPage && currentPage !== lastFetchedPageRef.current) {
//             console.log("🔄 CurrentPage changed externally to:", currentPage);
//             fetchPageData(currentPage);
//         }
//     }, [currentPage, payload]);

//     // 🧠 Update UI when searchResults changes
//     useEffect(() => {
//         if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
//             setSelectedResource(searchResults[0]);
//         } else if (searchResults && Array.isArray(searchResults) && searchResults.length === 0) {
//             setSelectedResource(null);
//         }
//     }, [searchResults]);

//     // ♾️ Infinite Scroll Handler (Top & Bottom touch only)
//     useEffect(() => {
//         const container = containerRef.current;
//         if (!container) return;

//         const handleInfiniteScroll = throttle(() => {
//             if (fetchInProgressRef.current || isProgrammaticScroll.current || scrollLockRef.current) {
//                 console.log("⏸️ Scroll handler paused", { 
//                     fetchInProgress: fetchInProgressRef.current, 
//                     isProgrammatic: isProgrammaticScroll.current, 
//                     scrollLock: scrollLockRef.current 
//                 });
//                 return;
//             }

//             const { scrollTop, scrollHeight, clientHeight } = container;
//             const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
//             const isAtTop = scrollTop < 10;

//             console.log("📍 Scroll position:", { 
//                 scrollTop, 
//                 isAtTop, 
//                 isAtBottom, 
//                 currentPage, 
//                 totalPages,
//                 canGoUp: currentPage > 1,
//                 canGoDown: currentPage < totalPages
//             });

//             if (isAtBottom && currentPage < totalPages) {
//                 console.log("⬇️ Bottom reached — fetching next page", currentPage + 1);
//                 scrollDirectionRef.current = "down";
//                 scrollTriggeredFetchRef.current = true;
//                 scrollLockRef.current = true;
//                 const nextPage = currentPage + 1;
//                 dispatch(setPage(nextPage));
//                 fetchPageData(nextPage);
//             } else if (isAtTop && currentPage > 1) {
//                 console.log("⬆️ Top reached — fetching previous page", currentPage - 1);
//                 scrollDirectionRef.current = "up";
//                 scrollTriggeredFetchRef.current = true;
//                 scrollLockRef.current = true;
//                 const prevPage = currentPage - 1;
//                 dispatch(setPage(prevPage));
//                 fetchPageData(prevPage);
//             }
//         }, 200);

//         container.addEventListener("scroll", handleInfiniteScroll);
//         return () => {
//             handleInfiniteScroll.cancel();
//             container.removeEventListener("scroll", handleInfiniteScroll);
//         };
//     }, [currentPage, totalPages, dispatch]);

//     // 🪄 Scroll reposition after page change
//     useEffect(() => {
//         const container = containerRef.current;
//         if (!container || !searchResults?.length) return;

//       if (isFirstMount.current) {
//     // First load: scroll near top with some space
//     setTimeout(() => {
//         const offset = 50; // Adjust this value to control the space from the top
//         const scrollTop = Math.max(offset, 0);
//         container.scrollTo({ top: scrollTop, behavior: "auto" });
//         isFirstMount.current = false;
//     }, 100);
//     return;
// }


//         // Programmatic reposition after top/bottom fetch
//         if (scrollDirectionRef.current === "up" && currentPage > 1) {
//             setTimeout(() => {
//                 isProgrammaticScroll.current = true;
//                 const newScrollTop = container.scrollHeight * 0.4;
//                 container.scrollTo({ top: newScrollTop, behavior: "smooth" });
//                 setTimeout(() => {
//                     isProgrammaticScroll.current = false;
//                 }, 800);
//                 scrollDirectionRef.current = null;
//             }, 100);
//         } else if (scrollDirectionRef.current === "down" && currentPage < totalPages) {
//             setTimeout(() => {
//                 isProgrammaticScroll.current = true;
//                 const newScrollTop = container.scrollHeight * 0.6 - container.clientHeight;
//                 container.scrollTo({ top: newScrollTop, behavior: "smooth" });
//                 setTimeout(() => {
//                     isProgrammaticScroll.current = false;
//                 }, 800);
//                 scrollDirectionRef.current = null;
//             }, 100);
//         }
//     }, [searchResults, currentPage, totalPages]);

//     const handleResourceClick = (item) => {
//         console.log("Selected Resource:", item);
//         setSelectedResource(item);
//     };

//     return (
//         <ResourceDetails
//             isListView={true}
//             resources={searchResults}
//             selectedResource={selectedResource}
//             loading={loading}
//             hasMore={currentPage < totalPages}
//             handleResourceClick={handleResourceClick}
//             sidebarRef={containerRef}
//             showCommentPopup={false}
//             showPopup={showPopup}
//             setShowPopup={setShowPopup}
//             title="Resources Insights"
//             // leftClass="leftSearchContent"
//             // rightClass="rightSearchContent"
//         />
//     );
// }

// export default ScrollCriteriaViewer;

