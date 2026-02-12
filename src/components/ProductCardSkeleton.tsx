import './ProductCardSkeleton.css'

export default function ProductCardSkeleton() {
    return (
        <div className="product-skeleton card">
            <div className="skeleton product-skeleton-image" />
            <div className="product-skeleton-body">
                <div className="skeleton product-skeleton-cat" />
                <div className="skeleton product-skeleton-name" />
                <div className="skeleton product-skeleton-name2" />
                <div className="skeleton product-skeleton-price" />
                <div className="skeleton product-skeleton-btn" />
            </div>
        </div>
    )
}
