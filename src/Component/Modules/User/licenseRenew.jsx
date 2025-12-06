import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import style from "./login.module.css";
import TextareaField from "../../Common/TextField/textField";
import AppButton from "../../Common/Buttton/button";
import { Form } from "react-bootstrap";
import PopupModal from "../../Common/Popup/popup";
import PropTypes from "prop-types";

const LicenseRenew = ({ togglePopup }) => {
  const { t } = useTranslation();
  const [error, setError] = useState({});
  const [licenseKey, setLicenseKey] = useState("");

  const validateForm = () => {
    const errors = {};
    if (!licenseKey.trim()) {
      errors.licenseKey = t("license.errors.required");
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    try {
      await axios.post(
        `${window.runtimeConfig.VITE_APP_API_LICENSE}/api/license/register`,
        { key: licenseKey },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(t("license.success"));
      togglePopup();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || t("license.errors.registrationFailed");
      toast.error(errorMsg);
      setError({ submit: errorMsg });
    }
  };

  return (
    <PopupModal title={t("license.title")} onClose={togglePopup}>
      <div>
        <Form onSubmit={handleSubmit}>
          <TextareaField
            label={`${t("license.keyLabel")} *`}
            placeholder={t("license.placeholder")}
            value={licenseKey}
            onChange={(e) => {
              setLicenseKey(e.target.value);
              setError((prev) => ({ ...prev, licenseKey: "", submit: "" }));
            }}
            rows={3}
            className="customfiled"
            error={!!error.licenseKey}
            style={{ backgroundColor: "white", color: "black" }}
          />
          {error.licenseKey && (
            <p style={{ color: "red", margin: "0px" }}>{error.licenseKey}</p>
          )}
          <div className="d-flex justify-content-end mt-3">
            <AppButton>{t("license.applyButton")}</AppButton>
          </div>
        </Form>
      </div>
    </PopupModal>
  );
};
LicenseRenew.propTypes = {
  togglePopup: PropTypes.func.isRequired,
};  
export default LicenseRenew;
