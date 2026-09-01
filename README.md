# POS Contable Backend

Backend empresarial para un sistema **POS Contable** desarrollado con **Node.js, Express, TypeScript y MySQL**.

El sistema está orientado a la gestión de ventas, inventario, compras, clientes, proveedores, caja y facturación electrónica.

El proyecto implementa una arquitectura **multiempresa (multi-tenant)**, utilizando autenticación mediante **JWT** para controlar el acceso y mantener aislada la información de cada empresa.

## 🚀 Características principales

* Autenticación mediante JWT.
* Autorización y gestión de roles.
* Arquitectura multiempresa (multi-tenant).
* Aislamiento de información por empresa.
* Gestión de usuarios.
* Gestión de productos y categorías.
* Gestión de clientes y proveedores.
* Gestión de compras.
* Gestión de ventas.
* Métodos de pago.
* Apertura y cierre de caja.
* Movimientos de caja.
* Gestión de impuestos.
* Facturación electrónica.
* Integración con DIAN en entorno de pruebas.
* Notas crédito y débito.
* Generación de documentos PDF.
* API REST.
* Persistencia de información mediante MySQL.

## 🏢 Arquitectura Multiempresa

El sistema permite trabajar con diferentes empresas dentro de una misma aplicación.

La entidad `empresas` funciona como eje del modelo de datos y se relaciona con diferentes módulos del sistema.

El contexto de empresa se utiliza junto con JWT para controlar el acceso a los recursos correspondientes.

Entre las entidades relacionadas con empresas se encuentran:

* `usuarios`
* `categorias`
* `clientes`
* `compras`
* `facturas`
* `configuracion_facturacion`

Esta arquitectura permite mantener separada la información de cada empresa dentro de una misma instancia del backend.

## 🔐 Seguridad

El backend incorpora mecanismos de seguridad para autenticación y autorización:

* JWT para autenticación.
* bcrypt para protección de contraseñas.
* Control de acceso mediante roles.
* Validación de acceso a recursos.
* Aislamiento de información por empresa.
* Integridad referencial mediante restricciones de MySQL.

## 🗄️ Modelo de datos

La base de datos utiliza MySQL y cuenta con **25 tablas relacionadas**.

### Empresas y usuarios

* `empresas`
* `usuarios`
* `roles`

### Inventario

* `productos`
* `categorias`
* `impuestos`
* `producto_impuestos`
* `unidades_medida_dian`

### Compras

* `compras`
* `compra_detalle`
* `proveedores`

### Ventas

* `ventas`
* `venta_detalle`
* `clientes`

### Caja

* `caja`
* `movimientos_caja`
* `cierre_caja`

### Facturación

* `facturas`
* `factura_detalles`
* `factura_impuestos`
* `factura_documentos`
* `factura_eventos_dian`

### Documentos

* `notas_credito`
* `notas_debito`

### Configuración

* `configuracion_facturacion`
* `planes_facturacion`

El modelo utiliza:

* Claves primarias.
* Claves foráneas.
* Índices únicos.
* Integridad referencial.
* `ON DELETE CASCADE`.
* `ON DELETE RESTRICT`.
* `ON DELETE SET NULL`.
* `ON UPDATE CASCADE`.

## 🧾 Facturación electrónica

El backend incorpora un módulo orientado a facturación electrónica y comunicación con la **DIAN**.

Se contemplan:

* Facturas.
* Detalles de factura.
* Impuestos.
* Documentos de facturación.
* Eventos asociados a la DIAN.
* Notas crédito.
* Notas débito.
* Configuración de facturación por empresa.
* Unidades de medida DIAN.

La integración se encuentra configurada para trabajar en **entorno de pruebas**.

## 💰 Gestión comercial

El sistema integra diferentes procesos empresariales:

```text
Empresa
│
├── Usuarios y roles
├── Productos
├── Categorías
├── Clientes
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

## 🛠️ Tecnologías

| Tecnología | Utilización                   |
| ---------- | ----------------------------- |
| Node.js    | Runtime del backend           |
| Express    | Framework backend             |
| TypeScript | Desarrollo tipado             |
| MySQL      | Base de datos                 |
| JWT        | Autenticación                 |
| bcrypt     | Protección de contraseñas     |
| PDFKit     | Generación de PDF             |
| REST API   | Comunicación frontend/backend |
| DIAN       | Facturación electrónica       |

## 📁 Base de datos

El esquema completo de MySQL se encuentra en:

```text
database/pos_db.sql
```

El archivo contiene únicamente la **estructura de la base de datos**, sin los datos de desarrollo.

### Crear la base de datos

```sql
CREATE DATABASE pos_db;
```

### Importar el esquema

```bash
mysql -u root -p pos_db < database/pos_db.sql
```

## ⚙️ Configuración

Crear un archivo `.env` en el backend.

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

> Las credenciales y secretos reales deben mantenerse fuera del repositorio.

## ▶️ Instalación

Clonar el repositorio:

```bash
git clone https://github.com/senadeavila1995-tech/pos-contable-backend.git
cd pos-contable-backend
```

Instalar dependencias:

```bash
npm install
```

Configurar las variables de entorno y la base de datos.

Ejecutar el servidor en desarrollo:

```bash
npm run dev
```

## 🔌 API REST

El backend proporciona servicios REST para los diferentes módulos del sistema.

Entre los principales recursos se encuentran:

```text
/auth
/empresas
/usuarios
/roles
/productos
/categorias
/clientes
/proveedores
/compras
/ventas
/caja
/facturas
```

La disponibilidad exacta de endpoints depende de la versión actual del proyecto.

## 🧪 Validación

Durante el desarrollo se validaron funcionalidades relacionadas con:

* Autenticación mediante JWT.
* Autorización.
* Aislamiento entre empresas.
* Gestión de productos.
* Registro de ventas.
* Métodos de pago.
* Gestión de caja.
* Relaciones entre entidades.
* Persistencia en MySQL.
* Flujo de facturación.

## 🎯 Objetivo del proyecto

El objetivo es desarrollar un backend empresarial para un sistema POS aplicando conceptos de desarrollo profesional:

* Diseño de APIs REST.
* Arquitectura multi-tenant.
* Autenticación y autorización.
* Modelado relacional.
* Integridad de datos.
* Gestión de operaciones comerciales.
* Facturación electrónica.
* Seguridad backend.
* Integración frontend/backend.

## 👨‍💻 Portafolio

Proyecto desarrollado como parte del portafolio profesional de desarrollo de software.

GitHub:

https://github.com/senadeavila1995-tech
