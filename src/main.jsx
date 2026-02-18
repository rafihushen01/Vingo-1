import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter } from 'react-router-dom'
import APP from './App'
import{Provider} from "react-redux"
import { store } from './pages/redux/Store'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Provider store={store}>




  <APP/>
 
  </Provider>
  
  
  
  
  </BrowserRouter>

)
