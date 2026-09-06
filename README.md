# POS Contable Backend

Backend empresarial para un sistema **POS Contable** desarrollado con **Node.js, Express, TypeScript y MySQL**.

El sistema está orientado a la gestión integral de operaciones comerciales, incluyendo ventas, inventario, compras, clientes, proveedores, caja, impuestos y facturación electrónica.

El proyecto implementa una arquitectura **multiempresa (multi-tenant)** utilizando autenticación mediante **JWT**, autorización por roles y aislamiento de información entre empresas.

---

## 📋 Descripción

**POS Contable Backend** es una API REST diseñada para soportar un sistema de punto de venta y gestión contable empresarial.

El backend centraliza diferentes procesos de una empresa:

* Gestión de empresas.
* Gestión de usuarios.
* Roles y permisos.
* Productos.
* Categorías.
* Inventario.
* Clientes.
* Proveedores.
* Compras.
* Ventas.
* Métodos de pago.
* Caja.
* Movimientos de caja.
* Cierres de caja.
* Impuestos.
* Facturación electrónica.
* Documentos tributarios.
* Notas crédito.
* Notas débito.
* Integración con servicios relacionados con la DIAN.

La arquitectura está preparada para que diferentes empresas utilicen la misma aplicación manteniendo separada su información.

---

# 🚀 Características principales

* Autenticación mediante JWT.
* Autorización mediante roles.
* Arquitectura multiempresa (multi-tenant).
* Aislamiento de información por empresa.
* Gestión de usuarios.
* Gestión de empresas.
* Gestión de productos.
* Gestión de categorías.
* Gestión de clientes.
* Gestión de proveedores.
* Gestión de compras.
* Gestión de ventas.
* Métodos de pago.
* Apertura de caja.
* Movimientos de caja.
* Cierre de caja.
* Gestión de impuestos.
* Facturación electrónica.
* Gestión de documentos de facturación.
* Notas crédito.
* Notas débito.
* Generación de documentos PDF.
* Generación y consulta de XML.
* Eventos relacionados con facturación DIAN.
* API REST.
* Persistencia mediante MySQL.
* Integridad referencial mediante claves foráneas.
* Separación de responsabilidades entre rutas, controladores y servicios.

---

# 🏢 Arquitectura Multiempresa

El sistema utiliza una arquitectura **multi-tenant**, permitiendo administrar diferentes empresas dentro de una misma instancia del backend.

La entidad:

```text
empresas
```

funciona como uno de los elementos principales del modelo empresarial.

El contexto de empresa se utiliza junto con la autenticación JWT para determinar a qué información puede acceder cada usuario.

### Flujo simplificado

```text
Usuario
   │
   ▼
Login
   │
   ▼
JWT
   │
   ▼
Middleware de autenticación
   │
   ▼
Identificación del usuario
   │
   ▼
Identificación de empresa
   │
   ▼
Validación de permisos
   │
   ▼
Acceso a recursos de la empresa
```

Esto permite evitar que un usuario pueda acceder accidentalmente a información perteneciente a otra empresa.

Entre las entidades relacionadas con el contexto empresarial se encuentran:

* `empresas`
* `usuarios`
* `categorias`
* `compras`
* `ventas`
* `facturas`
* `configuracion_facturacion`

---

# 🔐 Seguridad

El backend incorpora diferentes mecanismos para proteger la información y controlar el acceso a los recursos.

### Autenticación

Se utiliza **JSON Web Token (JWT)** para autenticar las solicitudes.

Las rutas protegidas requieren enviar el token mediante:

```http
Authorization: Bearer <TOKEN>
```

### Protección de contraseñas

Las contraseñas se almacenan utilizando **bcrypt**, evitando guardar las credenciales en texto plano.

### Autorización

El backend utiliza roles para determinar qué operaciones puede realizar cada usuario.

### Aislamiento multiempresa

Las operaciones relacionadas con datos empresariales utilizan el contexto de empresa asociado al usuario autenticado.

### Base de datos

MySQL utiliza:

* Claves primarias.
* Claves foráneas.
* Restricciones.
* Índices.
* Integridad referencial.
* Reglas `ON DELETE`.
* Reglas `ON UPDATE`.

---

# 🏗️ Arquitectura del Backend

El backend utiliza una arquitectura modular basada en separación de responsabilidades.

```text
Cliente / Frontend
        │
        ▼
     REST API
        │
        ▼
   Express Router
        │
        ▼
   Middlewares
   ├── JWT
   ├── Roles
   └── Multiempresa
        │
        ▼
   Controllers
        │
        ▼
     Services
        │
        ▼
      MySQL
```

### Responsabilidades

**Routes**

Definen los endpoints disponibles en la API.

**Middlewares**

Procesan autenticación, autorización, validaciones y contexto empresarial.

**Controllers**

Reciben las solicitudes HTTP y coordinan las operaciones.

**Services**

Contienen la lógica de negocio.

**MySQL**

Almacena la información persistente del sistema.

---

# 📁 Estructura del proyecto

La estructura principal sigue una organización modular:

```text
pos-contable-backend/
│
├── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── models/
│   ├── config/
│   ├── utils/
│   └── app.ts
│
├── database/
│   └── pos_db.sql
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

La estructura puede evolucionar conforme se agreguen nuevos módulos al sistema.

---

# 🗄️ Modelo de datos

La base de datos utiliza **MySQL**.

El esquema contiene las entidades necesarias para administrar los procesos comerciales y de facturación del sistema.

## Empresas y usuarios

```text
empresas
usuarios
roles
```

## Inventario

```text
productos
categorias
impuestos
producto_impuestos
unidades_medida_dian
```

## Compras

```text
compras
compra_detalle
proveedores
```

## Ventas

```text
ventas
venta_detalle
clientes
```

## Caja

```text
caja
movimientos_caja
cierre_caja
```

## Facturación

```text
facturas
factura_detalles
factura_impuestos
factura_documentos
factura_eventos_dian
```

## Documentos tributarios

```text
notas_credito
notas_debito
```

## Configuración

```text
configuracion_facturacion
planes_facturacion
```

> El número y estructura exacta de tablas corresponde a la versión actual del esquema incluido en `database/pos_db.sql`.

---

# 🔗 Relaciones principales

El modelo de datos sigue una estructura relacional.

```text
EMPRESA
   │
   ├── USUARIOS
   │
   ├── PRODUCTOS
   │
   ├── CATEGORIAS
   │
   ├── COMPRAS
   │      └── COMPRA_DETALLE
   │
   ├── VENTAS
   │      └── VENTA_DETALLE
   │
   ├── CLIENTES
   │
   ├── PROVEEDORES
   │
   ├── CAJA
   │      ├── MOVIMIENTOS_CAJA
   │      └── CIERRE_CAJA
   │
   └── FACTURACION
          ├── FACTURA_DETALLES
          ├── FACTURA_IMPUESTOS
          ├── FACTURA_DOCUMENTOS
          └── FACTURA_EVENTOS_DIAN
```

El modelo utiliza diferentes reglas de integridad referencial:

```text
ON DELETE CASCADE
ON DELETE RESTRICT
ON DELETE SET NULL
ON UPDATE CASCADE
```

Esto permite controlar el comportamiento de las relaciones cuando se modifican o eliminan registros.

---

# 🧾 Facturación electrónica

El backend incorpora un módulo dedicado a la gestión de facturación electrónica.

El sistema contempla la estructura necesaria para manejar:

* Facturas.
* Detalles de factura.
* Impuestos.
* Documentos.
* Eventos.
* Notas crédito.
* Notas débito.
* Configuración de facturación.
* Unidades de medida DIAN.

La integración se encuentra orientada a trabajar inicialmente en **entorno de pruebas**.

---

# 🧾 Flujo de facturación

El flujo general puede representarse de la siguiente manera:

```text
Venta
  │
  ▼
Generación de factura
  │
  ▼
Registro de factura
  │
  ├── Detalles
  ├── Impuestos
  └── Información tributaria
  │
  ▼
Generación de documentos
  │
  ├── PDF
  └── XML
  │
  ▼
Procesamiento DIAN
  │
  ▼
Registro de eventos
```

El sistema también contempla la gestión de:

```text
Notas crédito
Notas débito
Eventos DIAN
Documentos de factura
```

---

# 💰 Gestión comercial

El sistema integra los principales procesos comerciales de un negocio:

```text
Empresa
│
├── Usuarios y roles
│
├── Productos
│   ├── Categorías
│   ├── Impuestos
│   └── Unidades de medida
│
├── Clientes
│
├── Proveedores
│
├── Compras
│   └── Detalle de compra
│
├── Ventas
│   └── Detalle de venta
│
├── Caja
│   ├── Movimientos
│   └── Cierre
│
└── Facturación
    ├── Detalles
    ├── Impuestos
    ├── Documentos
    └── Eventos DIAN
```

---

# 🛠️ Tecnologías

| Tecnología | Utilización                   |
| ---------- | ----------------------------- |
| Node.js    | Runtime del backend           |
| Express    | Framework para API REST       |
| TypeScript | Desarrollo tipado             |
| MySQL      | Base de datos relacional      |
| JWT        | Autenticación                 |
| bcrypt     | Protección de contraseñas     |
| PDFKit     | Generación de documentos PDF  |
| REST API   | Comunicación frontend/backend |
| DIAN       | Facturación electrónica       |
| Git        | Control de versiones          |
| GitHub     | Repositorio del proyecto      |

---

# 📦 Requisitos

Antes de instalar el proyecto se recomienda contar con:

* Node.js.
* npm.
* MySQL.
* Git.
* Una herramienta para realizar solicitudes HTTP, como `curl` o Postman.

Comprobar Node.js:

```bash
node --version
```

Comprobar npm:

```bash
npm --version
```

Comprobar MySQL:

```bash
mysql --version
```

---

# 📥 Instalación

Clonar el repositorio:

```bash
git clone https://github.com/senadeavila1995-tech/pos-contable-backend.git
```

Ingresar al proyecto:

```bash
cd pos-contable-backend
```

Instalar dependencias:

```bash
npm install
```

---

# 🗄️ Configuración de MySQL

Crear la base de datos:

```sql
CREATE DATABASE pos_db;
```

Importar el esquema:

```bash
mysql -u root -p pos_db < database/pos_db.sql
```

También puede utilizarse:

```bash
mysql -u root -p
```

y posteriormente:

```sql
CREATE DATABASE pos_db;
USE pos_db;
SOURCE database/pos_db.sql;
```

---

# ⚙️ Variables de entorno

Crear un archivo:

```text
.env
```

en la raíz del backend.

Ejemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=pos_db

JWT_SECRET=change_this_secret

FACTURACION_MODO=test
```

### Variables

| Variable           | Descripción                     |
| ------------------ | ------------------------------- |
| `PORT`             | Puerto utilizado por Express    |
| `DB_HOST`          | Host de MySQL                   |
| `DB_PORT`          | Puerto de MySQL                 |
| `DB_USER`          | Usuario de MySQL                |
| `DB_PASSWORD`      | Contraseña de MySQL             |
| `DB_NAME`          | Nombre de la base de datos      |
| `JWT_SECRET`       | Clave utilizada para firmar JWT |
| `FACTURACION_MODO` | Entorno de facturación          |

> Las credenciales, claves JWT y demás secretos nunca deben publicarse en GitHub.

---

# ▶️ Ejecución

## Desarrollo

Ejecutar:

```bash
npm run dev
```

El servidor estará disponible normalmente en:

```text
http://localhost:3000
```

---

# 🔌 API REST

El backend proporciona una API REST organizada por módulos.

Principales recursos:

```text
/api/auth
/api/empresas
/api/usuarios
/api/roles
/api/productos
/api/categorias
/api/clientes
/api/proveedores
/api/compras
/api/ventas
/api/caja
/api/facturacion
```

La disponibilidad exacta de endpoints depende de la versión actual del proyecto.

---

# 🔑 Autenticación

## Login

Ejemplo de solicitud:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@empresa.com",
    "password": "password"
  }'
```

El backend devuelve un JWT que debe utilizarse para acceder a las rutas protegidas.

---

# 📦 Productos

Consultar productos:

```bash
curl http://localhost:3000/api/productos \
  -H "Authorization: Bearer $TOKEN"
```

El token puede almacenarse temporalmente en una variable de entorno de la terminal:

```bash
export TOKEN="TU_TOKEN"
```

---

# 🛒 Ventas

El módulo de ventas permite registrar operaciones comerciales y asociarlas a clientes, usuarios, empresas y métodos de pago.

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/ventas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "metodo_pago": "EFECTIVO",
    "detalles": []
  }'
```

La estructura exacta del payload depende de la implementación actual del controlador de ventas.

---

# 🧾 Facturación

El módulo de facturación permite generar documentos relacionados con una venta.

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/facturacion/31 \
  -H "Authorization: Bearer $TOKEN"
```

Consultar PDF:

```bash
curl -i "http://localhost:3000/api/facturacion/31/pdf" \
  -H "Authorization: Bearer $TOKEN"
```

Consultar XML:

```bash
curl -i "http://localhost:3000/api/facturacion/31/xml" \
  -H "Authorization: Bearer $TOKEN"
```

Los identificadores utilizados en estos ejemplos son únicamente ilustrativos y deben reemplazarse por IDs existentes en la base de datos.

---

# 💵 Caja

El módulo de caja permite gestionar:

* Apertura de caja.
* Ingresos.
* Egresos.
* Movimientos.
* Cierre de caja.

Flujo:

```text
Apertura
   │
   ▼
Operaciones comerciales
   │
   ├── Ventas
   ├── Ingresos
   └── Egresos
   │
   ▼
Movimientos de caja
   │
   ▼
Cierre
```

---

# 🧪 Validación y pruebas

Durante el desarrollo se realizaron pruebas utilizando solicitudes HTTP y consultas directas a MySQL.

Se validaron funcionalidades relacionadas con:

* Autenticación mediante JWT.
* Autorización.
* Roles.
* Aislamiento entre empresas.
* Gestión de usuarios.
* Gestión de productos.
* Gestión de categorías.
* Clientes.
* Proveedores.
* Compras.
* Ventas.
* Métodos de pago.
* Caja.
* Movimientos de caja.
* Relaciones entre entidades.
* Persistencia en MySQL.
* Facturación.
* Generación de PDF.
* Generación de XML.

---

# 🔍 Ejemplo de validación de autenticación

Una vez obtenido el token:

```bash
export TOKEN="TU_TOKEN"
```

se puede consultar un recurso protegido:

```bash
curl -i http://localhost:3000/api/productos \
  -H "Authorization: Bearer $TOKEN"
```

Si el token es válido, el backend procesa la solicitud según los permisos del usuario y su contexto empresarial.

---

# 🧪 Pruebas de aislamiento multiempresa

Uno de los puntos importantes del proyecto es verificar que un usuario de una empresa no pueda acceder o modificar información perteneciente a otra empresa.

El flujo de validación es:

```text
Usuario Empresa A
       │
       ▼
      JWT
       │
       ▼
empresa_id = A
       │
       ▼
Consulta / modificación
       │
       ▼
Solo información autorizada
```

Esto permite implementar un modelo de separación lógica de información dentro de la misma aplicación.

---

# 🗃️ Base de datos

El esquema principal se encuentra en:

```text
database/pos_db.sql
```

El archivo contiene la estructura de la base de datos utilizada por el backend.

Incluye:

* Tablas.
* Claves primarias.
* Claves foráneas.
* Índices.
* Restricciones.
* Relaciones.
* Configuración de integridad referencial.

---

# 📊 Principales módulos

| Módulo        | Descripción                                       |
| ------------- | ------------------------------------------------- |
| Autenticación | Login y generación de JWT                         |
| Usuarios      | Administración de usuarios                        |
| Empresas      | Gestión del contexto empresarial                  |
| Roles         | Control de permisos                               |
| Productos     | Gestión del inventario                            |
| Categorías    | Clasificación de productos                        |
| Clientes      | Gestión de clientes                               |
| Proveedores   | Gestión de proveedores                            |
| Compras       | Registro de compras                               |
| Ventas        | Registro de ventas                                |
| Caja          | Control de dinero y movimientos                   |
| Impuestos     | Gestión tributaria                                |
| Facturación   | Generación y administración de facturas           |
| DIAN          | Procesos relacionados con facturación electrónica |
| Documentos    | PDF y XML                                         |
| Notas         | Notas crédito y débito                            |

---

# 📈 Estado del proyecto

## Implementado

* [x] API REST.
* [x] Node.js.
* [x] Express.
* [x] TypeScript.
* [x] MySQL.
* [x] Autenticación JWT.
* [x] Protección de contraseñas con bcrypt.
* [x] Autorización mediante roles.
* [x] Arquitectura multiempresa.
* [x] Gestión de usuarios.
* [x] Gestión de empresas.
* [x] Productos.
* [x] Categorías.
* [x] Clientes.
* [x] Proveedores.
* [x] Compras.
* [x] Ventas.
* [x] Métodos de pago.
* [x] Caja.
* [x] Movimientos de caja.
* [x] Cierre de caja.
* [x] Impuestos.
* [x] Facturación.
* [x] Documentos PDF.
* [x] Documentos XML.
* [x] Notas crédito.
* [x] Notas débito.
* [x] Configuración de facturación.
* [x] Estructura para procesos relacionados con DIAN.

## Próximas mejoras

* [ ] Documentación completa con Swagger/OpenAPI.
* [ ] Pruebas unitarias.
* [ ] Pruebas de integración.
* [ ] Dockerización.
* [ ] Configuración CI/CD.
* [ ] Sistema de logs centralizado.
* [ ] Mejoras de validación de datos.
* [ ] Despliegue en entorno productivo.
* [ ] Integración productiva con servicios DIAN.

---

# 🧱 Principios aplicados

Durante el desarrollo se aplicaron conceptos de ingeniería de software como:

* Separación de responsabilidades.
* Arquitectura modular.
* API REST.
* Autenticación y autorización.
* Programación orientada a servicios.
* Modelado relacional.
* Integridad referencial.
* Manejo de errores.
* Variables de entorno.
* Control de acceso.
* Arquitectura multi-tenant.
* Control de versiones mediante Git.

---

# 🔄 Flujo general del sistema

```text
                    ┌─────────────────┐
                    │    FRONTEND     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    REST API     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  MIDDLEWARES    │
                    │                 │
                    │ JWT             │
                    │ Roles           │
                    │ Multiempresa    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  CONTROLLERS    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    SERVICES     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      MYSQL      │
                    └─────────────────┘
```

---

# 🌐 Integración Frontend / Backend

El backend está diseñado para funcionar como una API independiente que puede ser consumida por diferentes clientes.

Por ejemplo:

```text
React
Angular
Vue
Aplicaciones móviles
Postman
curl
```

La comunicación se realiza mediante HTTP/HTTPS utilizando JSON para el intercambio de información.

---

# 🛡️ Buenas prácticas

El proyecto contempla buenas prácticas como:

* Uso de variables de entorno.
* No almacenar credenciales en el repositorio.
* Uso de JWT.
* Hash de contraseñas.
* Separación entre lógica de negocio y rutas.
* Uso de claves foráneas.
* Validación del contexto empresarial.
* Control de acceso mediante roles.
* Manejo estructurado de errores.
* Uso de Git para control de versiones.

---

# 🚀 Despliegue

Para ejecutar el proyecto en un servidor se requiere:

```text
Node.js
MySQL
Variables de entorno
Base de datos
Backend compilado
```

El flujo general de despliegue sería:

```text
GitHub
   │
   ▼
Servidor
   │
   ├── Node.js
   ├── Backend
   └── MySQL
        │
        ▼
   Base de datos
```

Antes de utilizar el sistema en producción deben configurarse correctamente:

* Credenciales de base de datos.
* JWT secret.
* CORS.
* Variables de entorno.
* Certificados y credenciales de facturación.
* Configuración DIAN.
* HTTPS.
* Sistema de logs.
* Backups de base de datos.

---

# 📌 Consideraciones de producción

La configuración incluida actualmente está orientada principalmente al desarrollo y pruebas.

Antes de desplegar en producción se recomienda:

1. Utilizar secretos seguros.
2. Activar HTTPS.
3. Configurar correctamente CORS.
4. Utilizar un usuario MySQL específico para la aplicación.
5. Evitar utilizar `root` en producción.
6. Configurar backups.
7. Configurar logs.
8. Implementar monitoreo.
9. Ejecutar pruebas automatizadas.
10. Validar completamente la integración con DIAN.
11. Revisar permisos de cada rol.
12. Revisar las políticas de aislamiento multiempresa.

---

# 📄 Licencia

Este proyecto fue desarrollado con fines de **portafolio profesional y demostración de conocimientos en desarrollo de software**.

La utilización comercial, modificación o distribución del proyecto debe realizarse de acuerdo con las condiciones definidas por el propietario del repositorio.

---

# 👨‍💻 Autor

## Daniel De Avila

Desarrollador de software enfocado en:

* Desarrollo backend.
* APIs REST.
* Node.js.
* TypeScript.
* Bases de datos.
* MySQL.
* Sistemas empresariales.
* Integración frontend/backend.
* Desarrollo de soluciones POS.

### GitHub

https://github.com/senadeavila1995-tech

---

# ⭐ Proyecto

**POS Contable Backend**

Backend empresarial desarrollado para un sistema POS con arquitectura multiempresa, gestión comercial, control de caja y estructura para facturación electrónica.

```text
Node.js + Express + TypeScript + MySQL + JWT
```

---

## 📚 Tecnologías utilizadas

```text
Node.js
Express
TypeScript
MySQL
JWT
bcrypt
PDFKit
REST API
Git
GitHub
DIAN
```

---

## 📌 Resumen

**POS Contable Backend** representa una implementación de backend empresarial orientada a resolver procesos reales de gestión comercial.

El proyecto integra autenticación, autorización, arquitectura multiempresa, persistencia relacional, ventas, compras, inventario, caja y facturación electrónica dentro de una API REST desarrollada con tecnologías modernas del ecosistema JavaScript/TypeScript.
