import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDropzone } from 'react-dropzone';

import './UploadFile.css';
import { uploadFiles } from '../../../redux/actionCreators/fileFoldersActionCreator';
import { toast } from 'react-toastify';

const UploadFile = ({ setIsUploadFileModalOpen }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { userFiles, currentFolder } = useSelector(
    state => ({
      userFiles: state.fileFolders.userFiles,
      currentFolder: state.fileFolders.currentFolder,
    }),
    shallowEqual
  );

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    multiple: true,
    noClick: false,
    noKeyboard: true
  });

  const formatBytes = (bytes, decimal = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimal < 0 ? 0 : decimal;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const checkFileAlreadyExists = (name) => {
    if (userFiles === null) return false;

    const filePresent = userFiles.find(file => file.name === name);
    if (filePresent)
      return true;
      else
      return false;
  }

  const fileList = acceptedFiles.map(file => {
    const displayPath = file.name;
    return (
      <li key={displayPath}>
        {displayPath} — {formatBytes(file.size)}
      </li>
    );
  });

  const handleSubmit = e => {
    e.preventDefault();

    if (acceptedFiles.length === 0) {
      toast.error(t('error.no.file.selected'));
      return;
    }

    let filesExists = false;
    acceptedFiles.forEach(file => {
        if (checkFileAlreadyExists(file.name))
          filesExists = true;
    })
    if (filesExists) {
      toast.error(t('error.file.already.exists'));
      return;
    }

    const formData = new FormData();
    formData.append('parentPath', currentFolder);
    acceptedFiles.forEach(file => {
      const rel = file.path || file.webkitRelativePath || file.name;
      formData.append('files', file, rel);
    });
    dispatch(uploadFiles(formData));
    setIsUploadFileModalOpen(false);
  };


  return (
    <div
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 9999 }}
    >
      <div className="row align-items-center justify-content-center">
        <div className="col-md-4 mt-5 bg-white rounded p-4">
          <div className="d-flex justify-content-between">
            <h4>{t('upload.file')}</h4>
            <button className="btn" onClick={() => setIsUploadFileModalOpen(false)}>
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </button>
          </div>
          <hr />

          <form onSubmit={handleSubmit} className="mt-3">
            <section className="container">
              <div
                {...getRootProps({
                  className: `dropzone ${isDragActive ? 'dropzone--active' : ''}`
                })}
              >
                <input {...getInputProps()} />
                <p>{isDragActive ? t('drop.file') : t('select.file')}</p>
              </div>
              <aside className="mt-2">
                <h4>{t('files')}</h4>
                <ul>{fileList}</ul>
              </aside>
            </section>

            <button type="submit" className="btn btn-primary mt-4 w-100">
              {t('upload.file')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
