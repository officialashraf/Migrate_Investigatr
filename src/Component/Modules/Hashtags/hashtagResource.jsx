
import React, { useState, useEffect } from "react";
import { FaRegHeart, FaRegBookmark } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa6";
import { LuRepeat2 } from "react-icons/lu";
import { MdOutlineFileUpload } from "react-icons/md";
import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import LoaderHashtag from "../Layout/LoaderHashtag";

const HashtagResource = () => {
    //   const [loading, setLoading] = useState(false);
    //   const [resource, setResource] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const { loading, data, error,isSearchTriggered } = useSelector((state) => state.hashtagSearch);
    const resource = data?.final_record
        ? Array.isArray(data.final_record)
            ? data.final_record
            : [data.final_record]   // <-- object ko array bana diya
        : [];
    console.log("REsource ka data", resource);
    //     "socialmedia_activity": "Tweet With Image",
    //     "socialmedia_activity_content": "@BanCheneProduct\n\nManohar Parrikar eating a Simple meal at an Ordinary Dhaba.The Person sitting next to him does not realise he is\nsitting next to India's Defence Minister !!\n\nAn Extraordinary Person with an Extraordinary Outlook towards life\n!!",
    //     "socialmedia_from_id": "1140557902832209921",
    //     "socialmedia_usermentions": [
    //         "BanCheneProduct"
    //     ],
    //     "socialmedia_from_imageurl": "https://pbs.twimg.com/profile_images/1766382556487004160/1qJlFazF_400x400.jpg",
    //     "socialmedia_from_displayname": "LuckyGoHappy\n( Modi Ka Parivar\n)",
    //     "socialmedia_activity_time": 1764305885000,
    //     "socialmedia_activityid": "-70143726",
    //     "socialmedia_media_url": [
    //         "https://video.twimg.com/amplify_video/1979904406066712577/vid/avc1/720x1188/GQHsshTpISfSk3gk.mp4?tag=21"
    //     ],
    //     "socialmedia_from_screenname": "shrisha_uchil",
    //     "socialmedia_activity_like_count": 941,
    //     "socialmedia_type": "X",
    //     "socialmedia_activity_retweet_count": 654,
    //     "socialmedia_activityid_pk": "-70143726",
    //     "socialmedia_input": "asdfg",
    //     "socialmedia_activity_view_count": 555,
    //     "socialmedia_activity_reply_count": 322,
    //     "socialmedia_activity_url": "https://twitter.com/shrisha_uchil/status/1767464509818482795"
    // },
    //       ]);
    //       setLoading(false);
    //     }, 500);
    //   }, []);
useEffect(() => {
  if (loading) {
    setHasSearched(true);
  }
}, [loading]);

    const isVideo = (url = '') => { return /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url); };
    const isImage = (url = '') => /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('pbs.twimg.com') || url.includes('cdninstagram.com');
    // const defaultProfilePic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

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
        // Redux ka loading state use karo
        if (loading) {
            return (
                <LoaderHashtag />
            );
        }

        //    if (resource.length === 0 && !loading) {
        //        return <p style={{ textAlign: 'center', color: '#aaa', marginTop: '20px' }}>No social media resources found for this search.</p>;
        //    }
        return (
            <div className="imageGridWrapper">
                {urls.map((url, index) => {
                    if (typeof url !== 'string' || !url.trim()) return null;
                    const trimmedUrl = url.trim();

                    if (isVideo(trimmedUrl)) {
                        return (
                            <video key={`${trimmedUrl}-${index}`} controls
                                className="mediaPost"
                                preload="metadata">
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
                                className="mediaPost"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <LoaderHashtag />
        );
    }

const hasData = resource.length > 0;


    const defaultProfilePic =
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

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
    if (hasData) {
    return (
        <>
            {resource && resource.map((item, index) => (
                <div key={index} className="resourceDetailsView ">

                    <div className="profile-section">
                        <img
                            src={item.socialmedia_from_imageurl ?? defaultProfilePic}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultProfilePic;
                            }}
                            className="profileImage"
                        />

                        <div className="name-date">
                            <p className="displayName">
                                {item.socialmedia_from_displayname ?? "Unknown User"}
                            </p>
                            <p className="postDate">
                                {item.socialmedia_from_screenname ?? ""}
                            </p>
                        </div>
                    </div>

                    <p className="activityContent">
                        {item.socialmedia_activity_content ?? "No content available."}
                    </p>

                    <MediaRenderer mediaUrlString={item.socialmedia_media_url} />

                    <div className="view" style={{ display: "flex", gap: "4px" }}>
                        <div className="time"><span>{formatDate(item.socialmedia_activity_time)}</span></div>
                        <span><strong>{item.socialmedia_activity_view_count ?? 0}</strong> Views</span>
                    </div>
                    <div className="insta-icon">
                        <div className="like-commment-share">
                            <div className="comment"><FaRegComment style={{ marginRight: '5px' }} /><span>{item.socialmedia_activity_reply_count ?? 0}</span></div>
                            <div className="repost"><LuRepeat2 style={{ marginRight: '5px' }} /><span>{item.socialmedia_activity_retweet_count ?? 0}</span></div>
                            <div className="like"><FaRegHeart style={{ marginRight: '5px' }} /><span>{item.socialmedia_activity_like_count ?? 0}</span></div>
                            <FaRegBookmark style={{ marginRight: '5px' }} />
                            <MdOutlineFileUpload style={{ marginRight: '5px' }} />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
if (hasSearched && !hasData) {
  return (
    <div style={{
      textAlign: 'center',
      color: '#94a3b8',
      marginTop: '20%',
      fontSize: '12px',
      marginRight: '55%',
      fontWeight: '500'
    }}>
      No data found for this hashtag
    </div>
  );
}

// First time page / No search / No data → Search message 🔍
return (
  <div style={{
    textAlign: 'center',
    color: '#94a3b8',
    marginRight: '55%',
    marginTop: '20%',
    fontSize: '12px',
    fontWeight: '500'
  }}>
    {/* 🔍 Search hashtag to see results */}
  </div>
);
};


export default HashtagResource