# Agent with Next.js, AI y Langchain

## Descripción del Proyecto
Este proyecto es un agente conversacional construido con Next.js que integra capacidades de IA utilizando Langchain y almacena los datos en Convex. Proporciona una interfaz de chat interactiva con autenticación gestionada por Clerk.

## Tecnologías Utilizadas
- **Next.js**: Framework de React para aplicaciones web
- **Convex**: Base de datos en tiempo real
- **Clerk**: Autenticación y gestión de usuarios
- **Langchain**: Framework para construir aplicaciones con modelos de lenguaje

## Instalación
1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (crear archivo .env):
   ```
   NEXT_PUBLIC_CONVEX_URL=tu_url_de_convex
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estructura de Archivos Clave
- `app/dashboard/chat`: Componentes principales del chat
- `convex`: Lógica de la base de datos
- `providers`: Proveedores de contexto (Convex, Clerk)
- `components`: Componentes reutilizables

## Ejemplos de Uso
1. Iniciar sesión con Clerk
2. Crear nuevos chats
3. Interactuar con el agente de IA
4. Ver historial de conversaciones

## Contribución
Pull requests son bienvenidos. Para cambios importantes, por favor abre un issue primero.

## Licencia
[MIT](https://choosealicense.com/licenses/mit/)