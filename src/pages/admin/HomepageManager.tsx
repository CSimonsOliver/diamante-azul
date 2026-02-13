import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/types/database'
import { ArrowLeft, Plus, Trash2, GripVertical, Eye, EyeOff, Save, ArrowUp, ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import './HomepageManager.css'

interface Banner {
  id: string
  tag: string | null
  title: string
  description: string | null
  image_url: string | null
  link_url: string
  button_text: string
  is_active: boolean
  sort_order: number
}

interface Section {
  id: string
  section_name: string
  title: string | null
  subtitle: string | null
  is_active: boolean
  sort_order: number
}

interface Product {
  id: string
  nome: string
  sku: string
  preco: number
  preco_promocional: number | null
  imagens: Json
  ativo: boolean
}

interface SectionProduct {
  id: string
  section_id: string
  product_id: string
  product: Product
  sort_order: number
  is_active: boolean
}

export default function HomepageManager() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [sectionProducts, setSectionProducts] = useState<Record<string, SectionProduct[]>>({})
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'banners' | 'sections' | 'products'>('banners')

  // Estados para modais
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [showProductSelector, setShowProductSelector] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    
    // Buscar banners
    const { data: bannersData } = await supabase
      .from('homepage_banners')
      .select('*')
      .order('sort_order')
    
    // Buscar seções
    const { data: sectionsData } = await supabase
      .from('homepage_config')
      .select('*')
      .order('sort_order')
    
    // Buscar todos os produtos ativos
    const { data: productsData } = await supabase
      .from('products')
      .select('id, nome, sku, preco, preco_promocional, imagens, ativo')
      .eq('ativo', true)
      .order('nome')
    
    if (bannersData) setBanners(bannersData)
    if (sectionsData) {
      setSections(sectionsData)
      // Buscar produtos de cada seção
      const productsBySection: Record<string, SectionProduct[]> = {}
      
      for (const section of sectionsData) {
        if (section.section_name !== 'banners' && section.section_name !== 'benefits' && section.section_name !== 'categories') {
          const { data: sectionProds } = await supabase
            .from('homepage_products')
            .select(`
              id,
              section_id,
              product_id,
              sort_order,
              is_active,
              product:products(id, nome, sku, preco, preco_promocional, imagens, ativo)
            `)
            .eq('section_id', section.id)
            .order('sort_order')
          
          if (sectionProds) {
            productsBySection[section.id] = sectionProds.map((sp: any) => ({
              ...sp,
              product: sp.product
            }))
          }
        }
      }
      
      setSectionProducts(productsBySection)
    }
    
    if (productsData) setAvailableProducts(productsData)
    setLoading(false)
  }

  // BANNERS
  async function saveBanner(banner: Partial<Banner>) {
    setSaving(true)
    
    if (banner.id) {
      // Atualizar
      const { error } = await supabase
        .from('homepage_banners')
        .update(banner)
        .eq('id', banner.id)
      
      if (error) {
        toast.error('Erro ao atualizar banner')
        console.error(error)
      } else {
        toast.success('Banner atualizado!')
        fetchData()
        setShowBannerModal(false)
        setEditingBanner(null)
      }
    } else {
      // Criar novo
      const { error } = await supabase
        .from('homepage_banners')
        .insert([{ 
          ...banner, 
          title: banner.title || '',
          sort_order: banners.length + 1 
        }])
      
      if (error) {
        toast.error('Erro ao criar banner')
        console.error(error)
      } else {
        toast.success('Banner criado!')
        fetchData()
        setShowBannerModal(false)
        setEditingBanner(null)
      }
    }
    
    setSaving(false)
  }

  async function deleteBanner(id: string) {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return
    
    const { error } = await supabase
      .from('homepage_banners')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('Erro ao excluir banner')
    } else {
      toast.success('Banner excluído!')
      fetchData()
    }
  }

  async function reorderBanners(bannerId: string, direction: 'up' | 'down') {
    const index = banners.findIndex(b => b.id === bannerId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= banners.length) return
    
    const updatedBanners = [...banners]
    const temp = updatedBanners[index].sort_order
    updatedBanners[index].sort_order = updatedBanners[newIndex].sort_order
    updatedBanners[newIndex].sort_order = temp
    
    // Atualizar no banco
    await supabase.from('homepage_banners').update({ sort_order: updatedBanners[index].sort_order }).eq('id', updatedBanners[index].id)
    await supabase.from('homepage_banners').update({ sort_order: updatedBanners[newIndex].sort_order }).eq('id', updatedBanners[newIndex].id)
    
    fetchData()
  }

  // SEÇÕES
  async function toggleSection(sectionId: string, isActive: boolean) {
    const { error } = await supabase
      .from('homepage_config')
      .update({ is_active: !isActive })
      .eq('id', sectionId)
    
    if (error) {
      toast.error('Erro ao atualizar seção')
    } else {
      toast.success(isActive ? 'Seção desativada' : 'Seção ativada')
      fetchData()
    }
  }

  async function updateSectionTitle(sectionId: string, title: string, subtitle: string) {
    const { error } = await supabase
      .from('homepage_config')
      .update({ title, subtitle })
      .eq('id', sectionId)
    
    if (error) {
      toast.error('Erro ao atualizar título')
    } else {
      toast.success('Título atualizado!')
      fetchData()
    }
  }

  // PRODUTOS DAS SEÇÕES
  async function addProductToSection(sectionId: string, productId: string) {
    const sectionProds = sectionProducts[sectionId] || []
    
    const { error } = await supabase
      .from('homepage_products')
      .insert([{
        section_id: sectionId,
        product_id: productId,
        sort_order: sectionProds.length + 1,
        is_active: true
      }])
    
    if (error) {
      toast.error('Erro ao adicionar produto')
      console.error(error)
    } else {
      toast.success('Produto adicionado!')
      fetchData()
    }
  }

  async function removeProductFromSection(sectionProductId: string) {
    const { error } = await supabase
      .from('homepage_products')
      .delete()
      .eq('id', sectionProductId)
    
    if (error) {
      toast.error('Erro ao remover produto')
    } else {
      toast.success('Produto removido!')
      fetchData()
    }
  }

  async function reorderSectionProducts(sectionId: string, productId: string, direction: 'up' | 'down') {
    const products = sectionProducts[sectionId] || []
    const index = products.findIndex(p => p.id === productId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= products.length) return
    
    const updatedProducts = [...products]
    const temp = updatedProducts[index].sort_order
    updatedProducts[index].sort_order = updatedProducts[newIndex].sort_order
    updatedProducts[newIndex].sort_order = temp
    
    await supabase.from('homepage_products').update({ sort_order: updatedProducts[index].sort_order }).eq('id', updatedProducts[index].id)
    await supabase.from('homepage_products').update({ sort_order: updatedProducts[newIndex].sort_order }).eq('id', updatedProducts[newIndex].id)
    
    fetchData()
  }

  const productSections = sections.filter(s => 
    s.section_name !== 'banners' && 
    s.section_name !== 'benefits' && 
    s.section_name !== 'categories'
  )

  return (
    <div className="homepage-manager">
      <div className="page-header">
        <div className="header-left">
          <Link to="/admin" className="btn-back">
            <ArrowLeft size={20} />
          </Link>
          <h1>Gerenciar HomePage</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={activeTab === 'banners' ? 'active' : ''}
          onClick={() => setActiveTab('banners')}
        >
          Banners
        </button>
        <button 
          className={activeTab === 'sections' ? 'active' : ''}
          onClick={() => setActiveTab('sections')}
        >
          Seções
        </button>
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Produtos por Seção
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          {/* TAB BANNERS */}
          {activeTab === 'banners' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Banners do Carrossel</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingBanner({
                      id: '',
                      tag: '',
                      title: '',
                      description: '',
                      image_url: '',
                      link_url: '/produtos',
                      button_text: 'Ver Mais',
                      is_active: true,
                      sort_order: 0
                    })
                    setShowBannerModal(true)
                  }}
                >
                  <Plus size={18} /> Novo Banner
                </button>
              </div>

              <div className="banners-list">
                {banners.map((banner, index) => (
                  <div key={banner.id} className={`banner-card ${!banner.is_active ? 'inactive' : ''}`}>
                    <div className="banner-image">
                      <img src={banner.image_url || '/placeholder-product.svg'} alt={banner.title} />
                      {!banner.is_active && <span className="badge-inactive">Inativo</span>}
                    </div>
                    <div className="banner-info">
                      <span className="banner-tag">{banner.tag}</span>
                      <h3>{banner.title}</h3>
                      <p>{banner.description}</p>
                      <div className="banner-meta">
                        <span>Link: {banner.link_url}</span>
                        <span>Botão: {banner.button_text}</span>
                      </div>
                    </div>
                    <div className="banner-actions">
                      <button onClick={() => reorderBanners(banner.id, 'up')} disabled={index === 0}>
                        <ArrowUp size={18} />
                      </button>
                      <button onClick={() => reorderBanners(banner.id, 'down')} disabled={index === banners.length - 1}>
                        <ArrowDown size={18} />
                      </button>
                      <button onClick={() => { setEditingBanner(banner); setShowBannerModal(true); }}>
                        Editar
                      </button>
                      <button className="btn-danger" onClick={() => deleteBanner(banner.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB SEÇÕES */}
          {activeTab === 'sections' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Configurar Seções</h2>
              </div>

              <div className="sections-list">
                {sections.map((section) => (
                  <div key={section.id} className={`section-config-card ${!section.is_active ? 'inactive' : ''}`}>
                    <div className="section-config-header">
                      <h3>{section.title}</h3>
                      <button 
                        className={`btn-toggle ${section.is_active ? 'active' : ''}`}
                        onClick={() => toggleSection(section.id, section.is_active)}
                      >
                        {section.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                    
                    <div className="section-config-fields">
                      <div className="form-group">
                        <label>Título da Seção</label>
                        <input 
                          type="text" 
                          value={section.title || ''}
                          onChange={(e) => {
                            const updated = sections.map(s => 
                              s.id === section.id ? { ...s, title: e.target.value } : s
                            )
                            setSections(updated)
                          }}
                          onBlur={(e) => updateSectionTitle(section.id, e.target.value, section.subtitle || '')}
                        />
                      </div>
                      <div className="form-group">
                        <label>Subtítulo</label>
                        <input 
                          type="text" 
                          value={section.subtitle || ''}
                          onChange={(e) => {
                            const updated = sections.map(s => 
                              s.id === section.id ? { ...s, subtitle: e.target.value } : s
                            )
                            setSections(updated)
                          }}
                          onBlur={(e) => updateSectionTitle(section.id, section.title || '', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB PRODUTOS */}
          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Produtos por Seção</h2>
              </div>

              <div className="products-sections">
                {productSections.map((section) => (
                  <div key={section.id} className="product-section-card">
                    <div className="product-section-header">
                      <h3>{section.title}</h3>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedSection(section.id)
                          setShowProductSelector(true)
                        }}
                      >
                        <Plus size={18} /> Adicionar Produto
                      </button>
                    </div>

                    <div className="section-products-list">
                      {(sectionProducts[section.id] || []).length === 0 ? (
                        <p className="no-products">Nenhum produto adicionado</p>
                      ) : (
                        (sectionProducts[section.id] || []).map((sp, index) => (
                          <div key={sp.id} className="section-product-item">
                            <div className="product-order">
                              <button 
                                onClick={() => reorderSectionProducts(section.id, sp.id, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp size={16} />
                              </button>
                              <span>{index + 1}</span>
                              <button 
                                onClick={() => reorderSectionProducts(section.id, sp.id, 'down')}
                                disabled={index === (sectionProducts[section.id] || []).length - 1}
                              >
                                <ArrowDown size={16} />
                              </button>
                            </div>
                            <img 
                              src={(Array.isArray(sp.product?.imagens) && (sp.product.imagens as any[])[0]?.url) || '/placeholder-product.svg'} 
                              alt={sp.product?.nome}
                            />
                            <div className="product-info">
                              <h4>{sp.product?.nome}</h4>
                              <span className="sku">{sp.product?.sku}</span>
                              <span className="price">
                                R$ {sp.product?.preco_promocional?.toFixed(2) || sp.product?.preco?.toFixed(2)}
                              </span>
                            </div>
                            <button 
                              className="btn-remove"
                              onClick={() => removeProductFromSection(sp.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL DE BANNER */}
      {showBannerModal && editingBanner && (
        <div className="modal-overlay" onClick={() => setShowBannerModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingBanner.id ? 'Editar Banner' : 'Novo Banner'}</h2>
            
            <div className="form-group">
              <label>Tag (ex: LANÇAMENTO, PROMOÇÃO)</label>
              <input 
                type="text" 
                value={editingBanner.tag || ''}
                onChange={(e) => setEditingBanner({...editingBanner, tag: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Título *</label>
              <input 
                type="text" 
                value={editingBanner.title || ''}
                onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea 
                value={editingBanner.description || ''}
                onChange={(e) => setEditingBanner({...editingBanner, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>URL da Imagem *</label>
              <input 
                type="text" 
                value={editingBanner.image_url || ''}
                onChange={(e) => setEditingBanner({...editingBanner, image_url: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Link do Botão</label>
              <input 
                type="text" 
                value={editingBanner.link_url}
                onChange={(e) => setEditingBanner({...editingBanner, link_url: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Texto do Botão</label>
              <input 
                type="text" 
                value={editingBanner.button_text}
                onChange={(e) => setEditingBanner({...editingBanner, button_text: e.target.value})}
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={editingBanner.is_active}
                  onChange={(e) => setEditingBanner({...editingBanner, is_active: e.target.checked})}
                />
                Banner Ativo
              </label>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowBannerModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => saveBanner(editingBanner)}
                disabled={saving || !editingBanner.title || !editingBanner.image_url}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SELEÇÃO DE PRODUTOS */}
      {showProductSelector && selectedSection && (
        <div className="modal-overlay" onClick={() => setShowProductSelector(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Adicionar Produto</h2>
            
            <div className="products-selector">
              {availableProducts
                .filter(p => !(sectionProducts[selectedSection] || []).some(sp => sp.product_id === p.id))
                .map((product) => (
                <div 
                  key={product.id} 
                  className="product-selector-item"
                  onClick={() => {
                    addProductToSection(selectedSection, product.id)
                    setShowProductSelector(false)
                  }}
                >
                  <img 
                    src={(Array.isArray(product.imagens) && (product.imagens as any[])[0]?.url) || '/placeholder-product.svg'} 
                    alt={product.nome}
                  />
                  <div className="product-selector-info">
                    <h4>{product.nome}</h4>
                    <span className="sku">{product.sku}</span>
                    <span className="price">
                      R$ {product.preco_promocional?.toFixed(2) || product.preco?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowProductSelector(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
