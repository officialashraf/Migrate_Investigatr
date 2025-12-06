import { SET_REPORT_RESULTS,SAVE_REPORT_FILTER_PAYLOAD,CLEAR_REPORT_FILTER_PAYLOAD, CLEAR_REPORT_RESULTS } from '../Constants/reportConstant';

export const setReportResults = (data) => ({
  type: SET_REPORT_RESULTS,
  payload: data,
});

export const clearReportResults = (data) => ({
  type: CLEAR_REPORT_RESULTS,
 });
 
export const saveReportilterPayload = (payload) => ({
  type: SAVE_REPORT_FILTER_PAYLOAD,
  payload
});
export const clearReportilterPayload = () => ({
  type: CLEAR_REPORT_FILTER_PAYLOAD
})