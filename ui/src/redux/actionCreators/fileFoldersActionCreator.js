import axios from 'axios';
import i18n from 'i18next';
import { toast } from 'react-toastify';
import ItemType from '../../components/Types/itemType';

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

const removeFolder = (payload) => ({
  type: types.REMOVE_FOLDER,
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

const addFile = (payload) => ({
  type: types.CREATE_FILE,
  payload,
});

const addFiles = (payload) => ({
  type: types.ADD_FILES,
  payload,
});

const removeFile = (payload) => ({
  type: types.REMOVE_FILE,
  payload,
})

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
    toast.success(i18n.t('success.folder'));
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

export const createFile = (data) => async (dispatch) => {
  const requestBody = {
    parentPath: data.parent,
    fileName: data.name,
    fileType: data.type,
  }

  try {
    const response = await axios.post(
      '/api/createFile',
      requestBody
    );

    const newFileNode = response.data.node;

    dispatch(addFile(newFileNode));
    toast.success(i18n.t('success.file'));

    // TODO: Open app in correct OnlyOffice app
    console.log("Now open file in correct ONLYOFFICE app");
  } catch (error) {
    console.error("Failed to create file:", error);
  }
}

export const uploadFiles = (data, onSuccess) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await axios.post(
      '/api/upload',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    const parent = data.get('parentPath');
    await dispatch(getFiles(parent));

    toast.success(i18n.t('success.upload'));

    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } catch (err) {
    console.error("Failed to upload files:", err);
    toast.error(i18n.t('error.upload'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const renameItem = (data) => async (dispatch) => {
  const { parent, currItem, name, type } = data;

  dispatch(setLoading(true));
  try {
    const response = await axios.post('/api/rename', {
      parentPath: parent,
      currFile: currItem,
      newName: name,
    });

    const newFileNode = response.data.node;

    if (type === ItemType.FILE) {
      dispatch(removeFile(currItem));
      dispatch(addFile(newFileNode));
    } else {
      dispatch(removeFolder(currItem));
      dispatch(addFolder(newFileNode));
    }

    toast.success(i18n.t(`success.rename.${type}`));
  } catch (err) {
    console.error(`Failed to rename ${type}:`, err);
    toast.error(i18n.t(`error.rename.${type}`));
  } finally {
    dispatch(setLoading(false));
  }
};

export const downloadFile = (data) => async () => {
  try {
    const response = await axios.get('/api/download', {
      params: { path: data.path },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', data.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success(t('download.started'));
  } catch (err) {
    console.error('Download failed:', err);
    toast.error(t('error.download'));
  }
}

export const deleteItem = (data) => async (dispatch) => {
  const { path, name, type } = data;
  try {
    await axios.delete('/api/delete', { params: { path } });
    if (type === ItemType.FOLDER) {
      dispatch(removeFolder(name));
    } else {
      dispatch(removeFile(name));
    }
    toast.success(i18n.t(`success.delete.${type}`));
  } catch (err) {
    console.error(`Failed to delete ${type}:`, err);
    toast.error(i18n.t(`error.delete.${type}`));
  }
}
