import React,{ useState, useEffect } from "react";
import { FaRegHeart, FaRegCommentDots, FaRegBookmark } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa6";
import { PiShareFatBold } from "react-icons/pi";
import { LiaThumbsUpSolid } from "react-icons/lia";
import { LuRepeat2 } from "react-icons/lu";
import { MdRepeat, MdOutlineFileUpload } from "react-icons/md";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { ChatLeftText } from 'react-bootstrap-icons';
import AppButton from "../../Common/Buttton/button"
import AddComment from '../Comment/AddComment';
import YoutubeLogo from '../../Assets/Images/youtube_image.png';
import Instagram from "../../Assets/Images/Instagram.jpg";
import TiktokLogo from "../../Assets/Images/tiktok.png";
import X_logo from "../../Assets/Images/X_logo.jpg";
import Facebook_logo from "../../Assets/Images/Facebook_logo.png";
import rss from "../../Assets/Images/rss.jpg";
import PlaceholderImg from "../../Assets/Images/placeholder-square.png";
import PropTypes from "prop-types";
import DarkWeb from "../../Assets/Images/DarkWeb.png"
import LinkedIn from "../../Assets/Images/LinkedIn.png"
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import { CiSquarePlus } from "react-icons/ci";
import TelegramLogo from "../../Assets/Images/telegram.png";
import Whatsapp from "../../Assets/Images/Whatsapp.png";
import Skype from "../../Assets/Images/skype.jpg";
import BrokenImage from "../../Assets/Images/BrokenImage.png";
import axios from 'axios';
import Cookies from 'js-cookie';
import TelegramView from "../../Common/Template/TelegramView";
import InstagramTemp from "../../Common/Template/instagramTemp";


function getYouTubeVideoId(url) {
    if (!url) return "";
    const regExp =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([^#&?]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : "";
}

// Main Component that can render both list view and detail view
export default function ResourceDetails({
    // Single resource detail view props
    resource,
    showCommentPopup = false,
    showPopup = false,
    setShowPopup = () => { },
    chipsHeight,
    // List view props
    isListView = false,
    resources = [],
    selectedResource = null,
    loading = false,
    handleResourceClick = () => { },
    containerRef = null,
    sidebarRef = null,
    title = "Resources Insights",
    noDataMessage = "",
    leftClass = "left-content",
    rightClass = "right-content",
}) {
const Token = Cookies.get('accessToken');
     console.warn("resaource", resource?.targets);
       const [targetData, setTargetData] = useState(null);

    const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchTargetNames = async () => {
      if (resource?.targets?.length > 0) {
        try {
          const response = await axios.post(
            `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target-names`,
            { target_ids: resource.targets },
            { headers: { Authorization: `Bearer ${Token}` } }
          );
          console.warn("targetRes", response);
          setTargetData(response.data); // Store response in state
        } catch (error) {
          console.error("Error fetching target names:", error);
        }
      }
    };

    fetchTargetNames();
  }, [resource?.targets, Token]);

    const LOGO_MAP = {
        "Rss Feed": rss,
        X: X_logo,
        Facebook: Facebook_logo,
        YouTube: YoutubeLogo,
        Tiktok: TiktokLogo,
        Instagram: Instagram,
        LinkedIn: LinkedIn,
        Telegram: TelegramLogo,
        WhatsApp: Whatsapp,
        Skype: Skype,
        Unknown: BrokenImage
    };

    const DARKWEB_SITES = [
        "Gibiru", "AhmiaFi", "gab.com", "4chan.org", "t.me",
        "bitchute.com", "bitcointalk.org", "crax.pro", "stopscamfraud.com"
    ];

    const getImageSource = (item) => {
        const base = item.socialmedia_from_imageurl || item.socialmedia_media_url;

        if (DARKWEB_SITES.includes(item.unified_record_type))
            return { type: "icon" };

        return {
            type: "image",
            src: base || LOGO_MAP[item.unified_record_type] || PlaceholderImg
        };
    };


    // Function to handle image error
    const handleImageError = (e, item) => {
        e.target.onerror = null;

        if (DARKWEB_SITES.includes(item.unified_record_type))
            return (e.target.src = DarkWeb);

        e.target.src = LOGO_MAP[item.unified_record_type] || PlaceholderImg;
    };


    // Function to render resource items for list view
    const renderResourceItem = (item) => {
        const source = getImageSource(item); // This now returns { type: "image", src } OR { type: "icon" }

        return (
            <button
                key={item.row_id}
                className={`resourceItem ${selectedResource?.row_id === item.row_id ? "active" : ""}`}
                onClick={() => handleResourceClick(item)}
                style={{  border: "none", outline: "none", boxShadow: "none",  padding: 0, font: "inherit", textAlign: "left",
                    appearance: "none", WebkitAppearance: "none", MozAppearance: "none", width: "100%",
                }}
            >
                {source.type === "image" ? (
                    <img
                        src={source.src}
                        onError={(e) => handleImageError(e, item)}
                        alt="pic_not_found"
                        className={`resourceImage ${item.unified_record_type === 'LinkedIn' ? 'linkedin-hover' : ''}`}
                    />
                ) : (
                    <DataThresholdingIcon className="icons" />
                )}

                <div className="resourceDetails">
                    <p className="resourceType">{item.unified_record_type || item.unified_type}</p>
                    <p className="resourceContent">{item.eventtypestring}</p>
                </div>
            </button>
        );
    };


    // Function to render loading indicator
    const renderLoading = () => (
        loading && (
            <div style={{ textAlign: 'center', padding: '10px', color: 'white' }}>
                Loading...
            </div>
        )
    );

    // Function to render no data message
    const renderNoData = () => (
        <p style={{ textAlign: "center", marginTop: "2rem", color: "gray" }}>
            {noDataMessage.split('\n').map((line, index) => (
                <React.Fragment key={line}>
                    {line}
                    {index < noDataMessage.split('\n').length - 1 && <br />}
                </React.Fragment>
            ))}
        </p>
    );
console.log("chips", chipsHeight)
    if (isListView) {
        return (
            <div className="container-r">
                {/* Header Section */}
                <div className="top-header">
                    <div style={{ color: '#d9d9d9', fontSize: '16px', fontWeight: '600' }}>
                        <h5>{title}</h5>
                    </div>
                </div>

                {/* Content Section */}
                <div className="contents">
                    <div className={leftClass} style={{ height: `calc(70vh - ${chipsHeight}px)` }}>
                        <div className="overflow-wrapper">
                            <div
                                className="left-sidebar"
                                ref={containerRef || sidebarRef}
                            >
                                <div className="inner-content" style={{ paddingBottom: '60px' }}>
                                    <div className="sidebar-header">
                                        <div style={{ marginBottom: '10px', color: '#000' }}>

                                        </div>
                                        {renderLoading()}
                                    </div>

                                    {resources && resources.length > 0 ? (
                                        resources.map(renderResourceItem)
                                    ) : (
                                        renderNoData()
                                    )}


                                    <div style={{ textAlign: 'center' }}>
    {renderLoading()}
  </div>
                                     <div style={{ marginTop: '20px', color: '#000' }}>

                                        </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className={rightClass} style={{ height: `calc(70vh - ${chipsHeight}px)` }}>
                        {selectedResource ? (
                            <div className="resourceDetailsContainer">
                                <ResourceDetails
                                    key={selectedResource.row_id}
                                    resource={selectedResource}
                                    showCommentPopup={showCommentPopup}
                                    showPopup={showPopup}
                                    setShowPopup={setShowPopup}
                                    isListView={false}
                                />  
                            </div>
                        ) : (
                            <div className="noDataWrapper">
                                {/* <p>{selectResourceMessage}</p> */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // If not list view, render single resource detail (existing functionality)
    if (!resource) {
        return (
            <div className="noDataWrapper">
                <p>No Data Available</p>
            </div>
        );
    }
    const isVideo = (url = '') => {  return /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url); };
    const isImage = (url = '') => /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('pbs.twimg.com') || url.includes('cdninstagram.com');
    const defaultProfilePic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";


    const formatDate = (timestamp) => {
        if (!timestamp) return "No data";
        const date = new Date(Number(timestamp));
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    // --- Reusable Media Renderer Component ---
    // This component handles the complex logic of parsing and displaying media
    const MediaRenderer = ({ mediaUrlString }) => {
        if (!mediaUrlString) {
            return null;
        }

        let urls = [];
        try {
            if (typeof mediaUrlString === 'string' && mediaUrlString.trim().startsWith('[')) {
                urls = JSON.parse(mediaUrlString);
            } else if (typeof mediaUrlString === 'string') {
                urls = [mediaUrlString];
            } else if (Array.isArray(mediaUrlString)) {
                urls = mediaUrlString;
            }
        } catch (error) {
            console.error("Failed to parse media URL JSON:", error);
            return <p style={{ color: '#aaa', fontSize: '12px' }}>Media format is invalid.</p>;
        }

        if (!Array.isArray(urls) || urls.length === 0) {
            return null;
        }

        return (
            <div className="imageGridWrapper">
                {urls.map((url, index) => {
                    if (typeof url !== 'string' || !url.trim()) return null;
                    const trimmedUrl = url.trim();

                    if (isVideo(trimmedUrl)) {
                        return (
                            <video key={`${trimmedUrl}-${index}`} controls className="postMedia" preload="metadata">
                                <source src={trimmedUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        );
                    } else if (isImage(trimmedUrl)) {
                        return (
                            <img
                                key={`${trimmedUrl}-${index}`}
                                src={trimmedUrl}
                                alt={`Post media ${index + 1}`}
                                className="postMedia"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        );
    };
    const knownTypes = [
        "Rss Feed", "Telegram", "Instagram", "LinkedIn", "X", "Tiktok", "Facebook", 
        "4chan.org", "gab.com", "icq.im", "t.me", "bitchute.com", "VK", "YouTube", 
        "bitcointalk.org", "crax.pro", "stopscamfraud.com", "AhmiaFi", "Gibiru"
    ];




    return (
        <>
            <div classmain="resourceDetailsMain">
                <div className="resourceDetailsContainer">
                    {resource.unified_record_type === "Telegram" && (
                        <TelegramView resource={resource} />
                    )}
                    {/* --- Instagram --- */}
                    {resource.unified_record_type === "Instagram" && (
                        <InstagramTemp resource={resource} MediaRenderer = {MediaRenderer}/>
                    )}

                    {/* --- LinkedIn --- */}
                    {resource.unified_record_type === "LinkedIn" && (
                        <div className="resourceDetailsView marginSides20">
                            <div className="profile-section">
                                <img src={resource.socialmedia_from_imageurl ?? defaultProfilePic} onError={e => { e.target.onerror = null; e.target.src = defaultProfilePic; }} alt="Profile" className="profileImage" />
                                <div className="name-date">
                                    <p className="displayName">{resource.socialmedia_from_displayname ?? 'Unknown User'}</p>
                                    <p className="postDate"> {formatDate(resource.unified_activity_time)}</p>
                                </div>
                            </div>
                            <p className="activityContent">{resource.unified_activity_content ?? 'No content available.'}</p>
                            <MediaRenderer mediaUrlString={resource.socialmedia_media_url} />
                            <div className="insta-icon">
                                <div className="like-commment-share">
                                    <div className="like"><LiaThumbsUpSolid style={{ marginRight: '5px' }} /><span>{resource.socialmedia_activity_like_count ?? 0} Like</span></div>
                                    <div className="comment"><FaRegCommentDots style={{ marginRight: '5px' }} /><span>{resource.socialmedia_activity_comment_count ?? 0} Comment</span></div>
                                    <div className="comment"><span><MdRepeat style={{ marginRight: '5px' }} />Repost</span></div>
                                    <div className="comment"><span><PiShareFatBold style={{ marginRight: '5px' }} />Share</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Twitter/X --- */}
                    {resource.unified_record_type === "X" && (
                        <div className="resourceDetailsView marginSides20">
                            <div className="profile-section">
                                <img src={resource.socialmedia_from_imageurl ?? defaultProfilePic} onError={e => { e.target.onerror = null; e.target.src = defaultProfilePic; }} alt="Profile" className="profileImage" />
                                <div className="name-date">
                                    <p className="displayName">{resource.socialmedia_from_displayname ?? 'Unknown User'}</p>
                                    <p className="postDate">{resource.socialmedia_from_screenname ?? ''}</p>
                                </div>
                            </div>
                            <p className="activityContent">{resource.unified_activity_content ?? 'No content available.'}</p>
                            <MediaRenderer mediaUrlString={resource.socialmedia_media_url} />
                            <div className="view" style={{ display: "flex", gap: "4px" }}>
                                <div className="time"><span>{formatDate(resource.unified_activity_time)}</span></div>
                                <span><strong>{resource.socialmedia_activity_view_count ?? 0}</strong> Views</span>
                            </div>
                            <div className="insta-icon">
                                <div className="like-commment-share">
                                    <div className="comment"><FaRegComment style={{ marginRight: '5px' }} /><span>{resource.socialmedia_activity_reply_count ?? 0}</span></div>
                                    <div className="repost"><LuRepeat2 style={{ marginRight: '5px' }} /><span>{resource.socialmedia_activity_retweet_count ?? 0}</span></div>
                                    <div className="like"><FaRegHeart style={{ marginRight: '5px' }} /><span>{resource.socialmedia_activity_like_count ?? 0}</span></div>
                                    <FaRegBookmark style={{ marginRight: '5px' }} />
                                    <MdOutlineFileUpload style={{ marginRight: '5px' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    {resource.unified_record_type === "Tiktok" && resource && (
                        <div className="tiktok-container" style={{ position: "relative", width: "325px" }}>
                            {resource.socialmedia_media_url?.length > 0 && !resource._forceIframe ? (
                                <video
                                    src={resource.socialmedia_media_url[0]}
                                    autoPlay
                                    muted
                                    loop
                                    controls
                                    style={{ width: "325px", borderRadius: "10px" }}
                                    onError={() => {
                                        resource._forceIframe = true; // fallback to iframe
                                        // trigger rerender if needed
                                    }}
                                />
                            ) : resource.site_url ? (
                                <iframe
                                    src={`https://www.tiktok.com/embed/${resource.site_url.split("/").pop()}?autoplay=1`}
                                    height="500"
                                    width="325"
                                    allow="autoplay; encrypted-media"
                                    style={{ border: "none", borderRadius: "10px" }}
                                ></iframe>
                            ) : null}
                        </div>
                    )}
                    {/* --- Facebook --- */}
                    {resource.unified_record_type === "Facebook" && (
                        <div className="resourceDetailsView marginSides20">
                            <div className="profile-section">
                                <img
                                    src={resource.socialmedia_from_imageurl}
                                    onError={e => { e.target.onerror = null; e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"; }}
                                    alt="pic_not_found"
                                    className="profileImage"
                                />
                                <div className="name-date">
                                    <p className="displayName">{resource.socialmedia_from_displayname}</p>
                                    <p className="postDate">{formatDate(resource.unified_activity_time)}</p>
                                </div>
                            </div>
                            <p className="activityContent">{resource.unified_activity_content}</p>
                            <MediaRenderer mediaUrlString={resource.socialmedia_media_url} />
                            <div className="view" style={{ display: "flex", gap: "4px" }}>
                                <div className="time">
                                    {/* <p className="postDate" style={{ font: "2px" }}> {formatDate(resource.unified_activity_time)}</p> */}
                                </div>
                            </div>
                            <div className="insta-icon">
                                <div className="like-commment-share">
                                    <div className="like">
                                        <LiaThumbsUpSolid style={{ marginRight: '5px' }} />
                                        <span>{resource.socialmedia_activity_like_count}</span>
                                    </div>
                                    <div className="comment">
                                        <span>{resource.socialmedia_activity_reply_count} comments</span>
                                    </div>
                                    <div className="share">
                                        <span>shares</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* --- FALLBACK FOR UNKNOWN unified_record_type --- */}
                    {!knownTypes.includes(resource.unified_record_type) && (
                        <div className="resourceDetailsView">
                            <div className="profile-section">
                                <h3>{resource.unified_activity_title ?? "No Title"}</h3>
                            </div>

                            <p className="activityContent" style={{ marginBottom: '10px', fontSize: '14px' }}>
                                {resource.unified_activity_content ?? "No Content Available"}
                            </p>

                            <div>
                                <p>Published Date: {formatDate(resource.unified_activity_time)}</p>
                            </div>
                        </div>
                    )}

                    {/* --- RSS feed --- */}
                    {resource.unified_record_type === "Rss Feed" && (
                        <div className="resourceDetailsView">
                            <div className="profile-section">
                                <h3>{resource.unified_activity_title}</h3>
                            </div>
                
                            <p className="activityContent" style={{ marginBottom:'10px', fontSize:'14px'}}>
                                {resource.unified_activity_content}
                            </p>
                             <div><p>Published Date: {formatDate(resource.unified_activity_time)}</p></div>
                        </div>
                    )}

                    {/* --- Many Sites --- */}
                    {[
                        "4chan.org", "gab.com", "icq.im", "t.me", "bitchute.com",
                        "bitcointalk.org", "crax.pro", "stopscamfraud.com", "AhmiaFi", "Gibiru"
                    ].includes(resource.unified_record_type) && (
                            <div className="resourceDetailsView">
                                <div className="profile-section">
                                    <h3>{resource.unified_activity_title}</h3>
                                </div>
                                <p className="activityContent">{resource.unified_activity_content}</p>
                            </div>
                    )}

                    {/* --- VK --- */}
                    {resource.unified_record_type === "VK" && (
                        <div className="resourceDetailsView marginSides20">
                            <div className="profile-section">
                                <img
                                    src={resource.socialmedia_media_url}
                                    onError={e => { e.target.onerror = null; e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"; }}
                                    alt="pic_not_found"
                                    className="profileImage"
                                />
                                <div className="name-date">
                                    <p className="displayName">{resource.socialmedia_from_displayname}</p>
                                </div>
                            </div>
                            {resource.socialmedia_media_url && (() => {
                                let urls = [];

                                // Handle different URL formats
                                if (typeof resource.socialmedia_media_url === 'string') {
                                    // Check if it's a JSON string
                                    if (resource.socialmedia_media_url.trim().startsWith('[') || resource.socialmedia_media_url.trim().startsWith('"')) {
                                        try {
                                            urls = JSON.parse(resource.socialmedia_media_url);
                                            // Ensure it's an array
                                            if (!Array.isArray(urls)) {
                                                urls = [urls];
                                            }
                                        } catch (error) {
                                            // If JSON parsing fails, treat it as a single URL
                                            urls = [resource.socialmedia_media_url];
                                        }
                                    } else {
                                        // It's a single URL string
                                        urls = [resource.socialmedia_media_url];
                                    }
                                } else if (Array.isArray(resource.socialmedia_media_url)) {
                                    urls = resource.socialmedia_media_url;
                                } else {
                                    return <p></p>;
                                }

                                // Filter valid media URLs
                                const validMedia = urls.filter(url => {
                                    if (!url || typeof url !== 'string') return false;

                                    const trimmedUrl = url.trim();
                                    return (
                                        /\.(jpg|jpeg|png|gif|webp)$/i.test(trimmedUrl) ||
                                        trimmedUrl.includes('scontent') ||
                                        trimmedUrl.includes('userapi.com') || // VK images
                                        trimmedUrl.includes('twimg.com') || // Twitter images
                                        trimmedUrl.includes('cdninstagram.com') || // Instagram images
                                        /\.(mp4|mov|webm|ogg)$/i.test(trimmedUrl) ||
                                        trimmedUrl.includes('video')
                                    );
                                });

                                if (validMedia.length === 0) {
                                    return <p></p>;
                                }

                                return (
                                    <div className="imageGridWrapper">
                                        {validMedia.map((url, index) => {
                                            const trimmedUrl = url.trim();

                                            // Check if it's a video
                                            if (trimmedUrl.includes('video') || /\.(mp4|mov|webm|ogg)$/i.test(trimmedUrl)) {
                                                return (
                                                    <video key={trimmedUrl} controls className="postImage" preload="metadata">
                                                        <track
                                                            kind="captions"
                                                            srcLang="en"
                                                            label="English"
                                                            default
                                                        />
                                                        <source src={trimmedUrl} type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                );
                                            }

                                            // It's an image
                                            return (
                                                <img
                                                    key={index}
                                                    src={trimmedUrl}
                                                    alt={`Media ${index + 1}`}
                                                    className="postMedia"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        console.log('Image failed to load:', trimmedUrl);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            <p className="activityContent">
                                {resource.unified_activity_content}
                            </p>
                            <div className="insta-icon" style={{ justifyContent: "initial" }}>
                                <div className="unified-date">
                                    <div className="like-commment-share vk">
                                        <div className="like">
                                            <FaRegHeart style={{ marginRight: '5px' }} />
                                            <span>Like</span>
                                        </div>
                                        <div className="comment">
                                            <PiShareFatBold style={{ marginRight: '5px' }} />
                                            <span>{resource.socialmedia_activity_share_count}</span>
                                        </div>
                                    </div>
                                    <div className="date-text">{resource.unified_date_only}</div>
                                </div>
                            </div>
                            <div className="bottom-row">
                                <span className="red-heart">❤</span>
                                <span className="like-count">{resource.socialmedia_activity_like_count}</span>
                            </div>
                        </div>
                    )}

                    {/* --- YouTube --- */}

                    
                    {resource.unified_record_type === "YouTube" && (
                        <div className="resourceDetailsView yt">
                            <div className="videoWrapper">
                                {Array.isArray(resource.socialmedia_media_url) &&
                                    resource.socialmedia_media_url.length > 0 && (
                                        <>
                                            {/* --- Click-to-play logic --- */}
                                            {!showVideo ? (
                                                <div
                                                    className="thumbnailContainer"
                                                    style={{ position: "relative", cursor: "pointer" }}
                                                    onClick={() => setShowVideo(true)}
                                                >
                                                    <img
                                                        src={resource.socialmedia_media_url[0]}
                                                        alt="YouTube Thumbnail"
                                                        style={{
                                                            width: "100%",
                                                            height: "auto",
                                                            borderRadius: "10px",
                                                        }}
                                                    />
                                                    {/* Play button overlay */}
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            top: "50%",
                                                            left: "50%",
                                                            transform: "translate(-50%, -50%)",
                                                            backgroundColor: "rgba(0,0,0,0.6)",
                                                            borderRadius: "50%",
                                                            width: "70px",
                                                            height: "70px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="white"
                                                            width="40px"
                                                            height="40px"
                                                        >
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ) : (
                                                <iframe
                                                    width="100%"
                                                    height="400"
                                                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                                                        resource.socialmedia_media_url[1]
                                                    )}?autoplay=1`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                ></iframe>
                                            )}
                                        </>
                                    )}
                            </div>

                            <h4 className="videoTitle">{resource.socialmedia_activity_title}</h4>

                            <div className="channel-action">
                                <div className="channelInfo">
                                    <img
                                        src={
                                            resource.socialmedia_from_imageurl ||
                                            resource.socialmedia_media_url?.[0]
                                        }
                                        alt="Channel Logo"
                                        className="channelLogo"
                                    />
                                    <h6 className="channelName">
                                        {resource.socialmedia_from_displayname}
                                    </h6>
                                    <button className="subscribeButton">Subscribe</button>
                                </div>

                                <div className="actions">
                                    <button className="actionButton">
                                        <span className="like">
                                            <AiOutlineLike />
                                        </span>{" "}
                                        Like
                                        <span className="like">
                                            {" "}
                                            | <AiOutlineDislike />
                                        </span>
                                    </button>
                                    <button className="actionButton">
                                        <span className="comment">
                                            <PiShareFatBold />{" "}
                                        </span>{" "}
                                        Share
                                    </button>
                                    <button className="actionButton">
                                        <BsThreeDots />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <strong>{resource.socialmedia_activity_view_count}</strong> Views
                            </div>
                        </div>
                    )}

                    {resource?.unified_type && (
                        <>
                            {/* Sentiment Section */}
                            <div className="ShowSection">
                                <div
                                    className="sentimentSection"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        gap: "10px",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontSize: '14px', color: "white" }}>Sentiment:</span>
                                        {resource.sentiment
                                            ? (
                                                <div style={{ cursor: "default" }} className="search-chips">
                                                    {resource.sentiment.charAt(0).toUpperCase() +
                                                        resource.sentiment.slice(1)}
                                                </div>
                                            )
                                            : <span style={{ fontSize: "12px", color: "gray" }}>No Data</span>
                                        }
                                    </div>
                                    {/* Targets Row */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: "14px", color: "white", minWidth: "65px" }}>Targets:</span>

                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {Array.isArray(targetData) && targetData.length > 0 ? (
                                                [...new Set(targetData.map(t => t.name?.trim()))].map((uniqueName, index) => (
                                                    <div key={index} className="search-chips">
                                                        {uniqueName}
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: "12px", color: "gray" }}>No Data</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Entities Row */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: '14px', color: "white" }}>Entities:</span>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {(() => {
                                                const entityFields = [
                                                    "person", "org", "gpe", "loc", "work_of_art", "product", "event", "law",
                                                    "language", "percent", "money", "quantity", "time", "date"
                                                ];

                                                const allValues = [];

                                                entityFields.forEach(field => {
                                                    if (Array.isArray(resource[field])) {
                                                        allValues.push(...resource[field].map(v => v?.trim()));
                                                    }
                                                });
                                                const uniqueEntities = [...new Set(allValues.filter(Boolean))];

                                                return uniqueEntities.length > 0 ? (
                                                    uniqueEntities.map((value, idx) => (
                                                        <div key={idx} className="search-chips">
                                                            {value}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: "12px", color: "gray" }}>No Data</span>
                                                );
                                            })()}
                                        </div>
                                    </div>


                                </div>
                            </div>



                        </>
                    )}

                </div>
                <div>
                    {showPopup && (
                        <AddComment
                            show={showPopup}
                            selectedResource={resource} 
                            onClose={() => setShowPopup(false)} 
                        />
                    )}
                    {resource?.unified_type && showCommentPopup && (
                        <div
                            className="floatingButtonWrapper"
                            style={{
                                position: "fixed",  
                                bottom: "20px",     
                                right: "20px",       
                                zIndex: 1000,        
                            }}
                        >
                            <AppButton
                                onClick={() => setShowPopup(true)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    padding: "12px",
                                    borderRadius: "50%",
                                    background: "#0073cf",
                                    color: "white",
                                    boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
                                }}
                            >
                                <CiSquarePlus size={20} />  Comment
                            </AppButton>
                        </div>

                    )}
                </div>
            </div>
        </>
    );
}

ResourceDetails.propTypes = {
    resource: PropTypes.shape({
        unified_record_type: PropTypes.string,
        unified_activity_title: PropTypes.string,
        site_snippet: PropTypes.string,
        socialmedia_activity_title: PropTypes.string,
        site_published_date: PropTypes.string,
        socialmedia_from_imageurl: PropTypes.string,
        socialmedia_from_displayname: PropTypes.string,
        socialmedia_from_screenname: PropTypes.string,
        socialmedia_activity_url: PropTypes.string,
        unified_date_only: PropTypes.string,
        socialmedia_media_url: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]),
        unified_activity_content: PropTypes.string,
        socialmedia_activity_like_count: PropTypes.number,
        socialmedia_activity_comment_count: PropTypes.number,
        socialmedia_activity_view_count: PropTypes.number,
        socialmedia_activity_reply_count: PropTypes.number,
        socialmedia_activity_retweet_count: PropTypes.number,
        socialmedia_activity_share_count: PropTypes.number,
        unified_type: PropTypes.string,
        sentiment: PropTypes.string,
       unified_activity_time: PropTypes.string,
        unified_capture_time: PropTypes.string,
        socialmedia_activity_time: PropTypes.string,
    }),
    showCommentPopup: PropTypes.bool,
    showPopup: PropTypes.bool,
    setShowPopup: PropTypes.func,
    isListView: PropTypes.bool,
    resources: PropTypes.array,
    selectedResource: PropTypes.object,
    loading: PropTypes.bool,
    handleResourceClick: PropTypes.func,
    containerRef: PropTypes.any,
    sidebarRef: PropTypes.any,
    title: PropTypes.string,
    noDataMessage: PropTypes.string,
    selectResourceMessage: PropTypes.string
};
