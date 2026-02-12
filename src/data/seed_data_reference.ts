/* Creating a seed script to populate products from the reference screenshots */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase env vars")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CATEGORIES = [
    { nome: 'Cozinha', slug: 'cozinha', imagem: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=300' },
    { nome: 'Banheiro', slug: 'banheiro', imagem: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=300' },
    { nome: 'Duchas', slug: 'duchas', imagem: 'https://images.unsplash.com/photo-1517616238128-0683a48e8958?auto=format&fit=crop&q=80&w=300' },
    { nome: 'Acessórios', slug: 'acessorios', imagem: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=300' },
]

const PRODUCTS = [
    {
        nome: "Torneira Cascata Monocomando Calha Quadrada Baixa Misturador de Bancada Cali",
        slug: "torneira-cascata-monocomando-calha-quadrada-baixa-misturador-bancada-cali",
        preco: 249.90,
        preco_promocional: 149.90,
        cat_slug: 'banheiro',
        imagem: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=500",
        destaque: true
    },
    {
        nome: "Torneira Monocomando Gourmet 65cm Alta Rose Gold 3563",
        slug: "torneira-monocomando-gourmet-65cm-alta-rose-gold",
        preco: 799.90,
        preco_promocional: 759.91,
        cat_slug: 'cozinha',
        imagem: "https://images.unsplash.com/photo-1594498653385-d5175c532c38?auto=format&fit=crop&q=80&w=500",
        destaque: true
    },
    {
        nome: "Kit Acessórios de Banheiro Quadrado com 4 Peças Diamond",
        slug: "kit-acessorios-banheiro-quadrado-4-pecas-diamond",
        preco: 499.90,
        preco_promocional: 249.90,
        cat_slug: 'acessorios',
        imagem: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=500",
        destaque: false
    },
    {
        nome: "Ducha Higiênica Gatilho Alavanca Quadrada Rose Gold 7901",
        slug: "ducha-higienica-gatilho-alavanca-quadrada-rose-gold",
        preco: 299.90,
        preco_promocional: 165.90,
        cat_slug: 'banheiro',
        imagem: "https://images.unsplash.com/photo-1594498653385-d5175c532c38?auto=format&fit=crop&q=80&w=500", // using gold as rose placeholder
        destaque: true
    },
    {
        nome: "Torneira Lavatório Arizona Black Parede 2370",
        slug: "torneira-lavatorio-arizona-black-parede",
        preco: 350.00,
        preco_promocional: 269.90,
        cat_slug: 'banheiro',
        imagem: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=500",
        destaque: true
    },
    {
        nome: "Cuba de Inox 50x40 com Torneira Monocomando Gourmet Cromada 8037",
        slug: "cuba-inox-50x40-torneira-monocomando-gourmet",
        preco: 699.90,
        preco_promocional: 479.90,
        cat_slug: 'cozinha',
        imagem: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=500",
        destaque: true
    }
]

// Note: This file is just for reference/context to the agent.
// Real seeding would be done via a run_command executing a node script,
// but since we need the user's explicit env vars which I can't easily source in a node script from here 
// without installing dotenv, I'll create a browser-side seeder page temporarily.
