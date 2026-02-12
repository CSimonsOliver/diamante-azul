export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          id: string
          imagem_url: string | null
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          id?: string
          imagem_url?: string | null
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          id?: string
          imagem_url?: string | null
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          bairro: string
          banner_url: string | null
          cep: string
          cidade: string
          cnpj: string
          complemento: string
          cor_primaria: string
          cor_secundaria: string
          created_at: string
          email: string
          estado: string
          facebook: string
          frete_gratis_acima: number
          id: string
          ie: string
          instagram: string
          logo_url: string | null
          logradouro: string
          nome_fantasia: string
          numero: string
          politica_privacidade: string
          politica_troca: string
          razao_social: string
          sobre_nos: string
          telefone: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          bairro?: string
          banner_url?: string | null
          cep?: string
          cidade?: string
          cnpj?: string
          complemento?: string
          cor_primaria?: string
          cor_secundaria?: string
          created_at?: string
          email?: string
          estado?: string
          facebook?: string
          frete_gratis_acima?: number
          id?: string
          ie?: string
          instagram?: string
          logo_url?: string | null
          logradouro?: string
          nome_fantasia?: string
          numero?: string
          politica_privacidade?: string
          politica_troca?: string
          razao_social?: string
          sobre_nos?: string
          telefone?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          bairro?: string
          banner_url?: string | null
          cep?: string
          cidade?: string
          cnpj?: string
          complemento?: string
          cor_primaria?: string
          cor_secundaria?: string
          created_at?: string
          email?: string
          estado?: string
          facebook?: string
          frete_gratis_acima?: number
          id?: string
          ie?: string
          instagram?: string
          logo_url?: string | null
          logradouro?: string
          nome_fantasia?: string
          numero?: string
          politica_privacidade?: string
          politica_troca?: string
          razao_social?: string
          sobre_nos?: string
          telefone?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          items: Json
          numero_pedido: string
          shipping_address: Json
          shipping_cost: number
          shipping_method: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          whatsapp_sent_at: string | null
        }
        Insert: {
          created_at?: string
          customer_cpf?: string
          customer_email: string
          customer_name: string
          customer_phone?: string
          id?: string
          items?: Json
          numero_pedido: string
          shipping_address?: Json
          shipping_cost?: number
          shipping_method?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          whatsapp_sent_at?: string | null
        }
        Update: {
          created_at?: string
          customer_cpf?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          items?: Json
          numero_pedido?: string
          shipping_address?: Json
          shipping_cost?: number
          shipping_method?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          whatsapp_sent_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          altura_cm: number
          ativo: boolean
          category_id: string
          comprimento_cm: number
          created_at: string
          descricao_completa: string
          descricao_curta: string
          destaque: boolean
          especificacoes: Json
          estoque: number
          id: string
          imagens: Json
          largura_cm: number
          nome: string
          peso_kg: number
          preco: number
          preco_promocional: number | null
          sku: string
          slug: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          altura_cm?: number
          ativo?: boolean
          category_id: string
          comprimento_cm?: number
          created_at?: string
          descricao_completa?: string
          descricao_curta?: string
          destaque?: boolean
          especificacoes?: Json
          estoque?: number
          id?: string
          imagens?: Json
          largura_cm?: number
          nome: string
          peso_kg?: number
          preco?: number
          preco_promocional?: number | null
          sku?: string
          slug: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          altura_cm?: number
          ativo?: boolean
          category_id?: string
          comprimento_cm?: number
          created_at?: string
          descricao_completa?: string
          descricao_curta?: string
          destaque?: boolean
          especificacoes?: Json
          estoque?: number
          id?: string
          imagens?: Json
          largura_cm?: number
          nome?: string
          peso_kg?: number
          preco?: number
          preco_promocional?: number | null
          sku?: string
          slug?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
