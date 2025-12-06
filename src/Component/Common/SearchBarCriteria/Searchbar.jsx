import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import TuneIcon from '@mui/icons-material/Tune';
import styles from './SearchBar.module.css';
import PropTypes from 'prop-types';

const SearchBar = ({
    inputValue,
    onChange,
    onKeyPress,
    onSearchClick,
    onTuneClick,
    isLoading = false,
    isReadOnly = false,
    inputRef,
    onFocus,
    sharedSxStyles = {},
}) => {
    return (
        <div className={styles.searchHeader}>
            <TextField
                fullWidth
                className={styles.searchBar}
                InputProps={{
                    readOnly: isReadOnly,
                    onFocus: onFocus,
                    inputRef: inputRef,
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon className={styles.searchIcon} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <SendIcon
                                className={styles.iconButton}
                                style={{ cursor: isLoading ? 'default' : 'pointer' }}
                                onClick={isLoading ? null : onSearchClick}
                            />
                            <TuneIcon
                                className={styles.iconButton}
                                style={{ cursor: 'pointer' }}
                                onClick={onTuneClick}
                            />
                        </InputAdornment>
                    ),
                    style: {
                        height: '38px',
                        padding: '0 8px',
                        borderRadius: '15px',
                        marginBottom: '10px',
                        backgroundColor: 'var(--color-colors-secondary)',
                        color: 'var(--color-colors-neutralText)',
                    },
                }}
                type="text"
                value={inputValue}
                onChange={onChange}
                onKeyPress={onKeyPress}
                placeholder="Search..."
                sx={sharedSxStyles}
                disabled={isLoading}
            />
        </div>
    );
};
SearchBar.propTypes = {
    inputValue: PropTypes.string.isRequired, // or PropTypes.string if not required
    onChange: PropTypes.func.isRequired,
    onKeyPress: PropTypes.func,
    onSearchClick: PropTypes.func,
    onTuneClick: PropTypes.func,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    inputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any })
    ]),
    onFocus: PropTypes.func,
    sharedSxStyles: PropTypes.object
};
SearchBar.defaultProps = {
    onKeyPress: () => { },
    onSearchClick: () => { },
    onTuneClick: () => { },
    isLoading: false,
    isReadOnly: false,
    onFocus: () => { },
    sharedSxStyles: {}
};

export default SearchBar;