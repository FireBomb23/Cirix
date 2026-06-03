z# Tutorial — Montar a base de dados `projeto_BD` no pgAdmin

Este guia leva-te do zero até teres a base de dados a funcionar com o projeto
(backend Node em `src/` + frontend React em `frontend/`).

> **Ideia-chave:** o git só transfere **ficheiros** (código + `schema.sql`). A base
> de dados em si **não vem pelo git** — tens de a criar na tua máquina. Tu vais ter
> a **tua própria** `projeto_BD`, com a mesma estrutura que a da tua colega.

---

## Pré-requisitos

- **PostgreSQL 18** instalado (já tens) — está a correr na porta **5143**.
- **pgAdmin** instalado (vem com o PostgreSQL).
- O ficheiro [schema.sql](schema.sql) (já está nesta pasta `database/`) — cria as tabelas **e** os dados de exemplo.

> **Atalho (sem pgAdmin):** se preferires, podes saltar os passos 1 a 4 e correr
> `cd src && npm run setup-db` — esse comando cria a base `projeto_BD` e aplica o
> `schema.sql` automaticamente. Só precisas da password no `src/.env`.

---

## Passo 1 — Abrir o pgAdmin e ligar ao servidor

1. Abre o **pgAdmin** (menu Iniciar → "pgAdmin 4").
2. À esquerda, no painel **Browser**, expande **Servers** (clica na setinha).
3. Se aparecer um servidor (ex.: **PostgreSQL 18**), clica nele duas vezes.
   → Vai pedir a **password do utilizador `postgres`** (a que definiste ao instalar).

### Se NÃO aparecer nenhum servidor na lista
Cria a ligação manualmente:
1. Botão direito em **Servers → Register → Server…**
2. Separador **General** → **Name**: `Local` (qualquer nome).
3. Separador **Connection**:
   - **Host name/address**: `localhost`
   - **Port**: `5143`
   - **Username**: `postgres`
   - **Password**: a da instalação (marca *Save password* para não pedir sempre)
4. **Save**.

> ❓ **Não sabes a password do `postgres`?** Vê o **Anexo A** no fim deste ficheiro
> (como repor a password). Sem ela não consegues continuar.

---

## Passo 2 — Criar a base de dados `projeto_BD`

1. Já ligado ao servidor, botão direito em **Databases → Create → Database…**
2. No campo **Database**, escreve exatamente:
   ```
   projeto_BD
   ```
3. **Save**.

Agora aparece **projeto_BD** debaixo de *Databases*.

---

## Passo 3 — Criar as tabelas (correr o `schema.sql`)

1. **Clica uma vez** na base **projeto_BD** para a selecionar.
   ⚠️ Importante: tens de estar "dentro" da `projeto_BD`, senão crias as tabelas no sítio errado.
2. Menu de topo → **Tools → Query Tool**.
3. Na janela que abre, clica no ícone **Open File** (📂, perto do canto superior esquerdo).
4. Navega até à pasta do projeto e escolhe:
   ```
   ...\Universidade\PI3\Projeto\database\schema.sql
   ```
5. Carrega em **▶ (Execute)** ou na tecla **F5**.
6. Em baixo deve aparecer **"Query returned successfully"**.

### Confirmar
Expande **projeto_BD → Schemas → public → Tables**. Devem aparecer (entre outras):
`users`, `tickets`, `documents`, `service_requests`, `articles`, `services`,
`team_members`, `annual_services`, `contact_submissions`, `audit_log`.

(Se não aparecerem logo, botão direito em **Tables → Refresh**.)

> Os dados de exemplo já vão dentro do `schema.sql`, por isso não há passo separado de "seed".

---

## Passo 5 — Ligar o backend à base de dados

1. Abre o ficheiro [../src/.env](../src/.env) num editor.
2. Confirma/ajusta estes valores:
   ```
   DB_NAME=projeto_BD
   DB_USER=postgres
   DB_PASSWORD=<a tua password do postgres>
   DB_HOST=localhost
   DB_PORT=5143
   PORT=3000
   ```
3. Grava.

---

## Passo 6 — Arrancar a aplicação

Abre **dois** terminais na pasta do projeto.

**Terminal 1 — backend:**
```
cd src
npm install      # só na primeira vez
npm start
```
Deve aparecer: *"Ligacao a base de dados projeto_BD estabelecida com sucesso"* e
*"Servidor Express a correr em http://localhost:3000"*.

**Terminal 2 — frontend:**
```
cd frontend
npm install      # só na primeira vez
npm run dev
```
Abre o endereço que aparecer (normalmente **http://localhost:5173**) no browser.

Pronto! Já podes listar, criar, editar e eliminar **users, tickets, documents
e service_requests**.

---

## Anexo A — Repor a password do utilizador `postgres` (Windows)

Faz isto **só se não souberes a password**. Precisas de abrir os ficheiros como
**Administrador** (estão em `C:\Program Files\...`).

1. Abre o **Bloco de Notas como Administrador** (botão direito → *Executar como administrador*).
2. Abre o ficheiro:
   ```
   C:\Program Files\PostgreSQL\18\data\pg_hba.conf
   ```
3. Nas linhas que começam por `host` e `local` (no fim do ficheiro), troca o método
   de autenticação `scram-sha-256` por `trust`. Exemplo:
   ```
   host    all   all   127.0.0.1/32   trust
   host    all   all   ::1/128        trust
   local   all   all                  trust
   ```
4. Grava o ficheiro.
5. Reinicia o serviço do PostgreSQL. Abre o **PowerShell como Administrador** e corre:
   ```
   Restart-Service postgresql-x64-18
   ```
6. No pgAdmin liga-te ao servidor (agora **não pede password**) e abre o **Query Tool**.
   Define uma password nova:
   ```sql
   ALTER USER postgres PASSWORD 'aMinhaNovaPassword';
   ```
7. **Volta a pôr** o `pg_hba.conf` como estava (troca `trust` de novo por `scram-sha-256`)
   e grava. Isto é importante por segurança.
8. Reinicia outra vez o serviço:
   ```
   Restart-Service postgresql-x64-18
   ```
9. Agora usa `aMinhaNovaPassword` em todo o lado (pgAdmin e `src/.env`).

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| `password authentication failed` | Password errada | Confirma a password / Anexo A |
| `ECONNREFUSED ... :5432` | Porta errada | Usa a porta **5143** no `.env` e no pgAdmin |
| Tabelas não aparecem | Não estavas dentro de `projeto_BD` ao correr o SQL | Repete o Passo 3 selecionando a base certa |
| Frontend não mostra dados | Backend não está a correr | Arranca primeiro o `src` (Terminal 1) |
