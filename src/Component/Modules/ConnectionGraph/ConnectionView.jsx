import React, { useRef, useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { zoom, zoomIdentity } from 'd3-zoom';
import { drag } from 'd3-drag';
import 'd3-transition';
import styles from './ConnectionView.module.css';
import { useSelector, useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import axios from 'axios';
import Loader from '../Layout/loader';
import { MdFullscreenExit, MdFullscreen } from "react-icons/md";
import * as d3 from 'd3';
import { Tooltip, Menu, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import { saveCaseFilterPayload } from '../../../Redux/Action/caseAction';
import { setKeywords, setPage } from '../../../Redux/Action/criteriaAction';
import { clearFilterData } from '../../../Redux/Action/filterAction';
import { useLocation } from "react-router-dom";

function transformEsResponse(apiResponse) {
    if (!apiResponse?.hashtags?.buckets) {
        console.error("Invalid OSINT API response structure received.", apiResponse);
        return [];
    }
    return apiResponse.hashtags.buckets.map(h => ({
        hashtag: h.key,
        profiles: h.profiles.buckets.map(p => ({
            id: p.key,
            platform: p.platforms.buckets[0]?.key || 'Unknown'
        }))
    }));
}

function buildGraph(data) {
    const nodes = {};
    const links = [];
    const connectedData = data.filter(item => item.profiles.length > 1);

    connectedData.forEach(({ hashtag, profiles }) => {
        const hashtagId = `hashtag-${hashtag}`;
        if (!nodes[hashtagId]) {
            nodes[hashtagId] = { id: hashtagId, label: hashtag, type: "hashtag" };
        }

        profiles.forEach(p => {
            const profileId = `profile-${p.id}`;
            if (!nodes[profileId]) {
                nodes[profileId] = { id: profileId, label: p.id, type: "profile", platform: p.platform };
            }
            links.push({
                source: hashtagId,
                target: profileId,
                platform: p.platform
            });
        });
    });

    return { nodes: Object.values(nodes), links };
}

function transformIpdrResponse(apiResponse) {
    if (!apiResponse?.by_dest_ip?.buckets) {
        console.error("Invalid IPDR API response structure received.", apiResponse);
        return [];
    }

    return apiResponse.by_dest_ip.buckets.map(subscriberBucket => ({
        subscriber: subscriberBucket.key,
        ips: subscriberBucket.subscribers.buckets.map(ipBucket => ({
            ip: ipBucket.key,
            count: ipBucket.doc_count
        }))
    }));
}

function buildIpdrGraph(data) {
    const nodes = {};
    const links = [];

    const connectedData = data.filter(item => item.ips.length > 1);

    connectedData.forEach(({ subscriber, ips }) => {
        const subscriberId = `subscriber-${subscriber}`;
        if (!nodes[subscriberId]) {
            nodes[subscriberId] = { id: subscriberId, label: subscriber, type: "subscriber" };
        }

        ips.forEach(i => {
            const ipId = `ip-${i.ip}`;
            if (!nodes[ipId]) {
                nodes[ipId] = { id: ipId, label: i.ip, type: "ip", count: i.count };
            }
            links.push({
                source: subscriberId,
                target: ipId,
                type: "ipdr",
                count: i.count
            });
        });
    });

    return { nodes: Object.values(nodes), links };
}

const ConnectionView = ({ chipsHeight }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const fullscreenContainerRef = useRef(null);
    const containerRef = useRef();
    const zoomRef = useRef();
    const tooltipRef = useRef(null);
    const simulationRef = useRef(null);
    const fullscreenStateRef = useRef(false); // Track fullscreen state

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
    const criteria = useSelector((state) => state.criteriaKeywords);
    const caseData = useSelector((state) => state.caseData.caseData);
    const caseId = caseData?.id;
    const token = Cookies.get("accessToken");
    const [selected, setSelected] = useState("");
    const [maintainFullscreen, setMaintainFullscreen] = useState(false);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const handleChange = (e) => {
        // Save fullscreen state before changing
        fullscreenStateRef.current = !!document.fullscreenElement;
        if (fullscreenStateRef.current) {
            setMaintainFullscreen(true);
        }

        setIsLoading(true);
        setSelected(e.target.value);
    };

    const toggleFullscreen = () => {
        const element = document.getElementById("connection-container");
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen();
        }
    };

    // Handle context menu for nodes
    const handleNodeContextMenu = (event, node) => {
        event.preventDefault();
        setSelectedNode(node);
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
                : null
        );
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
        setSelectedNode(null);
    };

    // Add to Search Criteria functionality
    const handleAddToSearchCriteria = () => {
        if (!selectedNode) {
            toast.error("No node selected.");
            handleCloseContextMenu();
            return;
        }

        const valueToSave = selectedNode.label;

        // Determine the field based on node type
        let field = '';
        if (selectedNode.type === 'hashtag') {
            field = 'socialmedia_hashtags';
        } else if (selectedNode.type === 'ip') {
            field = 'serverip';
        } else if (selectedNode.type === 'profile') {
            field = 'socialmedia_from_screenname';
        } else if (selectedNode.type === 'subscriber') {
            field = 'mobilenumber';
        } else {
            toast.error("This node type cannot be added to search criteria.");
            handleCloseContextMenu();
            return;
        }

        // CRITICAL: Store fullscreen state BEFORE any state changes
        fullscreenStateRef.current = !!document.fullscreenElement;

        // Set maintain fullscreen flag BEFORE dispatching
        if (fullscreenStateRef.current) {
            setMaintainFullscreen(true);
            console.log("🔒 Fullscreen mode saved, will restore after reload");
        }

        // Update Redux state based on current route
        if (location.pathname.startsWith("/search")) {
            const updatedQueryPayload = {
                ...criteria.queryPayload,
                [field]: [...(criteria.queryPayload[field] || []), valueToSave]
            };

            dispatch(
                setKeywords({
                    keyword: criteria.keywords,
                    queryPayload: updatedQueryPayload,
                })
            );
        } else {
            const updatedCaseFilter = {
                ...caseFilter,
                [field]: [...(caseFilter[field] || []), valueToSave]
            };
            dispatch(saveCaseFilterPayload(updatedCaseFilter));
        }

        toast.success(`${selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} added to Search Criteria!`);
        handleCloseContextMenu();
    };

    // ✅ 1. Fullscreen change handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isCurrentlyFullscreen);
            fullscreenStateRef.current = isCurrentlyFullscreen;

            // Only reset maintain flag if user manually exits (not during transitions)
            if (!isCurrentlyFullscreen && !maintainFullscreen) {
                setMaintainFullscreen(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, [maintainFullscreen]);

    // ✅ 2. Re-enter fullscreen after data loads
    useEffect(() => {
        if (maintainFullscreen && !isLoading && graphData.nodes.length > 0) {
            const timer = setTimeout(() => {
                const element = document.getElementById("connection-container");
                if (element && !document.fullscreenElement) {
                    console.log("🔄 Restoring fullscreen mode...");
                    element.requestFullscreen()
                        .then(() => {
                            console.log("✅ Fullscreen restored successfully");
                            setMaintainFullscreen(false);
                            fullscreenStateRef.current = true;
                        })
                        .catch(err => {
                            console.error("❌ Failed to restore fullscreen:", err);
                            setMaintainFullscreen(false);
                            fullscreenStateRef.current = false;
                        });
                } else {
                    setMaintainFullscreen(false);
                }
            }, 350); // Slightly longer delay for stability

            return () => clearTimeout(timer);
        }
    }, [isLoading, graphData.nodes.length, maintainFullscreen]);

    // ✅ 3. Cleanup effect
    useEffect(() => {
        return () => {
            dispatch(clearFilterData());
            dispatch(setPage(1));
        };
    }, [dispatch]);

    // ✅ 4. Main data fetching effect
    useEffect(() => {
        if (!caseId) {
            setIsLoading(false);
            setGraphData({ nodes: [], links: [] });
            return;
        }

        if (!selected) {
            setIsLoading(false);
            setGraphData({ nodes: [], links: [] });
            if (containerRef.current) {
                d3.select(containerRef.current).selectAll('svg').remove();
            }
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            const isFilterActive = caseFilter && (
                (caseFilter.keyword?.length > 0) ||
                (caseFilter.file_type?.length > 0) ||
                (caseFilter.sentiment?.length > 0) ||
                caseFilter.target?.length > 0 ||
                caseFilter.start_time ||
                caseFilter.end_time ||
                (caseFilter.unified_type?.length > 0) ||
                (caseFilter.eventtypestring?.length > 0) ||
                (caseFilter.mobilenumber?.length > 0) ||
                (caseFilter.socialmedia_hashtags?.length > 0) ||
                (caseFilter.socialmedia_from_id?.length > 0) ||
                (caseFilter.socialmedia_from_screenname?.length > 0) ||
                (caseFilter.serverip?.length > 0) ||
                (caseFilter.latitude) ||
                (caseFilter.longitude) ||
                (caseFilter.loc) ||
                (caseFilter.emails) ||
                (caseFilter.event) ||
                (caseFilter.date) ||
                (caseFilter.person) ||
                (caseFilter.org) ||
                (caseFilter.language)
            );

            let payload;
            if (isFilterActive) {
                console.log(`Fetching graph data WITH filters for: ${selected}`);
                payload = {
                    case_id: [String(caseId)],
                    ...(caseFilter.keyword?.length > 0 && { keyword: caseFilter.keyword }),
                    ...(caseFilter.file_type?.length > 0 && { file_type: caseFilter.file_type }),
                    ...(caseFilter.sentiment?.length > 0 && { sentiments: caseFilter.sentiment }),
                    ...(caseFilter.target?.length > 0 && { targets: caseFilter.target.map(t => String(t.value)) }),
                    ...(caseFilter.start_time && { start_time: caseFilter.start_time }),
                    ...(caseFilter.end_time && { end_time: caseFilter.end_time }),
                    ...(caseFilter.unified_type?.length > 0 && { unified_type: caseFilter.unified_type }),
                    ...(caseFilter.eventtypestring?.length > 0 && { eventtypestring: caseFilter.eventtypestring }),
                    ...(caseFilter.mobilenumber?.length > 0 && { mobilenumber: caseFilter.mobilenumber }),
                    ...(caseFilter.socialmedia_hashtags?.length > 0 && { socialmedia_hashtags: caseFilter.socialmedia_hashtags }),
                    ...(caseFilter.socialmedia_from_id?.length > 0 && { socialmedia_from_id: caseFilter.socialmedia_from_id }),
                    ...(caseFilter.socialmedia_from_screenname?.length > 0 && { socialmedia_from_screenname: caseFilter.socialmedia_from_screenname }),
                    ...(caseFilter.serverip?.length > 0 && { serverip: caseFilter.serverip }),
                    ...(caseFilter.latitude && { latitude: caseFilter.latitude }),
                    ...(caseFilter.longitude && { longitude: caseFilter.longitude }),
                    ...(caseFilter.loc && { loc: caseFilter.loc }),
                    ...(caseFilter.emails && { emails: caseFilter.emails }),
                    ...(caseFilter.event && { event: caseFilter.event }),
                    ...(caseFilter.date && { date: caseFilter.date }),
                    ...(caseFilter.person && { person: caseFilter.person }),
                    ...(caseFilter.org && { org: caseFilter.org }),
                    ...(caseFilter.language && { language: caseFilter.language })
                };
            } else {
                console.log(`Fetching graph data WITHOUT filters (default) for: ${selected}`);
                payload = {
                    case_id: [String(caseId)],
                };
            }

            let apiUrl;
            let transformFunction;
            let buildFunction;

            if (selected === 'hashtags') {
                apiUrl = `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/graph`;
                transformFunction = transformEsResponse;
                buildFunction = buildGraph;
            } else if (selected === 'ip') {
                apiUrl = `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/ipdr-graph`;
                transformFunction = transformIpdrResponse;
                buildFunction = buildIpdrGraph;
            } else {
                setIsLoading(false);
                setGraphData({ nodes: [], links: [] });
                return;
            }

            try {
                const response = await axios.post(
                    apiUrl,
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                const rawData = response.data;
                const transformedData = transformFunction(rawData);
                const finalGraphData = buildFunction(transformedData);

                setGraphData(finalGraphData);

            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch connection data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [caseId, caseFilter, token, selected]);

    // ✅ 5. Graph rendering effect
    useEffect(() => {
        if (isLoading || error || !graphData.nodes?.length) {
            if (containerRef.current) {
                d3.select(containerRef.current).selectAll('svg').remove();
            }
            return;
        }

        const container = select(containerRef.current);
        select(containerRef.current).selectAll('svg').remove();

        const bbox = container.node().getBoundingClientRect();
        const width = bbox.width || 800;
        const height = bbox.height || 520;

        const svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const g = svg.append('g');

        const tooltip = select('body').append('div')
            .attr('class', 'absolute z-10 p-3 bg-gray-800 text-white rounded-lg shadow-lg opacity-0 pointer-events-none')
            .style('max-width', '300px');
        tooltipRef.current = tooltip;

        // ✅ IMPROVED: Better simulation with stable node positions
        const simulation = forceSimulation(graphData.nodes)
            .force('link', forceLink(graphData.links).id(d => d.id).distance(130))
            .force('charge', forceManyBody().strength(-400)) // Increased strength for better stability
            .force('center', forceCenter(width / 2, height / 2))
            .alphaDecay(0.02) // Slower decay for more stability
            .alphaMin(0.001)
            .velocityDecay(0.4); // Added velocity decay for smoother movement

        simulationRef.current = simulation;

        const linkGroup = g.append("g")
            .selectAll("g")
            .data(graphData.links)
            .join("g");

        const link = linkGroup.append("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1.5);

        const node = g.append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll('g')
            .data(graphData.nodes)
            .join('g')
            .call(drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.1).restart();
                    graphData.nodes.forEach(node => {
                        if (node !== d) {
                            node.fx = node.x;
                            node.fy = node.y;
                        }
                    });
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    graphData.nodes.forEach(node => {
                        node.fx = node.x;
                        node.fy = node.y;
                    });
                })
            );

        node.append('circle')
            .attr('r', d => (d.type === 'hashtag' || d.type === 'subscriber' ? 20 : 10))
            .attr('fill', d => (d.type === 'hashtag' || d.type === 'subscriber') ? '#bf22d7' : '#6366f1')
            .attr('class', 'cursor-pointer')
            .style('cursor', 'grab')
            .on('click', function (event, d) {
                event.preventDefault();
                handleNodeContextMenu(event, d);
            })
            .on('mouseover', function (event, d) {
                select(this).style('cursor', 'grab');
            })
            .on('mousedown', function (event, d) {
                select(this).style('cursor', 'grabbing');
            })
            .on('mouseup', function (event, d) {
                select(this).style('cursor', 'grab');
            });

        node.append('text')
            .text(d => d.label)
            .attr('x', 0)
            .attr('y', d => (d.type === 'hashtag' || d.type === 'subscriber' ? 32 : 20))
            .attr('text-anchor', 'middle')
            .attr('pointer-events', 'none')
            .attr('style', d =>
                `font-size: ${d.type === 'hashtag' || d.type === 'subscriber' ? '14px' : '11px'};
             fill: #FFFFFF !important; 
             font-weight: normal;
             font-family: Arial, Helvetica, sans-serif;
             stroke: none; 
             stroke-width: 0.2px;`
            );

        node.on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('opacity', .9);
            let htmlContent;

            if (d.type === 'profile') htmlContent = `<b>Profile:</b> ${d.label}<br/><b>Platform:</b> ${d.platform}`;
            else if (d.type === 'hashtag') htmlContent = `<b>Hashtag:</b> ${d.label}`;
            else if (d.type === 'subscriber') htmlContent = `<b>Mobile Number:</b> ${d.label}`;
            else if (d.type === 'ip') htmlContent = `<b>IP Address:</b> ${d.label}`;
            else htmlContent = `<b>Node:</b> ${d.label}`;

            tooltip.html(htmlContent);
        })
            .on('mousemove', (event) => {
                tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                tooltip.transition().duration(500).style('opacity', 0);
            });

        function ticked() {
            link
                .attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);

            node.attr('transform', (d) => `translate(${d.x},${d.y})`);
        }

        simulation.on('tick', ticked);

        let hasAutoFitted = false;
        simulation.on('end', () => {
            if (!hasAutoFitted) {
                handleReset();
                hasAutoFitted = true;
            }
            graphData.nodes.forEach(node => {
                node.fx = node.x;
                node.fy = node.y;
            });
        });

        const zoomHandler = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        zoomRef.current = zoomHandler;
        svg.call(zoomHandler);

        return () => {
            tooltip.remove();
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, [graphData, isLoading, error]);

    const handleZoomIn = () => {
        const svg = select(containerRef.current).select('svg');
        if (!svg.empty() && zoomRef.current) {
            svg.transition().duration(250).call(zoomRef.current.scaleBy, 1.2);
        }
    };

    const handleZoomOut = () => {
        const svg = select(containerRef.current).select('svg');
        if (!svg.empty() && zoomRef.current) {
            svg.transition().duration(250).call(zoomRef.current.scaleBy, 0.8);
        }
    };

    const handleReset = () => {
        const svg = select(containerRef.current).select('svg');
        if (svg.empty() || !zoomRef.current || !graphData.nodes.length) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        graphData.nodes.forEach(d => {
            if (d.x && d.y) {
                minX = Math.min(minX, d.x);
                minY = Math.min(minY, d.y);
                maxX = Math.max(maxX, d.x);
                maxY = Math.max(maxY, d.y);
            }
        });

        const containerBbox = containerRef.current.getBoundingClientRect();
        const width = containerBbox.width || 800;
        const height = containerBbox.height || 520;

        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;

        if (graphWidth === 0 || graphHeight === 0) return;

        const centerX = minX + graphWidth / 2;
        const centerY = minY + graphHeight / 2;

        const scaleX = width / graphWidth;
        const scaleY = height / graphHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9;

        const newScale = Math.min(4, Math.max(0.1, scale));

        const transform = zoomIdentity
            .translate(width / 2, height / 2)
            .scale(newScale)
            .translate(-centerX, -centerY);

        svg.transition().duration(750).call(zoomRef.current.transform, transform);
    };

    const renderEmptyMessage = () => {
        let message;
        if (selected === 'ip') {
            message = "No IP connections found for the current case";
        } else if (selected === 'hashtags') {
            message = "No hashtag connections found for this case";
        } else {
            message = "Please select a connection field (OSINT or IPDR) to view the graph";
        }
        return (
            <div className={styles.containerView} style={{ height: `calc(75vh - ${chipsHeight || 0}px)` }}>
                <div ref={containerRef} className={styles.connectionview} style={{ height: `calc(75vh - ${chipsHeight || 0}px)` }} />
                {renderControls(true)}
                <div className={styles.centeredMessage} style={{ color: '#94A3B8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                    {message}
                </div>
            </div>
        );
    }

    const renderControls = (isGraphEmpty = false) => {
        const tooltipPopperProps = {
            container: fullscreenContainerRef.current,
            sx: {
                "& .MuiTooltip-tooltip": {
                    backgroundColor: "#0e2c46",
                    border: "1px solid #3b7fdaff",
                    fontSize: "11px",
                    borderRadius: "4px",
                },
            },
        };

        return (
            <div style={{ height: '100%', paddingTop: "20px", paddingBottom: "50px", display: 'flex', flexDirection: "column", justifyContent: 'space-between', zIndex: 20 }}>
                <div style={{ margin: "5px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#fff" }}>
                        Connection Field:
                    </label>

                    <select
                        value={selected}
                        onChange={handleChange}
                        style={{
                            width: "100%", padding: "8px", border: "1px solid #0073CF",
                            borderRadius: "6px", fontSize: "14px", backgroundColor: "#080E17",
                            color: "#fff", cursor: "pointer",
                        }}
                    >
                        <option value="" disabled={!isGraphEmpty}>
                            -- Select Field --
                        </option>
                        <option disabled style={{ fontWeight: "normal", color: "#fffff" }}>
                            OSINT
                        </option>
                        <option value="hashtags">Connected Users via Hashtags</option>
                        <option disabled style={{ fontWeight: "normal", color: "#fffff" }}>
                            IPDR
                        </option>
                        <option value="ip">Connected Users via IP</option>
                    </select>
                </div>

                {(!isGraphEmpty && !isLoading) && (
                    <div
                        className="ZoomControls"
                        style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '10px', marginRight: '10px', alignItems: 'center' }}
                    >
                        <Tooltip title="Zoom In" placement="top" slotProps={{ popper: tooltipPopperProps }}><button className={styles.customButton} onClick={handleZoomIn} title="Zoom In">+</button></Tooltip>
                        <Tooltip title="Zoom Out" placement="top" slotProps={{ popper: tooltipPopperProps }}><button className={styles.customButton} onClick={handleZoomOut} title="Zoom Out">-</button></Tooltip>
                        <Tooltip title="Reset View" placement="top" slotProps={{ popper: tooltipPopperProps }}><button className={styles.customButton} onClick={handleReset} title="Reset View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" /><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" /></svg>
                        </button></Tooltip>
                        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} placement="top" slotProps={{ popper: tooltipPopperProps }}><button className={styles.customButton} onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                            {isFullscreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />}
                        </button></Tooltip>
                    </div>
                )}
                {(isGraphEmpty || isLoading) && <div style={{ minHeight: '150px' }}></div>}
            </div>
        );
    }

    if (isLoading) return <Loader />;

    if (graphData.nodes.length === 0 || !selected) {
        return renderEmptyMessage();
    }

    if (error) return <div className={styles.centeredMessage}>Error: {error}</div>;

    return (
        <div
            ref={fullscreenContainerRef}
            className={isFullscreen ? styles.connectionSearch : styles.containerView}
            style={{ height: `calc(75vh - ${chipsHeight || 0}px)` }}
            id="connection-container"
        >
            <div
                ref={containerRef}
                className={styles.connectionview}
                style={{ height: `calc(${isFullscreen ? '103vh' : '75vh'} - ${chipsHeight || 0}px)` }}
            />
            {renderControls()}
            {/* Context Menu for Nodes */}
            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                    sx: {
                        pb: 0
                    }
                }}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
                container={fullscreenContainerRef.current}
                PaperProps={{
                    sx: {
                        backgroundColor: "#0E2C46",
                        borderRadius: "8px",
                        border: '1px solid #0073CF',
                        padding: '-3px',
                        position: 'fixed',
                        zIndex: 9999
                    }
                }}
            >
                {selectedNode && (
                    <MenuItem onClick={handleAddToSearchCriteria} style={{ paddingTop: '0px' }}>
                        <p style={{ color: '#D9D9D9', alignItems: 'center', margin: '0', padding: '0' }}>
                            Add to Search Criteria
                        </p>
                    </MenuItem>
                )}
            </Menu>
        </div>
    );
};
export default ConnectionView;