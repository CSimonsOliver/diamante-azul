import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Save } from 'lucide-react'
import type { CompanySettings } from '@/types'
import toast from 'react-hot-toast'

export default function SettingsPage() {
    const [form, setForm] = useState<Partial<CompanySettings>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [settingsId, setSettingsId] = useState('')

    useEffect(() => { fetchSettings() }, [])

    async function fetchSettings() {
        const { data } = await supabase.from('company_settings').select('*').limit(1).single()
        if (data) { setForm(data as unknown as CompanySettings); setSettingsId(data.id) }
        setLoading(false)
    }

    function updateField(field: string, value: unknown) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            let logo_url = form.logo_url
            let banner_url = form.banner_url

            if (logoFile) {
                const path = `logo-${Date.now()}.${logoFile.name.split('.').pop()}`
                const { error } = await supabase.storage.from('logos').upload(path, logoFile)
                if (error) throw error
                const { data } = supabase.storage.from('logos').getPublicUrl(path)
                logo_url = data.publicUrl
            }

            if (bannerFile) {
                const path = `banner-${Date.now()}.${bannerFile.name.split('.').pop()}`
                const { error } = await supabase.storage.from('banners').upload(path, bannerFile)
                if (error) throw error
                const { data } = supabase.storage.from('banners').getPublicUrl(path)
                banner_url = data.publicUrl
            }

            const { error } = await supabase.from('company_settings').update({
                ...form, logo_url, banner_url
            }).eq('id', settingsId)

            if (error) throw error
            toast.success('Configurações salvas!')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="skeleton" style={{ height: 400 }} />

    return (
        <div>
            <h1 className="admin-page-title">Configurações da Empresa</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                <div className="card p-6">
                    <h2 className="form-section-title">Dados da Empresa</h2>
                    <div className="form-row mb-4">
                        <div className="form-group"><label className="form-label">Razão Social</label><input value={form.razao_social || ''} onChange={(e) => updateField('razao_social', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Nome Fantasia</label><input value={form.nome_fantasia || ''} onChange={(e) => updateField('nome_fantasia', e.target.value)} /></div>
                    </div>
                    <div className="form-row mb-4">
                        <div className="form-group"><label className="form-label">CNPJ</label><input value={form.cnpj || ''} onChange={(e) => updateField('cnpj', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Inscrição Estadual</label><input value={form.ie || ''} onChange={(e) => updateField('ie', e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Email</label><input type="email" value={form.email || ''} onChange={(e) => updateField('email', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Telefone</label><input value={form.telefone || ''} onChange={(e) => updateField('telefone', e.target.value)} /></div>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="form-section-title">WhatsApp & Redes Sociais</h2>
                    <div className="form-group mb-4">
                        <label className="form-label">WhatsApp (checkout)</label>
                        <input value={form.whatsapp || ''} onChange={(e) => updateField('whatsapp', e.target.value)} placeholder="5562999999999" />
                        <span className="form-hint">Formato: DDI + DDD + Número (ex: 5562999999999)</span>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Instagram</label><input value={form.instagram || ''} onChange={(e) => updateField('instagram', e.target.value)} placeholder="https://instagram.com/..." /></div>
                        <div className="form-group"><label className="form-label">Facebook</label><input value={form.facebook || ''} onChange={(e) => updateField('facebook', e.target.value)} placeholder="https://facebook.com/..." /></div>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="form-section-title">Endereço</h2>
                    <div className="form-row mb-4">
                        <div className="form-group"><label className="form-label">CEP</label><input value={form.cep || ''} onChange={(e) => updateField('cep', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Estado</label><input value={form.estado || ''} onChange={(e) => updateField('estado', e.target.value)} /></div>
                    </div>
                    <div className="form-group mb-4"><label className="form-label">Logradouro</label><input value={form.logradouro || ''} onChange={(e) => updateField('logradouro', e.target.value)} /></div>
                    <div className="form-row mb-4">
                        <div className="form-group"><label className="form-label">Número</label><input value={form.numero || ''} onChange={(e) => updateField('numero', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Complemento</label><input value={form.complemento || ''} onChange={(e) => updateField('complemento', e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Bairro</label><input value={form.bairro || ''} onChange={(e) => updateField('bairro', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Cidade</label><input value={form.cidade || ''} onChange={(e) => updateField('cidade', e.target.value)} /></div>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="form-section-title">Visual</h2>
                    <div className="form-row mb-4">
                        <div className="form-group"><label className="form-label">Cor Primária</label><input type="color" value={form.cor_primaria || '#2563EB'} onChange={(e) => updateField('cor_primaria', e.target.value)} style={{ height: 44, padding: 4 }} /></div>
                        <div className="form-group"><label className="form-label">Cor Secundária</label><input type="color" value={form.cor_secundaria || '#1A2744'} onChange={(e) => updateField('cor_secundaria', e.target.value)} style={{ height: 44, padding: 4 }} /></div>
                    </div>
                    <div className="form-row mb-4">
                        <div className="form-group">
                            <label className="form-label">Logo</label>
                            {form.logo_url && <img src={form.logo_url} alt="Logo" style={{ height: 48, marginBottom: 8, objectFit: 'contain' }} />}
                            <label className="btn btn-outline btn-sm"><Upload size={14} /> Alterar Logo<input type="file" accept="image/*" hidden onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></label>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Banner</label>
                            {form.banner_url && <img src={form.banner_url} alt="Banner" style={{ height: 48, marginBottom: 8, objectFit: 'contain' }} />}
                            <label className="btn btn-outline btn-sm"><Upload size={14} /> Alterar Banner<input type="file" accept="image/*" hidden onChange={(e) => setBannerFile(e.target.files?.[0] || null)} /></label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Frete Grátis Acima de (R$)</label>
                        <input type="number" step="0.01" value={form.frete_gratis_acima || 0} onChange={(e) => updateField('frete_gratis_acima', Number(e.target.value))} />
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="form-section-title">Textos Institucionais</h2>
                    <div className="form-group mb-4"><label className="form-label">Sobre Nós</label><textarea value={form.sobre_nos || ''} onChange={(e) => updateField('sobre_nos', e.target.value)} rows={5} /></div>
                    <div className="form-group mb-4"><label className="form-label">Política de Troca</label><textarea value={form.politica_troca || ''} onChange={(e) => updateField('politica_troca', e.target.value)} rows={5} /></div>
                    <div className="form-group"><label className="form-label">Política de Privacidade</label><textarea value={form.politica_privacidade || ''} onChange={(e) => updateField('politica_privacidade', e.target.value)} rows={5} /></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                        <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>
            </form>
        </div>
    )
}
