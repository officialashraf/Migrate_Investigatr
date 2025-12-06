import { SET_SEARCH_RESULTS, SET_PAGE, CLOSE_POPUP, OPEN_POPUP, SET_KEYWORDS, CLEAR_CRITERIA, SET_SELECTED_CRITERIA_RESOURCE } from "../Constants/criteriaConstant";

// Redux Reducer
const initialState = {
  searchResults: [],
  totalPages: 1,
  totalResults: 0,
  currentPage: 1,
  selectedResource: null,
};
export const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload.results || [],
        totalPages: action.payload.total_pages || 1,
        totalResults: action.payload.total_results || 0,
      };
    case SET_PAGE:
      return {
        ...state,
        currentPage: action.payload,
      };
    case SET_SELECTED_CRITERIA_RESOURCE:
      return {
        ...state,
        selectedResource: action.payload,
      };
    default:
      return state;
  }
};

export const popupReducer = (state = { activePopup: null }, action) => {
  console.log("Reducer Called:", action);
  switch (action.type) {
    case OPEN_POPUP:
      return {
        ...state,
        activePopup: action.payload, // Set active popup
      };

    case CLOSE_POPUP:
      return {
        ...state,
        activePopup: null, // Close the popup
      };

    default:
      return state; // Return current state for unhandled actions
  }
};

const queryState = {
  keywords: [],
  queryPayload: {
    case_id: [],
    file_type: [],
    keyword: [],
    targets: [],
    sentiment: [],
    start_time: null,
    end_time: null,
    unified_type: [],
    eventtypestring: [],
    mobilenumber: [],
    socialmedia_hashtags: [],
    socialmedia_from_id: [],
    socialmedia_from_screenname: [],
    serverip: [],
    loc: [],
    emails: [],
    event: [],
    date: [],
    person: [],
    org: [],
    language: [],
    latitude: null,
    longitude: null,
    page: 1,
  }
};

export const criteriaReducer = (state = queryState, action) => {
  console.log("critereraaylo", queryState)
  switch (action.type) {
   case SET_KEYWORDS:
  return {
    ...state,
    keywords: action.payload.keyword || [],
    queryPayload: {
      ...state.queryPayload,
      case_id: action.payload.queryPayload?.case_id || [],
      file_type: action.payload.queryPayload?.file_type || [],
      keyword: action.payload.queryPayload?.keyword || [],
      targets: action.payload.queryPayload?.targets || [],
      sentiments: action.payload.queryPayload?.sentiment || [],
      start_time: action.payload.queryPayload?.start_time ?? null,
      end_time: action.payload.queryPayload?.end_time ?? null,
      unified_type: action.payload.queryPayload?.unified_type || [],
      eventtypestring: action.payload.queryPayload?.eventtypestring || [],
      mobilenumber: action.payload.queryPayload?.mobilenumber || [],
      socialmedia_hashtags: action.payload.queryPayload?.socialmedia_hashtags || [],
      socialmedia_from_id: action.payload.queryPayload?.socialmedia_from_id || [],
      socialmedia_from_screenname: action.payload.queryPayload?.socialmedia_from_screenname || [],
      serverip: action.payload.queryPayload?.serverip || [],
      latitude: action.payload.queryPayload?.latitude ?? null,
      longitude: action.payload.queryPayload?.longitude ?? null,
      page: action.payload.queryPayload?.page ?? 1,
      loc: action.payload.queryPayload?.loc || [],
      emails: action.payload.queryPayload?.emails || [],
      event: action.payload.queryPayload?.event || [],
      date: action.payload.queryPayload?.date || [],
      person: action.payload.queryPayload?.person || [],
      org: action.payload.queryPayload?.org || [],
      language: action.payload.queryPayload?.language || [],
    }
  };
  
    case CLEAR_CRITERIA:
      return {
        ...queryState,
      };

    default:
      return state;
  }
};
