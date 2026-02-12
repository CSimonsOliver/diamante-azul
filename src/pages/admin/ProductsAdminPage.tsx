import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Search, Package, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Product, Category } from '@/types'
import toast from 'react-hot-toast'
import './ProductsAdminPage.css'

export default function ProductsAdminPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const navigate = useNavigate()

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        const [prodRes, catRes] = await Promise.all([
            supabase.from('products').select('*, categories(nome)').order('created_at', { ascending: false }),
            supabase.from('categories').select('*').order('nome'),
        ])
        const prods = (prodRes.data || []).map((p: Record<string, unknown>) => ({
            ...p,
            category: p.categories as unknown as Category,
        })) as unknown as Product[]
        setProducts(prods)
        setCategories((catRes.data || []) as unknown as Category[])
        setLoading(false)
    }

    const filtered = products.filter((p) => {
        if (search && !p.nome.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false
        if (filterCategory && p.category_id !== filterCategory) return false
        if (filterStatus === 'ativo' && !p.ativo) return false
        if (filterStatus === 'inativo' && p.ativo) return false
        if (filterStatus === 'destaque' && !p.destaque) return false
        if (filterStatus === 'estoque_baixo' && p.estoque >= 5) return false
        return true
    })

    async function handleDelete(id: string) {
        if (!confirm('Deseja excluir este produto?')) return
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) { toast.error('Erro ao excluir'); return }
        toast.success('Produto excluído!')
        fetchData()
    }

    async function toggleAtivo(id: string, ativo: boolean) {
        await supabase.from('products').update({ ativo: !ativo }).eq('id', id)
        fetchData()
    }

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Produtos</h1>
                <button onClick={() => navigate('/admin/produtos/novo')} className="btn btn-primary">
                    <Plus size={16} /> Novo Produto
                </button>
            </div>

            <div className="products-filters card p-4 mb-4">
                <div className="products-filters-row">
                    <div className="products-search">
                        <Search size={16} className="products-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="">Todas categorias</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Todos status</option>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="destaque">Destaque</option>
                        <option value="estoque_baixo">Estoque Baixo</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: 300 }} />
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <Package size={48} />
                    <h3>Nenhum produto encontrado</h3>
                    <p>Crie seu primeiro produto ou ajuste os filtros.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Imagem</th>
                                <th>Produto</th>
                                <th>SKU</th>
                                <th>Preço</th>
                                <th>Estoque</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => {
                                const imgUrl = p.imagens?.[0]?.url
                                return (
                                    <tr key={p.id}>
                                        <td>
                                            {imgUrl ? (
                                                <img src={imgUrl} alt="" className="prod-thumb" />
                                            ) : (
                                                <div className="prod-thumb-placeholder" />
                                            )}
                                        </td>
                                        <td>
                                            <div>
                                                <strong className="truncate" style={{ maxWidth: 200, display: 'block' }}>{p.nome}</strong>
                                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.category?.nome}</span>
                                            </div>
                                        </td>
                                        <td>{p.sku || '—'}</td>
                                        <td>
                                            {p.preco_promocional ? (
                                                <div>
                                                    <span className="price-old" style={{ fontSize: 12 }}>{formatCurrency(p.preco)}</span>
                                                    <br />
                                                    <strong>{formatCurrency(p.preco_promocional)}</strong>
                                                </div>
                                            ) : (
                                                <strong>{formatCurrency(p.preco)}</strong>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${p.estoque < 5 ? (p.estoque === 0 ? 'badge-red' : 'badge-yellow') : 'badge-green'}`}>
                                                {p.estoque === 0 ? <><AlertTriangle size={12} /> Esgotado</> : p.estoque}
                                            </span>
                                        </td>
                                        <td>
                                            <label className="toggle" title={p.ativo ? 'Ativo' : 'Inativo'}>
                                                <input type="checkbox" checked={p.ativo} onChange={() => toggleAtivo(p.id, p.ativo)} />
                                                <span className="toggle-slider" />
                                            </label>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Link to={`/admin/produtos/${p.id}`} className="btn btn-sm btn-outline" title="Editar">
                                                    <Edit2 size={14} />
                                                </Link>
                                                <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-danger" title="Excluir">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
