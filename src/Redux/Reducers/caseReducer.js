import {
  SET_SELECTED_TAB,
  SET_CASE_DATA,
  SET_SUMMARY_DATA,
  SAVE_CASE_FILTER_PAYLOAD,
  CLEAR_CASE_FILTER_PAYLOAD,
} from '../Constants/caseCaontant';

const initialTabState = { selectedTab: 'default' };
export const tabReducer = (state = initialTabState, action) => {
  if (action.type === SET_SELECTED_TAB) {
    return {
      ...state,
      selectedTab: action.payload,
    };
  }
  return state;
};

export const caseReducer = (state = { caseData: {} }, action) => {
  if (action.type === SET_CASE_DATA) {
    return {
      ...state,
      caseData: action.payload,
    };
  }
  return state;
};

const initialSummaryState = {
  social_media: {},
  count: 0,
  dates: {},
};
export const summaryReducer = (state = initialSummaryState, action) => {
  if (action.type === SET_SUMMARY_DATA) {
    return {
      ...state,
      social_media: action.payload.social_media,
      count: action.payload.count,
      dates: action.payload.dates,
    };
  }
  return state;
};

const initialFilterState = {
  caseFilters: {
    caseId: [],
    file_type: [],
    start_time: "",
    end_time: "",
    aggs_fields: [],
    keyword: [],
    sentiment: [],
    target: [],
    unified_type: [],
    eventtypestring: [],
    mobilenumber: [],
    socialmedia_hashtags: [],
    socialmedia_from_id: [],
    socialmedia_from_screenname: [],
    serverip: [],
    latitude: "",
    longitude: "",
    loc: [],
    emails: [],
    event: [],
    date: [],
    person: [],
    org: [],
    language: []
  },
};
export const CaseFilterPayloadReducer = (state = initialFilterState, action) => {
  if (action.type === SAVE_CASE_FILTER_PAYLOAD) {
    return {
      ...state,
      caseFilters: {
        caseId: action.payload.caseId || [],
        file_type: action.payload.file_type || [],
        start_time: action.payload.start_time || "",
        end_time: action.payload.end_time || "",
        aggs_fields: action.payload.aggs_fields || [],
        keyword: action.payload.keyword || [],
        sentiment: action.payload.sentiment || [],
        target: action.payload.target || [],
        unified_type: action.payload.unified_type || [],
        eventtypestring: action.payload.eventtypestring || [],
        mobilenumber: action.payload.mobilenumber || [],
        socialmedia_hashtags: action.payload.socialmedia_hashtags || [],
        socialmedia_from_id: action.payload.socialmedia_from_id || [],
        socialmedia_from_screenname: action.payload.socialmedia_from_screenname || [],
        serverip: action.payload.serverip || [],
        latitude: action.payload.latitude || "",
        longitude: action.payload.longitude || "",
        event: action.payload.event || [],
        loc: action.payload.loc || [],
        emails: action.payload.emails || [],
        date: action.payload.date || [],
        person: action.payload.person || [],
        org: action.payload.org || [],
        language: action.payload.language || [],
      },
    };
  }

  if (action.type === CLEAR_CASE_FILTER_PAYLOAD) {
    return {
      ...state,
      caseFilters: {
        ...state.caseFilters,
        caseId: state.caseFilters.caseId, // Preserve current caseId
        file_type: [],
        start_time: "",
        end_time: "",
        aggs_fields: [],
        keyword: [],
        target: [],
        sentiment: [],
        unified_type: [],
        eventtypestring: [],
        mobilenumber: [],
        socialmedia_hashtags: [],
        socialmedia_from_id: [],
        socialmedia_from_screenname: [],
        serverip: [],
        latitude: "",
        longitude: "",
        event: [],
        loc: [],
        emails: [],
        date: [],
        person: [],
        org: [],
        language: []
      },
    };
  }

  return state;
};
