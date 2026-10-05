<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['userId'] ?? 'usr-contractor-01';
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();

    $unread = 0;
    foreach ($notifications as $n) {
        if (empty($n['is_read'])) $unread++;
    }

    sendJson([
        'notifications' => $notifications,
        'unreadCount' => $unread
    ]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? ($input['action'] ?? '');

    if ($action === 'read_all') {
        $userId = $input['userId'] ?? 'usr-contractor-01';
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->execute([$userId]);
        sendJson(['success' => true]);
    } else {
        // Test Push
        $id = 'notif-' . time();
        $userId = $input['userId'] ?? 'usr-contractor-01';
        $title = $input['title'] ?? 'Jobsite Flatbed Alert';
        $message = $input['message'] ?? 'Truck #FL-402 is arriving in 5 minutes at Jobsite Gate 4. Clear the unloading zone.';

        $stmt = $pdo->prepare("INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)");
        $stmt->execute([$id, $userId, $title, $message, 'dispatch']);

        sendJson([
            'notification' => [
                'id' => $id,
                'title' => $title,
                'message' => $message
            ]
        ]);
    }
}
