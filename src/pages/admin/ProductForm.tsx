import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react'
import type { Category, ProductImage } from '@/types'
import toast from 'react-hot-toast'
import './ProductForm.css'

interface ProductFormData {
    nome: string; descricao_curta: string; descricao_completa: string
    preco: string; preco_promocional: string; sku: string; estoque: string
    category_id: string; peso_kg: string; altura_cm: string; largura_cm: string
    comprimento_cm: string; ativo: boolean; destaque: boolean
    tags: string; especificacoes: { chave: string; valor: string }[]
}

const emptyForm: ProductFormData = {
    nome: '', descricao_curta: '', descricao_completa: '', preco: '', preco_promocional: '',
    sku: '', estoque: '0', category_id: '', peso_kg: '0', altura_cm: '0', largura_cm: '0',
    comprimento_cm: '0', ativo: true, destaque: false, tags: '', especificacoes: [],
}

export default function ProductForm() {
    const { id } = useParams()
    const isEditing = id && id !== 'novo'
    const navigate = useNavigate()
    const [form, setForm] = useState<ProductFormData>(emptyForm)
    const [categories, setCategories] = useState<Category[]>([])
    const [images, setImages] = useState<ProductImage[]>([])
    const [newFiles, setNewFiles] = useState<File[]>([])
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(!!isEditing)

    useEffect(() => {
        fetchCategories()
        if (isEditing) fetchProduct()
    }, [id])

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*').order('nome')
        setCategories((data || []) as unknown as Category[])
    }

    async function fetchProduct() {
        const { data } = await supabase.from('products').select('*').eq('id', id).single()
        if (data) {
            const p = data as Record<string, unknown>
            const specs = (p.especificacoes as Record<string, string>) || {}
            setForm({
                nome: p.nome as string, descricao_curta: p.descricao_curta as string,
                descricao_completa: p.descricao_completa as string,
                preco: String(p.preco), preco_promocional: p.preco_promocional ? String(p.preco_promocional) : '',
                sku: p.sku as string, estoque: String(p.estoque), category_id: p.category_id as string,
                peso_kg: String(p.peso_kg), altura_cm: String(p.altura_cm),
                largura_cm: String(p.largura_cm), comprimento_cm: String(p.comprimento_cm),
                ativo: p.ativo as boolean, destaque: p.destaque as boolean,
                tags: ((p.tags as string[]) || []).join(', '),
                especificacoes: Object.entries(specs).map(([chave, valor]) => ({ chave, valor })),
            })
            setImages((p.imagens as ProductImage[]) || [])
        }
        setLoading(false)
    }

    function updateField(field: keyof ProductFormData, value: unknown) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    function addSpec() {
        setForm((prev) => ({ ...prev, especificacoes: [...prev.especificacoes, { chave: '', valor: '' }] }))
    }

    function updateSpec(i: number, field: 'chave' | 'valor', value: string) {
        const specs = [...form.especificacoes]
        specs[i][field] = value
        setForm((prev) => ({ ...prev, especificacoes: specs }))
    }

    function removeSpec(i: number) {
        setForm((prev) => ({ ...prev, especificacoes: prev.especificacoes.filter((_, idx) => idx !== i) }))
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || [])
        const total = images.length + newFiles.length + files.length
        if (total > 8) { toast.error('Máximo de 8 imagens'); return }
        setNewFiles((prev) => [...prev, ...files])
    }

    function removeImage(i: number) {
        setImages((prev) => prev.filter((_, idx) => idx !== i))
    }

    function removeNewFile(i: number) {
        setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return }
        if (!form.category_id) { toast.error('Selecione uma categoria'); return }
        if (!form.preco || Number(form.preco) <= 0) { toast.error('Preço inválido'); return }

        setSaving(true)
        try {
            // Upload new images
            const uploadedImages: ProductImage[] = []
            for (const file of newFiles) {
                const ext = file.name.split('.').pop()
                const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
                const { error } = await supabase.storage.from('product-images').upload(path, file)
                if (error) throw error
                const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
                uploadedImages.push({ url: urlData.publicUrl, ordem: images.length + uploadedImages.length })
            }

            const allImages = [...images, ...uploadedImages].map((img, i) => ({ ...img, ordem: i }))

            const specsObj: Record<string, string> = {}
            form.especificacoes.forEach((s) => { if (s.chave.trim()) specsObj[s.chave.trim()] = s.valor.trim() })

            const payload = {
                nome: form.nome.trim(),
                slug: slugify(form.nome),
                descricao_curta: form.descricao_curta.trim(),
                descricao_completa: form.descricao_completa.trim(),
                preco: Number(form.preco),
                preco_promocional: form.preco_promocional ? Number(form.preco_promocional) : null,
                sku: form.sku.trim(),
                estoque: Number(form.estoque),
                category_id: form.category_id,
                peso_kg: Number(form.peso_kg),
                altura_cm: Number(form.altura_cm),
                largura_cm: Number(form.largura_cm),
                comprimento_cm: Number(form.comprimento_cm),
                ativo: form.ativo,
                destaque: form.destaque,
                imagens: allImages,
                especificacoes: specsObj,
                tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
            }

            if (isEditing) {
                const { error } = await supabase.from('products').update(payload).eq('id', id)
                if (error) throw error
                toast.success('Produto atualizado!')
            } else {
                const { error } = await supabase.from('products').insert(payload)
                if (error) throw error
                toast.success('Produto criado!')
            }

            navigate('/admin/produtos')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="skeleton" style={{ height: 400 }} />

    return (
        <div>
            <button onClick={() => navigate('/admin/produtos')} className="btn btn-outline btn-sm mb-4">
                <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="admin-page-title">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="product-form-main">
                    <div className="card p-6">
                        <h2 className="form-section-title">Informações Básicas</h2>
                        <div className="form-group mb-4">
                            <label className="form-label">Nome do Produto *</label>
                            <input value={form.nome} onChange={(e) => updateField('nome', e.target.value)} placeholder="Ex: Torneira Bica Alta Lavabo" />
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label">Descrição Curta</label>
                            <input value={form.descricao_curta} onChange={(e) => updateField('descricao_curta', e.target.value)} placeholder="Resumo do produto" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descrição Completa</label>
                            <textarea value={form.descricao_completa} onChange={(e) => updateField('descricao_completa', e.target.value)} rows={5} placeholder="Detalhes completos do produto" />
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="form-section-title">Imagens</h2>
                        <div className="product-images-grid">
                            {images.map((img, i) => (
                                <div key={i} className="product-image-item">
                                    <img src={img.url} alt="" />
                                    <button type="button" onClick={() => removeImage(i)} className="product-image-remove">
                                        <X size={14} />
                                    </button>
                                    {i === 0 && <span className="product-image-main">Principal</span>}
                                </div>
                            ))}
                            {newFiles.map((file, i) => (
                                <div key={`new-${i}`} className="product-image-item">
                                    <img src={URL.createObjectURL(file)} alt="" />
                                    <button type="button" onClick={() => removeNewFile(i)} className="product-image-remove">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {images.length + newFiles.length < 8 && (
                                <label className="product-image-upload">
                                    <Upload size={24} />
                                    <span>Adicionar</span>
                                    <input type="file" accept="image/*" multiple onChange={handleFileSelect} hidden />
                                </label>
                            )}
                        </div>
                        <p className="form-hint mt-2">Até 8 imagens. A primeira será a imagem principal.</p>
                    </div>

                    <div className="card p-6">
                        <h2 className="form-section-title">Especificações Técnicas</h2>
                        {form.especificacoes.map((spec, i) => (
                            <div key={i} className="spec-row">
                                <input value={spec.chave} onChange={(e) => updateSpec(i, 'chave', e.target.value)} placeholder="Chave (ex: Material)" />
                                <input value={spec.valor} onChange={(e) => updateSpec(i, 'valor', e.target.value)} placeholder="Valor (ex: Aço Inox)" />
                                <button type="button" onClick={() => removeSpec(i)} className="btn btn-sm btn-outline" style={{ flexShrink: 0 }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addSpec} className="btn btn-sm btn-outline mt-2">
                            <Plus size={14} /> Adicionar Especificação
                        </button>
                    </div>
                </div>

                <div className="product-form-sidebar">
                    <div className="card p-6">
                        <h2 className="form-section-title">Publicação</h2>
                        <div className="form-group mb-4" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <label className="toggle">
                                <input type="checkbox" checked={form.ativo} onChange={(e) => updateField('ativo', e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                            <span className="form-label">Produto Ativo</span>
                        </div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <label className="toggle">
                                <input type="checkbox" checked={form.destaque} onChange={(e) => updateField('destaque', e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                            <span className="form-label">Produto Destaque</span>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="form-section-title">Organização</h2>
                        <div className="form-group mb-4">
                            <label className="form-label">Categoria *</label>
                            <select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}>
                                <option value="">Selecione...</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label">SKU</label>
                            <input value={form.sku} onChange={(e) => updateField('sku', e.target.value)} placeholder="DAZ-001" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tags</label>
                            <input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="tag1, tag2, tag3" />
                            <span className="form-hint">Separadas por vírgula</span>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="form-section-title">Preço & Estoque</h2>
                        <div className="form-group mb-4">
                            <label className="form-label">Preço (R$) *</label>
                            <input type="number" step="0.01" value={form.preco} onChange={(e) => updateField('preco', e.target.value)} />
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label">Preço Promocional (R$)</label>
                            <input type="number" step="0.01" value={form.preco_promocional} onChange={(e) => updateField('preco_promocional', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estoque</label>
                            <input type="number" value={form.estoque} onChange={(e) => updateField('estoque', e.target.value)} />
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="form-section-title">Dimensões (Frete)</h2>
                        <div className="form-group mb-4">
                            <label className="form-label">Peso (kg)</label>
                            <input type="number" step="0.001" value={form.peso_kg} onChange={(e) => updateField('peso_kg', e.target.value)} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Altura (cm)</label>
                                <input type="number" step="0.1" value={form.altura_cm} onChange={(e) => updateField('altura_cm', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Largura (cm)</label>
                                <input type="number" step="0.1" value={form.largura_cm} onChange={(e) => updateField('largura_cm', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group mt-3">
                            <label className="form-label">Comprimento (cm)</label>
                            <input type="number" step="0.1" value={form.comprimento_cm} onChange={(e) => updateField('comprimento_cm', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="product-form-footer">
                    <button type="button" onClick={() => navigate('/admin/produtos')} className="btn btn-outline">Cancelar</button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                        {saving ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Criar Produto'}
                    </button>
                </div>
            </form>
        </div>
    )
}
