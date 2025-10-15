import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import DataSelectionPage from './pages/DataSelectionPage';
import LoginPage from './pages/LoginPage';
import ComparisonSetupPage from './pages/ComparisonSetupPage';
// import ExistingProductEditorPage from './extra/ExistingProductEditorPage';
import NewProductCreationPage from './pages/NewProductCreationPage';
import ImageComparisonPage from './pages/ImageComparisonPage';
import ProductComparator from './pages/ProductComparatorPage';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';
  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/seller-list" element={<DataSelectionPage />}/>
         <Route path="/setup/:sellerId" element={<ComparisonSetupPage />} />
        <Route path="/edit-product/:productId" element={<ProductComparator />} />
        <Route path="/new-product" element={<NewProductCreationPage />} />
        <Route path="/compare-images/:productId" element={<ImageComparisonPage />} /> 
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
