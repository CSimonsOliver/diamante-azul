import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useCompanyStore } from '@/stores/companyStore'
import { ShoppingCart, Search, Menu, X, User } from 'lucide-react'
import CartDrawer from './CartDrawer'
import './Header.css'

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [search, setSearch] = useState('')
    const navigate = useNavigate()
    const totalItems = useCartStore((s) => s.totalItems())
    const { settings } = useCompanyStore()

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (search.trim()) {
            navigate(`/produtos?busca=${encodeURIComponent(search)}`)
            setIsMobileMenuOpen(false)
        }
    }

    return (
        <>
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container header-content">
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>

                    <Link to="/" className="logo">
                        {settings?.logo_url ? (
                            <img src={settings.logo_url} alt="Logo" />
                        ) : (
                            <div className="logo-text">
                                DIAMANTE<span className="text-secondary">AZUL</span>
                            </div>
                        )}
                    </Link>

                    <form onSubmit={handleSearch} className="search-bar desktop-only">
                        <input
                            type="text"
                            placeholder="O que você procura?"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="button" className="search-icon">
                            <Search size={18} />
                        </button>
                    </form>

                    <nav className="desktop-nav">
                        <Link to="/" className="nav-link">Início</Link>
                        <Link to="/produtos" className="nav-link">Produtos</Link>
                        <Link to="/sobre" className="nav-link">Sobre</Link>
                        <Link to="/admin" className="nav-btn-icon" title="Login">
                            <User size={20} />
                        </Link>
                        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCart size={22} />
                            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                        </button>
                    </nav>

                    <div className="mobile-actions mobile-only">
                        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCart size={22} />
                            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <span className="mobile-menu-title">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                </div>

                <div className="mobile-search">
                    <form onSubmit={handleSearch}>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos..." />
                        <button type="submit"><Search size={18} /></button>
                    </form>
                </div>

                <nav className="mobile-nav-links">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Início</Link>
                    <Link to="/produtos" onClick={() => setIsMobileMenuOpen(false)}>Produtos</Link>
                    <Link to="/sobre" onClick={() => setIsMobileMenuOpen(false)}>Sobre Nós</Link>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Área do Cliente</Link>
                </nav>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    )
}
