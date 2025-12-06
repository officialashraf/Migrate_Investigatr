import { useEffect, useState } from "react";
import "./addUser.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from 'react-toastify';
import CommonTextInput from "../../Common/MultiSelect/CommonTextInput";
import CommonSingleSelect from "../../Common/MultiSelect/CommonSingleSelect";
import customSelectStyles from '../../Common/CustomStyleSelect/customSelectStyles';
import AppButton from "../../Common/Buttton/button";
import { useTranslation } from "react-i18next";
import { useAutoFocusWithManualAutofill } from "../../../utils/autoFocus";
import PropTypes from 'prop-types';

const AddUser = ({ onClose }) => {
  const { t } = useTranslation();
  const token = Cookies.get("accessToken");
  const { inputRef, isReadOnly, handleFocus } = useAutoFocusWithManualAutofill();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    role: "",
    email: "",
    contact_no: "",
    password: ""
  });

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (!formData.username.trim()) {
      errors.username = t("addUser.errors.username");
    }

    if (!formData.first_name.trim()) {
      errors.first_name = t("addUser.errors.firstName");
    }

    if (!formData.role.trim()) {
      errors.role = t("addUser.errors.role");
    }

    if (!formData.email.trim()) {
      errors.email = t("addUser.errors.email");
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t("addUser.errors.invalidEmail");
    }

    if (!formData.password.trim()) {
      errors.password = t("addUser.errors.password");
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = t("addUser.errors.invalidPassword");
    }

    return errors;
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/roles`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const formattedRoles = response.data.map(role => ({
          value: role,
          label: role
        }));
        setRoles(formattedRoles);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setLoading(false);
      }
    };

    fetchRoles();
  }, [token]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    const capitalizeFields = ['first_name', 'last_name', 'role'];

    if (name === 'username') {
      value = value.toLowerCase().replace(/\s/g, '');
    } else if (capitalizeFields.includes(name)) {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    setError((prevErrors) => ({
      ...prevErrors,
      [name]: ""
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("addUser.errors.authTokenMissing"));
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    const payloadData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) =>
        value !== null &&
        value !== undefined &&
        !(typeof value === "string" && value.trim() === "") &&
        !(Array.isArray(value) && value.length === 0)
      )
    );
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user`,
        payloadData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success(t("addUser.errors.userAddSuccess"));
        window.dispatchEvent(new Event("databaseUpdated"));
        onClose();
      } else {
        toast.error(t("addUser.errors.userAddFailed"));
      }
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error(err.response?.data?.detail || t("addUser.errors.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-icon" onClick={onClose}>&times;</button>
        <div className="popup-content">
          <h5>{t("addUser.title")}</h5>
          <form onSubmit={handleCreateUser}>
            <div>
            <CommonTextInput
              label={t("addUser.username")}
              ref={inputRef}
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t("addUser.usernamePlaceholder")}
              readOnly={isReadOnly}
              onFocus={handleFocus}
              requiblack
            />
            <div>
          {error.username && (
          <p
            style={{
              color: "red",
              marginTop: "2px",
              marginBottom: "0px",
              fontSize: "12px",
              lineHeight: "0.1",
            }}
          >
            {error.username}
          </p>
        )}
          </div>
          </div>

          <div>
            <CommonTextInput
              label={t("addUser.firstName")}
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder={t("addUser.firstNamePlaceholder")}
            />
               {error.first_name && (
                <p
                  style={{
                    color: "red",
                    marginTop: "2px",
                    marginBottom: "0px",
                    fontSize: "12px",
                    lineHeight: "0.1",
                  }}
                >
                  {error.first_name}
                </p>
              )}
          </div>

            <div>
            <CommonTextInput
              label={t("addUser.lastName")}
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder={t("addUser.lastNamePlaceholder")}
            />
            {error.last_name && (
            <p
              style={{
                color: "red",
                marginTop: "2px",
                marginBottom: "0px",
                fontSize: "12px",
                lineHeight: "0.1",
              }}
            >
              {error.last_name}
              </p>
             )}
            </div>
    
            <CommonSingleSelect
              label={t("addUser.role")}
              options={roles}
              placeholder={t("addUser.rolePlaceholder")}
              isLoading={loading}
              value={roles.find(role => role.value === formData.role)}
              onChange={(selectedOption) => setFormData({ ...formData, role: selectedOption.value })}
              customStyles={customSelectStyles}
            />      
            {error.role && (
            <p
              style={{
                color: "red",
                marginTop: "2px",
                marginBottom: "0px",
                fontSize: "12px",
                lineHeight: "0.1",
              }}
            >
              {error.role}
              </p>
             )}
            <div>
            <CommonTextInput
              label={t("addUser.email")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("addUser.emailPlaceholder")}
              requiblack
            />
            {error.email && (
          <p
            style={{
              color: "red",
              marginTop: "2px",
              marginBottom: "0px",
              fontSize: "12px",
              lineHeight: "0.1",
            }}
          >
            {error.email}
          </p>
        )}
          </div>

          <div>
            <CommonTextInput
              label={t("addUser.contact")}
              name="contact_no"
              value={formData.contact_no}
              onChange={handleChange}
              placeholder={t("addUser.contactPlaceholder")}
            />
               {error.contact_no && (
              <p
                style={{
                  color: "red",
                  marginTop: "2px",
                  marginBottom: "0px",
                  fontSize: "12px",
                  lineHeight: "0.1",
                }}
              >
                {error.contact_no}
              </p>
              )}
          </div>

           <div>
            <CommonTextInput
              label={t("addUser.password")}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("addUser.passwordPlaceholder")}
              requiblack
            />

               {error.password && (
                <p
                  style={{
                    color: "red",
                    marginTop: "2px",
                    marginBottom: "0px",
                    fontSize: "12px",
                    lineHeight: "0.1",
                  }}
                >
                  {error.password}
                </p>
              )}
          </div>
          
            <div className="button-container">
              <AppButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("addUser.creating") : t("addUser.create")}
              </AppButton>
              <AppButton type="button" onClick={onClose}>
                {t("addUser.cancel")}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
AddUser.propTypes = {
  onClose: PropTypes.func.isRequired,
};  
export default AddUser;
