import { MessageCircle } from 'lucide-react'
import { useCompanyStore } from '@/stores/companyStore'
import './WhatsAppFab.css'

export default function WhatsAppFab() {
    const { settings } = useCompanyStore()
    const whatsapp = settings?.whatsapp

    if (!whatsapp) return null

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Gostaria de mais informações.')}`

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-fab"
            aria-label="Fale conosco pelo WhatsApp"
        >
            <MessageCircle size={28} />
        </a>
    )
}
