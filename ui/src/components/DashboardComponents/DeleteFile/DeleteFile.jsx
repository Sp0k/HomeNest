import { useTranslation } from "react-i18next";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { deleteItem } from "../../../redux/actionCreators/fileFoldersActionCreator";
import ItemType from "../../Types/itemType";
import ModalOverlay from "../../Common/ModalOverlay/ModalOverlay";

const DeleteItem = ({ item, setIsDeleteItemModalOpen, setTargetItem }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { userFolders } = useSelector(
    state => ({
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
    setTargetItem(null);
  }

  return (
    <ModalOverlay title={t(`delete.${getType()}`)} onClose={() => setIsDeleteItemModalOpen(false)}>
      <p>{t('delete.message.1')}&nbsp;<em>{item.name}</em>{t('delete.message.2')}</p>
      <div className="d-flex flex-row align-items-center justify-content-around w-100">
        <button className='btn btn-danger' onClick={() => setIsDeleteItemModalOpen(false)}>
          {t('cancel')}
        </button>
        <button className='btn btn-primary' onClick={handleDelete}>
          {t('confirm')}
        </button>
      </div>
    </ModalOverlay>
  );
}

export default DeleteItem;
