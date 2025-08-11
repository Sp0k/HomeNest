import { useNavigate } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { changeFolder, downloadFile } from "../redux/actionCreators/fileFoldersActionCreator";
import { getFileExt, getPreviewType } from "../utils/filePreviewUtils";
import { getItemType } from "../utils/itemTypeUtils";
import { toast } from "react-toastify";
import { 
  DocumentEditingFormats, 
  DocumentViewingFormats, 
  SpreadsheetEditingFormats, 
  SpreadsheetViewingFormats, 
  PresentationEditingFormats, 
  PresentationViewingFormats, 
  FormEditingFormats, 
  FormViewingFormats 
} from "../components/Types/onlyOfficeFileTypes";

import ItemType from "../components/Types/itemType";
import ContextAction from "../enum/contextAction";
import has from "../components/Types/enumHandler";
import { useTranslation } from "react-i18next";

const isOOEditExt = (ext) => 
  has(DocumentEditingFormats, ext) ||
    has(SpreadsheetEditingFormats, ext) ||
    has(PresentationEditingFormats, ext) ||
    has(FormEditingFormats, ext);

const isOOViewExt = (ext) =>
  has(DocumentViewingFormats, ext) ||
    has(SpreadsheetViewingFormats, ext) ||
    has(PresentationViewingFormats, ext) ||
    has(FormViewingFormats, ext);

export default function useItemActions({ 
  onPreview, 
  onNoPreview, 
  setTargetItem, 
  openRenameModal, 
  openDeleteModal 
}) {
  const { t } = useTranslation();
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

  const openItem = (item) => {
    if (getItemType(item.name, userFolders) === ItemType.FOLDER) {
      dispatch(changeFolder(item.path));
      navigate(`/dashboard/folder/${encodeURIComponent(item.path)}`);
      return;
    }

    const ext = getFileExt(item.name).toLowerCase();

    // If OnlyOffice supports it, open the full editor in a new tab
    if (isOOEditExt(ext) || isOOViewExt(ext)) {
      const mode = isOOEditExt(ext) ? 'edit' : 'view';
      const url = `/editor?path=${encodeURIComponent(item.path)}&mode=${mode}`;
      const win = window.open(url, '_blank', 'noopener');
      if (!win) {
        toast.info(t('popup.blocked'));
      }
      return;
    }

    // otherwise fall back to your existing preview flow
    const previewType = getPreviewType(ext);
    if (previewType) onPreview(item, previewType);
      else onNoPreview(item);
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
