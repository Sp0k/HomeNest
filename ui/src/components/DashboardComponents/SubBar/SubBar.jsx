import './SubBar.css'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faFileAlt, faFolderPlus } from '@fortawesome/free-solid-svg-icons'

const SubBar = ({ setIsCreateFolderModalOpen, setIsCreateFileModalOpen }) => {
  const { t } = useTranslation();
  return (
    <nav className="navbar navbar-expand-lg mt-2 navbar-light bg-white px-5 py-2">
      <p>{t('root')}</p>

      <ul className="navbar-nav ms-auto me-5 mb-3">
        <li className="nav-item mx-2">
          <button className="btn btn-outline-dark">
            <FontAwesomeIcon icon={faFileUpload} /> &nbsp;
            {t('upload')}
          </button>
        </li>
        <li className="nav-item mx-2">
          <button 
            className="btn btn-outline-dark" 
            onClick={() => setIsCreateFileModalOpen(true)}
          >
            <FontAwesomeIcon icon={faFileAlt} /> &nbsp;
            {t('create.file')}
          </button>
        </li>
        <li className="nav-item mx-2">
          <button 
            className="btn btn-outline-dark" 
            onClick={() => setIsCreateFolderModalOpen(true)}
          >
            <FontAwesomeIcon icon={faFolderPlus} /> &nbsp;
            {t('create.folder')}
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default SubBar
