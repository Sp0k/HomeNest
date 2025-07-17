const initialState = {
  isLoading: false,
  currentFolder: "",
  userFolders: [],
  userFiles: [],
}

const fileFolderReducer = (state = initialState, action) => {
  switch (action.type) {
    default: return state;
  }
}

export default fileFolderReducer;
