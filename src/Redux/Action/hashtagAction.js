import {
  HASHTAG_SEARCH_REQUEST,
  HASHTAG_SEARCH_SUCCESS,
  HASHTAG_SEARCH_FAIL,
  HASHTAG_SEARCH_CLEAR,
} from "../Constants/hashtagConstants.js";

export const hashtagSearchRequest = () => ({
  type: HASHTAG_SEARCH_REQUEST,
});

export const hashtagSearchSuccess = (data) => ({
  type: HASHTAG_SEARCH_SUCCESS,
  payload: data,
});

export const hashtagSearchFail = (error) => ({
  type: HASHTAG_SEARCH_FAIL,
  payload: error,
});

export const hashtagSearchClear = () => ({
  type: HASHTAG_SEARCH_CLEAR,
});
