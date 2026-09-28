import { useEffect, useState } from 'react'
import {
  listarMembros,
  cadastrarMembro,
  editarMembro,
  excluirMembro,
  reenviarConvite,
} from './api'

type Membro = {
  id: number
  nome: string
  email: string
  cpf: string | null
  instituicao: string
  perfil: string
  status: 'ATIVO' | 'PENDENTE' | 'DESATIVADO' | 'EXCLUIDO'
}

type AreaAdminProps = {
  token: string
}

const estiloBotaoAcao: React.CSSProperties = {
  border: '1px solid #d9dee7',
  background: 'white',
  color: '#555',
  padding: '5px 10px',
  borderRadius: '7px',
  cursor: 'pointer',
  fontSize: '12px',
}

function AreaAdmin({ token }: AreaAdminProps) {
  const [membros, setMembros] = useState<Membro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [mostrarForm, setMostrarForm] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState('')
  const [mensagemCadastro, setMensagemCadastro] = useState('')
  const [linkGerado, setLinkGerado] = useState('')
  const [avisoCadastro, setAvisoCadastro] = useState('')

  // Ações por membro
  const [acaoId, setAcaoId] = useState<number | null>(null)
  const [erroAcao, setErroAcao] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editCpf, setEditCpf] = useState('')
  const [editInstituicao, setEditInstituicao] = useState('')
  const [editPerfil, setEditPerfil] = useState<'MEMBRO' | 'ADMIN'>('MEMBRO')
  const [reenvio, setReenvio] = useState<{
    id: number
    mensagem: string
    link: string | null
    expiraEm: string
    aviso: string | null
  } | null>(null)

  async function carregarMembros() {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await listarMembros(token)
      setMembros(resposta.membros)
    } catch {
      setErro('Não foi possível carregar os membros.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarMembros()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCadastrar(event: React.FormEvent) {
    event.preventDefault()
    setErroForm('')
    setMensagemCadastro('')
    setLinkGerado('')
    setAvisoCadastro('')
    setEnviando(true)

    try {
      const resposta = await cadastrarMembro(token, nome, email, cpf, instituicao)
      // Com envio de e-mail real (EMAIL_BACKEND=smtp) o backend não
      // devolve mais link_ativacao quando o envio deu certo — só em
      // modo console (dev) ou se o envio falhar (junto com "aviso").
      setMensagemCadastro(resposta.mensagem ?? '')
      setLinkGerado(resposta.link_ativacao ?? '')
      setAvisoCadastro(resposta.aviso ?? '')
      setNome('')
      setEmail('')
      setCpf('')
      setInstituicao('')
      await carregarMembros()
    } catch (error) {
      setErroForm(error instanceof Error ? error.message : 'Erro ao cadastrar membro.')
    } finally {
      setEnviando(false)
    }
  }

  function abrirEdicao(membro: Membro) {
    setErroAcao('')
    setReenvio(null)
    setEditandoId(membro.id)
    setEditNome(membro.nome)
    setEditEmail(membro.email)
    // Sempre vazio, nunca membro.cpf: a listagem só traz o CPF mascarado
    // (LGPD) — pré-preencher aqui mostraria o mascarado, e salvar sem
    // mexer mandaria a máscara pro backend como se fosse o CPF real.
    setEditCpf('')
    setEditInstituicao(membro.instituicao)
    setEditPerfil(membro.perfil === 'ADMIN' ? 'ADMIN' : 'MEMBRO')
  }

  async function salvarEdicao(membro: Membro) {
    const campos: {
      nome?: string
      email?: string
      cpf?: string
      instituicao?: string
      perfil?: 'MEMBRO' | 'ADMIN'
    } = {}
    if (editNome !== membro.nome) campos.nome = editNome
    if (editEmail !== membro.email) campos.email = editEmail
    if (editCpf !== '') campos.cpf = editCpf
    if (editInstituicao !== membro.instituicao) campos.instituicao = editInstituicao
    if (editPerfil !== membro.perfil) campos.perfil = editPerfil

    if (Object.keys(campos).length === 0) {
      setEditandoId(null)
      return
    }

    if (
      campos.perfil === 'ADMIN' &&
      !window.confirm(`Tornar ${membro.nome} administrador? A conta passará a ter acesso total à área administrativa.`)
    ) {
      return
    }

    setErroAcao('')
    setAcaoId(membro.id)
    try {
      await editarMembro(token, membro.id, campos)
      setEditandoId(null)
      await carregarMembros()
    } catch (error) {
      setErroAcao(error instanceof Error ? error.message : 'Erro ao editar membro.')
    } finally {
      setAcaoId(null)
    }
  }

  async function executarAcao(
    id: number,
    acao: () => Promise<unknown>,
    aoConcluir?: (resultado: unknown) => void
  ) {
    setErroAcao('')
    setReenvio(null)
    setAcaoId(id)
    try {
      const resultado = await acao()
      if (aoConcluir) aoConcluir(resultado)
      await carregarMembros()
    } catch (error) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível concluir a ação.')
    } finally {
      setAcaoId(null)
    }
  }

  function handleExcluir(membro: Membro) {
    if (!window.confirm(`Excluir o membro ${membro.nome}? A conta é desativada e não poderá mais acessar o portal.`)) {
      return
    }
    executarAcao(membro.id, () => excluirMembro(token, membro.id))
  }

  function handleReenviarConvite(membro: Membro) {
    executarAcao(
      membro.id,
      () => reenviarConvite(token, membro.id),
      (resultado) => {
        // Idem ao cadastro: link_ativacao só vem preenchido em modo
        // console (dev) ou se o envio de e-mail tiver falhado (aviso).
        const r = resultado as {
          mensagem: string
          link_ativacao?: string
          expira_em: string
          aviso?: string
        }
        setReenvio({
          id: membro.id,
          mensagem: r.mensagem,
          link: r.link_ativacao ?? null,
          expiraEm: r.expira_em,
          aviso: r.aviso ?? null,
        })
      }
    )
  }

  function statusClasse(status: Membro['status']) {
    if (status === 'ATIVO') return 'status closed'
    if (status === 'PENDENTE') return 'status open'
    return 'status'
  }

  function acoesDoMembro(membro: Membro) {
    if (membro.status === 'EXCLUIDO') return null

    const podeReenviar = membro.status === 'PENDENTE' || membro.status === 'DESATIVADO'
    const desabilitado = acaoId === membro.id

    return (
      <>
        {podeReenviar && (
          <button style={estiloBotaoAcao} disabled={desabilitado} onClick={() => handleReenviarConvite(membro)}>
            Reenviar convite
          </button>
        )}
        <button style={estiloBotaoAcao} disabled={desabilitado} onClick={() => abrirEdicao(membro)}>
          Editar
        </button>
        <button style={estiloBotaoAcao} disabled={desabilitado} onClick={() => handleExcluir(membro)}>
          Excluir
        </button>
      </>
    )
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

          <label>CPF</label>
          <input
            type="text"
            value={cpf}
            onChange={(event) => setCpf(event.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="Somente números — identidade usada no login via gov.br"
            inputMode="numeric"
            pattern="\d{11}"
            title="11 dígitos, sem pontuação"
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

          {mensagemCadastro && !linkGerado && !avisoCadastro && (
            <div className="empty" style={{ marginTop: '1rem' }}>
              {mensagemCadastro}
            </div>
          )}

          {avisoCadastro && (
            <div className="error" style={{ marginTop: '1rem' }}>
              {avisoCadastro}
            </div>
          )}

          {linkGerado && (
            <div className="empty" style={{ marginTop: '0.5rem', wordBreak: 'break-all' }}>
              Link de ativação{avisoCadastro ? '' : ' (envio por e-mail ainda não configurado)'}:
              <br />
              <strong>{linkGerado}</strong>
            </div>
          )}

        </form>
      )}

      {erroAcao && <div className="error">{erroAcao}</div>}

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
            <div key={membro.id}>

              <div className="ticket">

                <div className="ticket-info">
                  <strong>{membro.nome}</strong>
                  <span>
                    {membro.email} — {membro.instituicao} — {membro.perfil}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={statusClasse(membro.status)}>
                    {membro.status}
                  </span>
                  {acoesDoMembro(membro)}
                </div>

              </div>

              {editandoId === membro.id && (
                <div style={{ padding: '14px 5px', borderTop: '1px solid #edf0f4' }}>
                  <label>Nome</label>
                  <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} />

                  <label>E-mail</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />

                  <label>CPF (identidade do login via gov.br)</label>
                  <input
                    type="text"
                    value={editCpf}
                    onChange={(e) => setEditCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="Deixe em branco para não alterar"
                    inputMode="numeric"
                  />

                  <label>Instituição</label>
                  <input type="text" value={editInstituicao} onChange={(e) => setEditInstituicao(e.target.value)} />

                  <label>Perfil</label>
                  <select value={editPerfil} onChange={(e) => setEditPerfil(e.target.value as 'MEMBRO' | 'ADMIN')}>
                    <option value="MEMBRO">MEMBRO</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      style={estiloBotaoAcao}
                      disabled={acaoId === membro.id}
                      onClick={() => salvarEdicao(membro)}
                    >
                      {acaoId === membro.id ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button style={estiloBotaoAcao} onClick={() => setEditandoId(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {reenvio?.id === membro.id && (
                <div className="empty" style={{ borderTop: '1px solid #edf0f4', wordBreak: 'break-all', textAlign: 'left' }}>
                  {reenvio.mensagem}
                  {reenvio.aviso && (
                    <div className="error" style={{ marginTop: '8px' }}>
                      {reenvio.aviso}
                    </div>
                  )}
                  {reenvio.link && (
                    <>
                      <br />
                      <strong>{reenvio.link}</strong>
                      {' — expira em '}
                      {new Date(reenvio.expiraEm).toLocaleString('pt-BR')}
                    </>
                  )}
                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </section>
  )
}

export default AreaAdmin
