import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { buscarMeusTickets, buscarMe } from './api'

const MENSAGENS_ERRO_GOVBR: Record<string, string> = {
  govbr_cancelado: 'Login com gov.br cancelado ou incompleto. Tente novamente.',
  govbr_state_invalido: 'Sessão de login com gov.br expirada ou inválida. Tente novamente.',
  govbr_indisponivel: 'O Login Único gov.br está indisponível no momento. Tente novamente em instantes.',
  govbr_sem_acesso: 'Seu CPF não tem pré-cadastro no REGIC. Contate um administrador.',
  muitas_tentativas: 'Muitas tentativas. Aguarde um minuto e tente novamente.',
}
import Perfil from './Perfil'
import Webinarios from './Webinarios'
import AreaAdmin from './AreaAdmin'
import Auditoria from './Auditoria'

type Ticket = {
  id: number
  titulo: string
  status: string
}

function Portal() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [perfil, setPerfil] = useState<string | null>(null)

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [pagina, setPagina] = useState<
  'dashboard' | 'tickets' | 'webinarios' | 'perfil' | 'admin' | 'auditoria'
>(
  'dashboard'
)

  const [erro, setErro] = useState('')

  // Retorno do login via gov.br: /auth/callback na API redireciona pra
  // cá com o token na fragment (#token=...) — nunca vai pra query
  // string nem pro servidor, só o JS local lê — ou com ?erro=... se a
  // pessoa não tem pré-cadastro / cancelou / a sessão expirou.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const tokenGovBr = hash.get('token')
    if (tokenGovBr) {
      window.history.replaceState(null, '', window.location.pathname)
      finalizarLoginComToken({ token: tokenGovBr })
      return
    }

    const query = new URLSearchParams(window.location.search)
    const erroGovBr = query.get('erro')
    if (erroGovBr) {
      window.history.replaceState(null, '', window.location.pathname)
      setErro(MENSAGENS_ERRO_GOVBR[erroGovBr] || 'Não foi possível concluir o login com gov.br.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function finalizarLoginComToken(resposta: { token: string }) {
    setErro('')
    setToken(resposta.token)

    try {
      const dadosUsuario = await buscarMe(resposta.token)
      setPerfil(dadosUsuario.perfil)
      // No login por senha o e-mail já vinha do formulário; no login via
      // gov.br esse campo nunca é preenchido pelo usuário, então soma
      // aqui direto do /me (fonte da verdade em qualquer um dos casos).
      setEmail(dadosUsuario.email)

      const meusTickets = await buscarMeusTickets(resposta.token)
      setTickets(meusTickets.tickets)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar seus dados.')
    }
  }

  function sair() {
  setToken(null)
  setTickets([])
  setEmail('')
  setPerfil(null)
  setPagina('dashboard')
}

  /*
   * LOGIN
   */
  if (!token) {
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
            <h1>Acesso ao Portal</h1>
            <p>
              Entre com sua conta gov.br para acessar seus atendimentos.
            </p>
          </div>

          {erro && (
            <div className="error">
              {erro}
            </div>
          )}

          {/* Fixo (não API_URL): o redirect_uri cadastrado no gov.br é
              https://local.regic.gov.br/auth/callback — o cookie de PKCE
              só volta se a ida também passar por esse mesmo domínio. */}
          <a className="btn-govbr" href="https://local.regic.gov.br/auth/login/govbr">
            Entrar com gov.br
          </a>

          <div className="login-footer">
            Ambiente de demonstração — REGIC
          </div>

        </div>

      </div>
    )
  }

  /*
   * DASHBOARD
   */

  const total = tickets.length

  const abertos = tickets.filter(
    (ticket) => ticket.status !== 'resolvido'
  ).length

  const resolvidos = tickets.filter(
    (ticket) => ticket.status === 'resolvido'
  ).length

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">R</div>

          <div>
            <strong>REGIC</strong>
            <span>Portal de Atendimento</span>
          </div>
        </div>

      <nav>

  <a
    className={pagina === 'dashboard' ? 'active' : ''}
    onClick={() => setPagina('dashboard')}
  >
    <span>⌂</span>
    Dashboard
  </a>

  <a
    className={pagina === 'tickets' ? 'active' : ''}
    onClick={() => setPagina('tickets')}
  >
    <span>▣</span>
    Meus Tickets
  </a>

  <a
    className={pagina === 'webinarios' ? 'active' : ''}
    onClick={() => setPagina('webinarios')}
  >
    <span>▶</span>
    Webinários
  </a>

  <a
    className={pagina === 'perfil' ? 'active' : ''}
    onClick={() => setPagina('perfil')}
  >
    <span>◉</span>
    Perfil
  </a>

  {perfil === 'ADMIN' && (
    <a
      className={pagina === 'admin' ? 'active' : ''}
      onClick={() => setPagina('admin')}
    >
      <span>⚙</span>
      Membros
    </a>
  )}

  {perfil === 'ADMIN' && (
    <a
      className={pagina === 'auditoria' ? 'active' : ''}
      onClick={() => setPagina('auditoria')}
    >
      <span>▤</span>
      Auditoria
    </a>
  )}

</nav>

        <div className="sidebar-footer">
          <span>CTIR Gov</span>
          <small>Ambiente de demonstração</small>
        </div>

      </aside>

      <main className="main">

        <header className="header">

  <div>
    <h1>Dashboard</h1>
    <p>
      Visão geral dos seus atendimentos
    </p>
  </div>

  <div className="user">

    <div className="avatar">
      {email.charAt(0).toUpperCase()}
    </div>

    <div>
      <strong>{email}</strong>
      <span>Membro REGIC</span>
    </div>

    <button
      className="logout"
      onClick={sair}
    >
      Sair
    </button>

  </div>

</header>

 {pagina === 'webinarios' ? (

  <Webinarios token={token} />

) : pagina === 'tickets' ? (

  <section className="tickets-section">

    <div className="section-header">
      <div>
        <h2>Meus Tickets</h2>
        <p>
          Tickets associados ao seu usuário
        </p>
      </div>
    </div>

    <div className="ticket-list">

      {tickets.length === 0 && (
        <div className="empty">
          Nenhum ticket encontrado.
        </div>
      )}

      {tickets.map((ticket) => (

        <div
          className="ticket"
          key={ticket.id}
        >

          <div className="ticket-info">
            <strong>#{ticket.id}</strong>

            <span>
              {ticket.titulo}
            </span>
          </div>

          <span
            className={
              ticket.status === 'resolvido'
                ? 'status closed'
                : 'status open'
            }
          >
            {ticket.status}
          </span>

        </div>

      ))}

    </div>

  </section>

) : pagina === 'admin' && perfil === 'ADMIN' ? (

  <AreaAdmin token={token} />

) : pagina === 'auditoria' && perfil === 'ADMIN' ? (

  <Auditoria token={token} />

) : pagina === 'perfil' ? (

  <Perfil email={email} />

) : (

  <section className="cards">

    <div className="card">

      <div className="card-icon blue">
        ▣
      </div>

      <div>
        <span>Total de tickets</span>
        <strong>{total}</strong>
      </div>

    </div>

    <div className="card">

      <div className="card-icon orange">
        ◷
      </div>

      <div>
        <span>Em andamento</span>
        <strong>{abertos}</strong>
      </div>

    </div>

    <div className="card">

      <div className="card-icon green">
        ✓
      </div>

      <div>
        <span>Resolvidos</span>
        <strong>{resolvidos}</strong>
      </div>

    </div>

  </section>

)}

      </main>

    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App