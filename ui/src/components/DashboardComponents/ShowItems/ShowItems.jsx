import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFileAlt } from "@fortawesome/free-solid-svg-icons";

import ItemType from '../../Types/itemType';
import './ShowItems.css';
import { useNavigate } from 'react-router-dom';

const ShowItems = ({ title, items, type }) => {
  const navigate = useNavigate();

  const handleDoubleClick = (itemPath) => {
    if (type === ItemType.FOLDER) {
      const folderId = encodeURIComponent(itemPath);
      navigate(`/dashboard/folder/${folderId}`);
    } else {
      alert("This is a file... This is unimplemented :'(")
    }
  };

  return (
    <div className="w-100">
      <h4 className="text-center border-bottom">{title}</h4>
      <div className="row gap-2 p-4 flex-wrap">
        {items.map((item, index) => {
          return (
            <p
              key={index * 55} 
              className="col-md-2 border py-3 text-center d-flex flex-column"
              onDoubleClick={() => handleDoubleClick(item.path)}
            >
              { type === ItemType.FOLDER ? (
                <FontAwesomeIcon icon={faFolder} size="4x" className="mb-3" />
              ):(
                  <FontAwesomeIcon icon={faFileAlt} size="4x" className="mb-3" />
                )}
              {item.name}
            </p>
          );
        })}
      </div>
    </div>
  )
}

export default ShowItems
