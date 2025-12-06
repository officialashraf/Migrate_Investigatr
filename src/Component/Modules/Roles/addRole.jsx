import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import '../User/addUser.module.css';
import { CloseButton } from 'react-bootstrap';
import { useAutoFocusWithManualAutofill } from '../../../utils/autoFocus';
import CommonTextInput from '../../Common/MultiSelect/CommonTextInput';
import SelectFieldOutlined from '../../Common/MultiSelect/SelectFieldOutlined';
import AppButton from '../../Common/Buttton/button'
import PropTypes from 'prop-types';

const AddRole = ({ togglePopup }) => {
    const token = Cookies.get('accessToken');
    const { inputRef, isReadOnly, handleFocus } = useAutoFocusWithManualAutofill();
    const [endpoints, setEndpoints] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedEndpoints, setSelectedEndpoints] = useState([]);
    const [initialEndpoints, setInitialEndpoints] = useState([]);
    const [endpointsLoading, setEndpointsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchEndpoints = useCallback(async () => {
        setEndpointsLoading(true);
        try {

            const response = await axios.get(
                `${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/endpoints`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            if (response.data && Array.isArray(response.data)) {
                const formatted = response.data.map(item => ({
                    value: item.endpoint,
                    label: item.endpoint,
                }));
                setEndpoints(formatted);
                console.log("response.data", endpoints)

                setSelectedEndpoints(endpoints);
                setInitialEndpoints(selectedEndpoints.map(endpoint => endpoint.value));
                console.log("initialEndpoints", initialEndpoints)
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to load permissions');
        } finally {
            setEndpointsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEndpoints();
    }, [fetchEndpoints]);

    const assignRole = async () => {
        if (!selectedRole) return toast.warning('Please select a role');
        if (selectedEndpoints.length === 0) return toast.warning('Please select at least one permission');
        setIsSubmitting(true);

        try {

            const newlySelectedEndpoints = selectedEndpoints.filter(
                endpoint => !initialEndpoints.includes(endpoint.value)
            );
            console.log("newlyse;ected", newlySelectedEndpoints)


            if (!selectedRole.trim()) {
                toast.info("Please enter role before proceeding."); // Show toast error
                return; // Stop function execution
            }
            if (newlySelectedEndpoints.length === 0) {
                toast.info("No new permissions to assign");
                setIsSubmitting(false);
                return;
            }
            const payload = {
                role: selectedRole,
                permissions: newlySelectedEndpoints.map(endpoint => endpoint.value),
            }
            console.log("payload", payload)
            const response =
                await axios.post(
                    `${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/role`, payload
                    ,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                )

            if (response.status === 200) {
                toast.success("New role created successfully");
                window.dispatchEvent(new Event("databaseUpdated"));
                togglePopup(false);
            }
            console.log(response)
        } catch (error) {
            console.error("Error during role creation:", error.response || error);
            toast.error(error.response?.data?.detail || error.message || 'Failed to assign role');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Custom checkbox option
    const CheckboxOption = ({ data, isSelected, innerRef, innerProps }) => {
        const isSelectAll = data.value === "_select_all_";
        return (
            <div
                ref={innerRef}
                {...innerProps}
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: 5,
                    backgroundColor: "#101d2b",
                }}
            >
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => null}
                    style={{ marginRight: 10 }}
                />
                <label>
                    {isSelectAll ? "Select All" : data.label}
                    {!isSelectAll && data.isAssigned}
                </label>
            </div>
        );
    };

    CheckboxOption.propTypes = {
        data: PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            isAssigned: PropTypes.bool,
        }).isRequired,
        isSelected: PropTypes.bool.isRequired,
        innerRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({ current: PropTypes.any }),
        ]),
        innerProps: PropTypes.object.isRequired,
    };

    return (
        <div className="popup-overlay" style={{ top: 0, left: 0, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050 }}>
            <div className="popup-container" style={{ alignItems: 'center' }}>
                <div className="popup-content" style={{ width: '80%', minHeight: isDropdownOpen ? "60vh" : "230px", position: "relative" }}>
                    <span style={{ display: "flex", marginTop : '2px' , justifyContent: "space-between", alignItems: "center", width: "100%" }}>

                        <h5>Assign permissions to role </h5>
                        <CloseButton variant="white" onClick={() => togglePopup(false)} style={{ color: 'white' }} />
                    </span>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            {/* <label>Add Role</label> */}
                            <CommonTextInput
                                label="Add Role"
                                type="text"
                                placeholder="Enter role"
                                className="com"
                                value={selectedRole} // Bind input value to state
                                onChange={(e) => setSelectedRole(e.target.value)} // Update state on input
                                onBlur={() => {
                                    // Format to sentence case on blur
                                    setSelectedRole((prev) =>
                                        prev?.replace(/\b\w/g, (char) => char.toUpperCase()));
                                }}
                                readOnly={isReadOnly}
                                onFocus={handleFocus}
                                ref={inputRef}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <SelectFieldOutlined
                                label="Select Permission"
                                options={[
                                    { label: 'Select All', value: '_select_all_' },
                                    ...endpoints.map(ep => ({
                                        ...ep,
                                        label: ep.label.charAt(0).toUpperCase() + ep.label.slice(1)
                                    }))
                                ]}
                                placeholder="Select permissions"
                                isLoading={endpointsLoading}
                                value={selectedEndpoints}
                                onChange={(selected) => {
                                    if (!selected) return setSelectedEndpoints([]);

                                    const isSelectAllClicked = selected.find(opt => opt.value === '_select_all_');

                                    if (isSelectAllClicked) {
                                        const areAllSelected = selectedEndpoints.length === endpoints.length;
                                        if (areAllSelected) {
                                            setSelectedEndpoints([]);
                                        } else {
                                            setSelectedEndpoints(endpoints);
                                        }
                                    } else {
                                        setSelectedEndpoints(selected);
                                    }
                                }}
                                isMulti
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                components={{ Option: CheckboxOption, MultiValue: () => null }}
                                onMenuOpen={() => setIsDropdownOpen(true)}
                                smallNote="Check/Uncheck permissions to add or remove them from the role"
                            />
                        </div>

                        <div style={{
                            position: "absolute",
                            bottom: "10px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "flex-end",
                            right: '10px',
                            gap: '10px'
                        }}
                        >
                            <AppButton
                                type="submit"
                                onClick={assignRole}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create'}
                            </AppButton>
                            <AppButton
                                type="button"
                                onClick={() => togglePopup(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </AppButton>

                        </div>
                    </form>

                </div>

            </div>
        </div>
    );
};
AddRole.propTypes = {
    togglePopup: PropTypes.func.isRequired,
};
export default AddRole;