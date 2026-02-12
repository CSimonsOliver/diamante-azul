import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency, getProductImageUrl } from '@/lib/utils'
import './CartDrawer.css'

interface CartDrawerProps {
    open: boolean
    onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
    const { items, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore()
    const navigate = useNavigate()

    const handleCheckout = () => {
        onClose()
        navigate('/carrinho')
    }

    return (
        <>
            {open && <div className="drawer-overlay" onClick={onClose} />}
            <div className={`drawer ${open ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h3>
                        <ShoppingBag size={20} />
                        Carrinho ({getTotalItems()})
                    </h3>
                    <button onClick={onClose} className="drawer-close" aria-label="Fechar carrinho">
                        <X size={20} />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="drawer-empty">
                        <ShoppingBag size={48} strokeWidth={1.5} />
                        <p>Seu carrinho está vazio</p>
                        <button onClick={onClose} className="btn btn-primary btn-sm">
                            Continuar comprando
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="drawer-items">
                            {items.map((item) => {
                                const imgUrl = item.product.imagens?.[0]?.url
                                const price = item.product.preco_promocional ?? item.product.preco
                                return (
                                    <div key={item.product.id} className="drawer-item">
                                        <img
                                            src={getProductImageUrl(imgUrl)}
                                            alt={item.product.nome}
                                            className="drawer-item-img"
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }}
                                        />
                                        <div className="drawer-item-info">
                                            <Link
                                                to={`/produtos/${item.product.slug}`}
                                                className="drawer-item-name"
                                                onClick={onClose}
                                            >
                                                {item.product.nome}
                                            </Link>
                                            <span className="drawer-item-price">{formatCurrency(price)}</span>
                                            <div className="drawer-item-qty">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="qty-btn"
                                                    aria-label="Diminuir"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product.estoque}
                                                    className="qty-btn"
                                                    aria-label="Aumentar"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.product.id)}
                                            className="drawer-item-remove"
                                            aria-label="Remover"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="drawer-footer">
                            <div className="drawer-subtotal">
                                <span>Subtotal</span>
                                <strong>{formatCurrency(getSubtotal())}</strong>
                            </div>
                            <button onClick={handleCheckout} className="btn btn-primary btn-block">
                                Ver Carrinho <ArrowRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
