import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ativarConta } from './api'

function Ativacao() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleAtivar(event: React.FormEvent) {
    event.preventDefault()
    setErro('')

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (!token) {
      setErro('Token de ativação inválido.')
      return
    }

    setCarregando(true)

    try {
      await ativarConta(token, senha)
      setSucesso(true)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao ativar a conta.')
    } finally {
      setCarregando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">
            <div className="logo-icon">R</div>
            <div>
              <strong>REGIC</strong>
              <span>Portal de Atendimento</span>
            </div>
          </div>

          <div className="login-header">
            <h1>Conta ativada!</h1>
            <p>
              Sua conta foi ativada com sucesso. Você já pode fazer login.
            </p>
          </div>

          <button onClick={() => navigate('/')}>
            Ir para o login
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <div className="logo-icon">R</div>
          <div>
            <strong>REGIC</strong>
            <span>Portal de Atendimento</span>
          </div>
        </div>

        <div className="login-header">
          <h1>Ativar conta</h1>
          <p>
            Defina sua senha para ativar seu acesso ao portal REGIC.
          </p>
        </div>

        <form onSubmit={handleAtivar}>

          <label>Nova senha</label>
          <input
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Digite sua nova senha"
            required
          />

          <label>Confirmar senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(event) => setConfirmarSenha(event.target.value)}
            placeholder="Confirme sua nova senha"
            required
          />

          {erro && (
            <div className="error">
              {erro}
            </div>
          )}

          <button type="submit" disabled={carregando}>
            {carregando ? 'Ativando...' : 'Ativar conta'}
          </button>

        </form>

        <div className="login-footer">
          Ambiente de demonstração — REGIC
        </div>

      </div>
    </div>
  )
}

export default Ativacao