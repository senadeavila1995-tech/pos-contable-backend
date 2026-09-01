-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: pos_db
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `caja`
--

DROP TABLE IF EXISTS `caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caja` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `monto_inicial` decimal(12,2) NOT NULL,
  `fecha_apertura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('ABIERTA','CERRADA') COLLATE utf8mb4_unicode_ci DEFAULT 'ABIERTA',
  PRIMARY KEY (`id`),
  KEY `idx_caja_usuario` (`usuario_id`),
  CONSTRAINT `fk_caja_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `empresa_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_categoria_nombre` (`nombre`),
  KEY `idx_categoria_empresa` (`empresa_id`),
  CONSTRAINT `fk_categoria_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cierre_caja`
--

DROP TABLE IF EXISTS `cierre_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cierre_caja` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `caja_id` int unsigned NOT NULL,
  `total_ventas` decimal(12,2) DEFAULT '0.00',
  `total_efectivo` decimal(12,2) DEFAULT '0.00',
  `diferencia` decimal(12,2) DEFAULT '0.00',
  `fecha_cierre` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cierre_caja` (`caja_id`),
  CONSTRAINT `fk_cierre_caja` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `digito_verificacion` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_persona` enum('NATURAL','JURIDICA') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cc` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `municipio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_municipio` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_pais` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `regimen_fiscal` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsabilidad_fiscal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_comercial` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primer_nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `segundo_nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primer_apellido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `segundo_apellido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_postal` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsabilidad_tributaria` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empresa_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cliente_nombre` (`nombre`),
  KEY `idx_cliente_cc` (`cc`),
  KEY `idx_clientes_documento` (`tipo_documento`,`numero_documento`),
  KEY `idx_cliente_empresa` (`empresa_id`),
  CONSTRAINT `fk_cliente_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compra_detalle`
--

DROP TABLE IF EXISTS `compra_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra_detalle` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `compra_id` int unsigned NOT NULL,
  `producto_id` int unsigned NOT NULL,
  `cantidad` int NOT NULL,
  `costo_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_detalle_compra` (`compra_id`),
  KEY `idx_detalle_producto_compra` (`producto_id`),
  CONSTRAINT `fk_detalle_compra` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_producto_compra` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `proveedor_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `fecha_compra` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_empresa` bigint unsigned NOT NULL,
  `numero_factura` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `impuestos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `estado` enum('REGISTRADA','ANULADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REGISTRADA',
  `caja_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_compra_proveedor` (`proveedor_id`),
  KEY `idx_compra_usuario` (`usuario_id`),
  KEY `idx_compra_empresa` (`id_empresa`),
  KEY `idx_compra_caja` (`caja_id`),
  KEY `idx_compra_fecha` (`fecha_compra`),
  CONSTRAINT `fk_compra_caja` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`id`),
  CONSTRAINT `fk_compra_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`),
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `configuracion_facturacion`
--

DROP TABLE IF EXISTS `configuracion_facturacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_facturacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `resolucion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prefijo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_actual` int DEFAULT '1',
  `rango_desde` int DEFAULT NULL,
  `rango_hasta` int DEFAULT NULL,
  `fecha_resolucion` date DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `clave_tecnica` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ambiente` enum('PRUEBAS','PRODUCCION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRUEBAS',
  `tipo_documento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FACTURA_VENTA',
  `activo` tinyint(1) DEFAULT '1',
  `numero_resolucion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_inicial` int DEFAULT NULL,
  `numero_final` int DEFAULT NULL,
  `fecha_desde` date DEFAULT NULL,
  `fecha_hasta` date DEFAULT NULL,
  `software_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pin_software` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `test_set_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ambiente_dian` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_config_facturacion_empresa` (`empresa_id`),
  CONSTRAINT `fk_config_facturacion_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `empresas`
--

DROP TABLE IF EXISTS `empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_persona` enum('NATURAL','JURIDICA') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_documento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `digito_verificacion` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `municipio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_municipio` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_pais` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `regimen_fiscal` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsabilidad_fiscal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nombre_comercial` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_postal` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actividad_economica` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_ciiu` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsabilidad_tributaria` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_organizacion` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_empresas_nit` (`nit`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `factura_detalles`
--

DROP TABLE IF EXISTS `factura_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura_detalles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `factura_id` int unsigned NOT NULL,
  `numero_linea` int unsigned NOT NULL,
  `producto_id` int unsigned DEFAULT NULL,
  `codigo_producto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_codigo_producto` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` decimal(18,6) NOT NULL DEFAULT '0.000000',
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UND',
  `codigo_unidad_dian` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NIU',
  `precio_unitario` decimal(18,6) NOT NULL DEFAULT '0.000000',
  `precio_sin_impuesto` decimal(18,6) NOT NULL DEFAULT '0.000000',
  `descuento` decimal(18,2) NOT NULL DEFAULT '0.00',
  `porcentaje_descuento` decimal(5,2) NOT NULL DEFAULT '0.00',
  `base_imponible` decimal(18,2) NOT NULL DEFAULT '0.00',
  `codigo_impuesto` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_impuesto` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `porcentaje_impuesto` decimal(5,2) NOT NULL DEFAULT '0.00',
  `valor_impuesto` decimal(18,2) NOT NULL DEFAULT '0.00',
  `total_linea` decimal(18,2) NOT NULL DEFAULT '0.00',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_factura_linea` (`factura_id`,`numero_linea`),
  KEY `idx_factura_detalle_factura` (`factura_id`),
  KEY `idx_factura_detalle_producto` (`producto_id`),
  CONSTRAINT `fk_factura_detalle_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_factura_detalle_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `factura_documentos`
--

DROP TABLE IF EXISTS `factura_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura_documentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `factura_id` int unsigned NOT NULL,
  `tipo_documento` enum('XML','XML_FIRMADO','PDF','RESPUESTA_DIAN','ACUSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_archivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ruta_archivo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenido_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenido_hash_sha256` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_documento` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_factura_documentos_factura` (`factura_id`),
  CONSTRAINT `fk_factura_documento_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `factura_eventos_dian`
--

DROP TABLE IF EXISTS `factura_eventos_dian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura_eventos_dian` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `factura_id` int unsigned NOT NULL,
  `evento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_respuesta` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci,
  `fecha_evento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `request_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `respuesta_raw` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_evento_factura` (`factura_id`),
  KEY `idx_evento_fecha` (`fecha_evento`),
  CONSTRAINT `fk_evento_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `factura_impuestos`
--

DROP TABLE IF EXISTS `factura_impuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura_impuestos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `factura_id` int unsigned NOT NULL,
  `tipo_impuesto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_imponible` decimal(12,2) NOT NULL DEFAULT '0.00',
  `porcentaje` decimal(5,2) NOT NULL DEFAULT '0.00',
  `valor` decimal(12,2) NOT NULL DEFAULT '0.00',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_factura_impuesto_factura` (`factura_id`),
  CONSTRAINT `fk_factura_impuesto_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `venta_id` int unsigned NOT NULL,
  `empresa_id` bigint unsigned NOT NULL,
  `numero` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_emision` datetime DEFAULT NULL,
  `fecha_validacion` datetime DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_descuentos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_iva` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `moneda` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COP',
  `forma_pago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medio_pago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ambiente` enum('PRUEBAS','PRODUCCION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRUEBAS',
  `tipo_documento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FACTURA_VENTA',
  `cufe` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xml_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `respuesta_dian` longtext COLLATE utf8mb4_unicode_ci,
  `codigo_respuesta_dian` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje_dian` text COLLATE utf8mb4_unicode_ci,
  `estado_dian` enum('PENDIENTE','ACEPTADA','RECHAZADA') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `prefijo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consecutivo` int DEFAULT NULL,
  `fecha_vencimiento` datetime DEFAULT NULL,
  `hora_emision` time DEFAULT NULL,
  `fecha_transmision` datetime DEFAULT NULL,
  `total_impuestos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `cude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_data` text COLLATE utf8mb4_unicode_ci,
  `estado_transmision` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_validacion` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xml_generado_hash` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `respuesta_dian_raw` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_factura_numero` (`numero`),
  UNIQUE KEY `uq_factura_venta` (`venta_id`),
  KEY `idx_factura_empresa` (`empresa_id`),
  KEY `idx_facturas_cufe` (`cufe`),
  KEY `idx_facturas_estado_dian` (`estado_dian`),
  KEY `idx_facturas_fecha_emision` (`fecha_emision`),
  CONSTRAINT `fk_factura_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `fk_factura_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `impuestos`
--

DROP TABLE IF EXISTS `impuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `impuestos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL DEFAULT '0.00',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_impuesto_codigo_porcentaje` (`codigo`,`porcentaje`),
  KEY `idx_impuesto_tipo` (`tipo`),
  KEY `idx_impuesto_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `movimientos_caja`
--

DROP TABLE IF EXISTS `movimientos_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_caja` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `caja_id` int unsigned NOT NULL,
  `tipo` enum('INGRESO','EGRESO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_movimiento_caja` (`caja_id`),
  CONSTRAINT `fk_movimiento_caja` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notas_credito`
--

DROP TABLE IF EXISTS `notas_credito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas_credito` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `factura_id` int unsigned NOT NULL,
  `empresa_id` bigint unsigned NOT NULL,
  `numero` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `motivo_codigo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_impuestos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `moneda` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COP',
  `cude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ambiente` enum('PRUEBAS','PRODUCCION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRUEBAS',
  `estado_dian` enum('PENDIENTE','ACEPTADA','RECHAZADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `respuesta_dian` longtext COLLATE utf8mb4_unicode_ci,
  `xml_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nota_credito_numero` (`numero`),
  KEY `idx_nota_credito_factura` (`factura_id`),
  KEY `idx_nota_credito_empresa` (`empresa_id`),
  CONSTRAINT `fk_nota_credito_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `fk_nota_credito_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notas_debito`
--

DROP TABLE IF EXISTS `notas_debito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas_debito` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `factura_id` int unsigned NOT NULL,
  `empresa_id` bigint unsigned NOT NULL,
  `numero` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `motivo_codigo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_impuestos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `moneda` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COP',
  `cude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ambiente` enum('PRUEBAS','PRODUCCION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRUEBAS',
  `estado_dian` enum('PENDIENTE','ACEPTADA','RECHAZADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `respuesta_dian` longtext COLLATE utf8mb4_unicode_ci,
  `xml_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nota_debito_numero` (`numero`),
  KEY `idx_nota_debito_factura` (`factura_id`),
  KEY `idx_nota_debito_empresa` (`empresa_id`),
  CONSTRAINT `fk_nota_debito_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `fk_nota_debito_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `planes_facturacion`
--

DROP TABLE IF EXISTS `planes_facturacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planes_facturacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` bigint unsigned NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio` decimal(10,2) DEFAULT '0.00',
  `facturas_incluidas` int NOT NULL DEFAULT '0',
  `facturas_usadas` int NOT NULL DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_plan_empresa` (`empresa_id`),
  CONSTRAINT `fk_plan_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `producto_impuestos`
--

DROP TABLE IF EXISTS `producto_impuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_impuestos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `producto_id` int unsigned NOT NULL,
  `impuesto_id` int unsigned NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL DEFAULT '0.00',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_producto_impuesto` (`producto_id`,`impuesto_id`,`porcentaje`),
  KEY `idx_producto_impuesto_producto` (`producto_id`),
  KEY `idx_producto_impuesto_impuesto` (`impuesto_id`),
  CONSTRAINT `fk_producto_impuesto_impuesto` FOREIGN KEY (`impuesto_id`) REFERENCES `impuestos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_producto_impuesto_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio` decimal(12,2) NOT NULL,
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_impuesto` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `porcentaje_iva` decimal(5,2) NOT NULL DEFAULT '0.00',
  `stock_unidades` int NOT NULL DEFAULT '0',
  `peso_unitario` decimal(10,2) DEFAULT NULL,
  `unidad_peso` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `talla` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `categoria_id` int unsigned NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `codigo_estandar` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_codigo_estandar` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_unidad_dian` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion_fiscal` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_servicio` tinyint(1) NOT NULL DEFAULT '0',
  `empresa_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_producto_nombre` (`nombre`),
  KEY `idx_producto_categoria` (`categoria_id`),
  KEY `idx_productos_codigo` (`codigo`),
  KEY `idx_producto_empresa` (`empresa_id`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `fk_producto_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_empresa` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_proveedor_empresa` (`id_empresa`),
  CONSTRAINT `fk_proveedor_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unidades_medida_dian`
--

DROP TABLE IF EXISTS `unidades_medida_dian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidades_medida_dian` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_unidad_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `rol_id` int unsigned NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `empresa_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  KEY `idx_usuario_rol` (`rol_id`),
  KEY `idx_usuario_empresa` (`empresa_id`),
  CONSTRAINT `fk_usuario_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `venta_detalle`
--

DROP TABLE IF EXISTS `venta_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta_detalle` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `venta_id` int unsigned NOT NULL,
  `producto_id` int unsigned NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `base_imponible` decimal(12,2) DEFAULT NULL,
  `porcentaje_iva` decimal(5,2) NOT NULL DEFAULT '0.00',
  `valor_iva` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_linea` decimal(12,2) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `codigo_producto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion_fiscal` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_unidad_dian` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_impuesto` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_impuesto` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio_sin_impuesto` decimal(12,2) DEFAULT NULL,
  `porcentaje_descuento` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_detalle_venta` (`venta_id`),
  KEY `idx_detalle_producto_venta` (`producto_id`),
  CONSTRAINT `fk_detalle_producto_venta` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `fk_detalle_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `empresa_id` bigint unsigned NOT NULL,
  `caja_id` int unsigned DEFAULT NULL,
  `cliente_id` int unsigned DEFAULT NULL,
  `total` decimal(12,2) NOT NULL,
  `moneda` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COP',
  `forma_pago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medio_pago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plazo_pago` int DEFAULT NULL,
  `metodo_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','NEQUI','DAVIPLATA') COLLATE utf8mb4_unicode_ci DEFAULT 'EFECTIVO',
  `estado` enum('PENDIENTE','PAGADA','ANULADA') COLLATE utf8mb4_unicode_ci DEFAULT 'PAGADA',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_emision` datetime DEFAULT NULL,
  `fecha_vencimiento` datetime DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_descuentos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_impuestos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_iva` decimal(12,2) NOT NULL DEFAULT '0.00',
  `forma_pago_codigo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medio_pago_codigo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_venta_usuario` (`usuario_id`),
  KEY `idx_venta_empresa` (`empresa_id`),
  KEY `idx_venta_cliente` (`cliente_id`),
  KEY `idx_venta_caja` (`caja_id`),
  KEY `idx_venta_fecha` (`creado_en`),
  CONSTRAINT `fk_venta_caja` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`id`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `fk_venta_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-01 17:32:39
