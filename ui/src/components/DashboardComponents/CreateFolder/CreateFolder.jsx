import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { createFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';

const CreateFolder = ({ setIsCreateFolderModalOpen }) => {
  const { t } = useTranslation();
  const [folderName, setFolderName] = useState("");
  const { userFolders, currentFolder } = useSelector(
    (state) => ({
      userFolders: state.fileFolders.userFolders,
      currentFolder: state.fileFolders.currentFolder,
    }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const checkFolderAlreadyExists = (name) => {
    if (userFolders == null) return false;

    const folderPresent = userFolders.find((folder) => folder.name === name);
    if (folderPresent)
      return true;
      else
      return false;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName) {
      if (folderName.length >= 3) {
        if (!checkFolderAlreadyExists(folderName)) {
          const data = {
            name: folderName,
            parent: currentFolder,
          };
          dispatch(createFolder(data));
        } else {
          alert(t('error.folder.already.exists'))
        }
      } else {
        alert(t('error.folder.name.short'));
      }
    } else {
      alert(t('error.folder.name.empty'));
    }
  }

  return (
    <div 
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: "rgba(0, 0, 0, 0.4)", zIndex: 9999 }}
    >
      <div className='row align-items-center justify-content-center'>
        <div className="col-md-4 mt-5 bg-white rounded p-4">
          <div className="d-flex justify-content-between">
            <h4>{t('create.folder')}</h4>
            <button className="btn" onClick={() => setIsCreateFolderModalOpen(false)}>
              <FontAwesomeIcon
                icon={faTimes}
                className="text-black"
                size="sm"
              />
            </button>
          </div>
          <hr />
          <div className='d-flex flex-column align-items-center'>
            <form className='mt-3 w-100' onSubmit={handleSubmit}>
              <div className='form-group'>
                <input
                  type="text"
                  className="form-control"
                  id="folderName"
                  placeholder={t('folder.name')}
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>
              <button
                type="submit" 
                className="btn btn-primary mt-5 form-control"
              >
                {t('create.folder')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateFolder
