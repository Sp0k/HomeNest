import './SubBar.css'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faFileAlt, faFolderPlus } from '@fortawesome/free-solid-svg-icons'

const SubBar = () => {
  const { t } = useTranslation();
  return (
    <nav className="navbar navbar-expand-lg mt-2 navbar-light bg-white px-5 py-2">
      <p>{t('root')}</p>

      <ul className="navbar-nav ms-auto">
        <li className="nav-item mx-2">
          <button className="btn btn-outline-dark">
            <FontAwesomeIcon icon={faFileUpload} /> &nbsp;
            {t('upload')}
          </button>
        </li>
        <li className="nav-item mx-2">
          <button className="btn btn-outline-dark">
            <FontAwesomeIcon icon={faFileAlt} /> &nbsp;
            {t('create.file')}
          </button>
        </li>
        <li className="nav-item mx-2">
          <button className="btn btn-outline-dark">
            <FontAwesomeIcon icon={faFolderPlus} /> &nbsp;
            {t('create.folder')}
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default SubBar
