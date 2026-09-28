# REGIC React — Contexto do projeto

## O que é
Frontend do portal REGIC. React + Vite + TypeScript. Será embutido via
iframe no Plone (produção). Consome a API em `regic-api-python` (repo
irmão, separado).

## Stack
- React + Vite + TypeScript
- `react-router-dom` (adicionado recentemente — rotas: `/` e `/ativar/:token`)
- CSS puro por classes, sem Tailwind nem lib de componentes
- `fetch` nativo, sem axios

## Estrutura de arquivos
- `src/api.ts` — TODAS as chamadas HTTP centralizadas aqui. Não criar
  `fetch` solto em componente — sempre passar por uma função nova neste
  arquivo, seguindo o padrão das existentes (`Authorization: Bearer`,
  tratamento de erro lendo `erro?.detail` da resposta)
- `src/App.tsx` — componente `Portal` (login + dashboard + navegação
  por estado, não por rota) e componente `App` (define as rotas)
- `src/Ativacao.tsx` — tela pública de ativação de conta
- `src/AreaAdmin.tsx` — listagem/cadastro de membros, só visível a ADMIN
- `src/Auditoria.tsx` — listagem de eventos de auditoria, só visível a ADMIN
- Menu lateral e páginas administrativas só renderizam se
  `perfil === 'ADMIN'` (vem de `GET /me` após login, guardado em estado)

## Convenções já estabelecidas — SEGUIR

1. **Toda função em `api.ts` que precisa de auth recebe `token: string`
   como parâmetro** e manda `Authorization: Bearer ${token}` no header —
   nunca guardar token em localStorage/cookie (hoje fica só em estado
   React, perdido no refresh — isso é intencional por ora, mudar exige
   decisão consciente sobre onde persistir com segurança)
2. **POST/PATCH sempre mandam `Content-Type: application/json` +
   `body: JSON.stringify(...)`** — nunca dados sensíveis (email, senha)
   por query string
3. **Tratamento de erro no `catch` sempre usa a mensagem real do erro**
   (`error instanceof Error ? error.message : 'mensagem genérica'`),
   nunca uma string fixa que mascara o motivo real (rate limit, conta
   inativa, etc. têm mensagens diferentes de "senha errada")
4. **`login()` trata `429` explicitamente** antes do `!response.ok`
   genérico, com mensagem específica de rate limit
5. Padrão visual dos componentes admin: `section-header` com `h2` +
   `p`, tabela ou lista, estado vazio com classe `.empty`, erro com
   classe `.error`

## O que ainda NÃO existe no frontend (backend já está pronto)
- Botões de editar/excluir/cancelar convite/reenviar convite na tela
  de `AreaAdmin.tsx` — os endpoints já existem no backend
  (`PATCH /admin/membros/{id}`, `DELETE /admin/membros/{id}`,
  `POST /admin/membros/{id}/cancelar-convite`,
  `POST /admin/membros/{id}/reenviar-convite}`), só falta consumir
- Tratamento de e-mail real (hoje o link de ativação/convite ainda é
  copiado manualmente pelo admin a partir da resposta da API)

## Como testar
Sem suíte automatizada ainda. `npm run dev`, testar manualmente no
navegador. Conferir no console de rede do navegador se as chamadas
saem como `POST` com body JSON (não query string) para rotas sensíveis.

## O que NÃO fazer
- Não adicionar Tailwind/lib de componentes sem que eu peça — o projeto
  usa CSS puro de propósito por enquanto
- Não guardar token em localStorage sem discutir antes — é decisão de
  segurança, não só de conveniência
- Não criar chamada HTTP fora de `api.ts`
