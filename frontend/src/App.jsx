import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CSStyleTest from './components/CSStyleTest';
import BackendConnectionTest from './components/BackendConnectionTest';
import ApiDebugger from './components/ApiDebugger';

function App() {
  const [selectedUser, setSelectedUser] = useState(null);

  // Load selected user from localStorage on app start
  useEffect(() => {
    const savedUserId = localStorage.getItem('selectedUserId');
    if (savedUserId) {
      // Try to load users and set the selected user
      // This will be handled by individual pages that need user data
    }
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-neutral-100">
        <Navbar 
          selectedUser={selectedUser} 
          onUserSelect={setSelectedUser} 
        />
        <Routes>
          <Route path="/" element={<HomePage selectedUser={selectedUser} onUserSelect={setSelectedUser} />} />
          <Route path="/products" element={<ProductsPage selectedUser={selectedUser} onUserSelect={setSelectedUser} />} />
          <Route path="/products/:id" element={<ProductDetailPage selectedUser={selectedUser} onUserSelect={setSelectedUser} />} />
          <Route path="/recommendations" element={<RecommendationsPage selectedUser={selectedUser} onUserSelect={setSelectedUser} />} />
          <Route path="/analytics" element={<AnalyticsPage selectedUser={selectedUser} onUserSelect={setSelectedUser} />} />
          <Route path="/css-test" element={<CSStyleTest />} />
          <Route path="/backend-test" element={<BackendConnectionTest />} />
          <Route path="/api-debug" element={<ApiDebugger />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

