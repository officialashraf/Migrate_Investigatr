import React, {useState} from 'react'
import UserProfile from './userProfile'
import HashtagResource from './hashtagResource'
import HashtagSearchBar from './hashtagSearchBar'
import styles from "./hashtagHome.module.css";
import HashtagSummary from "./hashtagSummary";
import HashtagHistory from './hashtagHistory';
import tableStyless from "../../Common/Table/table.module.css";
import Loader from '../Layout/loader';

const HashtagHome = () => {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <div className={styles.container}>
      
      {/* Top Search */}
      <div className={styles.searchBar}>
       <HashtagSearchBar onOpenHistory={() => setShowHistory(true)} />
      </div>

      {/* Middle Layout */}
      <div className={styles.middle}>
        <div className={styles.left}>
          <UserProfile />
        </div>

        <div className={styles.right}>
          <HashtagResource />
        </div>
      </div>

      {/* Bottom Summary */}
      {/* <div className={styles.summary}>
        <HashtagSummary />
      </div> */}
<HashtagHistory
        showPopup={showHistory}
        onClose={() => setShowHistory(false)}
        formatTime={(t) => new Date(t).toLocaleString()}
        Loader={() => <div><Loader/></div>}
        tableStyless={tableStyless}
      />
    </div>
  );
};

export default HashtagHome;


