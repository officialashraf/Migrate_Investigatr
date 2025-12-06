import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import CommonTextInput from "../../Common/MultiSelect/CommonTextInput";
import CommonSingleSelect from "../../Common/MultiSelect/CommonSingleSelect";
import AppButton from "../../Common/Buttton/button";
import customSelectStyles from '../../Common/CustomStyleSelect/customSelectStyles';
import PropTypes from 'prop-types';

const CreateConnection = ({ togglePopup, id }) => {
    const token = Cookies.get("accessToken");
    const [connectionTypes, setConnectionTypes] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        connection_type: "",
        connection_info: {
            host: "",
            port: "",
            path: "",
            username: "",
            password: ""
        }
    });
    const [error, setError] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [testConnectionResponse, setTestConnectionResponse] = useState("");

    useEffect(() => {
        const fetchConnectionTypes = async () => {
            try {
                const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/connection-type`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log("Fetched connection types:", response.data);
                const formattedConnectionTypes = (response.data || []).map(type => ({
                    value: type.name,
                    label: type.name
                }));
                console.log("Formatted:", formattedConnectionTypes);
                setConnectionTypes(formattedConnectionTypes);
            } catch (err) {
                console.error("Error fetching connection types:", err);
                toast.error("Could not fetch connection types");
            }
        };

        fetchConnectionTypes();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (["host", "port", "username", "password", "path"].includes(name)) {
            setFormData(prev => ({
                ...prev,
                connection_info: {
                    ...prev.connection_info,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setError(prev => ({ ...prev, [name]: "" }));
        // Clear test response when connection details change
        setTestConnectionResponse("");
    };

    const validateForm = () => {
        const errors = {};
        const ci = formData.connection_info;

        if (!formData.name.trim()) errors.name = "Name is Required";
        if (!formData.connection_type) errors.connection_type = "Type is Required";
        if (!ci.host.trim()) errors.host = "Host is Required";
        if (!ci.port) errors.port = "Port is Required";
        if (!ci.path.trim()) errors.path = "Path is Required";
        if (!ci.username.trim()) errors.username = "Username is Required";
        if (!ci.password.trim()) errors.password = "Paasword is Required";// NOSONAR

        return errors;
    };

    const handleTestConnection = async () => {
        const ci = formData.connection_info;
        
        // Basic validation for test connection
        if (!ci.host.trim() || !ci.port || !ci.username.trim() || !ci.password.trim()) {
            toast.error("Please fill in Host, Port, Username, and Password to test connection");
            return;
        }

        setIsTestingConnection(true);
        setTestConnectionResponse("");

        try {
            const response = await axios.post(
                `${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/res-man/v1/ping`,
                {
                    host: ci.host,
                    port: parseInt(ci.port),
                    username: ci.username,
                    password: ci.password
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Show success response
            setTestConnectionResponse(`${response.data || 'Connected successfully'}`);
            toast.success("Connection test successful!");
            
        } catch (err) {
            console.error("Test connection error:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.message || "Connection failed";
            setTestConnectionResponse(`${errorMessage}`);
            toast.error("Connection test failed");
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Missing auth token");

        const errs = validateForm();
        if (Object.keys(errs).length) return setError(errs);

        setIsSubmitting(true);

        try {
            const res = await axios.post(
                `${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/connection`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.status === 200 || res.status === 201) {
                toast.success("Connection saved");
                window.dispatchEvent(new Event("databaseUpdated"));
                togglePopup();
            } else {
                toast.error("Failed to create connection");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <button className="close-icon" onClick={togglePopup}>&times;</button>
                <div className="popup-content">
                    <h5>Create Connection</h5>
                    <form onSubmit={handleSubmit}>
                        <div>

                        <CommonTextInput
                            label="Connection Name *"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter connection name"

                        />
                         {error.name && (
                        <p
                            style={{
                            color: "red",
                            marginTop: "2px",
                            marginBottom: "0px",
                            fontSize: "12px",
                            lineHeight: "0.1",
                            }}
                        >
                            {error.name}
                        </p>
                        )}
                        </div>
                     <div className='mt-3'>
                           <CommonSingleSelect
                            label="Connection Type *"
                            name="connection_type"
                            value={connectionTypes.find(type => type.value === formData.connection_type) || null}
                            onChange={(selectedOption) => {
                                setFormData(prev => ({ ...prev, connection_type: selectedOption ? selectedOption.value : "" }));
                                setError(prev => ({ ...prev, connection_type: "" }));
                            }}
                            options={connectionTypes}
                            customStyles={customSelectStyles}
                            placeholder="Select connection type"
                        />
                        {error.connection_type && (
                        <p
                            style={{
                            color: "red",
                            marginTop: "2px",
                            marginBottom: "0px",
                            fontSize: "12px",
                            lineHeight: "0.1",
                            }}
                        >
                            {error.connection_type}
                        </p>
                        )}
                     </div>
                     <div>

                        <CommonTextInput
                            label="Host *"
                            name="host"
                            value={formData.connection_info.host}
                            onChange={handleChange}
                            placeholder="Enter host"
                            className="com"
                        />
                         {error.host && (
                        <p
                            style={{
                            color: "red",
                            marginTop: "2px",
                            marginBottom: "0px",
                            fontSize: "12px",
                            lineHeight: "0.1",
                            }}
                        >
                            {error.host}
                        </p>
                        )}
                     </div>
                        {/* {error.host && <p style={{ color: 'red' }}>{error.host}</p>} */}

                        <div>

                        <CommonTextInput
                            label="Port *"
                            name="port"
                            value={formData.connection_info.port}
                            type="number"
                            onChange={handleChange}
                            placeholder="Enter port"
                            className="com"
                        />
                        {error.port && (
                        <p
                            style={{
                            color: "red",
                            marginTop: "2px",
                            marginBottom: "0px",
                            fontSize: "12px",
                            lineHeight: "0.1",
                            }}
                        >
                            {error.port}
                        </p>
                        )}
                        </div>
                        {/* {error.port && <p style={{ color: 'red' }}>{error.port}</p>} */}
                        <div>

                        <CommonTextInput
                            label="Path *"
                            name="path"
                            value={formData.connection_info.path}
                            onChange={handleChange}
                            placeholder="Enter path"
                            className="com"
                        />
                        {error.path && (
                        <p
                            style={{
                            color: "red",
                            marginTop: "2px",
                            marginBottom: "0px",
                            fontSize: "12px",
                            lineHeight: "0.1",
                            }}
                        >
                            {error.path}
                        </p>
                        )}
                        </div>
                        {/* {error.path && <p style={{ color: 'red' }}>{error.path}</p>} */}
                        <div>

                        <CommonTextInput
                            label="Username *"
                            name="username"
                            value={formData.connection_info.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            className="com"
                        />
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
                        {/* {error.username && <p style={{ color: 'red' }}>{error.username}</p>} */}
                            <div>

                        <CommonTextInput
                            label="Password *"
                            name="password"
                            value={formData.connection_info.password}
                            type="password"
                            onChange={handleChange}
                            placeholder="Enter password"
                            className="com"
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
                        {/* {error.password && <p style={{ color: 'red' }}>{error.password}</p>} */}

                        {/* Test Connection Button */}
                        <div className="test-connection-container" style={{ margin: '15px 0' }}>
                            
                            
                            {/* Display test response */}
                            {testConnectionResponse && (
                                <div 
                                // style={{ 
                                //     marginTop: '10px', 
                                //     padding: '8px', 
                                //     backgroundColor: testConnectionResponse.includes('✅') ? '#d4edda' : '#f8d7da',
                                //     border: `1px solid ${testConnectionResponse.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                                //     borderRadius: '4px',
                                //     fontSize: '14px'
                                // }}
                                style={{ color: 'red' }}
                                >
                                    {testConnectionResponse}
                                </div>
                            )}
                        </div>

                        <div className="button-container">
                            <AppButton type="submit" className="create-btn" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create"}
                            </AppButton>
                            <AppButton 
                                type="button" 
                                onClick={handleTestConnection}
                                disabled={isTestingConnection}
                             className="create-btn"        
                            >
                                {isTestingConnection ? "Testing..." : "Test Connection"}
                            </AppButton>
                            <AppButton type="button" onClick={togglePopup} className="cancel-btn">Cancel</AppButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

CreateConnection.propTypes = {
    togglePopup: PropTypes.func.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
export default CreateConnection;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import CommonTextInput from "../../Common/MultiSelect/CommonTextInput";
// import CommonSingleSelect from "../../Common/MultiSelect/CommonSingleSelect";
// import AppButton from "../../Common/Buttton/button";
// import customSelectStyles from '../../Common/CustomStyleSelect/customSelectStyles';
// import PropTypes from 'prop-types';

// const CreateConnection = ({ togglePopup, id }) => {
//     const token = Cookies.get("accessToken");
//     const [connectionTypes, setConnectionTypes] = useState([]);
//     const [formData, setFormData] = useState({
//         name: "",
//         connection_type: "",
//         connection_info: {
//             host: "",
//             port: "",
//             path: "",
//             username: "",
//             password: ""
//         }
//     });
//     const [error, setError] = useState({});
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     useEffect(() => {
//         const fetchConnectionTypes = async () => {
//             try {
//                 const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/connection-type`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );
//                 console.log("Fetched connection types:", response.data);
//                 const formattedConnectionTypes = (response.data || []).map(type => ({
//                     value: type.name,
//                     label: type.name
//                 }));
//                 console.log("Formatted:", formattedConnectionTypes);
//                 setConnectionTypes(formattedConnectionTypes);
//             } catch (err) {
//                 console.error("Error fetching connection types:", err);
//                 toast.error("Could not fetch connection types");
//             }
//         };

//         fetchConnectionTypes();
//     }, [token]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         if (["host", "port", "username", "password", "path"].includes(name)) {
//             setFormData(prev => ({
//                 ...prev,
//                 connection_info: {
//                     ...prev.connection_info,
//                     [name]: value
//                 }
//             }));
//         } else {
//             setFormData(prev => ({ ...prev, [name]: value }));
//         }
//         setError(prev => ({ ...prev, [name]: "" }));
//     };

//     const validateForm = () => {
//         const errors = {};
//         const ci = formData.connection_info;

//         if (!formData.name.trim()) errors.name = "Required";
//         if (!formData.connection_type) errors.connection_type = "Required";
//         if (!ci.host.trim()) errors.host = "Required";
//         if (!ci.port) errors.port = "Required";
//         if (!ci.path.trim()) errors.path = "Required";
//         if (!ci.username.trim()) errors.username = "Required";
//         if (!ci.password.trim()) errors.password = "Required";// NOSONAR

//         return errors;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!token) return toast.error("Missing auth token");

//         const errs = validateForm();
//         if (Object.keys(errs).length) return setError(errs);

//         setIsSubmitting(true);

//         try {
//             const res = await axios.post(
//                 `${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/connection`,
//                 formData,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             if (res.status === 200 || res.status === 201) {
//                 toast.success("Connection saved");
//                 window.dispatchEvent(new Event("databaseUpdated"));
//                 togglePopup();
//             } else {
//                 toast.error("Failed to create connection");
//             }
//         } catch (err) {
//             console.error(err);
//             toast.error(err.response?.data?.detail || "Something went wrong");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="popup-overlay">
//             <div className="popup-container">
//                 <button className="close-icon" onClick={togglePopup}>&times;</button>
//                 <div className="popup-content">
//                     <h5>Create Connection</h5>
//                     <form onSubmit={handleSubmit}>
//                         <CommonTextInput
//                             label="Connection Name *"
//                             name="name"
//                             value={formData.name}
//                             onChange={handleChange}
//                             placeholder="Enter connection name"

//                         />
//                         {error.name && <p style={{ color: 'red' }}>{error.name}</p>}
//                      <div className='mt-3'>
//                            <CommonSingleSelect
//                             label="Connection Type *"
//                             name="connection_type"
//                             value={connectionTypes.find(type => type.value === formData.connection_type) || null}
//                             onChange={(selectedOption) => {
//                                 setFormData(prev => ({ ...prev, connection_type: selectedOption ? selectedOption.value : "" }));
//                                 setError(prev => ({ ...prev, connection_type: "" }));
//                             }}
//                             options={connectionTypes}
//                             customStyles={customSelectStyles}
//                             placeholder="Select connection type"
//                         />

//                      </div>
//                         {error.connection_type && <p style={{ color: 'red' }}>{error.connection_type}</p>}
//                         <CommonTextInput
//                             label="Host *"
//                             name="host"
//                             value={formData.connection_info.host}
//                             onChange={handleChange}
//                             placeholder="Enter host"
//                             className="com"
//                         />
//                         {error.host && <p style={{ color: 'red' }}>{error.host}</p>}

//                         <CommonTextInput
//                             label="Port *"
//                             name="port"
//                             value={formData.connection_info.port}
//                             type="number"
//                             onChange={handleChange}
//                             placeholder="Enter port"
//                             className="com"
//                         />
//                         {error.port && <p style={{ color: 'red' }}>{error.port}</p>}
//                         <CommonTextInput
//                             label="Path *"
//                             name="path"
//                             value={formData.connection_info.path}
//                             onChange={handleChange}
//                             placeholder="Enter path"
//                             className="com"
//                         />
//                         {error.username && <p style={{ color: 'red' }}>{error.username}</p>}
//                         <CommonTextInput
//                             label="Username *"
//                             name="username"
//                             value={formData.connection_info.username}
//                             onChange={handleChange}
//                             placeholder="Enter username"
//                             className="com"
//                         />
//                         {error.username && <p style={{ color: 'red' }}>{error.username}</p>}

//                         <CommonTextInput
//                             label="Password"

//                             name="password"
//                             value={formData.connection_info.password}
//                             type="password"
//                             onChange={handleChange}
//                             placeholder="Enter password"
//                             className="com"
//                         />
//                         {error.password && <p style={{ color: 'red' }}>{error.password}</p>}

//                         <div className="button-container">
//                             <AppButton type="submit" className="create-btn" disabled={isSubmitting}>
//                                 {isSubmitting ? "Creating..." : "Create"}
//                             </AppButton>
//                             <AppButton type="button" onClick={togglePopup} className="cancel-btn">Cancel</AppButton>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// CreateConnection.propTypes = {
//     togglePopup: PropTypes.func.isRequired,
//     id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
// };
// export default CreateConnection;
