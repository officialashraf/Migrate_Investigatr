
import { SET_TASK_FILTER_ID, SET_HEADERS, SET_DATA, LOG_FILTER_COUNT, SET_PAGINATION, SET_LOADING, SET_ERROR, CLEAR_SUMMARY_DATA, SET_SELECTED_RESOURCE } from "../Constants/filterConstant";

const initialState = {
  taskId: null,
  filterId: null,
};
export const taskFilterReducer = (state = initialState, action) => {
  if (action.type === SET_TASK_FILTER_ID) {
    return {
      ...state,
      taskId: action.payload.taskId,
      filterId: action.payload.filterId,
    };
  }
  return state;
};

export const filterReducer = (state = { filterCount: {} }, action) => {
  if (action.type === LOG_FILTER_COUNT) {
    return {
      ...state,
      filterCount: action.payload,
    };
  }
  return state;
};

const initialState1 = {
  data: [],
  headers: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
  loading: false,
  error: null,
  selectedResource: null,
};
export const summaryDataReducer = (state = initialState1, action) => {
  switch (action.type) {
    case CLEAR_SUMMARY_DATA:
      return { ...state, data: [], headers: [], totalResults: 0, totalPages: 0, page: 1 };
    case SET_DATA:
      return { ...state, data: action.payload, loading: false };
    case SET_HEADERS:
      return { ...state, headers: action.payload };
    case SET_PAGINATION:
      return {
        ...state,
        page: action.payload.page,
        totalPages: action.payload.totalPages,
        totalResults: action.payload.totalResults,
      };
    case SET_LOADING:
      return { ...state, loading: true, error: null };
    case SET_ERROR:
      return { ...state, loading: false, error: action.payload };
    case SET_SELECTED_RESOURCE:
      return {
        ...state,
        selectedResource: action.payload,
      };
    default:
      return state;
  }
};
