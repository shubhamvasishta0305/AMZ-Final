import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import DataSelectionPage from './pages/DataSelectionPage';
import LoginPage from './pages/LoginPage';
// import ComparisonSetupPage from './extra/ComparisonSetupPage';
// import ExistingProductEditorPage from './extra/ExistingProductEditorPage';
// import NewProductCreationPage from './extra/NewProductCreationPage';
// import ImageComparisonPage from './extra/ImageComparisonPage';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';
  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/seller-list" element={<DataSelectionPage />}/>
        {/* <Route path="/setup/:sellerId" element={<ComparisonSetupPage />} />
        <Route path="/edit-product/:productId" element={<ExistingProductEditorPage />} />
        <Route path="/new-product" element={<NewProductCreationPage />} />
        <Route path="/compare-images/:productId" element={<ImageComparisonPage />} /> */}
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
