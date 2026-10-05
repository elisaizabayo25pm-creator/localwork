<?php
/**
 * LOCALWORK - Construction Materials & Building Supply Marketplace
 * Standalone XAMPP Storefront & Dashboard
 */
require_once __DIR__ . '/config/db.php';

// Fetch initial materials
$stmt = $pdo->query("SELECT * FROM products ORDER BY featured DESC, id ASC");
$initialProducts = $stmt->fetchAll();

// Fetch initial orders
$orderStmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
$initialOrders = $orderStmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LOCALWORK - Construction Materials Marketplace (XAMPP)</title>
    <!-- Bootstrap 5 CSS & FontAwesome/Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bs-body-bg: #0a0a0a;
            --bs-body-color: #ededed;
            --lw-amber: #f59e0b;
            --lw-amber-hover: #d97706;
            --lw-surface: #171717;
            --lw-surface-light: #262626;
            --lw-border: #333333;
        }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background-color: var(--bs-body-bg);
            color: var(--bs-body-color);
        }
        .font-display {
            font-family: 'Barlow', system-ui, sans-serif;
        }
        .navbar-custom {
            background-color: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--lw-border);
        }
        .bg-surface {
            background-color: var(--lw-surface);
        }
        .border-custom {
            border-color: var(--lw-border) !important;
        }
        .text-amber {
            color: var(--lw-amber) !important;
        }
        .btn-amber {
            background-color: var(--lw-amber);
            color: #000;
            font-weight: 700;
            border: none;
        }
        .btn-amber:hover {
            background-color: var(--lw-amber-hover);
            color: #000;
        }
        .hero-banner {
            position: relative;
            background: linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.95)), url('assets/images/hero_construction_depot_1791194199359.jpg') center/cover;
            padding: 80px 0;
            border-bottom: 1px solid var(--lw-border);
        }
        .product-card {
            background-color: var(--lw-surface);
            border: 1px solid var(--lw-border);
            border-radius: 12px;
            transition: transform 0.2s, border-color 0.2s;
        }
        .product-card:hover {
            transform: translateY(-2px);
            border-color: #555;
        }
        .product-img {
            height: 200px;
            object-fit: cover;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            background-color: #000;
        }
    </style>
</head>
<body>

    <!-- 1. Top Bar Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
        <div class="container-fluid max-w-7xl px-4">
            <a class="navbar-brand d-flex items-center gap-2 font-display fw-bold text-white fs-4" href="#" onclick="showSection('catalog')">
                <span class="badge bg-warning text-dark px-2 py-1">LW</span>
                LOCALWORK
                <small class="badge bg-dark border border-secondary text-warning ms-2" style="font-size: 10px;">XAMPP EDITION</small>
            </a>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto ms-4">
                    <li class="nav-item">
                        <a class="nav-link active text-white" href="#" onclick="showSection('catalog')">Material Catalog</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white-50" href="#" onclick="showSection('tracking')">Jobsite Tracking</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white-50" href="#" onclick="showSection('merchant')">Merchant Ops</a>
                    </li>
                </ul>
            </div>

            <div class="d-flex align-items-center gap-3">
                <button class="btn btn-outline-secondary position-relative text-white border-custom" onclick="openPushModal()">
                    <i class="bi bi-bell"></i>
                    <span id="notif-dot" class="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"></span>
                </button>

                <button class="btn btn-outline-warning text-white border-custom d-flex align-items-center gap-2" onclick="openCartModal()">
                    <i class="bi bi-truck text-amber"></i>
                    <span class="d-none d-sm-inline">Freight Cart</span>
                    <span id="cart-count-badge" class="badge bg-warning text-dark">0</span>
                </button>

                <span class="badge bg-secondary p-2 d-none d-md-inline">
                    <i class="bi bi-person-fill"></i> Marcus Vance (GC)
                </span>
            </div>
        </div>
    </nav>

    <!-- 2. Hero Section -->
    <section id="hero-sec" class="hero-banner">
        <div class="container py-4">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <div class="text-amber text-uppercase fw-bold small mb-2">
                        Direct Mill & Heavy Supply Network · Hosted on Local XAMPP
                    </div>
                    <h1 class="font-display display-5 fw-bold text-white mb-3">
                        Commercial Construction Materials Delivered to Your Jobsite Gate
                    </h1>
                    <p class="lead text-white-50 mb-4">
                        Portland Cement, #5 Rebar, Kiln-Dried Douglas Fir, and Gypsum Drywall. Managed locally in Apache & MySQL.
                    </p>

                    <div class="input-group mb-3 bg-dark p-1 rounded border border-secondary" style="max-width: 600px;">
                        <span class="input-group-text bg-transparent border-0 text-white-50"><i class="bi bi-search"></i></span>
                        <input type="text" id="live-search" class="form-control bg-transparent border-0 text-white" placeholder="Search materials (e.g. Cement, Rebar, 2x4 Lumber)..." onkeyup="filterLiveProducts()">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 3. Category Filter Tabs -->
    <section class="bg-surface border-bottom border-custom py-3">
        <div class="container d-flex gap-2 overflow-x-auto pb-1">
            <button class="btn btn-sm btn-amber px-3" onclick="setCategoryFilter('All', this)">All Materials</button>
            <button class="btn btn-sm btn-dark border-custom text-white px-3" onclick="setCategoryFilter('Masonry & Cement', this)">Masonry & Cement</button>
            <button class="btn btn-sm btn-dark border-custom text-white px-3" onclick="setCategoryFilter('Framing & Timber', this)">Framing & Timber</button>
            <button class="btn btn-sm btn-dark border-custom text-white px-3" onclick="setCategoryFilter('Structural Steel & Rebar', this)">Structural Steel</button>
            <button class="btn btn-sm btn-dark border-custom text-white px-3" onclick="setCategoryFilter('Drywall & Insulation', this)">Drywall & Gypsum</button>
            <button class="btn btn-sm btn-dark border-custom text-white px-3" onclick="setCategoryFilter('Tools & Jobsite Gear', this)">Jobsite Tools</button>
        </div>
    </section>

    <!-- 4. Products Grid -->
    <main class="container my-5" id="catalog-section">
        <div class="row g-4" id="products-grid">
            <?php foreach ($initialProducts as $p): ?>
                <div class="col-md-6 col-lg-4 product-item" data-category="<?php echo htmlspecialchars($p['category']); ?>" data-name="<?php echo htmlspecialchars(strtolower($p['name'])); ?>">
                    <div class="product-card h-100 d-flex flex-column justify-content-between">
                        <div>
                            <img src="<?php echo htmlspecialchars($p['image_url']); ?>" class="w-100 product-img" alt="<?php echo htmlspecialchars($p['name']); ?>">
                            <div class="p-4">
                                <div class="text-uppercase small text-white-50 fw-semibold mb-1">
                                    <?php echo htmlspecialchars($p['category']); ?> · <span class="text-amber"><?php echo htmlspecialchars($p['brand']); ?></span>
                                </div>
                                <h5 class="fw-bold text-white mb-2"><?php echo htmlspecialchars($p['name']); ?></h5>
                                <div class="text-white-50 small mb-3">
                                    <i class="bi bi-shield-check text-warning"></i> <?php echo htmlspecialchars($p['astm_standard'] ?? 'ASTM Certified'); ?> · <?php echo $p['weight_lbs']; ?> lbs / unit
                                </div>
                                <p class="small text-white-50 line-clamp-2"><?php echo htmlspecialchars($p['description']); ?></p>
                            </div>
                        </div>

                        <div class="p-4 pt-0 border-top border-custom d-flex justify-content-between align-items-center mt-3">
                            <div>
                                <div class="fs-4 fw-bold text-white font-monospace">$<?php echo number_format($p['price'], 2); ?></div>
                                <div class="small text-white-50"><?php echo htmlspecialchars($p['unit']); ?></div>
                            </div>
                            <button class="btn btn-amber btn-sm px-3" onclick="addToCart(<?php echo htmlspecialchars(json_encode($p)); ?>)">
                                <i class="bi bi-plus-lg"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </main>

    <!-- 5. Real-Time Tracking Section -->
    <section class="container my-5 d-none" id="tracking-section">
        <div class="bg-surface border border-custom rounded-4 p-4 p-md-5">
            <div class="d-flex flex-wrap justify-content-between align-items-center pb-4 border-bottom border-custom mb-4">
                <div>
                    <span class="badge bg-warning text-dark font-monospace mb-2">LIVE FREIGHT TELEMETRY</span>
                    <h2 class="font-display fw-bold text-white fs-3 mb-1" id="track-status-title">En Route to Jobsite (Live GPS)</h2>
                    <p class="text-white-50 small mb-0">Destination: Skyline Commercial Tower · Gate 4 · Dave Kowalski (Rig #FL-402)</p>
                </div>
                <div class="d-flex gap-2 mt-3 mt-md-0">
                    <button class="btn btn-amber btn-sm" onclick="advanceOrderStage()"><i class="bi bi-play-fill"></i> Advance Milestone (Simulate)</button>
                </div>
            </div>

            <!-- Animated Map Corridor -->
            <div class="bg-black border border-custom rounded-3 p-4 text-center position-relative mb-4" style="height: 280px; overflow: hidden;">
                <svg viewBox="0 0 600 240" class="w-100 h-100">
                    <path d="M 60 180 Q 200 210, 300 130 T 520 60" fill="none" stroke="#333" stroke-width="8" stroke-linecap="round"/>
                    <path d="M 60 180 Q 200 210, 300 130 T 520 60" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="6 4"/>
                    <circle cx="60" cy="180" r="10" fill="#f59e0b"/>
                    <text x="60" y="210" fill="#999" font-size="11" text-anchor="middle">Central Depot Yard</text>
                    <circle cx="520" cy="60" r="12" fill="#10b981"/>
                    <text x="520" y="40" fill="#34d399" font-size="12" font-weight="bold" text-anchor="middle">Jobsite Gate 4</text>
                    <!-- Animated Truck -->
                    <g id="truck-marker" transform="translate(380, 85)">
                        <circle r="16" fill="#f59e0b" fill-opacity="0.3"/>
                        <circle r="8" fill="#f59e0b"/>
                        <text x="0" y="3" text-anchor="middle" font-size="10">🚛</text>
                    </g>
                </svg>
                <div class="position-absolute bottom-0 start-0 m-3 px-3 py-1 bg-dark rounded border border-secondary small text-warning font-monospace">
                    Speed: 42 MPH · Payload: 8,560 lbs · ETA: 12 Mins
                </div>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <div class="p-3 bg-black rounded border border-custom small">
                        <div class="fw-bold text-white mb-1"><i class="bi bi-truck text-amber"></i> Carrier Assignment</div>
                        <div class="text-white-50">LocalWork Heavy Logistics Flatbed #FL-402 with onboard Moffett Forklift.</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="p-3 bg-black rounded border border-custom small">
                        <div class="fw-bold text-white mb-1"><i class="bi bi-geo-alt text-amber"></i> Jobsite Superintendent</div>
                        <div class="text-white-50">Marcus Vance ((702) 555-0194). Forklift corridor cleared at Gate 4.</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 6. Merchant Ops Section -->
    <section class="container my-5 d-none" id="merchant-section">
        <div class="bg-surface border border-custom rounded-4 p-4 p-md-5">
            <h2 class="font-display fw-bold text-white fs-3 mb-4"><i class="bi bi-shop text-amber"></i> Merchant Yard Operations</h2>
            <div class="row g-3 mb-4">
                <div class="col-sm-6 col-lg-3">
                    <div class="bg-black p-3 rounded border border-custom">
                        <div class="text-white-50 small">Gross Supply Sales</div>
                        <div class="fs-4 fw-bold text-white font-monospace">$18,420.00</div>
                    </div>
                </div>
                <div class="col-sm-6 col-lg-3">
                    <div class="bg-black p-3 rounded border border-custom">
                        <div class="text-white-50 small">Active Flatbed Rigs</div>
                        <div class="fs-4 fw-bold text-amber font-monospace">4 En Route</div>
                    </div>
                </div>
                <div class="col-sm-6 col-lg-3">
                    <div class="bg-black p-3 rounded border border-custom">
                        <div class="text-white-50 small">Total Shipped Weight</div>
                        <div class="fs-4 fw-bold text-white font-monospace">28.4 Tons</div>
                    </div>
                </div>
                <div class="col-sm-6 col-lg-3">
                    <div class="bg-black p-3 rounded border border-custom">
                        <div class="text-white-50 small">Catalog Items</div>
                        <div class="fs-4 fw-bold text-white font-monospace"><?php echo count($initialProducts); ?> SKUs</div>
                    </div>
                </div>
            </div>
            <p class="text-white-50 small">All inventory and sales synchronizing with MySQL table <code>localwork.products</code> and <code>localwork.orders</code>.</p>
        </div>
    </section>

    <!-- 7. Cart & Stripe Modal -->
    <div class="modal fade" id="cartModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-surface border border-custom text-white">
                <div class="modal-header border-custom">
                    <h5 class="modal-title font-display fw-bold"><i class="bi bi-truck text-amber"></i> Jobsite Freight Cart</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="cart-items-list" class="mb-3 small">
                        <p class="text-white-50">Cart is empty. Add construction supplies from the catalog.</p>
                    </div>
                    <div class="p-3 bg-black rounded border border-custom small mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span>Subtotal:</span>
                            <span id="cart-subtotal" class="font-monospace">$0.00</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <span>Freight Flatbed Tier:</span>
                            <span id="cart-freight" class="font-monospace">$45.00</span>
                        </div>
                        <div class="d-flex justify-content-between fw-bold text-amber fs-6 border-top border-secondary pt-2">
                            <span>Total (USD):</span>
                            <span id="cart-total" class="font-monospace">$0.00</span>
                        </div>
                    </div>

                    <!-- Stripe Card Simulation -->
                    <div class="bg-black p-3 rounded border border-custom small mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-amber fw-bold"><i class="bi bi-credit-card"></i> Stripe Payment Gateway</span>
                            <button type="button" class="btn btn-sm btn-outline-info py-0 px-2" style="font-size: 11px;" onclick="autofillCard()">Fill Test Card</button>
                        </div>
                        <input type="text" id="card-num" class="form-control form-control-sm bg-dark text-white border-secondary mb-2" placeholder="4242 4242 4242 4242">
                        <div class="row g-2">
                            <div class="col-6"><input type="text" id="card-exp" class="form-control form-control-sm bg-dark text-white border-secondary" placeholder="12/28"></div>
                            <div class="col-6"><input type="text" id="card-cvc" class="form-control form-control-sm bg-dark text-white border-secondary" placeholder="842"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-custom">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-amber btn-sm px-4" onclick="checkoutOrder()">Pay & Dispatch Rig</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        let cart = [];
        let orderStages = ['ORDER_PLACED', 'RIGGING_PACKED', 'FREIGHT_DISPATCHED', 'EN_ROUTE', 'DELIVERED'];
        let currentStageIdx = 3; // EN_ROUTE

        // Sound Chime using Web Audio API
        function playChime() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch(e){}
        }

        function showSection(name) {
            document.getElementById('catalog-section').classList.toggle('d-none', name !== 'catalog');
            document.getElementById('hero-sec').classList.toggle('d-none', name !== 'catalog');
            document.getElementById('tracking-section').classList.toggle('d-none', name !== 'tracking');
            document.getElementById('merchant-section').classList.toggle('d-none', name !== 'merchant');
        }

        function setCategoryFilter(category, btn) {
            document.querySelectorAll('.bg-surface .btn').forEach(b => b.className = 'btn btn-sm btn-dark border-custom text-white px-3');
            btn.className = 'btn btn-sm btn-amber px-3';

            document.querySelectorAll('.product-item').forEach(item => {
                const cat = item.getAttribute('data-category');
                item.style.display = (category === 'All' || cat === category) ? 'block' : 'none';
            });
        }

        function filterLiveProducts() {
            const query = document.getElementById('live-search').value.toLowerCase();
            document.querySelectorAll('.product-item').forEach(item => {
                const name = item.getAttribute('data-name');
                item.style.display = name.includes(query) ? 'block' : 'none';
            });
        }

        function addToCart(product) {
            cart.push(product);
            document.getElementById('cart-count-badge').innerText = cart.length;
            playChime();
            alert('Allocated ' + product.name + ' to Freight Cart!');
        }

        function openCartModal() {
            const container = document.getElementById('cart-items-list');
            if (cart.length === 0) {
                container.innerHTML = '<p class="text-white-50">Cart is empty. Add construction supplies from the catalog.</p>';
            } else {
                let subtotal = 0;
                let html = '<ul class="list-group list-group-flush bg-transparent">';
                cart.forEach((item, idx) => {
                    subtotal += parseFloat(item.price);
                    html += `<li class="list-group-item bg-transparent text-white border-custom px-0 d-flex justify-content-between">
                        <span>${item.name}</span>
                        <span class="font-monospace text-amber">$${parseFloat(item.price).toFixed(2)}</span>
                    </li>`;
                });
                html += '</ul>';
                container.innerHTML = html;
                document.getElementById('cart-subtotal').innerText = '$' + subtotal.toFixed(2);
                document.getElementById('cart-total').innerText = '$' + (subtotal + 45).toFixed(2);
            }
            new bootstrap.Modal(document.getElementById('cartModal')).show();
        }

        function autofillCard() {
            document.getElementById('card-num').value = '4242 •••• •••• 4242';
            document.getElementById('card-exp').value = '12/28';
            document.getElementById('card-cvc').value = '842';
        }

        function checkoutOrder() {
            if (cart.length === 0) return alert('Your cart is empty');
            playChime();
            alert('Stripe Authorized! Dispatched Freight Flatbed #FL-402 with Moffett Forklift.');
            bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
            cart = [];
            document.getElementById('cart-count-badge').innerText = '0';
            showSection('tracking');
        }

        function advanceOrderStage() {
            currentStageIdx = (currentStageIdx + 1) % orderStages.length;
            const titles = [
                'Order Placed & Material Allocation Locked',
                'Warehouse Rigging & Pallet Strapping Complete',
                'Loaded onto Flatbed & Axle Weighed',
                'En Route to Jobsite (Live GPS Telemetry)',
                'Delivered & Offloaded with Moffett Forklift'
            ];
            document.getElementById('track-status-title').innerText = titles[currentStageIdx];
            playChime();

            // Push Notification
            if (window.Notification && Notification.permission === 'granted') {
                new Notification('Jobsite Order Update', {
                    body: titles[currentStageIdx] + ' for Order #LW-98241',
                    icon: 'assets/images/product_portland_cement_1791194211417.jpg'
                });
            }
        }

        function openPushModal() {
            if (window.Notification) {
                Notification.requestPermission().then(perm => {
                    if (perm === 'granted') {
                        playChime();
                        new Notification('LOCALWORK Alerts Enabled', { body: 'Live jobsite flatbed updates will be delivered directly to your desktop.' });
                    }
                });
            }
        }
    </script>
</body>
</html>
