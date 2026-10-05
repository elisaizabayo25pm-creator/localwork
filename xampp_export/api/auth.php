<?php
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? 'login';
$input = json_decode(file_get_contents('php://input'), true);

if ($action === 'login') {
    $email = $input['email'] ?? '';
    if (empty($email)) {
        sendJson(['error' => 'Email is required'], 400);
    }

    $stmt = $pdo->prepare("SELECT id, name, email, role, company_name, contractor_license, phone, delivery_address FROM users WHERE LOWER(email) = LOWER(?)");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // If not found, return demo user for instant XAMPP testing
        $user = [
            'id' => 'usr-contractor-01',
            'name' => 'Marcus Vance',
            'email' => $email,
            'role' => 'contractor',
            'company_name' => 'Vance Commercial Builders LLC',
            'contractor_license' => 'GC-NV-9041284',
            'phone' => '(702) 555-0194',
            'delivery_address' => '742 Evergreen Terr, Jobsite Gate 4, Sector B'
        ];
    }

    sendJson([
        'user' => $user,
        'token' => 'lw_token_' . $user['id'] . '_' . time()
    ]);
} elseif ($action === 'register') {
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';

    if (empty($name) || empty($email)) {
        sendJson(['error' => 'Name and email are required'], 400);
    }

    $id = 'usr-' . time();
    $sql = "INSERT INTO users (id, name, email, role, company_name, contractor_license, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id,
        $name,
        $email,
        $input['role'] ?? 'contractor',
        $input['companyName'] ?? '',
        $input['contractorLicense'] ?? '',
        $input['phone'] ?? ''
    ]);

    sendJson([
        'user' => [
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'role' => $input['role'] ?? 'contractor',
            'company_name' => $input['companyName'] ?? ''
        ],
        'token' => 'lw_token_' . $id . '_' . time()
    ], 201);
} elseif ($action === 'me') {
    $user = [
        'id' => 'usr-contractor-01',
        'name' => 'Marcus Vance',
        'email' => 'marcus@vanceconstruction.com',
        'role' => 'contractor',
        'company_name' => 'Vance Commercial Builders LLC',
        'contractor_license' => 'GC-NV-9041284',
        'phone' => '(702) 555-0194',
        'delivery_address' => '742 Evergreen Terr, Jobsite Gate 4, Sector B'
    ];
    sendJson(['user' => $user]);
}
