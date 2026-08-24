type PerfilProps = {
  email: string
}

function Perfil({ email }: PerfilProps) {
  return (
    <section className="perfil">

      <div className="section-header">
        <div>
          <h2>Meu Perfil</h2>
          <p>
            Informações da sua conta no portal REGIC.
          </p>
        </div>
      </div>

      <div className="perfil-card">

        <div className="perfil-top">

          <div className="perfil-avatar">
            {email.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{email}</h3>
            <span>Membro REGIC</span>
          </div>

        </div>

        <div className="perfil-divider"></div>

        <div className="perfil-info">

          <div className="perfil-item">
            <span>E-mail</span>
            <strong>{email}</strong>
          </div>

          <div className="perfil-item">
            <span>Instituição</span>
            <strong>MJSP</strong>
          </div>

          <div className="perfil-item">
            <span>Perfil de acesso</span>
            <strong>Membro REGIC</strong>
          </div>

        </div>

      </div>

    </section>
  )
}

export default Perfil