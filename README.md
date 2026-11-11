# Remember Me

Cuaderno digital para guardar recuerdos, ideas y notas. Proyecto creado por Ney bajo **LA MARMOTA NEGRA**. El repositorio incluye una versión estática y una versión React.

## Versiones

### Sitio estático

Abre `index.html` en un navegador moderno o sirve la carpeta raíz desde PowerShell:

```powershell
python -m http.server 8000
```

Visita `http://localhost:8000`.

Los estilos se mantienen en Sass bajo `sass/`. Para compilar la hoja que usan las páginas, instala Sass y ejecuta:

```powershell
sass .\sass\main.scss .\style\style.css
```

También puedes observar los cambios de Sass mientras desarrollas:

```powershell
sass --watch .\sass\main.scss:.\style\style.css
```

### Aplicación React

La aplicación React está en `react-app/` y usa React, Vite, React Router y Framer Motion. Desde PowerShell:

```powershell
Set-Location .\react-app
npm ci
npm run dev
```

Vite muestra la dirección local en la terminal. Consulta [`react-app/README.md`](./react-app/README.md) para los comandos de desarrollo y validación.

## Funciones

- Crear y editar recuerdos con título, detalle y categoría.
- Añadir una imagen o guardar la ubicación actual con permiso del navegador.
- Consultar, renombrar, eliminar y filtrar recuerdos.
- Guardar notas y borradores en el almacenamiento local del navegador.
- Editar el nombre, la foto de perfil y la información personal guardada en este navegador.

## Datos y permisos

Las notas y el perfil se guardan en el almacenamiento local del navegador; no se sincronizan entre dispositivos. Borrar los datos del sitio también elimina la información guardada. La ubicación requiere permiso del navegador y el enlace del mapa abre Google Maps.

Los formularios de inicio de sesión y registro son demostrativos: no están conectados a un servicio de cuentas. No se guardan contraseñas en el navegador.

## Verificación del sitio estático

El verificador revisa los enlaces locales de HTML y las imágenes referenciadas por CSS:

```powershell
python .\tools\check_site.py
```

## Estructura principal

- `index.html`: portada del sitio estático.
- `pages/`: escritorio, colección de recuerdos y perfil del sitio estático.
- `sass/` y `style/`: fuentes Sass y hojas CSS del sitio estático.
- `script/`: scripts del sitio estático.
- `assets/`: imágenes y otros recursos.
- `react-app/`: aplicación React, fuentes y configuración de Vite.
- `tools/check_site.py`: verificador de rutas locales.

© 2026 Remember Me. Creado por Ney bajo el proyecto **LA MARMOTA NEGRA**.