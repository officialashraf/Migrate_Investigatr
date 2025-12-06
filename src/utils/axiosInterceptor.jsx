// axiosInterceptor.js
import axios from "axios";
import Cookies from "js-cookie";

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorMessage = error?.response?.data?.detail || "";

      if (
  errorMessage === "Signature has expired." ||
  errorMessage === "Signature has expired" ||
  errorMessage === "Signature expired." ||
  errorMessage === "Your license has been expired."
) {
        Cookies.remove("accessToken"); //  localStorage.removeItem()
        window.location.href = "/login"; // history.push("/login") if router
      }

      return Promise.reject(error);
    }
  );
 };