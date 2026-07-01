# Cyrix

Portal de cibersegurança / conformidade NIS2.

Este repositório contém **dois projetos** que partilham a **mesma base de dados PostgreSQL** (`projeto_BD`):

| Pasta        | Cadeira                       | Stack                                    |
|--------------|-------------------------------|------------------------------------------|
| `BD/`        | (outra cadeira)               | Django + PostgreSQL                      |
| `src/`       | Aplicações para a Internet II | Node + Express + Sequelize (backend API) |
| `frontend/`  | Aplicações para a Internet II | React + Vite (interface gráfica)         |

As duas aplicações ligam-se ao **mesmo** servidor PostgreSQL, pelo que os dados são partilhados.

---

## Base de dados (partilhada) — pasta `database/`

A estrutura está em [database/schema.sql](database/schema.sql) — a **fonte oficial**, com tabelas + dados de exemplo.

```bash
cd src
npm run setup-db      # cria a base e aplica o schema.sql (tabelas + seeds)
```

Em alternativa: `createdb -U postgres projeto_BD` e `psql -U postgres -d projeto_BD -f database/schema.sql`.

> **Porta:** confirma `DB_PORT` no `src/.env` (a instalação local pode usar **5143**; o valor por omissão é **5432**).

> As passwords são guardadas com **hash bcrypt**. Se já tens uma BD com passwords em texto simples, corre `npm run hash-passwords` (ou faz login, que converte automaticamente no 1.º acesso).

---

## Backend (Node + Express + Sequelize) — pasta `src/`

Padrão **MVC**: `models/` (Sequelize), `controllers/` (lógica), `routes/` (rotas Express),
`middlewares/` (autenticação JWT), `config/` (BD + JWT), `utils/` (auditoria).

### Entidades / recursos da API

| Recurso             | Notas                                                            |
|---------------------|-----------------------------------------------------------------|
| `/users`            | utilizadores; login, 2FA, "a minha conta" (`/users/me`)         |
| `/tickets`          | tickets de suporte + comentários (`/tickets/:id/comments`)      |
| `/documents`        | documentos (privados por cliente ou globais)                    |
| `/service-requests` | pedidos de serviço                                              |
| `/articles`         | notícias/blog (leitura pública)                                 |
| `/services`         | serviços + features (leitura pública)                           |
| `/team`             | equipa "Sobre Nós" (leitura pública)                            |
| `/annual-services`  | contratos/serviços anuais                                       |
| `/audit-log`        | registo de auditoria (só admin/gestor)                          |
| `/contact`          | formulário público (POST) + caixa de entrada (admin/gestor)     |
| `/conversations`    | chat direto entre quaisquer utilizadores + mensagens            |

Cada entidade segue o padrão CRUD: `GET /x`, `GET /x/:id`, `POST /x/create`, `PUT /x/update/:id`, `DELETE /x/delete/:id`.

### Autenticação e autorização

- **Login em 2 passos**: `POST /users/login` (email+password) → se tiver 2FA, `POST /users/verify-2fa` (palavra de segurança). Em sucesso devolve um **token JWT**.
- O frontend envia o token em `Authorization: Bearer <token>` (tratado em `frontend/src/api.js`).
- **Rotas protegidas** por `middlewares/middleware.js` (`checkToken`); ações sensíveis exigem perfil (`checkRole`). Leitura de notícias/serviços/equipa e submissão de contacto são públicas.
- **Passwords com bcrypt** (hash no model `User`).
- **Dados restritos**: um cliente só acede aos seus próprios tickets/documentos/pedidos/conversas (o servidor filtra pelo utilizador do token).

### Como correr

```bash
cd src
npm install          # instala express, sequelize, pg, bcrypt, jsonwebtoken...
# copia .env.example para .env e preenche password da BD + JWT_SECRET
npm start            # http://localhost:3000
```

### Utilizadores de demonstração

| Email                | Password     | Perfil  | Palavra 2FA (uma) |
|----------------------|--------------|---------|-------------------|
| admin@cyrix.pt       | `admin123`   | admin   | segurança         |
| manager@cyrix.pt     | `manager123` | manager | proteção          |
| cliente@empresa.pt   | `client123`  | client  | privacidade       |

---

## Frontend (React + Vite) — pasta `frontend/`

- **Páginas públicas**: Início, Sobre Nós, Serviços, Notícias, Contacto (consomem a API).
- **Área restrita** (após login): dashboard de **Admin/Gestor** e dashboard de **Cliente**.
- **Mensagens (chat)** entre utilizadores, **A Minha Conta** (mudar nome/password), gestão de tickets/pedidos/documentos, e páginas de **CRUD genérico** em `/crud/:entity`.

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

> O backend (porta 3000) tem de estar a correr. Em produção define `VITE_API_URL` a apontar para o backend publicado.

---

## Deploy (Neon + Render + Vercel)

Guia passo-a-passo em [DEPLOY.md](DEPLOY.md). Resumo: BD na **Neon**, backend no **Render** (`DATABASE_URL` + `JWT_SECRET`), frontend no **Vercel** (`VITE_API_URL`).

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL com a base `projeto_BD` (a partir de [database/schema.sql](database/schema.sql)).
