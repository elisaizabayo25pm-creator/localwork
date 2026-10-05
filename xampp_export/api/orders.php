<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'GET') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? OR order_number = ?");
        $stmt->execute([$id, $id]);
        $order = $stmt->fetch();

        if (!$order) {
            sendJson(['error' => 'Order not found'], 404);
        }

        // Get items
        $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$order['id']]);
        $order['items'] = $itemStmt->fetchAll();

        sendJson(['order' => $order]);
    }

    $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
    $orders = $stmt->fetchAll();

    foreach ($orders as &$ord) {
        $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$ord['id']]);
        $ord['items'] = $itemStmt->fetchAll();
    }

    sendJson(['orders' => $orders]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'advance_status') {
        $orderId = isset($_GET['id']) ? $_GET['id'] : ($input['id'] ?? null);
        if (!$orderId) {
            sendJson(['error' => 'Order ID is required'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? OR order_number = ?");
        $stmt->execute([$orderId, $orderId]);
        $order = $stmt->fetch();

        if (!$order) {
            sendJson(['error' => 'Order not found'], 404);
        }

        $stages = [
            'ORDER_PLACED' => ['next' => 'RIGGING_PACKED', 'pct' => 35, 'eta' => 60, 'label' => 'Warehouse Rigging & Pallet Strapping'],
            'RIGGING_PACKED' => ['next' => 'FREIGHT_DISPATCHED', 'pct' => 60, 'eta' => 35, 'label' => 'Loaded onto Flatbed & Axle Weighed'],
            'FREIGHT_DISPATCHED' => ['next' => 'EN_ROUTE', 'pct' => 85, 'eta' => 12, 'label' => 'En Route to Jobsite (Live GPS)'],
            'EN_ROUTE' => ['next' => 'DELIVERED', 'pct' => 100, 'eta' => 0, 'label' => 'Delivered & Moffett Offloaded at Gate'],
            'DELIVERED' => ['next' => 'DELIVERED', 'pct' => 100, 'eta' => 0, 'label' => 'Delivery Complete']
        ];

        $currentStatus = $order['status'];
        $nextInfo = $stages[$currentStatus] ?? $stages['ORDER_PLACED'];
        $nextStatus = $input['nextStatus'] ?? $nextInfo['next'];
        $progressPct = $nextInfo['pct'];
        $etaMinutes = $nextInfo['eta'];

        $updateStmt = $pdo->prepare("UPDATE orders SET status = ?, progress_pct = ?, eta_minutes = ? WHERE id = ?");
        $updateStmt->execute([$nextStatus, $progressPct, $etaMinutes, $order['id']]);

        // Create notification
        $notifId = 'notif-' . time();
        $notifTitle = "Order #{$order['order_number']}: {$nextInfo['label']}";
        $notifMsg = "Your shipment of {$order['total_weight_lbs']} lbs has progressed to: {$nextInfo['label']}.";
        
        $notifStmt = $pdo->prepare("INSERT INTO notifications (id, user_id, order_id, title, message, type) VALUES (?, ?, ?, ?, ?, ?)");
        $notifStmt->execute([$notifId, $order['user_id'], $order['id'], $notifTitle, $notifMsg, 'order_status']);

        sendJson([
            'success' => true,
            'status' => $nextStatus,
            'progress_pct' => $progressPct,
            'eta_minutes' => $etaMinutes,
            'notification' => [
                'id' => $notifId,
                'title' => $notifTitle,
                'message' => $notifMsg
            ]
        ]);
    } else {
        // Create new order
        if (empty($input['items'])) {
            sendJson(['error' => 'Order items are required'], 400);
        }

        $orderNum = 'LW-' . rand(10000, 99999);
        $orderId = 'ord-lw-' . rand(10000, 99999);

        $sql = "INSERT INTO orders (id, order_number, user_id, customer_name, customer_email, company_name, subtotal, contractor_discount, freight_cost, tax, total_amount, total_weight_lbs, status, jobsite_name, jobsite_address, gate_number, site_contact_name, site_contact_phone, unloading_method, freight_tier, stripe_payment_id, payment_method)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ORDER_PLACED', ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $orderId,
            $orderNum,
            $input['userId'] ?? 'usr-contractor-01',
            $input['customerName'] ?? 'Marcus Vance',
            $input['customerEmail'] ?? 'marcus@vanceconstruction.com',
            $input['companyName'] ?? 'Vance Commercial Builders LLC',
            $input['subtotal'] ?? 0.00,
            $input['contractorDiscount'] ?? 0.00,
            $input['freightCost'] ?? 45.00,
            $input['tax'] ?? 0.00,
            $input['totalAmount'] ?? 0.00,
            $input['totalWeightLbs'] ?? 0.00,
            $input['deliveryDetails']['jobsiteName'] ?? 'Skyline Tower Jobsite',
            $input['deliveryDetails']['jobsiteAddress'] ?? '742 Evergreen Terr',
            $input['deliveryDetails']['gateNumber'] ?? 'Gate 4',
            $input['deliveryDetails']['siteContactName'] ?? 'Marcus Vance',
            $input['deliveryDetails']['siteContactPhone'] ?? '(702) 555-0194',
            $input['deliveryDetails']['unloadingMethod'] ?? 'moffett_truck',
            $input['deliveryDetails']['freightTier'] ?? 'heavy_freight_boom',
            $input['stripePaymentId'] ?? ('pi_lw_' . time()),
            $input['paymentMethod'] ?? 'Stripe Card (Visa •••• 4242)'
        ]);

        // Insert items
        foreach ($input['items'] as $item) {
            $itemSql = "INSERT INTO order_items (order_id, product_id, product_name, sku, unit, unit_price, quantity, is_pallet, total_weight_lbs, total_price, image_url)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $pdo->prepare($itemSql)->execute([
                $orderId,
                $item['productId'] ?? 'prod-1',
                $item['productName'] ?? 'Building Material',
                $item['sku'] ?? 'SKU-001',
                $item['unit'] ?? 'per unit',
                $item['unitPrice'] ?? 0.00,
                $item['quantity'] ?? 1,
                !empty($item['isPallet']) ? 1 : 0,
                $item['totalWeightLbs'] ?? 50.0,
                $item['totalPrice'] ?? 0.00,
                $item['imageUrl'] ?? 'assets/images/hero_construction_depot_1791194199359.jpg'
            ]);
        }

        sendJson([
            'success' => true,
            'order' => [
                'id' => $orderId,
                'orderNumber' => $orderNum
            ]
        ], 201);
    }
}
