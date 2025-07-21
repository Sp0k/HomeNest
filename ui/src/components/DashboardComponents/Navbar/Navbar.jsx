import React from 'react'
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom"
import LanguageSelector from '../../LanguageComponents/LanguageSelector';
import { useDispatch } from 'react-redux';
import { changeFolder } from '../../../redux/actionCreators/fileFoldersActionCreator';

const Navbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleNavbarClick = (page) => {
    dispatch(changeFolder("/"));
    navigate(page);
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
        <button 
          className="btn btn-link navbar-brand text-decoration-none"
          onClick={() => handleNavbarClick(`/dashboard`)}
        >
          HomeNest - {t('title.filemanager')}
        </button>

        <ul className="navbar-nav ms-auto me-5">
          <li className="nav-item mx-2">
            <button className="btn btn-primary" onClick={() => handleNavbarClick("/")}>{t('home')}</button>
          </li>
          <li className="nav-item me-2">
            <button className="btn btn-success" onClick={() => handleNavbarClick("/help")}>{t('help')}</button>
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
