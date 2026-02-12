import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useCartStore } from '@/stores/cartStore'
import { useCompanyStore } from '@/stores/companyStore'
import { supabase } from '@/lib/supabase'
import Breadcrumb from '@/components/Breadcrumb'
import { formatCurrency, formatCPF, formatPhone, formatCEP, sanitizeCEP, isValidCEP, isValidCPF, isValidEmail, getProductImageUrl } from '@/lib/utils'
import { User, MapPin, Truck, ShoppingBag, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import type { CheckoutData, ShippingOption } from '@/types'
import toast from 'react-hot-toast'
import './CheckoutPage.css'

const STEPS = [
    { icon: User, label: 'Dados' },
    { icon: MapPin, label: 'Endereço' },
    { icon: Truck, label: 'Frete' },
    { icon: ShoppingBag, label: 'Resumo' },
]

export default function CheckoutPage() {
    const { items, getSubtotal, clearCart } = useCartStore()
    const { settings } = useCompanyStore()
    const [step, setStep] = useState(0)
    const [data, setData] = useState<CheckoutData>({
        customer: { nome: '', email: '', cpf: '', telefone: '' },
        address: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', referencia: '' },
        shipping: null,
    })
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
    const [shippingLoading, setShippingLoading] = useState(false)
    const [sending, setSending] = useState(false)

    const subtotal = getSubtotal()
    const freeShippingMin = settings?.frete_gratis_acima || 299
    const isFreeShipping = subtotal >= freeShippingMin
    const shippingCost = isFreeShipping ? 0 : (data.shipping?.preco || 0)
    const total = subtotal + shippingCost

    function updateCustomer(field: string, value: string) {
        setData((prev) => ({ ...prev, customer: { ...prev.customer, [field]: value } }))
    }

    function updateAddress(field: string, value: string) {
        setData((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }))
    }

    async function lookupCep() {
        const cep = sanitizeCEP(data.address.cep)
        if (!isValidCEP(cep)) { toast.error('CEP inválido'); return }
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const result = await res.json()
            if (result.erro) { toast.error('CEP não encontrado'); return }
            setData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    logradouro: result.logradouro || prev.address.logradouro,
                    bairro: result.bairro || prev.address.bairro,
                    cidade: result.localidade || prev.address.cidade,
                    estado: result.uf || prev.address.estado,
                },
            }))
            toast.success('Endereço encontrado!')
        } catch {
            toast.error('Erro ao buscar CEP')
        }
    }

    async function fetchShipping() {
        setShippingLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-shipping`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
                body: JSON.stringify({
                    cep_destino: sanitizeCEP(data.address.cep),
                    produtos: items.map((i) => ({
                        peso: i.product.peso_kg, altura: i.product.altura_cm,
                        largura: i.product.largura_cm, comprimento: i.product.comprimento_cm,
                        quantidade: i.quantity,
                    })),
                }),
            })
            if (!response.ok) throw new Error()
            setShippingOptions(await response.json())
        } catch {
            setShippingOptions([
                { id: '1', nome: 'PAC', empresa: 'Correios', preco: 18.50, prazo_dias: 7, logo: '' },
                { id: '2', nome: 'SEDEX', empresa: 'Correios', preco: 32.90, prazo_dias: 3, logo: '' },
            ])
        } finally {
            setShippingLoading(false)
        }
    }

    function validateStep(): boolean {
        if (step === 0) {
            if (!data.customer.nome.trim()) { toast.error('Preencha o nome'); return false }
            if (!isValidEmail(data.customer.email)) { toast.error('Email inválido'); return false }
            if (!isValidCPF(data.customer.cpf)) { toast.error('CPF inválido'); return false }
            if (!data.customer.telefone.replace(/\D/g, '').length) { toast.error('Preencha o telefone'); return false }
        }
        if (step === 1) {
            if (!isValidCEP(data.address.cep)) { toast.error('CEP inválido'); return false }
            if (!data.address.logradouro.trim()) { toast.error('Preencha o logradouro'); return false }
            if (!data.address.numero.trim()) { toast.error('Preencha o número'); return false }
            if (!data.address.bairro.trim()) { toast.error('Preencha o bairro'); return false }
            if (!data.address.cidade.trim()) { toast.error('Preencha a cidade'); return false }
        }
        if (step === 2 && !isFreeShipping && !data.shipping) {
            toast.error('Selecione uma opção de frete'); return false
        }
        return true
    }

    function nextStep() {
        if (!validateStep()) return
        if (step === 1 && shippingOptions.length === 0) fetchShipping()
        setStep((s) => Math.min(3, s + 1))
    }

    async function finishOrder() {
        setSending(true)
        try {
            // Save order
            const { error } = await supabase.from('orders').insert({
                customer_name: data.customer.nome,
                customer_email: data.customer.email,
                customer_cpf: data.customer.cpf,
                customer_phone: data.customer.telefone,
                shipping_address: data.address,
                items: items.map((i) => ({
                    product_id: i.product.id, nome: i.product.nome, sku: i.product.sku,
                    preco: i.product.preco_promocional ?? i.product.preco,
                    quantidade: i.quantity, imagem_url: i.product.imagens?.[0]?.url || null,
                })),
                subtotal, shipping_cost: shippingCost,
                shipping_method: isFreeShipping ? 'Frete Grátis' : (data.shipping?.nome || ''),
                total, status: 'aguardando_confirmacao', whatsapp_sent_at: new Date().toISOString(),
            })

            if (error) console.error('Order save error:', error)

            // Generate WhatsApp message
            const prodLines = items.map((i) => {
                const price = i.product.preco_promocional ?? i.product.preco
                return `• ${i.quantity}x ${i.product.nome} - ${formatCurrency(price)} (cada)`
            }).join('\n')

            const freteLabel = isFreeShipping ? 'Grátis 🎉' : `${data.shipping?.nome} - ${data.shipping?.prazo_dias} dias úteis`

            const msg = `Olá! Gostaria de fazer um pedido: 🛒

*DADOS DO PEDIDO*
━━━━━━━━━━━━━━━━
*Produtos:*
${prodLines}

*Subtotal:* ${formatCurrency(subtotal)}
*Frete (${freteLabel}):* ${isFreeShipping ? 'R$ 0,00' : formatCurrency(shippingCost)}
*TOTAL: ${formatCurrency(total)}*

━━━━━━━━━━━━━━━━
*DADOS DO CLIENTE*
Nome: ${data.customer.nome}
Email: ${data.customer.email}
CPF: ${data.customer.cpf}
Telefone: ${data.customer.telefone}

*ENDEREÇO DE ENTREGA*
${data.address.logradouro}, ${data.address.numero}${data.address.complemento ? ` - ${data.address.complemento}` : ''}
${data.address.bairro} - ${data.address.cidade}/${data.address.estado}
CEP: ${formatCEP(data.address.cep)}
${data.address.referencia ? `Referência: ${data.address.referencia}` : ''}

Aguardo confirmação e forma de pagamento! 😊`

            const whatsappUrl = `https://wa.me/${settings?.whatsapp || '5562999999999'}?text=${encodeURIComponent(msg)}`
            window.open(whatsappUrl, '_blank')
            clearCart()
            toast.success('Pedido enviado! Confira o WhatsApp.')
        } catch (err) {
            toast.error('Erro ao processar pedido')
        } finally {
            setSending(false)
        }
    }

    if (items.length === 0 && step < 3) {
        return (
            <div className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
                <CheckCircle size={64} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
                <h2>Pedido Enviado!</h2>
                <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>Confira o WhatsApp para dar continuidade.</p>
                <a href="/" className="btn btn-primary mt-6">Voltar à Loja</a>
            </div>
        )
    }

    return (
        <>
            <Helmet><title>Checkout — Diamante Azul</title></Helmet>
            <Breadcrumb items={[{ label: 'Carrinho', href: '/carrinho' }, { label: 'Checkout' }]} />

            <div className="container checkout-page">
                <div className="checkout-steps">
                    {STEPS.map((s, i) => (
                        <div key={i} className={`checkout-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                            <div className="checkout-step-icon"><s.icon size={18} /></div>
                            <span>{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="checkout-content">
                    {step === 0 && (
                        <div className="card p-6">
                            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Dados do Cliente</h2>
                            <div className="form-group mb-4"><label className="form-label">Nome Completo *</label><input value={data.customer.nome} onChange={(e) => updateCustomer('nome', e.target.value)} placeholder="João Silva" /></div>
                            <div className="form-row mb-4">
                                <div className="form-group"><label className="form-label">Email *</label><input type="email" value={data.customer.email} onChange={(e) => updateCustomer('email', e.target.value)} placeholder="joao@email.com" /></div>
                                <div className="form-group"><label className="form-label">CPF *</label><input value={formatCPF(data.customer.cpf)} onChange={(e) => updateCustomer('cpf', e.target.value.replace(/\D/g, ''))} placeholder="000.000.000-00" maxLength={14} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Telefone *</label><input value={formatPhone(data.customer.telefone)} onChange={(e) => updateCustomer('telefone', e.target.value.replace(/\D/g, ''))} placeholder="(62) 99999-9999" maxLength={15} /></div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="card p-6">
                            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Endereço de Entrega</h2>
                            <div className="form-group mb-4">
                                <label className="form-label">CEP *</label>
                                <div className="flex gap-2">
                                    <input value={formatCEP(data.address.cep)} onChange={(e) => updateAddress('cep', sanitizeCEP(e.target.value))} placeholder="00000-000" maxLength={9} style={{ flex: 1 }} />
                                    <button type="button" onClick={lookupCep} className="btn btn-outline">Buscar</button>
                                </div>
                            </div>
                            <div className="form-group mb-4"><label className="form-label">Logradouro *</label><input value={data.address.logradouro} onChange={(e) => updateAddress('logradouro', e.target.value)} /></div>
                            <div className="form-row mb-4">
                                <div className="form-group"><label className="form-label">Número *</label><input value={data.address.numero} onChange={(e) => updateAddress('numero', e.target.value)} /></div>
                                <div className="form-group"><label className="form-label">Complemento</label><input value={data.address.complemento} onChange={(e) => updateAddress('complemento', e.target.value)} placeholder="Apto, bloco..." /></div>
                            </div>
                            <div className="form-row mb-4">
                                <div className="form-group"><label className="form-label">Bairro *</label><input value={data.address.bairro} onChange={(e) => updateAddress('bairro', e.target.value)} /></div>
                                <div className="form-group"><label className="form-label">Cidade *</label><input value={data.address.cidade} onChange={(e) => updateAddress('cidade', e.target.value)} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Estado *</label><input value={data.address.estado} onChange={(e) => updateAddress('estado', e.target.value)} maxLength={2} /></div>
                                <div className="form-group"><label className="form-label">Referência</label><input value={data.address.referencia} onChange={(e) => updateAddress('referencia', e.target.value)} placeholder="Próximo ao..." /></div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="card p-6">
                            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Opções de Frete</h2>
                            {isFreeShipping ? (
                                <div className="badge badge-green" style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 16 }}>🎉 Frete Grátis!</div>
                            ) : shippingLoading ? (
                                <div className="skeleton" style={{ height: 120 }} />
                            ) : (
                                <div className="checkout-shipping-options">
                                    {shippingOptions.map((opt) => (
                                        <label key={opt.id} className={`checkout-shipping-opt ${data.shipping?.id === opt.id ? 'selected' : ''}`}>
                                            <input type="radio" name="shipping" checked={data.shipping?.id === opt.id} onChange={() => setData((p) => ({ ...p, shipping: opt }))} />
                                            <div>
                                                <strong>{opt.nome} ({opt.empresa})</strong>
                                                <span>{opt.prazo_dias} dias úteis</span>
                                            </div>
                                            <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(opt.preco)}</strong>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="card p-6">
                            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Resumo do Pedido</h2>
                            <div className="checkout-summary-items">
                                {items.map((item) => {
                                    const price = item.product.preco_promocional ?? item.product.preco
                                    return (
                                        <div key={item.product.id} className="checkout-summary-item">
                                            <img src={getProductImageUrl(item.product.imagens?.[0]?.url)} alt="" className="checkout-summary-img" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg' }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 14, fontWeight: 500 }}>{item.product.nome}</p>
                                                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{item.quantity}x {formatCurrency(price)}</p>
                                            </div>
                                            <strong>{formatCurrency(price * item.quantity)}</strong>
                                        </div>
                                    )
                                })}
                            </div>

                            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 16, paddingTop: 16 }}>
                                <div className="cart-summary-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="cart-summary-row"><span>Frete</span><span>{isFreeShipping ? 'Grátis' : formatCurrency(shippingCost)}</span></div>
                                <div className="cart-summary-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
                            </div>
                        </div>
                    )}

                    <div className="checkout-nav">
                        {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="btn btn-outline"><ArrowLeft size={16} /> Voltar</button>}
                        <div style={{ flex: 1 }} />
                        {step < 3 ? (
                            <button onClick={nextStep} className="btn btn-primary btn-lg">Continuar <ArrowRight size={16} /></button>
                        ) : (
                            <button onClick={finishOrder} className="btn btn-success btn-lg" disabled={sending}>
                                {sending ? 'Enviando...' : '✅ Finalizar pelo WhatsApp'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
