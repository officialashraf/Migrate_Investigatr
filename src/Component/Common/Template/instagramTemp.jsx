import React from 'react'
import { FaRegHeart, FaRegCommentDots, FaRegBookmark } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa6";
import { PiShareFatBold } from "react-icons/pi";

const InstagramTemp = ({ resource, MediaRenderer }) => {
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
    const defaultProfilePic =
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <div className="resourceDetailsView marginSides20">
            <div className="profile-section">
                <img
                    src={resource.socialmedia_from_imageurl ?? defaultProfilePic}
                    onError={e => { e.target.onerror = null; e.target.src = defaultProfilePic; }}
                    alt="Profile"
                    className="profileImage"
                />
                <div className="name-date">
                    <p className="displayName">{resource.socialmedia_from_displayname ?? 'Unknown User'}</p>
                    <p className="postDate"> {formatDate(resource.unified_activity_time)}</p>
                </div>
            </div>
            <MediaRenderer mediaUrlString={resource.socialmedia_media_url} />
            <p className="activityContent">{resource.unified_activity_content ?? 'No content available.'}</p>
            <div className="insta-icon" style={{ justifyContent: "initial" }}>
                <div className="like-commment-share">
                    <div className="like"><FaRegHeart style={{ marginRight: '5px' }} /><span>{resource.socialmedia_activity_like_count ?? 0}</span></div>
                    <div className="comment"><FaRegComment style={{ marginRight: '5px' }} /><span>{resource.socialmedia_activity_comment_count ?? 0}</span></div>
                    <PiShareFatBold style={{ marginRight: '5px' }} />
                </div>
            </div>
        </div>
    )
}

export default InstagramTemp;