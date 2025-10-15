import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RecommendationsPage from './pages/RecommendationsPage';
import CSStyleTest from './components/CSStyleTest';
import BackendConnectionTest from './components/BackendConnectionTest';
import ApiDebugger from './components/ApiDebugger';

function App() {
  return (
    <UserProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/css-test" element={<CSStyleTest />} />
            <Route path="/backend-test" element={<BackendConnectionTest />} />
            <Route path="/api-debug" element={<ApiDebugger />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;

