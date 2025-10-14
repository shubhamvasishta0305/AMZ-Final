import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DataSelectionPage from './pages/DataSelectionPage';
// import ComparisonSetupPage from './extra/ComparisonSetupPage';
// import ExistingProductEditorPage from './extra/ExistingProductEditorPage';
// import NewProductCreationPage from './extra/NewProductCreationPage';
// import ImageComparisonPage from './extra/ImageComparisonPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<DataSelectionPage />} />
          {/* <Route path="/setup/:sellerId" element={<ComparisonSetupPage />} />
          <Route path="/edit-product/:productId" element={<ExistingProductEditorPage />} />
          <Route path="/new-product" element={<NewProductCreationPage />} />
          <Route path="/compare-images/:productId" element={<ImageComparisonPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
