import React from 'react';
import PropTypes from 'prop-types';

const CommonTextInput = ({
  label,
  name,
  value,
  onBlur,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  readOnly = false,
  onFocus,
  inputRef,
  onKeyDown,  // added onKeyDown prop
}) => {
  return (
    <div style={{ marginBottom: '16px', position: 'relative', overflow: 'visible' }}>

       <style>
    {`
      input::placeholder {
        color: var(--color-colors-neutralText);
        opacity: 1;
      }
    `}
  </style>

      {label && (
        <label
          htmlFor={name}
          style={{
            position: 'absolute',
            top: '-10px',
            left: '12px',
            backgroundColor: 'var(--color-colors-primaryAccent)',
            padding: '0 6px',
            color: 'var(--color-colors-neutralText)',
            fontWeight: 'normal',
            zIndex: 1,
            borderRadius: '0.75rem',
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          border: '1px solid #0073CF',
          borderRadius: '15px',
          marginTop: '20px',
          overflow: 'visible',
        }}
      >
        <input
          className="com"
          type={type}
          id={name}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={onFocus}
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.key === ',') return; // allow comma typing
          }}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: '#101d2b',
            color: '#d2d2d2',
            padding: '10px 12px',
            fontSize: '14px',
            borderRadius: '15px',
            height: '38px',
          }}
        />
      </div>
    </div>
  );
};
CommonTextInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,  // added onKeyDown prop type
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};
export default CommonTextInput;
