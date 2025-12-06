import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import originalWarn from './utils/warn';
import { Provider } from "react-redux"
import store, { persistor } from "./Redux/store"; // Store aur Persistor import karo
import { PersistGate } from "redux-persist/integration/react";
import './Component/Style/DesignTokens/designTokens.css';
import '@fontsource/roboto';
import './i18n';  // import i18n configuration
import SetupLocalStorageExpiry from './utils/locatStorageExpiry';


// SetupLocalStorageExpiry();
const loadConfig = async () => {

const timestamp = new Date().getTime();
    const response = await fetch(`/config.json?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

  const config = await response.json();
  window.runtimeConfig = config;
};

loadConfig().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>

      <Provider store={store} >
        <PersistGate loading={null} persistor={persistor}>
          <App />
          <ToastContainer
            position="top-center" // Position of the toasts
            autoClose={5000} // Auto close after 2000ms
            closeOnClick={true} // Close when clicked
            transition={Zoom} // Zoom effect for transitions
            pauseOnHover // Pause timer when hovered
            newestOnTop
            hideProgressBar={true}
          />
        </PersistGate>
      </Provider>

    </React.StrictMode>
  );
  originalWarn();
  reportWebVitals();
});



