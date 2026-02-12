import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, Package, AlertTriangle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Order, Product } from '@/types'
import './DashboardPage.css'

export default function DashboardPage() {
    const [stats, setStats] = useState({
        ordersToday: 0,
        ordersWeek: 0,
        ordersMonth: 0,
        pendingOrders: 0,
    })
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
    const [recentOrders, setRecentOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    async function fetchDashboard() {
        try {
            const now = new Date()
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
            const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            const [todayRes, weekRes, monthRes, pendingRes, lowStockRes, recentRes] = await Promise.all([
                supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
                supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
                supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
                supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'aguardando_confirmacao'),
                supabase.from('products').select('*').lt('estoque', 5).eq('ativo', true).order('estoque', { ascending: true }).limit(10),
                supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
            ])

            setStats({
                ordersToday: todayRes.count || 0,
                ordersWeek: weekRes.count || 0,
                ordersMonth: monthRes.count || 0,
                pendingOrders: pendingRes.count || 0,
            })
            setLowStockProducts((lowStockRes.data || []) as unknown as Product[])
            setRecentOrders((recentRes.data || []) as unknown as Order[])
        } catch (err) {
            console.error('Dashboard error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="dashboard-loading"><div className="skeleton" style={{ height: 200 }} /></div>
    }

    return (
        <div className="dashboard">
            <h1 className="admin-page-title">Dashboard</h1>

            <div className="dashboard-stats">
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#DBEAFE' }}>
                        <ShoppingBag size={20} color="#2563EB" />
                    </div>
                    <div>
                        <span className="stat-value">{stats.ordersToday}</span>
                        <span className="stat-label">Pedidos Hoje</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#D1FAE5' }}>
                        <ShoppingBag size={20} color="#10B981" />
                    </div>
                    <div>
                        <span className="stat-value">{stats.ordersWeek}</span>
                        <span className="stat-label">Pedidos na Semana</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#FEF3C7' }}>
                        <ShoppingBag size={20} color="#F59E0B" />
                    </div>
                    <div>
                        <span className="stat-value">{stats.ordersMonth}</span>
                        <span className="stat-label">Pedidos no Mês</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: '#FEE2E2' }}>
                        <Clock size={20} color="#EF4444" />
                    </div>
                    <div>
                        <span className="stat-value">{stats.pendingOrders}</span>
                        <span className="stat-label">Aguardando Confirmação</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-panels">
                <div className="dashboard-panel card">
                    <div className="dashboard-panel-header">
                        <h2><AlertTriangle size={18} /> Estoque Baixo</h2>
                        <Link to="/admin/produtos" className="btn btn-sm btn-outline">Ver todos</Link>
                    </div>
                    {lowStockProducts.length === 0 ? (
                        <p className="dashboard-empty">Nenhum produto com estoque baixo ✅</p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>SKU</th>
                                        <th>Estoque</th>
                                        <th>Preço</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.map((p) => (
                                        <tr key={p.id}>
                                            <td className="truncate" style={{ maxWidth: 200 }}>{p.nome}</td>
                                            <td>{p.sku}</td>
                                            <td>
                                                <span className={`badge ${p.estoque === 0 ? 'badge-red' : 'badge-yellow'}`}>
                                                    {p.estoque}
                                                </span>
                                            </td>
                                            <td>{formatCurrency(p.preco)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="dashboard-panel card">
                    <div className="dashboard-panel-header">
                        <h2><Package size={18} /> Últimos Pedidos</h2>
                        <Link to="/admin/pedidos" className="btn btn-sm btn-outline">Ver todos</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="dashboard-empty">Nenhum pedido ainda</p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Pedido</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((o) => (
                                        <tr key={o.id}>
                                            <td><strong>{o.numero_pedido}</strong></td>
                                            <td>{o.customer_name}</td>
                                            <td>{formatCurrency(o.total)}</td>
                                            <td><span className="badge badge-primary">{o.status.replace(/_/g, ' ')}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
