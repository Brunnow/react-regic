import { useState } from 'react'
import { verificarMfa, reenviarCodigoMfa } from './api'

type RespostaMfa = {
  desafio: string
  expira_em: string
  codigo_dev?: string
}

type MfaProps = {
  desafio: string
  expiraEm: string
  codigoDev?: string
  onVerificado: (resposta: { token: string; tipo: string }) => void
  onVoltar: () => void
}

const estiloLink: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#1976d2',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '12px',
}

function Mfa({ desafio: desafioInicial, expiraEm: expiraEmInicial, codigoDev, onVerificado, onVoltar }: MfaProps) {
  const [desafio, setDesafio] = useState(desafioInicial)
  const [expiraEm, setExpiraEm] = useState(expiraEmInicial)
  const [codigo, setCodigo] = useState(codigoDev ?? '')
  const [preenchidoAutomaticamente, setPreenchidoAutomaticamente] = useState(Boolean(codigoDev))
  const [verificando, setVerificando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [erro, setErro] = useState('')
  const [avisoReenvio, setAvisoReenvio] = useState('')

  async function handleVerificar(event: React.FormEvent) {
    event.preventDefault()
    setErro('')
    setVerificando(true)

    try {
      const resposta = await verificarMfa(desafio, codigo)
      onVerificado(resposta)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível verificar o código.')
    } finally {
      setVerificando(false)
    }
  }

  async function handleReenviar() {
    setErro('')
    setAvisoReenvio('')
    setReenviando(true)

    try {
      const resposta: RespostaMfa = await reenviarCodigoMfa(desafio)
      setDesafio(resposta.desafio)
      setExpiraEm(resposta.expira_em)
      setCodigo(resposta.codigo_dev ?? '')
      setPreenchidoAutomaticamente(Boolean(resposta.codigo_dev))
      setAvisoReenvio('Enviamos um novo código para o seu e-mail. O anterior não vale mais.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível reenviar o código.')
    } finally {
      setReenviando(false)
    }
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
          <h1>Verificação em duas etapas</h1>
          <p>
            Enviamos um código de 6 dígitos para o seu e-mail. Ele expira às{' '}
            {new Date(expiraEm).toLocaleTimeString('pt-BR')}.
          </p>
        </div>

        <form onSubmit={handleVerificar}>

          <label>Código de verificação</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={codigo}
            onChange={(event) => {
              setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))
              setPreenchidoAutomaticamente(false)
            }}
            placeholder="000000"
            required
            autoFocus
          />

          {preenchidoAutomaticamente && (
            <div className="empty" style={{ marginBottom: '15px', textAlign: 'left' }}>
              Preenchido automaticamente — ambiente de teste (sem envio de e-mail real).
            </div>
          )}

          {erro && (
            <div className="error">
              {erro}
            </div>
          )}

          {avisoReenvio && !erro && (
            <div className="empty" style={{ marginBottom: '15px', textAlign: 'left' }}>
              {avisoReenvio}
            </div>
          )}

          <button type="submit" disabled={verificando || codigo.length !== 6}>
            {verificando ? 'Verificando...' : 'Verificar código'}
          </button>

        </form>

        <div className="login-footer">
          <button type="button" style={estiloLink} onClick={handleReenviar} disabled={reenviando}>
            {reenviando ? 'Reenviando...' : 'Reenviar código'}
          </button>
          {' · '}
          <button type="button" style={estiloLink} onClick={onVoltar}>
            Usar outra conta
          </button>
        </div>

      </div>
    </div>
  )
}

export default Mfa
