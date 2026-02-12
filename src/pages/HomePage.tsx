/* Revert to HomePage.tsx structure but with updated class names for circular categories */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import { useCompanyStore } from '@/stores/companyStore'
import { ArrowRight, Truck, CreditCard, Award } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import ProductCardSkeleton from '@/components/ProductCardSkeleton'
import type { Product, Category } from '@/types'
import './HomePage.css'

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const { settings } = useCompanyStore()

    useEffect(() => {
        async function fetchData() {
            const { data: prods } = await supabase
                .from('products')
                .select('*, categories(nome)')
                .eq('ativo', true)
                .eq('destaque', true)
                .limit(8)

            const { data: cats } = await supabase
                .from('categories')
                .select('*')
                .eq('ativo', true)
                .order('ordem')
                .limit(4)

            if (prods) {
                const productsWithCat = prods.map((p: any) => ({
                    ...p,
                    category: p.categories
                })) as Product[]
                setFeaturedProducts(productsWithCat)
            }

            if (cats) setCategories(cats as Category[])
            setLoading(false)
        }
        fetchData()
    }, [])

    return (
        <>
            <Helmet>
                <title>{settings?.nome_fantasia || 'Diamante Azul'} — Torneiras e Metais Sanitários</title>
            </Helmet>

            {/* Hero Banner */}
            <section className="hero">
                <div className="container hero-content">
                    <div className="hero-text">
                        <span className="hero-tag">LANÇAMENTO 2026</span>
                        <h1>Elegância e Sofisticação para sua Casa</h1>
                        <p>
                            Descubra nossa nova linha de torneiras gourmet e metais sanitários com design exclusivo e acabamento premium.
                        </p>
                        <div className="hero-actions">
                            <Link to="/produtos" className="btn btn-primary">VER COLEÇÃO COMPLETA</Link>
                        </div>
                    </div>
                    <div className="hero-image">
                        {/* Using a placeholder or the first product image if available */}
                        <img src="https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" alt="Hero" style={{ width: '100%', borderRadius: 12 }} />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><Truck size={32} /></div>
                            <h3>Frete Grátis</h3>
                            <p>Para Sul e Sudeste em compras acima de {settings?.frete_gratis_acima ? `R$ ${settings.frete_gratis_acima}` : 'R$ 299,00'}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><CreditCard size={32} /></div>
                            <h3>Parcelamento</h3>
                            <p>Em até 10x sem juros no cartão de crédito</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Award size={32} /></div>
                            <h3>Garantia de Qualidade</h3>
                            <p>Produtos 100% metal com 5 anos de garantia</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section-container" style={{ padding: '60px 0', background: '#FAFAFA' }}>
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">CATEGORIAS</h2>
                    </div>
                    <div className="categories-grid">
                        {categories.map((cat) => (
                            <Link key={cat.id} to={`/categoria/${cat.slug}`} className="category-card">
                                <div className="category-card-img-wrapper">
                                    <img src={cat.imagem_url || '/placeholder-product.svg'} alt={cat.nome} className="category-card-img" />
                                </div>
                                <h3>{cat.nome}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section-container" style={{ padding: '60px 0 80px' }}>
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">DESTAQUES</h2>
                    </div>

                    <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : (
                            featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link to="/produtos" className="btn btn-outline" style={{ padding: '12px 40px' }}>VER TODOS OS PRODUTOS</Link>
                    </div>
                </div>
            </section>
        </>
    )
}
