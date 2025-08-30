# Fix Pack 0 for Next.js/TypeScript (Vercel) CRMsystem

Use these files to stabilize builds, add a health check, and make local checks easier.
If your project uses the **App Router** (folder `src/app`), use the files under `src/app/*`.
If your project uses **Pages Router** (`src/pages`), see the "Pages Router alternative" notes below.

## What's inside

- `.env.example` – template of environment variables your teammates/Vercel can follow.
- `next.config.js` – safe defaults to avoid build-time env crashes.
- `tsconfig.json` – strict TypeScript settings to catch bugs earlier.
- `src/app/api/health/route.ts` – healthcheck endpoint at `/api/health`.
- `src/app/page.tsx` – minimal homepage so deploys don't render blank.
- `patches/package.json.scripts.txt` – scripts to add to your package.json.
- `patches/next.config.js.diff.txt` – diff you can apply if you already have a next.config.js.

> If your repo already has any of these files, open them and **copy-paste** the relevant parts from this pack.

## Upload instructions (GitHub website only)

1) **Download** this zip to your computer.
2) Open your GitHub repo (e.g., SteveHuntsmanoptics/CRMsystem).
3) Click **Add file → Upload files**.
4) Drag & drop the following files into the root of the repo:
   - `.env.example`
   - `next.config.js`
   - `tsconfig.json`
5) For nested files, click **Add file → Create new file** and type the full path in the filename box:
   - `src/app/api/health/route.ts`
   - `src/app/page.tsx`
   GitHub will create folders automatically when you use `/` in the filename.
6) Click **Commit changes**.
7) Edit **package.json** in GitHub:
   - Click `package.json` → ✏️ (edit) → add/merge the scripts from `patches/package.json.scripts.txt`.
   - Save (Commit changes).
8) If you already had a `next.config.js`, open it and merge changes using `patches/next.config.js.diff.txt` as a guide instead of replacing.
9) If you deploy on **Vercel**, go to your Project → **Settings → Environment Variables** and add anything listed in `.env.example` (with real values). Then redeploy.

## Test it

- Visit `/api/health` on your deployed URL (e.g., `https://<your-app>.vercel.app/api/health`).
- You should see a JSON like: `{"ok": true, "service": "crm-system", "time": "..."}`.

## Pages Router alternative

If your project has `src/pages` (and **not** `src/app`):
- Create `src/pages/api/health.ts` with this content:

```ts
import type {{ NextApiRequest, NextApiResponse }} from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {{
  res.status(200).json({{ ok: true, service: 'crm-system', time: new Date().toISOString() }});
}}
```

- Create/replace `src/pages/index.tsx` with a simple component that links to `/api/health`:

```tsx
export default function Home() {{
  return (
    <main style={{{{ padding: 24 }}}}>
      <h1>{{process.env.NEXT_PUBLIC_APP_NAME || 'CRM System'}}</h1>
      <p>Welcome. API health: <a href="/api/health">/api/health</a></p>
    </main>
  );
}}
```

## Notes

- This pack won’t change your database or auth. It only makes the app more robust to deploy and debug.
- After this, feel free to ask for **Fix Pack 1** (auth/DB, roles, forms, CRUD, etc.).

_Last updated: 2025-08-10_- test PR plumbing
