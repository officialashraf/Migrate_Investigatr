import PropTypes from 'prop-types';
import styles from './button.module.css';

const AppButton = ({ children, onClick, disabled, type }) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${disabled ? styles.buttonDisabled : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

AppButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

export default AppButton;
