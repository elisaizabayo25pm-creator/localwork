========================================================================
LOCALWORK - Construction Supply & Logistics Platform
XAMPP DEPLOYMENT & HOSTING GUIDE
========================================================================

Follow these 3 quick steps to run LOCALWORK in your local XAMPP environment:

------------------------------------------------------------------------
STEP 1: Copy Files to XAMPP htdocs
------------------------------------------------------------------------
1. Locate your XAMPP installation directory:
   - Windows: C:\xampp\htdocs\
   - macOS: /Applications/XAMPP/htdocs/
   - Linux: /opt/lampp/htdocs/

2. Copy this entire "xampp_export" folder into "htdocs" and rename it to:
   "localwork"
   
   Resulting path:
   C:\xampp\htdocs\localwork\

------------------------------------------------------------------------
STEP 2: Start Apache & MySQL in XAMPP Control Panel
------------------------------------------------------------------------
1. Open the XAMPP Control Panel.
2. Click "Start" next to Apache.
3. Click "Start" next to MySQL.

------------------------------------------------------------------------
STEP 3: Import the Database into phpMyAdmin
------------------------------------------------------------------------
1. In your browser, open:
   http://localhost/phpmyadmin/
2. Click the "Import" tab at the top.
3. Click "Choose File" and select "database.sql" from your localwork folder
   (C:\xampp\htdocs\localwork\database.sql).
4. Scroll down and click "Import" (or "Go").
5. The "localwork" database and all construction catalog tables will be created!

*Note: If you haven't imported database.sql yet, our config/db.php includes an
automatic SQLite fallback so the site will still run smoothly!

------------------------------------------------------------------------
STEP 4: Launch LOCALWORK!
------------------------------------------------------------------------
Open your web browser and navigate to:
http://localhost/localwork/

You will now see:
- Full responsive construction supply storefront
- Building material category filters & search
- Itemized freight cart with payload weight calculation
- Integrated Stripe checkout simulation with test card autofill
- Real-time order tracking dashboard with animated flatbed GPS map
- Push notification alert system & audio radio chime
- Merchant operations portal

========================================================================
Default Contractor Credentials for Demo:
Email: marcus@vanceconstruction.com
Company: Vance Commercial Builders LLC
License: GC-NV-9041284

Merchant Admin Credentials:
Email: admin@localworksupply.com
Company: LocalWork Central Distribution Yard #12
========================================================================
