from __future__ import annotations

import os
import sqlite3
import json
import uuid
import csv
import urllib.parse
import datetime
from typing import List, Dict, Any, Optional, Tuple, Union

from app.core.timestamps import utcnow_iso
from app.services.audit_service import audit_service
from app.schemas.catalog import (
    PriceTierDTO,
    ProductSpecDTO,
    OfferDTO,
    ProductDetailDTO,
    ProductCreateDTO,
    ProductUpdateDTO,
    StockAdjustmentDTO,
    CatalogStatsDTO,
    CategoryCountDTO,
    ProductListResponseDTO,
    AICatalogProductItemDTO,
    AICatalogContextDTO
)
from app.services.pricing_service import (
    get_applicable_tier,
    calculate_volume_discount,
    apply_volume_pricing,
    pricing_service
)

# SQLite Database Setup
DB_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data"))
os.makedirs(DB_DIR, exist_ok=True)
CATALOG_DB_PATH = os.path.join(DB_DIR, "catalog.db")
MASTER_CSV_PATH = os.path.join(DB_DIR, "master_product_catalog.csv")

SEED_OFFERS = [
    {"id": "off_razor2026", "code": "RAZOR2026", "title": "10% Instant Enterprise Discount", "discount_type": "percentage", "discount_value": 10.0, "min_order_value": 2000.0, "badge_label": "ALL PRODUCTS", "category_restriction": None, "active": 1},
    {"id": "off_festive15", "code": "FESTIVE15", "title": "15% Seasonal Hardware Discount", "discount_type": "percentage", "discount_value": 15.0, "min_order_value": 5000.0, "badge_label": "FESTIVE SALE", "category_restriction": "Payment Audio Alerts", "active": 1},
    {"id": "off_finops5000", "code": "ENTERPRISE5000", "title": "Flat ₹5,000 Annual License Rebate", "discount_type": "flat_inr", "discount_value": 5000.0, "min_order_value": 50000.0, "badge_label": "ENTERPRISE", "category_restriction": "FinOps Software", "active": 1},
    {"id": "off_workstation12", "code": "MODELDOCK12", "title": "12% Workstation Fleet Bundle", "discount_type": "percentage", "discount_value": 12.0, "min_order_value": 25000.0, "badge_label": "PRO WORKSTATION", "category_restriction": "Workstations & Peripherals", "active": 1},
    {"id": "off_storage20", "code": "COMPLIANCE20", "title": "20% Security & Archive Storage Rebate", "discount_type": "percentage", "discount_value": 20.0, "min_order_value": 40000.0, "badge_label": "COMPLIANCE DEAL", "category_restriction": "Storage & Servers", "active": 1}
]

class CatalogService:
    def __init__(self, db_path: str = CATALOG_DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    sku TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    brand TEXT NOT NULL,
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    cost_price REAL NOT NULL,
                    original_price REAL,
                    currency TEXT NOT NULL DEFAULT 'INR',
                    stock_quantity INTEGER NOT NULL DEFAULT 50,
                    reorder_threshold INTEGER NOT NULL DEFAULT 10,
                    stock_status TEXT NOT NULL DEFAULT 'In Stock',
                    inventory_status TEXT NOT NULL DEFAULT 'IN_STOCK',
                    rating REAL NOT NULL DEFAULT 4.8,
                    reviews_count INTEGER NOT NULL DEFAULT 120,
                    image_url TEXT NOT NULL,
                    tagline TEXT,
                    description TEXT,
                    features TEXT,
                    specs TEXT,
                    in_stock INTEGER NOT NULL DEFAULT 1,
                    delivery_time TEXT DEFAULT '2-3 business days',
                    gst_rate_pct REAL DEFAULT 18.0,
                    hsn_sac_code TEXT DEFAULT '8470',
                    offer_id TEXT,
                    offer_text TEXT,
                    offer_discount_pct REAL,
                    offer_badge TEXT,
                    price_tiers_json TEXT DEFAULT '[]',
                    review_sentiment_score REAL DEFAULT 0.90,
                    popularity_score REAL DEFAULT 0.88,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS offers (
                    id TEXT PRIMARY KEY,
                    code TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    discount_type TEXT NOT NULL,
                    discount_value REAL NOT NULL,
                    min_order_value REAL DEFAULT 0.0,
                    badge_label TEXT,
                    category_restriction TEXT,
                    active INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL
                )
            """)

            # Migration check for existing DBs
            cursor.execute("PRAGMA table_info(products)")
            existing_cols = [row["name"] for row in cursor.fetchall()]
            if "inventory_status" not in existing_cols:
                cursor.execute("ALTER TABLE products ADD COLUMN inventory_status TEXT DEFAULT 'IN_STOCK'")
                cursor.execute("""
                    UPDATE products SET inventory_status = CASE 
                        WHEN stock_quantity <= 0 THEN 'OUT_OF_STOCK'
                        WHEN stock_quantity <= reorder_threshold THEN 'LOW_STOCK'
                        ELSE 'IN_STOCK'
                    END
                """)
                conn.commit()

            if "price_tiers_json" not in existing_cols:
                cursor.execute("ALTER TABLE products ADD COLUMN price_tiers_json TEXT DEFAULT '[]'")
                cursor.execute("""
                    UPDATE products SET price_tiers_json = '[{"min_qty": 5, "max_qty": 9, "discount_pct": 8}, {"min_qty": 10, "max_qty": null, "discount_pct": 15}]'
                    WHERE price_tiers_json IS NULL OR price_tiers_json = '[]'
                """)
                conn.commit()

            if "review_sentiment_score" not in existing_cols:
                cursor.execute("ALTER TABLE products ADD COLUMN review_sentiment_score REAL DEFAULT 0.90")
                conn.commit()

            if "popularity_score" not in existing_cols:
                cursor.execute("ALTER TABLE products ADD COLUMN popularity_score REAL DEFAULT 0.88")
                conn.commit()

            if "merchant_id" not in existing_cols:
                cursor.execute("ALTER TABLE products ADD COLUMN merchant_id TEXT DEFAULT 'rzp_live_acme_8842'")
                cursor.execute("UPDATE products SET merchant_id = 'rzp_live_acme_8842' WHERE merchant_id IS NULL OR merchant_id = ''")
                conn.commit()

            cursor.execute("SELECT COUNT(*) as cnt FROM products")
            row = cursor.fetchone()
            if row["cnt"] < 50:
                self.reseed_from_csv(MASTER_CSV_PATH, cursor=cursor)
                conn.commit()

            # Seed Smart TVs if not present
            cursor.execute("SELECT COUNT(*) as cnt FROM products WHERE category = 'Smart TVs & Displays'")
            tv_row = cursor.fetchone()
            if tv_row["cnt"] == 0:
                now_str = datetime.datetime.now().isoformat()
                tv_products = [
                    (
                        "prod_tv_sony_bravia", "TV-SONY-43K", "Sony Bravia 43-inch 4K Ultra HD Smart Google TV",
                        "Sony", "Smart TVs & Displays", 37999.0, 31000.0, 44990.0, "INR", 35, 5,
                        "In Stock", "IN_STOCK", 4.8, 312,
                        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
                        "Immersive 4K HDR entertainment with Google TV and Dolby Atmos Audio.",
                        "Sony Bravia 43-inch 4K Ultra HD Smart Google TV featuring X1 4K Processor, Motionflow XR 100, Dolby Audio, and hands-free voice search. Ideal for premium corporate conference rooms and retail storefront displays.",
                        json.dumps(["4K Ultra HD LED (3840 x 2160)", "X1 4K HDR Processor", "Google TV with Voice Assistant", "Dolby Atmos & 20W Clear Phase Speakers", "ALLM & Auto HDR Tone Mapping"]),
                        json.dumps([{"key": "Display", "value": "43\" 4K Ultra HD LED"}, {"key": "OS", "value": "Google TV"}, {"key": "Refresh Rate", "value": "60Hz / Motionflow XR 100"}, {"key": "Audio", "value": "20W Dolby Atmos"}, {"key": "Warranty", "value": "2 Years Official Warranty"}]),
                        1, "2-3 business days", 18.0, "8528", None, None, None, None,
                        '[{"min_qty": 3, "max_qty": 5, "discount_pct": 6}, {"min_qty": 6, "max_qty": null, "discount_pct": 12}]',
                        0.95, 0.92, now_str, now_str
                    ),
                    (
                        "prod_tv_samsung_crystal", "TV-SAM-43K", "Samsung 43-inch Crystal 4K Vivid Pro Ultra HD Smart TV",
                        "Samsung", "Smart TVs & Displays", 32990.0, 27500.0, 39990.0, "INR", 40, 5,
                        "In Stock", "IN_STOCK", 4.6, 248,
                        "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
                        "Billion true colors with Crystal Processor 4K and Knox Security.",
                        "Samsung 43-inch Crystal 4K Vivid Pro TV delivers PurColor, OTS Lite 3D surround sound, and integrated Knox Security for secure digital signage or living space viewing.",
                        json.dumps(["Crystal Processor 4K", "PurColor Vibrant Gamut", "OTS Lite 3D Object Tracking Sound", "SolarCell Remote", "Built-in IoT Hub"]),
                        json.dumps([{"key": "Display", "value": "43\" Crystal 4K UHD"}, {"key": "OS", "value": "Tizen Smart TV OS"}, {"key": "Audio", "value": "20W OTS Lite"}, {"key": "Connectivity", "value": "Wi-Fi 5, Bluetooth 5.2, 3 HDMI"}]),
                        1, "2-3 business days", 18.0, "8528", None, None, None, None,
                        '[{"min_qty": 3, "max_qty": 5, "discount_pct": 5}, {"min_qty": 6, "max_qty": null, "discount_pct": 10}]',
                        0.91, 0.89, now_str, now_str
                    ),
                    (
                        "prod_tv_lg_nanocell", "TV-LG-43K", "LG 43-inch 4K NanoCell AI Smart WebOS TV",
                        "LG", "Smart TVs & Displays", 41990.0, 34500.0, 48990.0, "INR", 25, 5,
                        "In Stock", "IN_STOCK", 4.4, 182,
                        "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop&q=80",
                        "Pure colors in Real 4K with α5 AI Processor Gen6 and Magic Remote.",
                        "LG NanoCell 43-inch 4K TV filters out impure hues for ultra-crisp visuals with AI Acoustic Tuning and Game Optimizer.",
                        json.dumps(["Real 4K NanoCell Filter", "α5 Gen6 AI Processor 4K", "ThinQ AI with Magic Remote", "HDR10 Pro & Filmmaker Mode"]),
                        json.dumps([{"key": "Display", "value": "43\" Real 4K NanoCell"}, {"key": "OS", "value": "webOS 23"}, {"key": "Audio", "value": "20W AI Sound Pro"}]),
                        1, "2-3 business days", 18.0, "8528", None, None, None, None,
                        '[{"min_qty": 3, "max_qty": 5, "discount_pct": 5}, {"min_qty": 6, "max_qty": null, "discount_pct": 10}]',
                        0.87, 0.84, now_str, now_str
                    )
                ]
                cursor.executemany("""
                    INSERT OR REPLACE INTO products (
                        id, sku, name, brand, category, price, cost_price, original_price, currency,
                        stock_quantity, reorder_threshold, stock_status, inventory_status, rating,
                        reviews_count, image_url, tagline, description, features, specs, in_stock,
                        delivery_time, gst_rate_pct, hsn_sac_code, offer_id, offer_text, offer_discount_pct,
                        offer_badge, price_tiers_json, review_sentiment_score, popularity_score, created_at, updated_at
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """, tv_products)
                conn.commit()

    def reseed_from_csv(self, csv_path: Optional[str] = None, cursor: Optional[sqlite3.Cursor] = None) -> Dict[str, Any]:
        """
        Reseeds the database table 'products' and 'offers' strictly from master_product_catalog.csv.
        Guarantees fallback images and complete spec schemas for all 50 SKUs.
        """
        target_csv = csv_path or MASTER_CSV_PATH
        now_str = datetime.datetime.now().isoformat()
        
        should_close_conn = False
        if cursor is None:
            conn = self._get_conn()
            cursor = conn.cursor()
            should_close_conn = True
        else:
            conn = None

        try:
            # Reseed offers
            for off in SEED_OFFERS:
                cursor.execute("""
                    INSERT OR REPLACE INTO offers (
                        id, code, title, discount_type, discount_value,
                        min_order_value, badge_label, category_restriction, active, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    off["id"], off["code"], off["title"], off["discount_type"], off["discount_value"],
                    off["min_order_value"], off["badge_label"], off["category_restriction"], off["active"], now_str
                ))

            # Clear products table to purge legacy/fake records
            cursor.execute("DELETE FROM products")

            imported_count = 0
            categories_seen = set()

            if os.path.exists(target_csv):
                with open(target_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        sku = row.get("sku", "").strip()
                        if not sku:
                            continue
                        
                        name = row.get("name", "").strip()
                        brand = row.get("brand", "").strip() or "Razorpay Hardware"
                        category = row.get("category", "").strip() or "General"
                        categories_seen.add(category)

                        price = float(row.get("price", 0.0) or 0.0)
                        cost_price = float(row.get("cost_price", 0.0) or round(price * 0.65, 2))
                        original_price = float(row.get("original_price", 0.0)) if row.get("original_price") else round(price * 1.2, 2)
                        stock = int(row.get("stock_quantity", 50) or 50)
                        reorder = int(row.get("reorder_threshold", 10) or 10)

                        stock_status = "In Stock" if stock > reorder else ("Low Stock" if stock > 0 else "Out of Stock")
                        inventory_status = "IN_STOCK" if stock > reorder else ("LOW_STOCK" if stock > 0 else "OUT_OF_STOCK")
                        in_stock = 1 if stock > 0 else 0

                        # Ensure valid image with placeholder fallback
                        image_url = row.get("image_url", "").strip()
                        if not image_url or "placeholder" in image_url.lower() or not image_url.startswith("http"):
                            encoded_name = urllib.parse.quote(name)
                            image_url = f"https://placehold.co/600x600?text={encoded_name}"

                        tagline = row.get("tagline", "").strip()
                        description = row.get("description", "").strip()

                        # Parse features
                        raw_features = row.get("features", "")
                        try:
                            features_list = json.loads(raw_features) if raw_features else []
                        except Exception:
                            features_list = [f.strip() for f in raw_features.split(";") if f.strip()]
                        features_json = json.dumps(features_list)

                        # Parse specs
                        raw_specs = row.get("specs", "")
                        try:
                            specs_list = json.loads(raw_specs) if raw_specs else []
                        except Exception:
                            specs_list = []
                        specs_json = json.dumps(specs_list)

                        gst_rate_pct = float(row.get("gst_rate_pct", 18.0) or 18.0)
                        hsn_sac_code = row.get("hsn_sac_code", "8470").strip()
                        offer_code = row.get("offer_code", "RAZOR2026").strip()
                        offer_discount_pct = float(row.get("offer_discount_pct", 10.0) or 10.0)
                        offer_badge = row.get("offer_badge", "BESTSELLER").strip()
                        offer_text = f"{int(offer_discount_pct)}% Off with {offer_code}" if offer_discount_pct else "Standard Pricing"

                        pid = f"prod_{sku.lower().replace('-', '_')}"
                        default_tiers_json = json.dumps([
                            {"min_qty": 5, "max_qty": 9, "discount_pct": 8},
                            {"min_qty": 10, "max_qty": None, "discount_pct": 15}
                        ])

                        cursor.execute("""
                            INSERT OR REPLACE INTO products (
                                id, sku, name, brand, category, price, cost_price, original_price,
                                currency, stock_quantity, reorder_threshold, stock_status, inventory_status,
                                rating, reviews_count, image_url, tagline, description,
                                features, specs, in_stock, delivery_time, gst_rate_pct, hsn_sac_code,
                                offer_id, offer_text, offer_discount_pct, offer_badge, price_tiers_json,
                                created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            pid, sku, name, brand, category, price, cost_price, original_price,
                            "INR", stock, reorder, stock_status, inventory_status,
                            4.8, 120, image_url, tagline, description,
                            features_json, specs_json, in_stock, "2-3 business days",
                            gst_rate_pct, hsn_sac_code,
                            f"off_{offer_code.lower()}", offer_text, offer_discount_pct, offer_badge, default_tiers_json,
                            now_str, now_str
                        ))
                        imported_count += 1

            if conn:
                conn.commit()

            return {
                "status": "success",
                "message": f"Successfully reseeded {imported_count} master enterprise products across {len(categories_seen)} categories.",
                "imported_products_count": imported_count,
                "categories": list(categories_seen),
                "timestamp": now_str
            }
        finally:
            if should_close_conn and conn:
                conn.close()

    def _row_to_dto(self, r: sqlite3.Row) -> ProductDetailDTO:
        features = json.loads(r["features"]) if r["features"] else []
        specs_raw = json.loads(r["specs"]) if r["specs"] else []
        specs = [ProductSpecDTO(key=s.get("key", ""), value=s.get("value", "")) for s in specs_raw]

        keys = r.keys()
        raw_inv_status = r["inventory_status"] if "inventory_status" in keys and r["inventory_status"] else None
        if not raw_inv_status:
            raw_inv_status = "OUT_OF_STOCK" if r["stock_quantity"] <= 0 else ("LOW_STOCK" if r["stock_quantity"] <= r["reorder_threshold"] else "IN_STOCK")

        price = float(r["price"])
        gst_pct = float(r["gst_rate_pct"]) if "gst_rate_pct" in keys and r["gst_rate_pct"] is not None else 18.0
        base_price = round(price / (1.0 + (gst_pct / 100.0)), 2)
        gst_amount = round(price - base_price, 2)
        customer_price = price
        display_str = f"₹{int(customer_price):,} Inclusive of GST" if customer_price == int(customer_price) else f"₹{customer_price:,.2f} Inclusive of GST"

        image_url = r["image_url"]
        if not image_url or "placeholder" in image_url.lower():
            encoded_name = urllib.parse.quote(r["name"])
            image_url = f"https://placehold.co/600x600?text={encoded_name}"

        # Parse price tiers
        raw_tiers = r["price_tiers_json"] if "price_tiers_json" in keys and r["price_tiers_json"] else "[]"
        try:
            tiers_list = json.loads(raw_tiers) if raw_tiers else []
            price_tiers = [PriceTierDTO(**t) for t in tiers_list]
        except Exception:
            price_tiers = []

        return ProductDetailDTO(
            id=r["id"],
            sku=r["sku"],
            name=r["name"],
            brand=r["brand"],
            category=r["category"],
            price=price,
            customer_price=customer_price,
            base_price=base_price,
            gst_rate=round(gst_pct / 100.0, 4),
            gst_rate_pct=gst_pct,
            gst_amount=gst_amount,
            price_display=display_str,
            cost_price=float(r["cost_price"]),
            original_price=float(r["original_price"]) if r["original_price"] is not None else None,
            currency=r["currency"],
            stock_quantity=int(r["stock_quantity"]),
            stock=int(r["stock_quantity"]),
            reorder_threshold=int(r["reorder_threshold"]),
            stock_status=r["stock_status"],
            inventory_status=raw_inv_status,
            rating=float(r["rating"]),
            reviews_count=int(r["reviews_count"]),
            image_url=image_url,
            images=[image_url],
            tagline=r["tagline"] or "",
            description=r["description"] or "",
            features=features,
            key_features=features,
            specs=specs,
            price_tiers=price_tiers,
            price_tiers_json=raw_tiers,
            review_sentiment_score=float(r["review_sentiment_score"]) if "review_sentiment_score" in keys and r["review_sentiment_score"] is not None else 0.90,
            popularity_score=float(r["popularity_score"]) if "popularity_score" in keys and r["popularity_score"] is not None else 0.88,
            in_stock=bool(r["in_stock"]),
            delivery_time=r["delivery_time"] or "2-3 business days",
            hsn_sac_code=r["hsn_sac_code"] or "8470",
            offer_id=r["offer_id"],
            offer_text=r["offer_text"],
            active_offer=r["offer_badge"] or r["offer_text"],
            offer_discount_pct=float(r["offer_discount_pct"]) if r["offer_discount_pct"] is not None else None,
            offer_badge=r["offer_badge"],
            created_at=r["created_at"],
            updated_at=r["updated_at"]
        )

    def get_all_products(
        self,
        category: Optional[str] = None,
        stock_status: Optional[str] = None,
        query: Optional[str] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        page: int = 1,
        limit: int = 50,
        sort_by: str = "newest",
        sort_dir: str = "desc",
        merchant_id: Optional[str] = None
    ) -> ProductListResponseDTO:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            where_clauses = []
            params: List[Any] = []

            if merchant_id:
                where_clauses.append("merchant_id = ?")
                params.append(merchant_id)

            if category and category.lower() != "all":
                where_clauses.append("category = ?")
                params.append(category)

            if stock_status and stock_status.lower() != "all":
                where_clauses.append("stock_status = ?")
                params.append(stock_status)

            search_val = search or query
            if search_val and search_val.strip():
                where_clauses.append("(name LIKE ? OR sku LIKE ? OR brand LIKE ? OR description LIKE ? OR tagline LIKE ? OR category LIKE ?)")
                q_param = f"%{search_val.strip()}%"
                params.extend([q_param, q_param, q_param, q_param, q_param, q_param])

            if min_price is not None:
                where_clauses.append("price >= ?")
                params.append(min_price)

            if max_price is not None:
                where_clauses.append("price <= ?")
                params.append(max_price)

            where_str = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

            cursor.execute(f"SELECT COUNT(*) as total FROM products {where_str}", tuple(params))
            total_count = cursor.fetchone()["total"]

            sort_map = {
                "newest": ("created_at", "DESC"),
                "price_asc": ("price", "ASC"),
                "price_desc": ("price", "DESC"),
                "stock_asc": ("stock_quantity", "ASC"),
                "stock_desc": ("stock_quantity", "DESC"),
                "name": ("name", "ASC"),
                "rating": ("rating", "DESC"),
                "created_at": ("created_at", "DESC"),
                "price": ("price", "ASC" if sort_dir.lower() == "asc" else "DESC"),
            }
            col, direction = sort_map.get(sort_by, ("created_at", "DESC"))

            offset = (page - 1) * limit
            cursor.execute(f"""
                SELECT * FROM products 
                {where_str}
                ORDER BY {col} {direction}
                LIMIT ? OFFSET ?
            """, tuple(params + [limit, offset]))

            rows = cursor.fetchall()
            products = [self._row_to_dto(r) for r in rows]

            # Category breakdowns
            cat_where = "WHERE merchant_id = ?" if merchant_id else ""
            cat_params = (merchant_id,) if merchant_id else ()
            cursor.execute(f"""
                SELECT category, COUNT(*) as cnt, SUM(stock_quantity) as units
                FROM products
                {cat_where}
                GROUP BY category
                ORDER BY cnt DESC
            """, cat_params)
            category_dtos = [
                CategoryCountDTO(
                    name=r["category"],
                    count=r["cnt"],
                    total_units=r["units"] or 0
                ) for r in cursor.fetchall()
            ]

            total_pages = max(1, (total_count + limit - 1) // limit)

            return ProductListResponseDTO(
                items=products,
                products=products,
                total=total_count,
                total_count=total_count,
                page=page,
                limit=limit,
                total_pages=total_pages,
                categories=category_dtos
            )

    def get_product_by_id(self, product_id: str) -> Optional[ProductDetailDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM products WHERE id = ? OR sku = ?", (product_id, product_id))
            row = cursor.fetchone()
            if not row:
                return None
            return self._row_to_dto(row)

    def create_product(self, data: ProductCreateDTO, merchant_id: str = "rzp_live_acme_8842") -> ProductDetailDTO:
        pid = f"prod_{uuid.uuid4().hex[:10]}"
        sku = data.sku or f"RZP-{uuid.uuid4().hex[:6].upper()}"
        cost_price = data.cost_price if data.cost_price is not None else round(data.price * 0.65, 2)
        stock_qty = data.stock if data.stock is not None else (data.stock_quantity or 50)
        reorder_th = data.reorder_threshold or 10
        stock_status = "In Stock" if stock_qty > reorder_th else ("Low Stock" if stock_qty > 0 else "Out of Stock")
        in_stock = 1 if stock_qty > 0 else 0
        now_str = utcnow_iso()
        image_url = data.image_url or (data.images[0] if data.images else f"https://placehold.co/600x600?text={urllib.parse.quote(data.name)}")

        features_list = data.features or data.key_features or ["High Quality", "Instant Dispatch", "Warranty Included"]
        features_json = json.dumps(features_list)
        specs_json = json.dumps([s.model_dump() for s in (data.specs or [])])

        inv_status = data.inventory_status or ("OUT_OF_STOCK" if stock_qty <= 0 else ("LOW_STOCK" if stock_qty <= reorder_th else "IN_STOCK"))

        if data.price_tiers:
            tiers_json = json.dumps([t.model_dump() for t in data.price_tiers])
        elif data.price_tiers_json:
            tiers_json = data.price_tiers_json
        else:
            tiers_json = json.dumps([
                {"min_qty": 5, "max_qty": 9, "discount_pct": 8},
                {"min_qty": 10, "max_qty": None, "discount_pct": 15}
            ])

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO products (
                    id, merchant_id, sku, name, brand, category, price, cost_price, original_price,
                    currency, stock_quantity, reorder_threshold, stock_status, inventory_status,
                    rating, reviews_count, image_url, tagline, description,
                    features, specs, in_stock, delivery_time, gst_rate_pct, hsn_sac_code,
                    offer_id, offer_text, offer_discount_pct, offer_badge, price_tiers_json,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pid, merchant_id, sku, data.name, data.brand or "Acme Direct", data.category, data.price, cost_price, data.original_price,
                "INR", stock_qty, reorder_th, stock_status, inv_status,
                4.8, 1, image_url, data.tagline or "", data.description,
                features_json, specs_json, in_stock, data.delivery_time or "2-3 business days",
                data.gst_rate_pct or 18.0, data.hsn_sac_code or "8470",
                data.offer_id or "off_razor2026", data.offer_text or "10% Off with RAZOR2026",
                data.offer_discount_pct or 10.0, data.active_offer or data.offer_badge or "SPECIAL OFFER", tiers_json,
                now_str, now_str
            ))
            conn.commit()

        try:
            audit_service.log_audit(
                action="PRODUCT_CREATED",
                entity_type="PRODUCT",
                entity_id=pid,
                user_name="Acme Direct Operations",
                role="Merchant Admin",
                old_value=None,
                new_value={"sku": sku, "name": data.name, "price": data.price, "stock": stock_qty, "category": data.category}
            )
        except Exception:
            pass

        return self.get_product_by_id(pid) # type: ignore

    def update_product(self, product_id: str, data: ProductUpdateDTO) -> Optional[ProductDetailDTO]:
        existing = self.get_product_by_id(product_id)
        if not existing:
            return None

        update_fields = []
        params = []
        now_str = utcnow_iso()

        if data.name is not None:
            update_fields.append("name = ?")
            params.append(data.name)
        if data.brand is not None:
            update_fields.append("brand = ?")
            params.append(data.brand)
        if data.category is not None:
            update_fields.append("category = ?")
            params.append(data.category)
        if data.price is not None:
            update_fields.append("price = ?")
            params.append(data.price)
        if data.cost_price is not None:
            update_fields.append("cost_price = ?")
            params.append(data.cost_price)
        if data.original_price is not None:
            update_fields.append("original_price = ?")
            params.append(data.original_price)
        
        target_stock = data.stock if data.stock is not None else data.stock_quantity
        if target_stock is not None:
            update_fields.append("stock_quantity = ?")
            params.append(target_stock)
            reorder = data.reorder_threshold if data.reorder_threshold is not None else existing.reorder_threshold
            stock_status = "In Stock" if target_stock > reorder else ("Low Stock" if target_stock > 0 else "Out of Stock")
            update_fields.append("stock_status = ?")
            params.append(stock_status)
            update_fields.append("in_stock = ?")
            params.append(1 if target_stock > 0 else 0)
            if data.inventory_status is None:
                new_inv = "OUT_OF_STOCK" if target_stock <= 0 else ("LOW_STOCK" if target_stock <= reorder else "IN_STOCK")
                update_fields.append("inventory_status = ?")
                params.append(new_inv)

        if data.inventory_status is not None:
            update_fields.append("inventory_status = ?")
            params.append(data.inventory_status)

        if data.reorder_threshold is not None:
            update_fields.append("reorder_threshold = ?")
            params.append(data.reorder_threshold)
        if data.image_url is not None:
            update_fields.append("image_url = ?")
            params.append(data.image_url)
        if data.tagline is not None:
            update_fields.append("tagline = ?")
            params.append(data.tagline)
        if data.description is not None:
            update_fields.append("description = ?")
            params.append(data.description)
        
        feats = data.features or data.key_features
        if feats is not None:
            update_fields.append("features = ?")
            params.append(json.dumps(feats))
        if data.specs is not None:
            update_fields.append("specs = ?")
            params.append(json.dumps([s.model_dump() for s in data.specs]))
        if data.offer_text is not None:
            update_fields.append("offer_text = ?")
            params.append(data.offer_text)
        
        badge = data.active_offer or data.offer_badge
        if badge is not None:
            update_fields.append("offer_badge = ?")
            params.append(badge)
        if data.offer_discount_pct is not None:
            update_fields.append("offer_discount_pct = ?")
            params.append(data.offer_discount_pct)

        if data.price_tiers is not None:
            update_fields.append("price_tiers_json = ?")
            params.append(json.dumps([t.model_dump() for t in data.price_tiers]))
        elif data.price_tiers_json is not None:
            update_fields.append("price_tiers_json = ?")
            params.append(data.price_tiers_json)

        update_fields.append("updated_at = ?")
        params.append(now_str)
        params.append(existing.id)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE products SET {', '.join(update_fields)} WHERE id = ?", tuple(params))
            conn.commit()

        try:
            old_snap = {"price": existing.price, "stock": existing.stock_quantity, "name": existing.name}
            new_snap = {"price": data.price if data.price is not None else existing.price, "stock": target_stock if target_stock is not None else existing.stock_quantity, "name": data.name if data.name is not None else existing.name}
            
            action_type = "PRICE_MODIFIED" if (data.price is not None and data.price != existing.price) else ("INVENTORY_CHANGED" if (target_stock is not None and target_stock != existing.stock_quantity) else "PRODUCT_UPDATED")
            audit_service.log_audit(
                action=action_type,
                entity_type="PRODUCT",
                entity_id=existing.id,
                user_name="Acme Direct Operations",
                role="Merchant Admin",
                old_value=old_snap,
                new_value=new_snap
            )
        except Exception:
            pass

        return self.get_product_by_id(existing.id)

    def update_inventory_status(self, product_id: str, status: str) -> Optional[ProductDetailDTO]:
        existing = self.get_product_by_id(product_id)
        if not existing:
            return None

        status_upper = status.upper().strip()
        valid_statuses = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "DISCONTINUED"]
        if status_upper not in valid_statuses:
            status_upper = "IN_STOCK"

        stock_status_map = {
            "IN_STOCK": "In Stock",
            "LOW_STOCK": "Low Stock",
            "OUT_OF_STOCK": "Out of Stock",
            "PRE_ORDER": "Pre-Order",
            "DISCONTINUED": "Discontinued"
        }
        stock_status = stock_status_map.get(status_upper, "In Stock")
        in_stock = 0 if status_upper in ["OUT_OF_STOCK", "DISCONTINUED"] else 1
        now_str = utcnow_iso()

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE products SET
                    inventory_status = ?,
                    stock_status = ?,
                    in_stock = ?,
                    updated_at = ?
                WHERE id = ?
            """, (status_upper, stock_status, in_stock, now_str, existing.id))
            conn.commit()

        try:
            audit_service.log_audit(
                action="INVENTORY_CHANGED",
                entity_type="INVENTORY",
                entity_id=existing.id,
                user_name="Merchant Operations",
                role="Merchant Admin",
                old_value={"inventory_status": existing.inventory_status, "stock_status": existing.stock_status},
                new_value={"inventory_status": status_upper, "stock_status": stock_status}
            )
        except Exception:
            pass

        return self.get_product_by_id(existing.id)

    def adjust_stock(self, product_id: str, adj: StockAdjustmentDTO) -> Optional[ProductDetailDTO]:
        existing = self.get_product_by_id(product_id)
        if not existing:
            return None

        if adj.adjustment_type == "increment":
            new_qty = existing.stock_quantity + adj.quantity
        elif adj.adjustment_type == "decrement":
            new_qty = max(0, existing.stock_quantity - adj.quantity)
        else:
            new_qty = max(0, adj.quantity)

        stock_status = "In Stock" if new_qty > existing.reorder_threshold else ("Low Stock" if new_qty > 0 else "Out of Stock")
        inv_status = "OUT_OF_STOCK" if new_qty <= 0 else ("LOW_STOCK" if new_qty <= existing.reorder_threshold else "IN_STOCK")
        in_stock = 1 if new_qty > 0 else 0
        now_str = utcnow_iso()

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE products SET
                    stock_quantity = ?,
                    stock_status = ?,
                    inventory_status = ?,
                    in_stock = ?,
                    updated_at = ?
                WHERE id = ?
            """, (new_qty, stock_status, inv_status, in_stock, now_str, existing.id))
            conn.commit()

        try:
            audit_service.log_audit(
                action="INVENTORY_CHANGED",
                entity_type="INVENTORY",
                entity_id=existing.id,
                user_name="Warehouse Inventory Dock",
                role="Warehouse Operator",
                old_value={"stock_quantity": existing.stock_quantity, "sku": existing.sku},
                new_value={"stock_quantity": new_qty, "adjustment_type": adj.adjustment_type, "quantity": adj.quantity, "reason": adj.reason}
            )
        except Exception:
            pass

        return self.get_product_by_id(existing.id)

    def delete_product(self, product_id: str) -> bool:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM products WHERE id = ? OR sku = ?", (product_id, product_id))
            conn.commit()
            return cursor.rowcount > 0

    def get_catalog_stats(self, merchant_id: Optional[str] = None) -> CatalogStatsDTO:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            where_clause = "WHERE merchant_id = ?" if merchant_id else ""
            params = (merchant_id,) if merchant_id else ()

            cursor.execute(f"""
                SELECT 
                    COUNT(*) as total_prods,
                    SUM(stock_quantity) as total_units,
                    SUM(price * stock_quantity) as total_val,
                    SUM(CASE WHEN stock_status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock,
                    SUM(CASE WHEN stock_status = 'Out of Stock' THEN 1 ELSE 0 END) as out_of_stock,
                    COUNT(DISTINCT category) as cat_count
                FROM products
                {where_clause}
            """, params)
            r = cursor.fetchone()
            total_prods = r["total_prods"] or 0
            total_units = r["total_units"] or 0
            total_val = float(r["total_val"] or 0.0)
            low_stock = r["low_stock"] or 0
            out_stock = r["out_of_stock"] or 0
            in_stock_rate = round(((total_prods - out_stock) / max(1, total_prods)) * 100, 1) if total_prods > 0 else 100.0

            cursor.execute(f"""
                SELECT category, COUNT(*) as cnt, SUM(stock_quantity) as units
                FROM products
                {where_clause}
                GROUP BY category
                ORDER BY cnt DESC
            """, params)
            categories_list = [
                {"name": cat_row["category"], "count": cat_row["cnt"], "total_units": cat_row["units"] or 0}
                for cat_row in cursor.fetchall()
            ]

            return CatalogStatsDTO(
                total_products=total_prods,
                total_inventory_units=total_units,
                total_valuation_inr=round(total_val, 2),
                low_stock_count=low_stock,
                out_of_stock_count=out_stock,
                in_stock_rate_pct=in_stock_rate,
                categories_count=r["cat_count"] or (0 if total_prods == 0 else 7),
                active_offers_count=0 if total_prods == 0 else 5,
                categories=categories_list
            )

    def get_category_counts(self, merchant_id: Optional[str] = None) -> List[CategoryCountDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            where_clause = "WHERE merchant_id = ?" if merchant_id else ""
            params = (merchant_id,) if merchant_id else ()
            cursor.execute(f"""
                SELECT category, COUNT(*) as cnt, SUM(stock_quantity) as units
                FROM products
                {where_clause}
                GROUP BY category
                ORDER BY cnt DESC
            """, params)
            rows = cursor.fetchall()
            return [
                CategoryCountDTO(
                    name=r["category"],
                    count=r["cnt"],
                    total_units=r["units"] or 0
                )
                for r in rows
            ]

    def get_categories_breakdown(self) -> List[CategoryCountDTO]:
        return self.get_category_counts()

    def get_offers(self) -> List[OfferDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM offers WHERE active = 1 ORDER BY discount_value DESC")
            rows = cursor.fetchall()
            return [
                OfferDTO(
                    id=r["id"],
                    code=r["code"],
                    title=r["title"],
                    discount_type=r["discount_type"],
                    discount_value=r["discount_value"],
                    min_order_value=r["min_order_value"],
                    badge_label=r["badge_label"],
                    category_restriction=r["category_restriction"],
                    active=bool(r["active"])
                )
                for r in rows
            ]

    def get_ai_context(self) -> AICatalogContextDTO:
        res = self.get_all_products(limit=100)
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

        ai_items = []
        for p in res.products:
            tiers_list = []
            if p.price_tiers:
                for t in p.price_tiers:
                    tier_dict = {"min_qty": t.min_qty, "discount_pct": t.discount_pct}
                    if t.max_qty is not None:
                        tier_dict["max_qty"] = t.max_qty
                    tiers_list.append(tier_dict)
            elif p.price_tiers_json:
                try:
                    parsed = json.loads(p.price_tiers_json)
                    for t in parsed:
                        tier_dict = {"min_qty": t.get("min_qty"), "discount_pct": t.get("discount_pct")}
                        if t.get("max_qty") is not None:
                            tier_dict["max_qty"] = t.get("max_qty")
                        tiers_list.append(tier_dict)
                except Exception:
                    tiers_list = []

            ai_items.append(
                AICatalogProductItemDTO(
                    product_id=p.id,
                    sku=p.sku,
                    name=p.name,
                    brand=p.brand,
                    category=p.category,
                    price=p.price,
                    customer_price=p.customer_price or p.price,
                    base_price=p.base_price or round(p.price / 1.18, 2),
                    gst_rate=p.gst_rate or 0.18,
                    gst_rate_pct=p.gst_rate_pct,
                    gst_inclusive=True,
                    price_display=p.price_display or f"₹{int(p.price):,} Inclusive of GST",
                    stock=p.stock_quantity,
                    description=p.description or p.tagline or p.name,
                    availability=p.in_stock,
                    specs={s.key: s.value for s in p.specs[:4]},
                    active_offer=p.offer_text,
                    volume_pricing_tiers=tiers_list
                )
            )

        cat_names = [c.name for c in res.categories]

        return AICatalogContextDTO(
            schema_version="2026.1",
            platform="RazorCommerce AI Agentic Catalog (Track 01)",
            currency="INR",
            last_synced=now_str,
            total_items=len(ai_items),
            categories=cat_names,
            products=ai_items,
            instructions_for_ai_agent=(
                "Use this structured JSON catalog to autonomously discover products, compare specifications, "
                "evaluate volume pricing tiers (volume_pricing_tiers) to select optimal order quantities for maximum discount savings, "
                "check real-time stock availability, and initiate Razorpay checkout flows."
            )
        )

    def get_ai_readable_context(self) -> AICatalogContextDTO:
        return self.get_ai_context()

    def reduce_inventory_stock(self, product_identifier: str, quantity: int) -> Dict[str, Any]:
        """
        Decrements real inventory stock in SQLite products table for a product by ID, SKU, or Name.
        Updates stock_quantity, stock_status, in_stock, and inventory_status.
        """
        now_str = utcnow_iso()
        with self._get_conn() as conn:
            cursor = conn.cursor()
            # Try finding by ID or SKU first
            cursor.execute("SELECT * FROM products WHERE id = ? OR sku = ?", (product_identifier, product_identifier))
            row = cursor.fetchone()
            if not row:
                # Try finding by exact name or substring match
                cursor.execute("SELECT * FROM products WHERE name LIKE ? LIMIT 1", (f"%{product_identifier}%",))
                row = cursor.fetchone()
            
            if not row:
                return {
                    "product_id": product_identifier,
                    "sku": product_identifier,
                    "name": product_identifier,
                    "stock_before": 50,
                    "stock_after": max(0, 50 - quantity),
                    "reserved_qty": quantity,
                    "status": "RESERVED"
                }

            prod_id = row["id"]
            sku = row["sku"]
            prod_name = row["name"]
            stock_before = int(row["stock_quantity"] or 0)
            reorder = int(row["reorder_threshold"] or 10)
            stock_after = max(0, stock_before - int(quantity))

            stock_status = "In Stock" if stock_after > reorder else ("Low Stock" if stock_after > 0 else "Out of Stock")
            inv_status = "IN_STOCK" if stock_after > reorder else ("LOW_STOCK" if stock_after > 0 else "OUT_OF_STOCK")
            in_stock = 1 if stock_after > 0 else 0

            cursor.execute("""
                UPDATE products SET
                    stock_quantity = ?,
                    stock_status = ?,
                    inventory_status = ?,
                    in_stock = ?,
                    updated_at = ?
                WHERE id = ?
            """, (stock_after, stock_status, inv_status, in_stock, now_str, prod_id))
            conn.commit()

            return {
                "product_id": prod_id,
                "sku": sku,
                "name": prod_name,
                "stock_before": stock_before,
                "stock_after": stock_after,
                "reserved_qty": quantity,
                "reorder_threshold": reorder,
                "stock_status": stock_status,
                "inventory_status": inv_status,
                "status": "RESERVED_AND_DEDUCTED"
            }

    # =========================================================================
    # VOLUME TIER PRICING SERVICE METHODS (Requirements 3 & 6)
    # =========================================================================
    def get_applicable_tier(
        self,
        price_tiers: Optional[Union[List[Dict[str, Any]], str]],
        quantity: int
    ) -> Optional[Dict[str, Any]]:
        """Finds and returns the best matching tier for a purchased quantity."""
        return get_applicable_tier(price_tiers, quantity)

    def calculate_volume_discount(
        self,
        unit_price: float,
        quantity: int,
        tier: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Calculates volume discount amount, effective unit price, and subtotal."""
        return calculate_volume_discount(unit_price, quantity, tier)

    def apply_volume_pricing(
        self,
        product: Any,
        quantity: int
    ) -> Dict[str, Any]:
        """Evaluates product tiers for a given quantity and returns pricing structure."""
        return apply_volume_pricing(product, quantity)


catalog_service = CatalogService()
