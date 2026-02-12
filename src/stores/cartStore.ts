import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types'

interface CartStore {
    items: CartItem[]
    addItem: (product: Product, quantity?: number) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    getSubtotal: () => number
    getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product: Product, quantity = 1) => {
                set((state) => {
                    const existing = state.items.find((i) => i.product.id === product.id)
                    if (existing) {
                        const newQty = Math.min(existing.quantity + quantity, product.estoque)
                        return {
                            items: state.items.map((i) =>
                                i.product.id === product.id
                                    ? { ...i, quantity: newQty }
                                    : i
                            ),
                        }
                    }
                    return {
                        items: [...state.items, { product, quantity: Math.min(quantity, product.estoque) }],
                    }
                })
            },

            removeItem: (productId: string) => {
                set((state) => ({
                    items: state.items.filter((i) => i.product.id !== productId),
                }))
            },

            updateQuantity: (productId: string, quantity: number) => {
                set((state) => {
                    if (quantity <= 0) {
                        return { items: state.items.filter((i) => i.product.id !== productId) }
                    }
                    return {
                        items: state.items.map((i) =>
                            i.product.id === productId
                                ? { ...i, quantity: Math.min(quantity, i.product.estoque) }
                                : i
                        ),
                    }
                })
            },

            clearCart: () => set({ items: [] }),

            getSubtotal: () => {
                return get().items.reduce((sum, item) => {
                    const price = item.product.preco_promocional ?? item.product.preco
                    return sum + price * item.quantity
                }, 0)
            },

            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0)
            },
        }),
        {
            name: 'diamante-azul-cart',
        }
    )
)
