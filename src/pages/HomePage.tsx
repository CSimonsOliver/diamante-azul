import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import { useCompanyStore } from '@/stores/companyStore'
import { ArrowRight, Truck, Shield, Headphones } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import ProductCardSkeleton from '@/components/ProductCardSkeleton'
import type { Product, Category } from '@/types'
import './HomePage.css'

export default function HomePage() {
    const [featured, setFeatured] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const { settings } = useCompanyStore()

    useEffect(() => { fetchHome() }, [])

    async function fetchHome() {
        const [prodRes, catRes] = await Promise.all([
            supabase.from('products').select('*, categories(nome)').eq('destaque', true).eq('ativo', true).limit(8),
            supabase.from('categories').select('*').eq('ativo', true).order('ordem'),
        ])
        const prods = (prodRes.data || []).map((p: Record<string, unknown>) => ({
            ...p, category: p.categories as unknown as Category,
        })) as unknown as Product[]
        setFeatured(prods)
        setCategories((catRes.data || []) as unknown as Category[])
        setLoading(false)
    }

    return (
        <>
            <Helmet>
                <title>{settings?.nome_fantasia || 'Diamante Azul'} — Materiais Hidráulicos</title>
                <meta name="description" content="Materiais hidráulicos de alta qualidade com os melhores preços. Torneiras, registros, tubos e conexões." />
            </Helmet>

            {/* Hero Banner */}
            <section className="hero">
                <div className="container hero-content">
                    <div className="hero-text">
                        <h1>Materiais Hidráulicos de <span>Alta Qualidade</span></h1>
                        <p>Encontre torneiras, registros, tubos e conexões com garantia e os melhores preços do mercado.</p>
                        <div className="hero-actions">
                            <Link to="/produtos" className="btn btn-primary btn-lg">
                                Ver Produtos <ArrowRight size={18} />
                            </Link>
                            <Link to="/sobre" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                                Sobre Nós
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><Truck size={24} /></div>
                            <h3>Entrega Rápida</h3>
                            <p>Envio para todo o Brasil com rastreamento em tempo real</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Shield size={24} /></div>
                            <h3>Garantia de Qualidade</h3>
                            <p>Todos os produtos com garantia do fabricante</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Headphones size={24} /></div>
                            <h3>Suporte Especializado</h3>
                            <p>Atendimento via WhatsApp para tirar suas dúvidas</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="home-section">
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Categorias</h2>
                                <p className="section-subtitle">Encontre o que você precisa</p>
                            </div>
                        </div>
                        <div className="categories-grid">
                            {categories.map((cat) => (
                                <Link to={`/categoria/${cat.slug}`} key={cat.id} className="category-card card">
                                    {cat.imagem_url ? (
                                        <img src={cat.imagem_url} alt={cat.nome} className="category-card-img" />
                                    ) : (
                                        <div className="category-card-img category-card-placeholder" />
                                    )}
                                    <div className="category-card-body">
                                        <h3>{cat.nome}</h3>
                                        {cat.descricao && <p>{cat.descricao}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section className="home-section" style={{ background: '#fff' }}>
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Produtos em Destaque</h2>
                            <p className="section-subtitle">Seleção especial com os melhores preços</p>
                        </div>
                        <Link to="/produtos" className="btn btn-outline">
                            Ver Todos os Produtos <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="product-grid">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            : featured.map((p) => <ProductCard key={p.id} product={p} />)
                        }
                    </div>
                </div>
            </section>
        </>
    )
}
