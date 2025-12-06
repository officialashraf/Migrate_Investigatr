// reducers/userReducer.js
import { SET_USERNAME,CLEAR_USERNAME } from "../Constants/userConstant";

const initialState = {
  username: null,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USERNAME:
      return {
        ...state,
        username: action.payload,
      };
       case CLEAR_USERNAME:
      return {
        ...state,
        username: null,
      };
   
    default:
      return state;
  }
};
