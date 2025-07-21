import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom"
import LanguageSelector from '../../LanguageComponents/LanguageSelector';
import { useDispatch } from 'react-redux';
import { changeFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';

const Navbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTitleClick = () => {
    dispatch(changeFolder("/"));
    navigate(`/dashboard`);
  }
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
        {/* <Link className="navbar-brand ms-5" to="/">HomeNest - {t('title.filemanager')}</Link> */}
        <button 
          className="btn btn-link navbar-brand text-decoration-none"
          onClick={() => handleTitleClick()}
        >
          HomeNest - {t('title.filemanager')}
        </button>

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
