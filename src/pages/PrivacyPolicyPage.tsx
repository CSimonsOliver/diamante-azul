import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useCompanyStore } from '@/stores/companyStore'
import Breadcrumb from '@/components/Breadcrumb'

export default function PrivacyPolicyPage() {
    const { settings, fetchSettings } = useCompanyStore()
    useEffect(() => { if (!settings) fetchSettings() }, [])

    return (
        <>
            <Helmet>
                <title>Política de Privacidade — Diamante Azul</title>
                <meta name="description" content="Conheça nossa política de privacidade." />
            </Helmet>
            <Breadcrumb items={[{ label: 'Política de Privacidade' }]} />
            <div className="container" style={{ padding: '40px 24px 64px', maxWidth: 800, margin: '0 auto' }}>
                <h1 className="section-title mb-6">Política de Privacidade</h1>
                <div style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {settings?.politica_privacidade || 'Levamos a sua privacidade a sério. Os dados coletados durante a compra são utilizados exclusivamente para processamento de pedidos, comunicação sobre o status da entrega e melhoria dos nossos serviços. Não compartilhamos suas informações pessoais com terceiros.'}
                </div>
            </div>
        </>
    )
}
