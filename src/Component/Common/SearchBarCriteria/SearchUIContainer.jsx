import { TextField, InputAdornment, Tooltip } from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon, Tune as TuneIcon } from "@mui/icons-material";
import styles from '../../Modules/Analyze/caseHeader.module.css';
import AppButton from "../Buttton/button";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { openPopup } from "../../../Redux/Action/criteriaAction";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const SearchUIContainer = ({
  inputValue,
  setInputValue,
  handleSearch,
  handleKeyPress,
  resetSearch,
  activeComponent,
  setActiveComponent,
  componentsMap,
  displayChips,
  chipCheckFunctions,
  removeChip,
  PopupComponent,
  isPopupVisible,
  setIsPopupVisible,
  showCaseHeader = false,
  CaseHeaderComponent = null,
  popupSearchChips = [],
  placeholder
}) => {

  const location = useLocation();
  const dispatch = useDispatch();
  const chipsRef = useRef(null);
  const [chipsHeight, setChipsHeight] = useState(0);

  useEffect(() => {
    if (!chipsRef.current) return;

    const observer = new ResizeObserver(entries => {
      const height = entries[0].contentRect.height;
      setChipsHeight(height);
    });

    observer.observe(chipsRef.current);

    return () => observer.disconnect();
  }, []);

  return (
   <>
    <div
      className="search-container"
      style={{ backgroundColor: "#080E17", height: "100%", zIndex: "1050", overflowY: "hidden" }}
    >
     {showCaseHeader && CaseHeaderComponent ? CaseHeaderComponent : null}
      {/* Search Header */}
      <div
        className={styles.actionIconsContainer}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}
      >
        <div className={styles.searchHeader} style={{ width: "60%", backgroundColor: "#080E17" }}>
          <TextField
            placeholder={placeholder}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#0073CF" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <SendIcon
                    style={{ cursor: "pointer", color: "#0073CF", marginRight: "5px" }}
                    onClick={handleSearch}
                  />
                  <TuneIcon
                    style={{ cursor: "pointer", backgroundColor: "#0073CF", color: "#0A192F" }}
                    onClick={() => setIsPopupVisible(true)}
                  />
                </InputAdornment>
              ),
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #0073CF',
                  height: 'unset',
                  marginTop: 0,
                  width: 'calc(100% + 1px)',
                  margin: '-1px',
                },
              },
              style: {
                height: "38px",
                padding: "0 8px",
                backgroundColor: "#101D2B",
                borderRadius: "15px",
                color: "white",
                fontSize: "12px",
                marginBottom: "5px",
              },
            }}
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div style={{ padding: "0px 0px", height: "20px", marginLeft: "5px" }}>
            <AppButton onClick={resetSearch}>Reset</AppButton>
          </div>
          {location.pathname.startsWith("/search")&& (
            <div style={{ padding: "0px 0px", height: "20px", marginLeft: "5px" }}>
                <AppButton onClick={() => dispatch(openPopup("recent"))}>
                  <span style={{ whiteSpace: "nowrap" }}>Saved Searches</span>
              </AppButton>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center"}}>
          {Object.entries(componentsMap).map(([key, { icon: Icon , title}]) =>
            Icon ? (
              <Tooltip
                title={title}
                placement="top"
                key={key}
                slotProps={{
                  popper: {
                    sx: {
                      "& .MuiTooltip-tooltip": {
                        width: "96%",
                        backgroundColor: "#0e2c46",
                        border: "1px solid  #3b7fdaff",  
                        fontSize: "10.5px",
                      },
                      "& .MuiTooltip-arrow": {
                        color: "rgba(0, 0, 0, 0.6)", 
                      },
                    },
                  },
                }}
              >
                <span>
                  <Icon
                    sx={{ fontSize: 40 }}
                    className={`${styles.icon} ${
                      activeComponent === key ? styles.activeIcon : ""
                    }`}
                    onClick={() => setActiveComponent(key)}
                  />
                </span>
              </Tooltip>
            ) : null
          )}
        </div>
      </div>

      {/* Chips Section */}
      <div  
        ref={chipsRef}
        className={`chips-container ${!showCaseHeader ? 'overrideHeight' : ''}`}
      >
        {displayChips.map((chip, index) => {
          let chipStyle = { backgroundColor: "#0073CF", color: "white" };
          for (let check of chipCheckFunctions) {
            if (check(chip)) {
              chipStyle = { backgroundColor: "#FFD700", color: "#000" };
              break;
            }
          }

          return (
            <div
              key={`${chip}-${index}`} 
              className="search-chip"
              style={{
                ...chipStyle,
                padding: "4px 8px",
                borderRadius: "12px",
                margin: "2px",
                display: "inline-flex",
                alignItems: "center",
                fontSize: "12px",
                marginBottom:'10px'
              }}
            >
              <span>{chip}</span>
              <button
                className="chip-delete-btn"
                onClick={() => removeChip(chip)}
                style={{
                  background: "none",
                  border: "none",
                  marginLeft: "4px",
                  cursor: "pointer",
                  color: chipStyle.color,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CloseIcon style={{ fontSize: "15px" }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Component Renderer */}
      <div style={{ height: `calc(100% - ${chipsHeight}px)`, borderRadius:'15px'}}>
        {componentsMap[activeComponent]?.component 
          ? React.cloneElement(componentsMap[activeComponent].component, { chipsHeight: chipsHeight })
          : <div style={{ color: 'white', padding: '20px' }}>Component not found</div>
        }
      </div>

      {/* Popup */}
      {isPopupVisible && (
        <PopupComponent
          searchChips={popupSearchChips}
          isPopupVisible={isPopupVisible}
          setIsPopupVisible={setIsPopupVisible}
        />
      )}
    </div>
   </>
  );
};

SearchUIContainer.propTypes = {
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  resetSearch: PropTypes.func.isRequired,
  activeComponent: PropTypes.string.isRequired,
  setActiveComponent: PropTypes.func.isRequired,
  componentsMap: PropTypes.objectOf(
    PropTypes.shape({
      icon: PropTypes.oneOfType([
        PropTypes.elementType,
        PropTypes.oneOf([null]),
      ]),
      component: PropTypes.node.isRequired,
    })
  ).isRequired,
  displayChips: PropTypes.arrayOf(PropTypes.string).isRequired,
  chipCheckFunctions: PropTypes.arrayOf(PropTypes.func).isRequired,
  removeChip: PropTypes.func.isRequired,
  placeholder : PropTypes.string.isRequired,
  PopupComponent: PropTypes.elementType.isRequired,
  isPopupVisible: PropTypes.bool.isRequired,
  setIsPopupVisible: PropTypes.func.isRequired,
  showCaseHeader: PropTypes.bool,
  CaseHeaderComponent: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.node,
    PropTypes.oneOf([null])
  ]),
  popupSearchChips: PropTypes.arrayOf(PropTypes.string),
};

export default SearchUIContainer;