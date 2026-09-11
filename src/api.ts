const API_URL = 'http://localhost:8000'

export async function login(email: string, senha: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  })

  if (response.status === 429) {
    throw new Error('Muitas tentativas de login. Aguarde um minuto e tente novamente.')
  }

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'E-mail ou senha inválidos')
  }

  return response.json()
}

// MFA: login() com senha certa não devolve mais o token direto — devolve
// {status:"mfa_necessario", desafio, expira_em, codigo_dev?}. O token só
// vem de verificarMfa.
export async function verificarMfa(desafio: string, codigo: string) {
  const response = await fetch(`${API_URL}/login/verificar-mfa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ desafio, codigo }),
  })

  if (response.status === 429) {
    throw new Error('Muitas tentativas. Aguarde um pouco e tente novamente.')
  }

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Código inválido')
  }

  return response.json()
}

export async function reenviarCodigoMfa(desafio: string) {
  const response = await fetch(`${API_URL}/login/reenviar-mfa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ desafio }),
  })

  if (response.status === 429) {
    throw new Error('Muitas tentativas de reenvio. Aguarde um pouco.')
  }

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível reenviar o código')
  }

  return response.json()
}


export async function buscarMeusTickets(token: string) {
  const response = await fetch('http://localhost:8000/meus-tickets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Não foi possível carregar os tickets')
  }

  const data = await response.json()

  return data
}

export async function buscarWebinarios(token: string) {
  const response = await fetch(
    'http://localhost:8000/webinarios',
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

export async function ativarConta(token: string, senha: string) {
  const response = await fetch(`${API_URL}/ativar/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ senha }),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível ativar a conta')
  }

  return response.json()
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
  instituicao: string
) {
  const response = await fetch(`${API_URL}/admin/membros`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nome, email, instituicao }),
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

export async function cancelarConvite(token: string, id: number) {
  const response = await fetch(`${API_URL}/admin/membros/${id}/cancelar-convite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível cancelar o convite')
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