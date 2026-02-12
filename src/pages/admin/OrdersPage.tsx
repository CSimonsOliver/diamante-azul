import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, Eye, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import toast from 'react-hot-toast'

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'aguardando_confirmacao', label: 'Aguardando', color: 'badge-yellow' },
    { value: 'confirmado', label: 'Confirmado', color: 'badge-primary' },
    { value: 'em_producao', label: 'Em Produção', color: 'badge-blue' },
    { value: 'enviado', label: 'Enviado', color: 'badge-primary' },
    { value: 'entregue', label: 'Entregue', color: 'badge-green' },
    { value: 'cancelado', label: 'Cancelado', color: 'badge-red' },
]

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    useEffect(() => { fetchOrders() }, [])

    async function fetchOrders() {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
        setOrders((data || []) as unknown as Order[])
        setLoading(false)
    }

    const filtered = orders.filter((o) => !filterStatus || o.status === filterStatus)

    async function updateStatus(orderId: string, status: OrderStatus) {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
        if (error) { toast.error('Erro ao atualizar'); return }
        toast.success('Status atualizado!')
        fetchOrders()
        if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status })
    }

    function getStatusBadge(status: string) {
        const opt = STATUS_OPTIONS.find((s) => s.value === status)
        return <span className={`badge ${opt?.color || 'badge-gray'}`}>{opt?.label || status}</span>
    }

    return (
        <div>
            <div className="admin-page-header" style={{ marginBottom: 24 }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>Pedidos</h1>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ minWidth: 180 }}>
                    <option value="">Todos os status</option>
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: 300 }} />
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <ShoppingBag size={48} />
                    <h3>Nenhum pedido encontrado</h3>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o) => (
                                <tr key={o.id}>
                                    <td><strong>{o.numero_pedido}</strong></td>
                                    <td>
                                        <div>{o.customer_name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{o.customer_email}</div>
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td><strong>{formatCurrency(o.total)}</strong></td>
                                    <td>{getStatusBadge(o.status)}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSelectedOrder(o)} className="btn btn-sm btn-outline">
                                                <Eye size={14} /> Ver
                                            </button>
                                            <div style={{ position: 'relative' }}>
                                                <select
                                                    value={o.status}
                                                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                                                    style={{ padding: '6px 8px', fontSize: 12, minWidth: 100 }}
                                                >
                                                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <div className="category-form-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="card" style={{ maxWidth: 600, width: '100%', padding: 32, maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2>{selectedOrder.numero_pedido}</h2>
                            {getStatusBadge(selectedOrder.status)}
                        </div>

                        <div className="mb-4">
                            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Cliente</h3>
                            <p style={{ fontSize: 14 }}>{selectedOrder.customer_name}</p>
                            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{selectedOrder.customer_email} • {selectedOrder.customer_phone}</p>
                            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>CPF: {selectedOrder.customer_cpf}</p>
                        </div>

                        <div className="mb-4">
                            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Endereço de Entrega</h3>
                            {selectedOrder.shipping_address && (
                                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                                    {selectedOrder.shipping_address.logradouro}, {selectedOrder.shipping_address.numero}
                                    {selectedOrder.shipping_address.complemento && ` - ${selectedOrder.shipping_address.complemento}`}
                                    <br />
                                    {selectedOrder.shipping_address.bairro} — {selectedOrder.shipping_address.cidade}/{selectedOrder.shipping_address.estado}
                                    <br />
                                    CEP: {selectedOrder.shipping_address.cep}
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Itens</h3>
                            {selectedOrder.items?.map((item, i) => (
                                <div key={i} className="flex justify-between items-center" style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ fontSize: 13 }}>{item.quantidade}x {item.nome}</span>
                                    <strong style={{ fontSize: 13 }}>{formatCurrency(item.preco * item.quantidade)}</strong>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: 12 }}>
                            <div className="flex justify-between mb-2" style={{ fontSize: 14 }}>
                                <span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span>
                            </div>
                            <div className="flex justify-between mb-2" style={{ fontSize: 14 }}>
                                <span>Frete ({selectedOrder.shipping_method})</span><span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between" style={{ fontSize: 18, fontWeight: 700 }}>
                                <span>Total</span><span>{formatCurrency(selectedOrder.total)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <select
                                value={selectedOrder.status}
                                onChange={(e) => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                                style={{ minWidth: 160 }}
                            >
                                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <button onClick={() => setSelectedOrder(null)} className="btn btn-outline">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
