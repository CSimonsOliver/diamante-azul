import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useCompanyStore } from '@/stores/companyStore'
import Breadcrumb from '@/components/Breadcrumb'

export default function ExchangePolicyPage() {
    const { settings, fetchSettings } = useCompanyStore()
    useEffect(() => { if (!settings) fetchSettings() }, [])

    return (
        <>
            <Helmet>
                <title>Política de Troca — Diamante Azul</title>
                <meta name="description" content="Conheça nossa política de trocas e devoluções." />
            </Helmet>
            <Breadcrumb items={[{ label: 'Política de Troca' }]} />
            <div className="container" style={{ padding: '40px 24px 64px', maxWidth: 800, margin: '0 auto' }}>
                <h1 className="section-title mb-6">Política de Troca e Devolução</h1>
                <div style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {settings?.politica_troca || 'Aceitamos trocas e devoluções em até 7 dias após o recebimento, desde que o produto esteja em sua embalagem original e sem sinais de uso. Para solicitar uma troca, entre em contato pelo nosso WhatsApp.'}
                </div>
            </div>
        </>
    )
}
