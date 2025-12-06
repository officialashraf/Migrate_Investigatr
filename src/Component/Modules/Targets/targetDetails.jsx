import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import PopupModal from "../../Common/Popup/popup";
import DetailBox from "../../Common/DetailBox/DetailBox";
import styles from '../../Common/DetailBox/detailBox.module.css';
import AppButton from "../../Common/Buttton/button";
import PropTypes from "prop-types";

const TargetDetails = ({ togglePopup, id }) => {
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("accessToken");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    synonyms: [],
    type: "",
    threat_weightage: 0,
    target_id: [],
    remove_target: [],
    created_on: null,
    created_by: null,
    modified_on: null,
    modified_by: null,
    is_active: null,
    linked_to: ""
  });

  // Fetch target details by ID
  const fetchTargetDetails = async () => {
    if (!token || !id) {
      toast.error("Authentication error or missing target ID");
      return;
    }

    try {
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200 && response.data) {
        const targetData = response.data;

        // Extract parent IDs from the parents array
        const parentIds = targetData.parents ? targetData.parents.map(parent => parent.id) : [];
        const parentNames = targetData.parents && targetData.parents.length > 0
          ? targetData.parents.map(p => `${p.name} (${p.id})`).join(", ")
          : "None";

        setFormData({
          name: targetData.name || "",
          description: targetData.description || "",
          synonyms: targetData.synonyms || [],
          type: targetData.type || "",
          threat_weightage: targetData.threat_weightage || 0,
          target_id: parentIds,
          remove_target: [],
          created_on: targetData.created_on,
          created_by: targetData.created_by,
          modified_on: targetData.modified_on,
          modified_by: targetData.modified_by,
          is_active: targetData.is_active,
          linked_to: parentNames
        });
      }

    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to fetch target details");
      console.error("Error fetching target details:", err.response || err);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchTargetDetails();
  }, [id, token]);

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-containera">
          <div className="popup-content">
            Loading target details...
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="popup-overlay">
        <div className="popup-containera">
          <div className="popup-content">
            <p>No target details found.</p>
            <button type="button" className="cancel-btn" onClick={togglePopup}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PopupModal title={'Target Details'} onClose={togglePopup}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <DetailBox label="Name" value={formData.name} />
          <DetailBox label="ID" value={`TAR${String(id).padStart(4, '0')}`} />
          <DetailBox label="Created On" value={formData?.created_on ? formData.created_on.slice(0, 18) : '-'} />
          <DetailBox label="Created By" value={formData?.created_by || '-'} />
          <DetailBox label="Edited On" value={formData?.modified_on ? formData.modified_on.slice(0, 18) : '-'} />
          <DetailBox label="Edited By" value={formData?.modified_by || '-'} />
          <DetailBox label="Description" value={formData.description || '-'} />
          <DetailBox label="Synonyms" value={formData.synonyms ? formData.synonyms.join(', ') : '-'} />
          <DetailBox label="Threat-Score" value={formData.threat_weightage} />
          <DetailBox label="Type" value={formData.type || '-'} />
          <DetailBox label="Active" value={formData.is_active ? 'Active' : 'Deactive'} />
          <DetailBox label="Linked To" value={formData.linked_to} />
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <AppButton onClick={togglePopup}>OK</AppButton>
      </div>
    </PopupModal>
  );
};
TargetDetails.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  togglePopup: PropTypes.func.isRequired,
};  
export default TargetDetails;
