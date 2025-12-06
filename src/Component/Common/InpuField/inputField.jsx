import React from 'react';
import styles from './inputField.module.css';
import PropTypes from 'prop-types';

export const InputField = React.forwardRef(
  (
    {
      label,
      type = 'text',
      value,
      onChange,
      onKeyDown,
      placeholder,
      name,
      autoComplete,
      autoFocus,
      readOnly,
      onFocus,
      error = false,  // new prop (true/false)
      disabled,
      customPaddingInput,
      customnWrapper,
       required = true,
    },
    ref
  ) => {
    return (
      <div className={`${styles.inputWrapper }${customnWrapper || ''}`}>
        <div className={`${styles.inputGroup} ${error ? styles.error : ''}`}>
          <label className={`${styles.label} 
          ${error ? styles.errorLabel : ''}
           ${disabled ? styles.disabledLabel : ''}
          `}>
            {label}
          </label>
          <input
            ref={ref}
            className={`${styles.input} ${error ? styles.errorInput : ''} ${customPaddingInput || ''}`}
          
            type={type}
            name={name}
            value={value}
            onChange={onChange}
              onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            readOnly={readOnly}
            onFocus={onFocus}
            // required={required}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
);
InputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool,
  onFocus: PropTypes.func,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  customPaddingInput: PropTypes.object,
  customnWrapper: PropTypes.object,
  required: PropTypes.bool,
};
InputField.displayName = 'InputField';
