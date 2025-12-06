// useWebSocket.js - Fixed Implementation
import { useEffect, useState, useRef } from "react";
import { connectWebSocket, disconnectWebSocket } from "./websocket";
import { useSelector } from "react-redux";

const useWebSocket = () => {
  const username = useSelector((state) => state.user?.username);
  const [notificationCount, setNotificationCount] = useState(0);
  const previousUsernameRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Check if username has changed
    const usernameChanged = previousUsernameRef.current !== username;
   
    // If username is cleared (logout), disconnect
    if (!username && previousUsernameRef.current) {
      console.log("Username cleared, disconnecting WebSocket");
      disconnectWebSocket();
      isConnectedRef.current = false;
      previousUsernameRef.current = null;
      return;
    }

    // If we have a username and it's different from previous or we're not connected
    if (username && (usernameChanged || !isConnectedRef.current)) {
      console.log("Connecting WebSocket for user:", username);
      
      // Disconnect existing connection if username changed
      if (usernameChanged && isConnectedRef.current) {
        disconnectWebSocket();
      }

      connectWebSocket(username, (event) => {
        try {
          const data = event.data;
          console.log("Incoming WebSocket data:", data);
          
          if (data) {
            // You can add more sophisticated parsing here if needed
            setNotificationCount((prev) => prev + 1);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      });

      isConnectedRef.current = true;
      previousUsernameRef.current = username;
    }

    // Cleanup function
    return () => {
      // Only disconnect if component is unmounting, not on every render
      if (!username) {
        disconnectWebSocket();
        isConnectedRef.current = false;
      }
    };
  }, [username]); // Only depend on username

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return { 
    notificationCount, 
    setNotificationCount,
    isConnected: isConnectedRef.current
  };
};

export default useWebSocket;


