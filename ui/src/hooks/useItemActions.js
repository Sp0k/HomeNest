import { useNavigate } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { changeFolder, downloadFile } from "../redux/actionCreators/fileFoldersActionCreator";
import { getFileExt, getPreviewType } from "../utils/filePreviewUtils";
import { getItemType } from "../utils/itemTypeUtils";
import ItemType from "../components/Types/itemType";
import ContextAction from "../enum/contextAction";

export default function useItemActions({ 
  onPreview, 
  onNoPreview, 
  setTargetItem, 
  openRenameModal, 
  openDeleteModal 
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userFolders = useSelector(
    state => state.fileFolders.userFolders,
    shallowEqual
  ) || [];

  const getDisplayName = fileName => {
    const idx = fileName.lastIndexOf('.');
    return idx === -1 ? fileName : fileName.substring(0, idx);
  };

  const openItem = item => {
    if (getItemType(item.name, userFolders) === ItemType.FOLDER) {
      dispatch(changeFolder(item.path));
      navigate(`/dashboard/folder/${encodeURIComponent(item.path)}`);
    } else {
      const ext = getFileExt(item.name);
      const previewType = getPreviewType(ext);
      if (previewType) onPreview(item, previewType);
      else onNoPreview(item);
    }
  };

  const onContextAction = (action, current) => {
    switch (action) {
      case ContextAction.OPEN:
        openItem(current);
        break;
      case ContextAction.RENAME:
        setTargetItem(current);
        openRenameModal();
        break;
      case ContextAction.DELETE:
        setTargetItem(current);
        openDeleteModal();
        break;
      case ContextAction.DOWNLOAD:
        dispatch(downloadFile(current));
        break;
      default:
    }
  };

  return { getDisplayName, openItem, onContextAction };
}
