import { useDrop } from "react-dnd";
import ItemType from "../../Types/itemType";

const BreadcrumbItem = ({
  label,
  path,
  isLast,
  onNavigate,
  onDrop
}) => {
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: 'ITEM',
    canDrop: dragged => dragged.parent !== path,
    drop: async (dragged) => onDrop(dragged.path, path, dragged.isDirectory ? ItemType.FOLDER : ItemType.FILE),
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <li
      ref={dropRef}
      className={`breadcrumb-item ${isLast ? 'active' : ''} ${!isLast && isOver && canDrop ? 'border-primary' : 'border-white'} px-1 border rounded`}
      aria-current={isLast ? 'page' : undefined}
    >
      {isLast ? (
        label
      ) : (
          <button
            className="btn btn-link p-0 text-decoration-none"
            onClick={onNavigate}
          >
            {label}
          </button>
        )}
    </li>
  )
}

export default BreadcrumbItem;
