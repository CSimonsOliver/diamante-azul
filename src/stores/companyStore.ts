import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { CompanySettings } from '@/types'

interface CompanyStore {
    settings: CompanySettings | null
    loading: boolean
    error: string | null
    fetchSettings: () => Promise<void>
}

export const useCompanyStore = create<CompanyStore>()((set) => ({
    settings: null,
    loading: false,
    error: null,

    fetchSettings: async () => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .limit(1)
                .single()

            if (error) throw error
            set({ settings: data as unknown as CompanySettings, loading: false })
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Erro ao carregar configurações',
                loading: false,
            })
        }
    },
}))
