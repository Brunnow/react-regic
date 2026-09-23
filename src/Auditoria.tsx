import { useEffect, useState } from 'react'
import { buscarAuditoria } from './api'

type EventoAuditoria = {
  id: number
  ocorrido_em: string
  evento: string
  usuario_id: number | null
  ator_id: number | null
  ip: string | null
  user_agent: string | null
  detalhe: string | null
}

type Props = {
  token: string
}

const TIPOS_EVENTO = [
  'LOGIN_OK',
  'LOGIN_FALHA',
  'LOGIN_BLOQUEIO_CONTA',
  'LOGIN_MFA_ENVIADO',
  'LOGIN_MFA_FALHA',
  'LOGIN_GOVBR_SUCESSO',
  'LOGIN_GOVBR_FALHA',
  'ATIVACAO',
  'ATIVACAO_VIA_GOVBR',
  'ADMIN_PRECADASTRO',
  'ADMIN_EDICAO_USUARIO',
  'ADMIN_EXCLUSAO_USUARIO',
  'ADMIN_CANCELAMENTO_CONVITE',
  'ADMIN_REENVIO_CONVITE',
]

function formatarData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

function formatarDetalhe(detalhe: string | null) {
  if (!detalhe) return '—'
  try {
    const obj = JSON.parse(detalhe)
    return Object.entries(obj)
      .map(([chave, valor]) => `${chave}: ${valor}`)
      .join(', ')
  } catch {
    return detalhe
  }
}

function corDoEvento(evento: string) {
  // Por padrão (substring), não por lista fixa: um evento novo que a API
  // venha a registrar (ex: outro tipo de falha de login) já cai na cor
  // certa sem precisar lembrar de atualizar isto aqui.
  if (evento === 'LOGIN_OK' || evento === 'LOGIN_GOVBR_SUCESSO') return 'evento-ok'
  if (evento.includes('FALHA') || evento.includes('BLOQUEIO')) return 'evento-falha'
  if (evento.startsWith('ATIVACAO')) return 'evento-ativacao'
  return 'evento-admin'
}

function Auditoria({ token }: Props) {
  const [eventos, setEventos] = useState<EventoAuditoria[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const tamanhoPagina = 15

  const [filtroEvento, setFiltroEvento] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, filtroEvento])

  async function carregar() {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await buscarAuditoria(token, {
        pagina,
        tamanhoPagina,
        evento: filtroEvento || undefined,
      })
      setEventos(resposta.eventos)
      setTotal(resposta.total)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar a auditoria.')
    } finally {
      setCarregando(false)
    }
  }

  function trocarFiltro(evento: string) {
    setFiltroEvento(evento)
    setPagina(1)
  }

  const totalPaginas = Math.max(1, Math.ceil(total / tamanhoPagina))

  return (
    <section className="auditoria-section">
      <div className="section-header">
        <div>
          <h2>Auditoria</h2>
          <p>Registro de eventos de segurança do portal</p>
        </div>
      </div>

      <div className="auditoria-filtros">
        <button
          className={filtroEvento === '' ? 'filtro-ativo' : ''}
          onClick={() => trocarFiltro('')}
        >
          Todos
        </button>

        {TIPOS_EVENTO.map((tipo) => (
          <button
            key={tipo}
            className={filtroEvento === tipo ? 'filtro-ativo' : ''}
            onClick={() => trocarFiltro(tipo)}
          >
            {tipo}
          </button>
        ))}
      </div>

      {erro && <div className="error">{erro}</div>}

      {carregando ? (
        <div className="empty">Carregando...</div>
      ) : eventos.length === 0 ? (
        <div className="empty">Nenhum evento encontrado.</div>
      ) : (
        <>
          <table className="auditoria-table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Evento</th>
                <th>Usuário ID</th>
                <th>Ator ID</th>
                <th>IP</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id}>
                  <td>{formatarData(evento.ocorrido_em)}</td>
                  <td>
                    <span className={`badge-evento ${corDoEvento(evento.evento)}`}>
                      {evento.evento}
                    </span>
                  </td>
                  <td>{evento.usuario_id ?? '—'}</td>
                  <td>{evento.ator_id ?? '—'}</td>
                  <td>{evento.ip ?? '—'}</td>
                  <td className="auditoria-detalhe">{formatarDetalhe(evento.detalhe)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="auditoria-paginacao">
            <button disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
              Anterior
            </button>
            <span>
              Página {pagina} de {totalPaginas} ({total} eventos)
            </span>
            <button disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>
              Próxima
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default Auditoria