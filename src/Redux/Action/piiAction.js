import {
  SEARCH_REQUEST,
  SEARCH_SUCCESS,
  SEARCH_FAILURE,
} from "../Constants/piiConstant";

export const searchRequest = () => ({ type: SEARCH_REQUEST });
export const searchSuccess = (data) => ({ type: SEARCH_SUCCESS, payload: data });
export const searchFailure = (error) => ({ type: SEARCH_FAILURE, payload: error });
