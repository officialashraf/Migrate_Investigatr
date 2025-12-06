import React from "react";
import { Search, CalendarToday } from "@mui/icons-material";
import Select from "react-select";
import { InputAdornment, TextField } from "@mui/material";
import styles from "../../Common/Table/table.module.css"; // Adjust the path as necessary

const SearchBarDateSelect = ({
  searchValue,
  onSearchChange,
  onSearchIconClick,
  selectValue,
  selectOptions,
  onSelectChange,
  dateValue,
  onDateClick,
  placeholderText = "Search...",
  datePlaceholderText = "Select Date Range",
  showSearch = true,
  showSelect = true,
  showDate = true,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Search Bar */}
      {showSearch && (
        <div className={styles.searchBarContainer}>
          <input
            className={styles.searchBar}
            name="searchQuery"
            placeholder={placeholderText}
            value={searchValue}
            onChange={onSearchChange}
            style={{ minWidth: "200px", flexGrow: 1 }}
          />
          <Search
            onClick={onSearchIconClick}
            style={{ color: "#0073CF", cursor: "pointer" }}
          />
        </div>
      )}

      {/* Select */}
      {showSelect && (
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            gap: "10px",
            minWidth: "250px",
          }}
        >
          <Select
            isMulti
            options={selectOptions}
            value={selectValue}
            onChange={onSelectChange}
            placeholder="Select Cases"
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: "var(--color-colors-secondary)",
                border: "none",
                color: "var(--color-colors-neutralText)",
                minHeight: "38px",
                borderRadius: "15px",
                boxShadow: "none",
                minWidth: "250px",
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: "var(--color-colors-primaryAccent)",
                color: "var(--color-colors-neutralText)",
                borderRadius: "8px",
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: "var(--color-colors-neutralText)",
                fontWeight: "500",
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: "white",
                ":hover": {
                  backgroundColor: "var(--color-colors-danger)",
                  color: "white",
                },
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "var(--color-colors-neutralText)",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "var(--color-colors-neutralText)",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "var(--color-colors-secondary)",
                color: "var(--color-colors-neutralText)",
                borderRadius: "10px",
                zIndex: 9999,
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused
                  ? "var(--color-colors-primaryAccent)"
                  : "var(--color-colors-secondary)",
                color: "white",
                cursor: "pointer",
              }),
              dropdownIndicator: (provided) => ({
                ...provided,
                color: "var(--color-colors-neutralText)",
                padding: "8px",
              }),
              indicatorSeparator: () => ({
                display: "none",
              }),
              valueContainer: (provided) => ({
                ...provided,
                flexWrap: "nowrap",
                overflow: "hidden",
              }),
            }}
          />
        </div>
      )}

      {/* Date Textfield */}
      {showDate && (
        <TextField
          placeholder={datePlaceholderText}
          value={dateValue}
          onClick={onDateClick}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <CalendarToday
                  style={{ cursor: "pointer", color: "white" }}
                />
              </InputAdornment>
            ),
            readOnly: true,
            style: {
              height: "38px",
              color: "white",
              backgroundColor: "#101d2b",
              borderRadius: "15px",
            },
          }}
          sx={{ minWidth: "200px", flexGrow: 1 }}
        />
      )}
    </div>
  );
};
SearchBarDateSelect.propTypes = {
  searchValue: PropTypes.string,
  selectValue: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  onSearchChange: PropTypes.func,
  onSearchIconClick: PropTypes.func,
  selectOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })
  ),
  onSelectChange: PropTypes.func,
  dateValue: PropTypes.string,
  onDateClick: PropTypes.func,
  placeholderText: PropTypes.string,
  datePlaceholderText: PropTypes.string,
  showSearch: PropTypes.bool,
  showSelect: PropTypes.bool,
  showDate: PropTypes.bool
};
export default SearchBarDateSelect;
