import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import PopupModal from "../../Common/Popup/popup";
import DetailBox from "../../Common/DetailBox/DetailBox";
import styles from '../../Common/DetailBox/detailBox.module.css';
import AppButton from "../../Common/Buttton/button";
import PropTypes from 'prop-types';

const ConnectionDetails = ({ togglePopup, id }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnectionDetails = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("accessToken");
        const response = await axios.get(
          `${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/connection/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setItem(response.data.data || response.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to fetch connection details");
        console.error("Error fetching connection details:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConnectionDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-containera">
          <div className="popup-content">Loading connection details...</div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="popup-overlay">
        <div className="popup-containera">
          <div className="popup-content">
            <p>No connection details found.</p>
            <button type="button" className="cancel-btn" onClick={togglePopup}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PopupModal title={'Connection Details'} onClose={togglePopup}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <DetailBox label="Connection ID" value={`CONN${String(item.id).padStart(4, "0")}`} />
          <DetailBox label="Connection Name" value={item.name} />
          <DetailBox label="Status" value={item.status} />
          <DetailBox label="Created On" value={item.created_on?.slice(0, 12)} />
          <DetailBox label="Created By" value={item.created_by} />
          <DetailBox label="Edited On" value={item.modified_on || '-'} />
          <DetailBox label="Edited By" value={item.modified_by || '-'} />
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <AppButton onClick={togglePopup}>OK</AppButton>
      </div>
    </PopupModal>
  );
};
ConnectionDetails.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  togglePopup: PropTypes.func.isRequired,
};
export default ConnectionDetails;
