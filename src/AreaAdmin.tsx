import { useEffect, useState } from 'react'
import { listarMembros, cadastrarMembro } from './api'

type Membro = {
  id: number
  nome: string
  email: string
  instituicao: string
  perfil: string
  status: 'ATIVO' | 'PENDENTE' | 'DESATIVADO'
}

type AreaAdminProps = {
  token: string
}

function AreaAdmin({ token }: AreaAdminProps) {
  const [membros, setMembros] = useState<Membro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [mostrarForm, setMostrarForm] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState('')
  const [linkGerado, setLinkGerado] = useState('')

  async function carregarMembros() {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await listarMembros(token)
      setMembros(resposta.membros)
    } catch (error) {
      setErro('Não foi possível carregar os membros.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarMembros()
  }, [])

  async function handleCadastrar(event: React.FormEvent) {
    event.preventDefault()
    setErroForm('')
    setLinkGerado('')
    setEnviando(true)

    try {
      const resposta = await cadastrarMembro(token, nome, email, instituicao)
      setLinkGerado(resposta.link_ativacao)
      setNome('')
      setEmail('')
      setInstituicao('')
      await carregarMembros()
    } catch (error) {
      setErroForm(error instanceof Error ? error.message : 'Erro ao cadastrar membro.')
    } finally {
      setEnviando(false)
    }
  }

  function statusClasse(status: Membro['status']) {
    if (status === 'ATIVO') return 'status closed'
    if (status === 'PENDENTE') return 'status open'
    return 'status'
  }

  return (
    <section className="tickets-section">

      <div className="section-header">
        <div>
          <h2>Membros REGIC</h2>
          <p>
            Gerencie os membros cadastrados no portal.
          </p>
        </div>

        <button onClick={() => setMostrarForm((atual) => !atual)}>
          {mostrarForm ? 'Cancelar' : '+ Cadastrar membro'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleCadastrar} style={{ marginBottom: '1.5rem' }}>

          <label>Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Nome completo"
            required
          />

          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail institucional"
            required
          />

          <label>Instituição</label>
          <input
            type="text"
            value={instituicao}
            onChange={(event) => setInstituicao(event.target.value)}
            placeholder="Sigla da instituição"
            required
          />

          {erroForm && (
            <div className="error">
              {erroForm}
            </div>
          )}

          <button type="submit" disabled={enviando}>
            {enviando ? 'Cadastrando...' : 'Cadastrar membro'}
          </button>

          {linkGerado && (
            <div className="empty" style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
              Link de ativação (envio por e-mail ainda não implementado):
              <br />
              <strong>{linkGerado}</strong>
            </div>
          )}

        </form>
      )}

      {carregando && (
        <div className="empty">Carregando membros...</div>
      )}

      {erro && (
        <div className="error">{erro}</div>
      )}

      {!carregando && !erro && (
        <div className="ticket-list">

          {membros.length === 0 && (
            <div className="empty">
              Nenhum membro cadastrado.
            </div>
          )}

          {membros.map((membro) => (
            <div className="ticket" key={membro.id}>

              <div className="ticket-info">
                <strong>{membro.nome}</strong>
                <span>
                  {membro.email} — {membro.instituicao}
                </span>
              </div>

              <span className={statusClasse(membro.status)}>
                {membro.status}
              </span>

            </div>
          ))}

        </div>
      )}

    </section>
  )
}

export default AreaAdmin