# Remember Me

Cuaderno digital para guardar recuerdos, ideas y notas. Proyecto creado por Ney bajo **LA MARMOTA NEGRA**.

## Cómo abrirlo

Abre `inicio.html` en un navegador moderno. También puedes servir la carpeta como sitio estático desde PowerShell:

```powershell
python -m http.server 8000
```

Después visita `http://localhost:8000`.

## Funciones

- Crear y editar notas con título, detalle y categoría.
- Añadir una imagen, que se reduce antes de guardarse, o guardar la ubicación actual con permiso del navegador.
- Consultar, renombrar y eliminar recuerdos desde la página de Recuerdos.
- Filtrar por fecha y categoría.
- Guardar notas y borradores en el almacenamiento local del navegador.

## Datos y permisos

Las notas se guardan en `localStorage` del navegador y no se sincronizan entre dispositivos. Borrar los datos del sitio en el navegador también elimina las notas guardadas. Las imágenes se almacenan como datos de imagen dentro de cada nota. La ubicación requiere permiso del navegador; el enlace del mapa abre Google Maps.

Los formularios de inicio de sesión y registro son demostrativos y todavía no están conectados a un servicio de cuentas.

## Archivos principales

- `inicio.html`, `inicio.css`, `inicio.js`: portada y acceso.
- `pages/escritorio/`: cuaderno y creación/edición de notas.
- `pages/recuerdos  recientes/`: colección, filtros y acciones de notas.
- `assets/img/`: imágenes del proyecto.

© 2026 Remember Me. Todos los derechos reservados. Creado por Ney bajo el proyecto **LA MARMOTA NEGRA**.

(todos y cada unos de los proyectos creados bajo LA MARMOTA NEGRA son propiedad de Eddier R. Batista Escalona quien firma como Ney , ya que estan sujetos a un periodo prueba y asu ves son generados con la hayuda de AIs y testiados por ella )