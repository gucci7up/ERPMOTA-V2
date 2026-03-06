-- Script de Tablas MySQL Base para ERPMOTA

-- Tabla de Usuarios (Administradores, Empleados con acceso al panel)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `role` ENUM('admin', 'empleado') DEFAULT 'empleado',
    `banca_id` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`banca_id`) REFERENCES `bancas`(`id`) ON DELETE SET NULL
);

-- Tabla de Configuraciones Globales (Llave-Valor)
CREATE TABLE IF NOT EXISTS `settings` (
    `key_name` VARCHAR(100) PRIMARY KEY,
    `value` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Bancas (Módulo principal)
CREATE TABLE IF NOT EXISTS `bancas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255),
    `phone` VARCHAR(20),
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Operaciones Financieras
CREATE TABLE IF NOT EXISTS `operaciones` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `banca_id` INT NOT NULL,
    `fecha` DATE NOT NULL,
    `tipo` ENUM('ingreso', 'gasto') NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `monto` DECIMAL(10,2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`banca_id`) REFERENCES `bancas`(`id`) ON DELETE CASCADE
);

-- Tabla de Gastos Fijos / Operativos
CREATE TABLE IF NOT EXISTS `gastos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `banca_id` INT NOT NULL,
    `concepto` VARCHAR(255) NOT NULL,
    `monto` DECIMAL(10,2) NOT NULL,
    `fecha` DATE NOT NULL,
    `estado` ENUM('Pagado', 'Pendiente') DEFAULT 'Pendiente',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`banca_id`) REFERENCES `bancas`(`id`) ON DELETE CASCADE
);

-- Tabla de Pagos de Nómina
CREATE TABLE IF NOT EXISTS `pagos_nomina` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `empleado_id` INT NOT NULL,
    `monto_pagado` DECIMAL(10,2) NOT NULL,
    `fecha_pago` DATE NOT NULL,
    `periodo` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`empleado_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Datos iniciales obligatorios: Administrador por defecto
-- El password aquí es "password123" encriptado con BCRYPT ($2y$10...)
INSERT IGNORE INTO `users` (`name`, `email`, `password`, `role`) VALUES 
('Administrador', 'admin@erpmota.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Datos iniciales de configuración base
INSERT IGNORE INTO `settings` (`key_name`, `value`) VALUES 
('company_name', 'ERP MOTA'),
('system_currency', 'USD'),
('logo', '');
