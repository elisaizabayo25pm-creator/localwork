<?php
/**
 * LOCALWORK Construction Supply Marketplace
 * XAMPP Database Connection Configuration
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$db   = 'localwork';
$user = 'root';
$pass = ''; // Default XAMPP MySQL password is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // If MySQL connection fails (e.g., database not yet imported in phpMyAdmin),
    // fallback automatically to a local SQLite database in the folder so it never crashes!
    try {
        $sqlitePath = __DIR__ . '/localwork.sqlite';
        $pdo = new PDO("sqlite:" . $sqlitePath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        // Bootstrap tables in SQLite fallback
        $pdo->exec("CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            subcategory TEXT NOT NULL,
            sku TEXT NOT NULL,
            brand TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            unit TEXT NOT NULL,
            pallet_price REAL,
            pallet_quantity INTEGER,
            min_order_qty INTEGER DEFAULT 1,
            weight_lbs REAL NOT NULL,
            astm_standard TEXT,
            stock_quantity INTEGER DEFAULT 100,
            in_stock INTEGER DEFAULT 1,
            featured INTEGER DEFAULT 0,
            rating REAL DEFAULT 5.0,
            review_count INTEGER DEFAULT 10,
            image_url TEXT NOT NULL
        )");

        $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            order_number TEXT NOT NULL,
            user_id TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            company_name TEXT,
            subtotal REAL NOT NULL,
            contractor_discount REAL DEFAULT 0.0,
            freight_cost REAL DEFAULT 45.0,
            tax REAL DEFAULT 0.0,
            total_amount REAL NOT NULL,
            total_weight_lbs REAL NOT NULL,
            status TEXT DEFAULT 'ORDER_PLACED',
            jobsite_name TEXT NOT NULL,
            jobsite_address TEXT NOT NULL,
            gate_number TEXT NOT NULL,
            site_contact_name TEXT NOT NULL,
            site_contact_phone TEXT NOT NULL,
            unloading_method TEXT,
            freight_tier TEXT,
            carrier_vehicle TEXT,
            carrier_driver TEXT,
            carrier_driver_phone TEXT,
            license_plate TEXT,
            progress_pct INTEGER DEFAULT 15,
            eta_minutes INTEGER DEFAULT 45,
            stripe_payment_id TEXT,
            payment_method TEXT,
            created_at TEXT
        )");

        $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            order_id TEXT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'order_status',
            is_read INTEGER DEFAULT 0,
            created_at TEXT
        )");
    } catch (Exception $fallbackEx) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Database connection failed. Please ensure MySQL is started in XAMPP and database localwork is imported.',
            'mysql_error' => $e->getMessage()
        ]);
        exit();
    }
}

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit();
}
