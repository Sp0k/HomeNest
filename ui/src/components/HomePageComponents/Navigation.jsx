import React from 'react'
import { useTranslation } from 'react-i18next';

const NavigationComponent = () => {
  const { t } = useTranslation();
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand ms-5" href="/">HomeNest - {t('title.home')}</a>

        <ul className="navbar-nav ms-auto me-5">
          <li className="nav-item mx-2">
            <a className="btn btn-primary btn-sm" href="/dashboard" role="button">{t('dashboard')}</a>
          </li>
          <li className="nav-item">
            <a className="btn btn-success btn-sm" href="/help" role="button">{t('help')}</a>
          </li>
        </ul>
      </nav>
    </div>
  )
};

export default NavigationComponent;
