import { Route, Routes } from "react-router-dom"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import './App.css'
import HomePage from './pages/HomePage/HomePage'
import DashboardPage from './pages/DashboardPage/DashboardPage'

const App = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('title.page')
  }, [i18n.language]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}

export default App
