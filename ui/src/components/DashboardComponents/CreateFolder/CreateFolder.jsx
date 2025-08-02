import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { createFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';
import { toast } from 'react-toastify';

import FormModal from '../../Common/FormModal/FormModal';

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
    <FormModal
      title={t('create.folder')}
      confirmText={t('create.folder')}
      onConfirm={handleSubmit}
      onCancel={() => setIsCreateFolderModalOpen(false)}
    >
      <div className='form-group w-100'>
        <input
          type="text"
          className="form-control"
          id="folderName"
          placeholder={t('folder.name')}
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
      </div>
    </FormModal>
  );
}

export default CreateFolder
