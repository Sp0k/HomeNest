import * as types from "../actionTypes/fileFoldersActionTypes"

const initialState = {
  isLoading: true,
  currentFolder: "/",
  userFolders: [],
  userFiles: [],
}

const fileFolderReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CREATE_FOLDER:
      return {
        ...state,
        userFolders: [...state.userFolders, action.payload],
      };
    case types.ADD_FOLDERS:
      return {
        ...state,
        userFolders: action.payload,
      };
    case types.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case types.CHANGE_FOLDER:
      return {
        ...state,
        currentFolder: action.payload,
      };
    default: 
      return state;
  }
}

export default fileFolderReducer;
