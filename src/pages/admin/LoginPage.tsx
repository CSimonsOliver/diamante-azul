import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Diamond, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import './LoginPage.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        
        if (!email || !password) {
            setError('Preencha todos os campos')
            return
        }

        setLoading(true)
        try {
            const { error } = await signIn(email, password)
            
            if (error) {
                setError('Usuário ou senha incorretos. Verifique e tente novamente.')
                toast.error('Usuário ou senha incorretos')
            } else {
                toast.success('Login realizado com sucesso!')
                navigate('/admin')
            }
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.')
            toast.error('Erro inesperado no login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card card">
                <div className="login-header">
                    <div className="login-logo">
                        <Diamond size={32} strokeWidth={2.5} />
                    </div>
                    <h1>Painel Administrativo</h1>
                    <p>Faça login para acessar o painel</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@diamanteazul.com"
                            autoComplete="email"
                            className={error ? 'input-error' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Senha</label>
                        <div className="login-password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha"
                                autoComplete="current-password"
                                className={error ? 'input-error' : ''}
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
