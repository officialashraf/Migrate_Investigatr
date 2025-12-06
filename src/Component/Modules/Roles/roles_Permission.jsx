import "../Case/tableGlobal.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import AddRole from "./addRole";
import DetailsPermission from "./details_Permission";
import AssignRole from "./asignRole";
import EditRole from "./editRole";
import Loader from "../Layout/loader";
import TableModal from "../../Common/Table/table";
import AppButton from "../../Common/Buttton/button";

const RolesPermission = () => {

    const [data, setData] = useState([]);
    const [, setFilteredData] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupB, setShowPopupB] = useState(false);
    const [showPopupC, setShowPopupC] = useState(false);
    const [showPopupD, setShowPopupD] = useState(false);
    const [loading, setLoading] = useState(false);
    const [popupDetails, setPopupDetails] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const togglePopup = () => {
        setShowPopup(prev => !prev);
    };
    const toggleDetailsPopup = (roleId) => {
        setSelectedRoleId(roleId);
        setShowPopupB(prev => !prev);
    };

    const togglePopupC = (details) => {
        setPopupDetails(details);
        setShowPopupC(prev => !prev);
    };
    const togglePopupD = (details) => {
        setPopupDetails(details);
        setShowPopupD(prev => !prev);
    };

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("accessToken");
            const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/role`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            console.log("resposne from roles", response)
            setData(response.data);
            console.log("data from roles", response)
            setFilteredData(response.data);
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

        fetchRoles();

        const handleDatabaseUpdated = () => {
            fetchRoles();
        };

        window.addEventListener("databaseUpdated", handleDatabaseUpdated);
        return () => {
            window.removeEventListener("databaseUpdated", handleDatabaseUpdated);
        };
    }, []);

    const confirmDelete = (role) => {
        toast((t) => (
            <div>
                <p>Are you sure you want to delete {role} role?</p>
                <button className='custom-confirm-button' onClick={() => { deleteRole(role); toast.dismiss(t.role); }} style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }}>Yes</button>
                <button className='custom-confirm-button' onClick={() => toast.dismiss(t.role)} style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }} >No</button> </div>),
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
    const deleteRole = async (role) => {
        const token = Cookies.get("accessToken");
        if (!token) {
            console.error("No token found in cookies.");
            return;
        }
        try {

            const response = await axios.delete(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/role/${role}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            window.dispatchEvent(new Event("databaseUpdated"));
            toast.success(`Role ${role} deleted successfully`)
            console.log("Role Deleted:", response.data);


        } catch (err) {
            // Error handling based on the type of error
            console.error('Error during login:', err);

            if (err.response) {

                toast.error(err.response?.data?.detail || 'Something went wrong. Please try again');

            } else if (err.request) {
                // No response from the server
                toast.error('No response from the server. Please check your connection');
            } else {
                // Unknown error occurred
                toast.error('An unknown error occurred. Please try again');
            }
        }
    };

    if (loading) {
        return <Loader />
    }
    const roleColumns = [
        { key: "id", label: "Role ID" },
        { key: "role", label: "Roles" },
        { key: "created_on", label: "Created On" },
        { key: "created_by", label: "Created By" },
        // { key: "modified_on", label: "Edited On" },
        // { key: "modified_by", label: "Edited By" },
    ];

    return (
        <>
            {data && data.length > 0 ? (
                <div>
                    <TableModal
                        title="Role Dashboard"
                        searchPlaceholder="Search role"
                        data={data}
                        columns={roleColumns}
                        onRowAction={{
                            details: (row) => toggleDetailsPopup(row.id),
                            delete: (row) => confirmDelete(row.role),
                            edit: (row) => togglePopupC(row.role),
                            assign: (row) => togglePopupD(row)
                        }}
                        onAddClick={() => togglePopup()}
                        idPrefix="ROLE"
                        btnTitle=" + Add New Role"
                    />
                </div>


            ) : (
                <div className="resourcesContainer" style={{ border: 'none' }}>
                    <h3 className="title">Let's Get Started!</h3>
                    <p className="content">Add roles to get started</p>
                    <AppButton onClick={togglePopup}> + Add New Role</AppButton>
                </div>
            )
            }
            {showPopup && <AddRole togglePopup={togglePopup} />}
            {showPopupB && <DetailsPermission roleId={selectedRoleId} toggleDetails={toggleDetailsPopup} />}
            {showPopupC && <EditRole togglePopup={togglePopupC} details={popupDetails} />}
            {showPopupD && <AssignRole togglePopup={togglePopupD} details={popupDetails} />}
        </>
    );
};

export default RolesPermission;