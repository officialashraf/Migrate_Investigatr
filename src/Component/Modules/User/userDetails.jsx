import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import PopupModal from "../../Common/Popup/popup";
import DetailBox from "../../Common/DetailBox/DetailBox";
import styles from '../../Common/DetailBox/detailBox.module.css';
import AppButton from "../../Common/Buttton/button";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const UserDetails = ({ userId, toggleDetails }) => {
  const { t } = useTranslation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("accessToken");
        const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setItem(response.data.data || response.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || t('errors.fetchUserDetails'));
        console.error("Error fetching user details:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, t]);

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-containera">
          <div className="popup-content">{t('userDetails.loading')}</div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="popup-overlay">
        <div className="popup-containera">
          <div className="popup-content">
            <p>{t('userDetails.notFound')}</p>
            <button type="button" className="cancel-btn" onClick={toggleDetails}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PopupModal title={t('userDetails.title')} onClose={toggleDetails}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <DetailBox label={t('userDetails.username')} value={item.username} />
          <DetailBox label={t('userDetails.userId')} value={`USER${String(item.id).padStart(4, '0')}`} />
          <DetailBox label={t('userDetails.email')} value={item.email} />
          <DetailBox label={t('userDetails.lastActive')} value={item.last_logout} />
          <DetailBox label={t('userDetails.status')} value={item.status.charAt(0).toUpperCase() + item.status.slice(1)} isStatus />
          <DetailBox label={t('userDetails.createdOn')} value={item.createdOn} />
          <DetailBox label={t('userDetails.createdBy')} value={item.created_by} />
          <DetailBox label={t('userDetails.editedOn')} value={item.updatedOn} />
          <DetailBox label={t('userDetails.editedBy')} value={item.updatedBy} />
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <AppButton onClick={toggleDetails}>{t('common.ok')}</AppButton>
      </div>
    </PopupModal>
  );
};
UserDetails.propTypes = {
  userId: PropTypes.string.isRequired,
  toggleDetails: PropTypes.func.isRequired,
};

export default UserDetails;
