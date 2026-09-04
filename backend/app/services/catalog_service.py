from __future__ import annotations

import os
import sqlite3
import json
import uuid
import datetime
from typing import List, Dict, Any, Optional, Tuple

from app.schemas.catalog import (
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

# SQLite Database Setup
DB_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data"))
os.makedirs(DB_DIR, exist_ok=True)
CATALOG_DB_PATH = os.path.join(DB_DIR, "catalog.db")

# 50 Seed Products
RAW_SEED_PRODUCTS = [
    # 1. Payment Terminals & Smart POS
    {"sku": "RZP-POS-V3-PRO", "name": "Razorpay Smart POS Terminal V3 Pro", "brand": "Razorpay Hardware", "category": "Payment Terminals", "price": 14999.0, "cost_price": 9500.0, "original_price": 17999.0, "stock": 85, "reorder": 15, "image": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600", "tagline": "Next-gen all-in-one Android POS terminal with dual displays and 4G eSIM.", "desc": "Enterprise Android 13 POS terminal with 80mm/s thermal receipt printer, NFC, and Dynamic QR.", "features": ["NFC & Chip & PIN", "80mm/s Thermal Printer", "5.5\" HD IPS Screen"], "specs": [("OS", "Android 13"), ("Connectivity", "4G + Wi-Fi 6")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "BESTSELLER", "offer_discount_pct": 10.0},
    {"sku": "RZP-POS-MINI-X", "name": "Razorpay POS Mini Card Reader X", "brand": "Razorpay Hardware", "category": "Payment Terminals", "price": 4999.0, "cost_price": 2800.0, "original_price": 6499.0, "stock": 140, "reorder": 25, "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600", "tagline": "Ultra-portable Bluetooth mPOS reader for mobile payments.", "desc": "Pocket-sized mPOS reader with PIN pad and EMV L1/L2 certification.", "features": ["Bluetooth 5.0 Low Energy", "EMV Chip & Contactless", "OLED Display"], "specs": [("Battery", "1200mAh"), ("Weight", "145g")], "offer_text": "15% Seasonal Discount", "offer_badge": "FESTIVE SALE", "offer_discount_pct": 15.0},
    {"sku": "RZP-POS-COUNTER-DUAL", "name": "Razorpay Dual-Screen Countertop POS", "brand": "Razorpay Hardware", "category": "Payment Terminals", "price": 29999.0, "cost_price": 19500.0, "original_price": 34999.0, "stock": 42, "reorder": 10, "image": "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600", "tagline": "Dual-screen billing terminal with 15.6\" merchant screen and 10.1\" customer display.", "desc": "Premium heavy-duty retail billing station with aluminum alloy stand.", "features": ["15.6\" FHD + 10.1\" Customer Display", "Heavy-duty Aluminium Stand", "Auto-cut Thermal Printer"], "specs": [("Processor", "Octa-core 2.4GHz"), ("RAM", "8GB DDR4")], "offer_text": "Flat ₹3,000 Volume Rebate", "offer_badge": "ENTERPRISE", "offer_discount_pct": 10.0},
    {"sku": "RZP-POS-KIOSK-SELF", "name": "Razorpay Self-Checkout Floor Kiosk 21\"", "brand": "Razorpay Hardware", "category": "Payment Terminals", "price": 68999.0, "cost_price": 44000.0, "original_price": 79999.0, "stock": 18, "reorder": 5, "image": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600", "tagline": "Interactive 21.5\" FHD touchscreen self-checkout kiosk.", "desc": "Complete floor-standing self-service kiosk with integrated 2D barcode scanner.", "features": ["21.5\" Portrait FHD Touchscreen", "Integrated 2D Barcode Reader", "Heavy Duty Steel Enclosure"], "specs": [("Display", "21.5\" FHD IPS"), ("OS", "Android 12 Enterprise")], "offer_text": "Special Enterprise Discount", "offer_badge": "SELF-SERVICE", "offer_discount_pct": 12.0},
    {"sku": "VERIFONE-P400-PINPAD", "name": "VeriFone Engage P400 Color PIN Pad", "brand": "VeriFone", "category": "Payment Terminals", "price": 12499.0, "cost_price": 8200.0, "original_price": 14999.0, "stock": 65, "reorder": 12, "image": "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=600", "tagline": "Ergonomic color touchscreen PIN pad with advanced encryption.", "desc": "PCI PTS 5.X approved counter-top PIN pad for bank gateway compliance.", "features": ["3.5\" HVGA Color Screen", "PCI PTS 5.X Security", "Corning Gorilla Glass"], "specs": [("Security", "PCI PTS 5.X"), ("Display", "3.5\" Color Touch")], "offer_text": "10% Bulk Discount", "offer_badge": "BANK COMPLIANT", "offer_discount_pct": 10.0},
    {"sku": "PAX-A920-SMARTPOS", "name": "PAX A920 Pro Mobile Smart POS", "brand": "PAX Global", "category": "Payment Terminals", "price": 16999.0, "cost_price": 11000.0, "original_price": 19999.0, "stock": 55, "reorder": 10, "image": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600", "tagline": "Handheld Android terminal with high-speed Japanese Seiko printer.", "desc": "Ergonomic high-performance mobile terminal for restaurants and logistics.", "features": ["5.5\" IPS Touchscreen", "Dual 5MP + 0.3MP Cameras", "Seiko Fast Printer"], "specs": [("OS", "PayDroid based on Android"), ("Battery", "5250mAh Li-ion")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "PRO HARDWARE", "offer_discount_pct": 10.0},
    {"sku": "SUNMI-V2S-PORTABLE", "name": "SUNMI V2s Handheld POS Terminal", "brand": "SUNMI", "category": "Payment Terminals", "price": 11999.0, "cost_price": 7600.0, "original_price": 13999.0, "stock": 90, "reorder": 20, "image": "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600", "tagline": "Lightweight Android mobile terminal with 58mm label printing.", "desc": "Versatile mobile receipt and label printer terminal for queue busting.", "features": ["58mm Receipt & Label Dual Printing", "Drop-proof to 1.2m", "NFC Enabled"], "specs": [("OS", "Sunmi OS Android 11"), ("RAM/ROM", "2GB + 16GB")], "offer_text": "15% Special Discount", "offer_badge": "PORTABLE", "offer_discount_pct": 15.0},
    {"sku": "INGENICO-LANE-5000", "name": "Ingenico Lane/5000 Modular POS Terminal", "brand": "Ingenico", "category": "Payment Terminals", "price": 18999.0, "cost_price": 12500.0, "original_price": 22499.0, "stock": 35, "reorder": 8, "image": "https://images.unsplash.com/photo-1556742208-999815fca738?w=600", "tagline": "Modular retail pin pad for high-volume hypermarket checkout lanes.", "desc": "Heavy-duty lane terminal supporting signature capture and digital advertising.", "features": ["3.5\" Color Touchscreen", "PCI-PTS 5.x Certified", "Integrated Signature Capture"], "specs": [("Processor", "Cortex A5"), ("Memory", "512MB Flash + 512MB RAM")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "RETAIL HEAVY", "offer_discount_pct": 10.0},
    {"sku": "CASTLES-SATURN-1000", "name": "Castles Saturn 1000 Android POS", "brand": "Castles Technology", "category": "Payment Terminals", "price": 15499.0, "cost_price": 9900.0, "original_price": 18499.0, "stock": 48, "reorder": 10, "image": "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600", "tagline": "Ruggedized Android smart POS with optional barcode reader.", "desc": "Multi-application smart terminal for delivery agents and pop-up stores.", "features": ["5.5\" HD Display", "Front & Rear Camera", "4G LTE & GPS"], "specs": [("Battery", "6000mAh"), ("OS", "Android 10 Safe-OS")], "offer_text": "12% Off Volume Deal", "offer_badge": "RUGGED", "offer_discount_pct": 12.0},
    {"sku": "RZP-QR-STAND-ACTIVE", "name": "Razorpay Dynamic Active Display QR Stand", "brand": "Razorpay Hardware", "category": "Payment Terminals", "price": 3499.0, "cost_price": 1900.0, "original_price": 4499.0, "stock": 210, "reorder": 30, "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600", "tagline": "Smart e-ink dynamic QR stand with live payment amount display.", "desc": "Countertop e-ink QR stand displaying dynamic amount-locked UPI codes.", "features": ["E-ink Daylight Visible Screen", "Rechargeable 3-month Battery", "Direct Wi-Fi Sync"], "specs": [("Display", "2.9\" E-Paper Display"), ("Connectivity", "Wi-Fi 2.4GHz + BLE")], "offer_text": "20% Multi-Pack Off", "offer_badge": "SMART STAND", "offer_discount_pct": 20.0},

    # 2. Payment Audio Alerts & Soundboxes
    {"sku": "RZP-SBOX-4G-PRO", "name": "Razorpay Smart Soundbox 4G Pro", "brand": "Razorpay Hardware", "category": "Payment Audio Alerts", "price": 2499.0, "cost_price": 1350.0, "original_price": 2999.0, "stock": 320, "reorder": 50, "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600", "tagline": "Instant multilingual voice alert soundbox with pre-activated 4G SIM.", "desc": "High-volume 3W speaker broadcasting payment confirmations in 11 Indian languages.", "features": ["11 Regional Indian Languages", "95dB High-clarity Speaker", "Dual SIM Auto-switch"], "specs": [("Battery", "2600mAh (72h backup)"), ("Speaker Output", "3W Crystal Clear")], "offer_text": "15% Seasonal Discount", "offer_badge": "BEST AUDIO", "offer_discount_pct": 15.0},
    {"sku": "RZP-SBOX-SOLAR-ECO", "name": "Razorpay EcoSoundbox Solar Edition", "brand": "Razorpay Hardware", "category": "Payment Audio Alerts", "price": 2899.0, "cost_price": 1600.0, "original_price": 3499.0, "stock": 180, "reorder": 30, "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600", "tagline": "Solar-charging audio soundbox for outdoor kiosks and street vendors.", "desc": "Ruggedized IP54 water-resistant soundbox with integrated solar charging panel.", "features": ["Monocrystalline Solar Panel", "IP54 Dust & Rain Protection", "Instant 4G Voice Broadcast"], "specs": [("Solar Panel", "1.5W High-efficiency"), ("Battery", "3000mAh LiFePO4")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "SOLAR ECO", "offer_discount_pct": 10.0},
    {"sku": "PAYTM-SBOX-3-VOICE", "name": "Paytm Soundbox 3.0 Multilingual", "brand": "Paytm", "category": "Payment Audio Alerts", "price": 1999.0, "cost_price": 1100.0, "original_price": 2499.0, "stock": 250, "reorder": 40, "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600", "tagline": "Compact 4G soundbox with dynamic visual LED confirmation ring.", "desc": "Countertop audio notification speaker with 4G connectivity and multi-lingual voice.", "features": ["RGB Notification Ring", "4G VoLTE Support", "Long-lasting Battery"], "specs": [("Speaker", "2.5W Clear Sound"), ("Battery", "2000mAh")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "AUDIO", "offer_discount_pct": 10.0},
    {"sku": "PHONEPE-SPEAKER-G2", "name": "PhonePe SmartSpeaker G2", "brand": "PhonePe", "category": "Payment Audio Alerts", "price": 2199.0, "cost_price": 1200.0, "original_price": 2799.0, "stock": 210, "reorder": 35, "image": "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600", "tagline": "Smart audio alert box with built-in LCD display for payment amount.", "desc": "Dual confirmation device with audible voice announcements and numerical amount screen.", "features": ["Numeric LED Display", "High Gain 4G Antenna", "10 Indian Languages"], "specs": [("Display", "7-Segment LED"), ("Battery", "2500mAh")], "offer_text": "15% Special Discount", "offer_badge": "DUAL DISPLAY", "offer_discount_pct": 15.0},
    {"sku": "BHARATPE-CLUB-SPEAKER", "name": "BharatPe Club Speaker 4G", "brand": "BharatPe", "category": "Payment Audio Alerts", "price": 1849.0, "cost_price": 1050.0, "original_price": 2299.0, "stock": 190, "reorder": 30, "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600", "tagline": "Ruggedized 4G audio box with 100dB speaker output.", "desc": "High-volume audio soundbox engineered for noisy fish markets and crowded bazaars.", "features": ["100dB Ultra-loud Audio", "Heavy-duty ABS Case", "Instant QR Pairing"], "specs": [("Decibel Level", "100dB at 1m"), ("Battery", "2200mAh")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "LOUD AUDIO", "offer_discount_pct": 10.0},
    {"sku": "GPAY-SOUNDPOD-LITE", "name": "Google Pay SoundPod Pro", "brand": "Google Pay", "category": "Payment Audio Alerts", "price": 2299.0, "cost_price": 1300.0, "original_price": 2699.0, "stock": 160, "reorder": 25, "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600", "tagline": "Minimalist soundbox powered by Google assistant voice engine.", "desc": "Modern circular soundbox with clean aesthetics and crystal-clear voice clarity.", "features": ["Natural Voice Synthesis", "Fast Type-C Charging", "Dual Band Wi-Fi + 4G"], "specs": [("Charging", "USB Type-C Fast Charge"), ("Weight", "210g")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "MINIMALIST", "offer_discount_pct": 10.0},

    # 3. FinOps & Enterprise Software Licenses
    {"sku": "RZP-RECON-ENT-ANNUAL", "name": "RazorRecon Enterprise License (Annual)", "brand": "RazorRecon SaaS", "category": "FinOps Software", "price": 74999.0, "cost_price": 18000.0, "original_price": 99999.0, "stock": 500, "reorder": 50, "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", "tagline": "Unlimited 3-way multi-channel financial reconciliation with AI CFO copilot.", "desc": "Annual enterprise license with continuous ERP ledger sync, vendor behavioral memory, and autonomous month-end close.", "features": ["Unlimited Multi-Channel Transactions", "ReAct AI CFO Copilot", "Autonomous 7-phase Month Close"], "specs": [("Deployment", "Cloud SaaS & Dedicated VPC"), ("SLA", "99.99% Guaranteed")], "offer_text": "Flat ₹5,000 Annual Rebate", "offer_badge": "ENTERPRISE", "offer_discount_pct": 10.0},
    {"sku": "RZP-RECON-STARTER", "name": "RazorRecon Growth License (Quarterly)", "brand": "RazorRecon SaaS", "category": "FinOps Software", "price": 19999.0, "cost_price": 5000.0, "original_price": 24999.0, "stock": 500, "reorder": 50, "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600", "tagline": "Quarterly reconciliation package for high-growth D2C brands.", "desc": "Processes up to 50,000 monthly transactions across Razorpay, Stripe, and Shopify.", "features": ["50,000 Monthly Transactions", "Automated GST 3-Way Match", "Exception Queue Resolution"], "specs": [("Seats", "5 Concurrent Finance Users"), ("Support", "Business Hours Email & Chat")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "GROWTH", "offer_discount_pct": 10.0},
    {"sku": "RZP-GST-API-ANNUAL", "name": "RazorGST Automated Filing & Reconciliation API", "brand": "RazorRecon SaaS", "category": "FinOps Software", "price": 34999.0, "cost_price": 8500.0, "original_price": 42999.0, "stock": 500, "reorder": 50, "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600", "tagline": "Direct NIC GSP integration for GSTR-1, GSTR-2B, and GSTR-3B auto-filing.", "desc": "Real-time GST compliance engine verifying HSN rates, ITC eligibility, and counterparty e-invoices.", "features": ["GSTR-2B Instant Inward ITC Match", "Automated E-Way Bill Generation", "Section 194R TDS Audit Tool"], "specs": [("API Quota", "Unlimited API Calls"), ("Security", "ISO 27001 Certified")], "offer_text": "15% Special Discount", "offer_badge": "GST COMPLIANCE", "offer_discount_pct": 15.0},
    {"sku": "TALLY-PRIME-GOLD-ENT", "name": "TallyPrime Gold (Multi-User Enterprise)", "brand": "Tally Solutions", "category": "FinOps Software", "price": 54000.0, "cost_price": 38000.0, "original_price": 60000.0, "stock": 100, "reorder": 15, "image": "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600", "tagline": "Perpetual multi-user business management and accounting software.", "desc": "Industry-standard Indian ERP software for inventory, payroll, statutory tax, and bank reconciliation.", "features": ["Unlimited Multi-User LAN Access", "Tally Software Services (TSS) 1 Year", "Direct Banking Sync"], "specs": [("License Type", "Perpetual Multi-User"), ("OS", "Windows Server / 10 / 11")], "offer_text": "Flat ₹4,000 Bundle Off", "offer_badge": "ACCOUNTING", "offer_discount_pct": 8.0},
    {"sku": "ZOHO-ONE-SUITE-ANNUAL", "name": "Zoho One All-In-One Business OS (Annual)", "brand": "Zoho Corp", "category": "FinOps Software", "price": 28800.0, "cost_price": 20000.0, "original_price": 34000.0, "stock": 200, "reorder": 30, "image": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600", "tagline": "Comprehensive suite of 45+ integrated SaaS applications for finance and ops.", "desc": "Full business management suite including Zoho Books, Inventory, CRM, and Analytics.", "features": ["45+ Business Applications", "Integrated Zoho Books & Payroll", "Custom Deluge Scripting"], "specs": [("Billing", "Annual per Employee"), ("Cloud", "Encrypted Indian Data Centers")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "SAAS SUITE", "offer_discount_pct": 10.0},
    {"sku": "QUICKBOOKS-ONLINE-PLUS", "name": "Intuit QuickBooks Online Plus (Annual)", "brand": "Intuit", "category": "FinOps Software", "price": 14999.0, "cost_price": 9500.0, "original_price": 18999.0, "stock": 150, "reorder": 20, "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600", "tagline": "Cloud accounting software with advanced inventory tracking and bill management.", "desc": "Streamline cash flow tracking, invoice generation, and expense categorization.", "features": ["Track Project Profitability", "Manage 1099 / TDS Contractors", "5 Concurrent Users"], "specs": [("Platform", "Web, iOS, Android"), ("Backup", "Automated Daily Cloud Backup")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "CLOUD BOOKS", "offer_discount_pct": 10.0},
    {"sku": "ORACLE-NETSUITE-CONNECTOR", "name": "RazorRecon NetSuite Two-Way ERP Connector", "brand": "RazorRecon SaaS", "category": "FinOps Software", "price": 49999.0, "cost_price": 12000.0, "original_price": 64999.0, "stock": 300, "reorder": 25, "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", "tagline": "Automated bi-directional sync between payment gateways and Oracle NetSuite.", "desc": "Eliminates CSV exports with scheduled automated journal postings and sub-ledger reconciliation.", "features": ["Near Real-time Webhook Sync", "Automated GL Account Mapping", "Multi-Currency Netting"], "specs": [("Architecture", "SuiteTalk REST Web Services"), ("Certification", "Built for NetSuite Verified")], "offer_text": "15% Special Discount", "offer_badge": "NETSUITE SYNC", "offer_discount_pct": 15.0},
    {"sku": "CLOUD-COST-SENTINEL", "name": "CloudFinOps AWS & Azure Cost Optimizer", "brand": "RazorRecon SaaS", "category": "FinOps Software", "price": 22499.0, "cost_price": 6000.0, "original_price": 29999.0, "stock": 400, "reorder": 40, "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600", "tagline": "Automated cloud infrastructure spend anomaly detection and RI manager.", "desc": "Slashes AWS and Google Cloud billing waste by 30% through automated rightsizing.", "features": ["Spot Instance Auto-Switcher", "Unattached EBS Volume Cleanup", "Slack Spend Spike Alerts"], "specs": [("Supported Clouds", "AWS, Azure, GCP, OCI"), ("Read-Only Access", "IAM Role Based Delegation")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "CLOUD FINOPS", "offer_discount_pct": 10.0},

    # 4. Workstations & Peripherals
    {"sku": "KEYCHRON-Q3-PRO", "name": "Keychron Q3 Pro SE Wireless Mechanical Keyboard", "brand": "Keychron", "category": "Workstations & Peripherals", "price": 18499.0, "cost_price": 11500.0, "original_price": 21999.0, "stock": 45, "reorder": 10, "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", "tagline": "Full CNC aluminum custom wireless mechanical keyboard with macro knob.", "desc": "Custom mechanical keyboard with QMK/VIA key remapping, hot-swappable switches, and double-gasket dampening.", "features": ["Full CNC Aluminum Body", "QMK/VIA Programmable Knob", "South-facing RGB LEDs"], "specs": [("Connectivity", "Bluetooth 5.1 + Type-C"), ("Switches", "K Pro Banana Tactile")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "DEV FAVORITE", "offer_discount_pct": 10.0},
    {"sku": "DELL-U4025QW-5K2K", "name": "Dell UltraSharp 40\" Curved 5K2K Thunderbolt Hub Monitor", "brand": "Dell", "category": "Workstations & Peripherals", "price": 139999.0, "cost_price": 98000.0, "original_price": 159999.0, "stock": 22, "reorder": 5, "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600", "tagline": "120Hz IPS Black 5K2K curved ultrawide financial trading display.", "desc": "High-resolution display for financial modelers and data analysts with 140W Thunderbolt 4 hub.", "features": ["5120 x 2160 WUHD Resolution", "120Hz Refresh Rate with IPS Black", "140W Thunderbolt 4 Power Delivery"], "specs": [("Color Gamut", "99% DCI-P3 / 100% sRGB"), ("Ports", "Thunderbolt 4, RJ45 2.5GbE, HDMI 2.1")], "offer_text": "Flat ₹10,000 Pro Display Rebate", "offer_badge": "5K2K PRO", "offer_discount_pct": 7.0},
    {"sku": "LOGI-MX-MASTER-3S", "name": "Logitech MX Master 3S Wireless Performance Mouse", "brand": "Logitech", "category": "Workstations & Peripherals", "price": 9995.0, "cost_price": 6200.0, "original_price": 11495.0, "stock": 95, "reorder": 20, "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600", "tagline": "Quiet click ergonomic mouse with 8000 DPI MagSpeed electromagnetic scroll.", "desc": "Ergonomic productivity mouse capable of scrolling 1,000 lines per second across spreadsheets.", "features": ["MagSpeed Electromagnetic Scrolling", "Quiet Clicks (90% noise reduction)", "8K DPI Glass Surface Tracking"], "specs": [("Sensor", "Darkfield High Precision"), ("Battery", "500mAh (Up to 70 days)")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "ERGONOMIC", "offer_discount_pct": 10.0},
    {"sku": "LOGI-MX-KEYS-S", "name": "Logitech MX Keys S Wireless Illuminated Keyboard", "brand": "Logitech", "category": "Workstations & Peripherals", "price": 11495.0, "cost_price": 7200.0, "original_price": 12995.0, "stock": 70, "reorder": 15, "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", "tagline": "Low-profile smart backlighting keyboard with spherically dished keys.", "desc": "Fluid, natural keystrokes engineered for accountants, developers, and writers.", "features": ["Smart Proximity Backlighting", "Smart Actions Automation", "Multi-Device Easy-Switch"], "specs": [("Layout", "Full Size with Numpad"), ("Wireless", "Bluetooth Low Energy + Logi Bolt")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "FLUID TYPING", "offer_discount_pct": 10.0},
    {"sku": "BENQ-PD3225U-4K", "name": "BenQ DesignVue PD3225U 32\" 4K Thunderbolt Monitor", "brand": "BenQ", "category": "Workstations & Peripherals", "price": 94990.0, "cost_price": 66000.0, "original_price": 109990.0, "stock": 16, "reorder": 4, "image": "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600", "tagline": "Calibrated 4K HDR display with M-Book mode and dual color gamut.", "desc": "Calman and Pantone validated 4K monitor designed for dual Mac and Windows workstations.", "features": ["Thunderbolt 3 with 85W Daisy Chain", "Hotkey Puck G2 Controller", "KVM Switch Built-in"], "specs": [("Resolution", "3840 x 2160 IPS"), ("Contrast", "2000:1 IPS Black")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "4K PRO", "offer_discount_pct": 10.0},
    {"sku": "CALDIGIT-TS4-DOCK", "name": "CalDigit TS4 Thunderbolt 4 18-Port Dock", "brand": "CalDigit", "category": "Workstations & Peripherals", "price": 38999.0, "cost_price": 26000.0, "original_price": 44999.0, "stock": 30, "reorder": 6, "image": "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600", "tagline": "The flagship 18-port Thunderbolt 4 hub with 98W laptop charging.", "desc": "Connect up to dual 6K displays, 2.5GbE LAN, UHS-II SD cards, and high-speed NVMe storage.", "features": ["18 Connectivity Ports", "98W Power Delivery to Host", "2.5 Gigabit Ethernet Port"], "specs": [("Interface", "Thunderbolt 4 (40Gb/s)"), ("Chassis", "Solid Aluminum Heat Dissipation")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "THUNDERBOLT", "offer_discount_pct": 10.0},
    {"sku": "APPLE-STUDIO-DISPLAY", "name": "Apple Studio Display 27\" 5K Retina (Tilt Stand)", "brand": "Apple", "category": "Workstations & Peripherals", "price": 159900.0, "cost_price": 128000.0, "original_price": 169900.0, "stock": 12, "reorder": 3, "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600", "tagline": "27-inch 5K Retina display with 12MP Ultra Wide camera and Center Stage.", "desc": "Immersive 5K screen with A13 Bionic chip, studio-quality 3-mic array, and 6-speaker sound system.", "features": ["5120 x 2880 5K Retina Resolution", "600 Nits Brightness & P3 Wide Color", "12MP Ultra-wide Cam with Center Stage"], "specs": [("Glass", "Standard Glass with Anti-reflective"), ("Audio", "6-Speaker Sound System with Spatial Audio")], "offer_text": "5% Corporate Rebate", "offer_badge": "RETINA 5K", "offer_discount_pct": 5.0},
    {"sku": "HERMAN-MILLER-AERON", "name": "Herman Miller Aeron Ergonomic Office Chair (Size B)", "brand": "Herman Miller", "category": "Workstations & Peripherals", "price": 129000.0, "cost_price": 92000.0, "original_price": 145000.0, "stock": 14, "reorder": 3, "image": "https://images.unsplash.com/photo-1580481077195-c3a9a32249ce?w=600", "tagline": "The gold standard in ergonomic office seating with Pellicle 8Z mesh.", "desc": "Full posture support with PostureFit SL sacral pads and fully adjustable armrests.", "features": ["Pellicle 8Z Breathable Suspension", "PostureFit SL Dual Lumbar Support", "12-Year Herman Miller Warranty"], "specs": [("Frame/Base", "Graphite Finish"), ("Tilt Mechanism", "Forward & Recline Limiter")], "offer_text": "Flat ₹10,000 Corporate Deal", "offer_badge": "ERGONOMIC GOLD", "offer_discount_pct": 8.0},
    {"sku": "STREAMDECK-XL-MACRO", "name": "Elgato Stream Deck XL (32 LCD Macro Keys)", "brand": "Elgato", "category": "Workstations & Peripherals", "price": 24999.0, "cost_price": 16000.0, "original_price": 28999.0, "stock": 38, "reorder": 8, "image": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600", "tagline": "32 customizable LCD keys for 1-touch Excel macros and FinOps automation.", "desc": "Assign complex hotkeys, ERP navigation shortcuts, and script triggers to bright visual buttons.", "features": ["32 Custom LCD Keys", "Direct FinOps Macro Integration", "Magnetic Non-slip Stand"], "specs": [("Interface", "USB 3.0 Type-C"), ("Dimensions", "182 x 112 x 34 mm")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "MACRO PRO", "offer_discount_pct": 10.0},
    {"sku": "SATECHI-DESK-MAT-LEATHER", "name": "Satechi Eco-Leather Extended Desk Mat", "brand": "Satechi", "category": "Workstations & Peripherals", "price": 3999.0, "cost_price": 1800.0, "original_price": 4999.0, "stock": 120, "reorder": 20, "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", "tagline": "Water-resistant premium vegan leather executive desk protector.", "desc": "Clean, smooth surface protecting wood desks while providing smooth mouse tracking.", "features": ["High-grade Polyurethane (PU) Leather", "Spill & Scratch Resistant", "Non-slip Suede Base"], "specs": [("Dimensions", "58 x 31 cm"), ("Color", "Midnight Black")], "offer_text": "20% Add-on Deal", "offer_badge": "ACCESSORY", "offer_discount_pct": 20.0},

    # 5. Security & Access Tokens
    {"sku": "YUBIKEY-BIO-FIDO2", "name": "Yubico YubiKey Bio FIDO Edition (USB-A)", "brand": "Yubico", "category": "Security & Access Tokens", "price": 8999.0, "cost_price": 5400.0, "original_price": 10499.0, "stock": 110, "reorder": 20, "image": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600", "tagline": "Biometric fingerprint hardware security key for passwordless login.", "desc": "FIDO2 / WebAuthn hardware token storing biometric templates on a secure element chip.", "features": ["Fingerprint Biometric Authentication", "FIDO2, U2F, WebAuthn Certified", "Hardware Secure Element Chip"], "specs": [("Form Factor", "USB-A Connector"), ("Durability", "IP68 Dust & Water Resistant")], "offer_text": "15% Security Deal", "offer_badge": "FIDO2 BIO", "offer_discount_pct": 15.0},
    {"sku": "YUBIKEY-5C-NFC", "name": "Yubico YubiKey 5C NFC Multi-Protocol Key", "brand": "Yubico", "category": "Security & Access Tokens", "price": 6499.0, "cost_price": 3800.0, "original_price": 7499.0, "stock": 145, "reorder": 25, "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600", "tagline": "Universal dual USB-C and NFC hardware security token.", "desc": "Multi-protocol authentication token supporting OTP, smart card PIV, OpenPGP, and FIDO2.", "features": ["Dual USB-C & NFC Interfaces", "Smart Card / PIV Support", "No Batteries or Moving Parts"], "specs": [("Protocols", "FIDO2, U2F, Smart Card, OTP"), ("Material", "Reinforced Fiberglass")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "MULTI-PROTOCOL", "offer_discount_pct": 10.0},
    {"sku": "FEITIAN-BIOPASS-K27", "name": "FEITIAN BioPass FIDO2 USB-C Security Key", "brand": "FEITIAN", "category": "Security & Access Tokens", "price": 5999.0, "cost_price": 3500.0, "original_price": 6999.0, "stock": 85, "reorder": 15, "image": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600", "tagline": "Cost-effective biometric security token with Type-C plug.", "desc": "Fast fingerprint verification preventing phishing and corporate credential stuffing.", "features": ["Capacitive Fingerprint Sensor", "FIDO2 Level 2 Certified", "Windows Hello & Google Workspace"], "specs": [("Connector", "USB Type-C"), ("Crypto Chip", "EAL 6+ Certified")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "SECURE TOKEN", "offer_discount_pct": 10.0},
    {"sku": "LEDGER-NANO-X-CRYPTO", "name": "Ledger Nano X Corporate Treasury Crypto Key", "brand": "Ledger", "category": "Security & Access Tokens", "price": 15999.0, "cost_price": 10200.0, "original_price": 18499.0, "stock": 40, "reorder": 8, "image": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600", "tagline": "Bluetooth hardware wallet with CC EAL5+ certified secure element.", "desc": "Secure management of corporate Web3 treasury assets and multi-sig contract signing.", "features": ["CC EAL5+ Certified Secure Chip", "Bluetooth Low Energy for Mobile", "Stores up to 100 App Signers"], "specs": [("Screen", "OLED Display 128x64"), ("Battery", "100mAh Li-ion")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "TREASURY SECURE", "offer_discount_pct": 10.0},
    {"sku": "TREZOR-SAFE-5-CRYPTO", "name": "Trezor Safe 5 Enterprise Edition", "brand": "Trezor", "category": "Security & Access Tokens", "price": 17499.0, "cost_price": 11500.0, "original_price": 19999.0, "stock": 32, "reorder": 6, "image": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600", "tagline": "Open-source hardware token with color touchscreen and haptic feedback.", "desc": "Enterprise hardware wallet with Shamir backup support for multi-stakeholder keys.", "features": ["Color Touchscreen with Haptics", "NDA-free Secure Element EAL 6+", "Shamir Multi-share Backup"], "specs": [("Display", "1.54\" Color OLED"), ("Connector", "USB-C with MicroSD Slot")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "OPEN SOURCE", "offer_discount_pct": 10.0},
    {"sku": "HID-OMNIKEY-5427", "name": "HID OMNIKEY 5427 CK Contactless Smart Card Reader", "brand": "HID Global", "category": "Security & Access Tokens", "price": 7899.0, "cost_price": 4900.0, "original_price": 9499.0, "stock": 60, "reorder": 12, "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600", "tagline": "Dual-frequency 13.56 MHz and 125 kHz employee badge reader.", "desc": "Integrates physical building access badges with workstation login authentication.", "features": ["Dual Frequency (Low & High Freq)", "Supports Seos, iCLASS, MIFARE", "CCID USB Interface"], "specs": [("Frequency", "13.56MHz & 125kHz"), ("Interface", "USB 2.0 CCID")], "offer_text": "12% Off Volume Deal", "offer_badge": "BADGE READER", "offer_discount_pct": 12.0},

    # 6. Storage & Servers
    {"sku": "SYNOLOGY-DS923-PLUS", "name": "Synology DiskStation DS923+ 4-Bay NAS", "brand": "Synology", "category": "Storage & Servers", "price": 58999.0, "cost_price": 41000.0, "original_price": 68999.0, "stock": 25, "reorder": 5, "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600", "tagline": "Compact 4-bay NAS for statutory finance document archiving and backup.", "desc": "AMD Ryzen R1600 dual-core processor, ECC memory, and optional 10GbE network expansion.", "features": ["4 Drive Bays (Expandable to 9)", "ECC RAM with Btrfs File Self-Healing", "Active Backup for Microsoft 365 / ERP"], "specs": [("CPU", "AMD Ryzen R1600 Dual-Core 2.6GHz"), ("RAM", "4GB DDR4 ECC (Max 32GB)")], "offer_text": "Flat ₹4,000 Storage Deal", "offer_badge": "FINANCE ARCHIVE", "offer_discount_pct": 7.0},
    {"sku": "SYNOLOGY-DS1821-PLUS", "name": "Synology DiskStation DS1821+ 8-Bay High Capacity NAS", "brand": "Synology", "category": "Storage & Servers", "price": 104999.0, "cost_price": 75000.0, "original_price": 119999.0, "stock": 14, "reorder": 3, "image": "https://images.unsplash.com/photo-1597852074816-d933c4d2b988?w=600", "tagline": "8-bay quad-core NAS designed for enterprise accounting and ledger vaults.", "desc": "High-throughput storage server with dual M.2 NVMe SSD cache slots and PCIe Gen3 x8 expansion.", "features": ["8 Drive Bays (Up to 144TB raw)", "Dual M.2 NVMe Cache Slots", "PCIe 10GbE NIC Expansion"], "specs": [("CPU", "AMD Ryzen V1500B Quad-Core 2.2GHz"), ("LAN", "4x 1GbE RJ-45 with Link Aggregation")], "offer_text": "Flat ₹8,000 Enterprise Off", "offer_badge": "8-BAY HEAVY", "offer_discount_pct": 8.0},
    {"sku": "DELL-POWEREDGE-R250", "name": "Dell PowerEdge R250 1U Rack Server", "brand": "Dell", "category": "Storage & Servers", "price": 119000.0, "cost_price": 84000.0, "original_price": 139000.0, "stock": 10, "reorder": 2, "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600", "tagline": "Affordable 1U rackmount server for on-premise ERP and accounting databases.", "desc": "Intel Xeon E-2300 processor, iDRAC9 remote management, and hot-plug redundant power supplies.", "features": ["Intel Xeon E-2324G Quad-Core", "iDRAC9 Enterprise Remote Management", "4x 3.5\" Hot-plug Drive Bays"], "specs": [("Chassis", "1U Rackmount"), ("Power", "Dual 450W Redundant PSU")], "offer_text": "Flat ₹10,000 Server Deal", "offer_badge": "1U RACK SERVER", "offer_discount_pct": 8.0},
    {"sku": "QNAP-TS464-8G", "name": "QNAP TS-464 4-Bay 2.5GbE Multimedia & Data NAS", "brand": "QNAP", "category": "Storage & Servers", "price": 54999.0, "cost_price": 38000.0, "original_price": 62999.0, "stock": 20, "reorder": 4, "image": "https://images.unsplash.com/photo-1597852074816-d933c4d2b988?w=600", "tagline": "Intel Celeron quad-core NAS with dual 2.5GbE and HDMI 4K output.", "desc": "High-speed local ledger and media storage with Intel OpenVINO AI recognition.", "features": ["Dual 2.5GbE Network Ports", "Intel UHD Graphics with 4K HDMI", "2x M.2 PCIe Gen3 NVMe Slots"], "specs": [("CPU", "Intel Celeron N5105 Quad-Core 2.0GHz"), ("RAM", "8GB Onboard Non-ECC")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "2.5GbE NAS", "offer_discount_pct": 10.0},
    {"sku": "SEAGATE-IRONWOLF-PRO-16TB", "name": "Seagate IronWolf Pro 16TB Enterprise NAS Hard Drive", "brand": "Seagate", "category": "Storage & Servers", "price": 32999.0, "cost_price": 22000.0, "original_price": 38999.0, "stock": 80, "reorder": 15, "image": "https://images.unsplash.com/photo-1597852074816-d933c4d2b988?w=600", "tagline": "7200 RPM CMR enterprise NAS drive with 300TB/year workload rating.", "desc": "Rotational vibration (RV) sensors, 2.5M hours MTBF, and 5-year Rescue Data Recovery warranty.", "features": ["7200 RPM CMR Recording Technology", "AgileArray NAS Optimization", "5 Years Data Recovery Warranty"], "specs": [("Capacity", "16TB"), ("Cache", "256MB"), ("Interface", "SATA 6Gb/s")], "offer_text": "15% Special Discount", "offer_badge": "CMR ENTERPRISE", "offer_discount_pct": 15.0},

    # 7. Retail Peripherals & Accessories
    {"sku": "ZEBRA-DS2208-SCANNER", "name": "Zebra DS2208 1D/2D Handheld Barcode Scanner", "brand": "Zebra Technologies", "category": "Retail Peripherals", "price": 6499.0, "cost_price": 3900.0, "original_price": 7999.0, "stock": 130, "reorder": 25, "image": "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=600", "tagline": "Omnidirectional 2D barcode imager with hands-free presentation stand.", "desc": "Instant scanning of QR codes, damaged paper barcodes, and mobile wallet screens.", "features": ["Reads 1D, 2D, QR & PDF417 Codes", "Includes Adjustable Hands-Free Stand", "Plug and Play USB Setup"], "specs": [("Drop Spec", "Withstands 1.5m drops to concrete"), ("Interface", "USB Host")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "2D SCANNER", "offer_discount_pct": 10.0},
    {"sku": "HONEYWELL-1472G-WIRELESS", "name": "Honeywell Voyager Extreme 1472g Wireless Scanner", "brand": "Honeywell", "category": "Retail Peripherals", "price": 14499.0, "cost_price": 9200.0, "original_price": 16999.0, "stock": 50, "reorder": 10, "image": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600", "tagline": "Cordless 2D imager with 30-meter Bluetooth range and durable cradle.", "desc": "Extended range wireless scanning designed for large warehouse and retail floors.", "features": ["30m Bluetooth Operating Range", "Up to 50,000 Scans per Charge", "IP42 Water & Dust Sealed"], "specs": [("Battery", "2400mAh Li-ion"), ("Wireless", "2.4GHz Bluetooth 4.2")], "offer_text": "12% Off Volume Deal", "offer_badge": "WIRELESS 2D", "offer_discount_pct": 12.0},
    {"sku": "EPSON-TM-T88VII-PRINTER", "name": "Epson TM-T88VII High-Speed Thermal Receipt Printer", "brand": "Epson", "category": "Retail Peripherals", "price": 21999.0, "cost_price": 14500.0, "original_price": 25999.0, "stock": 60, "reorder": 12, "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600", "tagline": "Ultra-fast 500mm/s receipt printer with multi-interface connectivity.", "desc": "The benchmark thermal receipt printer with USB, Ethernet, and Cloud Web Print.", "features": ["500 mm/sec Blazing Fast Print Speed", "Direct Web & Cloud Server Printing", "Auto-Cutter Rated for 3M Cuts"], "specs": [("Resolution", "180 dpi"), ("Interface", "USB + Ethernet + Serial")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "500mm/s FAST", "offer_discount_pct": 10.0},
    {"sku": "APG-SERIES-100-CASH-DRAWER", "name": "APG Series 100 Heavy Duty Steel Cash Drawer", "brand": "APG Cash Drawer", "category": "Retail Peripherals", "price": 8999.0, "cost_price": 5400.0, "original_price": 10999.0, "stock": 75, "reorder": 15, "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600", "tagline": "Industrial steel cash drawer with 5 bill and 8 coin compartments.", "desc": "Tested for over 4 million open-close cycles with dual media slots and multiPRO printer interface.", "features": ["Heavy Gauge Steel Construction", "Tested to 4+ Million Cycles", "RJ12 Receipt Printer Triggered"], "specs": [("Dimensions", "406 x 424 x 107 mm"), ("Lock", "4-Function Key Lock")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "HEAVY STEEL", "offer_discount_pct": 10.0},
    {"sku": "SONY-WH1000XM5-NOISE", "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", "brand": "Sony", "category": "Retail Peripherals", "price": 29990.0, "cost_price": 21000.0, "original_price": 34990.0, "stock": 40, "reorder": 8, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", "tagline": "Industry-leading active noise cancellation for high-focus finance floors.", "desc": "Dual processor ANC with 8 microphones, LDAC Hi-Res audio, and 30-hour battery life.", "features": ["Dual Processor V1 & QN1 ANC", "8-Mic Precise Voice Pickup", "30-Hour Battery with Fast Charge"], "specs": [("Battery", "30h with ANC on"), ("Weight", "250g Lightweight")], "offer_text": "10% Off with RAZOR2026", "offer_badge": "NOISE CANCEL", "offer_discount_pct": 10.0}
]

# 5 Promo Offers for the Offer Engine
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
            # 1. Products Table
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
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # 2. Offers Table
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

            # 3. Check if products exist, otherwise seed
            cursor.execute("SELECT COUNT(*) as cnt FROM products")
            row = cursor.fetchone()
            if row["cnt"] == 0:
                self._seed_data(cursor)
                conn.commit()

    def _seed_data(self, cursor: sqlite3.Cursor):
        now_str = datetime.datetime.now().isoformat()
        
        # Seed Offers
        for off in SEED_OFFERS:
            cursor.execute("""
                INSERT OR IGNORE INTO offers (
                    id, code, title, discount_type, discount_value,
                    min_order_value, badge_label, category_restriction, active, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                off["id"], off["code"], off["title"], off["discount_type"], off["discount_value"],
                off["min_order_value"], off["badge_label"], off["category_restriction"], off["active"], now_str
            ))

        # Seed Products
        for p in RAW_SEED_PRODUCTS:
            pid = f"prod_{uuid.uuid4().hex[:10]}"
            stock_status = "In Stock" if p["stock"] > p["reorder"] else ("Low Stock" if p["stock"] > 0 else "Out of Stock")
            in_stock = 1 if p["stock"] > 0 else 0
            
            cursor.execute("""
                INSERT OR IGNORE INTO products (
                    id, sku, name, brand, category, price, cost_price, original_price,
                    currency, stock_quantity, reorder_threshold, stock_status,
                    rating, reviews_count, image_url, tagline, description,
                    features, specs, in_stock, delivery_time, gst_rate_pct, hsn_sac_code,
                    offer_id, offer_text, offer_discount_pct, offer_badge,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pid, p["sku"], p["name"], p["brand"], p["category"], p["price"], p["cost_price"], p["original_price"],
                "INR", p["stock"], p["reorder"], stock_status,
                4.8, 120, p["image"], p["tagline"], p["desc"],
                json.dumps(p["features"]), json.dumps([{"key": k, "value": v} for k, v in p["specs"]]), in_stock,
                "2-3 business days", 18.0, "8470",
                "off_razor2026", p["offer_text"], p["offer_discount_pct"], p["offer_badge"],
                now_str, now_str
            ))

    def _row_to_dto(self, r: sqlite3.Row) -> ProductDetailDTO:
        features = json.loads(r["features"]) if r["features"] else []
        specs_raw = json.loads(r["specs"]) if r["specs"] else []
        specs = [ProductSpecDTO(key=s.get("key", ""), value=s.get("value", "")) for s in specs_raw]

        return ProductDetailDTO(
            id=r["id"],
            sku=r["sku"],
            name=r["name"],
            brand=r["brand"],
            category=r["category"],
            price=float(r["price"]),
            cost_price=float(r["cost_price"]),
            original_price=float(r["original_price"]) if r["original_price"] is not None else None,
            currency=r["currency"],
            stock_quantity=int(r["stock_quantity"]),
            reorder_threshold=int(r["reorder_threshold"]),
            stock_status=r["stock_status"],
            rating=float(r["rating"]),
            reviews_count=int(r["reviews_count"]),
            image_url=r["image_url"],
            tagline=r["tagline"] or "",
            description=r["description"] or "",
            features=features,
            specs=specs,
            in_stock=bool(r["in_stock"]),
            delivery_time=r["delivery_time"] or "2-3 business days",
            gst_rate_pct=float(r["gst_rate_pct"]),
            hsn_sac_code=r["hsn_sac_code"] or "8470",
            offer_id=r["offer_id"],
            offer_text=r["offer_text"],
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
        sort_dir: str = "desc"
    ) -> ProductListResponseDTO:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            where_clauses = []
            params: List[Any] = []

            if category and category.lower() != "all":
                where_clauses.append("category = ?")
                params.append(category)

            if stock_status and stock_status.lower() != "all":
                where_clauses.append("stock_status = ?")
                params.append(stock_status)

            search_val = search or query
            if search_val and search_val.strip():
                where_clauses.append("(name LIKE ? OR sku LIKE ? OR brand LIKE ? OR description LIKE ? OR tagline LIKE ?)")
                q_param = f"%{search_val.strip()}%"
                params.extend([q_param, q_param, q_param, q_param, q_param])

            if min_price is not None:
                where_clauses.append("price >= ?")
                params.append(min_price)

            if max_price is not None:
                where_clauses.append("price <= ?")
                params.append(max_price)

            where_str = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

            # Count total
            cursor.execute(f"SELECT COUNT(*) as total FROM products {where_str}", tuple(params))
            total_count = cursor.fetchone()["total"]

            # Sort mapping
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

            # Get distinct categories
            cursor.execute("SELECT DISTINCT category FROM products ORDER BY category")
            categories = [r["category"] for r in cursor.fetchall()]

            total_pages = max(1, (total_count + limit - 1) // limit)

            return ProductListResponseDTO(
                products=products,
                total_count=total_count,
                page=page,
                limit=limit,
                total_pages=total_pages,
                categories=categories
            )


    def get_product_by_id(self, product_id: str) -> Optional[ProductDetailDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM products WHERE id = ? OR sku = ?", (product_id, product_id))
            row = cursor.fetchone()
            if not row:
                return None
            return self._row_to_dto(row)

    def create_product(self, data: ProductCreateDTO) -> ProductDetailDTO:
        pid = f"prod_{uuid.uuid4().hex[:10]}"
        sku = data.sku or f"RZP-{uuid.uuid4().hex[:6].upper()}"
        cost_price = data.cost_price if data.cost_price is not None else round(data.price * 0.65, 2)
        stock_status = "In Stock" if data.stock_quantity > data.reorder_threshold else ("Low Stock" if data.stock_quantity > 0 else "Out of Stock")
        in_stock = 1 if data.stock_quantity > 0 else 0
        now_str = datetime.datetime.now().isoformat()
        image_url = data.image_url or "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600"

        features_json = json.dumps(data.features or [])
        specs_json = json.dumps([s.model_dump() for s in (data.specs or [])])

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO products (
                    id, sku, name, brand, category, price, cost_price, original_price,
                    currency, stock_quantity, reorder_threshold, stock_status,
                    rating, reviews_count, image_url, tagline, description,
                    features, specs, in_stock, delivery_time, gst_rate_pct, hsn_sac_code,
                    offer_id, offer_text, offer_discount_pct, offer_badge,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pid, sku, data.name, data.brand, data.category, data.price, cost_price, data.original_price,
                "INR", data.stock_quantity, data.reorder_threshold, stock_status,
                4.8, 1, image_url, data.tagline, data.description,
                features_json, specs_json, in_stock, data.delivery_time or "2-3 business days",
                data.gst_rate_pct, data.hsn_sac_code or "8470",
                data.offer_id or "off_razor2026", data.offer_text or "10% Off with RAZOR2026",
                data.offer_discount_pct or 10.0, data.offer_badge or "SPECIAL OFFER",
                now_str, now_str
            ))
            conn.commit()

        return self.get_product_by_id(pid) # type: ignore

    def update_product(self, product_id: str, data: ProductUpdateDTO) -> Optional[ProductDetailDTO]:
        existing = self.get_product_by_id(product_id)
        if not existing:
            return None

        update_fields = []
        params = []
        now_str = datetime.datetime.now().isoformat()

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
        if data.stock_quantity is not None:
            update_fields.append("stock_quantity = ?")
            params.append(data.stock_quantity)
            reorder = data.reorder_threshold if data.reorder_threshold is not None else existing.reorder_threshold
            stock_status = "In Stock" if data.stock_quantity > reorder else ("Low Stock" if data.stock_quantity > 0 else "Out of Stock")
            update_fields.append("stock_status = ?")
            params.append(stock_status)
            update_fields.append("in_stock = ?")
            params.append(1 if data.stock_quantity > 0 else 0)
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
        if data.features is not None:
            update_fields.append("features = ?")
            params.append(json.dumps(data.features))
        if data.specs is not None:
            update_fields.append("specs = ?")
            params.append(json.dumps([s.model_dump() for s in data.specs]))
        if data.offer_text is not None:
            update_fields.append("offer_text = ?")
            params.append(data.offer_text)
        if data.offer_badge is not None:
            update_fields.append("offer_badge = ?")
            params.append(data.offer_badge)
        if data.offer_discount_pct is not None:
            update_fields.append("offer_discount_pct = ?")
            params.append(data.offer_discount_pct)

        update_fields.append("updated_at = ?")
        params.append(now_str)
        params.append(existing.id)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE products SET {', '.join(update_fields)} WHERE id = ?", tuple(params))
            conn.commit()

        return self.get_product_by_id(existing.id)

    def adjust_stock(self, product_id: str, adj: StockAdjustmentDTO) -> Optional[ProductDetailDTO]:
        existing = self.get_product_by_id(product_id)
        if not existing:
            return None

        if adj.adjustment_type == "increment":
            new_qty = existing.stock_quantity + adj.quantity
        elif adj.adjustment_type == "decrement":
            new_qty = max(0, existing.stock_quantity - adj.quantity)
        else: # "set"
            new_qty = max(0, adj.quantity)

        stock_status = "In Stock" if new_qty > existing.reorder_threshold else ("Low Stock" if new_qty > 0 else "Out of Stock")
        in_stock = 1 if new_qty > 0 else 0
        now_str = datetime.datetime.now().isoformat()

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE products SET
                    stock_quantity = ?,
                    stock_status = ?,
                    in_stock = ?,
                    updated_at = ?
                WHERE id = ?
            """, (new_qty, stock_status, in_stock, now_str, existing.id))
            conn.commit()

        return self.get_product_by_id(existing.id)

    def delete_product(self, product_id: str) -> bool:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM products WHERE id = ? OR sku = ?", (product_id, product_id))
            conn.commit()
            return cursor.rowcount > 0

    def get_catalog_stats(self) -> CatalogStatsDTO:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_prods,
                    SUM(stock_quantity) as total_units,
                    SUM(price * stock_quantity) as total_val,
                    SUM(CASE WHEN stock_status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock,
                    SUM(CASE WHEN stock_status = 'Out of Stock' THEN 1 ELSE 0 END) as out_of_stock,
                    COUNT(DISTINCT category) as cat_count
                FROM products
            """)
            r = cursor.fetchone()
            total_prods = r["total_prods"] or 0
            total_units = r["total_units"] or 0
            total_val = float(r["total_val"] or 0.0)
            low_stock = r["low_stock"] or 0
            out_stock = r["out_of_stock"] or 0
            in_stock_rate = round(((total_prods - out_stock) / max(1, total_prods)) * 100, 1)

            return CatalogStatsDTO(
                total_products=total_prods,
                total_inventory_units=total_units,
                total_valuation_inr=round(total_val, 2),
                low_stock_count=low_stock,
                out_of_stock_count=out_stock,
                in_stock_rate_pct=in_stock_rate,
                categories_count=r["cat_count"] or 7
            )

    def get_category_counts(self) -> List[CategoryCountDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT category, COUNT(*) as cnt, SUM(stock_quantity) as units
                FROM products
                GROUP BY category
                ORDER BY cnt DESC
            """)
            rows = cursor.fetchall()
            return [
                CategoryCountDTO(
                    category=r["category"],
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

        ai_items = [
            AICatalogProductItemDTO(
                id=p.id,
                sku=p.sku,
                name=p.name,
                brand=p.brand,
                category=p.category,
                price_inr=p.price,
                stock_status=p.stock_status,
                available_units=p.stock_quantity,
                key_features=p.features[:3],
                specs_summary={s.key: s.value for s in p.specs[:3]},
                gst_input_credit_pct=p.gst_rate_pct,
                active_offer=p.offer_text
            )
            for p in res.products
        ]

        return AICatalogContextDTO(
            schema_version="2026.1",
            platform="RazorRecon Commerce & Inventory System",
            currency="INR",
            last_synced=now_str,
            total_items=len(ai_items),
            categories=res.categories,
            products=ai_items,
            instructions_for_llm=(
                "Use this structured catalog schema to recommend products, calculate B2B volume pricing, "
                "quote GST input credit, compare technical specifications, and generate 1-click Razorpay payment links."
            )
        )

    def get_ai_readable_context(self) -> AICatalogContextDTO:
        return self.get_ai_context()

catalog_service = CatalogService()

