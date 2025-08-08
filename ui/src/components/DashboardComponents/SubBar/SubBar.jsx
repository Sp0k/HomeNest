import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faFileAlt, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { changeFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';
import { getBreadcrumbSegment } from '../../../utils/breadcrumbUtils';
import { fetchItems } from '../../../utils/apiShortcuts';

import './SubBar.css';
import BreadcrumbItem from '../../Common/BreadcrumbItem/BreadcumbItem';
import useBreadcrumbDrop from '../../../hooks/useBreadcrumbDrops';


const SubBar = ({ setIsCreateFolderModalOpen, setIsCreateFileModalOpen, setIsUploadFileModalOpen }) => {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();

  const { currentFolder } = useSelector(
    state => ({
      currentFolder: state.fileFolders.currentFolder,
    }),
    shallowEqual
  );

  const handleNavigate = (path) => {
    const param = path === "/" 
      ? "" 
      : encodeURIComponent(path.replace(/^\//, ""));

    dispatch(changeFolder(path))

    path === "/"
      ? navigate(`/dashboard`)
      : navigate(`/dashboard/folder/${param}`);
  };

  const segments = getBreadcrumbSegment(currentFolder);

  const handleCrumbDrop = useBreadcrumbDrop(currentFolder, fetchItems);

  return (
    <nav className="navbar navbar-expand-lg mt-2 navbar-light bg-white py-2">
      <nav className="ms-5" aria-label="breadcrumb">
        <ol className="breadcrumb d-flex align-items-center">
          <BreadcrumbItem
            label={t('root')}
            path="/"
            isLast={currentFolder === '/'}
            onNavigate={() => handleNavigate('/')}
            onDrop={handleCrumbDrop}
          />
          {segments.map((seg, idx) => {
            const upTo = '/' + segments.slice(0, idx + 1).join('/');
            const isLast = idx === segments.length - 1;
            return (
              <BreadcrumbItem
                key={upTo}
                label={seg}
                path={upTo}
                isLast={isLast}
                onNavigate={() => handleNavigate(upTo)}
                onDrop={handleCrumbDrop}
              />
            );
          })}
        </ol>
      </nav>

      {/* Action buttons */}
      <ul className="navbar-nav ms-auto me-5 mb-3">
        <li className="nav-item mx-2">
          <button 
            className="btn btn-outline-dark"
            onClick={() => setIsUploadFileModalOpen(true)}
          >
            <FontAwesomeIcon icon={faFileUpload} /> &nbsp;{t("upload")}
          </button>
        </li>
        <li className="nav-item mx-2">
          <button 
            className="btn btn-outline-dark" 
            onClick={() => setIsCreateFileModalOpen(true)}
          >
            <FontAwesomeIcon icon={faFileAlt} /> &nbsp;{t("create.file")}
          </button>
        </li>
        <li className="nav-item mx-2">
          <button 
            className="btn btn-outline-dark" 
            onClick={() => setIsCreateFolderModalOpen(true)}
          >
            <FontAwesomeIcon icon={faFolderPlus} /> &nbsp;{t("create.folder")}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default SubBar;
