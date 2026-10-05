<?php
require_once __DIR__ . '/../config/db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'create_intent';
$input = json_decode(file_get_contents('php://input'), true);

if ($action === 'create_intent') {
    $items = $input['items'] ?? [];
    if (empty($items)) {
        sendJson(['error' => 'No items for checkout'], 400);
    }

    $subtotal = 0;
    $totalWeightLbs = 0;

    foreach ($items as $item) {
        $price = !empty($item['isPallet']) && !empty($item['product']['pallet_price'])
            ? (float)$item['product']['pallet_price']
            : (float)($item['product']['price'] ?? 0);
        $qty = (int)($item['quantity'] ?? 1);
        $unitWeight = !empty($item['isPallet']) && !empty($item['product']['pallet_quantity'])
            ? (float)$item['product']['weight_lbs'] * (int)$item['product']['pallet_quantity']
            : (float)($item['product']['weight_lbs'] ?? 50);

        $subtotal += ($price * $qty);
        $totalWeightLbs += ($unitWeight * $qty);
    }

    // 10% Contractor trade discount over $1,000
    $discount = $subtotal > 1000 ? ($subtotal * 0.10) : 0.0;

    // Freight tier based on construction weight
    $freightCost = 45.00;
    if ($totalWeightLbs > 2000) {
        $freightCost = 240.00; // Flatbed with Moffett forklift offloader
    } elseif ($totalWeightLbs > 500) {
        $freightCost = 120.00; // Medium stakebed
    }

    $tax = ($subtotal - $discount) * 0.0825;
    $total = $subtotal - $discount + $freightCost + $tax;

    $intentId = 'pi_lw_' . time() . '_' . substr(md5(rand()), 0, 7);

    sendJson([
        'id' => $intentId,
        'clientSecret' => $intentId . '_secret_' . substr(md5(rand()), 0, 10),
        'amount' => (int)round($total * 100),
        'currency' => 'usd',
        'breakdown' => [
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'freight' => round($freightCost, 2),
            'tax' => round($tax, 2),
            'total' => round($total, 2),
            'totalWeightLbs' => round($totalWeightLbs)
        ]
    ]);
} elseif ($action === 'confirm') {
    // Process payment and record order
    $paymentIntentId = $input['paymentIntentId'] ?? ('pi_' . time());
    $orderData = $input['orderData'] ?? null;

    if (!$orderData) {
        sendJson(['error' => 'Missing order data'], 400);
    }

    // Redirect or create order
    require_once __DIR__ . '/orders.php';
} else {
    sendJson(['error' => 'Invalid action'], 400);
}
