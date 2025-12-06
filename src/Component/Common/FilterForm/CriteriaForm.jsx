import React from "react";
import CommonMultiSelect from "../MultiSelect/CommonMultiSelect";
import CommonDateInput from "../DateField/DateField";
import { InputField } from "../InpuField/inputField";
import customSelectStyles from "../CustomStyleSelect/customSelectStyles";
import DatePickera from '../../Modules/FilterCriteria/datepicker';
import styles from '../../Common/Table/table.module.css';
import PropTypes from "prop-types";
import { sharedSxStyles } from "../../Modules/FilterCriteria/createCriteria";
import CommonTextInput from "../MultiSelect/CommonTextInput";

const CriteriaForm = ({
    title = "Filter Criteria",
    caseTitle = "Case Filter Criteria",
    caseFieldConfig,
    options,
    formData,
    setFormData,
    selectedDates,
    setSelectedDates,
    toggleDatePicker,
    onSearch,
    onCreate, // optional
    onCancel,
    showDatePicker,
    showCreateButton = false,
    isSearchDisabled,
}) => {

    const formatDateRange = () => {
        if (selectedDates.startDate && selectedDates.endDate) {
            return `${selectedDates.startDate.toLocaleDateString()} - ${selectedDates.endDate.toLocaleDateString()}`;
        }
        return "Select date range";
    };

    const handleDateSelection = (dateData) => {
        setSelectedDates(dateData);
        setFormData((prev) => ({
            ...prev,
            startDate: dateData.startDate,
            endDate: dateData.endDate,
        }));
        toggleDatePicker();
    };
    const commonOnChange = (e) => {
        const { name, value } = e.target;
        if (name === 'serverIp') {
            const filteredValue = value.replace(/[^0-9.,]/g, '');

            setFormData((prev) => ({
                ...prev,
                [name]: filteredValue, // filtered string ko store karein
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value, // store as string while typing
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (name === "latitude" || name === "longitude") {
            setFormData((prev) => ({
                ...prev,
                [name]: value.trim(),
            }));
            return;
        }

        if (value.includes(',')) {
            const arr = value
                .split(',')
                .map((v) => v.trim())
                .filter((v) => v !== '');
            setFormData((prev) => ({
                ...prev,
                [name]: arr, // convert to array
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value ? [value.trim()] : [],
            }));
        }
    };


    return (
        <div className="popup-overlay" style={{ justifyContent: "center" }}>
            <div className="popup-container" style={{ width: "40%" }}>
                <div className="popup-content" style={{ marginTop: "4rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: "10px" }}>
                        <h5 style={{ margin: 0, color: "white" }}>{title}</h5>
                        <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'white' }}
                            onClick={onCancel}
                        >
                            &times;
                        </button>
                    </div>

                    <form style={{
                        // maxHeight: "400px", 
                        // overflowY: "auto", 
                        // paddingTop: "10px",
                        scrollbarWidth: "thin",
                    }}
                        className={`${caseFieldConfig?.show ? styles.caseForm : styles.filterForm}`}
                    >
                        {/* Case Field */}
                        {caseFieldConfig?.show && (
                            <div >
                                <InputField
                                    label="Case Id"
                                    className={title === 'Filter Criteria' ? styles.sliderForm : ''}
                                    type="text"
                                    value={caseFieldConfig.value}
                                    onChange={caseFieldConfig.onChange}
                                    placeholder="Select case"
                                    disabled={caseFieldConfig.readOnly}
                                    customPaddingInput={styles.noPaddingcase}
                                />
                            </div>
                        )}

                        {/* Cases Dropdown (when selectable) */}
                        {options.cases && options.cases.length > 0 && !caseFieldConfig?.readOnly && (
                            <div>
                                <CommonMultiSelect
                                    label="Cases"
                                    isMulti
                                    options={options.cases}
                                    customStyles={customSelectStyles}
                                    value={formData.caseIds}
                                    onChange={(selected) =>
                                        setFormData((prev) => ({ ...prev, caseIds: selected }))
                                    }
                                    placeholder="Select cases"
                                />
                            </div>
                        )}

                        {/* Platform */}
                        <CommonMultiSelect
                            label="Platform"
                            isMulti
                            options={options.platforms}
                            customStyles={customSelectStyles}
                            value={formData.platform}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, platform: selected }))
                            }
                            placeholder="Select platforms"
                        />

                        {/* Targets */}
                        <CommonMultiSelect
                            label="Targets"
                            isMulti
                            options={options.targets}
                            customStyles={customSelectStyles}
                            value={formData.targets}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, targets: selected }))
                            }
                            placeholder="Select targets"
                        />

                        {/* Sentiments */}
                        <CommonMultiSelect
                            label="Sentiment"
                            isMulti
                            options={options.sentiments}
                            customStyles={customSelectStyles}
                            value={formData.sentiments}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, sentiments: selected }))
                            }
                            placeholder="Select sentiments"
                        />
                        <CommonMultiSelect
                            label="Data Sources"
                            isMulti
                            options={options.unifiedTypes}
                            customStyles={customSelectStyles}
                            value={formData.unifiedType}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, unifiedType: selected }))
                            }
                            placeholder="Select data sources"
                        />

                        {/*  eventtypestring (CommonMultiSelect) */}
                        <CommonMultiSelect
                            label="Event Types"
                            isMulti
                            options={options.eventTypeStrings}
                            customStyles={customSelectStyles}
                            value={formData.eventTypeString}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, eventTypeString: selected }))
                            }
                            placeholder="Select event types"
                        />
                        {/* mobilenumber (CommonMultiSelect) */}
                        <CommonMultiSelect
                            label="Mobile Number"
                            isMulti
                            options={options.mobileNumbers}
                            customStyles={customSelectStyles}
                            value={formData.mobileNumber}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, mobileNumber: selected }))
                            }
                            placeholder="Select mobile numbers"
                        />
                        <CommonTextInput
                            label="Hashtags"
                            type="text"
                            name='socialmediaHashtags'
                            value={Array.isArray(formData.socialmediaHashtags) ? formData.socialmediaHashtags.join(', ') : formData.socialmediaHashtags || ''}
                            placeholder="Enter Hashtags (e.g., #tag1, #tag2)"
                            customPaddingInput={styles.noPaddingcase}
                            onChange={commonOnChange}
                            onBlur={handleBlur}
                        />
                        <CommonTextInput
                            label="Profile ID"
                            type="text"
                            name='socialmediaFromId'
                            value={Array.isArray(formData.socialmediaFromId) ? formData.socialmediaFromId.join(', ') : formData.socialmediaFromId || ''}
                            placeholder="Enter Profile ID (e.g., id1, id2)"
                            customPaddingInput={styles.noPaddingcase}
                            onChange={commonOnChange}
                            onBlur={handleBlur}
                        />

                        {/*  socialmedia_from_screen_name (CommonTextInput / InputField) */}
                        <CommonTextInput
                            label="Screen Name"
                            type="text"
                            name='socialmediaFromScreenName'
                            value={Array.isArray(formData.socialmediaFromScreenName) ? formData.socialmediaFromScreenName.join(', ') : formData.socialmediaFromScreenName || ''}
                            placeholder="Enter Screen Name (e.g., name1, name2)"
                            customPaddingInput={styles.noPaddingcase}
                            onChange={commonOnChange}
                            onBlur={handleBlur}
                        />

                        {/* serverip (CommonTextInput / InputField) */}
                        <CommonTextInput
                            label="Server IP"
                            type="text"
                            name='serverIp'
                            value={Array.isArray(formData.serverIp) ? formData.serverIp.join(', ') : formData.serverIp || ''}
                            placeholder="Enter Server IP (e.g., 1.1.1.1, 2.2.2.2)"
                            customPaddingInput={styles.noPaddingcase}
                            onChange={commonOnChange}
                            onBlur={handleBlur}
                        />

                        {/* latitude (CommonTextInput) */}
                        <CommonTextInput
                            label="Latitude"
                            type="text"
                            name='latitude'
                            value={formData.latitude || ''}
                            placeholder="Enter Latitude (e.g., 40.7128)"
                            customPaddingInput={styles.noPaddingcase}
                            onChange={commonOnChange}
                            onBlur={handleBlur}
                        />

                        {/* longitude (CommonTextInput) */}
                        <CommonTextInput
                            label="Longitude"
                            type="text"
                            name='longitude'
                            value={formData.longitude || ''}
                            placeholder="Enter Longitude (e.g., -74.0060)"
                            customPaddingInput={styles.noPaddingcase}
                            onChange={commonOnChange}
                            onBlur={handleBlur}
                        />

                        {/* Date Range */}
                        <CommonDateInput
                            label="Date Range"
                            value={formatDateRange()}
                            onClickIcon={toggleDatePicker}
                            sx={sharedSxStyles}
                        />


                    </form>
                    {/* Action Buttons */}
                    <div className="button-container" style={{ marginTop: "10px" }}>
                        <button
                            type="button"
                            onClick={onSearch}
                            className="add-btn"
                            disabled={isSearchDisabled}
                        >
                            Search
                        </button>

                        {showCreateButton && (
                            <button
                                type="button"
                                className="add-btn"
                                onClick={() => {
                                    onCreate();
                                }}
                            >
                                Create
                            </button>
                        )}

                        <button
                            type="button"
                            className="add-btn"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Picker Popup */}
            {showDatePicker && (
                <DatePickera
                    onSubmit={handleDateSelection}
                    initialDates={selectedDates}
                    onClose={toggleDatePicker}
                />
            )}
        </div>
    );
};

CriteriaForm.propTypes = {
    title: PropTypes.string,

    caseFieldConfig: PropTypes.shape({
        show: PropTypes.bool,
        value: PropTypes.string,
        onChange: PropTypes.func,
        readOnly: PropTypes.bool,
    }),

    options: PropTypes.shape({
        cases: PropTypes.array, // used conditionally if present
        platforms: PropTypes.array.isRequired,
        targets: PropTypes.array.isRequired,
        sentiments: PropTypes.array.isRequired,
        unifiedTypes: PropTypes.array.isRequired,
        eventTypeStrings: PropTypes.array.isRequired,
        mobileNumbers: PropTypes.array.isRequired,
    }).isRequired,

    formData: PropTypes.shape({
        caseIds: PropTypes.array,
        platform: PropTypes.array.isRequired,
        targets: PropTypes.array.isRequired,
        sentiments: PropTypes.array.isRequired,
        unifiedType: PropTypes.array.isRequired,
        eventTypeString: PropTypes.array.isRequired,
        mobileNumber: PropTypes.array.isRequired,
        socialmediaHashtags: PropTypes.array,
        socialmediaFromId: PropTypes.array,
        socialmediaFromScreenName: PropTypes.array,
        serverIp: PropTypes.array,
        latitude: PropTypes.string,
        longitude: PropTypes.string,
        startDate: PropTypes.instanceOf(Date),
        endDate: PropTypes.instanceOf(Date),
    }).isRequired,

    setFormData: PropTypes.func.isRequired,

    selectedDates: PropTypes.shape({
        startDate: PropTypes.instanceOf(Date),
        endDate: PropTypes.instanceOf(Date),
        startTime: PropTypes.shape({
            hours: PropTypes.number,
            minutes: PropTypes.number,
        }),
        endTime: PropTypes.shape({
            hours: PropTypes.number,
            minutes: PropTypes.number,
        }),
    }).isRequired,

    setSelectedDates: PropTypes.func.isRequired,
    toggleDatePicker: PropTypes.func.isRequired,
    showDatePicker: PropTypes.bool.isRequired,

    onSearch: PropTypes.func.isRequired,
    onCreate: PropTypes.func, // optional
    onCancel: PropTypes.func.isRequired,

    showCreateButton: PropTypes.bool,
    isSearchDisabled: PropTypes.bool,
};
export default CriteriaForm;
