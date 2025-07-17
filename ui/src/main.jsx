import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import './i18n'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'

import { Provider } from 'react-redux'
import store from './redux/store'

import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)
