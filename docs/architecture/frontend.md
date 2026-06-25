# Demo Dentamenta — Frontend

## Dominio

dentamenta.mentematica.com

## Páginas previstas

- Landing/demo como paciente.
- Chat demo Dentamenta.
- Pantalla final con acceso al panel demo.
- Panel demo del consultorio filtrado por sesión.

## Base reutilizable

El archivo `src/pages/admin/panel.astro` sirve como referencia visual y funcional.

Se pueden reutilizar ideas de:

- login visual;
- layout oscuro;
- tarjetas de métricas;
- tabla de mensajes;
- modal de detalle;
- descarga CSV;
- botón de reporte.

No debe copiarse la lógica actual de mensajes sin adaptarla a `session_id`.
