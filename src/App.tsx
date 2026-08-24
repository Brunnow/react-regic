import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { login, buscarMeusTickets, buscarMe } from './api'
import Perfil from './Perfil'
import Webinarios from './Webinarios'
import Ativacao from './Ativacao'
import AreaAdmin from './AreaAdmin'


type Ticket = {
  id: number
  titulo: string
  status: string
}

function Portal() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [perfil, setPerfil] = useState<string | null>(null)

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [pagina, setPagina] = useState<
  'dashboard' | 'tickets' | 'webinarios' | 'perfil' | 'admin'
>(
  'dashboard'
)

  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function fazerLogin(event: React.FormEvent) {
    event.preventDefault()

    setErro('')
    setCarregando(true)

    try {
      const resposta = await login(email, senha)

      setToken(resposta.token)

      const dadosUsuario = await buscarMe(resposta.token)
      setPerfil(dadosUsuario.perfil)

     const meusTickets = await buscarMeusTickets(resposta.token)

setTickets(meusTickets.tickets)
    } catch (error) {
      setErro('Usuário ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  function sair() {
  setToken(null)
  setTickets([])
  setEmail('')
  setSenha('')
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
              Entre com suas credenciais para acessar seus atendimentos.
            </p>
          </div>

          <form onSubmit={fazerLogin}>

            <label>
            E-mail
            </label>

<input
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  placeholder="Digite seu e-mail"
  required
/>

            <label>
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              required
            />

            {erro && (
              <div className="error">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>

          </form>

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
        <Route path="/ativar/:token" element={<Ativacao />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App