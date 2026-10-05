-- ========================================================
-- LOCALWORK Construction Supply Marketplace Database
-- Compatible with XAMPP MySQL / MariaDB and phpMyAdmin
-- ========================================================

CREATE DATABASE IF NOT EXISTS `localwork` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `localwork`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL DEFAULT '$2y$10$abcdefghijklmnopqrstuvwxyz123456',
  `role` ENUM('contractor', 'subcontractor', 'project_manager', 'merchant', 'homeowner') NOT NULL DEFAULT 'contractor',
  `company_name` VARCHAR(128) NULL,
  `contractor_license` VARCHAR(64) NULL,
  `phone` VARCHAR(32) NULL,
  `delivery_address` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(64) NOT NULL UNIQUE,
  `description` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `subcategory` VARCHAR(64) NOT NULL,
  `sku` VARCHAR(64) NOT NULL UNIQUE,
  `brand` VARCHAR(128) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `unit` VARCHAR(64) NOT NULL,
  `pallet_price` DECIMAL(10,2) NULL,
  `pallet_quantity` INT NULL,
  `min_order_qty` INT NOT NULL DEFAULT 1,
  `weight_lbs` DECIMAL(10,2) NOT NULL,
  `astm_standard` VARCHAR(128) NULL,
  `stock_quantity` INT NOT NULL DEFAULT 100,
  `in_stock` TINYINT(1) NOT NULL DEFAULT 1,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.0,
  `review_count` INT NOT NULL DEFAULT 10,
  `image_url` VARCHAR(255) NOT NULL,
  `specifications_json` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `order_number` VARCHAR(32) NOT NULL UNIQUE,
  `user_id` VARCHAR(64) NOT NULL,
  `customer_name` VARCHAR(128) NOT NULL,
  `customer_email` VARCHAR(128) NOT NULL,
  `company_name` VARCHAR(128) NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `contractor_discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `freight_cost` DECIMAL(10,2) NOT NULL DEFAULT 45.00,
  `tax` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `total_weight_lbs` DECIMAL(10,2) NOT NULL,
  `status` ENUM('ORDER_PLACED', 'RIGGING_PACKED', 'FREIGHT_DISPATCHED', 'EN_ROUTE', 'DELIVERED') NOT NULL DEFAULT 'ORDER_PLACED',
  `jobsite_name` VARCHAR(128) NOT NULL,
  `jobsite_address` TEXT NOT NULL,
  `gate_number` VARCHAR(64) NOT NULL,
  `site_contact_name` VARCHAR(128) NOT NULL,
  `site_contact_phone` VARCHAR(32) NOT NULL,
  `unloading_method` VARCHAR(64) NOT NULL DEFAULT 'moffett_truck',
  `freight_tier` VARCHAR(64) NOT NULL DEFAULT 'heavy_freight_boom',
  `carrier_vehicle` VARCHAR(128) NOT NULL DEFAULT 'Freightliner M2 106 Flatbed Crane Rig',
  `carrier_driver` VARCHAR(128) NOT NULL DEFAULT 'Dave Kowalski (Class A CDL)',
  `carrier_driver_phone` VARCHAR(32) NOT NULL DEFAULT '(702) 555-0721',
  `license_plate` VARCHAR(32) NOT NULL DEFAULT 'COMM-9284-NV',
  `progress_pct` INT NOT NULL DEFAULT 15,
  `eta_minutes` INT NOT NULL DEFAULT 45,
  `stripe_payment_id` VARCHAR(128) NOT NULL,
  `payment_method` VARCHAR(64) NOT NULL,
  `paid_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(64) NOT NULL,
  `unit` VARCHAR(64) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `is_pallet` TINYINT(1) NOT NULL DEFAULT 0,
  `total_weight_lbs` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(32) NOT NULL DEFAULT 'order_status',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- Seed Initial Demo Data
-- ========================================================

-- Insert Demo Users
INSERT INTO `users` (`id`, `name`, `email`, `role`, `company_name`, `contractor_license`, `phone`, `delivery_address`)
VALUES
('usr-contractor-01', 'Marcus Vance', 'marcus@vanceconstruction.com', 'contractor', 'Vance Commercial Builders LLC', 'GC-NV-9041284', '(702) 555-0194', '742 Evergreen Terr, Jobsite Gate 4, Sector B'),
('usr-merchant-01', 'Sarah Lin', 'admin@localworksupply.com', 'merchant', 'LocalWork Central Distribution Yard #12', 'SUPPLIER-LIC-20419', '(702) 555-0810', 'Distribution Depot Yard 12, Terminal Way')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Insert Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`)
VALUES
('cat-1', 'Masonry & Cement', 'masonry-cement', 'Heavy hydraulic Portland cements, mortar, sand, and cinder blocks.'),
('cat-2', 'Framing & Timber', 'framing-timber', 'Kiln-dried Douglas Fir framing lumber, plywood, and structural timber.'),
('cat-3', 'Structural Steel & Rebar', 'structural-steel', 'ASTM Grade 60 reinforcing rebar, mesh, and steel tie components.'),
('cat-4', 'Drywall & Insulation', 'drywall-insulation', 'Type X fire-rated gypsum wallboard, fiberglass batt insulation.'),
('cat-5', 'Roofing & Waterproofing', 'roofing-waterproofing', 'Architectural shingles, underlayment membranes, flashings.'),
('cat-6', 'Plumbing & Drainage', 'plumbing-drainage', 'Schedule 40 PVC conduit, drainage tubing, sewer fixtures.'),
('cat-7', 'Fasteners & Hardware', 'fasteners-hardware', 'Structural lag screws, framing nails, hurricane ties.'),
('cat-8', 'Tools & Jobsite Gear', 'tools-jobsite-gear', 'Heavy rotary hammers, concrete vibrators, laser levels.')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Insert Construction Products
INSERT INTO `products` (`id`, `name`, `category`, `subcategory`, `sku`, `brand`, `description`, `price`, `unit`, `pallet_price`, `pallet_quantity`, `min_order_qty`, `weight_lbs`, `astm_standard`, `stock_quantity`, `in_stock`, `featured`, `rating`, `review_count`, `image_url`, `specifications_json`)
VALUES
('prod-cement-01', 'Type I/II Portland Cement (94 lb Bag)', 'Masonry & Cement', 'Hydraulic Cement', 'CEM-POR-94', 'Lehigh Hanson / Quikrete Spec', 'General purpose heavy-duty Portland cement engineered for structural concrete pours, precast elements, mortar, and grouts. Compliant with ASTM C150 specs with rapid initial set.', 18.50, 'per 94lb bag', 666.00, 40, 1, 94.00, 'ASTM C150 / AASHTO M85', 480, 1, 1, 4.90, 142, 'assets/images/product_portland_cement_1791194211417.jpg', '{"Compressive Strength (28d)": "4,200+ PSI", "Initial Set Time": "90–120 minutes", "Bag Weight": "94 lbs", "Compliance": "ASTM C150 Type I/II"}'),

('prod-timber-01', 'Douglas Fir 2x4 Kiln-Dried #2 Framing Stud (16 ft)', 'Framing & Timber', 'Dimensional Lumber', 'LBR-DF-2416', 'Weyerhaeuser Premium Select', 'Premium structural grade kiln-dried Douglas Fir framing lumber. Milled straight with minimal crown, high load-bearing shear strength, ideal for load-bearing walls.', 9.85, 'per 16ft piece', 1720.00, 208, 5, 18.20, 'ASTM D1990 / NLGA Graded', 1250, 1, 1, 4.80, 98, 'assets/images/product_structural_timber_1791194221203.jpg', '{"Nominal Dimensions": "2 in. x 4 in. x 16 ft.", "Moisture Content": "KD-19", "Species": "Douglas Fir-Larch"}'),

('prod-steel-01', '#5 (5/8") Grade 60 Deformed Steel Rebar (20 ft Rod)', 'Structural Steel & Rebar', 'Reinforcing Steel', 'REB-GR60-0520', 'Nucor Steel Mill', 'High-tensile hot-rolled ASTM A615 Grade 60 deformed rebar. Essential for structural footings, grade beams, retaining walls, slab reinforcement, and bridge decking.', 24.50, 'per 20ft rod', 2200.00, 100, 10, 20.80, 'ASTM A615 / A615M Grade 60', 840, 1, 1, 5.00, 76, 'assets/images/product_steel_rebar_1791194232380.jpg', '{"Bar Size": "#5 (0.625 in.)", "Yield Strength": "60,000 PSI", "Length": "20 ft."}'),

('prod-tools-01', 'Industrial 20V SDS-Plus Brushless Rotary Hammer Kit', 'Tools & Jobsite Gear', 'Concrete Power Tools', 'TLS-SDS-20V', 'DeWalt Industrial Jobsite Series', 'Heavy-duty 1-1/8 inch brushless SDS-Plus rotary hammer delivering 2.6 Joules of impact energy. Includes 2x 6.0Ah batteries, rapid dual charger, and TSTAK hard case.', 389.00, 'per complete kit', NULL, NULL, 1, 14.50, 'ANSI / OSHA Table 1 Dust Ready', 65, 1, 1, 4.90, 215, 'assets/images/product_contractor_tools_1791194242153.jpg', '{"Impact Energy": "2.6 Joules", "Motor": "Brushless Magnet", "Battery System": "20V MAX* XR 6.0Ah"}'),

('prod-masonry-02', 'Spec-Mix Type S Structural Mortar (80 lb Bag)', 'Masonry & Cement', 'Pre-blended Mortar', 'MOR-TYP-S80', 'Spec-Mix Factory Engineered', 'High-strength structural mortar for laying concrete block, load-bearing brick, stone veneer, and foundation masonry.', 14.75, 'per 80lb bag', 560.00, 42, 4, 80.00, 'ASTM C270 / ASTM C1714', 360, 1, 0, 4.70, 54, 'assets/images/product_portland_cement_1791194211417.jpg', '{"Strength Rating": "Type S (1,800 PSI at 28 days)", "Bag Weight": "80 lbs"}'),

('prod-drywall-01', '5/8 in. x 4 ft. x 8 ft. Type X Fire-Rated Drywall Sheet', 'Drywall & Insulation', 'Gypsum Panels', 'DW-TYPX-5848', 'USG Sheetrock EcoSmart', 'UL-classified 5/8" fire-rated gypsum wallboard designed for commercial partition walls, shaftwalls, and garage ceilings requiring 1-hour to 2-hour fire endurance ratings.', 21.20, 'per 4x8 sheet', 650.00, 34, 6, 70.40, 'ASTM C1396 / UL Type X', 520, 1, 0, 4.80, 68, 'assets/images/hero_construction_depot_1791194199359.jpg', '{"Thickness": "5/8 inch", "Dimensions": "4 ft. x 8 ft.", "Fire Rating": "UL Type X"}')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Insert Sample Active Order
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_name`, `customer_email`, `company_name`, `subtotal`, `contractor_discount`, `freight_cost`, `tax`, `total_amount`, `total_weight_lbs`, `status`, `jobsite_name`, `jobsite_address`, `gate_number`, `site_contact_name`, `site_contact_phone`, `unloading_method`, `freight_tier`, `carrier_vehicle`, `carrier_driver`, `carrier_driver_phone`, `license_plate`, `progress_pct`, `eta_minutes`, `stripe_payment_id`, `payment_method`)
VALUES
('ord-lw-98241', 'LW-98241', 'usr-contractor-01', 'Marcus Vance', 'marcus@vanceconstruction.com', 'Vance Commercial Builders LLC', 2432.00, 243.20, 240.00, 197.80, 2626.60, 8560.00, 'EN_ROUTE', 'Skyline Commercial Tower - Phase II', '742 Evergreen Terr, Sector B', 'Gate 4 (South Heavy Freight Entry)', 'Marcus Vance (Superintendent)', '(702) 555-0194', 'moffett_truck', 'heavy_freight_boom', 'Freightliner M2 106 Flatbed Crane Rig', 'Dave Kowalski (Class A CDL)', '(702) 555-0721', 'COMM-9284-NV', 78, 12, 'pi_3LW98241_sim_stripe_contractor', 'Stripe Card (Visa •••• 4242)')
ON DUPLICATE KEY UPDATE `order_number`=VALUES(`order_number`);

-- Insert Order Items
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `sku`, `unit`, `unit_price`, `quantity`, `is_pallet`, `total_weight_lbs`, `total_price`, `image_url`)
VALUES
('ord-lw-98241', 'prod-cement-01', 'Type I/II Portland Cement (94 lb Bag)', 'CEM-POR-94', 'per 94lb bag', 16.65, 80, 1, 7520.00, 1332.00, 'assets/images/product_portland_cement_1791194211417.jpg'),
('ord-lw-98241', 'prod-steel-01', '#5 (5/8") Grade 60 Deformed Steel Rebar (20 ft Rod)', 'REB-GR60-0520', 'per 20ft rod', 22.00, 50, 0, 1040.00, 1100.00, 'assets/images/product_steel_rebar_1791194232380.jpg');

-- Insert Initial Push Notifications
INSERT INTO `notifications` (`id`, `user_id`, `order_id`, `title`, `message`, `type`, `is_read`)
VALUES
('notif-01', 'usr-contractor-01', 'ord-lw-98241', 'Flatbed Freight Dispatched', 'Your order #LW-98241 (8,560 lbs of Portland Cement & Steel Rebar) has left the depot with driver Dave Kowalski.', 'dispatch', 0),
('notif-02', 'usr-contractor-01', 'ord-lw-98241', 'Approaching Jobsite Gate 4', 'Flatbed Rig #FL-402 is 12 minutes away from Skyline Tower Phase II. Please ensure heavy forklift corridor is clear.', 'order_status', 0);
