import axios from 'axios';
import i18n from 'i18next';

import * as types from "../actionTypes/fileFoldersActionTypes";

// actions

const addFolder = (payload) => ({
  type: types.CREATE_FOLDER,
  payload,
});

const addFolders = (payload) => ({
  type: types.ADD_FOLDERS,
  payload,
});

const setLoading = (payload) => ({
  type: types.SET_LOADING,
  payload,
});

const setChangeFolder = (payload) => ({
  type: types.CHANGE_FOLDER,
  payload,
});

const addFiles = (payload) => ({
  type: types.ADD_FILES,
  payload,
});

const createFiles = (payload) => ({
  type: types.CREATE_FILE,
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

export const getFolders = (parentPath = "/") => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(
      '/api/getFolders',
      { params: { path: parentPath }, }
    );

    const nodes = response.data;

    dispatch(addFolders(nodes || []));
    dispatch(setLoading(false));
  } catch (error) {
    console.error("Failed to load folder:")
  }
};

export const changeFolder = (folderId) => async (dispatch) => {
  dispatch(setChangeFolder(folderId));
  await dispatch(getFolders(folderId));
}

export const getFiles = (parentPath = "/") => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(
      '/api/getFiles',
      { params: { path: parentPath }, }
    );

    const nodes = response.data;
    dispatch(addFiles(nodes || []));
    dispatch(setLoading(false));
  } catch (error) {
    console.error("Failed to load files:");
  }
};
