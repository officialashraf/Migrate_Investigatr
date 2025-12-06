import Select from 'react-select';
import PropTypes from 'prop-types';

const labelStyle = {
    position: 'absolute',
    top: '-6px',
    left: '12px',
    backgroundColor: 'var(--color-colors-primaryAccent)',
    padding: '0 6px',
    color: 'var(--color-colors-neutralText)',
    fontWeight: 'normal',
    zIndex: 1,
    borderRadius: '0.75rem',
    transition: 'background-color 0.3s ease'
};

const containerStyle = {
    marginBottom: '16px',
    position: 'relative',
    overflow: 'visible'
};

const selectWrapperStyle = {
    border: '1px solid #0073CF',
    borderRadius: '15px',
    marginTop: '4px',
    overflow: 'visible',
};

const CommonMultiSelect = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = "Select options",
    name = "",
    isDisabled = false,
    error = false,
    customStyles = {}
}) => {
    return (
        <div style={containerStyle}>
            {label && (
                <label style={labelStyle}>
                    {label}
                </label>
            )}
            <div style={selectWrapperStyle}>
                <Select
                    name={name}
                    isDisabled={isDisabled}
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            </div>
        </div>
    );
};
CommonMultiSelect.propTypes = {
    label: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.object),         
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.object),
    placeholder: PropTypes.string,
    name: PropTypes.string,
    isDisabled: PropTypes.bool,
    error: PropTypes.bool,
    customStyles: PropTypes.object
};
export default CommonMultiSelect;
