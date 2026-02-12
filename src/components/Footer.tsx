import { Link } from 'react-router-dom'
import { Diamond, Mail, Phone, MapPin, Instagram } from 'lucide-react'
import { useCompanyStore } from '@/stores/companyStore'
import './Footer.css'

export default function Footer() {
    const { settings } = useCompanyStore()

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <Diamond size={24} strokeWidth={2.5} />
                            <span>{settings?.nome_fantasia || 'Diamante Azul'}</span>
                        </Link>
                        <p className="footer-desc">
                            Materiais hidráulicos de alta qualidade para sua obra. Produtos selecionados com garantia e os melhores preços.
                        </p>
                        <div className="footer-socials">
                            {settings?.instagram && (
                                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {settings?.facebook && (
                                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Navegação</h4>
                        <ul>
                            <li><Link to="/">Início</Link></li>
                            <li><Link to="/produtos">Produtos</Link></li>
                            <li><Link to="/sobre">Sobre Nós</Link></li>
                            <li><Link to="/carrinho">Carrinho</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Institucional</h4>
                        <ul>
                            <li><Link to="/politica-privacidade">Política de Privacidade</Link></li>
                            <li><Link to="/politica-troca">Política de Troca</Link></li>
                            <li><Link to="/sobre">Sobre a Empresa</Link></li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h4>Contato</h4>
                        <ul>
                            {settings?.email && (
                                <li>
                                    <Mail size={16} />
                                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                                </li>
                            )}
                            {settings?.telefone && (
                                <li>
                                    <Phone size={16} />
                                    <a href={`tel:${settings.telefone}`}>{settings.telefone}</a>
                                </li>
                            )}
                            {settings?.cidade && settings?.estado && (
                                <li>
                                    <MapPin size={16} />
                                    <span>{settings.cidade}/{settings.estado}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} {settings?.nome_fantasia || 'Diamante Azul'}. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
