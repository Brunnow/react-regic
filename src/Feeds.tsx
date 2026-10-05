import { useEffect, useState } from 'react'
import { listarFeeds, criarFeed, editarFeed, excluirFeed } from './api'

type Feed = {
  id: number
  titulo: string
  corpo: string
  autor_id: number
  criado_em: string
  atualizado_em: string
}

type FeedsProps = {
  token: string
  perfil: string | null
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

function Feeds({ token, perfil }: FeedsProps) {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [mostrarForm, setMostrarForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editCorpo, setEditCorpo] = useState('')
  const [acaoId, setAcaoId] = useState<number | null>(null)

  async function carregarFeeds() {
    setCarregando(true)
    setErro('')
    try {
      const resposta = await listarFeeds(token)
      setFeeds(resposta.feeds)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar os feeds.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarFeeds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCriar(event: React.FormEvent) {
    event.preventDefault()
    setErroForm('')
    setEnviando(true)
    try {
      await criarFeed(token, titulo, corpo)
      setTitulo('')
      setCorpo('')
      setMostrarForm(false)
      await carregarFeeds()
    } catch (error) {
      setErroForm(error instanceof Error ? error.message : 'Erro ao publicar feed.')
    } finally {
      setEnviando(false)
    }
  }

  function abrirEdicao(feed: Feed) {
    setErro('')
    setEditandoId(feed.id)
    setEditTitulo(feed.titulo)
    setEditCorpo(feed.corpo)
  }

  async function salvarEdicao(feed: Feed) {
    const campos: { titulo?: string; corpo?: string } = {}
    if (editTitulo !== feed.titulo) campos.titulo = editTitulo
    if (editCorpo !== feed.corpo) campos.corpo = editCorpo

    if (Object.keys(campos).length === 0) {
      setEditandoId(null)
      return
    }

    setAcaoId(feed.id)
    try {
      await editarFeed(token, feed.id, campos)
      setEditandoId(null)
      await carregarFeeds()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível editar o feed.')
    } finally {
      setAcaoId(null)
    }
  }

  async function handleExcluir(feed: Feed) {
    if (!window.confirm(`Excluir o feed "${feed.titulo}"?`)) return
    setAcaoId(feed.id)
    try {
      await excluirFeed(token, feed.id)
      await carregarFeeds()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível excluir o feed.')
    } finally {
      setAcaoId(null)
    }
  }

  if (carregando) {
    return (
      <section className="feeds-section">
        <h2>Feeds</h2>
        <p>Carregando feeds...</p>
      </section>
    )
  }

  return (
    <section className="feeds-section">
      <div className="section-header">
        <div>
          <h2>Feeds</h2>
          <p>Instruções e avisos publicados pelo CTIR.</p>
        </div>

        {perfil === 'ADMIN' && (
          <button onClick={() => setMostrarForm((atual) => !atual)}>
            {mostrarForm ? 'Cancelar' : '+ Novo feed'}
          </button>
        )}
      </div>

      {erro && <div className="error">{erro}</div>}

      {mostrarForm && (
        <form onSubmit={handleCriar} style={{ marginBottom: '1.5rem' }}>
          <label>Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Título do aviso"
            required
          />

          <label>Conteúdo</label>
          <textarea
            value={corpo}
            onChange={(event) => setCorpo(event.target.value)}
            placeholder="Instruções de como consumir os feeds do CTIR..."
            rows={5}
            required
          />

          {erroForm && <div className="error">{erroForm}</div>}

          <button type="submit" disabled={enviando}>
            {enviando ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      )}

      <div className="feed-list">
        {feeds.length === 0 && <div className="empty">Nenhum feed publicado ainda.</div>}

        {feeds.map((feed) => (
          <div className="feed-item" key={feed.id}>
            {editandoId === feed.id ? (
              <div className="feed-edicao">
                <label>Título</label>
                <input
                  type="text"
                  value={editTitulo}
                  onChange={(event) => setEditTitulo(event.target.value)}
                />

                <label>Conteúdo</label>
                <textarea
                  value={editCorpo}
                  onChange={(event) => setEditCorpo(event.target.value)}
                  rows={5}
                />

                <div className="feed-acoes">
                  <button disabled={acaoId === feed.id} onClick={() => salvarEdicao(feed)}>
                    Salvar
                  </button>
                  <button onClick={() => setEditandoId(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="feed-item-header">
                  <h3>{feed.titulo}</h3>
                  <span className="feed-data">{formatarData(feed.criado_em)}</span>
                </div>

                <p className="feed-corpo">{feed.corpo}</p>

                {perfil === 'ADMIN' && (
                  <div className="feed-acoes">
                    <button disabled={acaoId === feed.id} onClick={() => abrirEdicao(feed)}>
                      Editar
                    </button>
                    <button disabled={acaoId === feed.id} onClick={() => handleExcluir(feed)}>
                      Excluir
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Feeds
