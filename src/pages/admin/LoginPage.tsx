import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Diamond, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import './LoginPage.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error('Preencha todos os campos')
            return
        }

        setLoading(true)
        const { error } = await signIn(email, password)
        setLoading(false)

        if (error) {
            toast.error('Email ou senha incorretos')
        } else {
            toast.success('Login realizado com sucesso!')
            navigate('/admin')
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
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@diamanteazul.com"
                            autoComplete="email"
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
