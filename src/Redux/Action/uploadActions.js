export const ADD_UPLOAD = 'ADD_UPLOAD';
export const UPDATE_UPLOAD_PROGRESS = 'UPDATE_UPLOAD_PROGRESS';
export const REMOVE_UPLOAD = 'REMOVE_UPLOAD'; 
export const POPUP_CLOSED = 'POPUP_CLOSED';

export const addUpload = (uploadData) => ({
    type: ADD_UPLOAD,
    payload: uploadData
});

export const updateUploadProgress = (progress) => ({
    type: UPDATE_UPLOAD_PROGRESS,
    payload: {progress }
});
        
export const removeUpload = () => ({
    type: REMOVE_UPLOAD
});

export const popupClosed = () => ({ 
    type: POPUP_CLOSED
});