import { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import style from "./login.module.css";
import TextareaField from "../../Common/TextField/textField";
import AppButton from "../../Common/Buttton/button";
import { useTranslation } from 'react-i18next';

const LicensePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  const validateForm = () => {
    const errors = {};

    if (!licenseKey.trim()) {
      errors.licenseKey = t('login.LicenseValidation', 'Please enter the license key before proceeding');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("key", licenseKey)
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    try {
      console.log("key", typeof licenseKey)
      const response = await axios.post(`${window.runtimeConfig.VITE_APP_API_LICENSE}/api/license/register`,
        { key: licenseKey },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("key", licenseKey)
      toast.success(t('login.LicenseSuccess'));
      console.log("License Response:", response);


      let attempts = 0;
      let licenseConfirmed = false;

      while (attempts < 3 && !licenseConfirmed) {
        const res = await axios.get(`${window.runtimeConfig.VITE_APP_API_LICENSE}/api/license`);
        if (res.data?.license_registered) {
          licenseConfirmed = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      if (licenseConfirmed) {
        localStorage.setItem("licenseKey", "VALID");
        navigate("/login");
      } else {
        toast.error = t('login.LicenseError', 'License registered but verification failed. Try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || t('login.LicenseError1', 'License registration failed'));
      console.warn(err.response?.data?.detail || "Registration err");
      console.log("Err:", err);
    }
  };

  return (

    <Container fluid className={style.loginContainer} style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'center' }}>
      <Row className={style.loginRow}>
        <Col md={6} className={style.leftColumn}>
          <h1>Investigatr</h1>
        </Col>
        <Col md={6} className={style.rightColumn}>
          <Form className={style.loginForm} onSubmit={handleSubmit}>
            <TextareaField
              label={t('login.LicenseLabel', 'License Key *')}
              value={licenseKey}
              onChange={(e) => {
                setLicenseKey(e.target.value);
                setError((prevErrors) => ({
                  ...prevErrors,
                  licenseKey: "",
                }));
              }}
              placeholder={t('login.LicensePlaceholder', 'Paste your license key here ')}
              name="licenseKey"
              error={!!error.licenseKey}
              style={{ height: '7rem' }}
            />

            {error.licenseKey && <p style={{ color: "red", margin: '0px' }}>{t(error.licenseKey)}</p>}

            <div className="d-flex justify-content-end mt-2">
              <AppButton>{t('login.apply', 'Apply')}</AppButton>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>

  );
};

export default LicensePage;


