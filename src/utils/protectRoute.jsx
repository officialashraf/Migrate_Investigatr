import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
const ProtectedRoute = () => {
    const token =  Cookies.get('accessToken');; // Check if token exists
    console.log("Token:", token); 
    const location = useLocation();

    return token ? <Outlet /> : <Navigate to="/" state={{ from: location }} replace />;
};

export default ProtectedRoute;
