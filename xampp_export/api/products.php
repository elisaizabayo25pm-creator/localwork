<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            sendJson(['error' => 'Product not found'], 404);
        }
        sendJson(['product' => $product]);
    }

    $category = isset($_GET['category']) ? trim($_GET['category']) : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;
    $sort = isset($_GET['sort']) ? trim($_GET['sort']) : 'featured';

    $sql = "SELECT * FROM products WHERE 1=1";
    $params = [];

    if ($category && $category !== 'All' && $category !== 'All Materials') {
        $sql .= " AND category = ?";
        $params[] = $category;
    }

    if ($search) {
        $sql .= " AND (name LIKE ? OR sku LIKE ? OR brand LIKE ? OR category LIKE ? OR astm_standard LIKE ?)";
        $term = "%$search%";
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    if ($sort === 'price_asc') {
        $sql .= " ORDER BY price ASC";
    } elseif ($sort === 'price_desc') {
        $sql .= " ORDER BY price DESC";
    } elseif ($sort === 'rating') {
        $sql .= " ORDER BY rating DESC";
    } else {
        $sql .= " ORDER BY featured DESC, id ASC";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    sendJson([
        'products' => $products,
        'total' => count($products)
    ]);
} elseif ($method === 'POST') {
    // Add product (Merchant)
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['name'])) {
        sendJson(['error' => 'Product name is required'], 400);
    }

    $id = 'prod-' . time();
    $sql = "INSERT INTO products (id, name, category, subcategory, sku, brand, description, price, unit, pallet_price, pallet_quantity, min_order_qty, weight_lbs, astm_standard, stock_quantity, in_stock, featured, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id,
        $input['name'],
        $input['category'] ?? 'Masonry & Cement',
        $input['subcategory'] ?? 'Commercial Grade',
        $input['sku'] ?? ('SKU-' . rand(1000, 9999)),
        $input['brand'] ?? 'LocalWork Supply',
        $input['description'] ?? '',
        $input['price'] ?? 0.00,
        $input['unit'] ?? 'per unit',
        $input['pallet_price'] ?? null,
        $input['pallet_quantity'] ?? null,
        $input['min_order_qty'] ?? 1,
        $input['weight_lbs'] ?? 50.0,
        $input['astm_standard'] ?? 'ASTM Standard',
        $input['stock_quantity'] ?? 100,
        1,
        0,
        $input['image_url'] ?? 'assets/images/hero_construction_depot_1791194199359.jpg'
    ]);

    sendJson(['success' => true, 'id' => $id], 201);
} else {
    sendJson(['error' => 'Method not allowed'], 405);
}
