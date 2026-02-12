import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
    return (
        <>
            <Helmet><title>Página não encontrada — Diamante Azul</title></Helmet>
            <div className="container" style={{ padding: '80px 24px', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h1 style={{ fontSize: 72, fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>404</h1>
                <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 16 }}>Página não encontrada</h2>
                <p style={{ color: 'var(--color-text-muted)', marginTop: 8, maxWidth: 400 }}>
                    A página que você está procurando pode ter sido removida ou está temporariamente indisponível.
                </p>
                <Link to="/" className="btn btn-primary mt-6">Voltar para a Loja</Link>
            </div>
        </>
    )
}
