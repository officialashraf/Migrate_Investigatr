import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from 'react-toastify';
import CommonTextInput from "../../Common/MultiSelect/CommonTextInput";
import CommonTextArea from "../../Common/MultiSelect/CommonText";
import CommonMultiSelect from "../../Common/MultiSelect/CommonMultiSelect";
import CommonSingleSelect from "../../Common/MultiSelect/CommonSingleSelect";
import customSelectStyles from '../../Common/CustomStyleSelect/customSelectStyles';
import AppButton from "../../Common/Buttton/button";
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const EditCase = ({ togglePopup, item }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: item.title || "",
    description: item.description || "",
    status: item.status || "",
    watchers: [],
    assignee: item.assignee || "",
    comment: item.comment || "",
  });

  const [users, setUsers] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);

  const options = users.data?.map(user => ({
    value: user.id,
    label: user.username
  })) || [];

  const statusOptions = [
    { value: "on hold", label: t('edit_case.status_on_hold') },
    { value: "closed", label: t('edit_case.status_closed') }
  ];

  const getUserData = async () => {
    const token = Cookies.get("accessToken");
    try {
      setLoading(true);
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(t('edit_case.user_fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  // Convert watchers (IDs/usernames) to IDs after users list fetched
  useEffect(() => {
    if (users.data?.length > 0) {
      const convertToIds = (watchers) => {
        return Array.isArray(watchers)
          ? watchers.map(watcher => {
            if (users.data.find(u => u.id === watcher)) return watcher;
            const match = users.data.find(u => u.username === watcher);
            return match ? match.id : watcher;
          })
          : [];
      };

      const convertedWatchers = convertToIds(item.watchers);

      setFormData(prev => ({
        ...prev,
        watchers: convertedWatchers
      }));

      setInitialFormData({
        title: item.title || "",
        description: item.description || "",
        status: item.status || "",
        watchers: convertedWatchers,
        assignee: item.assignee || "",
        comment: item.comment || "",
      });
    }
  }, [users.data, item]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = t('edit_case.title_required');
    return errors;
  };

  const handleEditCase = async () => {
    const token = Cookies.get("accessToken");
    if (!token) {
      toast.error(t('edit_case.token_missing'));
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    const hasChanged = {};
    ["title", "description", "status", "assignee", "comment"].forEach(key => {
      if (formData[key] !== item[key]) {
        hasChanged[key] = formData[key];
      }
    });

    const originalWatchers = Array.isArray(item.watchers)
      ? item.watchers.map(watcher => {
        if (typeof watcher === 'number') return watcher; // Already an ID
        const user = users.data.find(u => u.username === watcher);
        return user ? user.id : watcher;
      })
      : [];

    const areWatchersDifferent = JSON.stringify([...formData.watchers].sort()) !== JSON.stringify([...originalWatchers].sort());

    if (areWatchersDifferent) {
      hasChanged.watchers = formData.watchers.length > 0 ? [...formData.watchers] : [];
    }

    if (Object.keys(hasChanged).length === 0) {
      togglePopup();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        ` ${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case/${item.id}`,
        hasChanged,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success(t('edit_case.success'));
        window.dispatchEvent(new Event("databaseUpdated"));
        togglePopup();
      }
    } catch (err) {
      console.error("Error updating case:", err);
      toast.error(err.response?.data?.detail || t('edit_case.update_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'title') formattedValue = value.replace(/\b\w/g, char => char.toUpperCase());
    if (name === 'description') formattedValue = value.charAt(0).toUpperCase() + value.slice(1);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    setError(prevErrors => ({ ...prevErrors, [name]: "" }));
  };

  const handleWatchersChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      watchers: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
    }));
  };

  const handleAssigneeChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      assignee: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleStatusChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      status: selectedOption ? selectedOption.value : "",
    }));
  };

  useEffect(() => {
    const isSame =
      formData.title === initialFormData.title &&
      formData.description === initialFormData.description &&
      formData.status === initialFormData.status &&
      formData.assignee === initialFormData.assignee &&
      formData.comment === initialFormData.comment &&
      JSON.stringify([...formData.watchers].sort()) === JSON.stringify([...initialFormData.watchers || []].sort());

    setIsBtnDisabled(isSame);
  }, [formData, initialFormData]);

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-container">
          <div className="popup-content">{t('edit_case.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-icon" onClick={togglePopup}>&times;</button>
        <div className="popup-content">
          <h5>{t('edit_case.heading')}</h5>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditCase();
          }}>
            <CommonTextInput label={t('edit_case.title')} name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" />
            {error.title && <p style={{ color: "red" }}>{error.title}</p>}

            <CommonTextArea label={t('edit_case.description')} name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" />


            <CommonSingleSelect
              label={t('edit_case.assignee')}
              options={options}
              value={options.find(opt => opt.value === formData.assignee) || null}
              onChange={handleAssigneeChange}
              customStyles={customSelectStyles}

              placeholder="Select Assignee"
            />

            <CommonMultiSelect
              label={t('edit_case.watchers')}
              options={options}
              isMulti
              value={formData.watchers.map(wId => {
                const match = options.find(opt => opt.value === wId);
                return match || { value: wId, label: `User ${wId} ` };
              })}
              onChange={handleWatchersChange}
              customStyles={customSelectStyles}
              placeholder="Select Watchers"
            />

             <CommonSingleSelect
              label={t('edit_case.status')}
              options={statusOptions}
              value={statusOptions.find(opt => opt.value === formData.status) || null}
              onChange={handleStatusChange}
              customStyles={customSelectStyles}
              className="com"
              placeholder="Select Status"
            />

            <CommonTextInput label={t('edit_case.comment')} name="comment" value={formData.comment} onChange={handleInputChange} placeholder="Comment" />

            <div className="button-container">
              <AppButton type="submit" className="create-btn" disabled={isBtnDisabled || isSubmitting}>
                {isSubmitting ? t('edit_case.editing') : t('edit_case.edit')}
              </AppButton>
              <AppButton type="button" className="cancel-btn" onClick={togglePopup}>{t('edit_case.cancel')}</AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
EditCase.propTypes = {
  togglePopup: PropTypes.func.isRequired,
  item: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    assignee: PropTypes.string,
    comment: PropTypes.string,
    watchers: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string,
          PropTypes.shape({
            id: PropTypes.number,
            username: PropTypes.string
          })
        ])
      ),
      PropTypes.array,
    ]),
  }).isRequired,
};

export default EditCase;

