    // uploadReducer.js

import { ADD_UPLOAD, UPDATE_UPLOAD_PROGRESS, REMOVE_UPLOAD, POPUP_CLOSED } from '../Action/uploadActions';

    const initialState = {
         currentUpload: null 
    };

    const uploadReducer = (state = initialState, action) => {
        switch (action.type) {
            case ADD_UPLOAD:
                return {
                    ...state,
                    // Ek naya upload array mein add karna
                    currentUpload: action.payload 
                };

            case UPDATE_UPLOAD_PROGRESS:
                return {
                    ...state,
                    // Sahi upload ID dhundhkar uska progress update karna
                    currentUpload: {
                        ...state.currentUpload,
                        progress: action.payload.progress
                    }
                };
            case POPUP_CLOSED: // Visibility control ke liye
                if (!state.currentUpload) return state;
                return {
                    ...state,
                    currentUpload: {
                        ...state.currentUpload,
                        isPopupOpen: false // Popup band, ab Global Tracker dikhna chahiye
                    }
                };    

            case REMOVE_UPLOAD:
                return {
                    ...state,
                    // Upload ID match hone par use list se nikal dena
                    currentUpload: null
                };

            default:
                return state;
        }
    };

    export default uploadReducer;