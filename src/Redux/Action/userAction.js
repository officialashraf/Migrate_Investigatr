// actions/userActions.js
import { SET_USERNAME,CLEAR_USERNAME } from "../Constants/userConstant";

export const setUsername = (username) => {
  return {
    type: SET_USERNAME,
    payload: username,
  };
};
export const clearUsername = () => ({
  type: CLEAR_USERNAME,
});
