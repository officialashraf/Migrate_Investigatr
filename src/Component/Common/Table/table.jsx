import React, { useState } from "react";
import styles from "./table.module.css";
import { Table } from "react-bootstrap";
import AppButton from "../Buttton/button";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Checkbox } from "@mui/material";
import DropdownField from "../SelectDropDown/selectDropDown";
import { InputField } from "../InpuField/inputField";
import PropTypes from "prop-types";
import DropdownEditableField from "../SelectDropDown/DropdownEditableField";

const TableModal = ({
  columns = [], reverseOrder, title, data = [], onAddClick, searchPlaceholder = "Search...", idPrefix = "", btnTitle = '', onRowClick, onRowAction = {}, enableRowClick = false, editable = false, onSaveChanges, caseTableWrapper, isChatBotView = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [editedRows, setEditedRows] = useState({});

  const groupOptions = [
    { label: "Select Group", value: "" },
    { label: "OSINT", value: "OSINT" },
    { label: "CDR", value: "CDR" },
    { label: "IPDR", value: "IPDR" },
    { label: "Common", value: "Common" },
    { label: "Entities", value: "Entities" },
    { label: "DarkWeb", value: "DarkWeb" },
  ];

  const handleGroupChange = (id, newGroup) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        group_name: newGroup || '',
      },
    }));
  };

  const handleIpdrChange = (id, newValue) => {
    setEditedRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ipdr_columns: newValue
      }
    }));
  };;

  const handleVisibilityChange = (id, newValue) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        is_visible: newValue,
      },
    }));
  };

  const handleShowInReportChange = (id, newValue) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        show_in_reports: newValue,
      },
    }));
  };

  const handleDisplayNameChange = (id, newValue) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        display_name: newValue,
      },
    }));
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? ' ↑' : ' ↓';

    }
    return '↓↑';
  };

  const filteredData = data
    .filter((row) =>
      columns.some((col) =>
        String(row[col.key] || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      const aRaw = a[sortConfig.key] || "";
      const bRaw = b[sortConfig.key] || "";

      const extractNumber = (val) => {
        const str = String(val);
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };

      if (sortConfig.key.toLowerCase() === "id") {
        const aNum = extractNumber(aRaw);
        const bNum = extractNumber(bRaw);
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      const aVal = String(aRaw).toLowerCase();
      const bVal = String(bRaw).toLowerCase();
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

  const shouldShowActions = (title) =>
    !["Catalogue Dashboard", "IPDR Header Mapping"].includes(title);
  // Helper function to get current value for ipdr_columns
  const handleIpdrOptionsChange = (id, newOptions) => {
    setEditedRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ipdr_columns_options: newOptions // Store the updated options
      }
    }));
  }
  const getCurrentIpdrValue = (row) => {
    const editedValue = editedRows[row.id]?.ipdr_columns;
    if (editedValue !== undefined) {
      return editedValue;
    }

    // Handle both array and string cases
    if (Array.isArray(row.ipdr_columns)) {
      // return row.ipdr_columns.length > 0 ? row.ipdr_columns[0] : '';
      return row.ipdr_columns.length > 0 ? row.ipdr_columns[row.ipdr_columns.length - 1] : '';

    }
    return row.ipdr_columns || '';
  };

  // Helper function to get options for ipdr_columns dropdown
  const getIpdrOptions = (row) => {
    // First check if we have edited options for this row
    const editedOptions = editedRows[row.id]?.ipdr_columns_options;
    if (editedOptions) {
      return editedOptions;
    }

    // Otherwise use the original options
    if (Array.isArray(row.ipdr_columns)) {
      return row.ipdr_columns.slice().reverse().map(item => ({
        label: item,
        value: item
      }));
    }

    // If it's a single value, create a single option
    return row.ipdr_columns ? [{
      label: row.ipdr_columns,
      value: row.ipdr_columns
    }] : [];
  }


  return (
    <>
      { !isChatBotView && (
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            className={styles.searchBar}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {shouldShowActions(title) && (
          <AppButton onClick={() => onAddClick && onAddClick()} children={btnTitle} />
        )}


      </div>
      )}
      <div className={styles.tableContainer}>
        {/* <div className={styles.tableWrapper}> */}
        <div className={
          caseTableWrapper
            ? styles.tableWrapper
            : editable
              ? styles.btntableWrapper
              : styles.casetableWrapper
        }>
          <Table hover className={styles.table}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className={styles.th}>
                    <div className={styles.thContent}>
                      <span>{col.label}</span>
                      <span>{renderSortIcon(col.key)}</span>
                    </div>
                  </th>

                ))}
                {onRowAction && shouldShowActions(title) && !isChatBotView && <th className={styles.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {/* { filteredData.slice().reverse().map((row, idx) => (
                <tr key={idx}
                  style={{ cursor: enableRowClick ? 'pointer' : 'default' }}
                  onClick={() => enableRowClick && onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? (
                        col.render(row[col.key], row)
                      ) : editable && col.key === ("group_name" || "ipdr_coloumns") ? (
                        <DropdownField
                          source="Select Group"
                          value={editedRows[row.id]?.group_name || row.group_name || ""}

                          onChange={(e) => handleGroupChange(row.id, e.target?.value)}
                          disabled={!editable}
                          required={true}
                          options={groupOptions}
                          customPadding={styles.noPadding}
                          customnWrapper={styles.customnWrapper}
                        />
                      ) : editable && col.key === "ipdr_columns" ? (
                        
  <DropdownEditableField
    name={`ipdr_columns_${row.id}`}
    source="Select IPDR Columns"
    value={getCurrentIpdrValue(row)}
    onChange={(e) => handleIpdrChange(row.id, e.target?.value)}
    onOptionsChange={(newOptions) => handleIpdrOptionsChange(row.id, newOptions)}
    options={getIpdrOptions(row)}
    error={false}
    disabled={!editable}
  />
                      )
                        : editable && col.key === "display_name" ? (
                          <InputField
                            value={editedRows[row.id]?.display_name ?? row.display_name}
                            placeholder={row.display_name}
                            onChange={(e) => handleDisplayNameChange(row.id, e.target.value)}
                            customPaddingInput={styles.noPaddingInput}
                            customnWrapper={styles.customnWrapper}
                          />
                        ) : editable && col.key === "is_visible" ? (
                          <>
                            <Checkbox
                              checked={
                                editedRows[row.id]?.is_visible !== undefined
                                  ? editedRows[row.id].is_visible
                                  : row.is_visible
                              }
                              onChange={(e) => handleVisibilityChange(row.id, e.target.checked)}
                              // disabled={row.is_system_catalogue === true} //  Disable if system catalogue
                              sx={{
                                padding: '0px 9px',
                                color: 'white',
                              }}
                            />
                            {(
                              editedRows[row.id]?.is_visible !== undefined
                                ? editedRows[row.id].is_visible
                                : row.is_visible
                            ) ? "Yes" : "No"}
                          </>
                        ) : editable && col.key === "show_in_reports" ? (
                          <>
                            <Checkbox
                              checked={
                                editedRows[row.id]?.show_in_reports !== undefined
                                  ? editedRows[row.id].show_in_reports
                                  : row.show_in_reports
                              }
                              onChange={(e) => handleShowInReportChange(row.id, e.target.checked)}
                              disabled={row.is_system_catalogue === true} //  Disable if system catalogue
                              sx={{
                                padding: '0px 9px',
                                color: 'white',
                              }}
                            />
                            {(
                              editedRows[row.id]?.show_in_reports !== undefined
                                ? editedRows[row.id].show_in_reports
                                : row.show_in_reports
                            ) ? "Yes" : "No"}
                          </>
                        ) : col.key === "id" && idPrefix ? (
                          `${idPrefix}${String(row[col.key]).padStart(4, "0")}`
                        ) : col.key === "watchers" || col.key === "synonyms" ? (
                          Array.isArray(row[col.key]) ? row[col.key].join(", ") : row[col.key]
                        ) : (
                          row[col.key]
                        )}
                    </td>

                  ))}

                  {onRowAction && shouldShowActions(title) && (
                    <td className={styles.actionCol}>
                      <EditIcon
                        className={styles.iconEdit}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction.edit && onRowAction.edit(row);
                        }}
                        titleAccess="Edit"
                      />
                      <DeleteIcon
                        className={styles.iconDelete}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction.delete && onRowAction.delete(row);
                        }}
                        titleAccess="Delete"
                      />
                      <VisibilityIcon
                        className={styles.iconEdit}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction.details && onRowAction.details(row);
                        }}
                        titleAccess="Details"
                      />
                      {onRowAction.assign && (
                        <AssignmentIndIcon
                          className={styles.iconEdit}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowAction.assign(row);
                          }}
                          titleAccess="Assign Permission"
                          style={{ cursor: "pointer" }}
                        />
                      )}
                      {onRowAction.reset && (
                        <LockResetIcon
                          className={styles.iconEdit}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowAction.reset(row);
                          }}
                          titleAccess="Reset Password"
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                  )}

                </tr>
              ))} */}

              {(reverseOrder ? filteredData.slice().reverse() : filteredData).map((row, idx) => (
                <tr key={idx}
                  style={{ cursor: enableRowClick ? 'pointer' : 'default' }}
                  onClick={() => enableRowClick && onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? (
                        col.render(row[col.key], row)
                      ) : editable && col.key === "group_name" ? (
                        <DropdownField
                          source="Groups"
                          value={editedRows[row.id]?.group_name || row.group_name || ''}
                          onChange={(e) => handleGroupChange(row.id, e.target?.value)}
                          disabled={!editable}
                          required={true}
                          options={groupOptions}
                          customPadding={styles.noPadding}
                          customnWrapper={styles.customnWrapper}
                        />
                      ) : editable && col.key === "ipdr_columns" ? (
                        <DropdownEditableField
                          name={`ipdr_columns_${row.id}`}
                          source="Select IPDR Columns"
                          value={getCurrentIpdrValue(row)}
                          onChange={(e) => handleIpdrChange(row.id, e.target?.value)}
                          onOptionsChange={(newOptions) => handleIpdrOptionsChange(row.id, newOptions)}
                          options={getIpdrOptions(row)}
                          error={false}
                          disabled={!editable}
                              customPadding
                              customnWrapper
                        />
                      ) : editable && col.key === "display_name" ? (
                        <InputField
                          value={
                            editedRows[row.id]?.display_name !== undefined
                              ? editedRows[row.id].display_name
                              : (row.display_name ?? "")
                          }
                          placeholder={row.display_name ?? ""}
                          onChange={(e) => handleDisplayNameChange(row.id, e.target.value)}
                          customPaddingInput={styles.noPaddingInput}
                          customnWrapper={styles.customnWrapper}
                        />
                      ) : editable && col.key === "is_visible" ? (
                        <>
                          <Checkbox
                            checked={
                              editedRows[row.id]?.is_visible !== undefined
                                ? editedRows[row.id].is_visible
                                : row.is_visible
                            }
                            onChange={(e) => handleVisibilityChange(row.id, e.target.checked)}
                            sx={{ padding: '0px 9px', color: 'white' }}
                          />
                          {(
                            editedRows[row.id]?.is_visible !== undefined
                              ? editedRows[row.id].is_visible
                              : row.is_visible
                          ) ? "Yes" : "No"}
                        </>
                      ) : editable && col.key === "show_in_reports" ? (
                        <>
                          <Checkbox
                            checked={
                              editedRows[row.id]?.show_in_reports !== undefined
                                ? editedRows[row.id].show_in_reports
                                : row.show_in_reports
                            }
                            onChange={(e) => handleShowInReportChange(row.id, e.target.checked)}
                            // disabled={row.is_system_catalogue === true}
                            sx={{ padding: '0px 9px', color: 'white' }}
                          />
                          {(
                            editedRows[row.id]?.show_in_reports !== undefined
                              ? editedRows[row.id].show_in_reports
                              : row.show_in_reports
                          ) ? "Yes" : "No"}
                        </>
                      ) : col.key === "id" && idPrefix ? (
                        `${idPrefix}${String(row[col.key]).padStart(4, "0")}`
                      ) : col.key === "watchers" || col.key === "synonyms" ? (
                        Array.isArray(row[col.key]) ? row[col.key].join(", ") : row[col.key]
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}

                  {onRowAction && shouldShowActions(title) && !isChatBotView && (
                    <td className={styles.actionCol}>
                      {/* ... aapke icons ka code ... */}
                      <EditIcon
                        className={styles.iconEdit}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction.edit && onRowAction.edit(row);
                        }}
                        titleAccess="Edit"
                      />
                      <DeleteIcon
                        className={styles.iconDelete}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction.delete && onRowAction.delete(row);
                        }}
                        titleAccess="Delete"
                      />
                      <VisibilityIcon
                        className={styles.iconEdit}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction.details && onRowAction.details(row);
                        }}
                        titleAccess="Details"
                      />
                      {onRowAction.assign && (
                        <AssignmentIndIcon
                          className={styles.iconEdit}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowAction.assign(row);
                          }}
                          titleAccess="Assign Permission"
                          style={{ cursor: "pointer" }}
                        />
                      )}
                      {onRowAction.reset && (
                        <LockResetIcon
                          className={styles.iconEdit}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowAction.reset(row);
                          }}
                          titleAccess="Reset Password"
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>

        </div>
        {editable && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <AppButton
              variant="contained"
              color="primary"
              onClick={() => onSaveChanges(editedRows)}
              disabled={Object.keys(editedRows).length === 0}
            >
              Save All Changes
            </AppButton>
          </div>
        )}

      </div>
    </>
  );
};

TableModal.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      render: PropTypes.func
    })
  ),
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  caseTableWrapper: PropTypes.bool,
  onAddClick: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowAction: PropTypes.shape({
    edit: PropTypes.func,
    delete: PropTypes.func,
    details: PropTypes.func,
    assign: PropTypes.func,
    reset: PropTypes.func
  }),
  onSaveChanges: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  idPrefix: PropTypes.string,
  btnTitle: PropTypes.string,
  enableRowClick: PropTypes.bool,
  editable: PropTypes.bool
};

export default TableModal;



