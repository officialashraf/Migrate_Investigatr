import React from 'react';
import './CommonChipsInput.css';
import PropTypes from 'prop-types';

const CommonChipsInput = ({
    label,
    value = '',
    onChange,
    onKeyDown,
    chips = [],
    removeChip,
    maxChips = 5,
    placeholder = 'Type and press Enter to add...',
    disabled = false,
}) => {
    return (
        <div style={{ marginBottom: '6px', position: 'relative', overflow: 'visible' }}>
            {label && (
                <label
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

            <div className="outlined-chip-container">
                <style>
                {`
                    .com::placeholder {
                    color: white;
                    opacity: 1;
                    }
                `}
                </style>                
                <input
                    className="chip-input com"
                    type="text"
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || chips.length >= maxChips}
                />

                {chips.length > 0 && (
                    <div className="chip-list">
                        {chips.map((chip, index) => (
                            <div key={`${chip}-${index}`} className="chip">
                                {chip}
                                <button
                                    type="button"
                                    className="chip-remove"
                                    onClick={() => removeChip(index)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

CommonChipsInput.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    chips: PropTypes.arrayOf(PropTypes.string),
    removeChip: PropTypes.func.isRequired,
    maxChips: PropTypes.number,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool
};

export default CommonChipsInput;
