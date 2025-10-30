import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import DataSelectionPage from './pages/DataSelectionPage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ComparisonSetupPage from './pages/ComparisonSetupPage';
import FinalPage from './pages/FinalPage';
// import ExistingProductEditorPage from './extra/ExistingProductEditorPage';
import NewProductCreationPage from './pages/NewProductCreationPage';
import ImageComparisonPage from './pages/ImageComparisonPage';
import ProductComparator from './pages/ProductComparatorPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';

  const updateSellerId = (id) => {
    localStorage.setItem('sellerId', id);
    // Dispatch custom event for Navbar to listen
    window.dispatchEvent(new CustomEvent('sellerIdUpdated', { detail: id }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route 
          path="/seller-list" 
          element={
            <ProtectedRoute 
              element={() => <DataSelectionPage updateSellerId={updateSellerId} />} 
            />
          } 
        />
        <Route path="/setup/:sellerId" element={<ProtectedRoute element={ComparisonSetupPage} />} />
        <Route path="/edit-product/:productId" element={<ProtectedRoute element={ProductComparator} />} />
        <Route path="/new-product" element={<ProtectedRoute element={NewProductCreationPage} />} />
        <Route path="/compare-images" element={<ProtectedRoute element={ImageComparisonPage} />} /> 
        <Route path="/final-page" element={<ProtectedRoute element={FinalPage} />} />
      </Routes>
    </div>
  );
}

function App() {
  const CLIENT_ID = "507142910829-kj72j2imtd4tiuu2rae4cep6nr11acof.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
