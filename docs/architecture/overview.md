# Demo Dentamenta — Arquitectura general

## Dominio

El demo comercial vive en:

dentamenta.mentematica.com

## Repo de trabajo

Este proyecto se trabaja en el repo `dentamenta`.

Mentemática sigue funcionando como marca principal y sitio comercial general, pero Dentamenta se mantiene como demo especializado para prospectos dentales.

## Objetivo del demo

El demo Dentamenta será una experiencia comercial para prospectos, especialmente dentistas o dueños de consultorios.

El usuario podrá:

1. Entrar como si fuera paciente.
2. Hablar con el chatbot de Dentamenta.
3. Simular una intención real: pedir precios, preguntar por limpieza, pedir cita, cancelar cita o consultar ubicación.
4. Ver cómo esa interacción aparece del lado del consultorio en un panel administrativo demo.
5. Entender cómo Dentamenta ayuda a capturar oportunidades y conversaciones.

## Principio principal

Todo mensaje del chatbot debe quedar asociado a un `session_id`.

Todo panel demo debe filtrar por `session_id`.

Nadie debe ver mensajes de otra sesión.

## Stack previsto

- Astro
- Tailwind CSS
- Netlify
- Supabase
- n8n
- Chatbot web Dentamenta

## Estado actual del repo

El repo tiene un prototipo visual de Dentamenta.

El componente `src/components/ChatWidget.astro` existe, pero actualmente funciona como widget visual/prototipo. No debe tratarse todavía como chatbot real.

## Referencias externas

El panel existente de Mentemática puede usarse como referencia visual y funcional, pero no debe copiarse completo sin adaptar.

Ideas reutilizables del panel anterior:

- layout oscuro;
- tarjetas de métricas;
- tabla de mensajes;
- modal de detalle;
- descarga CSV;
- estados vacíos;
- manejo visual de login o acceso.

No se debe copiar su lógica de autenticación/membresías tal cual para el demo Dentamenta.

## Regla para Codex

Codex no debe inventar:

- nombres de tablas;
- nombres de columnas;
- variables de ambiente;
- rutas críticas;
- webhooks;
- estructura de Supabase;
- lógica de tokens;
- nombres de archivos de arquitectura.

Cualquier cambio debe respetar estos documentos.
