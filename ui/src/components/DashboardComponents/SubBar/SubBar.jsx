import './SubBar.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faFileAlt, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { changeFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';

const SubBar = ({ setIsCreateFolderModalOpen, setIsCreateFileModalOpen, setIsUploadFileModalOpen }) => {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();

  const { currentFolder, userFolders } = useSelector(
    state => ({
      currentFolder: state.fileFolders.currentFolder,
      userFolders:   state.fileFolders.userFolders
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

  const segments = currentFolder === "/" 
    ? [] 
    : currentFolder.split("/").filter(Boolean);

  return (
    <nav className="navbar navbar-expand-lg mt-2 navbar-light bg-white py-2">
      {/* Breadcrumbs */}
      <nav className="ms-5" aria-label="breadcrumb">
        <ol className="breadcrumb d-flex align-items-center">
          {/* Root crumb */}
          <li className="breadcrumb-item">
            {currentFolder !== "/" ? (
              <button 
                className="btn btn-link p-0 text-decoration-none" 
                onClick={() => handleNavigate("/")}
              >
                {t("root")}
              </button>
            ) : (
              <span>{t("root")}</span>
            )}
          </li>

          {/* Intermediate crumbs */}
          {segments.map((seg, idx) => {
            const upTo = "/" + segments.slice(0, idx + 1).join("/");
            const isLast = idx === segments.length - 1;

            return (
              <li 
                key={upTo} 
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {isLast ? (
                  seg
                ) : (
                  <button 
                    className="btn btn-link p-0 text-decoration-none" 
                    onClick={() => handleNavigate(upTo)}
                  >
                    {seg}
                  </button>
                )}
              </li>
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
