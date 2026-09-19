DROP DATABASE IF EXISTS cavosh_cafe;
CREATE DATABASE cavosh_cafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cavosh_cafe;

-- ========================================================
-- 1. TABLA DE USUARIOS (Soporta Login, Registro y Verificación)
-- ========================================================
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    puntos INT NOT NULL DEFAULT 124,
    telefono VARCHAR(20) DEFAULT '+51 987 654 321',
    avatar_url VARCHAR(255) DEFAULT '',
    codigo_verificacion VARCHAR(6) DEFAULT NULL,
    codigo_expiracion DATETIME DEFAULT NULL,
    es_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    recibir_notificaciones BOOLEAN NOT NULL DEFAULT TRUE,
    compartir_ubicacion BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 2. TABLA DE SUCURSALES / LOCALES
-- ========================================================
CREATE TABLE sucursal (
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    ciudad VARCHAR(100) NOT NULL DEFAULT 'Lima',
    horario_atencion VARCHAR(100) NOT NULL DEFAULT 'Open: 8:00 AM - 22:00 PM',
    latitud DECIMAL(10,8) DEFAULT -12.046374,
    longitud DECIMAL(11,8) DEFAULT -77.042793,
    imagen_url VARCHAR(255) DEFAULT '',
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- ========================================================
-- 3. TABLA DE PRODUCTOS
-- ========================================================
CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    imagen_url VARCHAR(255) DEFAULT '',
    es_nuevo BOOLEAN NOT NULL DEFAULT FALSE,
    es_frecuente BOOLEAN NOT NULL DEFAULT FALSE,
    tamano_ml INT DEFAULT 250
);

-- ========================================================
-- 4. TABLA DE FAVORITOS
-- ========================================================
CREATE TABLE favorito (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
    CONSTRAINT unique_favorito UNIQUE (id_usuario, id_producto)
);

-- ========================================================
-- 5. TABLA DE CARRITO DE COMPRAS
-- ========================================================
CREATE TABLE carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    tamano VARCHAR(20) DEFAULT 'Small',
    tipo_leche VARCHAR(50) DEFAULT 'Full-fat milk',
    con_crema VARCHAR(50) DEFAULT 'Without whipped cream',
    con_cafeina VARCHAR(50) DEFAULT 'With caffeine',
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
);

-- ========================================================
-- 6. TABLA DE CUPONES
-- ========================================================
CREATE TABLE cupon (
    id_cupon INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    porcentaje_descuento DECIMAL(5,2) DEFAULT 0.00,
    monto_fijo DECIMAL(10,2) DEFAULT 0.00,
    compra_minima DECIMAL(10,2) DEFAULT 0.00,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_expiracion DATE
);

-- ========================================================
-- 7. TABLA DE MÉTODOS DE PAGO
-- ========================================================
CREATE TABLE metodo_pago (
    id_metodo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_tarjeta VARCHAR(50) NOT NULL DEFAULT 'MasterCard',
    ultimos_cuatro VARCHAR(4) NOT NULL,
    titular VARCHAR(100) NOT NULL,
    es_predeterminada BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ========================================================
-- 8. TABLA DE PEDIDOS / ÓRDENES
-- ========================================================
CREATE TABLE pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sucursal INT NOT NULL,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    metodo_entrega VARCHAR(20) NOT NULL DEFAULT 'PICKUP',
    fecha_entrega DATE,
    hora_entrega VARCHAR(20) DEFAULT '08:00 AM',
    metodo_pago VARCHAR(20) NOT NULL DEFAULT 'CARD',
    tarjeta_ultimos4 VARCHAR(4) DEFAULT '2048',
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    codigo_cupon VARCHAR(50) DEFAULT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PLACED',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
);

-- ========================================================
-- 9. TABLA DE DETALLES DEL PEDIDO
-- ========================================================
CREATE TABLE detalle_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    tamano VARCHAR(20) DEFAULT 'Small',
    tipo_leche VARCHAR(50) DEFAULT 'Full-fat milk',
    con_crema VARCHAR(50) DEFAULT 'Without whipped cream',
    con_cafeina VARCHAR(50) DEFAULT 'With caffeine',
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ========================================================
-- DATOS SEMILLA (SEEDS INICIALES)
-- ========================================================

-- Usuario de prueba verificado para desarrollo/pruebas
INSERT INTO usuario (id_usuario, nombre_completo, email, password, puntos, telefono, avatar_url, codigo_verificacion, codigo_expiracion, es_verificado, recibir_notificaciones, compartir_ubicacion, fecha_registro)
VALUES (1, 'Laura Vat', 'usuario@cavosh.com', '123456', 124, '+51 987 654 321', '', NULL, NULL, TRUE, TRUE, TRUE, NOW());

-- Sucursales
INSERT INTO sucursal (id_sucursal, nombre, direccion, ciudad, horario_atencion, latitud, longitud, imagen_url, activa)
VALUES 
(1, 'Cavosh Cafe - Central', 'Av. Javier Prado Este 1230', 'Lima', 'Open: 8:00 AM - 22:00 PM', -12.0891, -77.0234, '', TRUE),
(2, 'Cavosh Cafe - Miraflores', 'Av. José Larco 450', 'Lima', 'Open: 8:00 AM - 22:00 PM', -12.1211, -77.0298, '', TRUE);

-- Catálogo de Productos
INSERT INTO producto (id_producto, nombre, descripcion, precio, categoria, imagen_url, es_nuevo, es_frecuente, tamano_ml)
VALUES
(1, 'Caramel Macchiato', 'Our Caramel Macchiato is the perfect combination of a rich-tasting espresso, creamy milk and the sweet, buttery aroma of caramel.', 4.00, 'Hot drinks', '', TRUE, TRUE, 250),
(2, 'Vanilla Latte', 'Rich, full-bodied espresso blended with creamy steamed milk and lightly sweetened with vanilla syrup.', 3.00, 'Hot drinks', '', TRUE, FALSE, 250),
(3, 'White Chocolate Mocha', 'Espresso, steamed milk and decadent white chocolate sauce topped with sweetened whipped cream.', 4.00, 'Hot drinks', '', TRUE, FALSE, 300),
(4, 'Traditional Cappuccino', 'Dark, rich espresso lies in wait under a smoothed and stretched layer of thick milk foam.', 3.00, 'Hot drinks', '', FALSE, TRUE, 250),
(5, 'Caffe Mocha', 'Rich espresso combined with bittersweet chocolate sauce and steamed milk.', 4.50, 'Hot drinks', '', FALSE, TRUE, 300),
(6, 'Cinnamon Roll', 'Warm, freshly baked pastry swirled with cinnamon brown sugar and topped with cream cheese icing.', 3.50, 'Bakery', '', FALSE, TRUE, 0),
(7, 'Iced Caramel Macchiato', 'Espresso poured over chilled milk, flavored with sweet vanilla syrup and drizzled with caramel sauce.', 4.50, 'Cold drinks', '', TRUE, FALSE, 350),
(8, 'Cold Brew Coffee', 'Slow-steeped in cool water for 20 hours for a super smooth, full-bodied coffee taste without acidity.', 3.80, 'Cold drinks', '', FALSE, FALSE, 350),
(9, 'Croissant Clásico', 'Flaky, buttery all-butter French croissant baked fresh daily.', 2.80, 'Bakery', '', FALSE, FALSE, 0);

-- Cupones
INSERT INTO cupon (id_cupon, codigo, porcentaje_descuento, monto_fijo, compra_minima, activo, fecha_expiracion)
VALUES
(1, 'CAVOSH10', 10.00, 0.00, 5.00, TRUE, '2027-12-31'),
(2, 'WELCOME', 0.00, 1.20, 5.00, TRUE, '2027-12-31');

-- Métodos de Pago de prueba
INSERT INTO metodo_pago (id_metodo, id_usuario, tipo_tarjeta, ultimos_cuatro, titular, es_predeterminada)
VALUES
(1, 1, 'MasterCard', '2048', 'Laura Vat', TRUE),
(2, 1, 'Visa', '1234', 'Laura Vat', FALSE);

-- Favoritos del usuario de prueba
INSERT INTO favorito (id_usuario, id_producto)
VALUES
(1, 1),
(1, 4),
(1, 5),
(1, 6);
