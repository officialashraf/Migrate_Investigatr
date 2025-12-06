import axios from 'axios';
import { SET_TASK_FILTER_ID, SET_DATA, SET_HEADERS, LOG_FILTER_COUNT, SET_ERROR, SET_PAGINATION, SET_LOADING, CLEAR_SUMMARY_DATA, SET_SELECTED_RESOURCE } from '../Constants/filterConstant'
import Cookies from "js-cookie";
import { toast } from 'react-toastify';

export const setTaskFilter = (taskId, filterId) => ({

  type: SET_TASK_FILTER_ID,
  payload: { taskId, filterId },
});

export const logFilterCount = (user) => {
  console.log("filterCount", user);
  return {
    type: LOG_FILTER_COUNT,
    payload: user,
  };
};
export const clearFilterData = () => ({
  type: CLEAR_SUMMARY_DATA
});
export const setSelectedResource = (resourceData) => ({
  type: SET_SELECTED_RESOURCE,
  payload: resourceData,
});

export const fetchSummaryData =
  ({ queryPayload, page = 1, itemsPerPage = 50, starttime, endtime, file_type,aggsFields,keyword,targets,sentiments,case_id,
    unified_type,
    eventtypestring,
    event,
    mobilenumber,
    socialmedia_hashtags,
    socialmedia_from_id,
    socialmedia_from_screenname,
    serverip,
    latitude,
    longitude,
    loc,
    emails,
    date,
    person,
    org,
    language
   }) =>

    async (dispatch) => {
      console.log("fetchSummaryData called",targets);
      try {
        dispatch({ type: SET_LOADING });

        const token = Cookies.get("accessToken");

        const response = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
          {
            query: queryPayload,
            case_id:[case_id],
            keyword:keyword,
            aggs_fields:aggsFields,
            file_type: file_type,
            targets:targets,
            sentiments:sentiments,
            start_time: starttime,
            end_time: endtime,
            unified_type,
            eventtypestring,
            event,
            mobilenumber,
            socialmedia_hashtags,
            socialmedia_from_id,
            socialmedia_from_screenname,
            serverip,
            latitude: Array.isArray(latitude) ? latitude[0] || "" : latitude || "",
            longitude: Array.isArray(longitude) ? longitude[0] || "" : longitude || "",
            loc,
            emails,
            date,
            person,
            org,
            language,


            page,
            size: 50,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseData = response.data; console.log("responseData", responseData)
        const results = responseData.results; console.log("results", results)
        const totalResults = responseData.total_results; console.log("totalresults", totalResults)

        // Headers
        const headersSet = new Set();
        results.forEach((item) =>
          Object.keys(item).forEach((key) => headersSet.add(key))
        );
        const headers = Array.from(headersSet);

        // Format data (stringify nested objects)
        const formattedData = results.map((item) =>
          Object.keys(item).reduce((acc, key) => {
            // acc[key] =
            //   typeof item[key] === "object"
            //     ? JSON.stringify(item[key])
            //     : item[key];
            const value = item[key];  

            if (Array.isArray(value)) {
              acc[key] = value;   
            } else if (typeof value === "object" && value !== null) {
              acc[key] = JSON.stringify(value); 
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );

        dispatch({ type: SET_DATA, payload: formattedData });
        dispatch({ type: SET_HEADERS, payload: headers });
        dispatch({
          type: SET_PAGINATION,
          payload: {
            page,
            totalPages: Math.ceil(totalResults / itemsPerPage),
            totalResults,
          },
        });
      } catch (error) {
        dispatch({ type: SET_ERROR, payload: error.message });
        if (error.response?.data?.detail) {
          toast.error(error.response.data.detail)
          console.error("Backend error:", error.response.data.detail);
        } else {
          console.error("An error occurred:", error.message);
        }
      }
    };

