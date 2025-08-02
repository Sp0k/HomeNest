import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { selectFileIcon } from "../../DashboardComponents/ShowItems/FileIcons";
import ItemType from "../../Types/itemType";

const ItemCard = ({
  item,
  type,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  getDisplayName
}) => {
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
      draggable
      onDragStart={e => onDragStart(e, item)}
    >
      <FontAwesomeIcon
        icon={icon}
        size="4x"
        className="mb-3"
      />
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
