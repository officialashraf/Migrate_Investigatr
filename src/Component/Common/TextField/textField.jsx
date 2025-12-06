import styles from './textField.module.css';
import PropTypes from 'prop-types';

const TextareaField = ({
  label,
  value,
  onChange,
  placeholder,
  name,
  autoFocus,
  readOnly,
  onFocus,
  error = false,
}) => {
  return (
    <div className={styles.inputWrapper}>
      <div className={`${styles.inputGroup} ${error ? styles.error : ''}`}>
        <label className={`${styles.label} ${error ? styles.errorLabel : ''}`}>
          {label}
        </label>
        <textarea
          className={`${styles.textarea} ${error ? styles.errorInput : ''}`}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          readOnly={readOnly}
          onFocus={onFocus}
          rows={5}
        />
      </div>
    </div>
  );
};
TextareaField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool,
  onFocus: PropTypes.func,
  error: PropTypes.bool
};
export default TextareaField;
