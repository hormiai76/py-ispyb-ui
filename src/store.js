import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistReducer, persistStore } from "redux-persist";
import LocalStorage from "redux-persist/lib/storage";
import promise from "redux-promise-middleware";
import thunk from "redux-thunk";
import reducer from "./redux/reducers";

const persistConfig = {
  key: "root",
  storage: LocalStorage,
  whitelist: ["user", "site"],
};

const persistedReducer = persistReducer(persistConfig, reducer);
const composedEnhancers = composeWithDevTools(applyMiddleware(thunk, promise));

export const store = createStore(persistedReducer, composedEnhancers);
export const persistor = persistStore(store);