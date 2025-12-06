import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const LogoutUser = () => {
    const [loggedInUserId, setLoggedInUserId] = useState('');
    const token = Cookies.get('accessToken');

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setLoggedInUserId(decodedToken.id);
                console.log(decodedToken); 
                console.log("User ID:", decodedToken.id); 
            } catch (error) {
                console.error("Error decoding token:", error.message);
            }
        } else {
            console.warn("No token found in cookies");
        }
    }, [token]);

    const handleLogout = async () => {
        if (!loggedInUserId) {
            console.warn("No logged-in user ID found");
            return;
        }

        try {
            const response = await fetch(`/api/user-man/v1/user/logout/${loggedInUserId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                console.log("Logout successful");
                Cookies.remove('accessToken'); 
            } else {
                console.error("Logout failed:", response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error.message);
        }
    };

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default LogoutUser;
