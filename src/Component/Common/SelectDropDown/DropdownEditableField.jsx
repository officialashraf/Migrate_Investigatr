import React, { useState, useRef, useEffect } from 'react';
import styles from './selectDropDown.module.css';
import PropTypes from 'prop-types';
import AppButton from '../Buttton/button';
import { Edit, Delete, Save } from "@mui/icons-material";

const DropdownEditableField = ({
  label,
  value,
  source,
  onChange,
  options = [],
  name,
  error = false,
  disabled = false,
  customPadding,
  customWrapper,
  onOptionsChange // New prop to handle options changes
}) => {
  const [localOptions, setLocalOptions] = useState(options);
  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const wrapperRef = useRef(null);

  // Update local options when props change
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setEditIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setOpen(false);
  };

  const handleStartEdit = (index, e) => {
    e.stopPropagation();
    setEditIndex(index);
    setEditValue(localOptions[index].value);
  };

  const handleSaveEdit = (index, e) => {
    e.stopPropagation();
    if (!editValue.trim()) return;

    const updated = [...localOptions];
    updated[index] = { label: editValue, value: editValue };
    setLocalOptions(updated);

    // Notify parent about options change
    if (onOptionsChange) {
      onOptionsChange(updated);
    }

    setEditIndex(null);
    setEditValue('');
  };

  const handleDelete = (index, e) => {
    e.stopPropagation();
    const updated = [...localOptions];
    updated.splice(index, 1);
    setLocalOptions(updated);

    // Notify parent about options change
    if (onOptionsChange) {
      onOptionsChange(updated);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!newValue.trim()) return;

    const updated = [...localOptions, { label: newValue, value: newValue }];
    setLocalOptions(updated);

    // Notify parent about options change
    if (onOptionsChange) {
      onOptionsChange(updated);
    }

    setNewValue('');
  };

  return (
    <div ref={wrapperRef} className={`${styles.dropdownWrapper} ${customWrapper || ''}`}>
      <label className={`${styles.label}
         ${error ? styles.errorLabel : ''} 
         ${disabled ? styles.disabledLabel : ''}`}>
        {label}
      </label>

      <div
        className={`${styles.customSelect} ${customPadding || ''}`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span>{localOptions.find(o => o.value === value)?.label || source}</span>
        <span className={styles.arrow}>▼</span>

        {open && (
          <div className={styles.menu}>
            {localOptions.map((opt, idx) => (
              <div
                key={opt.value}
                className={styles.menuItem}
                onClick={() => handleSelect(opt.value)}
              >
                {editIndex === idx ? (
                  <input
                    type="text"
                    className={styles.editInput}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEdit(idx, e);
                      }
                    }}
                  />
                ) : (
                  <span>{opt.label}</span>
                )}
                <div className={styles.actions}>
                  {editIndex === idx ? (
                    <span onClick={(e) => handleSaveEdit(idx, e)} style={{ marginRight: "15px" }}>
                      <Save fontSize="small" />
                    </span>
                  ) : (
                    <span onClick={(e) => handleStartEdit(idx, e)} style={{ marginRight: "15px" }}>
                      <Edit fontSize="small" />
                    </span>
                  )}
                  <span onClick={(e) => handleDelete(idx, e)} style={{ marginRight: "15px" }}>
                    <Delete fontSize="small" />
                  </span>
                </div>
              </div>
            ))}

            <div className={styles.addRow} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                placeholder="Please enter IPDR column value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdd(e);
                  }
                }}

              />
              <AppButton onClick={handleAdd}>Add</AppButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

DropdownEditableField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  source: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onOptionsChange: PropTypes.func, // New prop
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ),
  name: PropTypes.string.isRequired,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  customPadding: PropTypes.string,
  customWrapper: PropTypes.string
};

export default DropdownEditableField;