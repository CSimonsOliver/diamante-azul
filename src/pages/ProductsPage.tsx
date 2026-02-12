import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import ProductCard from '@/components/ProductCard'
import ProductCardSkeleton from '@/components/ProductCardSkeleton'
import type { Product, Category } from '@/types'
import { debounce } from '@/lib/utils'

const PER_PAGE = 12

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    const page = Number(searchParams.get('pagina') || '1')
    const search = searchParams.get('busca') || ''
    const categoryFilter = searchParams.get('categoria') || ''
    const [searchInput, setSearchInput] = useState(search)

    useEffect(() => { fetchCategories() }, [])
    useEffect(() => { fetchProducts() }, [page, search, categoryFilter])

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*').eq('ativo', true).order('nome')
        setCategories((data || []) as unknown as Category[])
    }

    async function fetchProducts() {
        setLoading(true)
        let query = supabase.from('products').select('*, categories(nome)', { count: 'exact' }).eq('ativo', true)

        if (search) query = query.ilike('nome', `%${search}%`)
        if (categoryFilter) query = query.eq('category_id', categoryFilter)

        const from = (page - 1) * PER_PAGE
        const { data, count } = await query.order('created_at', { ascending: false }).range(from, from + PER_PAGE - 1)

        const prods = (data || []).map((p: Record<string, unknown>) => ({
            ...p, category: p.categories as unknown as Category,
        })) as unknown as Product[]
        setProducts(prods)
        setTotal(count || 0)
        setLoading(false)
    }

    const totalPages = Math.ceil(total / PER_PAGE)

    const debouncedSearch = useCallback(
        debounce((val: string) => {
            const params = new URLSearchParams(searchParams)
            if (val) params.set('busca', val); else params.delete('busca')
            params.delete('pagina')
            setSearchParams(params)
        }, 300),
        []
    )

    function handleSearchChange(val: string) {
        setSearchInput(val)
        debouncedSearch(val)
    }

    function setPage(p: number) {
        const params = new URLSearchParams(searchParams)
        if (p > 1) params.set('pagina', String(p)); else params.delete('pagina')
        setSearchParams(params)
    }

    function setCategory(catId: string) {
        const params = new URLSearchParams(searchParams)
        if (catId) params.set('categoria', catId); else params.delete('categoria')
        params.delete('pagina')
        setSearchParams(params)
    }

    return (
        <>
            <Helmet>
                <title>Produtos — Diamante Azul</title>
                <meta name="description" content="Veja todos os nossos produtos de materiais hidráulicos." />
            </Helmet>
            <Breadcrumb items={[{ label: 'Produtos' }]} />

            <div className="container" style={{ padding: '32px 24px' }}>
                <h1 className="section-title mb-6">Nossos Produtos</h1>

                <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            style={{ paddingLeft: 36 }}
                        />
                    </div>
                    <select value={categoryFilter} onChange={(e) => setCategory(e.target.value)} style={{ minWidth: 180 }}>
                        <option value="">Todas categorias</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="product-grid">
                        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <Search size={48} />
                        <h3>Nenhum produto encontrado</h3>
                        <p>Tente uma busca diferente ou remova os filtros.</p>
                    </div>
                ) : (
                    <>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 16 }}>
                            {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                        </p>
                        <div className="product-grid">
                            {products.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button key={i} className={`pagination-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    )
}
