import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MediaList from './pages/MediaList';
import AddMedia from './pages/AddMedia';
import EditMedia from './pages/EditMedia';
import Banners from './pages/Banners';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Subscriptions from './pages/Subscriptions';
import AssetVault from './pages/AssetVault';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="media" element={<MediaList />} />
                <Route path="assets" element={<AssetVault />} />
                <Route path="add-media" element={<AddMedia />} />
                <Route path="edit-media/:id" element={<EditMedia />} />
                <Route path="banners" element={<Banners />} />
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
                <Route path="subs" element={<Subscriptions />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}

function App() {
    useEffect(() => {
        // --- Security Protocol: Disable Inspect & Right-Click ---
        const handleContextMenu = (e) => e.preventDefault();
        const handleKeyDown = (e) => {
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
                (e.ctrlKey && e.key === 'U') ||
                (e.metaKey && e.altKey && e.key === 'i') // Mac Shortcut
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
