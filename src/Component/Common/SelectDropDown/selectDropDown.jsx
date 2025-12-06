import React from 'react';
import styles from './selectDropDown.module.css';
import PropTypes from 'prop-types';
const DropdownField = ({
  label,
  value,
  source,
  onChange,
  options = [],
  name,
  error = false,
  disabled = false,
  customPadding,
  customnWrapper
}) => {
  return (
    <div className={`${styles.dropdownWrapper} ${customnWrapper || ''}`}>
      <div className={`${styles.dropdownGroup} ${error ? styles.error : ''}`}>
        <label className={`${styles.label} 
                  ${error ? styles.errorLabel : ''}
                   ${disabled ? styles.disabledLabel : ''}
                  `}>
          {label}
        </label>
        <div className={styles.selectWrapper}>
          <select
            className={`${styles.select} ${error ? styles.errorSelect : ''} ${customPadding || ''}`}  // Only override if value is passed

            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            required
          >
            <option value="" disabled>{source}</option>
            {options.map((opt, idx) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
DropdownField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  source: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired
    })
  ),
  name: PropTypes.string.isRequired,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  customPadding: PropTypes.string,
  customnWrapper: PropTypes.string
};
export default DropdownField