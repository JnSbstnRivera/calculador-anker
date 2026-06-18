# ⚡ Cotizador Anker Pro

Cotizador web de productos **Anker** (baterías / respaldo de energía) para el equipo comercial de **Windmar Home PR**. Permite armar una cotización con carrito, aplicar pronto pago y generar un PDF profesional listo para enviar al cliente.

## ✨ Características

- **Catálogo de productos** con tarjetas y carrito de cotización.
- **Pronto pago** configurable (no se persiste entre sesiones: siempre arranca en 0).
- **Generación de PDF** de la cotización con `@react-pdf/renderer` y `pdf-lib`, dentro de un modal unificado (`PDFModal`).
- **Imágenes de producto en el PDF** mediante preload a base64 (esquiva problemas de CORS).
- Interfaz en **español**, con paleta y branding Anker (azul) sobre fondo navy.
- Animaciones con `motion` e iconografía `lucide-react`.

## 🛠️ Stack

- **Framework**: React 19 + Vite 6
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4 (plugin `@tailwindcss/vite`)
- **PDF**: `@react-pdf/renderer` + `pdf-lib`
- **UI/animación**: `lucide-react`, `motion`
- **Deploy**: Vercel (SPA con rewrites a `index.html`)

## 🚀 Setup local

```bash
npm install
npm run dev
```

La app corre en `http://localhost:3000`. No requiere variables de entorno para funcionar.

## 🔑 Variables de entorno

No se utilizan variables de entorno en tiempo de ejecución. El proyecto es una SPA estática.

## 📜 Scripts

- `npm run dev` — servidor de desarrollo (Vite, puerto 3000).
- `npm run build` — build de producción a `dist/`.
- `npm run preview` — sirve el build localmente.
- `npm run lint` — chequeo de tipos con `tsc --noEmit`.

## 🌐 Deploy

- **Vercel**, configurado en `vercel.json`: `installCommand: npm install`, `buildCommand: npm run build`, `outputDirectory: dist`, con rewrite SPA de `/(.*)` a `/index.html`.

## 🙌 Créditos
Proyecto creado originalmente por **DilanSba**. Transferido a **JnSbstnRivera** para su mantenimiento continuo (DilanSba ahora lidera otra área).

## 📄 Licencia

Propietario — Windmar Home PR. Uso interno.
