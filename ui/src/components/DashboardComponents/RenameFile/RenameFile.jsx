import { useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { renameItem } from '../../../redux/actionCreators/fileFoldersActionCreator';
import ItemType from '../../Types/itemType';
import ModalOverlay from '../../Common/ModalOverlay/ModalOverlay';

const RenameItem = ({ item, setIsRenameItemModalOpen, setRenameItem }) => {
  const { t } = useTranslation();
  const { userFolders, userFiles, currentFolder } = useSelector(
    state => ({
      userFolders: state.fileFolders.userFolders,
      userFiles: state.fileFolders.userFiles,
      currentFolder: state.fileFolders.currentFolder,
    }), shallowEqual
  );

  const [newName, setNewName] = useState("");

  const dispatch = useDispatch();

  const checkIfAlreadyExists = (name, type) => {
    if (type === ItemType.FOLDER) {
      const folderPresent = userFolders.find(f => f.name === name);
      if (folderPresent)
        return true;
      return false;
    } else {
      const filePresent = userFiles.find(f => f.name === name);
      if (filePresent)
        return true;
      return false;
    }
  }

  const getType = (name) => {
    if (userFolders.find(f => f.name === name))
      return ItemType.FOLDER;
    return ItemType.FILE;
  }

  const getFileExt = filename => {
    const idx = filename.lastIndexOf('.');
    return idx === -1 ? "" : filename.substring(idx+1);
  }

  const getFullName = (name) => {
    const ext = getFileExt(item.name);
    if (ext.length > 0) {
      name = name + '.' + ext;
    }
    return name;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const type = getType(item.name);
    if (newName) {
      if (newName.length >= 3) {
        const fullname = getFullName(newName);
        if (!checkIfAlreadyExists(fullname, type)) {
          const data = {
            currItem: item.name,
            name: getFullName(newName),
            parent: currentFolder,
            type: type,
          };
          dispatch(renameItem(data));
          setIsRenameItemModalOpen(false);
          setRenameItem(null);
        } else {
          toast.error(t(`error.${type}.already.exists`));
        }
      } else {
        toast.error(t(`error.${type}.name.short`));
      }
    } else {
      toast.error(t(`error.${type}.name.empty`));
    }
  }

  return (
    <ModalOverlay title={t(`rename.${getType(item.name)}`)} onClose={() => setIsRenameItemModalOpen(false)}>
      <form className='mt-3 w-100' onSubmit={handleSubmit}>
        <div className='form-group'>
          <input
            type="text"
            className="form-control"
            id="rename"
            placeholder={t('rename.placeholder')}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <button
          type="submit" 
          className="btn btn-primary mt-5 form-control"
        >
          {t('rename')}
        </button>
      </form>
    </ModalOverlay>
  );
}

export default RenameItem;
