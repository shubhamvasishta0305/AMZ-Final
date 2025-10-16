import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import DataSelectionPage from './pages/DataSelectionPage';
import LoginPage from './pages/LoginPage';
import ComparisonSetupPage from './pages/ComparisonSetupPage';
import FinalPage from './pages/FinalPage';
// import ExistingProductEditorPage from './extra/ExistingProductEditorPage';
import NewProductCreationPage from './pages/NewProductCreationPage';
import ImageComparisonPage from './pages/ImageComparisonPage';
import ProductComparator from './pages/ProductComparatorPage';
import { GoogleOAuthProvider } from '@react-oauth/google';


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
        <Route path="/compare-images" element={<ImageComparisonPage />} /> 
        <Route path="/final-page" element={<FinalPage />} />
      </Routes>
    </div>
  );
}

function App() {

  const CLIENT_ID = "507142910829-kj72j2imtd4tiuu2rae4cep6nr11acof.apps.googleusercontent.com";


  return (
    <Router>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <AppContent />
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;
