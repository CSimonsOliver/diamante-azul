import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency, getDiscountPercent, getProductImageUrl } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'
import './ProductCard.css'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((s) => s.addItem)
    const price = product.preco_promocional ?? product.preco
    const hasDiscount = product.preco_promocional && product.preco_promocional < product.preco
    const discount = hasDiscount ? getDiscountPercent(product.preco, product.preco_promocional!) : 0
    const imgUrl = product.imagens?.[0]?.url

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (product.estoque <= 0) {
            toast.error('Produto fora de estoque')
            return
        }
        addItem(product, 1)
        toast.success('Produto adicionado ao carrinho!')
    }

    return (
        <Link to={`/produtos/${product.slug}`} className="product-card card">
            <div className="product-card-image-wrapper">
                <img
                    src={getProductImageUrl(imgUrl)}
                    alt={product.nome}
                    className="product-card-image"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }}
                />
                {hasDiscount && (
                    <span className="product-card-discount badge badge-red">-{discount}%</span>
                )}
                {product.destaque && (
                    <span className="product-card-badge badge badge-blue">
                        ⚡ Alta Durabilidade
                    </span>
                )}
                {product.estoque <= 0 && (
                    <div className="product-card-soldout">Esgotado</div>
                )}
            </div>

            <div className="product-card-body">
                <span className="product-card-category">{product.category?.nome || 'Sem categoria'}</span>
                <h3 className="product-card-name">{product.nome}</h3>

                <div className="product-card-prices">
                    {hasDiscount && (
                        <span className="price-old">{formatCurrency(product.preco)}</span>
                    )}
                    <span className="price">{formatCurrency(price)}</span>
                </div>

                <button
                    className="btn btn-primary btn-block product-card-btn"
                    onClick={handleAddToCart}
                    disabled={product.estoque <= 0}
                >
                    <ShoppingCart size={16} />
                    {product.estoque <= 0 ? 'Esgotado' : 'Adicionar'}
                </button>
            </div>
        </Link>
    )
}
