
import { configureStore } from '@reduxjs/toolkit'
import { CaseFilterPayloadReducer, caseReducer, tabReducer } from './Reducers/caseReducer'
import { filterReducer, summaryDataReducer, taskFilterReducer } from './Reducers/filterReducer';
import { persistStore, persistReducer,FLUSH,REHYDRATE,PURGE,PAUSE,REGISTER,PERSIST } from "redux-persist"; 
 
import storage from "redux-persist/lib/storage"; // Local Storage ke liye
import { combineReducers } from "redux";
import { searchReducer, popupReducer, criteriaReducer } from './Reducers/criteriaReducer';
import { thunk } from "redux-thunk";
import searchReducer1 from './Reducers/piiReducer';
import reportReducer, { ReportFilterPayloadReducer } from './Reducers/reportReducer';
import { userReducer } from './Reducers/userReducer';
import uploadReducer from './Reducers/uploadReducer';
import hashtagReducer from './Reducers/hashtagReducer';

const persistConfig = {
  key: "root",
  storage,
  blacklist: ['search'],
};

const rootReducer = combineReducers({
  user: userReducer,
  selectedTab: tabReducer,
  taskFilterId: taskFilterReducer,
  caseData: caseReducer,
  upload: uploadReducer,
  filterData: summaryDataReducer,
  summaryData: summaryDataReducer,
  filterCount: filterReducer,
  search: searchReducer,
  popup: popupReducer,
  pii: searchReducer1,
  criteriaKeywords: criteriaReducer,
  report: reportReducer,
  caseFilter:CaseFilterPayloadReducer,
   reportFilter:ReportFilterPayloadReducer,
    hashtagSearch: hashtagReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

//  Configure Store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: process.env.NODE_ENV !== "production",
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(thunk),
});

console.log(store.getState());
export const persistor = persistStore(store);
export default store;

