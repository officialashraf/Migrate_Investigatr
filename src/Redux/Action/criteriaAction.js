import { SET_SEARCH_RESULTS, SET_PAGE, OPEN_POPUP, CLOSE_POPUP, SET_KEYWORDS, CLEAR_CRITERIA, SET_SELECTED_CRITERIA_RESOURCE } from "../Constants/criteriaConstant";

// Action Creators
export const setSearchResults = (payload) => ({
  type: SET_SEARCH_RESULTS,
  payload,
});

export const setPage = (payload) => ({
  type: SET_PAGE,
  payload,
});

export const openPopup = (popupName) => ({
  type: OPEN_POPUP,
  payload: popupName, // Open the selected popup
});

export const closePopup = () => ({
  type: CLOSE_POPUP, // Close the popup
});

export const setKeywords = (payload ) => ({
  type: SET_KEYWORDS,
  payload,
});
export const setSelectedCriteriaResource = (resourceData) => ({
  type: SET_SELECTED_CRITERIA_RESOURCE,
  payload: resourceData,
});

export const clearCriteria = () => {
  return {
    type: CLEAR_CRITERIA,
  };
};
