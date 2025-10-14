import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { getUsers } from './services/api';

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Load users on app start
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
        
        // Load selected user from localStorage if exists
        const savedUserId = localStorage.getItem('selectedUserId');
        if (savedUserId && usersArray.length > 0) {
          const savedUser = usersArray.find(user => user.id.toString() === savedUserId);
          if (savedUser) {
            setSelectedUser(savedUser);
          }
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    loadUsers();
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-neutral-100">
        <Navbar selectedUser={selectedUser} onUserSelect={handleUserSelect} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

