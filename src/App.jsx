import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import DataSelectionPage from './pages/DataSelectionPage';
import LoginPage from './pages/LoginPage';
import ComparisonSetupPage from './pages/ComparisonSetupPage';
import FinalPage from './pages/FinalPage';
import NewProductCreationPage from './pages/NewProductCreationPage';
import ImageComparisonPage from './pages/ImageComparisonPage';
import ProductComparator from './pages/ProductComparatorPage';
import ProtectedRoute from './components/ProtectedRoute';

// ✅ Import Change Password Page
import ChangePasswordPage from './pages/ChangePasswordPage';

function AppContent() {
  const location = useLocation();

  // ✅ Hide navbar for login, change-password, and reset-password pages
  const hideNavbar =
    location.pathname === '/' ||
    location.pathname === '/change-password' ||
    location.pathname === '/reset-password';

  const updateSellerId = (id) => {
    localStorage.setItem('sellerId', id);
    window.dispatchEvent(new CustomEvent('sellerIdUpdated', { detail: id }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* 🔹 Login route */}
        <Route path="/" element={<LoginPage />} />

        {/* 🔹 Password-related routes (same page, handles both flows) */}
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/reset-password" element={<ChangePasswordPage />} />

        {/* 🔹 Protected routes */}
        <Route
          path="/seller-list"
          element={
            <ProtectedRoute
              element={() => <DataSelectionPage updateSellerId={updateSellerId} />}
            />
          }
        />
        <Route
          path="/setup/:sellerId"
          element={<ProtectedRoute element={ComparisonSetupPage} />}
        />
        <Route
          path="/edit-product/:productId"
          element={<ProtectedRoute element={ProductComparator} />}
        />
        <Route
          path="/new-product"
          element={<ProtectedRoute element={NewProductCreationPage} />}
        />
        <Route
          path="/compare-images"
          element={<ProtectedRoute element={ImageComparisonPage} />}
        />
        <Route
          path="/final-page"
          element={<ProtectedRoute element={FinalPage} />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
