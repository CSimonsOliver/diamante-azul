import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useCartStore } from '@/stores/cartStore'
import { useCompanyStore } from '@/stores/companyStore'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { formatCurrency, getProductImageUrl } from '@/lib/utils'
import './CartPage.css'

export default function CartPage() {
    const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore()
    const { settings } = useCompanyStore()
    const subtotal = getSubtotal()
    const freeShippingMin = settings?.frete_gratis_acima || 299

    return (
        <>
            <Helmet><title>Carrinho — Diamante Azul</title></Helmet>
            <Breadcrumb items={[{ label: 'Carrinho' }]} />

            <div className="container cart-page">
                <h1 className="section-title mb-6">Carrinho de Compras</h1>

                {items.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={64} strokeWidth={1.5} />
                        <h3>Seu carrinho está vazio</h3>
                        <p>Adicione produtos para continuar.</p>
                        <Link to="/produtos" className="btn btn-primary mt-4">Ver Produtos</Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Preço</th>
                                            <th>Quantidade</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => {
                                            const price = item.product.preco_promocional ?? item.product.preco
                                            const imgUrl = item.product.imagens?.[0]?.url
                                            return (
                                                <tr key={item.product.id}>
                                                    <td>
                                                        <div className="cart-product-cell">
                                                            <img src={getProductImageUrl(imgUrl)} alt={item.product.nome} className="cart-product-img" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }} />
                                                            <div>
                                                                <Link to={`/produtos/${item.product.slug}`} className="cart-product-name">{item.product.nome}</Link>
                                                                {item.product.sku && <span className="cart-product-sku">SKU: {item.product.sku}</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{formatCurrency(price)}</td>
                                                    <td>
                                                        <div className="cart-qty">
                                                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="qty-btn"><Minus size={14} /></button>
                                                            <span>{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.estoque} className="qty-btn"><Plus size={14} /></button>
                                                        </div>
                                                    </td>
                                                    <td><strong>{formatCurrency(price * item.quantity)}</strong></td>
                                                    <td>
                                                        <button onClick={() => removeItem(item.product.id)} className="cart-remove-btn" title="Remover">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="cart-actions mt-4">
                                <Link to="/produtos" className="btn btn-outline">Continuar comprando</Link>
                                <button onClick={clearCart} className="btn btn-outline" style={{ color: 'var(--color-discount)' }}>Limpar carrinho</button>
                            </div>
                        </div>

                        <div className="cart-summary card p-6">
                            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Resumo</h2>

                            {subtotal < freeShippingMin && (
                                <div className="cart-free-shipping-bar mb-4">
                                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                                        Faltam <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(freeShippingMin - subtotal)}</strong> para frete grátis!
                                    </p>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${Math.min(100, (subtotal / freeShippingMin) * 100)}%` }} />
                                    </div>
                                </div>
                            )}

                            {subtotal >= freeShippingMin && (
                                <div className="badge badge-green mb-4" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px' }}>
                                    🎉 Você ganhou frete grátis!
                                </div>
                            )}

                            <div className="cart-summary-row">
                                <span>Subtotal</span>
                                <strong>{formatCurrency(subtotal)}</strong>
                            </div>
                            <div className="cart-summary-row" style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                                <span>Frete</span>
                                <span>{subtotal >= freeShippingMin ? 'Grátis' : 'Calculado no checkout'}</span>
                            </div>
                            <div className="cart-summary-total">
                                <span>Total</span>
                                <strong>{formatCurrency(subtotal)}</strong>
                            </div>

                            <Link to="/checkout" className="btn btn-primary btn-block btn-lg mt-4">
                                Finalizar Compra <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
