import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/stores/cartStore'
import { ShoppingCart, Minus, Plus, Truck, ChevronLeft, ChevronRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { formatCurrency, getDiscountPercent, getProductImageUrl, sanitizeCEP, isValidCEP, formatCEP } from '@/lib/utils'
import type { Product, Category, ShippingOption } from '@/types'
import toast from 'react-hot-toast'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
    const { slug } = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [qty, setQty] = useState(1)
    const [selectedImage, setSelectedImage] = useState(0)
    const [cep, setCep] = useState('')
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
    const [shippingLoading, setShippingLoading] = useState(false)
    const addItem = useCartStore((s) => s.addItem)

    useEffect(() => { fetchProduct() }, [slug])

    async function fetchProduct() {
        setLoading(true)
        const { data } = await supabase.from('products').select('*, categories(nome, slug)').eq('slug', slug).single()
        if (data) {
            const p = { ...data, category: data.categories as unknown as Category } as unknown as Product
            setProduct(p)
        }
        setLoading(false)
    }

    function handleAddToCart() {
        if (!product || product.estoque <= 0) return
        addItem(product, qty)
        toast.success('Produto adicionado ao carrinho!')
    }

    async function calculateShipping() {
        const cleanCep = sanitizeCEP(cep)
        if (!isValidCEP(cleanCep)) { toast.error('CEP inválido'); return }
        if (!product) return

        setShippingLoading(true)
        try {
            // Try edge function, fallback to mock
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-shipping`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
                body: JSON.stringify({
                    cep_destino: cleanCep,
                    produtos: [{ peso: product.peso_kg, altura: product.altura_cm, largura: product.largura_cm, comprimento: product.comprimento_cm, quantidade: qty }],
                }),
            })
            if (!response.ok) throw new Error('API error')
            const data = await response.json()
            setShippingOptions(data)
        } catch {
            // Fallback mock options
            setShippingOptions([
                { id: '1', nome: 'PAC', empresa: 'Correios', preco: 18.50, prazo_dias: 7, logo: '' },
                { id: '2', nome: 'SEDEX', empresa: 'Correios', preco: 32.90, prazo_dias: 3, logo: '' },
            ])
        } finally {
            setShippingLoading(false)
        }
    }

    if (loading) return <div className="container p-6"><div className="skeleton" style={{ height: 400 }} /></div>
    if (!product) return <div className="container p-6"><div className="empty-state"><h3>Produto não encontrado</h3><Link to="/produtos" className="btn btn-primary mt-4">Ver Produtos</Link></div></div>

    const price = product.preco_promocional ?? product.preco
    const hasDiscount = product.preco_promocional && product.preco_promocional < product.preco
    const discount = hasDiscount ? getDiscountPercent(product.preco, product.preco_promocional!) : 0
    const images = product.imagens?.length ? product.imagens : [{ url: '', ordem: 0 }]

    return (
        <>
            <Helmet>
                <title>{product.nome} — Diamante Azul</title>
                <meta name="description" content={product.descricao_curta || product.nome} />
            </Helmet>
            <Breadcrumb items={[
                { label: 'Produtos', href: '/produtos' },
                ...(product.category ? [{ label: product.category.nome, href: `/categoria/${(product.category as Category & { slug: string }).slug || ''}` }] : []),
                { label: product.nome },
            ]} />

            <div className="container product-detail">
                <div className="product-detail-gallery">
                    <div className="product-detail-main-img">
                        <img src={getProductImageUrl(images[selectedImage]?.url)} alt={product.nome} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }} />
                        {hasDiscount && <span className="badge badge-red product-detail-discount">-{discount}%</span>}
                        {images.length > 1 && (
                            <>
                                <button className="gallery-nav gallery-prev" onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}><ChevronLeft size={20} /></button>
                                <button className="gallery-nav gallery-next" onClick={() => setSelectedImage((i) => (i + 1) % images.length)}><ChevronRight size={20} /></button>
                            </>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="product-detail-thumbs">
                            {images.map((img, i) => (
                                <button key={i} className={`product-thumb ${selectedImage === i ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                                    <img src={getProductImageUrl(img.url)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-detail-info">
                    {product.category && <span className="product-detail-cat">{product.category.nome}</span>}
                    <h1 className="product-detail-name">{product.nome}</h1>
                    {product.sku && <p className="product-detail-sku">SKU: {product.sku}</p>}

                    <div className="product-detail-prices">
                        {hasDiscount && <span className="price-old" style={{ fontSize: 18 }}>{formatCurrency(product.preco)}</span>}
                        <span className="price" style={{ fontSize: 28 }}>{formatCurrency(price)}</span>
                    </div>

                    {product.descricao_curta && <p className="product-detail-desc">{product.descricao_curta}</p>}

                    <div className="product-detail-stock">
                        {product.estoque > 0 ? (
                            <span className="badge badge-green">Em estoque ({product.estoque} unidades)</span>
                        ) : (
                            <span className="badge badge-red">Esgotado</span>
                        )}
                    </div>

                    {product.estoque > 0 && (
                        <div className="product-detail-actions">
                            <div className="product-detail-qty">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn"><Minus size={16} /></button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(Math.min(product.estoque, qty + 1))} className="qty-btn" disabled={qty >= product.estoque}><Plus size={16} /></button>
                            </div>
                            <button onClick={handleAddToCart} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                                <ShoppingCart size={18} /> Adicionar ao Carrinho
                            </button>
                        </div>
                    )}

                    <div className="product-detail-shipping card p-4 mt-4">
                        <h3 className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                            <Truck size={18} /> Calcular Frete
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="00000-000"
                                value={formatCEP(cep)}
                                onChange={(e) => setCep(sanitizeCEP(e.target.value))}
                                maxLength={9}
                                style={{ flex: 1 }}
                            />
                            <button onClick={calculateShipping} className="btn btn-outline" disabled={shippingLoading}>
                                {shippingLoading ? 'Calculando...' : 'Calcular'}
                            </button>
                        </div>
                        {shippingOptions.length > 0 && (
                            <div className="shipping-results mt-3">
                                {shippingOptions.map((opt) => (
                                    <div key={opt.id} className="shipping-option">
                                        <div>
                                            <strong>{opt.nome}</strong>
                                            <span className="shipping-prazo">{opt.prazo_dias} dias úteis</span>
                                        </div>
                                        <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(opt.preco)}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {Object.keys(product.especificacoes || {}).length > 0 && (
                        <div className="product-detail-specs mt-6">
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Especificações Técnicas</h3>
                            <div className="table-container">
                                <table>
                                    <tbody>
                                        {Object.entries(product.especificacoes).map(([key, val]) => (
                                            <tr key={key}>
                                                <td style={{ fontWeight: 500, width: '40%' }}>{key}</td>
                                                <td>{val}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {product.descricao_completa && (
                        <div className="mt-6">
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Descrição</h3>
                            <div style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {product.descricao_completa}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
