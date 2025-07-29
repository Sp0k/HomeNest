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
    case types.REMOVE_FOLDER:
      return {
        ...state,
        userFolders: state.userFolders.filter(f => f.name !== action.payload),
      };
    case types.ADD_FILES:
      return {
        ...state,
        userFiles: action.payload,
      };
    case types.CREATE_FILE:
      return {
        ...state,
        userFiles: [...state.userFiles, action.payload],
      };
    case types.REMOVE_FILE:
      return {
        ...state,
        userFiles: state.userFiles.filter(f => f.name !== action.payload),
      };
    default: 
      return state;
  }
}

export default fileFolderReducer;
