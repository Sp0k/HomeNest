import { Route, Routes } from "react-router-dom"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ToastContainer } from "react-toastify"

import './App.css'

import HomePage from './pages/HomePage/HomePage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import OnlyOfficeEditor from "./pages/Editor/OnlyOfficeEditor"

const App = () => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    document.title = t('title.page')
  }, [i18n.language]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
        <Route path="/editor" element={<OnlyOfficeEditor />} />
      </Routes>
      <ToastContainer />
    </div>
  )
}

export default App
