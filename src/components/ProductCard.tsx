import { Link } from 'react-router-dom'
import { Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency, getProductImageUrl } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'
import './ProductCard.css'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem)
    const price = product.preco_promocional ?? product.preco
    const hasDiscount = product.preco_promocional && product.preco_promocional < product.preco
    const discount = hasDiscount ? Math.round(((product.preco - product.preco_promocional!) / product.preco) * 100) : 0

    // Use first image or placeholder
    const imageUrl = product.imagens?.[0]?.url

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        if (product.estoque <= 0) return
        addItem(product, 1)
        toast.success('Adicionado ao carrinho!')
    }

    return (
        <Link to={`/produtos/${product.slug}`} className="product-card group">
            <div className="product-card-image-wrapper">
                <img
                    src={getProductImageUrl(imageUrl)}
                    alt={product.nome}
                    className="product-card-image"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.svg'
                    }}
                />

                {hasDiscount && (
                    <span className="product-badge badge-discount">
                        -{discount}%
                    </span>
                )}

                {product.estoque <= 0 && (
                    <div className="product-overlay-sold">
                        <span>Esgotado</span>
                    </div>
                )}

                <button
                    className="product-card-add-btn"
                    onClick={handleAdd}
                    disabled={product.estoque <= 0}
                    title="Adicionar ao carrinho"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="product-card-info">
                <div className="product-card-cat">{product.category?.nome}</div>
                <h3 className="product-card-title">{product.nome}</h3>

                <div className="product-card-price-row">
                    <div className="product-card-prices">
                        {hasDiscount && (
                            <span className="price-old">{formatCurrency(product.preco)}</span>
                        )}
                        <span className="price-current">{formatCurrency(price)}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
