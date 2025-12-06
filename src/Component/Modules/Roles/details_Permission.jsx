import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import PopupModal from "../../Common/Popup/popup";
import DetailBox from "../../Common/DetailBox/DetailBox";
import styles from '../../Common/DetailBox/detailBox.module.css';
import AppButton from "../../Common/Buttton/button";
import PropTypes from 'prop-types';

const DetailsPermission = ({ roleId, toggleDetails }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleDetails = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("accessToken");
        const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/role/${roleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setDetails(response.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to fetch role details");
        console.error("Error fetching role details:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    if (roleId) {
      fetchRoleDetails();
    }
  }, [roleId]);

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-containera">
          <div className="popup-content">Loading role details...</div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="popup-overlay">
        <div className="popup-containera">
          <div className="popup-content">
            <p>No role details found.</p>
            <button type="button" className="cancel-btn" onClick={toggleDetails}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PopupModal title={'Role Details'} onClose={toggleDetails}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <DetailBox label="Role" value={details.role} />
          <DetailBox label="Created On" value={details?.created_on ? details.created_on.slice(0, 12) : '-'} />
          <DetailBox label="Created By" value={details?.created_by ? details.created_by.slice(0, 8) : '-'} />
          <DetailBox label="Edited On" value={details.editedOn || '-'} />
          <DetailBox label="Edited By" value={details.editedBy || '-'} />
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <AppButton onClick={toggleDetails}>OK</AppButton>
      </div>
    </PopupModal>
  );
};
DetailsPermission.propTypes = {
  roleId: PropTypes.string.isRequired,
  toggleDetails: PropTypes.func.isRequired,
};
export default DetailsPermission;
