import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder,
  faFileAlt,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileImage,
  faFileAudio,
  faFileVideo,
  faFilePdf,
  faFileCode,
  faFileCircleCheck,
  faArchive,
} from "@fortawesome/free-solid-svg-icons";

import ItemType from '../../Types/itemType';
import { 
  DocumentEditingFormats,
  SpreadsheetEditingFormats,
  PresentationEditingFormats,
  FormEditingFormats,
} from '../../Types/onlyOfficeFileTypes';
import {
  ImageFormats,
  AudioFormats,
  VideoFormats,
  PdfFormats,
  ArchiveFormats,
} from '../../Types/mediaFileTypes';
import { CodeFileTypes } from '../../Types/codeFileTypes';
import has from '../../Types/enumHandler';

import './ShowItems.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { changeFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';

const ShowItems = ({ title, items, type }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDoubleClick = (item) => {
    if (type === ItemType.FOLDER) {
      const folderPath = encodeURIComponent(item.path);
      dispatch(changeFolder(item.path));
      navigate(`/dashboard/folder/${folderPath}`);
    } else {
      alert("This is a file... This is unimplemented :'(")
    }
  };

  const selectFileIcon = (fileName) => {
    const idx = fileName.lastIndexOf('.');
    if (idx === -1) return faFileAlt;
    const fileExt = fileName.substring(idx + 1);
    
    // Decide filetype
    if (has(DocumentEditingFormats, fileExt)) return faFileWord;
    if (has(SpreadsheetEditingFormats, fileExt)) return faFileExcel;
    if (has(PresentationEditingFormats, fileExt)) return faFilePowerpoint;
    if (has(ImageFormats, fileExt)) return faFileImage;
    if (has(AudioFormats, fileExt)) return faFileAudio;
    if (has(VideoFormats, fileExt)) return faFileVideo;
    if (has(PdfFormats, fileExt)) return faFilePdf;
    if (has(CodeFileTypes, fileExt)) return faFileCode;
    if (has(FormEditingFormats, fileExt)) return faFileCircleCheck;
    if (has(ArchiveFormats, fileExt)) return faArchive;
    return faFileAlt;
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
              { type === ItemType.FOLDER ? (
                <FontAwesomeIcon icon={faFolder} size="4x" className="mb-3" />
              ):(
                  <FontAwesomeIcon icon={selectFileIcon(item.name)} size="4x" className="mb-3" />
                )}
              {getDisplayName(item.name)}
            </p>
          );
        })}
      </div>
    </div>
  )
}

export default ShowItems
