import { useTranslation } from "react-i18next";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { deleteItem } from "../../../redux/actionCreators/fileFoldersActionCreator";
import { getItemType } from "../../../utils/itemTypeUtils";

import FormModal from "../../Common/FormModal/FormModal";


const DeleteItem = ({ item, setIsDeleteItemModalOpen, setTargetItem }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { userFolders } = useSelector(
    state => ({
      userFolders: state.fileFolders.userFolders,
    }), shallowEqual
  );

  const handleDelete = () => {
    const data = {
      path: item.path,
      name: item.name,
      type: getItemType(item.name, userFolders),
    };
    dispatch(deleteItem(data));
    setIsDeleteItemModalOpen(false);
    setTargetItem(null);
  }

  return (
    <FormModal
        title={t(`delete.${getItemType(item.name, userFolders)}`)}
        confirmText={t('delete')}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteItemModalOpen(false)}
      >
      <p>{t('delete.message.1')}&nbsp;<em>{item.name}</em>{t('delete.message.2')}</p>
    </FormModal>
  );
}

export default DeleteItem;
