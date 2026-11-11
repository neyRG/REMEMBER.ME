# Remember Me — React

Versión React del cuaderno digital Remember Me. Está construida con React, Vite,
React Router y Framer Motion.

## Desarrollo

Desde esta carpeta:

```powershell
npm install
npm run dev
```

Vite muestra la dirección local en la terminal.

## Comprobaciones

```powershell
npm run lint
npm run build
```

## Funciones

- Crear recuerdos con categoría, estado de ánimo, imagen y ubicación.
- Guardar notas, perfil y borradores en el almacenamiento local del navegador.
- Consultar, filtrar, renombrar y eliminar recuerdos en la colección.
- Transiciones entre páginas, entrada animada de tarjetas y respuesta visual de
  botones; las animaciones respetan la preferencia del sistema para reducir el
  movimiento.

El inicio de sesión y el registro son demostrativos y todavía no están
conectados a un servicio de cuentas. Los datos se guardan en este navegador y no
se sincronizan entre dispositivos.
