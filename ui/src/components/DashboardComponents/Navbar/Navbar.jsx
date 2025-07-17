import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom"
import LanguageSelector from '../../LanguageComponents/LanguageSelector';

const Navbar = () => {
  const { t } = useTranslation();
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
        <Link className="navbar-brand ms-5" to="/">HomeNest - {t('title.filemanager')}</Link>

        <ul className="navbar-nav ms-auto me-5">
          <li className="nav-item mx-2">
            <Link className="btn btn-primary" to="/">{t('home')}</Link>
          </li>
          <li className="nav-item me-2">
            <Link className="btn btn-success" to="/help">{t('help')}</Link>
          </li>
          <li className="nav-item my-auto">
            <LanguageSelector />
          </li>
        </ul>
      </nav>
    </div>
  )
};

export default Navbar;
