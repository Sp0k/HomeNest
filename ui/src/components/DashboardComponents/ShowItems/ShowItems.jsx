import { getFolders, getFiles } from '../../../redux/actionCreators/fileFoldersActionCreator';

import './ShowItems.css';
import ContextMenu      from '../ContextMenu/ContextMenu';
import ItemCard from '../../Common/ItemCard/ItemCard';
import useContextMenu from '../../../hooks/useContextMenu';
import useItemActions from '../../../hooks/useItemActions';
import ContextAction from '../../../enum/contextAction';
import { useDispatch } from 'react-redux';


const ShowItems = ({ 
  title, 
  items, 
  type, 
  currentFolder,
  onPreview, 
  onNoPreview, 
  setIsRenameItemModalOpen, 
  setIsDeleteItemModalOpen,
  setTargetItem,
}) => {
  const dispatch = useDispatch();
  const { open, current, anchorPoint, onContextMenu, closeMenu } = useContextMenu();
  const { getDisplayName, openItem, onContextAction } = useItemActions({
    onPreview,
    onNoPreview,
    setTargetItem,
    openRenameModal: () => setIsRenameItemModalOpen(true),
    openDeleteModal: () => setIsDeleteItemModalOpen(true),
  });

  const fetchItems = (path) => {
    dispatch(getFolders(path));
    dispatch(getFiles(path));
  }

  return (
    <div className="w-100" onClick={closeMenu}>
      {title && <h4 className="text-center border-bottom">{title}</h4>}

      <div className="row gap-2 p-4 flex-wrap">
        {items.map((item, idx) => (
          <ItemCard
            key={idx}
            item={item}
            type={type}
            onDoubleClick={() => openItem(item)}
            onContextMenu={e => onContextMenu(e, item)}
            getDisplayName={getDisplayName}
            onDropSuccess={() => fetchItems(currentFolder)}
          />
        ))}
      </div>

      <ContextMenu
        open={open}
        anchorPoint={anchorPoint}
        type={type}
        onClose={closeMenu}
        onOpenClick={() => onContextAction(ContextAction.OPEN, current)}
        onDeleteClick={() => onContextAction(ContextAction.DELETE, current)}
        onRenameClick={() => onContextAction(ContextAction.RENAME, current)}
        onDownloadClick={() => onContextAction(ContextAction.DOWNLOAD, current)}
      />
    </div>
  );
};

export default ShowItems;
