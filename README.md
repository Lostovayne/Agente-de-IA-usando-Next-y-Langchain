# Agent con Next.js, AI y LangChain

## Propósito del Proyecto

Este proyecto va más allá de un simple chat o Agente de IA. Busca expandir la lógica tradicional de los agentes de IA permitiendo al modelo utilizar cualquier fuente indexable de datos y herramientas personalizadas. Esto proporciona una flexibilidad de uso excepcional y una experiencia de usuario más natural e intuitiva.

## Tecnologías Clave

### Next.js

Framework React para aplicaciones web con renderizado del lado del servidor (SSR) y generación de sitios estáticos. Elegido por su excelente soporte para SSR, rutas API integradas y optimización de rendimiento.

### Bun

Runtime de JavaScript más rápido que Node.js, utilizado para la instalación de dependencias y ejecución del proyecto. Proporciona tiempos de instalación significativamente más rápidos y mejor rendimiento general.

### LangChain

Biblioteca especializada para construir aplicaciones con modelos de lenguaje. Permite crear agentes conversacionales avanzados con capacidades de memoria, razonamiento y uso de herramientas externas.

### Clerk

Sistema de autenticación y gestión de usuarios. Proporciona un sistema seguro de login/registro con soporte para múltiples proveedores de identidad y funciones de gestión de usuarios.

### Convex

Base de datos en tiempo real para almacenar chats y mensajes. Ofrece sincronización inmediata entre clientes, ideal para aplicaciones colaborativas y reactivas.

### WxFlows

Plataforma para integrar herramientas personalizadas y APIs externas. Permite extender las capacidades del agente de IA con acceso a servicios específicos.

## Dependencias Principales

### Dependencias de IA

- `langchain` (v0.3.20): Biblioteca principal para integrar modelos de lenguaje
- `@langchain/core` (v0.3.43): Componentes centrales de LangChain
- `@langchain/groq` (v0.2.1): Integración con modelos Groq
- `@langchain/langgraph` (v0.2.62): Para construir grafos de agentes
- `@wxflows/sdk` (v2.0.0): SDK para integración con WxFlows
- `@langchain/anthropic` (v0.3.16): Integración con modelos Anthropic

### Dependencias del Frontend

- `next` (v15.2.4): Framework React para renderizado del lado del servidor
- `react` (v19.1.0) & `react-dom` (v19.1.0): Bibliotecas base para la interfaz de usuario
- `lucide-react` (v0.475.0): Iconos modernos para la interfaz
- `tailwind-merge` (v3.1.0): Utilidades para Tailwind CSS
- `class-variance-authority` (v0.7.1): Para crear componentes con variantes
- `clsx` (v2.1.1): Utilidad para construir nombres de clase condicionales

### Backend y Base de Datos

- `convex` (v1.22.0): Cliente para la base de datos en tiempo real
- `@clerk/nextjs` (v6.13.0): Para autenticación y gestión de usuarios
- `@clerk/clerk-react` (v5.25.6): Componentes de autenticación para React

### Instalación Completa

```bash
bun add langchain@0.3.20 @langchain/core@0.3.43 @langchain/groq@0.2.1 @langchain/langgraph@0.2.62 @wxflows/sdk@2.0.0 @langchain/anthropic@0.3.16 next@15.2.4 react@19.1.0 react-dom@19.1.0 @clerk/nextjs@6.13.0 convex@1.22.0 lucide-react@0.475.0 tailwind-merge@3.1.0
```

## Variables de Entorno Requeridas

### Variables para Modelos de IA

```env
GROQ_API_KEY=tu_api_key_de_groq
GROQ_MODEL=modelo_groq_a_utilizar
WXFLOWS_ENDPOINT=url_del_endpoint_wxflows
WXFLOWS_APIKEY=tu_api_key_de_wxflows
```

### Variables para Autenticación y Base de Datos

```env
CONVEX_DEPLOYMENT=tu_deployment_id_de_convex
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clave_publica_de_clerk
NEXT_PUBLIC_CONVEX_URL=tu_url_de_convex
CLERK_SECRET_KEY=tu_clave_secreta_de_clerk
```

## Instalación Paso a Paso

1. **Instalar Bun** (si no lo tienes):

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

   Para Windows, sigue las instrucciones en [bun.sh](https://bun.sh)

2. **Clonar el repositorio**:

   ```bash
   git clone <url-del-repositorio>
   cd Agent-with-Next-Ai-Langchain
   ```

3. **Instalar dependencias**:

   ```bash
   bun install
   ```

4. **Configurar variables de entorno**:
   
   Crea un archivo `.env` en la raíz del proyecto con las variables mencionadas anteriormente.

5. **Iniciar servidor de desarrollo**:

   ```bash
   bun run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

- `app/`: Rutas principales de Next.js
  - `api/chat/`: Endpoints para el chat con AI
  - `dashboard/chat/`: Interfaz de chat
  - `layout.tsx`: Layout principal de la aplicación
  - `page.tsx`: Página principal

- `components/`: Componentes reutilizables
  - `chat-interface.tsx`: Interfaz principal del chat
  - `chatrow.tsx`: Componente para mostrar mensajes
  - `header.tsx`: Cabecera de la aplicación
  - `sidebar.tsx`: Barra lateral de navegación
  - `ui/`: Componentes UI con shadcn/ui

- `constants/`: Constantes utilizadas en la aplicación
  - `systemMessage.ts`: Mensaje del sistema para el modelo de IA

- `convex/`: Configuración de la base de datos
  - `chats.ts`: Operaciones con chats
  - `messages.ts`: Operaciones con mensajes
  - `schema.ts`: Esquema de la base de datos

- `lib/`: Utilidades compartidas
  - `langgraph.ts`: Configuración de LangChain y grafos de agentes
  - `convex.ts`: Configuración de Convex
  - `utils.ts`: Funciones de utilidad

- `wxflows/`: Configuración de herramientas personalizadas
  - `curl/`, `google_books/`, `wikipedia/`, etc.: Herramientas específicas
  - `wxflows.config.json`: Configuración de WxFlows

## Características Principales

### Herramientas Personalizadas

- **Integración con WxFlows**: SDK completo para conectar con múltiples servicios propios
- **Google Books API**: Búsqueda y consulta de libros
- **Wikipedia API**: Acceso a contenido de Wikipedia
- **Youtube Transcript**: Extracción de transcripciones de videos
- **Math Tools**: Herramientas matemáticas avanzadas
- **Curl**: Integración con APIs externas mediante peticiones HTTP

### Flujos Principales

1. **Autenticación con Clerk**: El usuario se registra o inicia sesión
2. **Creación/unión a chats**: El usuario puede crear nuevos chats o unirse a existentes
3. **Conversación con agentes AI**: Interacción con el modelo de lenguaje potenciado por herramientas
4. **Persistencia en Convex**: Los mensajes y chats se guardan en tiempo real
5. **Acceso a herramientas personalizadas**: El agente puede utilizar herramientas externas para responder consultas

## Cómo Agregar Nuevas Herramientas con WxFlows

Puedes extender las capacidades del agente agregando nuevas herramientas mediante WxFlows. Hay dos formas principales:

### 1. Importar herramientas existentes

Agrega la siguiente línea en cualquier parte del código o en un archivo de configuración:

```
<!-- wxflows import tool https://url-de-la-herramienta.zip -->
```

Ejemplo:

```
<!-- wxflows import tool https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/math.zip -->
```

### 2. Importar APIs mediante curl

Para integrar APIs externas:

```
<!-- wxflows import curl https://url-de-la-api -->
```

Ejemplo:

```
<!-- wxflows import curl https://introspection.apis.stepzen.com/customers -->
```

### 3. Crear herramientas personalizadas

Para crear una herramienta personalizada:

1. Crea un directorio en `wxflows/` con el nombre de tu herramienta
2. Agrega un archivo `index.graphql` con la definición de la herramienta
3. Implementa la lógica en el directorio `api/`
4. Actualiza `tools.graphql` para incluir tu nueva herramienta

## Configuración Avanzada

### Personalización del Modelo de IA

Para personalizar el modelo de IA, edita `lib/langgraph.ts`. Puedes cambiar:

- El proveedor del modelo (Groq, Anthropic, OpenAI, etc.)
- Los parámetros del modelo (temperatura, tokens máximos)
- El mensaje del sistema en `constants/systemMessage.ts`

### Configuración de WxFlows

Puedes modificar la configuración de WxFlows en `wxflows/wxflows.config.json`.

## Despliegue

El proyecto está configurado para desplegar en Vercel con soporte para SSR:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno necesarias en el panel de Vercel
3. Despliega la aplicación

También puedes desplegar en otros proveedores que soporten Next.js, como Netlify o AWS Amplify.

## Solución de Problemas Comunes

- **Error de conexión con WxFlows**: Verifica que las variables `WXFLOWS_ENDPOINT` y `WXFLOWS_APIKEY` estén correctamente configuradas
- **Problemas con el modelo de IA**: Asegúrate de que `GROQ_API_KEY` y `GROQ_MODEL` sean válidos
- **Errores de autenticación**: Verifica la configuración de Clerk y sus variables de entorno

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo [incluir licencia].