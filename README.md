# Revista Laboratorio

Blog/revista web con estilo minimalista oscuro. Stack: Next.js 14, Prisma, SQLite, Tailwind CSS.

---

## Cómo arrancar (desarrollo)

**Requisitos:** Node.js 18+ y npm

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos e inicializar con datos de ejemplo
npm run db:init

# 3. Arrancar el servidor de desarrollo
npm run dev
```

Abrir http://localhost:3000

**Admin inicial:**
- Email: `admin@revistalaboratorio.com.ar`
- Contraseña: `admin123`

⚠️ Cambiar la contraseña del admin desde el perfil antes de publicar.

---

## Variables de entorno

Copiar `.env.example` → `.env` y completar:

```env
JWT_SECRET=             # Clave secreta larga y aleatoria
SMTP_HOST=              # Servidor SMTP (ej: smtp.gmail.com)
SMTP_USER=              # Email de envío
SMTP_PASS=              # Contraseña de aplicación Gmail
```

Para Gmail: activar "Contraseñas de aplicación" en la cuenta de Google.

---

## Despliegue con Docker

```bash
# Copiar y configurar variables
cp .env.example .env
# Editar .env con tus valores reales

# Construir y levantar
docker compose up -d

# La app corre en http://localhost:3000
```

Para producción con nginx/caddy, proxy al puerto 3000.

---

## Estructura del proyecto

```
app/
  page.tsx                  # Home (3 secciones)
  blog/[slug]/              # Página de entrada
  todas-las-entradas/       # Archivo cronológico
  category/[slug]/          # Entradas por categoría
  search/                   # Buscador
  login/ register/          # Auth
  nueva-entrada/            # Editor (requiere login)
  editar/[slug]/            # Editar entrada propia
  profile/[username]/       # Perfil de autor
  admin/                    # Panel admin (solo ADMIN)
  api/                      # API routes

components/
  Header.tsx                # Navegación con dropdowns
  Footer.tsx
  FeaturedPost.tsx          # Entrada destacada grande
  HorizontalPostCard.tsx    # Card para "más leídas"
  PostCard.tsx              # Card de grilla
  MarkdownEditor.tsx        # Editor con preview en vivo
  MarkdownRenderer.tsx      # Renderizado con soporte YouTube
  SubscribeModal.tsx        # Modal de suscripción
  AuthProvider.tsx          # Contexto de autenticación
```

## Funcionalidades

- **Newsletter**: al publicar una entrada, se envía email automático a todos los suscriptores
- **Invitaciones**: el admin genera un link de invitación por email; solo con ese link se puede crear cuenta
- **YouTube**: pegar una URL de YouTube sola en una línea la convierte en video incrustado
- **Imágenes**: subida directa desde el editor (hasta 5MB)
- **Visitas**: contador automático por entrada
