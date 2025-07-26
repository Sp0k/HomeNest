import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

const NoPreviewModal = ({ file, onClose }) => {
  const url = `/api/download?path=${encodeURIComponent(file.path)}`;
  const { t } = useTranslation();

  return (
    <div
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: "rgba(0, 0, 0, 0.65)", zIndex: 9999 }}
    >
      <div className="row align-items-center justify-content-center h-100">
        <div className="d-flex justify-content-between bg-dark p-3">
          <button className="btn btn-danger ms-4" onClick={onClose}>
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="sm"
            />
            &nbsp;{t('back')}
          </button>
          <a
            href={url}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary ms-auto me-4 text-decoration-none"
          >
            <FontAwesomeIcon
              icon={faDownload}
              size="sm"
            />
            &nbsp;{t('download')}
          </a>
        </div>
        <div className="d-flex flex-column align-items-center h-100">
          <div className="col-md-4 mt-5 bg-white rounded p-4">
            <div className="align-items-center">
              <h3 className="text-center">{file.name}</h3>
              <p className="text-center text-md">
                {t('no.preview')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoPreviewModal;
