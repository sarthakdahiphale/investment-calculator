-- InvestWise MySQL Database Schema
-- Version: 1.0.0

CREATE DATABASE IF NOT EXISTS `investwise_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `investwise_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` INT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `description` TEXT,
  `initial_investment` DOUBLE NOT NULL DEFAULT 0.0,
  `duration` INT NOT NULL DEFAULT 5,
  `discount_rate` DOUBLE NOT NULL DEFAULT 10.0,
  `fixed_costs` DOUBLE DEFAULT 0.0,
  `selling_price` DOUBLE DEFAULT 0.0,
  `variable_cost` DOUBLE DEFAULT 0.0,
  `projected_units` INT DEFAULT 0,
  `is_sample` BOOLEAN DEFAULT FALSE,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_projects_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_projects_category` (`category`),
  INDEX `idx_projects_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Annual Cash Flows Table
CREATE TABLE IF NOT EXISTS `cash_flows` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` VARCHAR(64) NOT NULL,
  `year` INT NOT NULL,
  `inflow` DOUBLE DEFAULT 0.0,
  `outflow` DOUBLE DEFAULT 0.0,
  `note` VARCHAR(255) NULL,
  CONSTRAINT `fk_cashflows_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  INDEX `idx_cashflows_project_year` (`project_id`, `year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
