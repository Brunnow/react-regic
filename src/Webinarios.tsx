import { useEffect, useState } from 'react'
import { buscarWebinarios } from './api'

type Webinario = {
  id: number
  titulo: string
  descricao: string
  data: string
  duracao: string
  url: string
}

function Webinarios({ token }: { token: string }) {

  const [webinarios, setWebinarios] = useState<Webinario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {

    async function carregarWebinarios() {

      try {

        const resposta = await buscarWebinarios(token)

        setWebinarios(resposta.webinarios)

      } catch (error) {

        setErro('Não foi possível carregar os webinários')

      } finally {

        setCarregando(false)

      }

    }

    carregarWebinarios()

  }, [token])


  if (carregando) {
    return (
      <section className="webinarios">
        <h2>Webinários</h2>
        <p>Carregando webinários...</p>
      </section>
    )
  }


  if (erro) {
    return (
      <section className="webinarios">
        <h2>Webinários</h2>
        <p>{erro}</p>
      </section>
    )
  }


  return (
    <section className="webinarios">

      <div className="section-header">

        <div>
          <h2>Webinários</h2>

          <p>
            Conteúdos e capacitações disponíveis para membros da REGIC.
          </p>
        </div>

      </div>


      <div className="webinario-grid">

        {webinarios.map((webinario) => (

          <article
            className="webinario-card"
            key={webinario.id}
          >

            <div className="video-thumbnail">

              <div className="play-button">
                ▶
              </div>

            </div>


            <div className="webinario-content">

              <div className="webinario-meta">

                <span>
                  {webinario.data}
                </span>

                <span>
                  {webinario.duracao}
                </span>

              </div>


              <h3>
                {webinario.titulo}
              </h3>


              <p>
                {webinario.descricao}
              </p>


              <button className="assistir-button">
                Assistir webinário
              </button>

            </div>

          </article>

        ))}

      </div>

    </section>
  )
}

export default Webinarios