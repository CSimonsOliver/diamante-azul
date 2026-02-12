export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            company_settings: {
                Row: {
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
                Insert: Partial<Database['public']['Tables']['company_settings']['Row']> & {
                    razao_social: string
                    nome_fantasia: string
                }
                Update: Partial<Database['public']['Tables']['company_settings']['Row']>
            }
            categories: {
                Row: {
                    id: string
                    nome: string
                    slug: string
                    descricao: string
                    imagem_url: string | null
                    ativo: boolean
                    ordem: number
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['categories']['Row']> & {
                    nome: string
                    slug: string
                }
                Update: Partial<Database['public']['Tables']['categories']['Row']>
            }
            products: {
                Row: {
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
                    imagens: Json
                    especificacoes: Json
                    tags: string[]
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['products']['Row']> & {
                    nome: string
                    slug: string
                    preco: number
                    category_id: string
                }
                Update: Partial<Database['public']['Tables']['products']['Row']>
            }
            orders: {
                Row: {
                    id: string
                    numero_pedido: string
                    customer_name: string
                    customer_email: string
                    customer_cpf: string
                    customer_phone: string
                    shipping_address: Json
                    items: Json
                    subtotal: number
                    shipping_cost: number
                    shipping_method: string
                    total: number
                    status: string
                    whatsapp_sent_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['orders']['Row']> & {
                    customer_name: string
                    customer_email: string
                    items: Json
                    subtotal: number
                    total: number
                }
                Update: Partial<Database['public']['Tables']['orders']['Row']>
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
    }
}
