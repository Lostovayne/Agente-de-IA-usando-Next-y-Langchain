# Agent with Next.js, AI y LangChain

## Propósito del Proyecto
Este proyecto es una aplicación web que integra inteligencia artificial mediante LangChain para crear agentes conversacionales inteligentes, construida con Next.js y Bun como runtime.

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
- `langchain` (v0.0.xx): Biblioteca principal para integrar modelos de lenguaje
- `@langchain/core` (v0.1.xx): Componentes centrales de LangChain
- `@langchain/groq` (v0.0.xx): Integración con modelos Groq
- `@langchain/langgraph` (v0.0.xx): Para construir grafos de agentes
- `@wxflows/sdk@beta` (v0.0.xx): SDK para integración con WxFlows


### Dependencias del Frontend
- `next` (v14.xx): Framework React para renderizado del lado del servidor.
- `react` (v18.xx) & `react-dom`: Bibliotecas base para la interfaz de usuario.
- `shadcn/ui`: Componentes UI modernos y accesibles.

### Backend y Base de Datos
- `convex` (v1.xx): Cliente para la base de datos en tiempo real.
- `clerk/nextjs` (v4.xx): Para autenticación y gestión de usuarios.

### Instalación Completa
```bash
bun add langchain @langchain/core @langchain/groq @langchain/langgraph wxflows openai next react react-dom @clerk/nextjs convex shadcn-ui
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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clave
CLERK_SECRET_KEY=tu_secreto
NEXT_PUBLIC_CONVEX_URL=tu_url_convex
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

## Flujos Principales
1. Autenticación con Clerk
2. Creación/unión a chats
3. Conversación con agentes AI
4. Persistencia en Convex

## Configuración Avanzada
Para personalizar el modelo de AI, edita `lib/langgraph.ts`. Puedes cambiar el proveedor (Anthropic, OpenAI, etc) y los parámetros del modelo.

## Despliegue
El proyecto está configurado para desplegar en Vercel con soporte para SSR. Simplemente conecta tu repositorio a Vercel y configura las variables de entorno necesarias.