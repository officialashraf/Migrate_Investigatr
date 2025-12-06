import React, { useState } from 'react';
import styles from "./addResource.module.css"
import PropTypes from 'prop-types';
import AppButton from '../../Common/Buttton/button';

const Cdr = ({ togglePopup, handleProceed }) => {
  const [selectedOption, setSelectedOption] = useState('osintData');
  const [selectDataType, setSelectDataType] = useState('IPDR');

    const options = [
    { value: 'osintData', label: 'Import via OSINT data', description: 'Include attributes for harvesting OSINT data' },
    { value: 'localStorage', label: 'Upload from Local Storage', description: 'Add a file from local drive' },
    { value: 'ftpServer', label: 'Upload from FTP Server', description: 'Add Documents, Images, Videos, Recordings and more from local drive.' },
  ];

  const dataTypes = ['IPDR', 'CDR', 'Other'];
  const onProceedClick = () => {
    handleProceed(selectedOption, selectDataType);
  };

  return (

      <div className={styles.popupOverlay}>
        <div className={styles.popupContainerCdr}>
          <div className={styles.popupHeaderCdr}>
            <h6>Add Resources</h6>
            <button className={styles.closeIconCdr} onClick={togglePopup}>&times;</button>
          </div>
          <div className={styles.popupBodyCdr}>
            <p style={{paddingTop : "9px", marginBottom : "7px"}}>Choose an option to continue</p>
            <div className={styles.optionsListCdr}>
              {options.map((option) => (
                <div key={option.value} >
                  <label  htmlFor={`option-${option.value}`} className={`${styles.optionItemCdr} ${selectedOption === option.value ? styles.selected : ''}`}>
                    <input
                      type="radio"
                      name="resourceOption"
                      value={option.value}
                      checked={selectedOption === option.value}
                      onChange={() => setSelectedOption(option.value)}
                      id={`option-${option.value}`}
                    />
                    <div className={styles.optionContentCdr}>
                      <span className={styles.optionLabelCdr}>{option.label}</span>
                      <span className={styles.optionDescriptionCdr}>{option.description}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {selectedOption !== 'osintData' && (
              <div className={styles.targetDataTypeCdr}>
                <div className={styles.selectDataTypeCdr}>
                  <div className={styles.customOutlinedWrapper}>
                    <label className={styles.customBadgeLabel} htmlFor="dataTypeSelect">Select Data Type*</label>
                    <select
                      id="dataTypeSelect"
                      className={styles.customSelectField}
                      value={selectDataType}
                      onChange={(e) => setSelectDataType(e.target.value)}
                    >
                      {dataTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <small>Selected Data Type would be applied to all resources in this batch</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.popupFooterCdr}>
            <AppButton onClick={togglePopup}>x Cancel</AppButton>
            <AppButton onClick={onProceedClick}>✓ Proceed</AppButton>
          </div>
        </div>
      </div>

  );
};

Cdr.propTypes = {
  togglePopup: PropTypes.func.isRequired,
  handleProceed: PropTypes.func.isRequired,
};
export default Cdr;