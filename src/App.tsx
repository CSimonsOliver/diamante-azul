import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { useCompanyStore } from '@/stores/companyStore'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppFab from '@/components/WhatsAppFab'
import ScrollToTop from '@/components/ScrollToTop'
import AdminLayout from '@/components/admin/AdminLayout'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ExchangePolicyPage = lazy(() => import('@/pages/ExchangePolicyPage'))
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Admin pages
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'))
const ProductsAdminPage = lazy(() => import('@/pages/admin/ProductsAdminPage'))
const ProductForm = lazy(() => import('@/pages/admin/ProductForm'))
const OrdersPage = lazy(() => import('@/pages/admin/OrdersPage'))
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'))
const SeederPage = lazy(() => import('@/pages/admin/SeederPage'))
const HomepageManager = lazy(() => import('@/pages/admin/HomepageManager'))

function PageLoader() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
        </div>
    )
}

function ScrollRestoration() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

function PublicLayout() {
    const { fetchSettings } = useCompanyStore()
    useEffect(() => { fetchSettings() }, [])

    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)' }}>
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
            <WhatsAppFab />
            <ScrollToTop />
        </>
    )
}

export default function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <BrowserRouter>
                    <ScrollRestoration />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#333',
                                color: '#fff',
                                borderRadius: '8px',
                                fontSize: '14px',
                            },
                        }}
                    />
                    <Routes>
                        {/* Public Routes */}
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
                            <Route path="/produtos" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
                            <Route path="/produtos/:slug" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
                            <Route path="/categoria/:slug" element={<Suspense fallback={<PageLoader />}><CategoryPage /></Suspense>} />
                            <Route path="/carrinho" element={<Suspense fallback={<PageLoader />}><CartPage /></Suspense>} />
                            <Route path="/checkout" element={<Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>} />
                            <Route path="/sobre" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
                            <Route path="/politica-troca" element={<Suspense fallback={<PageLoader />}><ExchangePolicyPage /></Suspense>} />
                            <Route path="/politica-privacidade" element={<Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>} />
                            <Route path="/seed" element={<Suspense fallback={<PageLoader />}><SeederPage /></Suspense>} />
                            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
                        <Route path="/admin" element={
                            <ErrorBoundary>
                                <AdminLayout />
                            </ErrorBoundary>
                        }>
                            <Route index element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
                            <Route path="categorias" element={<Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense>} />
                            <Route path="produtos" element={<Suspense fallback={<PageLoader />}><ProductsAdminPage /></Suspense>} />
                            <Route path="produtos/novo" element={<Suspense fallback={<PageLoader />}><ProductForm /></Suspense>} />
                            <Route path="produtos/:id" element={<Suspense fallback={<PageLoader />}><ProductForm /></Suspense>} />
                            <Route path="pedidos" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
                            <Route path="configuracoes" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
                            <Route path="homepage" element={<Suspense fallback={<PageLoader />}><HomepageManager /></Suspense>} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </HelmetProvider>
    )
}
