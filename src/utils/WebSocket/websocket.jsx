let socket = null;
let reconnectInterval = null;
let isConnecting = false;

export const connectWebSocket = (username, onMessage) => {
  if (!username) {
    console.error("Username is undefined. WebSocket connection cannot be established.");
    return;
  }

  // Prevent multiple connections
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log("WebSocket already connected or connecting");
    return;
  }

  // Prevent multiple connection attempts
  if (isConnecting) {
    console.log("WebSocket connection already in progress");
    return;
  }

  isConnecting = true;

  try {
    socket = new WebSocket(`${window.runtimeConfig.VITE_APP_API_NOTIFICATION}/ws/${username}`);
    console.log("WebSocket connection initiated for:", username);

    socket.onopen = () => {
      console.log("WebSocket connected successfully");
      isConnecting = false;
      // Clear any existing reconnection attempts
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    };

    socket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      if (onMessage) onMessage(event);
    };

    socket.onclose = (event) => {
      console.log("WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
      isConnecting = false;
      socket = null;

      // Only reconnect if it wasn't a manual close (code 1000) and username still exists
      if (event.code !== 1000 && username) {
        console.log("Attempting to reconnect...");
        reconnectInterval = setTimeout(() => {
          connectWebSocket(username, onMessage);
        }, 3000);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      isConnecting = false;
      socket = null;
    };

  } catch (error) {
    console.error("Failed to create WebSocket:", error);
    isConnecting = false;
    socket = null;
  }
};

export const disconnectWebSocket = () => {
  console.log("Disconnecting WebSocket...");
  
  // Clear reconnection interval first
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }

  if (socket) {
    try {
      // Remove event listeners to prevent unwanted reconnections
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      socket.onopen = null;

      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, "Manual disconnect"); // Use code 1000 for normal closure
      }
    } catch (err) {
      console.error("WebSocket disconnect error:", err);
    } finally {
      socket = null;
      isConnecting = false;
    }
  }
};

// Get current socket status
export const getSocketStatus = () => {
  if (!socket) return 'CLOSED';
  
  switch (socket.readyState) {
    case WebSocket.CONNECTING: return 'CONNECTING';
    case WebSocket.OPEN: return 'OPEN';
    case WebSocket.CLOSING: return 'CLOSING';
    case WebSocket.CLOSED: return 'CLOSED';
    default: return 'UNKNOWN';
  }
};



