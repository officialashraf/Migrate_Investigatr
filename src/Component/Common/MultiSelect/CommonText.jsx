import React from 'react';
import PropTypes from 'prop-types';

const CommonTextArea = ({
    label,
    name,
    value,
    onChange,
    placeholder = 'Enter text...',
    disabled = false,
}) => {
    return (
        <div style={{ marginBottom: '16px', position: 'relative', overflow: 'visible' }}>
            {label && (
                <label
                    htmlFor={name}
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '12px',
                        backgroundColor: 'var(--color-colors-primaryAccent)',
                        padding: '0 6px',
                        // color: 'var(--color-colors-neutralText)',
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
                <style>
                {`
                    textarea::placeholder {
                    color: var(--color-colors-neutralText);
                    opacity: 1;
                    }
                `}
                </style>

                <textarea
                
                    className="com"
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={4}
                    style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        resize: 'vertical',
                        backgroundColor: '#101d2b',
                        color: 'd2d2d2',
                        padding: '10px 12px',
                        fontSize: '14px',
                        borderRadius: '15px',
                    }}
                ></textarea>
            </div>
        </div>
    );
};
CommonTextArea.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
};

CommonTextArea.defaultProps = {
    placeholder: 'Enter text...',
    disabled: false,
};
export default CommonTextArea;
