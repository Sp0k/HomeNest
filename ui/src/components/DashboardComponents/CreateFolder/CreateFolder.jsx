import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { createFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';
import { toast } from 'react-toastify';

import ModalOverlay from '../../Common/ModalOverlay/ModalOverlay';

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
          setIsCreateFolderModalOpen(false);
        } else {
          toast.error(t('error.folder.already.exists'));
        }
      } else {
        toast.error(t('error.folder.name.short'));
      }
    } else {
      toast.error(t('error.folder.name.empty'));
    }
  }

  return (
    <ModalOverlay title={t('create.folder')} onClose={() => setIsCreateFolderModalOpen(false)}>
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
    </ModalOverlay>
  );
}

export default CreateFolder
