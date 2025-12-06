import { useEffect, useState } from "react";
import "./addUser.module.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import CommonTextInput from "../../Common/MultiSelect/CommonTextInput";
import CommonSingleSelect from "../../Common/MultiSelect/CommonSingleSelect";
import customSelectStyles from '../../Common/CustomStyleSelect/customSelectStyles';
import AppButton from "../../Common/Buttton/button";
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const EditUser = ({ togglePopup, item }) => {
  const token = Cookies.get("accessToken");
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [, setUsers] = useState({ data: [] });
  const [loading, setLoading] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    firstName: item.first_name || "",
    lastName: item.last_name || "",
    username: item.username || "",
    email: item.email || "",
    contactNumber: item.contact_no || "",
    role: item.role || "",
    status: item.status || "",
  });

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];
  console.log("formDate", formData)

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formData.username.trim()) {
      errors.username = t('edit_user.username_required');
    }

    if (!formData.email.trim()) {
      errors.email = t('edit_user.email_required');
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t('edit_user.invalid_email');
    }

    return errors;
  };


  const getUserData = async () => {
    try {
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(t('edit_user.user_fetch_error'));

    }
  };
  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/roles`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        console.log("response_Data", response.data)
        // Map roles into dropdown format
        const formattedRoles = response.data.map(role => ({
          value: role,
          label: role
        }));
        console.log("response_Dropdown", formattedRoles)
        setRoles(formattedRoles);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setLoading(false);
      }
    };
    fetchRoles();
  }, [token]);
  const handleEditUser = async (formData) => {
    const token = Cookies.get("accessToken");
    if (!token) {
      toast.error(t('edit_user.token_missing'));
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
    setLoading(true);
    try {
      const getChanges = (fieldsMap) =>
        Object.fromEntries(
          Object.entries(fieldsMap)
            .filter(([key, value]) => value !== undefined && value !== item[key])
        );

      const fieldMapping = {
        first_name: payloadData.firstName,
        last_name: payloadData.lastName,
        username: payloadData.username,
        email: payloadData.email,
        contact_no: payloadData.contactNumber,
        role: payloadData.role,
        status: payloadData.status
      };

      const hasChanged = getChanges(fieldMapping);
      // If nothing has changed 
      if (Object.keys(hasChanged).length === 0) {
        toast.info(t('edit_user.no_changes'));
        setLoading(false);
        return;
      }

      console.log("Data to be sent:", hasChanged); // Debugging line
      const response = await axios.put(
        `${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user/${item.id}`,
        hasChanged,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        },
      ); console.log("respose", response.data)
      if (response.status === 200) {
        toast.success(t('edit_user.success'));
        window.dispatchEvent(new Event("databaseUpdated"));
        togglePopup();
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.detail || t('edit_user.update_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Fields to apply capitalization
    const capitalizeFields = ['firstName', 'lastName', 'role'];

    // Capitalize first letter of each word if the field is in the list
    const formattedValue = capitalizeFields.includes(name)
      ? value.replace(/\b\w/g, (char) => char.toUpperCase())
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    setError((prevErrors) => ({
      ...prevErrors,
      [name]: ""  // Remove the specific error message
    }));
  };

  useEffect(() => {
    setInitialFormData({
      firstName: item.first_name || "",
      lastName: item.last_name || "",
      username: item.username || "",
      email: item.email || "",
      contactNumber: item.contact_no || "",
      role: item.role || "",
      status: item.status || "",
    });
  }, [item]);

  useEffect(() => {
    const isSame =
      formData.firstName === initialFormData.firstName &&
      formData.lastName === initialFormData.lastName &&
      formData.username === initialFormData.username &&
      formData.email === initialFormData.email &&
      formData.contactNumber === initialFormData.contactNumber &&
      formData.role === initialFormData.role &&
      formData.status === initialFormData.status;

    setIsBtnDisabled(isSame);
  }, [formData, initialFormData]);



  return (
    <div className="popup-overlay">
      <div className="popup-container" style={{ overflow: "hidden"}}>
        <button className="close-icon" onClick={togglePopup}>
          &times;
        </button>
        <div className="popup-content">
          <h5>{t('edit_user.heading')}</h5>
          <form onSubmit={(e) => { e.preventDefault(); handleEditUser(formData); }}>
            <CommonTextInput label={t('edit_user.username')}
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {error.username && <p style={{ color: "red", margin: '0px' }} >{error.username}</p>}
            <CommonTextInput label={t('edit_user.first_name')}
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />

            <CommonTextInput label={t('edit_user.last_name')}
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <div>
              <CommonSingleSelect
                label={t('edit_user.role')}
                options={roles}
                placeholder={t('edit_user.role_placeholder')}
                isLoading={loading}
                value={roles.find(role => role.value === formData.role)}
                onChange={(selectedOption) => setFormData({ ...formData, role: selectedOption.value })}
                customStyles={customSelectStyles}
              />
            </div>
            <div>
              <CommonSingleSelect
                label={t('Status *')}
                options={statusOptions}
                placeholder={t('Select Option')}
                isLoading={loading}
                value={statusOptions.find(option => option.value === formData.status)}
                onChange={(selectedOption) => setFormData({ ...formData, status: selectedOption.value })}
                customStyles={customSelectStyles}
              />
            </div>
            <CommonTextInput label={t('edit_user.email')}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {error.email && <p style={{ color: "red", margin: '0px' }}>{error.email}</p>}


            <CommonTextInput label={t('edit_user.contact_number')}
              type="text"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
            />

            <div className="button-container">
              <AppButton type="submit" className="create-btn" disabled={isBtnDisabled || loading}>
                {loading ? t('edit_user.editing') : t('edit_user.edit')}
              </AppButton>
              <AppButton type="button" onClick={togglePopup} className="cancel-btn">{t('edit_user.cancel')}</AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
EditUser.propTypes = {
  togglePopup: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    contact_no: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};
export default EditUser;
