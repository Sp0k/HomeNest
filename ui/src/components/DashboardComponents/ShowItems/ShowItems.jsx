import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from "@fortawesome/free-solid-svg-icons";

import ItemType from '../../Types/itemType';

import './ShowItems.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { changeFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';
import { selectFileIcon } from './FileIcons'
import { getFileExt, getPreviewType } from '../../../utils/filePreviewUtils';

const ShowItems = ({ title, items, type, onPreview, onNoPreview }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDoubleClick = (item) => {
    if (type === ItemType.FOLDER) {
      const folderPath = encodeURIComponent(item.path);
      dispatch(changeFolder(item.path));
      navigate(`/dashboard/folder/${folderPath}`);
    } else {
      handleFileBehaviour(item);
    }
  };

  const handleFileBehaviour = (file) => {
    const previewType = getPreviewType(getFileExt(file.name));
    if (previewType) {
      onPreview(file, previewType);
    } else {
      // TODO: Handle Only Office files
      onNoPreview(file);
    }
  }

  const getDisplayName = (fileName) => {
    const idx = fileName.lastIndexOf('.');
    if (idx === -1) return fileName;
    return fileName.substring(0, idx);
  }

  return (
    <div className="w-100">
      <h4 className="text-center border-bottom">{title}</h4>
      <div className="row gap-2 p-4 flex-wrap">
        {items.map((item, index) => {
          return (
            <p
              key={index * 55} 
              className="col-md-2 border py-3 text-center d-flex flex-column"
              onDoubleClick={() => handleDoubleClick(item)}
            >
              <FontAwesomeIcon 
                icon={ type === ItemType.FOLDER ? faFolder : selectFileIcon(item.name)}
                size="4x"
                className="mb-3"
              />
              <span
                className="file-name text-truncate"
                title={getDisplayName(item.name)}
              >
                {getDisplayName(item.name)}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  )
}

export default ShowItems
