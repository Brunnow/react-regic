const API_URL = 'http://localhost:8000'

export async function login(email: string, senha: string) {
  const response = await fetch(
    `${API_URL}/login?email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`,
    {
      method: 'POST',
    }
  )

  if (!response.ok) {
    throw new Error('E-mail ou senha inválidos')
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

  console.log('RESPOSTA DOS TICKETS:', data)

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