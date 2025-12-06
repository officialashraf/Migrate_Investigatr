import React from "react";
import { GoEye } from "react-icons/go";


const TelegramView = ({ resource }) => {
    const formatTelegramContent = (text = '') => {
        // Replace **bold** with <strong> tags and preserve newlines for CSS rendering
        const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <div dangerouslySetInnerHTML={{ __html: boldedText }} />;
    };
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

    return (
        <div className="resourceDetailsView marginSides20">
            {/* <div style={styles.telegramHeader}>
                    <h3 style={styles.telegramChannelName}>{resource.socialmedia_to_displayname ?? 'Telegram Channel'}</h3>
                </div> */}
            <div className="profile-section">
                <img src={resource.socialmedia_from_imageurl ?? defaultProfilePic} onError={e => { e.target.onerror = null; e.target.src = defaultProfilePic; }} alt="Profile" className="profileImage" />
                <div className="name-date">
                    <p className="displayName">{resource.socialmedia_to_displayname ?? 'Telegram Channel'}</p>
                </div>
            </div>
            <div style={styles.telegramMessageWrapper}>
                <div style={styles.telegramMessageBubble}>
                    <span style={{ color: "#0073cf", fontSize: "14px" }}>{resource.socialmedia_from_id}</span>
                    <div style={{ ...styles.telegramContent, whiteSpace: 'pre-wrap' }}>
                        {formatTelegramContent(resource.unified_activity_content)}
                    </div>
                    <div style={styles.telegramFooter}>
                        <div style={styles.telegramViews}>
                            <GoEye style={{ marginRight: '4px' }} />
                            <span>{resource.socialmedia_activity_view_count ?? 0}</span>
                        </div>
                        <div style={styles.telegramTimestamp}>
                            {formatDate(resource.unified_activity_time, { timeOnly: true })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelegramView;

// --- Styles for Telegram Component ---
const styles = {
    telegramContainer: {
        backgroundColor: '#0E1621', // Dark background color from reference
        padding: '10px',
        fontFamily: 'sans-serif',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
    },
    telegramHeader: {
        textAlign: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #1A2836',
    },
    telegramChannelName: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 'bold',
    },
    telegramMessageWrapper: {
        display: 'flex',
        justifyContent: 'flex-start', // Messages appear on the left
        padding: '10px 5px',
    },
    telegramMessageBubble: {
        backgroundColor: '#182533', // Message bubble color
        borderRadius: '15px',
        padding: '8px 12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        width: 'auto',
        overflow: 'auto'
    },
    telegramContent: {
        fontSize: '15px',
        lineHeight: '1.4',
        wordWrap: 'break-word',
    },
    telegramFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: '8px',
        color: '#6A7885', // Muted color for footer text
        fontSize: '12px',
    },
    telegramViews: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '10px',
    },
    telegramTimestamp: {
        // The timestamp will be on the far right
    }
};
