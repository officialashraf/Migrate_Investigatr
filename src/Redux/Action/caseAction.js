import {
    SET_SELECTED_TAB,
    SET_CASE_DATA,
    SET_SUMMARY_DATA,
    SAVE_CASE_FILTER_PAYLOAD,
    CLEAR_CASE_FILTER_PAYLOAD,

} from '../Constants/caseCaontant';
export const setSelectedTab = (tab) => ({
    type: SET_SELECTED_TAB,
    payload: tab,
});


export const setCaseData = (data) => ({
    type: SET_CASE_DATA,
    payload: data,

});
export const setSummaryData = (data) => ({
    type: SET_SUMMARY_DATA,
    payload: data
});

export const saveCaseFilterPayload = (payload) => ({
  type: SAVE_CASE_FILTER_PAYLOAD,
  payload
});
export const clearCaseFilterPayload = () => ({
  type: CLEAR_CASE_FILTER_PAYLOAD
});

