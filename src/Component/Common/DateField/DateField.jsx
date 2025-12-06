import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import PropTypes from 'prop-types';

const CommonDateInput = ({
    label,
    value,
    placeholder = "Select date...",
    onClickIcon,
    readOnly = true,
    sx = {},
    inputProps = {},
    showIcon = true,
}) => {

    return (
        <div style={{ marginBottom: '16px', position: 'relative' }}>
            {label && (
                <label
                    style={{
                        position: 'absolute',
                        top: '-7px',
                        left: '12px',
                        backgroundColor: 'var(--color-colors-primaryAccent)',
                        padding: '0 6px',
                        color: 'var(--color-colors-neutralText)',
                        fontWeight: 'normal',
                        zIndex: 1,
                        borderRadius: '0.75rem',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    {label}
                </label>
            )}

            <TextField
                fullWidth
                InputProps={{
                    ...(showIcon && {
                        endAdornment: (
                            <InputAdornment position="end">
                                <CalendarToday
                                    style={{ cursor: 'pointer', color: '#0073CF' }}
                                    onClick={onClickIcon}
                                />
                            </InputAdornment>
                        ),
                    }),
                    style: {
                        height: '38px',
                        color: 'white',
                        borderRadius: '15px',
                        ...inputProps?.style,
                        border: '1px solid #0073CF',
                        background: '#101D2B',
                    },
                }}
                placeholder={placeholder}
                value={value}
                readOnly={readOnly}
                sx={{
                    '& .MuiInputBase-input::placeholder': {
                        color: 'var(--color-colors-neutralText)',
                        opacity: 1,
                    },
                    ...sx,
                }}
            />
        </div>
    );
};
CommonDateInput.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onClickIcon: PropTypes.func,
    readOnly: PropTypes.bool,
    sx: PropTypes.object,
    inputProps: PropTypes.object,
    showIcon: PropTypes.bool
};

export default CommonDateInput;
