# seed_odoo_backend.py
"""
Script to populate real sample/dummy business data into Odoo backend via XML-RPC / JSON-RPC API.
Seeds Customers, Vendors, Products, Sales Orders, Purchase Orders, and Stock.
"""

import sys
import xmlrpc.client
import ssl

def seed_odoo(url, db, login, api_key):
    print(f"Connecting to Odoo Server: {url} (DB: {db}, Login: {login})...")
    
    # 1. SSL Context & Connection
    context = ssl._create_unverified_context()
    common = xmlrpc.client.ServerProxy(f"{url.rstrip('/')}/xmlrpc/2/common", context=context)
    models = xmlrpc.client.ServerProxy(f"{url.rstrip('/')}/xmlrpc/2/object", context=context)

    # 2. Authenticate
    try:
        uid = common.authenticate(db, login, api_key, {})
        if not uid:
            print("❌ Authentication failed! Please verify your Login Email and API Key.")
            return False
        print(f"✅ Authentication successful! User ID: {uid}")
    except Exception as e:
        print(f"❌ Connection error during authentication: {e}")
        return False

    # 3. Create / Find Customers & Vendors (res.partner)
    print("\n--- 1. Seeding Customers & Vendors (res.partner) ---")
    partners_to_create = [
        {"name": "মেসার্স রহিম অ্যান্ড ব্রাদার্স", "customer_rank": 1, "supplier_rank": 0, "city": "ঢাকা", "email": "rahim.brothers@example.com"},
        {"name": "প্রগতি টেক্সটাইলস লিমিটেড", "customer_rank": 1, "supplier_rank": 0, "city": "গাজীপুর", "email": "progoti.tex@example.com"},
        {"name": "আলিফ সুপারশপ ধানমন্ডি", "customer_rank": 1, "supplier_rank": 0, "city": "ঢাকা", "email": "alif.super@example.com"},
        {"name": "পদ্মা ইম্পোর্ট অ্যান্ড এক্সপোর্ট", "customer_rank": 0, "supplier_rank": 1, "city": "চট্টগ্রাম", "email": "padma.imports@example.com"},
        {"name": "যমুনা সাপ্লাই অ্যান্ড ম্যানুফ্যাকচারিং", "customer_rank": 0, "supplier_rank": 1, "city": "নারায়ণগঞ্জ", "email": "jamuna.supply@example.com"},
    ]

    partner_ids = {}
    for p in partners_to_create:
        try:
            # Check if exists
            existing = models.execute_kw(db, uid, api_key, 'res.partner', 'search', [[['name', '=', p['name']]]])
            if existing:
                p_id = existing[0]
                print(f"  • Existing Partner: {p['name']} (ID: {p_id})")
            else:
                p_id = models.execute_kw(db, uid, api_key, 'res.partner', 'create', [p])
                print(f"  + Created Partner: {p['name']} (ID: {p_id})")
            partner_ids[p['name']] = p_id
        except Exception as e:
            print(f"  ⚠ Partner {p['name']} warning: {e}")

    # 4. Create / Find Products (product.template)
    print("\n--- 2. Seeding Products & Inventory (product.template) ---")
    products_to_create = [
        {"name": "প্রিমিয়াম বাসমতী চাল (৫০ কেজি)", "default_code": "RICE-BAS-50", "list_price": 4650.0, "standard_price": 3800.0, "type": "consu"},
        {"name": "রিফাইন্ড সয়াবিন তেল (৫ লিটার জার)", "default_code": "OIL-SOY-5L", "list_price": 940.0, "standard_price": 760.0, "type": "consu"},
        {"name": "অটোমেটিক প্যাকেজিং রিবন", "default_code": "PKG-RIB-09", "list_price": 620.0, "standard_price": 410.0, "type": "consu"},
        {"name": "আইটি নেটওয়ার্ক সুইচ ২৪-পোর্ট", "default_code": "NET-SW-24P", "list_price": 16800.0, "standard_price": 12500.0, "type": "consu"},
        {"name": "অফিস পেপার A4 ৮০ জিএসএম", "default_code": "PAP-A4-80G", "list_price": 540.0, "standard_price": 410.0, "type": "consu"},
    ]

    product_ids = {}
    for prod in products_to_create:
        try:
            existing = models.execute_kw(db, uid, api_key, 'product.template', 'search', [[['name', '=', prod['name']]]])
            if existing:
                prod_id = existing[0]
                print(f"  • Existing Product: {prod['name']} (ID: {prod_id})")
            else:
                prod_id = models.execute_kw(db, uid, api_key, 'product.template', 'create', [prod])
                print(f"  + Created Product: {prod['name']} (ID: {prod_id})")
            
            # Fetch product.product variant id
            variants = models.execute_kw(db, uid, api_key, 'product.product', 'search', [[['product_tmpl_id', '=', prod_id]]])
            variant_id = variants[0] if variants else prod_id
            product_ids[prod['name']] = variant_id
        except Exception as e:
            print(f"  ⚠ Product {prod['name']} error: {e}")

    # 5. Create Sales Orders (sale.order)
    print("\n--- 3. Seeding Sales Orders (sale.order) ---")
    customer_keys = list(partner_ids.keys())
    product_keys = list(product_ids.keys())

    if customer_keys and product_keys:
        sales_orders_data = [
            {"partner": customer_keys[0], "prod": product_keys[0], "qty": 10, "price": 4650.0},
            {"partner": customer_keys[1], "prod": product_keys[1], "qty": 25, "price": 940.0},
            {"partner": customer_keys[2], "prod": product_keys[2], "qty": 40, "price": 620.0},
            {"partner": customer_keys[0], "prod": product_keys[3], "qty": 4, "price": 16800.0},
            {"partner": customer_keys[1], "prod": product_keys[4], "qty": 60, "price": 540.0},
        ]

        for idx, so_data in enumerate(sales_orders_data):
            try:
                p_id = partner_ids.get(so_data["partner"])
                prod_var_id = product_ids.get(so_data["prod"])
                if not p_id or not prod_var_id:
                    continue

                order_vals = {
                    "partner_id": p_id,
                    "order_line": [
                        (0, 0, {
                            "product_id": prod_var_id,
                            "product_uom_qty": so_data["qty"],
                            "price_unit": so_data["price"],
                            "name": so_data["prod"]
                        })
                    ]
                }
                so_id = models.execute_kw(db, uid, api_key, 'sale.order', 'create', [order_vals])
                print(f"  + Created Sale Order #{so_id} for {so_data['partner']} (Value: ৳{so_data['qty'] * so_data['price']:,.2f})")
                
                # Confirm some orders to 'sale' state
                if idx % 2 == 0:
                    try:
                        models.execute_kw(db, uid, api_key, 'sale.order', 'action_confirm', [[so_id]])
                        print(f"    ↳ Confirmed Sale Order #{so_id}")
                    except Exception as ce:
                        pass
            except Exception as e:
                print(f"  ⚠ Sale Order creation error: {e}")

    # 6. Create Purchase Orders (purchase.order)
    print("\n--- 4. Seeding Purchase Orders (purchase.order) ---")
    if len(customer_keys) > 3 and product_keys:
        vendor_keys = [customer_keys[3], customer_keys[4]] if len(customer_keys) >= 5 else customer_keys
        po_data_list = [
            {"vendor": vendor_keys[0], "prod": product_keys[0], "qty": 50, "price": 3800.0},
            {"vendor": vendor_keys[1] if len(vendor_keys) > 1 else vendor_keys[0], "prod": product_keys[1], "qty": 100, "price": 760.0},
            {"vendor": vendor_keys[0], "prod": product_keys[3], "qty": 8, "price": 12500.0},
        ]

        for po_item in po_data_list:
            try:
                v_id = partner_ids.get(po_item["vendor"])
                prod_var_id = product_ids.get(po_item["prod"])
                if not v_id or not prod_var_id:
                    continue

                po_vals = {
                    "partner_id": v_id,
                    "order_line": [
                        (0, 0, {
                            "product_id": prod_var_id,
                            "product_qty": po_item["qty"],
                            "price_unit": po_item["price"],
                            "name": po_item["prod"],
                            "date_planned": "2026-08-30 00:00:00"
                        })
                    ]
                }
                po_id = models.execute_kw(db, uid, api_key, 'purchase.order', 'create', [po_vals])
                print(f"  + Created Purchase Order #{po_id} with {po_item['vendor']} (Value: ৳{po_item['qty'] * po_item['price']:,.2f})")
            except Exception as e:
                print(f"  ⚠ Purchase Order creation error: {e}")

    print("\n==============================================")
    print("🎉 Odoo Backend Data Seeding Completed Successfully!")
    print("==============================================")
    return True

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://fardin.odoo.com"
    db = sys.argv[2] if len(sys.argv) > 2 else "fardin"
    login = sys.argv[3] if len(sys.argv) > 3 else ""
    api_key = sys.argv[4] if len(sys.argv) > 4 else "63c5bca000bd4bf28f7b710193fb8058610ac12c"

    if not login:
        login = input("Enter your Odoo Login Email (Username): ").strip()

    seed_odoo(url, db, login, api_key)
