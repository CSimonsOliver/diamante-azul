import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'
import toast from 'react-hot-toast'
import './CategoriesPage.css'

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Category | null>(null)
    const [form, setForm] = useState({ nome: '', descricao: '', ativo: true, ordem: 0 })
    const [saving, setSaving] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)

    useEffect(() => { fetchCategories() }, [])

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*').order('ordem')
        setCategories((data || []) as unknown as Category[])
        setLoading(false)
    }

    function openForm(cat?: Category) {
        if (cat) {
            setEditing(cat)
            setForm({ nome: cat.nome, descricao: cat.descricao, ativo: cat.ativo, ordem: cat.ordem })
        } else {
            setEditing(null)
            setForm({ nome: '', descricao: '', ativo: true, ordem: categories.length })
        }
        setImageFile(null)
        setShowForm(true)
    }

    function closeForm() {
        setShowForm(false)
        setEditing(null)
        setForm({ nome: '', descricao: '', ativo: true, ordem: 0 })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return }
        setSaving(true)

        try {
            let imagem_url = editing?.imagem_url || null

            if (imageFile) {
                const ext = imageFile.name.split('.').pop()
                const path = `${Date.now()}.${ext}`
                const { error: uploadError } = await supabase.storage.from('category-images').upload(path, imageFile)
                if (uploadError) throw uploadError
                const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(path)
                imagem_url = urlData.publicUrl
            }

            const payload = {
                nome: form.nome.trim(),
                slug: slugify(form.nome),
                descricao: form.descricao.trim(),
                ativo: form.ativo,
                ordem: form.ordem,
                imagem_url,
            }

            if (editing) {
                const { error } = await supabase.from('categories').update(payload).eq('id', editing.id)
                if (error) throw error
                toast.success('Categoria atualizada!')
            } else {
                const { error } = await supabase.from('categories').insert(payload)
                if (error) throw error
                toast.success('Categoria criada!')
            }

            closeForm()
            fetchCategories()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Deseja excluir esta categoria?')) return
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (error) {
            toast.error('Não é possível excluir: existem produtos vinculados')
        } else {
            toast.success('Categoria excluída!')
            fetchCategories()
        }
    }

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Categorias</h1>
                <button onClick={() => openForm()} className="btn btn-primary">
                    <Plus size={16} /> Nova Categoria
                </button>
            </div>

            {showForm && (
                <div className="category-form-overlay">
                    <form onSubmit={handleSubmit} className="category-form card">
                        <h2>{editing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
                        <div className="form-group">
                            <label className="form-label">Nome *</label>
                            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Torneiras" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descrição</label>
                            <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} placeholder="Descrição da categoria" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Ordem</label>
                                <input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Imagem</label>
                                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                            </div>
                        </div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <label className="toggle">
                                <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
                                <span className="toggle-slider" />
                            </label>
                            <span className="form-label">Ativa</span>
                        </div>
                        <div className="category-form-actions">
                            <button type="button" onClick={closeForm} className="btn btn-outline">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="skeleton" style={{ height: 200 }} />
            ) : categories.length === 0 ? (
                <div className="empty-state">
                    <GripVertical size={48} />
                    <h3>Nenhuma categoria</h3>
                    <p>Crie sua primeira categoria para organizar os produtos.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ordem</th>
                                <th>Imagem</th>
                                <th>Nome</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.ordem}</td>
                                    <td>
                                        {cat.imagem_url ? (
                                            <img src={cat.imagem_url} alt="" className="cat-thumb" />
                                        ) : (
                                            <div className="cat-thumb-placeholder" />
                                        )}
                                    </td>
                                    <td><strong>{cat.nome}</strong></td>
                                    <td>
                                        <span className={`badge ${cat.ativo ? 'badge-green' : 'badge-gray'}`}>
                                            {cat.ativo ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={() => openForm(cat)} className="btn btn-sm btn-outline" title="Editar">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="btn btn-sm btn-danger" title="Excluir">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
