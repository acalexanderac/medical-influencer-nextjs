# Health Claims Analyzer 🔍

Una aplicación web moderna para analizar y verificar afirmaciones sobre salud hechas por influencers en redes sociales.

## 🌟 Características

- **Análisis de Influencers**: Evaluación automática de credibilidad y afirmaciones
- **Verificación de Claims**: Análisis detallado con evidencia científica
- **Trust Score**: Sistema de puntuación basado en precisión y credenciales
- **Base de Datos**: Almacenamiento y seguimiento de afirmaciones verificadas
- **Interfaz Moderna**: Diseño responsive y amigable con Tailwind CSS

## 🚀 Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Supabase
- **AI**: Google AI (Gemini Pro)
- **Autenticación**: Supabase Auth

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm o yarn
- Cuenta en Supabase
- API Key de Google AI (Gemini)

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/health-claims-analyzer.git
cd health-claims-analyzer
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Actualiza `.env.local` con tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_de_supabase
NEXT_PUBLIC_GOOGLE_AI_API_KEY=tu_api_key_de_google_ai
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales:

- `influencers`: Información básica de influencers
- `claims`: Afirmaciones y su análisis
- `influencer_stats`: Estadísticas y métricas

## 📊 Funcionalidades Principales

### Análisis de Influencers
- Búsqueda automática de perfiles
- Extracción de afirmaciones sobre salud
- Cálculo de Trust Score

### Verificación de Claims
- Análisis científico de afirmaciones
- Referencias a estudios y evidencia
- Categorización por tipo y confiabilidad

### Dashboard
- Visualización de estadísticas
- Filtrado por categorías
- Seguimiento de tendencias

## 🔒 Seguridad

- Autenticación segura con Supabase
- Políticas de Row Level Security (RLS)
- Validación de datos en frontend y backend

## 📈 Uso

1. Busca un influencer por nombre
2. Revisa su Trust Score y estadísticas
3. Explora sus afirmaciones sobre salud
4. Lee los análisis detallados
5. Verifica las fuentes y evidencia

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crea un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Equipo

- [Alexander AC](https://github.com/acalexanderac) - Software Engineer Enthusiast
  - TypeScript, JavaScript, PHP, Python, Go, Node.js
  - NestJS, Next.js, Angular, Express.js, React, Nuxt.js
  - MongoDB, MariaDB/SQL, PL-SQL, H2, Oracle DB

## 📧 Contacto

Para preguntas y soporte:
- Email: [acalexander774@gmail.com](mailto:acalexander774@gmail.com)
- LinkedIn: [in/calexanderac](https://linkedin.com/in/calexanderac)
- Discord: calexanderac
- Ubicación: Guatemala 🇬🇹

## 🛠️ Stack Tecnológico

### Frontend
- TailwindCSS
- Recharts
- Material UI
- Ant Design
- Shadow/UI

### Backend & DevOps
- Docker
- Kubernetes
- Git, GitHub, GitLab
- Jira, Zendesk
- Scrum Methodology
- Notion

### Idiomas
- Español (Nativo)
- Inglés (C1)
- Japonés (Aprendiendo)

---

Hecho con ❤️ por [Alexander AC](https://github.com/acalexanderac) para promover la información de salud basada en evidencia
