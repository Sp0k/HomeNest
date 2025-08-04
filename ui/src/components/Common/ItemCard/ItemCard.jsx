import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { selectFileIcon } from "../../DashboardComponents/ShowItems/FileIcons";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { isDescendant } from '../../../utils/pathUtils';

import ItemType from "../../Types/itemType";
import apiClient from '../../../utils/apiClient';

const ItemCard = ({
  item,
  type,
  onDoubleClick,
  onContextMenu,
  onDropSuccess,
  getDisplayName
}) => {
  const ref = useRef(null);
  const { t } = useTranslation();
  const [{ isDragging }, drag] = useDrag({
    type: 'ITEM',
    item: { path: item.path, isDirectory: type === ItemType.FOLDER, name: getDisplayName(item.name), iconType: type },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'ITEM',
    canDrop: dragged =>
      type === ItemType.FOLDER &&
      dragged.path !== item.path &&
      !isDescendant(dragged.path, item.path),
    drop: async dragged => {
      try {
        await apiClient.moveItem(dragged.path, item.path);
        onDropSuccess && onDropSuccess();
      } catch (err) {
        console.error(err);
        toast.error(t('error.move'));
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  const icon = type === ItemType.FOLDER
    ? faFolder
    : selectFileIcon(item.name);

  return (
    <div
      className="col-md-2 border py-3 text-center d-flex flex-column"
      onDoubleClick={() => onDoubleClick(item)}
      onContextMenu={e => {
        e.preventDefault();
        onContextMenu(e, item);
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        background: isOver && canDrop ? 'rgba(0, 123, 255, 0.1)' : '',
        cursor: 'move'
      }}
      ref={ref}
    >
      <FontAwesomeIcon icon={icon} size="4x" className="mb-3" />
      <span
        className="file-name text-truncate"
        title={getDisplayName(item.name)}
      >
        {getDisplayName(item.name)}
      </span>
    </div>
  );
}

export default ItemCard;
