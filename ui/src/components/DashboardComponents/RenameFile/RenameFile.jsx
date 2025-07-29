import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import ItemType from '../../Types/itemType';
import { useTranslation } from 'react-i18next';
import { renameItem } from '../../../redux/actionCreators/fileFoldersActionCreator';

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
    <div 
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: "rgba(0, 0, 0, 0.4)", zIndex: 9999 }}
    >
      <div className='row align-items-center justify-content-center'>
        <div className="col-md-4 mt-5 bg-white rounded p-4">
          <div className="d-flex justify-content-between">
            <h4>{t('rename')}</h4>
            <button className="btn" onClick={() => setIsRenameItemModalOpen(false)}>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default RenameItem;
