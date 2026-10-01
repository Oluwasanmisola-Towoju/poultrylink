import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import SettingsProvider from './context/SettingsProvider.jsx'
import PricesProvider from './context/PricesProvider.jsx'
import ListingsProvider from './context/ListingsProvider.jsx'
import OrdersProvider from './context/OrdersProvider.jsx'
import MessagesProvider from './context/MessagesProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <PricesProvider>
            <ListingsProvider>
              <OrdersProvider>
                <MessagesProvider>
                  <App />
                </MessagesProvider>
              </OrdersProvider>
            </ListingsProvider>
          </PricesProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)