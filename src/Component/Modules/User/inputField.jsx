import React from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

export const InputField = React.forwardRef(({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  name, 
  autoComplete,
  autoFocus,
  readOnly, 
  onFocus 
}, ref) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label className='labell'>{label}</Form.Label>
      <Form.Control
        ref={ref} 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        autoFocus={autoFocus}
        readOnly={readOnly}
        onFocus={onFocus}
      />
    </Form.Group>
  );
});
InputField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  name: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool, 
  onFocus: PropTypes.func
};
InputField.displayName = 'InputField';