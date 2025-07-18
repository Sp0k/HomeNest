import axios from 'axios';
import i18n from 'i18next';

import * as types from "../actionTypes/fileFoldersActionTypes";

// actions

const addFolder = (payload) => ({
  type: types.CREATE_FOLDER,
  payload,
});

// action creators

export const createFolder = (data) => async (dispatch) => {
  const requestBody = {
    parentPath: data.parent,
    folderName: data.name,
  };

  try {
    const response = await axios.post(
      '/api/createFolder',
      requestBody
    );

    const newFolderNode = response.data.node;

    dispatch(addFolder(newFolderNode));
    alert(i18n.t('success.folder'));
  } catch (error) {
    console.error("Failed to create folder:", error);
  }
};
