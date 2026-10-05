// Acessando via https://local.regic.gov.br (fluxo do gov.br, atrás do
// Caddy), a página é servida por HTTPS — chamar http://localhost:8000
// direto seria "mixed content" e o navegador bloqueia (aparece como
// "NetworkError" genérico). Nesse caso a API é acessada pelo mesmo
// domínio, que o Caddy repassa pro backend (ver Caddyfile: @api).
export const API_URL =
  window.location.hostname === 'local.regic.gov.br'
    ? 'https://local.regic.gov.br'
    : 'http://localhost:8000'

export async function listarFeeds(token: string) {
  const response = await fetch(`${API_URL}/feeds`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Não foi possível carregar os feeds')
  }

  return response.json()
}

export async function criarFeed(token: string, titulo: string, corpo: string) {
  const response = await fetch(`${API_URL}/feeds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ titulo, corpo }),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível publicar o feed')
  }

  return response.json()
}

type CamposEdicaoFeed = {
  titulo?: string
  corpo?: string
}

export async function editarFeed(token: string, id: number, campos: CamposEdicaoFeed) {
  const response = await fetch(`${API_URL}/feeds/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(campos),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível editar o feed')
  }

  return response.json()
}

export async function excluirFeed(token: string, id: number) {
  const response = await fetch(`${API_URL}/feeds/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível excluir o feed')
  }

  return response.json()
}

export async function buscarWebinarios(token: string) {
  const response = await fetch(
    `${API_URL}/webinarios`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error('Não foi possível carregar os webinários')
  }

  return await response.json()
}

export async function listarMembros(token: string) {
  const response = await fetch(`${API_URL}/admin/membros`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Não foi possível carregar os membros')
  }

  return response.json()
}
export async function buscarMe(token: string) {
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados do usuário')
  }

  return response.json()
}

export async function cadastrarMembro(
  token: string,
  nome: string,
  email: string,
  cpf: string,
  instituicao: string
) {
  const response = await fetch(`${API_URL}/admin/membros`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nome, email, cpf, instituicao }),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível cadastrar o membro')
  }

  return response.json()
}

type CamposEdicaoMembro = {
  nome?: string
  email?: string
  cpf?: string
  instituicao?: string
  perfil?: 'MEMBRO' | 'ADMIN'
}

export async function editarMembro(
  token: string,
  id: number,
  campos: CamposEdicaoMembro
) {
  const response = await fetch(`${API_URL}/admin/membros/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(campos),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível editar o membro')
  }

  return response.json()
}

export async function excluirMembro(token: string, id: number) {
  const response = await fetch(`${API_URL}/admin/membros/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível excluir o membro')
  }

  return response.json()
}

export async function reenviarConvite(token: string, id: number) {
  const response = await fetch(`${API_URL}/admin/membros/${id}/reenviar-convite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível reenviar o convite')
  }

  return response.json()
}

type FiltrosAuditoria = {
  pagina?: number
  tamanhoPagina?: number
  evento?: string
  usuarioId?: number
}

export async function buscarAuditoria(token: string, filtros?: FiltrosAuditoria) {
  const params = new URLSearchParams()

  if (filtros?.pagina) params.set('pagina', String(filtros.pagina))
  if (filtros?.tamanhoPagina) params.set('tamanho_pagina', String(filtros.tamanhoPagina))
  if (filtros?.evento) params.set('evento', filtros.evento)
  if (filtros?.usuarioId) params.set('usuario_id', String(filtros.usuarioId))

  const response = await fetch(`${API_URL}/admin/auditoria?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível carregar a auditoria')
  }

  return response.json()
}