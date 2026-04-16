# Georgeo_Solar — deployment (Vercel + Supabase)

## 1. Supabase

1. Create a project at [https://supabase.com](https://supabase.com).
2. In **SQL Editor**, run the full script: `supabase/migrations/001_initial_schema.sql`.
3. In **Storage**, confirm buckets exist: `bills`, `roofs`, `projects` (the migration inserts them).
4. In **Authentication → URL configuration**, add:
   - **Site URL**: your Vercel production URL (e.g. `https://your-app.vercel.app`).
   - **Redirect URLs**: `https://your-app.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`.
5. Copy **Project URL**, **anon key**, and **service role key** from **Project Settings → API**.

### First admin user

After you sign up once (any method), promote your profile in SQL:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```

Find `YOUR_AUTH_USER_UUID` in **Authentication → Users**.

## 2. Vercel

1. Push the `georgeo-solar` folder to GitHub/GitLab/Bitbucket.
2. Import the repo in [Vercel](https://vercel.com) as a Next.js project (root = `georgeo-solar` if the repo contains only this app).
3. Set environment variables (Production + Preview):

| Name | Notes |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-only; never expose to client) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `N8N_WEBHOOK_URL` | Optional; POST JSON on new lead |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional; map picker + dashboard map |

4. Deploy. Update Supabase **Site URL** and **Redirect URLs** to match the production domain.

## 3. n8n automation

When `N8N_WEBHOOK_URL` is set, new leads trigger a `POST` with JSON:

`event`, `leadId`, `contactEmail`, `fullName`, `phone`, `temperature`, `score`, `createdAt`.

## 4. Local development

```bash
cd georgeo-solar
cp .env.example .env.local
# fill in Supabase keys
npm install
npm run dev
```

Open `http://localhost:3000`.
