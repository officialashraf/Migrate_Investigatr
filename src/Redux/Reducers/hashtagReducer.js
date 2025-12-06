import {
  HASHTAG_SEARCH_REQUEST,
  HASHTAG_SEARCH_SUCCESS,
  HASHTAG_SEARCH_FAIL,
  HASHTAG_SEARCH_CLEAR,
} from "../Constants/hashtagConstants.js";

const initialState = {
  loading: false,
  data: [],
  error: null,
};

const hashtagReducer = (state = initialState, action) => {
  switch (action.type) {
    case HASHTAG_SEARCH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case HASHTAG_SEARCH_SUCCESS:
      return {
        loading: false,
        data: action.payload,
        error: null,
      };

    case HASHTAG_SEARCH_FAIL:
      return {
        loading: false,
        data: [],
        error: action.payload,
      };

    case HASHTAG_SEARCH_CLEAR:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export default hashtagReducer;
