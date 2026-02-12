import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useCompanyStore } from '@/stores/companyStore'
import Breadcrumb from '@/components/Breadcrumb'

export default function AboutPage() {
    const { settings, fetchSettings } = useCompanyStore()
    useEffect(() => { if (!settings) fetchSettings() }, [])

    return (
        <>
            <Helmet>
                <title>Sobre Nós — Diamante Azul</title>
                <meta name="description" content="Conheça a Diamante Azul, referência em materiais hidráulicos." />
            </Helmet>
            <Breadcrumb items={[{ label: 'Sobre Nós' }]} />
            <div className="container" style={{ padding: '40px 24px 64px', maxWidth: 800, margin: '0 auto' }}>
                <h1 className="section-title mb-6">Sobre Nós</h1>
                <div style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {settings?.sobre_nos || 'A Diamante Azul é referência em materiais hidráulicos, oferecendo produtos de alta qualidade com os melhores preços do mercado. Nossa missão é fornecer soluções completas para projetos hidráulicos residenciais e comerciais, com atendimento especializado e entrega ágil para todo o Brasil.'}
                </div>
            </div>
        </>
    )
}
