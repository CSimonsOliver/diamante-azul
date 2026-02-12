import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import Breadcrumb from '@/components/Breadcrumb'
import ProductCard from '@/components/ProductCard'
import ProductCardSkeleton from '@/components/ProductCardSkeleton'
import type { Product, Category } from '@/types'

export default function CategoryPage() {
    const { slug } = useParams()
    const [category, setCategory] = useState<Category | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchCategory() }, [slug])

    async function fetchCategory() {
        setLoading(true)
        const { data: catData } = await supabase.from('categories').select('*').eq('slug', slug).single()
        if (catData) {
            setCategory(catData as unknown as Category)
            const { data: prodData } = await supabase.from('products').select('*, categories(nome)')
                .eq('category_id', catData.id).eq('ativo', true).order('created_at', { ascending: false })
            const prods = (prodData || []).map((p: Record<string, unknown>) => ({
                ...p, category: p.categories as unknown as Category,
            })) as unknown as Product[]
            setProducts(prods)
        }
        setLoading(false)
    }

    if (!loading && !category) {
        return (
            <div className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
                <h2>Categoria não encontrada</h2>
                <Link to="/produtos" className="btn btn-primary mt-4">Ver Produtos</Link>
            </div>
        )
    }

    return (
        <>
            <Helmet>
                <title>{category?.nome || 'Categoria'} — Diamante Azul</title>
                <meta name="description" content={category?.descricao || `Produtos da categoria ${category?.nome}`} />
            </Helmet>
            <Breadcrumb items={[{ label: 'Produtos', href: '/produtos' }, { label: category?.nome || '...' }]} />

            <div className="container" style={{ padding: '32px 24px 64px' }}>
                <div className="section-header mb-6">
                    <div>
                        <h1 className="section-title">{category?.nome}</h1>
                        {category?.descricao && <p className="section-subtitle">{category.descricao}</p>}
                    </div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                        {products.length} produto{products.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {loading ? (
                    <div className="product-grid">
                        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <h3>Nenhum produto nesta categoria</h3>
                        <Link to="/produtos" className="btn btn-primary mt-4">Ver todos os produtos</Link>
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </div>
        </>
    )
}
