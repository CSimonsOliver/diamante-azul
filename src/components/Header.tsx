import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Search, Menu, X, Diamond, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useCompanyStore } from '@/stores/companyStore'
import CartDrawer from './CartDrawer'
import './Header.css'

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const searchRef = useRef<HTMLInputElement>(null)
    const location = useLocation()
    const totalItems = useCartStore((s) => s.getTotalItems())
    const { settings } = useCompanyStore()

    useEffect(() => {
        setMenuOpen(false)
        setSearchOpen(false)
    }, [location])

    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus()
        }
    }, [searchOpen])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/produtos?busca=${encodeURIComponent(searchQuery.trim())}`
        }
    }

    return (
        <>
            <header className="header">
                <div className="header-container container">
                    <Link to="/" className="header-logo">
                        <Diamond size={28} strokeWidth={2.5} />
                        <span>{settings?.nome_fantasia || 'Diamante Azul'}</span>
                    </Link>

                    <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
                        <Link to="/" className="header-nav-link">Início</Link>
                        <div className="header-nav-dropdown">
                            <Link to="/produtos" className="header-nav-link">
                                Produtos <ChevronDown size={14} />
                            </Link>
                        </div>
                        <Link to="/sobre" className="header-nav-link">Sobre</Link>
                        <Link to="/politica-troca" className="header-nav-link">Trocas</Link>
                    </nav>

                    <div className="header-actions">
                        <button
                            className="header-icon-btn"
                            onClick={() => setSearchOpen(!searchOpen)}
                            aria-label="Buscar"
                        >
                            <Search size={20} />
                        </button>

                        <button
                            className="header-icon-btn header-cart-btn"
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Carrinho"
                        >
                            <ShoppingCart size={20} />
                            {totalItems > 0 && (
                                <span className="header-cart-badge">{totalItems}</span>
                            )}
                        </button>

                        <button
                            className="header-menu-btn"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menu"
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {searchOpen && (
                    <div className="header-search-bar">
                        <form onSubmit={handleSearch} className="container header-search-form">
                            <Search size={18} className="header-search-icon" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="header-search-input"
                            />
                            <button type="button" onClick={() => setSearchOpen(false)} className="header-search-close">
                                <X size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </header>

            <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {menuOpen && <div className="header-overlay" onClick={() => setMenuOpen(false)} />}
        </>
    )
}
