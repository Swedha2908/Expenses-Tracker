import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Navbar from './pages/Navbar'; // <-- Import Navbar
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Transactions from './pages/Transactions';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

const PublicOnlyRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
    </Routes>
  );
}

// Inside your App.jsx
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          
          <Navbar />
          
          {/* CHANGED: pt-24 is now pt-16 */}
          <div className="pt-16 pb-12 max-w-7xl mx-auto">
            <AppRoutes />
          </div>

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
