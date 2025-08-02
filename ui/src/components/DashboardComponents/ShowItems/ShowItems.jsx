import { useNavigate }  from 'react-router-dom';
import { useDispatch }  from 'react-redux';

import ItemType         from '../../Types/itemType';
import ContextMenu      from '../ContextMenu/ContextMenu';
import './ShowItems.css';
import { changeFolder, downloadFile } from '../../../redux/actionCreators/fileFoldersActionCreator';
import { getFileExt,
         getPreviewType }     from '../../../utils/filePreviewUtils';
import ItemCard from '../../Common/ItemCard/ItemCard';
import useContextMenu from '../../../hooks/useContextMenu';
import useItemActions from '../../../hooks/useItemActions';
import ContextAction from '../../../enum/contextAction';


const ShowItems = ({ 
  title, 
  items, 
  type, 
  onPreview, 
  onNoPreview, 
  setIsRenameItemModalOpen, 
  setIsDeleteItemModalOpen,
  setTargetItem,
}) => {
  const { open, current, anchorPoint, onContextMenu, closeMenu } = useContextMenu();
  const { getDisplayName, openItem, onContextAction } = useItemActions({
    onPreview,
    onNoPreview,
    setTargetItem,
    openRenameModal: () => setIsRenameItemModalOpen(true),
    openDeleteModal: () => setIsDeleteItemModalOpen(true),
  });

  const handleDragStart = (e, item) => {
    console.log("Drag")
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
            onDragStart={handleDragStart}
            getDisplayName={getDisplayName}
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
