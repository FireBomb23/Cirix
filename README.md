# Cirix

Portal de cibersegurança / conformidade NIS2.

Este repositório contém **dois projetos** que partilham a **mesma base de dados PostgreSQL** (`projeto_BD`):

| Pasta        | Cadeira                      | Stack                                   |
|--------------|------------------------------|-----------------------------------------|
| `BD/`        | (outra cadeira)              | Django + PostgreSQL                     |
| `src/`       | Aplicações para a Internet II | Node + Express + Sequelize (backend API) |
| `frontend/`  | Aplicações para a Internet II | React + Vite (interface gráfica)        |

As duas aplicações ligam-se ao **mesmo** servidor PostgreSQL, pelo que os dados são partilhados.

---

## Base de dados (partilhada) — pasta `database/`

A estrutura das tabelas está versionada no git em [database/schema.sql](database/schema.sql) — é a **fonte oficial** partilhada entre os dois projetos. Assim, qualquer pessoa que faça `clone` consegue recriar a base `projeto_BD` exatamente igual.

```bash
# 1) criar a base de dados (uma vez)
createdb -U postgres projeto_BD          # ou: CREATE DATABASE "projeto_BD"; no pgAdmin

# 2) aplicar o esquema
psql -U postgres -d projeto_BD -f database/schema.sql

# 3) (opcional) dados de exemplo
psql -U postgres -d projeto_BD -f database/seed.sql
```

> **Nota:** o git transfere ficheiros (código + `schema.sql`), **não** os dados que estão dentro do PostgreSQL. Para os dados serem "os mesmos", todos correm o `schema.sql` na sua própria instância (ou ligam-se a uma instância partilhada).

> **Porta:** confirma a porta do teu PostgreSQL no `src/.env` (`DB_PORT`). A instalação local desta máquina usa a **5143**; o valor por omissão do PostgreSQL é **5432**.

---

## Backend (Node + Express + Sequelize) — pasta `src/`

Padrão **MVC**: `models/` (Sequelize), `controllers/` (lógica CRUD), `routes/` (rotas Express).

Entidades com CRUD completo: **Utilizadores, Clientes, Incidentes, Tickets**.

### Rotas (por entidade, ex: `utilizadores`)

| Método | URI                              | Função no controlador   |
|--------|----------------------------------|-------------------------|
| GET    | `/utilizadores`                  | `utilizador_list`       |
| GET    | `/utilizadores/:id`              | `utilizador_detail`     |
| POST   | `/utilizadores/create`           | `utilizador_create`     |
| PUT    | `/utilizadores/update/:id`       | `utilizador_update`     |
| DELETE | `/utilizadores/delete/:id`       | `utilizador_delete`     |

(O mesmo padrão aplica-se a `/clientes`, `/incidentes` e `/tickets`.)

### Como correr

```bash
cd src
npm install
# copia .env.example para .env e preenche a password da BD
npm start          # http://localhost:3000
```

Verificar o esquema real das tabelas (com o PostgreSQL ligado):

```bash
npm run introspect
```

---

## Frontend (React + Vite) — pasta `frontend/`

Views: **listagem**, **inserção** e **edição** para cada entidade.
Consome a API do backend via `axios` (ver `src/api.js`).

### Como correr

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

> O backend (porta 3000) tem de estar a correr para o frontend obter dados.

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL com a base de dados `projeto_BD` (criada a partir de [database/schema.sql](database/schema.sql)).
