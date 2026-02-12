import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
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
                <div className="badge-group">
                    {hasDiscount && <span className="badge badge-discount">{discount}% OFF</span>}
                    {product.destaque && <span className="badge badge-destaque">DESTAQUE</span>}
                </div>

                <img
                    src={getProductImageUrl(imageUrl)}
                    alt={product.nome}
                    className="product-card-image"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }}
                />
            </div>

            <div className="product-card-info">
                <h3 className="product-card-title">{product.nome}</h3>

                <div className="stars">★★★★★ (5)</div>

                <div className="product-card-prices">
                    {hasDiscount && <span className="price-old">de {formatCurrency(product.preco)}</span>}
                    <span className="price-current">{formatCurrency(price)}</span>
                    <span className="installments">ou 10x de {formatCurrency(price / 10)}</span>
                </div>

                <div className="btn-buy-hidden">COMPRAR</div>
            </div>
        </Link>
    )
}
