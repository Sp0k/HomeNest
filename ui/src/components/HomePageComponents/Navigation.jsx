import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom"
import LanguageSelector from '../LanguageComponents/LanguageSelector';

const NavigationComponent = () => {
  const { t } = useTranslation();
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-3">
        <Link className="navbar-brand ms-5" to="/">HomeNest - {t('title.home')}</Link>

        <ul className="navbar-nav ms-auto me-5">
          <li className="nav-item mx-2">
            <Link className="btn btn-primary btn-sm" to="/dashboard" role="button">{t('dashboard')}</Link>
          </li>
          <li className="nav-item me-2">
            <Link className="btn btn-success btn-sm" to="/help" role="button">{t('help')}</Link>
          </li>
          <li className="nav-item my-auto">
            <LanguageSelector />
          </li>
        </ul>
      </nav>
    </div>
  )
};

export default NavigationComponent;
