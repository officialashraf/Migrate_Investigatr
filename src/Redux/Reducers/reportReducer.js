import {
  SET_REPORT_RESULTS,
  SAVE_REPORT_FILTER_PAYLOAD,
  CLEAR_REPORT_FILTER_PAYLOAD,
  CLEAR_REPORT_RESULTS,
} from "../Constants/reportConstant";

const initialState = {
  results: null,
  total_pages: 1,
  total_results: 0,
};

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_REPORT_RESULTS:
      return {
        ...state,
        page: action.payload.page || 1,
        results: action.payload.results || [],
        total_pages: action.payload.total_pages || 1,
        total_results: action.payload.total_results || 0,
      };

    case CLEAR_REPORT_RESULTS:
      return initialState; //  clear karte time fir se null ho jayega

    default:
      return state;
  }
};

export default reportReducer;

export const ReportFilterPayloadReducer = (
  state = {
    reportFilters: {
      case_id: [],
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
    },
  },
  action
) => {
  switch (action.type) {
    case SAVE_REPORT_FILTER_PAYLOAD:
      return {
        ...state,
        reportFilters: {
          aggs_fields: action.payload.aggs_fields || [],
          keyword: action.payload.keyword || [],
          case_id: action.payload.case_id || [],
          target: action.payload.target || [],
          sentiment: action.payload.sentiment || [],
          unified_type: action.payload.unified_type || [],
          eventtypestring: action.payload.eventtypestring || [],
          mobilenumber: action.payload.mobilenumber || [],
          socialmedia_hashtags: action.payload.socialmedia_hashtags || [],
          socialmedia_from_id: action.payload.socialmedia_from_id || [],
          socialmedia_from_screenname:
            action.payload.socialmedia_from_screenname || [],
          serverip: action.payload.serverip || [],
          file_type: action.payload.file_type || [],
          start_time: action.payload.start_time || "",
          end_time: action.payload.end_time || "",
          latitude: action.payload.latitude || "",
          longitude: action.payload.longitude || "",
        },
      };

    case CLEAR_REPORT_FILTER_PAYLOAD:
      return {
        ...state,
        reportFilters: {
          case_id: [],
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
        },
      };

    default:
      return state;
  }
};