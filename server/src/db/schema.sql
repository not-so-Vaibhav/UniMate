-- =======================================================
-- UniMate Database Schema - Canonical Production Schema
-- Supports Phase 1, Phase 2 & Phase 3 (13 Tables)
-- =======================================================

CREATE DATABASE IF NOT EXISTS `unimate_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `unimate_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role` ENUM('student', 'operator', 'admin') NOT NULL DEFAULT 'student',
  `operator_service` ENUM('canteen', 'printing', 'general') NULL,
  `student_id` VARCHAR(50) NULL,
  `phone` VARCHAR(20) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Campus Locations (Searchable verified campus places)
CREATE TABLE IF NOT EXISTS `campus_locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `category` VARCHAR(50) NOT NULL,
  `building` VARCHAR(100) NOT NULL,
  `floor` VARCHAR(20) NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `classification` ENUM('DEVELOPMENT_SAMPLE', 'PENDING_VERIFICATION', 'OFFICIAL_VERIFIED') NOT NULL DEFAULT 'DEVELOPMENT_SAMPLE',
  `source_reference` VARCHAR(255) NULL,
  `verified_by_user_id` INT NULL,
  `verified_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_locations_category` (`category`),
  INDEX `idx_locations_building` (`building`),
  INDEX `idx_locations_classification` (`classification`),
  CONSTRAINT `fk_loc_verifier` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Canteen Menu Items
CREATE TABLE IF NOT EXISTS `canteen_menu_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `description` TEXT NULL,
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `classification` ENUM('DEVELOPMENT_SAMPLE', 'PENDING_VERIFICATION', 'OFFICIAL_VERIFIED') NOT NULL DEFAULT 'DEVELOPMENT_SAMPLE',
  `source_reference` VARCHAR(255) NULL,
  `verified_by_user_id` INT NULL,
  `verified_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_menu_category` (`category`),
  INDEX `idx_menu_availability` (`is_available`),
  INDEX `idx_menu_classification` (`classification`),
  CONSTRAINT `fk_menu_verifier` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Canteen Orders
CREATE TABLE IF NOT EXISTS `canteen_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `status` ENUM('placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected') NOT NULL DEFAULT 'placed',
  `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`),
  CONSTRAINT `fk_canteen_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Canteen Order Items
CREATE TABLE IF NOT EXISTS `canteen_order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `menu_item_id` INT NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `canteen_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_item` FOREIGN KEY (`menu_item_id`) REFERENCES `canteen_menu_items` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Uploaded Files Metadata (Private access control)
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL UNIQUE,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size_bytes` BIGINT NOT NULL,
  `storage_path` VARCHAR(255) NOT NULL,
  `purpose` VARCHAR(50) NOT NULL DEFAULT 'printing',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_files_user` (`user_id`),
  CONSTRAINT `fk_files_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Print Requests
CREATE TABLE IF NOT EXISTS `print_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `file_id` INT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `pages_count` INT NOT NULL DEFAULT 1,
  `copies_count` INT NOT NULL DEFAULT 1,
  `color_mode` ENUM('bw', 'color') NOT NULL DEFAULT 'bw',
  `print_type` ENUM('single_sided', 'double_sided') NOT NULL DEFAULT 'double_sided',
  `status` ENUM('submitted', 'accepted', 'in_progress', 'ready', 'collected', 'completed', 'cancelled', 'rejected') NOT NULL DEFAULT 'submitted',
  `operator_id` INT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_print_user` (`user_id`),
  INDEX `idx_print_status` (`status`),
  CONSTRAINT `fk_print_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_print_file` FOREIGN KEY (`file_id`) REFERENCES `uploaded_files` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_print_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Lost and Found Items
CREATE TABLE IF NOT EXISTS `lost_found_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_type` ENUM('lost', 'found') NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `location_id` INT NULL,
  `location_detail` VARCHAR(255) NULL,
  `date_occurred` DATE NOT NULL,
  `contact_info` VARCHAR(255) NULL,
  `status` ENUM('reported', 'claimed', 'resolved', 'closed') NOT NULL DEFAULT 'reported',
  `reported_by_user_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_lf_type` (`item_type`),
  INDEX `idx_lf_status` (`status`),
  INDEX `idx_lf_reporter` (`reported_by_user_id`),
  CONSTRAINT `fk_lf_reporter` FOREIGN KEY (`reported_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_lf_location` FOREIGN KEY (`location_id`) REFERENCES `campus_locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Status Audit History
CREATE TABLE IF NOT EXISTS `status_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `entity_type` ENUM('canteen_order', 'print_request', 'lost_found_item') NOT NULL,
  `entity_id` INT NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `changed_by_user_id` INT NOT NULL,
  `comment` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_entity` (`entity_type`, `entity_id`),
  CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Assistant Conversations
CREATE TABLE IF NOT EXISTS `assistant_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT 'New Campus Inquiry',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_assistant_conv_user` (`user_id`),
  CONSTRAINT `fk_assistant_conv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Assistant Messages
CREATE TABLE IF NOT EXISTS `assistant_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender` ENUM('user', 'assistant') NOT NULL,
  `content` TEXT NOT NULL,
  `sources` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_assistant_msg_conv` (`conversation_id`),
  CONSTRAINT `fk_assistant_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `assistant_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Knowledge Documents (Campus Knowledge Base & Provenance)
CREATE TABLE IF NOT EXISTS `knowledge_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `source_reference` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `key_points` JSON NULL,
  `keywords` JSON NULL,
  `classification` ENUM('DEVELOPMENT_SAMPLE', 'PENDING_VERIFICATION', 'OFFICIAL_VERIFIED', 'RETIRED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `is_published` BOOLEAN NOT NULL DEFAULT FALSE,
  `verified_by_user_id` INT NULL,
  `verified_at` TIMESTAMP NULL,
  `version` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_kb_category` (`category`),
  INDEX `idx_kb_classification` (`classification`),
  INDEX `idx_kb_published` (`is_published`),
  CONSTRAINT `fk_kb_verifier` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Knowledge Document Revisions (Audit Trail)
CREATE TABLE IF NOT EXISTS `knowledge_document_revisions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `document_id` INT NOT NULL,
  `version` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `key_points` JSON NULL,
  `changed_by_user_id` INT NOT NULL,
  `change_reason` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_kbr_doc` (`document_id`),
  CONSTRAINT `fk_kbr_doc` FOREIGN KEY (`document_id`) REFERENCES `knowledge_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kbr_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
