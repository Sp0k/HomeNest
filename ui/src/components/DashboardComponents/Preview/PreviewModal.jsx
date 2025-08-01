import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";

const PreviewModal = ({ file, type, onClose }) => {
  const url = `/api/download?path=${encodeURIComponent(file.path)}`;
  const { t } = useTranslation();

  const previewElement = {
    image: <img src={url} alt={file.name} className="mw-100 mt-5" />,
    video: (
      <video controls className="mw-100 mt-5">
        <source src={url} />
        {t('video.not.supported')}
      </video>
    ),
    audio: <audio controls src={url} className="mt-5" />,
    pdf: (
      <object
        data={url}
        type="application/pdf"
        width="90%"
        height="90%"
        className="mt-2"
      >
        <p>
          {t('pdf.not.supported')}
          <a href={url} target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </p>
      </object>
    ),
  }[type];

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
          {previewElement}
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
