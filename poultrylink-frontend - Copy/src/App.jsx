import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from './context/auth'
import ProtectedRoute from './components/ProtectedRoute'
import PortalLayout from './layouts/PortalLayout'
import AdminLayout from './layouts/AdminLayout'

// Public & Auth Pages
import Login from './pages/Login'
import Onboarding from './pages/Onboarding.jsx'
import Register from './pages/Register'
import Otp from './pages/Otp'
import ForgotPassword from './pages/ForgotPassword'
import Verification from './pages/Verification'

// General Portal Pages
import Marketplace from './pages/Marketplace'
import ListingDetail from './pages/ListingDetail'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import MarketPrices from './pages/MarketPrices'
import Messages from './pages/Messages'
import SellerProfile from './pages/SellerProfile'
import Profile from './pages/Profile'
import Payments from './pages/Payments'
import Delivery from './pages/Delivery'

// Role Dashboards & Pages
import FarmerHome from './pages/FarmerHome'
import NewListing from './pages/NewListing'
import Earnings from './pages/Earnings'
import SupplierHome from './pages/SupplierHome'       // Catalog, Feed & Equipment Storefront
import VetHome from './pages/VetHome'                 // Appointments, Visits & Prescriptions
import TransporterHome from './pages/TransporterHome' // Haulage Requests & Delivery Fleet
import CoopHome from './pages/CoopHome'               // Group Buy & Cluster Aggregation
import FinancierHome from './pages/FinancierHome'     // Loans, Mortality Claims & Underwriting

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminVerification from './pages/admin/AdminVerification'
import AdminListings from './pages/admin/AdminListings'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPayments from './pages/admin/AdminPayments'
import AdminEscrow from './pages/admin/AdminEscrow'
import AdminDisputes from './pages/admin/AdminDisputes'
import AdminReviews from './pages/admin/AdminReviews'
import AdminMarketPrices from './pages/admin/AdminMarketPrices'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'

export default function App() {
  return (
    <Routes>
      {/* Public Unauthenticated Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/verification" element={<Verification />} />

        {/* General Application Layout */}
        <Route element={<PortalLayout />}>
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ListingDetail />} />
          <Route path="/sellers/:name" element={<SellerProfile />} />
          <Route path="/prices" element={<MarketPrices />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />

          {/* Shared Routes Across All Platform Roles */}
          <Route element={<ProtectedRoute allow={[
            ROLES.FARMER, 
            ROLES.BUYER, 
            ROLES.SUPPLIER, 
            ROLES.TRANSPORTER, 
            ROLES.VET, 
            ROLES.COOPERATIVE, 
            ROLES.FINANCIER
          ]} />}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/payments" element={<Payments />} />
          </Route>

          {/* 1. Farmer Routes */}
          <Route element={<ProtectedRoute allow={[ROLES.FARMER]} />}>
            <Route path="/farmer" element={<FarmerHome />} />
            <Route path="/farmer/new" element={<NewListing />} />
            <Route path="/farmer/earnings" element={<Earnings />} />
          </Route>

          {/* 2. Buyer Routes */}
          <Route element={<ProtectedRoute allow={[ROLES.BUYER]} />}>
            <Route path="/buyer" element={<Navigate to="/orders" replace />} />
            <Route path="/delivery" element={<Delivery />} />
          </Route>

          {/* 3. Supplier Routes */}
          <Route element={<ProtectedRoute allow={[ROLES.SUPPLIER]} />}>
            <Route path="/supplier" element={<SupplierHome />} />
            <Route path="/supplier/catalog/new" element={<NewListing />} />
          </Route>

          {/* 4. Veterinarian Routes */}
          <Route element={<ProtectedRoute allow={[ROLES.VET]} />}>
            <Route path="/vet" element={<VetHome />} />
          </Route>

          {/* 5. Transporter Routes */}
          <Route element={<ProtectedRoute allow={[ROLES.TRANSPORTER]} />}>
            <Route path="/transporter" element={<TransporterHome />} />
            <Route path="/transporter/delivery" element={<Delivery />} />
          </Route>

          {/* 6. Cooperative Routes */}
          <Route element={<ProtectedRoute allow={[ROLES.COOPERATIVE]} />}>
            <Route path="/cooperative" element={<CoopHome />} />
          </Route>

          {/* 7. Financier / Insurer Routes */}
          <Route element={<ProtectedRoute allow={[ROLES.FINANCIER]} />}>
            <Route path="/financier" element={<FinancierHome />} />
          </Route>

          {/* Admin Workspace */}
          <Route element={<ProtectedRoute allow={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="verification" element={<AdminVerification />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="escrow" element={<AdminEscrow />} />
              <Route path="disputes" element={<AdminDisputes />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="market-prices" element={<AdminMarketPrices />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}