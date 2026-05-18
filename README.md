# Gyminfinity

Plataforma web para Gyminfinity con sitio público, área privada de cliente y dashboard administrativo.

## Qué cambió

- Autenticación administrativa por sesión, sin claves en la URL.
- Área de cliente protegida con login usando correo y teléfono.
- Control real de membresía con vencimiento y renovación.
- Formularios con validación backend y protección CSRF.
- Gestión administrativa de productos, planes, rutinas, dietas, usuarios y pedidos.
- Interfaz reorganizada y CSS consolidado para una base más profesional.

## Requisitos

- Node.js 18 o superior.

## Instalación

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env`.
3. Ajusta al menos `ADMIN_USERNAME` y `ADMIN_PASSWORD`.
4. Inicia el proyecto con `npm start`.
5. Abre `http://localhost:3000`.

## Scripts

- `npm start`: inicia la aplicación.
- `npm run dev`: inicia el servidor en modo watch.
- `npm run check`: verifica sintaxis de los archivos JavaScript principales.

## Pruebas automatizadas

El proyecto usa Jest + Supertest para probar rutas de Express sin levantar manualmente el servidor.

Comandos de pruebas:

- `npm test`: ejecuta las pruebas automatizadas.
- `npm run test:watch`: ejecuta las pruebas en modo observacion mientras desarrollas.

Las pruebas actuales cubren:

- Carga de la pagina principal.
- Inicio de sesion administrativa con CSRF y sesion.
- Registro de cliente y generacion de factura con tarjeta de credito.

Los tests usan una base SQLite separada (`__tests__/gyminfinity.test.db`) que se crea y elimina durante la ejecucion, para no modificar `gyminfinity.db`.

## Variables de entorno

- `PORT`: puerto del servidor.
- `NODE_ENV`: usa `production` en despliegue.
- `DB_FILE`: ruta opcional de la base SQLite. Si no se define, usa `gyminfinity.db`.
- `ADMIN_USERNAME`: usuario del panel administrativo.
- `ADMIN_PASSWORD`: contraseña del panel administrativo.
- `ADMIN_PASSWORD_HASH`: alternativa opcional para definir la contraseña ya hasheada en hexadecimal.

## Base de datos y dinero recibido

La base de datos principal esta en el archivo `gyminfinity.db`, en la raiz del proyecto.

Para verla y modificar datos manualmente puedes usar una herramienta como DB Browser for SQLite y abrir:

`C:\Users\MI PC\gyminfinity-site\gyminfinity.db`

Tablas importantes:

- `users`: clientes, planes y vencimiento de membresia.
- `products`: productos y precios visibles.
- `orders`: pedidos, factura, metodo de pago, estado de pago, monto y destino del dinero.

En el panel administrativo, entra a `Facturacion` para ver:

- Dinero confirmado total.
- Dinero por tarjeta.
- Dinero en efectivo.
- Facturas pendientes.

El campo `payment_destination` indica a donde se registra el dinero:

- Tarjeta: cuenta bancaria Gyminfinity.
- Efectivo: caja general Gyminfinity.

Esta implementacion deja la trazabilidad interna. Para que el dinero llegue realmente a una cuenta bancaria externa hace falta conectar una pasarela de pagos real, como Stripe, Mercado Pago, Wompi o PayU.

## Estructura principal

- `server.js`: servidor Express, autenticación, sesiones, validación y rutas.
- `db.js`: inicialización y acceso a SQLite.
- `views/`: plantillas EJS públicas, cliente y administración.
- `public/css/style.css`: sistema visual consolidado.
- `public/js/main.js`: navegación, carrusel y tabs de interfaz.

## Nota de seguridad

En desarrollo, si no defines `ADMIN_PASSWORD`, la app usa una credencial temporal local y avisa por consola. En producción debes configurar credenciales por entorno antes de desplegar.
