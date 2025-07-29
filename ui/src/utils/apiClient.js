import axios from 'axios';

const apiClient = {
  // Folder endpoints
  createFolder: (parentPath, folderName) =>
    axios.post('/api/createFolder', { parentPath, folderName }),

  getFolders: (path) =>
    axios.get('/api/getFolders', { params: { path } }),

  // File endpoints
  getFiles: (path) =>
    axios.get('/api/getFiles', { params: { path } }),

  createFile: (parentPath, fileName, fileType) =>
    axios.post('/api/createFile', { parentPath, fileName, fileType }),

  uploadFiles: (formData) =>
    axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  downloadFile: (path) =>
    axios.get('/api/download', { params: {path}, responseType: 'blobl' }),

  // Rename, delete
  renameItem: (parentPath, currentName, newName, type) =>
    axios.post('/api/rename', { parentPath, currentName, newName, type }),

  deleteItem: (path) =>
    axios.delete('/api/delete', { params: { path } }),
};

export default apiClient;
