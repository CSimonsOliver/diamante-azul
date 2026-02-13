import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
    LayoutDashboard, Package, FolderOpen, ShoppingBag,
    Settings, LogOut, Diamond, Menu, X, Home
} from 'lucide-react'
import { useState } from 'react'
import './AdminLayout.css'

const NAV_ITEMS = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/homepage', icon: Home, label: 'HomePage' },
    { to: '/admin/produtos', icon: Package, label: 'Produtos' },
    { to: '/admin/categorias', icon: FolderOpen, label: 'Categorias' },
    { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
    { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function AdminLayout() {
    const { signOut, user, loading } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Carregando...</div>
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />
    }

    const handleLogout = async () => {
        await signOut()
        navigate('/admin/login')
    }

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ 
                width: '250px', 
                background: '#1a2744', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                zIndex: 100,
                transition: 'transform 300ms ease'
            }}>
                <div className="admin-sidebar-header">
                    <NavLink to="/admin" className="admin-logo">
                        <Diamond size={22} strokeWidth={2.5} />
                        <span>Admin</span>
                    </NavLink>
                    <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="admin-nav">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <NavLink to="/" className="admin-nav-link" target="_blank">
                        <Package size={18} />
                        <span>Ver Loja</span>
                    </NavLink>
                    <button onClick={handleLogout} className="admin-nav-link admin-logout">
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

            <main className="admin-main">
                <header className="admin-topbar">
                    <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu size={20} />
                    </button>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
