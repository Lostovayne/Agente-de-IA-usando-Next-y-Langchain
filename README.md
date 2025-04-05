# Agent with Next.js, AI y LangChain

## Propósito del Proyecto

Esto no es solamente un chat o un Agente de IA, es un proyecto que busca ir mas allá de la lógica de los agentes de IA. Permitiendo al modelo utilizar cualquier fuente indexable de datos y herramientas personalizadas. Dando una flexibilidad de uso y una experiencia de usuario más natural.

## Tecnologías Clave

### Next.js

Framework React para aplicaciones web con renderizado del lado del servidor y generación de sitios estáticos. Elegido por su excelente soporte para SSR y rutas API integradas.

### Bun

Runtime de JavaScript más rápido que Node.js, utilizado aquí para la instalación de dependencias y ejecución del proyecto. Proporciona tiempos de instalación más rápidos y mejor rendimiento.

### LangChain

Biblioteca para construir aplicaciones con modelos de lenguaje. Permite crear agentes conversacionales avanzados con memoria y razonamiento.

### Clerk

Autenticación y gestión de usuarios. Proporciona un sistema seguro de login/registro con soporte para múltiples proveedores.

### Convex

Base de datos en tiempo real para almacenar chats y mensajes. Ofrece sincronización inmediata entre clientes.

## Dependencias Principales

### Dependencias de IA

- `langchain` (v0.3.20): Biblioteca principal para integrar modelos de lenguaje
- `@langchain/core` (v0.3.43): Componentes centrales de LangChain
- `@langchain/groq` (v0.2.1): Integración con modelos Groq
- `@langchain/langgraph` (v0.2.62): Para construir grafos de agentes
- `@wxflows/sdk` (v2.0.0): SDK para integración con WxFlows
- `@langchain/anthropic` (v0.3.16): Integración con modelos Anthropic

### Dependencias del Frontend

- `next` (v15.2.4): Framework React para renderizado del lado del servidor.
- `react` (v19.1.0) & `react-dom` (v19.1.0): Bibliotecas base para la interfaz de usuario.
- `lucide-react` (v0.475.0): Iconos modernos
- `tailwind-merge` (v3.1.0): Utilidades para Tailwind CSS

### Backend y Base de Datos

- `convex` (v1.22.0): Cliente para la base de datos en tiempo real.
- `@clerk/nextjs` (v6.13.0): Para autenticación y gestión de usuarios.
- `@clerk/clerk-react` (v5.25.6): Componentes de autenticación

### Instalación Completa

```bash
bun add langchain@0.3.20 @langchain/core@0.3.43 @langchain/groq@0.2.1 @langchain/langgraph@0.2.62 @wxflows/sdk@2.0.0 @langchain/anthropic@0.3.16 next@15.2.4 react@19.1.0 react-dom@19.1.0 @clerk/nextjs@6.13.0 convex@1.22.0 lucide-react@0.475.0 tailwind-merge@3.1.0
```

### Variables de Entorno Requeridas

```env
GROQ_API_KEY=tu_api_key_de_groq
GROQ_MODEL=modelo_groq
WXFLOWS_ENDPOINT=url_del_endpoint
WXFLOWS_APIKEY=tu_api_key_de_wxflows
```

## Instalación

1. Instalar Bun (si no lo tienes):

```bash
curl -fsSL https://bun.sh/install | bash
```

2. Clonar el repositorio
3. Instalar dependencias:

```bash
bun install
```

4. Configurar variables de entorno:
   Crear un archivo `.env` con:

```
CONVEX_DEPLOYMENT=tu_deployment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clave
NEXT_PUBLIC_CONVEX_URL=tu_url_convex
CLERK_SECRET_KEY=tu_secreto
```

5. Iniciar servidor de desarrollo:

```bash
bun run dev
```

## Estructura del Proyecto

- `app/`: Rutas principales de Next.js
  - `api/chat/`: Endpoints para el chat con AI
  - `dashboard/chat/`: Interfaz de chat
- `components/`: Componentes reutilizables
  - `chat-interface.tsx`: Interfaz principal del chat
  - `ui/`: Componentes UI con shadcn/ui
- `convex/`: Configuración de la base de datos
  - `chats.ts`: Operaciones con chats
  - `messages.ts`: Operaciones con mensajes
- `lib/`: Utilidades compartidas
  - `langgraph.ts`: Configuración de LangChain

## Features Principales

### Herramientas Personalizadas

- **Integración con WxFlows**: SDK completo para conectar con múltiples servicios propios
- **Google Books API**: Búsqueda y consulta de libros
- **Wikipedia API**: Acceso a contenido de Wikipedia
- **Youtube Transcript**: Extracción de transcripciones de videos
- **Math Tools**: Herramientas matemáticas avanzadas

### Flujos Principales

1. Autenticación con Clerk
2. Creación/unión a chats
3. Conversación con agentes AI
4. Persistencia en Convex
5. Acceso a herramientas personalizadas

## Configuración Avanzada

Para personalizar el modelo de AI, edita `lib/langgraph.ts`. Puedes cambiar el proveedor (Anthropic, OpenAI, etc) y los parámetros del modelo.

## Despliegue

El proyecto está configurado para desplegar en Vercel con soporte para SSR. Simplemente conecta tu repositorio a Vercel y configura las variables de entorno necesarias.
