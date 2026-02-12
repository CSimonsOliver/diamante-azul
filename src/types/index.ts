/* ============================================================
   Types for Diamante Azul E-commerce
   ============================================================ */

export interface CompanySettings {
    id: string
    razao_social: string
    nome_fantasia: string
    cnpj: string
    ie: string
    email: string
    telefone: string
    whatsapp: string
    cep: string
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    logo_url: string | null
    banner_url: string | null
    cor_primaria: string
    cor_secundaria: string
    frete_gratis_acima: number
    politica_troca: string
    politica_privacidade: string
    sobre_nos: string
    instagram: string
    facebook: string
    created_at: string
    updated_at: string
}

export interface Category {
    id: string
    nome: string
    slug: string
    descricao: string
    imagem_url: string | null
    ativo: boolean
    ordem: number
    created_at: string
}

export interface Product {
    id: string
    category_id: string
    nome: string
    slug: string
    descricao_curta: string
    descricao_completa: string
    preco: number
    preco_promocional: number | null
    sku: string
    estoque: number
    peso_kg: number
    altura_cm: number
    largura_cm: number
    comprimento_cm: number
    ativo: boolean
    destaque: boolean
    imagens: ProductImage[]
    especificacoes: Record<string, string>
    tags: string[]
    created_at: string
    updated_at: string
    // joined
    category?: Category
}

export interface ProductImage {
    url: string
    ordem: number
    alt?: string
}

export type OrderStatus =
    | 'aguardando_confirmacao'
    | 'confirmado'
    | 'em_producao'
    | 'enviado'
    | 'entregue'
    | 'cancelado'

export interface OrderItem {
    product_id: string
    nome: string
    sku: string
    preco: number
    quantidade: number
    imagem_url: string | null
}

export interface ShippingAddress extends Record<string, string> {
    cep: string
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    referencia: string
}

export interface Order {
    id: string
    numero_pedido: string
    customer_name: string
    customer_email: string
    customer_cpf: string
    customer_phone: string
    shipping_address: ShippingAddress
    items: OrderItem[]
    subtotal: number
    shipping_cost: number
    shipping_method: string
    total: number
    status: OrderStatus
    whatsapp_sent_at: string | null
    created_at: string
    updated_at: string
}

export interface CartItem {
    product: Product
    quantity: number
}

export interface ShippingOption {
    id: string
    nome: string
    empresa: string
    preco: number
    prazo_dias: number
    logo: string
}

export interface CepResult {
    cep: string
    logradouro: string
    complemento: string
    bairro: string
    localidade: string
    uf: string
    erro?: boolean
}

export interface CheckoutData {
    customer: {
        nome: string
        email: string
        cpf: string
        telefone: string
    }
    address: ShippingAddress
    shipping: ShippingOption | null
}
