import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import { useCompanyStore } from '@/stores/companyStore'
import { ArrowRight, Truck, CreditCard, Award, Shield, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import ProductCardSkeleton from '@/components/ProductCardSkeleton'
import type { Product, Category } from '@/types'
import './HomePage.css'

// Banners para o carrossel
const BANNERS = [
    {
        id: 1,
        tag: 'LANÇAMENTO 2026',
        title: 'Elegância e Sofisticação para sua Casa',
        description: 'Descubra nossa nova linha de torneiras gourmet e metais sanitários com design exclusivo e acabamento premium.',
        image: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
        link: '/produtos',
        buttonText: 'VER COLEÇÃO COMPLETA'
    },
    {
        id: 2,
        tag: 'PROMOÇÃO ESPECIAL',
        title: 'Até 50% OFF em Torneiras Gourmet',
        description: 'Aproveite descontos incríveis em produtos selecionados. Oferta por tempo limitado!',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200',
        link: '/categoria/ofertas',
        buttonText: 'VER OFERTAS'
    },
    {
        id: 3,
        tag: 'COMPLETO',
        title: 'Kits Cuba + Torneira',
        description: 'Economize comprando o kit completo. Cuba de inox + torneira gourmet com preço especial.',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
        link: '/categoria/kits',
        buttonText: 'VER KITS'
    }
]

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
    const [saleProducts, setSaleProducts] = useState<Product[]>([])
    const [bestSellers, setBestSellers] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [currentBanner, setCurrentBanner] = useState(0)
    const { settings } = useCompanyStore()

    useEffect(() => {
        async function fetchData() {
            // Buscar categorias
            const { data: cats } = await supabase
                .from('categories')
                .select('*')
                .eq('ativo', true)
                .order('ordem')
                .limit(6)

            // Produtos em destaque
            const { data: featured } = await supabase
                .from('products')
                .select('*, categories(nome)')
                .eq('ativo', true)
                .eq('destaque', true)
                .limit(8)

            // Produtos em oferta (com preço promocional)
            const { data: onSale } = await supabase
                .from('products')
                .select('*, categories(nome)')
                .eq('ativo', true)
                .not('preco_promocional', 'is', null)
                .limit(4)

            // Produtos mais vendidos (simulado - pegando os primeiros ativos)
            const { data: sellers } = await supabase
                .from('products')
                .select('*, categories(nome)')
                .eq('ativo', true)
                .limit(4)

            if (cats) setCategories(cats as Category[])
            
            if (featured) {
                setFeaturedProducts(featured.map((p: any) => ({...p, category: p.categories})) as Product[])
            }
            
            if (onSale) {
                setSaleProducts(onSale.map((p: any) => ({...p, category: p.categories})) as Product[])
            }
            
            if (sellers) {
                setBestSellers(sellers.map((p: any) => ({...p, category: p.categories})) as Product[])
            }
            
            setLoading(false)
        }
        fetchData()
    }, [])

    // Auto-rotate banners
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
    const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)

    return (
        <>
            <Helmet>
                <title>{settings?.nome_fantasia || 'Diamante Azul'} — Torneiras e Metais Sanitários</title>
            </Helmet>

            {/* Hero Banner Carousel */}
            <section className="hero-carousel">
                <div className="hero-carousel-container">
                    {BANNERS.map((banner, index) => (
                        <div 
                            key={banner.id} 
                            className={`hero-slide ${index === currentBanner ? 'active' : ''}`}
                            style={{ backgroundImage: `linear-gradient(135deg, rgba(26,39,68,0.9) 0%, rgba(26,39,68,0.7) 100%), url(${banner.image})` }}
                        >
                            <div className="container hero-content">
                                <div className="hero-text">
                                    <span className="hero-tag">{banner.tag}</span>
                                    <h1>{banner.title}</h1>
                                    <p>{banner.description}</p>
                                    <div className="hero-actions">
                                        <Link to={banner.link} className="btn btn-primary btn-lg">
                                            {banner.buttonText} <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Carousel Controls */}
                    <button className="carousel-control prev" onClick={prevBanner}>
                        <ChevronLeft size={32} />
                    </button>
                    <button className="carousel-control next" onClick={nextBanner}>
                        <ChevronRight size={32} />
                    </button>
                    
                    {/* Carousel Indicators */}
                    <div className="carousel-indicators">
                        {BANNERS.map((_, index) => (
                            <button 
                                key={index} 
                                className={index === currentBanner ? 'active' : ''}
                                onClick={() => setCurrentBanner(index)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">CATEGORIAS</h2>
                        <p className="section-subtitle">Escolha por categoria</p>
                    </div>
                    <div className="categories-grid-home">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="category-card-skeleton" />
                            ))
                        ) : (
                            categories.map((cat) => (
                                <Link key={cat.id} to={`/categoria/${cat.slug}`} className="category-card-home">
                                    <div className="category-card-img-wrapper">
                                        <img src={cat.imagem_url || '/placeholder-product.svg'} alt={cat.nome} />
                                    </div>
                                    <h3>{cat.nome}</h3>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Promo Banner */}
            <section className="promo-banner">
                <div className="container">
                    <div className="promo-banner-content">
                        <div className="promo-text">
                            <span className="promo-tag">OFERTA ESPECIAL</span>
                            <h2>Frete Grátis para Sul e Sudeste</h2>
                            <p>Em compras acima de {settings?.frete_gratis_acima ? `R$ ${settings.frete_gratis_acima.toFixed(2).replace('.', ',')}` : 'R$ 299,00'}</p>
                        </div>
                        <Link to="/produtos" className="btn btn-secondary btn-lg">Aproveitar</Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="products-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">DESTAQUES</h2>
                        <Link to="/produtos" className="view-all">Ver todos <ArrowRight size={16} /></Link>
                    </div>
                    <div className="products-grid-home">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : (
                            featuredProducts.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)
                        )}
                    </div>
                </div>
            </section>

            {/* Sale Products */}
            {saleProducts.length > 0 && (
                <section className="products-section sale-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">
                                <span className="sale-badge">OFERTAS</span>
                                PROMOÇÕES ESPECIAIS
                            </h2>
                            <Link to="/categoria/ofertas" className="view-all">Ver todas <ArrowRight size={16} /></Link>
                        </div>
                        <div className="products-grid-home">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            ) : (
                                saleProducts.map((p) => <ProductCard key={p.id} product={p} />)
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Features/Benefits */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid-home">
                        <div className="feature-item">
                            <div className="feature-icon-home">
                                <Truck size={32} />
                            </div>
                            <h3>Frete Grátis</h3>
                            <p>Sul e Sudeste acima de {settings?.frete_gratis_acima ? `R$ ${settings.frete_gratis_acima.toFixed(2).replace('.', ',')}` : 'R$ 299,00'}</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-home">
                                <CreditCard size={32} />
                            </div>
                            <h3>Parcelamento</h3>
                            <p>Em até 10x sem juros no cartão</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-home">
                                <Shield size={32} />
                            </div>
                            <h3>Garantia</h3>
                            <p>Produtos com até 5 anos de garantia</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-home">
                                <Award size={32} />
                            </div>
                            <h3>Qualidade</h3>
                            <p>100% metal de alta resistência</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-home">
                                <Clock size={32} />
                            </div>
                            <h3>Entrega Rápida</h3>
                            <p>Envio em até 24h úteis</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            {bestSellers.length > 0 && (
                <section className="products-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">MAIS VENDIDOS</h2>
                            <Link to="/produtos" className="view-all">Ver todos <ArrowRight size={16} /></Link>
                        </div>
                        <div className="products-grid-home">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            ) : (
                                bestSellers.map((p) => <ProductCard key={p.id} product={p} />)
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Bottom CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Transforme seu Banheiro e Cozinha</h2>
                        <p>Produtos de qualidade com design moderno para deixar sua casa ainda mais bonita</p>
                        <Link to="/produtos" className="btn btn-primary btn-lg">
                            Explorar Produtos <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}
