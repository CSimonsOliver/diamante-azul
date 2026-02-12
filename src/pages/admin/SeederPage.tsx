import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SeederPage() {
    const [status, setStatus] = useState('Idle')

    async function seed() {
        setStatus('Creating categories...')

        // Categories
        const cats = [
            { nome: 'Cozinha', slug: 'cozinha', imagem_url: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf' },
            { nome: 'Banheiro', slug: 'banheiro', imagem_url: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a' },
            { nome: 'Duchas', slug: 'duchas', imagem_url: 'https://images.unsplash.com/photo-1517616238128-0683a48e8958' },
            { nome: 'Acessórios', slug: 'acessorios', imagem_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101' },
            { nome: 'Kits', slug: 'kits', imagem_url: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a' },
        ]

        const catMap: Record<string, string> = {}

        for (const c of cats) {
            // Upsert category
            const { data, error } = await supabase.from('categories').upsert(c, { onConflict: 'slug' }).select().single()
            if (data) catMap[c.slug] = data.id
        }

        setStatus('Creating products...')

        const products = [
            {
                nome: "Torneira Cascata Monocomando Calha Quadrada",
                slug: "torneira-cascata-calha-quadrada",
                preco: 249.90,
                preco_promocional: 149.90,
                category_id: catMap['banheiro'],
                imagens: [{ url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600" }],
                destaque: true,
                estoque: 50
            },
            {
                nome: "Torneira Monocomando Gourmet 65cm Rose Gold",
                slug: "torneira-gourmet-rose-gold",
                preco: 799.90,
                preco_promocional: 759.91,
                category_id: catMap['cozinha'],
                imagens: [{ url: "https://images.unsplash.com/photo-1594498653385-d5175c532c38?auto=format&fit=crop&q=80&w=600" }],
                destaque: true,
                estoque: 10
            },
            {
                nome: "Kit Acessórios de Banheiro 4 Peças Black",
                slug: "kit-acessorios-black",
                preco: 499.90,
                preco_promocional: 249.90,
                category_id: catMap['acessorios'],
                imagens: [{ url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=600" }],
                destaque: false,
                estoque: 100
            },
            {
                nome: "Cuba Inox 50x40 + Torneira Gourmet",
                slug: "cuba-inox-torneira-gourmet",
                preco: 699.90,
                preco_promocional: 479.90,
                category_id: catMap['kits'],
                imagens: [{ url: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=600" }],
                destaque: true,
                estoque: 5
            },
            {
                nome: "Chuveiro Acqua Duo Ultra Black",
                slug: "chuveiro-acqua-duo-black",
                preco: 550.00,
                preco_promocional: 450.00,
                category_id: catMap['duchas'],
                imagens: [{ url: "https://images.unsplash.com/photo-1517616238128-0683a48e8958?auto=format&fit=crop&q=80&w=600" }],
                destaque: false,
                estoque: 20
            }
        ]

        for (const p of products) {
            await supabase.from('products').upsert(p, { onConflict: 'slug' })
        }

        setStatus('Done! Database seeded. Redirecting...')
        setTimeout(() => window.location.href = '/', 2000)
    }

    return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <h1>Seeder</h1>
            <p>{status}</p>
            <button onClick={seed} className="btn btn-primary">Start Seeding</button>
        </div>
    )
}
