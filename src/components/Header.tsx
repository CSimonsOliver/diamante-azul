import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useCompanyStore } from '@/stores/companyStore'
import {
    ShoppingCart, Search, Menu, X, User, Headphones,
    Flame, Droplets, Bath, Package, Wrench, Grid,
    MapPin, Phone
} from 'lucide-react'
import CartDrawer from './CartDrawer'
import './Header.css'

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [search, setSearch] = useState('')
    const navigate = useNavigate()
    const totalItems = useCartStore((s) => s.getTotalItems())
    const { settings } = useCompanyStore()

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (search.trim()) {
            navigate(`/produtos?busca=${encodeURIComponent(search)}`)
        }
    }

    return (
        <>
            <div className="header-wrapper">
                {/* Top Bar - Black */}
                <div className="top-bar">
                    <div className="container">
                        <span>Olá, seja bem-vindo(a)!</span>
                        <span>Frete Grátis Sul e Sudeste acima de R$ {settings?.frete_gratis_acima || '299,00'}</span>
                        <div className="top-socials flex gap-2">
                            {/* Social Icons would go here */}
                        </div>
                    </div>
                </div>

                {/* Main Header - Dark Gray */}
                <div className="main-header">
                    <div className="container header-content">

                        {/* Logo */}
                        <Link to="/" className="logo">
                            {settings?.logo_url ? (
                                <img src={settings.logo_url} alt="Logo" style={{ height: 50 }} />
                            ) : (
                                <>
                                    <div className="logo-icon"><Droplets size={32} fill="currentColor" /></div>
                                    <span className="logo-text-main">DIAMANTE</span>
                                    <span className="logo-text-sub">AZUL</span>
                                </>
                            )}
                        </Link>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="O que você procura hoje?"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="search-btn">
                                <Search size={20} />
                            </button>
                        </form>

                        {/* Account & Cart */}
                        <div className="header-actions">
                            <a href={`https://wa.me/${settings?.whatsapp}`} target="_blank" className="action-item">
                                <Headphones size={24} />
                                <span>Atendimento</span>
                            </a>
                            <Link to="/admin" className="action-item">
                                <User size={24} />
                                <span>Minha Conta</span>
                            </Link>
                            <button className="action-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                                <div className="action-icon-wrapper">
                                    <ShoppingCart size={24} />
                                    {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                                </div>
                                <span>Meu Carrinho</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Bar - Blue */}
                <nav className="nav-bar">
                    <div className="container nav-container">
                        <Link to="/produtos" className="nav-link offer">
                            <Flame size={18} /> OFERTAS
                        </Link>
                        <Link to="/categoria/cozinha" className="nav-link">
                            <Droplets size={18} /> COZINHA
                        </Link>
                        <Link to="/categoria/banheiro" className="nav-link">
                            <Bath size={18} /> BANHEIRO
                        </Link>
                        <Link to="/categoria/kits" className="nav-link">
                            <Package size={18} /> KITS DE PRODUTOS
                        </Link>
                        <Link to="/categoria/acessorios" className="nav-link">
                            <Wrench size={18} /> ACESSÓRIOS
                        </Link>
                        <Link to="/produtos" className="nav-link">
                            <Grid size={18} /> TODOS OS DEPARTAMENTOS
                        </Link>
                    </div>
                </nav>
            </div>

            <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    )
}
