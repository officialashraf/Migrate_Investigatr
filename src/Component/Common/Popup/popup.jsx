import React from "react";
import styles from "./popup.module.css"; 
import PropTypes from "prop-types";

const PopupModal = ({ title, children, onClose }) => {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <button className={styles.closeIcon} onClick={onClose}>
          &times;
        </button>
        <div className={styles.renewPopup}>
          {title && <h5 >{title}</h5>}
          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
PopupModal.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};
export default PopupModal;

