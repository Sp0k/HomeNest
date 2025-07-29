import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder }    from '@fortawesome/free-solid-svg-icons';
import { useNavigate }  from 'react-router-dom';
import { useDispatch }  from 'react-redux';

import ItemType         from '../../Types/itemType';
import ContextMenu      from '../ContextMenu/ContextMenu';
import './ShowItems.css';
import { changeFolder, downloadFile } from '../../../redux/actionCreators/fileFoldersActionCreator';
import { selectFileIcon }     from './FileIcons';
import { getFileExt,
         getPreviewType }     from '../../../utils/filePreviewUtils';

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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [open,        setOpen]        = useState(false);
  const [current,     setCurrent]     = useState(null);

  const handleContextMenu = (e, item) => {
    setCurrent(item);
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleDoubleClick = (item) => {
    if (type === ItemType.FOLDER) {
      dispatch(changeFolder(item.path));
      navigate(`/dashboard/folder/${encodeURIComponent(item.path)}`);
    } else {
      handleFileBehaviour(item);
    }
  };
  const handleFileBehaviour = (file) => {
    const previewType = getPreviewType(getFileExt(file.name));
    if (previewType) onPreview(file, previewType);
    else onNoPreview(file);
  };

  const handleOpenClick = () => {
    handleDoubleClick(current);
    handleClose();
  };

  const handleDeleteClick = () => {
    setTargetItem(current);
    setIsDeleteItemModalOpen(true);
    handleClose();
  };

  const handleRenameClick = () => {
    setTargetItem(current);
    setIsRenameItemModalOpen(true);
    handleClose();
  };

  const handleDownloadClick = () => {
    dispatch(downloadFile(current))
    handleClose();
  };

  const getDisplayName = (fileName) => {
    const idx = fileName.lastIndexOf('.');
    return idx === -1 ? fileName : fileName.substring(0, idx);
  };

  return (
    <div className="w-100" onClick={handleClose}>
      {title && <h4 className="text-center border-bottom">{title}</h4>}

      <div className="row gap-2 p-4 flex-wrap">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="col-md-2 border py-3 text-center d-flex flex-column"
            onDoubleClick={() => handleDoubleClick(item)}
            onContextMenu={e => {
              e.preventDefault();
              handleContextMenu(e, item);
            }}
          >
            <FontAwesomeIcon
              icon={ type === ItemType.FOLDER ? faFolder : selectFileIcon(item.name) }
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
        ))}
      </div>

      {/* ← Hook the menu here, using the same `items` + our handlers */}
      <ContextMenu
        open={open}
        anchorPoint={anchorPoint}
        type={type}
        onClose={handleClose}
        onOpenClick={handleOpenClick}
        onDeleteClick={handleDeleteClick}
        onRenameClick={handleRenameClick}
        onDownloadClick={handleDownloadClick}
      />
    </div>
  );
};

export default ShowItems;
