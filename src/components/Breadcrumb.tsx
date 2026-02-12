import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import './Breadcrumb.css'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    const location = useLocation()

    if (location.pathname === '/') return null

    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <div className="container">
                <ol className="breadcrumb-list">
                    <li className="breadcrumb-item">
                        <Link to="/" className="breadcrumb-link">
                            <Home size={14} />
                            <span>Início</span>
                        </Link>
                    </li>
                    {items.map((item, i) => (
                        <li key={i} className="breadcrumb-item">
                            <ChevronRight size={14} className="breadcrumb-sep" />
                            {item.href ? (
                                <Link to={item.href} className="breadcrumb-link">{item.label}</Link>
                            ) : (
                                <span className="breadcrumb-current">{item.label}</span>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    )
}
