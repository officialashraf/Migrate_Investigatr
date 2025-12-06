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

const CaseDetails = ({ caseId, togglePopupA }) => {
    const { t } = useTranslation();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCaseDetails = async () => {
            try {
                setLoading(true);
                const token = Cookies.get("accessToken");
                const response = await axios.get(
                    `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case/${caseId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                setItem(response.data.data || response.data);
            } catch (err) {
                toast.error(
                    err.response?.data?.detail || t("caseDetails.noDetails")
                );
                console.error("Error fetching case details:", err.response || err);
            } finally {
                setLoading(false);
            }
        };

        if (caseId) {
            fetchCaseDetails();
        }
    }, [caseId, t]);

    const formatWatchers = () => {
        if (Array.isArray(item?.watchers)) return item.watchers.join(", ");
        if (typeof item?.watchers === "string")
            return item.watchers.split(",").map((w) => w.trim()).join(", ");
        return "";
    };

    if (loading) {
        return (
            <div className="popup-overlay">
                <div className="popup-containera">
                    <div className="popup-content">{t("caseDetails.loading")}</div>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="popup-overlay">
                <div className="popup-containera">
                    <div className="popup-content">
                        <p>{t("caseDetails.noDetails")}</p>
                        <button type="button" className="cancel-btn" onClick={togglePopupA}>
                            {t("caseDetails.cancel")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PopupModal title={t("caseDetails.title")} onClose={togglePopupA}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <DetailBox label={t("caseDetails.caseId")} value={`CASE${String(item.id).padStart(4, "0")}`} />
                    <DetailBox label={t("caseDetails.status")} value={item.status} isStatus />
                    <DetailBox label={t("caseDetails.description")} value={item.description} />
                    <DetailBox label={t("caseDetails.createdOn")} value={item.created_on?.slice(0, 12)} />
                    <DetailBox label={t("caseDetails.createdBy")} value={item.created_by} />
                    <DetailBox label={t("caseDetails.editedOn")} value={item.modified_on} />
                    <DetailBox label={t("caseDetails.editedBy")} value={item.modified_by} />
                    <DetailBox label={t("caseDetails.assignee")} value={item.assignee} />
                    <DetailBox label={t("caseDetails.watchers")} value={formatWatchers()} />
                    <DetailBox label={t("caseDetails.archivedBy")} value={item.archivedBy} />
                    <DetailBox label={t("caseDetails.archivedOn")} value={item.archivedOn} />
                    <DetailBox label={t("caseDetails.archivalReason")} value={item.archivalReason} />
                    <DetailBox label={t("caseDetails.archivalComments")} value={item.archivalComments} />
                </div>
            </div>
            <div className="d-flex justify-content-center mt-3">
                <AppButton children={t("caseDetails.ok")} onClick={togglePopupA} />
            </div>
        </PopupModal>
    );
};
CaseDetails.propTypes = {
    caseId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired, // or remove `.isRequired` if optional

    togglePopupA: PropTypes.func.isRequired, // or just PropTypes.func if optional
};
export default CaseDetails;
