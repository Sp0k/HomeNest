import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";

import ItemType from "../../Types/itemType";
import { deleteItem } from "../../../redux/actionCreators/fileFoldersActionCreator";

const DeleteItem = ({ item, setIsDeleteItemModalOpen, setTargetItem }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { currentFolder, userFiles, userFolders } = useSelector(
    state => ({
      currentFolder: state.fileFolders.currentFolder,
      userFiles: state.fileFolders.userFiles,
      userFolders: state.fileFolders.userFolders,
    }), shallowEqual
  );

  const getType = (name) => {
    if (userFolders.find(f => f.name === name))
      return ItemType.FOLDER;
    return ItemType.FILE;
  }

  const handleDelete = () => {
    const data = {
      path: item.path,
      name: item.name,
      type: getType(item.name),
    };
    dispatch(deleteItem(data));
    setIsDeleteItemModalOpen(false);
  }

  return (
    <div 
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: "rgba(0, 0, 0, 0.4)", zIndex: 9999 }}
    >
      <div className='row align-items-center justify-content-center'>
        <div className="col-md-4 mt-5 bg-white rounded p-4">
          <div className="d-flex justify-content-between">
            <h4>{t('delete')}</h4>
            <button className="btn" onClick={() => setIsDeleteItemModalOpen(false)}>
              <FontAwesomeIcon
                icon={faTimes}
                className="text-black"
                size="sm"
              />
            </button>
          </div>
          <hr />
          <div className='d-flex flex-column align-items-center'>
            <p>{t('delete.message.1')}&nbsp;<em>{item.name}</em>{t('delete.message.2')}</p>
            <div className="d-flex flex-row align-items-center justify-content-around w-100">
              <button className='btn btn-danger' onClick={() => setIsDeleteItemModalOpen(false)}>
                {t('cancel')}
              </button>
              <button className='btn btn-primary' onClick={handleDelete}>
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteItem;
