import React from 'react';
import styles from './intervalFiled.module.css';
import PropTypes from 'prop-types';

export const IntervalField = ({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  disabled = false,
  isDarkWeb = false,
}) => {
  const allowedHours = [3, 6, 9, 12];
  return (
    <div className={styles.wrapper}>
      <div className={styles.group}>
        <label className={`${styles.label} ${disabled ? styles.disabledLabel : ''}`}>
          {label}
        </label>
        <div className={styles.inputSelectContainer}>
          <select
            className={styles.select}
            value={value}
            onChange={e => onValueChange(Number(e.target.value))}
            disabled={disabled}
          >
            {allowedHours.map(h => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value="hours"
            disabled={true}
            onChange={() => { }}
          >
            <option value="hours">Hours</option>
          </select>

        </div>
      </div>
    </div>
  );
};
IntervalField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unit: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
  onUnitChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isDarkWeb: PropTypes.bool
};