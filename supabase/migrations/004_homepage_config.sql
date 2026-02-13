-- Tabela para configurações da Homepage
CREATE TABLE IF NOT EXISTS homepage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para relacionar produtos às seções da homepage
CREATE TABLE IF NOT EXISTS homepage_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES homepage_config(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, product_id)
);

-- Tabela para banners do carrossel
CREATE TABLE IF NOT EXISTS homepage_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT DEFAULT '/produtos',
  button_text TEXT DEFAULT 'Ver Mais',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações padrão das seções
INSERT INTO homepage_config (section_name, title, subtitle, sort_order, is_active) VALUES
('banners', 'Banners', 'Carrossel de banners', 1, true),
('categories', 'Categorias', 'Escolha por categoria', 2, true),
('featured', 'Destaques', 'Produtos em destaque', 3, true),
('sale', 'Ofertas', 'Promoções especiais', 4, true),
('benefits', 'Benefícios', 'Nossas vantagens', 5, true),
('bestsellers', 'Mais Vendidos', 'Produtos populares', 6, true);

-- Inserir banners padrão
INSERT INTO homepage_banners (tag, title, description, image_url, link_url, button_text, sort_order, is_active) VALUES
('LANÇAMENTO 2026', 'Elegância e Sofisticação para sua Casa', 'Descubra nossa nova linha de torneiras gourmet e metais sanitários com design exclusivo e acabamento premium.', 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200', '/produtos', 'VER COLEÇÃO COMPLETA', 1, true),
('PROMOÇÃO ESPECIAL', 'Até 50% OFF em Torneiras Gourmet', 'Aproveite descontos incríveis em produtos selecionados. Oferta por tempo limitado!', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200', '/categoria/ofertas', 'VER OFERTAS', 2, true),
('COMPLETO', 'Kits Cuba + Torneira', 'Economize comprando o kit completo. Cuba de inox + torneira gourmet com preço especial.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200', '/categoria/kits', 'VER KITS', 3, true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_homepage_config_updated_at
    BEFORE UPDATE ON homepage_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_banners_updated_at
    BEFORE UPDATE ON homepage_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE homepage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read homepage_config" ON homepage_config
    FOR SELECT USING (true);

CREATE POLICY "Allow admin write homepage_config" ON homepage_config
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all read homepage_products" ON homepage_products
    FOR SELECT USING (true);

CREATE POLICY "Allow admin write homepage_products" ON homepage_products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all read homepage_banners" ON homepage_banners
    FOR SELECT USING (true);

CREATE POLICY "Allow admin write homepage_banners" ON homepage_banners
    FOR ALL USING (auth.role() = 'authenticated');
