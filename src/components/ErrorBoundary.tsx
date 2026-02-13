import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
        this.setState({ error, errorInfo })
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '16px',
                            background: '#fee2e2',
                            borderRadius: '50%',
                            color: '#ef4444',
                            marginBottom: '24px'
                        }}>
                            <AlertTriangle size={48} />
                        </div>

                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                            Oops! Algo deu errado.
                        </h2>

                        <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                            Desculpe, encontramos um erro inesperado. Tente recarregar a página.
                        </p>

                        {this.state.error && (
                            <div style={{
                                background: '#f1f5f9',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                color: '#ef4444',
                                marginBottom: '24px',
                                overflowX: 'auto',
                                textAlign: 'left'
                            }}>
                                {this.state.error.toString()}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <RefreshCw size={18} />
                                Recarregar
                            </button>

                            <a
                                href="/"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: 'white',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Home size={18} />
                                Ir para Loja
                            </a>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
