export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

export function formatCPF(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10) {
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
}

export function formatCEP(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    return digits.replace(/(\d{5})(\d)/, '$1-$2')
}

export function sanitizeCEP(value: string): string {
    return value.replace(/\D/g, '').slice(0, 8)
}

export function isValidCEP(cep: string): boolean {
    return /^\d{8}$/.test(cep.replace(/\D/g, ''))
}

export function isValidCPF(cpf: string): boolean {
    const digits = cpf.replace(/\D/g, '')
    if (digits.length !== 11) return false
    if (/^(\d)\1{10}$/.test(digits)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
    let rest = (sum * 10) % 11
    if (rest === 10) rest = 0
    if (rest !== parseInt(digits[9])) return false

    sum = 0
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
    rest = (sum * 10) % 11
    if (rest === 10) rest = 0
    if (rest !== parseInt(digits[10])) return false

    return true
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function slugify(text: string): string {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trimEnd() + '...'
}

export function getDiscountPercent(price: number, promoPrice: number): number {
    if (!promoPrice || promoPrice >= price) return 0
    return Math.round(((price - promoPrice) / price) * 100)
}

export function getProductImageUrl(url: string | null | undefined): string {
    if (!url) return '/placeholder-product.svg'
    return url
}

export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}
