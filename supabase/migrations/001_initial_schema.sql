-- ============================================================
-- Diamante Azul — Complete Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Company Settings
-- ============================================================
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL DEFAULT '',
  nome_fantasia TEXT NOT NULL DEFAULT 'Diamante Azul',
  cnpj TEXT NOT NULL DEFAULT '',
  ie TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  cep TEXT NOT NULL DEFAULT '',
  logradouro TEXT NOT NULL DEFAULT '',
  numero TEXT NOT NULL DEFAULT '',
  complemento TEXT NOT NULL DEFAULT '',
  bairro TEXT NOT NULL DEFAULT '',
  cidade TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  banner_url TEXT,
  cor_primaria TEXT NOT NULL DEFAULT '#2563EB',
  cor_secundaria TEXT NOT NULL DEFAULT '#1A2744',
  frete_gratis_acima NUMERIC(10,2) NOT NULL DEFAULT 299.00,
  politica_troca TEXT NOT NULL DEFAULT '',
  politica_privacidade TEXT NOT NULL DEFAULT '',
  sobre_nos TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed one row
INSERT INTO company_settings (razao_social, nome_fantasia, email, whatsapp)
VALUES ('Diamante Azul LTDA', 'Diamante Azul', 'contato@diamanteazul.com', '5562999999999')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL DEFAULT '',
  imagem_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. Products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao_curta TEXT NOT NULL DEFAULT '',
  descricao_completa TEXT NOT NULL DEFAULT '',
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_promocional NUMERIC(10,2),
  sku TEXT NOT NULL DEFAULT '',
  estoque INT NOT NULL DEFAULT 0,
  peso_kg NUMERIC(6,3) NOT NULL DEFAULT 0,
  altura_cm NUMERIC(6,1) NOT NULL DEFAULT 0,
  largura_cm NUMERIC(6,1) NOT NULL DEFAULT 0,
  comprimento_cm NUMERIC(6,1) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  destaque BOOLEAN NOT NULL DEFAULT FALSE,
  imagens JSONB NOT NULL DEFAULT '[]'::jsonb,
  especificacoes JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_ativo ON products(ativo);
CREATE INDEX idx_products_destaque ON products(destaque);

-- ============================================================
-- 4. Orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_method TEXT NOT NULL DEFAULT '',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aguardando_confirmacao',
  whatsapp_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_numero ON orders(numero_pedido);

-- ============================================================
-- 5. Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. Order number generation function
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq INT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(numero_pedido, '-', 3) AS INT)
  ), 0) + 1 INTO seq
  FROM orders
  WHERE numero_pedido LIKE 'DA-' || year_str || '-%';

  NEW.numero_pedido := 'DA-' || year_str || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.numero_pedido IS NULL OR NEW.numero_pedido = '')
  EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- 7. Row Level Security (RLS)
-- ============================================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront
CREATE POLICY "Public read company_settings"
  ON company_settings FOR SELECT
  USING (true);

CREATE POLICY "Public read active categories"
  ON categories FOR SELECT
  USING (ativo = true);

CREATE POLICY "Public read active products"
  ON products FOR SELECT
  USING (ativo = true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin manage company_settings"
  ON company_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin read all categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin read all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders: public insert (checkout), admin manage
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 8. Storage Buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true) ON CONFLICT DO NOTHING;

-- Storage policies: public read, authenticated upload
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Auth upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Auth update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos');
CREATE POLICY "Auth delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos');

CREATE POLICY "Public read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Auth upload banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Auth update banners" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'banners');
CREATE POLICY "Auth delete banners" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners');

CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth upload product-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Auth update product-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Auth delete product-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

CREATE POLICY "Public read category-images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "Auth upload category-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'category-images');
CREATE POLICY "Auth update category-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'category-images');
CREATE POLICY "Auth delete category-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'category-images');
