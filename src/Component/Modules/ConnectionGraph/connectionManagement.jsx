import "../Case/tableGlobal.css"
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from "../Layout/loader.jsx"
import { toast } from 'react-toastify';
import CreateConnection from './CreateConnection.jsx';
import EditConnection from './EditConnection.jsx';
import ConnectionDetails from './ConnectionDetails.jsx';
import TableModal from '../../Common/Table/table.jsx';
import AppButton from '../../Common/Buttton/button.jsx';

const ConnectionManagement = () => {
  const token = Cookies.get("accessToken");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupE, setShowPopupE] = useState(false);
  const [showPopupD, setShowPopupD] = useState(false);
  const [details, setDetails] = useState([])

  const fetchConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/connection`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": 'application/json'
        },

      });
      console.log("API Response:", response);
      setData(response.data);
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
  console.log("serrr", filteredData)
  useEffect(() => {
    const tri = fetchConnection();
    console.log("okk", tri)
    const handleDatabaseUpdated = () => {
      fetchConnection();
    };

    window.addEventListener("databaseUpdated", handleDatabaseUpdated);
    return () => {
      window.removeEventListener("databaseUpdated", handleDatabaseUpdated);
    };
  }, [])



  const togglePopup = () => {
    setShowPopup((prev) => !prev);
  };

  const togglePopupE = (details) => {
    setDetails(details);
    setShowPopupE(prev => !prev);
  };

  const togglePopupD = (details) => {
    setDetails(details);
    setShowPopupD(prev => !prev);
  };

  const confirmDelete = (id, name) => {
    toast((t) => (
      <div>
        <p>Are you sure you want to delete {name} connection?</p>
        <button className='custom-confirm-button' onClick={() => { deleteConnection(id, name); toast.dismiss(t.id); }} style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }}>Yes</button>
        <button className='custom-confirm-button' onClick={() => toast.dismiss(t.id)} style={{ padding: "4px 1px", fontSize: "12px", width: "20%" }} >No</button> </div>),
      {
        autoClose: false, closeOnClick: false, draggable: false, style: {
          position: 'fixed',
          top: '300px',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          zIndex: 9999,
          background: '#101D2B',
          color: '#d2d2d2'
        }
      },)
  };

  const deleteConnection = async (id, name) => {
    const token = Cookies.get("accessToken");
    if (!token) {
      console.error("No token found in cookies.");
      return;
    }
    try {

      const response = await axios.delete(`${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/connection/${id}`,

        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      toast.success(`Connection ${name} deleted successfully`)
      console.log("Connection deleted:", response.data);

      fetchConnection(); 

    } catch (err) {
      console.error('Error during deleteConnection:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        toast.error(err.response?.data?.detail || 'Something went wrong. Please try again');
      } else if (err.request) {
        toast.error('No response from the server. Please check your connection');
      } else {
        toast.error('An unknown error occurred. Please try again');
      }
    }
  };

  if (loading) {
    return <Loader />
  }

  const connectionColumns = [
    { key: "id", label: "Connection ID" },
    { key: "name", label: "Connection Name" },
    { key: "connection_type", label: "Connection Type" },
    { key: "created_by", label: "Created By" },
    { key: "created_on", label: "Created On" },
    { key: "modified_on", label: "Edited On" },
    { key: "modified_by", label: "Edited By" },
  {
      key: "status",
      //  label: t("status"),
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
      {data && data.length > 0 ? (
      
          <div>
       
            <TableModal
            title="Connection Dashboard"
            searchPlaceholder="Search connection"
              columns={connectionColumns}
              data={filteredData}
              idPrefix="CON"
              btnTitle="+ Add New Connection"
              onRowAction={{
                edit: (row) => togglePopupE(row),
                delete: (row) => confirmDelete(row.id, row.name),
                details: (row) => togglePopupD(row),
              }}
              enableRowClick={false}
          
          onAddClick={() => togglePopup()}
            />
          </div>
 

      ) : (
        <div className="resourcesContainer"  style={{ border: 'none' }}>
          <h3 className="title">Let's Get Started!</h3>
          <p className="content">Add connections to get started</p>
            <AppButton onClick={togglePopup}>
              + Add New Connection
            </AppButton>
        </div>
      )}
      {showPopup && <CreateConnection togglePopup={togglePopup} />}
      {showPopupE && <EditConnection togglePopup={togglePopupE} id={details.id} />}
      {showPopupD && <ConnectionDetails togglePopup={togglePopupD} id={details.id} />}

    </>
  );
};

export default ConnectionManagement;
