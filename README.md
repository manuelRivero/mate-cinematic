# Mate Imperial — Cinematic

La aplicación Next.js vive en **`mate-cinematic/`**.

## Deploy en Vercel (importante)

Si ves `404: NOT_FOUND`, Vercel está construyendo la **raíz del repo** (vacía) en lugar de la app.

### Fix (1 minuto)

1. Entrá a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings → General → Root Directory**
3. Seteá: `mate-cinematic`
4. Guardá y hacé **Redeploy** del último deployment (o un nuevo push)

Sin ese Root Directory, no hay `package.json` ni rutas Next.js en la raíz → 404.
