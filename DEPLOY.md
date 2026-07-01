# Deploy do Cyrix (Neon + Render + Vercel)

Guia rápido para publicar o projeto online, no mesmo modelo dos materiais da cadeira
(base de dados na **Neon**, backend no **Render**, frontend no **Vercel**).

## 1. Base de dados — Neon (PostgreSQL na cloud)
1. Cria conta em https://neon.tech e um projeto novo (PostgreSQL).
2. Copia a **connection string** (algo como `postgresql://user:pass@host/db?sslmode=require`).
3. Aplica o esquema: liga-te à BD da Neon (pelo SQL Editor da Neon, ou `psql "<connection string>"`)
   e cola o conteúdo de [`database/schema.sql`](database/schema.sql).

## 2. Backend — Render
1. Cria um **Web Service** em https://render.com a partir do repositório (pasta `src/`).
   - Build Command: `npm install`
   - Start Command: `npm start`
2. Define as variáveis de ambiente (Environment):
   - `DATABASE_URL` = a connection string da Neon  **(ativa SSL automaticamente)**
   - `JWT_SECRET` = uma chave longa e aleatória
   - `JWT_EXPIRES_IN` = `2h`
   - `PORT` = `3000` (o Render define a sua, o código usa `process.env.PORT`)
3. (Alternativa ao `DATABASE_URL`) podes usar `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` + `DB_SSL=true`.
4. Anota o URL público do backend (ex.: `https://cyrix-api.onrender.com`).

## 3. Frontend — Vercel
1. Importa o repositório em https://vercel.com e escolhe a pasta `frontend/`.
   - Framework: Vite. Build Command: `npm run build`. Output: `dist`.
2. Define a variável de ambiente:
   - `VITE_API_URL` = o URL do backend no Render (ex.: `https://cyrix-api.onrender.com`)
3. Faz deploy. O frontend passa a falar com o backend publicado.

## Notas
- **CORS:** o backend já usa `cors()` aberto, por isso o Vercel consegue chamar o Render.
- **Local vs cloud:** localmente continua a usar `src/.env` (sem SSL); na cloud usa `DATABASE_URL`/`DB_SSL=true`.
- **Segredos:** nunca commitar `.env` (já está no `.gitignore`); define tudo nos painéis da Render/Vercel.
