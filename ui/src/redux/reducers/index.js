import { combineReducers } from "redux"
import authReducer from "./authReducer"
import fileFolderReducer from "./fileFolderReducer"

const rootReducer = combineReducers({
  auth: authReducer,
  fileFolders: fileFolderReducer,
});

export default rootReducer;
