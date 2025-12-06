import {
    Menu, SquarePen, History, Settings, MoreVertical
} from 'lucide-react';
import styles from './ChatBot.module.css';

const Sidebar = ({ isExpanded, toggleSidebar, startNewChat, chats, selectChat, activeChatId }) => (
    <aside className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed}`}>
        <div className={styles.sidebarTop}>
            <div className={styles.sidebarHeader}>
                {/* {isExpanded && <h1 className={styles.logo}>CC</h1>} */}
                <button onClick={toggleSidebar} className={styles.iconButton}>
                    <Menu size={20} />
                </button>
            </div>

            <button onClick={startNewChat} className={`${styles.newChatBtn} ${isExpanded ? styles.expandedBtn : styles.collapsedBtn}`}>
                <SquarePen size={20} />
                {isExpanded && <span>New chat</span>}
            </button>

            {isExpanded && chats.length > 0 && (
                <div className={styles.recentSection}>
                    <div className={styles.recentTitle}>
                        <History size={16} />
                        <span>Recent chats</span>
                    </div>
                    <ul className={styles.recentList}>
                        {chats.map(chat => (
                            <li
                                key={chat.id}
                                onClick={() => selectChat(chat.id)}
                                className={`${styles.recentItem} ${chat.id === activeChatId ? styles.activeChat : ''}`}
                            >
                                <span className={styles.recentTitleText}>{chat.title}</span>

                                {isExpanded && (
                                    <button
                                        className={styles.recentMenuButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        <div className={styles.sidebarBottom}>
            {/* <button className={styles.sidebarButton}>
                <Settings size={20} /> {isExpanded && <span>Settings and help</span>}
            </button> */}
            {/* <button className={styles.sidebarButton}>
        <Settings size={20} /> {isExpanded && <span>Help</span>}
      </button> */}
        </div>
    </aside>
);

export default Sidebar;