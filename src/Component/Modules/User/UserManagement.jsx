import "../Case/tableGlobal.css";
import AddUser from "./addUser";
import EditUser from "./editUser";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import UserDetails from "./userDetails";
import Loader from "../Layout/loader";
import ResetPassword from "./resetPassword";
import TableModal from "../../Common/Table/table";
import AppButton from "../../Common/Buttton/button";
import { useTranslation } from 'react-i18next';

const UserManagement = () => {
  const [data, setData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
  const togglePopup = () => setShowAddForm(!showAddForm);
  const toggleDetails = (item) => {
    console.log("Selected item for details:", item);
    setSelectedUser(item.id);
    setShowDetail((prev) => !prev);
  };

  const toggleEditForm = (item) => {
    setSelectedUser(item);
    setShowEditForm((prev) => !prev);
  };

  const toggleResetForm = (item) => {
    setSelectedUser(item);
    setShowResetForm((prev) => !prev);
  };
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("accessToken");
      const response = await axios.get((`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": 'application/json'
        },

      });

      console.log("API Response:", response);
      setData(response.data.data);
    } catch (error) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        console.error("An error occurred:", error.message);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const handleDatabaseUpdated = () => {
      fetchUsers();
    };

    window.addEventListener("databaseUpdated", handleDatabaseUpdated);

    return () => {
      window.removeEventListener("databaseUpdated", handleDatabaseUpdated);
    };
  }, []);

  const confirmDelete = (id, name) => {
    toast((toastInstance) => (
      <div>
        <p>{t('user.confirm_delete', { name })}</p>
        <button className='custom-confirm-button' onClick={() => { deleteUser(id, name); toast.dismiss(toastInstance.id); }} style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }}>Yes</button>
        <button className='custom-confirm-button' onClick={() => toast.dismiss(toastInstance.id)} style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }} >No</button> </div>),
      {
        autoClose: false, closeOnClick: false, draggable: false, style: {
          position: 'fixed',
          top: '300px',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          zIndex: 9999,
          background: '#101D2B',
          color: "#d2d2d2"
        }
      },)
  };

  const deleteUser = async (id, name) => {
    const token = Cookies.get("accessToken");
    if (!token) {
      console.error("No token found in cookies.");
      return;
    }
    try {

      const response = await axios.delete(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      window.dispatchEvent(new Event("databaseUpdated"));
      toast.success(t('user.deleted_success', { name }));
      console.log("User Deleted:", response.data);

    } catch (err) {
      console.error('Error during login:', err);

      if (err.response) {

        toast.error(err.response?.data?.detail || t('user.error_generic'));

      } else if (err.request) {
        toast.error(t('user.no_response'));
      } else {
        toast.error(t('user.unknown_error'));
      }
    }
  };

  const getUserData = async () => {
    const token = Cookies.get("accessToken");
    try {
      await axios.get((`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user`)
        , {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

    } catch (error) {
      console.error('There was an error usering the data!', error);
    }
  };
  useEffect(() => {
    getUserData();
  }, []);

  if (loading) {
    return <Loader />
  }

  const userColumns = [
    { key: "id", label: t("user.columns.id") },
    { key: "username", label: t("user.columns.username") },
    { key: "first_name", label: t("user.columns.first_name") },
    { key: "last_name", label: t("user.columns.last_name") },
    { key: "role", label: t("user.columns.role") },
    { key: "email", label: t("user.columns.email") },
    { key: "last_logout", label: t("user.columns.last_active") },
    { key: "createdOn", label: t("user.columns.created_on") },
    { key: "createdBy", label: t("user.columns.created_by") },
    { key: "updatedOn", label: t("user.columns.edited_on") },
    { key: "updatedBy", label: t("user.columns.edited_by") },
     {
      key: "status", label: t("status"),
      render: (val) => (
        <span
          style={{
            backgroundColor: "#FFC107",
            color: "#000",
            padding: "2px 6px",
            borderRadius: "12px",
            fontSize: "11px",
            whiteSpace: "nowrap",
          }}
        >
          {val}
        </span>
      )
    }
  ];
 

  return (
    <>
      {data && data.length > 0 ?
        (

          <div>

            <TableModal
              title={t('user.dashboard_title')}
              searchPlaceholder="Search user"
              data={data}
              columns={userColumns}
              onRowAction={{
                edit: (row) => toggleEditForm(row),
                delete: (row) => confirmDelete(row.id, row.username),
                details: (row) => toggleDetails(row),
                reset: (row) => toggleResetForm(row)
              }}

              onAddClick={() => togglePopup()}
              idPrefix="User"
              btnTitle={t('user.add_button')}
            />
          </div>
        ) : (
          <div className="resourcesContainer" style={{ border: 'none' }}>
            <h3 className="title">{t('user.get_started_title')}</h3>
            <p className="content">{t('user.get_started_text')}</p>
            <AppButton onClick={togglePopup}>{t('user.add_button')}</AppButton>
          </div>
        )
      }
      {showResetForm && <ResetPassword onClose={toggleResetForm} item={selectedUser} />}
      {showAddForm && <AddUser onClose={togglePopup} />}
      {showDetail && <UserDetails userId={selectedUser} toggleDetails={toggleDetails} />}
      {showEditForm &&
        <EditUser
          togglePopup={toggleEditForm}
          item={selectedUser}
        />}
    </>
  );
};

export default UserManagement;
