from __future__ import annotations

import uuid
import datetime
from typing import List, Dict, Any, Optional
from app.schemas.catalog import (
    ProductDetailDTO,
    ProductCreateDTO,
    ProductUpdateDTO,
    ProductSpecDTO,
    CatalogStatsDTO,
    CategoryCountDTO,
    ProductListResponseDTO,
    AICatalogContextDTO,
    AICatalogProductItemDTO
)

# 50 Detailed Enterprise & Fintech Products Catalog
def generate_seed_50_products() -> List[ProductDetailDTO]:
    raw_data = [
        # Payment Terminals & Smart POS (1-10)
        {
            "sku": "RZP-POS-V3-PRO",
            "name": "Razorpay Smart POS Terminal V3 Pro",
            "brand": "Razorpay Hardware",
            "category": "Payment Terminals",
            "price": 14999.00,
            "cost_price": 9800.00,
            "original_price": 17999.00,
            "stock_quantity": 85,
            "reorder_threshold": 15,
            "image_url": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
            "tagline": "All-in-one Android 13 smart POS terminal with dual displays & 4G eSIM.",
            "description": "High-throughput smart payment terminal supporting BharatQR, Dynamic UPI, NFC contactless, biometric cards, and thermal receipt printing.",
            "features": ["NFC & Chip-and-PIN", "80mm/s Thermal Printer", "Dual 5.5\" IPS Displays", "5200mAh Battery"],
            "specs": [("OS", "Android 13"), ("Processor", "Quad-Core 2.0 GHz"), ("Connectivity", "4G eSIM + Wi-Fi 6"), ("Battery", "18+ Hours")],
            "hsn_sac_code": "84705010"
        },
        {
            "sku": "RZP-POS-MINI-X",
            "name": "Razorpay POS Mini Compact Reader",
            "brand": "Razorpay Hardware",
            "category": "Payment Terminals",
            "price": 5999.00,
            "cost_price": 3800.00,
            "original_price": 7499.00,
            "stock_quantity": 140,
            "reorder_threshold": 25,
            "image_url": "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&auto=format&fit=crop&q=80",
            "tagline": "Pocket-sized Bluetooth mPOS card reader for mobile delivery fleets.",
            "description": "Ultra-portable mobile card reader connecting seamlessly with iOS & Android smartphones via Bluetooth BLE.",
            "features": ["EMV Chip & Tap to Pay", "Pocket Lightweight 110g", "Type-C Fast Charge", "Auto-reconciliation Sync"],
            "specs": [("Battery", "1200mAh / 400 Transactions"), ("Connectivity", "Bluetooth 5.0 Low Energy"), ("Weight", "110g")],
            "hsn_sac_code": "84705010"
        },
        {
            "sku": "RZP-POS-DESK-DUO",
            "name": "Razorpay Countertop Dual-Screen POS Hub",
            "brand": "Razorpay Hardware",
            "category": "Payment Terminals",
            "price": 28999.00,
            "cost_price": 19500.00,
            "original_price": 32999.00,
            "stock_quantity": 32,
            "reorder_threshold": 8,
            "image_url": "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop&q=80",
            "tagline": "Heavy-duty 10.1\" customer-facing smart checkout counter terminal.",
            "description": "Dual 10.1-inch FHD touchscreens designed for retail department stores and restaurant billing counters.",
            "features": ["10.1\" Dual FHD Displays", "Integrated Auto-Cutter Printer", "Ethernet LAN & Dual Wi-Fi", "Cash Drawer Trigger Port"],
            "specs": [("OS", "Android 12 Enterprise"), ("Memory", "4GB RAM + 64GB ROM"), ("Ports", "6x USB, RJ45, RJ11 Cash Drawer")],
            "hsn_sac_code": "84705010"
        },
        {
            "sku": "RZP-QR-STAND-ACTIVE",
            "name": "Razorpay Dynamic QR LED Display Stand",
            "brand": "Razorpay Hardware",
            "category": "Payment Terminals",
            "price": 1899.00,
            "cost_price": 950.00,
            "original_price": 2499.00,
            "stock_quantity": 210,
            "reorder_threshold": 30,
            "image_url": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=80",
            "tagline": "Digital dynamic QR stand updating payable amount in real-time per billing.",
            "description": "Countertop dynamic e-ink QR screen syncing with ERP/billing machine to display exact invoice amount QR.",
            "features": ["Dynamic Amount QR", "E-Ink Sunlight Readable", "Bluetooth & Wi-Fi Sync", "Zero Battery Replacement (Solar/USB)"],
            "specs": [("Screen", "3.7\" Dynamic E-Paper"), ("Battery", "6 Months Solar Standby"), ("Interface", "Bluetooth 5.2")],
            "hsn_sac_code": "84716090"
        },
        {
            "sku": "RZP-POS-KIOSK-SELF",
            "name": "Razorpay Self-Checkout Kiosk 21.5\"",
            "brand": "Razorpay Hardware",
            "category": "Payment Terminals",
            "price": 89999.00,
            "cost_price": 64000.00,
            "original_price": 99999.00,
            "stock_quantity": 12,
            "reorder_threshold": 4,
            "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80",
            "tagline": "Floor-standing commercial self-order & checkout terminal for QSR & retail.",
            "description": "21.5-inch portrait capacitive touchscreen kiosk with barcode scanner, thermal receipt roll, and integrated POS card dock.",
            "features": ["21.5\" Portrait FHD Touch", "Integrated 2D Barcode Scanner", "High Capacity 150m Receipt Roll", "Vandal-resistant Steel Body"],
            "specs": [("Mounting", "Floor Standing / Wall Mount"), ("OS", "Windows 11 IoT / Android 13"), ("Scanner", "1D/2D Imager 60fps")],
            "hsn_sac_code": "84705010"
        },
        {
            "sku": "PIN-PAD-ENCRYPT-PCI",
            "name": "VeriFone Secure PCI-PTS Encrypted PIN Pad",
            "brand": "VeriFone",
            "category": "Payment Terminals",
            "price": 8499.00,
            "cost_price": 5600.00,
            "original_price": 9999.00,
            "stock_quantity": 45,
            "reorder_threshold": 10,
            "image_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
            "tagline": "PCI-PTS 6.x certified customer PIN entry pad with privacy shield.",
            "description": "High-security cryptographic PIN entry device with mechanical tactile keys and tamper-detection sensors.",
            "features": ["PCI-PTS 6.x Security Standard", "DES/3DES/AES DUKPT Encryption", "Tactile Raised Backlit Keypad", "Privacy Shield Casing"],
            "specs": [("Certification", "PCI-PTS 6.x Certified"), ("Keys", "16 Backlit Silicone Keys"), ("Interface", "RS-232 / USB-HID")],
            "hsn_sac_code": "84705010"
        },
        {
            "sku": "PAX-A920-SMART-POS",
            "name": "PAX A920 Pro Mobile Android POS",
            "brand": "PAX Technology",
            "category": "Payment Terminals",
            "price": 16499.00,
            "cost_price": 11200.00,
            "original_price": 18999.00,
            "stock_quantity": 28,
            "reorder_threshold": 8,
            "image_url": "https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=600&auto=format&fit=crop&q=80",
            "tagline": "Flagship 5.5-inch rugged mobile terminal with rear camera barcode scanner.",
            "description": "Ergonomic mobile POS terminal for transit ticketing, logistics, field service, and high-volume dining.",
            "features": ["5.5\" IPS Capacitive Multi-touch", "5MP Camera for QR & Barcode", "High-speed 4G LTE", "NFC Contactless Antenna"],
            "specs": [("Processor", "Cortex A53 Quad-Core"), ("Battery", "5250mAh Li-ion"), ("Printer", "Thermal Roll 40mm Diameter")],
            "hsn_sac_code": "84705010"
        },
        {
            "sku": "SUNMI-V2S-HANDHELD",
            "name": "SUNMI V2s All-in-One Smart Handheld",
            "brand": "SUNMI",
            "category": "Payment Terminals",
            "price": 12999.00,
            "cost_price": 8900.00,
            "original_price": 14999.00,
            "stock_quantity": 60,
            "reorder_threshold": 12,
            "image_url": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600&auto=format&fit=crop&q=80",
            "tagline": "Label and receipt hybrid handheld terminal with 2D scanner engine.",
            "description": "Versatile Android handheld printer device capable of printing both continuous receipts and self-adhesive product labels.",
            "features": ["Dual Mode: Receipt & Label Printing", "2D Professional Scanning Engine", "1.2m Drop Resistance", "Water-repellent Casing"],
            "specs": [("OS", "SUNMI OS 3.0 (Android 11)"), ("Printer", "58mm Thermal Receipt/Label"), ("Drop Spec", "1.2m Anti-Drop")],
            "hsn_sac_code": "84705010"
        },
        {
            "sku": "INGENICO-LANE-5000",
            "name": "Ingenico Lane/5000 Retail PinPad",
            "brand": "Ingenico",
            "category": "Payment Terminals",
            "price": 19499.00,
            "cost_price": 13800.00,
            "original_price": 22999.00,
            "stock_quantity": 20,
            "reorder_threshold": 5,
            "image_url": "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&auto=format&fit=crop&q=80",
            "tagline": "High-security signature capture touchscreen terminal for supermarket lanes.",
            "description": "Compact signature-capable card payment terminal with multimedia color screen and signature stylus.",
            "features": ["3.5\" Color Touchscreen with Stylus", "PCI-PTS 5.x Certified", "Multi-contactless Reader", "Heavy-duty Supermarket Lifecycle"],
            "specs": [("Screen", "3.5\" Color QVGA (320x240)"), ("Connectivity", "Ethernet 10/100, USB, RS232"), ("Stylus", "Capacitive Stylus Included")],
            "hsn_sac_code": "84705010"
        },
        {
            "sku": "CASTLES-SATURN-1000",
            "name": "Castles Saturn 1000F2 Android POS",
            "brand": "Castles Technology",
            "category": "Payment Terminals",
            "price": 15999.00,
            "cost_price": 10500.00,
            "original_price": 17999.00,
            "stock_quantity": 38,
            "reorder_threshold": 10,
            "image_url": "https://images.unsplash.com/photo-1556742208-999815fca738?w=600&auto=format&fit=crop&q=80",
            "tagline": "Secure Android mobile POS with front and rear cameras and fast thermal printer.",
            "description": "Robust payment device engineered for rapid contactless taps and heavy-duty field usage.",
            "features": ["Android 10 Security OS", "PCI-PTS 6.x Compliant", "Front & Rear Cameras", "4G LTE & GPS Tracking"],
            "specs": [("Processor", "Quad-Core Application CPU"), ("Display", "5.5\" IPS High Brightness"), ("Battery", "6000mAh Extra Heavy Duty")],
            "hsn_sac_code": "84705010"
        },

        # Audio Payment Alert Devices & Soundboxes (11-16)
        {
            "sku": "RZP-SBOX-4G-PRO",
            "name": "Razorpay Smart Soundbox 4G Pro",
            "brand": "Razorpay Hardware",
            "category": "Payment Audio Alerts",
            "price": 2499.00,
            "cost_price": 1250.00,
            "original_price": 2999.00,
            "stock_quantity": 185,
            "reorder_threshold": 40,
            "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
            "tagline": "Instant multi-lingual audio confirmation for UPI & QR payments with LED screen.",
            "description": "High-volume 3W speaker with 11 Indian regional language announcements and LED payment confirmation screen.",
            "features": ["11 Indian Languages Voice Output", "1.8\" LED Amount Display", "4G Cat-1 Pre-activated SIM", "5 Days Battery Life"],
            "specs": [("Audio Output", "3W Speaker (>95dB)"), ("Battery", "2600mAh Li-ion"), ("Connectivity", "4G LTE / 2G Auto-switch")],
            "hsn_sac_code": "85182100"
        },
        {
            "sku": "RZP-SBOX-MINI-SOLAR",
            "name": "Razorpay EcoSoundbox Solar 4G",
            "brand": "Razorpay Hardware",
            "category": "Payment Audio Alerts",
            "price": 2999.00,
            "cost_price": 1600.00,
            "original_price": 3499.00,
            "stock_quantity": 90,
            "reorder_threshold": 20,
            "image_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
            "tagline": "Solar-charging UPI audio soundbox for outdoor market stalls and kiosks.",
            "description": "Equipped with high-efficiency monocrystalline solar panels on the top lid for continuous outdoor recharging.",
            "features": ["Solar Self-Recharging", "IP65 Weatherproof", "Loud 98dB Acoustic Horn", "Instant 0.8s Voice Broadcast"],
            "specs": [("Solar Panel", "1.5W Monocrystalline"), ("Water Resistance", "IP65 Certified"), ("Battery", "3000mAh Battery")],
            "hsn_sac_code": "85182100"
        },
        {
            "sku": "PAYTM-SBOX-30-V2",
            "name": "Paytm Soundbox 3.0 LCD Display Edition",
            "brand": "Paytm",
            "category": "Payment Audio Alerts",
            "price": 2299.00,
            "cost_price": 1300.00,
            "original_price": 2699.00,
            "stock_quantity": 110,
            "reorder_threshold": 25,
            "image_url": "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80",
            "tagline": "Dual-language audio alert box with front numerical LCD confirmation.",
            "description": "Reliable 4G IoT voice alert box with replay button for recalling previous transaction confirmation.",
            "features": ["Dual English/Hindi Alert", "Numerical LCD Amount Screen", "Last Transaction Repeat Key", "4G High-speed Connectivity"],
            "specs": [("Speaker", "2.5W Front Firing"), ("Battery", "2000mAh (72h Standby)"), ("Network", "4G VoLTE")],
            "hsn_sac_code": "85182100"
        },
        {
            "sku": "PHONEPE-SMART-SPEAKER",
            "name": "PhonePe SmartSpeaker G2 Pro",
            "brand": "PhonePe",
            "category": "Payment Audio Alerts",
            "price": 2399.00,
            "cost_price": 1350.00,
            "original_price": 2799.00,
            "stock_quantity": 95,
            "reorder_threshold": 20,
            "image_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
            "tagline": "Compact smart audio box with celebrity voice notifications and LED ring.",
            "description": "Popular merchant speaker featuring customizable voice packs and multi-color visual transaction feedback ring.",
            "features": ["Celebrity Voice Alert Options", "RGB Ring Status Indicator", "SIM Lock Security", "Fast 1s Transaction Voice Latency"],
            "specs": [("Audio", "3W Acoustic Chamber"), ("LED", "360-degree Status Ring"), ("Battery", "2200mAh (4 Days)")],
            "hsn_sac_code": "85182100"
        },
        {
            "sku": "BHARATPE-SPEAKER-CLUB",
            "name": "BharatPe Club Speaker Max",
            "brand": "BharatPe",
            "category": "Payment Audio Alerts",
            "price": 1999.00,
            "cost_price": 1100.00,
            "original_price": 2499.00,
            "stock_quantity": 75,
            "reorder_threshold": 15,
            "image_url": "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=80",
            "tagline": "Budget-friendly 4G voice alert soundbox with high-gain internal antenna.",
            "description": "High-gain cellular antenna optimized for basement shops and low-signal retail environments.",
            "features": ["Enhanced Low-Signal Antenna", "95dB High Decibel Output", "Over-the-air Voice Firmware Updates", "Micro-USB & Type-C Charging"],
            "specs": [("Antenna", "High-gain internal 4G patch"), ("Loudness", "95dB at 1 meter"), ("Battery", "2000mAh")],
            "hsn_sac_code": "85182100"
        },
        {
            "sku": "GOOGLE-PAY-SOUNDPOD",
            "name": "Google Pay SoundPod Merchant Edition",
            "brand": "Google Pay",
            "category": "Payment Audio Alerts",
            "price": 2799.00,
            "cost_price": 1700.00,
            "original_price": 3199.00,
            "stock_quantity": 65,
            "reorder_threshold": 15,
            "image_url": "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&auto=format&fit=crop&q=80",
            "tagline": "Minimalist matte white soundbox with Google Assistant crystal-clear speech synthesis.",
            "description": "Premium build UPI audio notification device engineered for modern boutiques and cafes.",
            "features": ["Google Voice Synthesis Engine", "Matte Soft-touch Aesthetic", "Dual SIM Auto-carrier Failover", "Type-C Fast Charge"],
            "specs": [("Voice Quality", "HD Natural TTS"), ("Connectivity", "Dual SIM 4G IoT"), ("Battery", "2600mAh (5 Days)")],
            "hsn_sac_code": "85182100"
        },

        # FinOps & Enterprise Software Licenses (17-24)
        {
            "sku": "RZP-RECON-ENT-ANNUAL",
            "name": "RazorRecon Enterprise Autonomous FinOps License",
            "brand": "RazorRecon Software",
            "category": "Enterprise Software",
            "price": 49999.00,
            "cost_price": 12000.00,
            "original_price": 59999.00,
            "stock_quantity": 999,
            "reorder_threshold": 50,
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
            "tagline": "Autonomous multi-channel reconciliation, vendor memory engine & CFO Copilot (Annual).",
            "description": "Complete annual subscription for RazorRecon AI. Multi-entity support, unlimited payment gateway ingestion, and automated month-end close.",
            "features": ["Unlimited Ingestion (Razorpay, Stripe, Amazon, Shopify)", "Vendor Behavioral Memory Engine", "ReAct CFO AI Copilot", "Autonomous Month-End Close"],
            "specs": [("Deployment", "Cloud Managed / Dedicated VPC"), ("User Seats", "Up to 25 Operators"), ("Compliance", "SOC2 Type II, ISO 27001, RBI")],
            "hsn_sac_code": "997331"
        },
        {
            "sku": "RZP-RECON-STARTER",
            "name": "RazorRecon Pro Growth License (Quarterly)",
            "brand": "RazorRecon Software",
            "category": "Enterprise Software",
            "price": 14999.00,
            "cost_price": 4000.00,
            "original_price": 18999.00,
            "stock_quantity": 999,
            "reorder_threshold": 50,
            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
            "tagline": "3-month reconciliation agent for fast-growing D2C e-commerce brands.",
            "description": "Essential financial reconciliation suite supporting up to 50,000 monthly transactions and 5 operator seats.",
            "features": ["Up to 50,000 Txns / Month", "3 Payment Gateway Connectors", "Exception Review Queue", "Standard Email Support"],
            "specs": [("Term", "3 Months (Quarterly)"), ("Seats", "5 Finance Users"), ("Data Retention", "3 Years")],
            "hsn_sac_code": "997331"
        },
        {
            "sku": "GST-INVOICE-SUITE-PRO",
            "name": "RazorGST E-Invoicing & E-Way Bill Enterprise API",
            "brand": "RazorRecon Software",
            "category": "Enterprise Software",
            "price": 24999.00,
            "cost_price": 6000.00,
            "original_price": 29999.00,
            "stock_quantity": 999,
            "reorder_threshold": 50,
            "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
            "tagline": "Automated GST e-invoice IRN generation, GSTR-2B 3-way reconciliation API.",
            "description": "Direct NIC GSP-connected API for instantaneous IRN generation, QR signing, and vendor 2B mismatch reconciliation.",
            "features": ["Instant NIC Portal IRN Generation", "Automated GSTR-2B vs 3B Matching", "Bulk E-Way Bill Creation", "Direct ERP Webhooks"],
            "specs": [("API Quota", "Unlimited Annual Calls"), ("Uptime SLA", "99.99% Guaranteed"), ("Security", "256-bit TLS + Digital Signatures")],
            "hsn_sac_code": "997331"
        },
        {
            "sku": "TALLY-PRIME-GOLD-ENT",
            "name": "TallyPrime Server & Gold Multi-User License",
            "brand": "Tally Solutions",
            "category": "Enterprise Software",
            "price": 54000.00,
            "cost_price": 42000.00,
            "original_price": 60000.00,
            "stock_quantity": 50,
            "reorder_threshold": 10,
            "image_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            "tagline": "Unlimited multi-user concurrent accounting & statutory compliance system.",
            "description": "Standard business accounting software for Indian statutory compliance, payroll, inventory, and GST returns.",
            "features": ["Unlimited Multi-User LAN Access", "Real-time Banking Sync", "Automated Audit Trail (MCA Compliant)", "Multi-Currency Accounting"],
            "specs": [("License Type", "Perpetual Multi-User Gold"), ("Platform", "Windows Server / Desktop"), ("Updates", "1 Year TSS Included")],
            "hsn_sac_code": "997331"
        },
        {
            "sku": "ZOHO-ONE-ENTERPRISE",
            "name": "Zoho One Enterprise Suite (Annual 10 Users)",
            "brand": "Zoho Corporation",
            "category": "Enterprise Software",
            "price": 36000.00,
            "cost_price": 28000.00,
            "original_price": 42000.00,
            "stock_quantity": 100,
            "reorder_threshold": 20,
            "image_url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
            "tagline": "All-in-one operating system for business: CRM, Books, Inventory & HR.",
            "description": "Integrated suite of 45+ enterprise applications designed to run every aspect of mid-market operations.",
            "features": ["Zoho Books & Expense Integration", "Zoho CRM & Support", "Inventory & Warehouse Multi-location", "Single Sign-on (SSO)"],
            "specs": [("Seats", "10 Enterprise Users"), ("Term", "12 Months"), ("Storage", "1 TB Cloud Storage")],
            "hsn_sac_code": "997331"
        },
        {
            "sku": "QUICKBOOKS-PLUS-CLOUD",
            "name": "Intuit QuickBooks Online Plus (Annual)",
            "brand": "Intuit",
            "category": "Enterprise Software",
            "price": 18499.00,
            "cost_price": 14000.00,
            "original_price": 21999.00,
            "stock_quantity": 75,
            "reorder_threshold": 15,
            "image_url": "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80",
            "tagline": "Cloud accounting software for inventory, multi-currency and project tracking.",
            "description": "Intuitive cloud accounting platform with automated bank feeds, custom invoice creation, and inventory tracking.",
            "features": ["Track Inventory & Cost of Goods", "Manage 1099/Contractor Payments", "Multi-Currency Conversion", "Custom Financial Reports"],
            "specs": [("Users", "5 Concurrent Users + 2 Accountants"), ("Deployment", "100% Cloud SaaS"), ("Mobile Apps", "iOS & Android")],
            "hsn_sac_code": "997331"
        },
        {
            "sku": "ORACLE-NETSUITE-ERP",
            "name": "Oracle NetSuite FinOps Connector Agent",
            "brand": "Oracle NetSuite",
            "category": "Enterprise Software",
            "price": 125000.00,
            "cost_price": 95000.00,
            "original_price": 145000.00,
            "stock_quantity": 25,
            "reorder_threshold": 5,
            "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
            "tagline": "High-throughput bi-directional RESTlet connector for NetSuite GL & AP.",
            "description": "Enterprise integration middleware syncing RazorRecon exception resolutions and automated month-close journal entries into NetSuite General Ledger.",
            "features": ["Real-time NetSuite SuiteScript 2.1 Connector", "Automated Journal Entry Creation", "Multi-Subsidiary Currency Consolidation", "Audit Compliance Log Lock"],
            "specs": [("Throughput", "100,000 txns/hour"), ("Security", "Token-based OAuth 2.0"), ("SLA", "99.95% Enterprise SLA")],
            "hsn_sac_code": "997331"
        },
        {
            "sku": "DATADOG-FINOPS-SENTINEL",
            "name": "Cloud Cost & FinOps Real-Time Sentinel Agent",
            "brand": "Datadog",
            "category": "Enterprise Software",
            "price": 32999.00,
            "cost_price": 24000.00,
            "original_price": 38999.00,
            "stock_quantity": 40,
            "reorder_threshold": 10,
            "image_url": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80",
            "tagline": "Continuous cloud infrastructure spend anomaly detection and budget enforcement.",
            "description": "Real-time AI monitoring tool that detects unexpected AWS, GCP, and Azure cost spikes before monthly invoice generation.",
            "features": ["Hourly Cloud Cost Anomaly Alerts", "Kubernetes Pod Cost Allocation", "Automated Idle Resource Shutdown", "Slack & Teams Webhook Integration"],
            "specs": [("Cloud Support", "AWS, Azure, GCP, OCI"), ("Data Ingestion", "Real-time CUR & Cost API"), ("Alerting", "Sub-minute Latency")],
            "hsn_sac_code": "997331"
        },

        # Workstation Hardware, Displays & Keyboards (25-34)
        {
            "sku": "KEYCHRON-Q3-PRO",
            "name": "Keychron Q3 Pro FinTech Edition Mechanical Keyboard",
            "brand": "Keychron",
            "category": "Workstations & Peripherals",
            "price": 18999.00,
            "cost_price": 12500.00,
            "original_price": 21499.00,
            "stock_quantity": 42,
            "reorder_threshold": 10,
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
            "tagline": "Custom CNC aluminum wireless QMK/VIA mechanical keyboard with macro knob.",
            "description": "Full CNC machined 6063 aluminum body, double-gasket acoustic design, hot-swappable tactile switches, and customizable financial dial knob.",
            "features": ["CNC Machined 6063 Aluminum Body", "Programmable Rotary Financial Shortcut Knob", "Dual Wireless Bluetooth & Type-C", "Hot-swappable 5-pin PCB"],
            "specs": [("Switch Type", "Keychron K Pro Brown Tactile"), ("Battery", "4000mAh (300h)"), ("Weight", "1.98 kg Solid Aluminum")],
            "hsn_sac_code": "84716060"
        },
        {
            "sku": "DELL-U4025QW-5K2K",
            "name": "Dell UltraSharp 40\" Curved WUHD 5K2K Monitor",
            "brand": "Dell",
            "category": "Workstations & Peripherals",
            "price": 145999.00,
            "cost_price": 115000.00,
            "original_price": 165000.00,
            "stock_quantity": 14,
            "reorder_threshold": 4,
            "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
            "tagline": "Massive 5K2K curved display for complex financial spreadsheets and multi-window ops.",
            "description": "The ultimate finance workstation display. 40-inch curved WUHD (5120 x 2160) 120Hz IPS Black panel with Thunderbolt 4 140W power delivery.",
            "features": ["40\" Curved WUHD 5120x2160 120Hz", "Thunderbolt 4 with 140W Power Pass-through", "Built-in 2.5GbE RJ45 & KVM Switch", "ComfortView Plus Low Blue Light"],
            "specs": [("Resolution", "5120 x 2160 at 120Hz"), ("Contrast Ratio", "2000:1 IPS Black"), ("Ports", "Thunderbolt 4, HDMI 2.1, DP 1.4, RJ45")],
            "hsn_sac_code": "85285200"
        },
        {
            "sku": "LOGI-MX-MASTER-3S",
            "name": "Logitech MX Master 3S Performance Wireless Mouse",
            "brand": "Logitech",
            "category": "Workstations & Peripherals",
            "price": 8995.00,
            "cost_price": 6200.00,
            "original_price": 10995.00,
            "stock_quantity": 115,
            "reorder_threshold": 25,
            "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
            "tagline": "Quiet click wireless mouse with 8000 DPI track-on-glass sensor & MagSpeed wheel.",
            "description": "Ergonomic precision mouse for spreadsheet power users with electromagnetic MagSpeed scrolling up to 1000 lines/second.",
            "features": ["MagSpeed Electromagnetic Scroll Wheel", "Quiet Clicks (90% Noise Reduction)", "8000 DPI Darkfield Sensor", "App-specific Financial Shortcuts"],
            "specs": [("Battery", "500mAh (70 Days per charge)"), ("Connectivity", "Bluetooth + Logi Bolt USB"), ("Weight", "141g Ergonomic")],
            "hsn_sac_code": "84716070"
        },
        {
            "sku": "LOGI-MX-KEYS-S",
            "name": "Logitech MX Keys S Wireless Illuminated Keyboard",
            "brand": "Logitech",
            "category": "Workstations & Peripherals",
            "price": 10495.00,
            "cost_price": 7500.00,
            "original_price": 12995.00,
            "stock_quantity": 80,
            "reorder_threshold": 20,
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
            "tagline": "Low-profile fluid typing keyboard with smart backlighting and dedicated numpad.",
            "description": "Full-size low profile productivity keyboard with spherical dished keys and dedicated financial calculation keys.",
            "features": ["Full Numpad with Calculator Shortcut", "Smart Proximity Sensor Backlight", "Multi-Device Easy-Switch (3 PCs)", "Type-C Fast Rechargeable"],
            "specs": [("Layout", "Full Size 100% with Numpad"), ("Battery Life", "10 days (Backlit) / 5 months (Off)"), ("Compatibility", "Windows, macOS, Linux")],
            "hsn_sac_code": "84716060"
        },
        {
            "sku": "BENQ-PD3220U-4K",
            "name": "BenQ DesignVue 32\" 4K UHD Thunderbolt Monitor",
            "brand": "BenQ",
            "category": "Workstations & Peripherals",
            "price": 89990.00,
            "cost_price": 68000.00,
            "original_price": 105000.00,
            "stock_quantity": 18,
            "reorder_threshold": 5,
            "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
            "tagline": "32-inch 4K IPS display with daisy-chain Thunderbolt 3 and Hotkey Puck controller.",
            "description": "Professional 32-inch 4K UHD monitor with 100% sRGB color accuracy, dual-view mode, and physical Hotkey Puck for rapid screen preset switching.",
            "features": ["32\" 4K UHD (3840x2160) IPS", "Thunderbolt 3 Daisy Chaining", "Hotkey Puck G2 Controller", "DualView Split Screen Mode"],
            "specs": [("Resolution", "3840x2160 at 60Hz"), ("Color Gamut", "100% sRGB, 95% DCI-P3"), ("Power Delivery", "85W via Thunderbolt 3")],
            "hsn_sac_code": "85285200"
        },
        {
            "sku": "CALDIGIT-TS4-DOCK",
            "name": "CalDigit TS4 Thunderbolt 4 18-Port Docking Station",
            "brand": "CalDigit",
            "category": "Workstations & Peripherals",
            "price": 38999.00,
            "cost_price": 28000.00,
            "original_price": 44999.00,
            "stock_quantity": 25,
            "reorder_threshold": 6,
            "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
            "tagline": "The ultimate 18-port Thunderbolt 4 dock with 98W laptop charging & 2.5GbE.",
            "description": "High-end aluminum docking station connecting dual 6K displays, 2.5 Gigabit Ethernet, SD card readers, and 8 USB ports over a single cable.",
            "features": ["18 Comprehensive Ports", "98W Full Speed Laptop Power Delivery", "2.5 Gigabit High-speed Ethernet", "Dual 6K 60Hz Display Support"],
            "specs": [("Host Connection", "Thunderbolt 4 (40Gb/s)"), ("Ports", "3x TB4, 5x USB-A, 3x USB-C, DP 1.4, 2.5GbE"), ("Body", "Aluminum Heat Sink Enclosure")],
            "hsn_sac_code": "84718000"
        },
        {
            "sku": "APPLE-STUDIO-DISPLAY",
            "name": "Apple Studio Display 27\" 5K Retina (Tilt Stand)",
            "brand": "Apple",
            "category": "Workstations & Peripherals",
            "price": 159900.00,
            "cost_price": 132000.00,
            "original_price": 169900.00,
            "stock_quantity": 9,
            "reorder_threshold": 3,
            "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
            "tagline": "27-inch 5K Retina display with 12MP Center Stage camera & studio-quality 6-speaker sound.",
            "description": "Stunning 5K Retina monitor with 600 nits brightness, P3 wide color, A13 Bionic chip processing, and studio microphones.",
            "features": ["27\" 5K Retina (5120x2880 at 218 ppi)", "12MP Ultra Wide Camera with Center Stage", "Six-Speaker Sound System with Spatial Audio", "Thunderbolt 3 Port with 96W Host Charging"],
            "specs": [("Brightness", "600 nits"), ("Color", "1 Billion Colors / P3 Wide Color"), ("Stand", "Tilt-adjustable Aluminum Stand")],
            "hsn_sac_code": "85285200"
        },
        {
            "sku": "HERMAN-MILLER-AERON",
            "name": "Herman Miller Aeron Remastered Ergonomic Chair",
            "brand": "Herman Miller",
            "category": "Workstations & Peripherals",
            "price": 128999.00,
            "cost_price": 89000.00,
            "original_price": 149999.00,
            "stock_quantity": 15,
            "reorder_threshold": 4,
            "image_url": "https://images.unsplash.com/photo-1580481077197-6a4a4087b328?w=600&auto=format&fit=crop&q=80",
            "tagline": "The gold standard in ergonomic office seating with breathable Pellicle 8Z mesh.",
            "description": "Engineered for 12+ hour trading and finance modeling shifts with adjustable PostureFit SL sacral spine support.",
            "features": ["Pellicle 8Z Breathable Suspension Mesh", "PostureFit SL Dual Sacral Spine Support", "Fully Adjustable 3D Armrests", "Harmonic 2 Recline Tilt Mechanism"],
            "specs": [("Size", "Size B (Medium)"), ("Warranty", "12 Years 24/7 Comprehensive Warranty"), ("Weight Capacity", "Up to 159 kg")],
            "hsn_sac_code": "94013000"
        },
        {
            "sku": "DELL-TB-DOCK-WD22TB4",
            "name": "Dell Thunderbolt 4 Dock WD22TB4 Module",
            "brand": "Dell",
            "category": "Workstations & Peripherals",
            "price": 28499.00,
            "cost_price": 19800.00,
            "original_price": 32999.00,
            "stock_quantity": 40,
            "reorder_threshold": 10,
            "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
            "tagline": "Modular Thunderbolt 4 dock delivering up to 130W Dell ExpressCharge.",
            "description": "High-reliability corporate docking station supporting multi-4K external displays and modular upgradeable port bays.",
            "features": ["130W Dell ExpressCharge Power", "Modular Swap Design for Future Upgrades", "Dual DisplayPort 1.4 & HDMI 2.0", "Enterprise MAC Address Pass-Through"],
            "specs": [("Interface", "Thunderbolt 4 / USB-C"), ("Power Adapter", "180W AC Power Adapter"), ("Display Support", "Up to 4x 4K Monitors")],
            "hsn_sac_code": "84718000"
        },
        {
            "sku": "ELGATO-STREAM-DECK-XL",
            "name": "Elgato Stream Deck XL 32-Key Financial Macro Pad",
            "brand": "Elgato",
            "category": "Workstations & Peripherals",
            "price": 22999.00,
            "cost_price": 15500.00,
            "original_price": 26999.00,
            "stock_quantity": 30,
            "reorder_threshold": 8,
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
            "tagline": "32 customizable LCD keys for 1-touch financial macros, ticker tracking & scripts.",
            "description": "Studio macro controller allowing finance analysts to bind complex multi-step Excel routines, SQL queries, and reconciliation triggers to interactive LCD keys.",
            "features": ["32 Vivid Customizable LCD Keys", "One-touch Financial Macro Chaining", "Real-time Crypto/Stock Ticker Plugins", "Magnetic Anti-slip Desktop Stand"],
            "specs": [("Keys", "32 Customizable LCD Buttons"), ("Connection", "USB-C to USB-A/C (Detachable)"), ("Software", "Elgato Stream Deck App")],
            "hsn_sac_code": "84716060"
        },

        # Biometric & Cybersecurity Hardware Tokens (35-40)
        {
            "sku": "YUBIKEY-BIO-FIDO2",
            "name": "Yubico YubiKey Bio FIDO2 USB-C Security Key",
            "brand": "Yubico",
            "category": "Security & Access",
            "price": 8499.00,
            "cost_price": 5200.00,
            "original_price": 9999.00,
            "stock_quantity": 78,
            "reorder_threshold": 15,
            "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=80",
            "tagline": "Biometric fingerprint hardware security key for zero-trust banking & SSO access.",
            "description": "Hardware-based authentication token supporting biometric fingerprint recognition with on-chip template security.",
            "features": ["On-chip Biometric Template Matching", "FIDO2 & WebAuthn Compliant", "Zero Cloud Storage of Biometrics", "IP68 Waterproof & Crush Resistant"],
            "specs": [("Connector", "USB-C"), ("Sensor", "Capacitive Fingerprint Sensor"), ("Protocols", "FIDO2, WebAuthn, U2F")],
            "hsn_sac_code": "85235100"
        },
        {
            "sku": "YUBIKEY-5C-NFC",
            "name": "Yubico YubiKey 5C NFC Dual-Interface Key",
            "brand": "Yubico",
            "category": "Security & Access",
            "price": 6499.00,
            "cost_price": 3900.00,
            "original_price": 7499.00,
            "stock_quantity": 130,
            "reorder_threshold": 25,
            "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=80",
            "tagline": "Multi-protocol USB-C + NFC hardware authenticator for mobile & desktop.",
            "description": "The world's leading security key supporting OTP, Smart Card PIV, OpenPGP, FIDO2, and tap-and-go NFC on iPhone & Android.",
            "features": ["Tap-and-Go NFC for Smartphones", "USB-C Reversible Connector", "Supports Smart Card (PIV) & OpenPGP", "No Batteries or Moving Parts"],
            "specs": [("Interface", "USB-C + NFC Contactless"), ("Protocols", "FIDO2, U2F, Smart Card (PIV), OTP"), ("Durability", "IP68 Certified")],
            "hsn_sac_code": "85235100"
        },
        {
            "sku": "FEITIAN-IEPASS-FIDO",
            "name": "Feitian ePass FIDO2 BioPass Card Token",
            "brand": "Feitian Technologies",
            "category": "Security & Access",
            "price": 5499.00,
            "cost_price": 3100.00,
            "original_price": 6499.00,
            "stock_quantity": 60,
            "reorder_threshold": 12,
            "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=80",
            "tagline": "Smart badge credit-card form-factor biometric authenticator with BLE & NFC.",
            "description": "ISO 7810 ID-1 credit card shaped FIDO2 token with built-in fingerprint scanner and Bluetooth for corporate physical & logical access.",
            "features": ["Credit Card Size Badge", "Built-in Fingerprint Sensor", "Bluetooth BLE & NFC Dual Interface", "Rechargeable Lithium Battery"],
            "specs": [("Form Factor", "Standard ISO 7810 ID-1 Card"), ("Security", "CC EAL 6+ Certified Secure Element"), ("Battery", "Rechargeable via Contactless Base")],
            "hsn_sac_code": "85235100"
        },
        {
            "sku": "LEDGER-NANO-X-ENTERPRISE",
            "name": "Ledger Nano X Enterprise Hardware Wallet",
            "brand": "Ledger",
            "category": "Security & Access",
            "price": 15999.00,
            "cost_price": 10500.00,
            "original_price": 17999.00,
            "stock_quantity": 40,
            "reorder_threshold": 10,
            "image_url": "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80",
            "tagline": "CC EAL5+ certified hardware vault for corporate crypto reserves & treasury keys.",
            "description": "Bluetooth-enabled hardware crypto wallet for securing company digital assets, stablecoin reserves, and smart contract signing keys.",
            "features": ["CC EAL5+ Certified Secure Element (ST33J2M0)", "Bluetooth Mobile App Sync", "OLED Display with Dual Physical Buttons", "Backup 24-Word Recovery Sheet"],
            "specs": [("Display", "128x64 pixels OLED"), ("Connector", "USB Type-C"), ("Battery", "100mAh (8h Standby)")],
            "hsn_sac_code": "85235100"
        },
        {
            "sku": "TREZOR-SAFE-5-TOUCH",
            "name": "Trezor Safe 5 Color Touchscreen Hardware Vault",
            "brand": "Trezor",
            "category": "Security & Access",
            "price": 18499.00,
            "cost_price": 12800.00,
            "original_price": 20999.00,
            "stock_quantity": 28,
            "reorder_threshold": 6,
            "image_url": "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80",
            "tagline": "Next-gen color touchscreen security device with haptic feedback & NDA-free architecture.",
            "description": "Open-source audited hardware security token with vibrant color touchscreen and Shamir Backup multi-share key redundancy.",
            "features": ["Color Touchscreen with Haptic Engine", "Shamir Secret Sharing (SLIP-39) Key Backup", "Open-source Audited Firmware", "Secure Element CC EAL6+"],
            "specs": [("Screen", "1.54\" Color OLED Touch (240x240)"), ("MicroSD Slot", "Encrypted MicroSD Card Slot"), ("Body", "Glass-filled Polycarbonate")],
            "hsn_sac_code": "85235100"
        },
        {
            "sku": "HID-OMNIKEY-5427-CK",
            "name": "HID OMNIKEY 5427 CK Contactless Smart Card Reader",
            "brand": "HID Global",
            "category": "Security & Access",
            "price": 11999.00,
            "cost_price": 7800.00,
            "original_price": 13999.00,
            "stock_quantity": 35,
            "reorder_threshold": 8,
            "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=80",
            "tagline": "Dual-frequency 13.56MHz & 125kHz enterprise employee badge desktop reader.",
            "description": "Reads standard corporate iCLASS, MIFARE, and HID Prox employee ID cards for secure physical terminal unlocking.",
            "features": ["Dual Frequency (13.56 MHz & 125 kHz)", "Keyboard Wedge & CCID Native Driver", "Driverless USB Plug & Play", "High-speed Card Read Transaction"],
            "specs": [("Interface", "USB 2.0 Full Speed"), ("Standards", "ISO 14443 A/B, ISO 15693, HID Prox"), ("Housing", "Heavy Desktop Base Included")],
            "hsn_sac_code": "84719000"
        },

        # Enterprise Network Storage & On-Premise Servers (41-45)
        {
            "sku": "SYNOLOGY-DS923-PLUS",
            "name": "Synology DiskStation DS923+ 4-Bay NAS Server",
            "brand": "Synology",
            "category": "Storage & Servers",
            "price": 62999.00,
            "cost_price": 48000.00,
            "original_price": 69999.00,
            "stock_quantity": 16,
            "reorder_threshold": 4,
            "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
            "tagline": "Compact 4-bay encrypted storage for statutory accounting archives & bank feeds.",
            "description": "4-bay storage solution designed for finance departments requiring air-gapped on-premise backups of sensitive ledgers.",
            "features": ["AMD Ryzen R1600 Dual-Core CPU", "Dual M.2 NVMe SSD Caching Slots", "Expandable up to 9 Drives (72TB Raw)", "Btrfs Snapshot Self-Healing File System"],
            "specs": [("RAM", "4GB DDR4 ECC (Up to 32GB)"), ("LAN", "2x 1GbE RJ45 with Link Aggregation"), ("Drive Bays", "4x 3.5\"/2.5\" SATA")],
            "hsn_sac_code": "84717020"
        },
        {
            "sku": "SYNOLOGY-DS1821-PLUS",
            "name": "Synology DiskStation DS1821+ 8-Bay High-Density NAS",
            "brand": "Synology",
            "category": "Storage & Servers",
            "price": 118999.00,
            "cost_price": 92000.00,
            "original_price": 132000.00,
            "stock_quantity": 8,
            "reorder_threshold": 2,
            "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
            "tagline": "8-bay quad-core Ryzen NAS for multi-year high-volume transaction cold storage.",
            "description": "High-capacity 8-bay network attached storage with PCIe expansion slot for 10GbE network cards.",
            "features": ["8 Drive Bays Scalable to 18 Bays", "AMD Ryzen V1500B Quad-Core 2.2 GHz", "PCIe 3.0 Slot for 10GbE Network Card", "Dual M.2 NVMe SSD Cache Acceleration"],
            "specs": [("RAM", "4GB DDR4 ECC (Expandable to 32GB)"), ("Max Internal Capacity", "144TB (8 x 18TB Drives)"), ("LAN", "4x 1GbE Ports")],
            "hsn_sac_code": "84717020"
        },
        {
            "sku": "DELL-POWEREDGE-R250",
            "name": "Dell PowerEdge R250 1U Rackmount Server",
            "brand": "Dell",
            "category": "Storage & Servers",
            "price": 142000.00,
            "cost_price": 110000.00,
            "original_price": 159000.00,
            "stock_quantity": 5,
            "reorder_threshold": 2,
            "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
            "tagline": "Enterprise 1U rackmount server for local ledger database & agent hosting.",
            "description": "Entry-level rack server powered by Intel Xeon E-2300 processors with redundant power supplies and iDRAC9 remote management.",
            "features": ["Intel Xeon E-2336 6-Core Processor", "iDRAC9 Enterprise Remote Management", "Hot-plug 3.5\" Drive Bays with RAID Controller", "Redundant 450W Platinum Power Supplies"],
            "specs": [("RAM", "32GB DDR4 ECC UDIMM"), ("Storage", "2x 960GB Enterprise SATA SSD (RAID 1)"), ("Form Factor", "1U Rackmount")],
            "hsn_sac_code": "84714190"
        },
        {
            "sku": "QNAP-TS-464-NAS",
            "name": "QNAP TS-464 4-Bay Quad-Core 2.5GbE NAS",
            "brand": "QNAP",
            "category": "Storage & Servers",
            "price": 58999.00,
            "cost_price": 44000.00,
            "original_price": 64999.00,
            "stock_quantity": 14,
            "reorder_threshold": 3,
            "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
            "tagline": "Dual 2.5GbE NAS with Intel Celeron quad-core & HDMI 4K direct output.",
            "description": "High-performance SMB storage appliance with hardware-accelerated AES-NI 256-bit encryption.",
            "features": ["Dual Native 2.5GbE High-speed Ports", "Intel Celeron N5095 Quad-Core 2.9 GHz", "HDMI 2.0 4K 60Hz Direct Display Out", "PCIe Gen 3 Slot for 10GbE or M.2 Expansion"],
            "specs": [("Memory", "8GB DDR4 (Dual Channel)"), ("Drive Bays", "4x 3.5\"/2.5\" SATA 6Gb/s"), ("USB", "2x USB 3.2 Gen 2 (10Gbps)")],
            "hsn_sac_code": "84717020"
        },
        {
            "sku": "SEAGATE-IRONWOLF-PRO-16TB",
            "name": "Seagate IronWolf Pro 16TB Enterprise NAS Hard Drive",
            "brand": "Seagate",
            "category": "Storage & Servers",
            "price": 32999.00,
            "cost_price": 24500.00,
            "original_price": 38999.00,
            "stock_quantity": 48,
            "reorder_threshold": 12,
            "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
            "tagline": "7200 RPM CMR enterprise hard drive with 300TB/year workload rating.",
            "description": "High-capacity CMR drive with built-in rotational vibration sensors for 24x7 multi-bay enterprise NAS environments.",
            "features": ["16TB Massive Storage Capacity", "CMR Conventional Magnetic Recording", "Rotational Vibration (RV) Sensors", "2.5 Million Hours MTBF"],
            "specs": [("Spindle Speed", "7200 RPM"), ("Cache", "256MB"), ("Warranty", "5 Years + 3 Years Rescue Data Recovery")],
            "hsn_sac_code": "84717020"
        },

        # Smart Retail Peripherals & Barcode Scanners (46-50)
        {
            "sku": "ZEBRA-DS2208-2D-SCAN",
            "name": "Zebra DS2208 1D/2D Handheld Barcode Scanner",
            "brand": "Zebra Technologies",
            "category": "Retail Peripherals",
            "price": 4899.00,
            "cost_price": 3100.00,
            "original_price": 5999.00,
            "stock_quantity": 95,
            "reorder_threshold": 20,
            "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80",
            "tagline": "Industry-standard omnidirectional 1D/2D barcode and smartphone QR reader.",
            "description": "Point-and-shoot imager that reads barcodes off paper labels or reflective smartphone screens instantaneously.",
            "features": ["Omnidirectional 1D & 2D QR Code Scanning", "Reads Damaged / Poorly Printed Barcodes", "Hands-free Presentation Stand Included", "Durable 1.5m Drop Resistance"],
            "specs": [("Sensor Resolution", "640 x 480 pixels"), ("Decode Range", "Up to 36.8 cm for standard UPC"), ("Interface", "USB Shielded Cable")],
            "hsn_sac_code": "84719000"
        },
        {
            "sku": "HONEYWELL-VOYAGER-1472G",
            "name": "Honeywell Voyager 1472g Wireless 2D Scanner",
            "brand": "Honeywell",
            "category": "Retail Peripherals",
            "price": 14999.00,
            "cost_price": 9800.00,
            "original_price": 17999.00,
            "stock_quantity": 35,
            "reorder_threshold": 8,
            "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80",
            "tagline": "Cordless Bluetooth 2D scanner with 30-meter wireless communication base.",
            "description": "Heavy-duty cordless scanner for warehouse inventory audits and retail checkout counters with long-lasting battery.",
            "features": ["30 Meter Wireless Bluetooth Range", "Up to 50,000 Scans per Charge", "Enhanced Depth of Field for Hard-to-reach Items", "IP42 Drop-resistant Seal"],
            "specs": [("Wireless", "Bluetooth v4.2 BLE (30m Range)"), ("Battery", "2400mAh Li-ion (14h Continuous)"), ("Cradle", "Charging & Communication Base")],
            "hsn_sac_code": "84719000"
        },
        {
            "sku": "EPSON-TM-T88VII-PRINTER",
            "name": "Epson TM-T88VII High-Speed Thermal Receipt Printer",
            "brand": "Epson",
            "category": "Retail Peripherals",
            "price": 21999.00,
            "cost_price": 15400.00,
            "original_price": 25999.00,
            "stock_quantity": 40,
            "reorder_threshold": 10,
            "image_url": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600&auto=format&fit=crop&q=80",
            "tagline": "Ultra-fast 500 mm/sec receipt printer with Ethernet, USB & cloud print API.",
            "description": "The market benchmark receipt printer capable of printing at blistering 500mm/s speeds with water-saving and paper-saving reduction modes.",
            "features": ["Fastest-in-class 500 mm/s Print Speed", "Multi-interface: USB, Ethernet, Serial, Wi-Fi", "Server Direct Print via Cloud Webhooks", "Auto-cutter Rated for 3 Million Cuts"],
            "specs": [("Print Resolution", "180 dpi"), ("Paper Width", "80mm / 58mm Selectable"), ("Reliability", "20 Million Print Lines / 3M Cuts")],
            "hsn_sac_code": "84433250"
        },
        {
            "sku": "APG-SERIES-100-CASH-DRAWER",
            "name": "APG Series 100 Heavy-Duty Steel Cash Drawer",
            "brand": "APG Cash Drawer",
            "category": "Retail Peripherals",
            "price": 8999.00,
            "cost_price": 5800.00,
            "original_price": 10999.00,
            "stock_quantity": 30,
            "reorder_threshold": 8,
            "image_url": "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop&q=80",
            "tagline": "Industrial steel cash drawer tested to 4+ million operating cycles.",
            "description": "Reinforced steel cash storage drawer with 5 bill / 8 coin till and RJ12 POS printer kicker cable.",
            "features": ["Industrial-grade Heavy Gauge Steel", "Tested to Over 4 Million Cycles", "Dual Media Slots for Cheques & Slips", "MultiPRO 24V Printer Kick Interface"],
            "specs": [("Till Layout", "5 Bill / 8 Coin Compartments"), ("Lock", "4-Function Lock (Locked, Open, Manual)"), ("Dimensions", "406 x 424 x 107 mm")],
            "hsn_sac_code": "83030000"
        },
        {
            "sku": "SONY-WH1000XM5-ANC",
            "name": "Sony WH-1000XM5 Noise Cancelling Headset",
            "brand": "Sony",
            "category": "Workstations & Peripherals",
            "price": 26990.00,
            "cost_price": 19500.00,
            "original_price": 34990.00,
            "stock_quantity": 52,
            "reorder_threshold": 12,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            "tagline": "Industry-leading active noise cancelling headphones for focused finance work.",
            "description": "Equipped with two processors and eight microphones for high-fidelity audio during executive board meetings and focus sessions.",
            "features": ["Dual Processor V1 + QN1 Active Noise Cancellation", "4 Beamforming Mics with AI Speech Filter", "30-Hour Long Battery Life", "Multi-point Bluetooth Device Pairing"],
            "specs": [("Battery", "30h with ANC / Fast Charge 3min=3h"), ("Weight", "250g"), ("Codec", "LDAC, AAC, SBC")],
            "hsn_sac_code": "85183000"
        }
    ]

    products = []
    for idx, item in enumerate(raw_data):
        pid = f"prod_{item['sku'].lower().replace('-', '_')}"
        now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Determine initial stock status
        stock_qty = item["stock_quantity"]
        reorder_th = item["reorder_threshold"]
        if stock_qty == 0:
            status = "Out of Stock"
            in_stock = False
        elif stock_qty <= reorder_th:
            status = "Low Stock"
            in_stock = True
        else:
            status = "In Stock"
            in_stock = True

        specs_dto = [ProductSpecDTO(key=k, value=v) for k, v in item.get("specs", [])]

        product = ProductDetailDTO(
            id=pid,
            sku=item["sku"],
            name=item["name"],
            brand=item["brand"],
            category=item["category"],
            price=item["price"],
            cost_price=item.get("cost_price", item["price"] * 0.7),
            original_price=item.get("original_price", item["price"] * 1.2),
            currency="INR",
            stock_quantity=stock_qty,
            reorder_threshold=reorder_th,
            stock_status=status,
            rating=round(4.7 + (idx % 4) * 0.1, 1),
            reviews_count=80 + (idx * 13) % 400,
            image_url=item["image_url"],
            tagline=item["tagline"],
            description=item["description"],
            features=item["features"],
            specs=specs_dto,
            in_stock=in_stock,
            delivery_time="1-3 business days",
            gst_rate_pct=18.0,
            hsn_sac_code=item.get("hsn_sac_code", "84705010"),
            created_at=now_str,
            updated_at=now_str
        )
        products.append(product)

    return products

class CatalogService:
    def __init__(self):
        self._products: Dict[str, ProductDetailDTO] = {p.id: p for p in generate_seed_50_products()}

    def get_all_products(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        stock_status: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: str = "newest", # "newest" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc" | "name"
        page: int = 1,
        limit: int = 50
    ) -> ProductListResponseDTO:
        items = list(self._products.values())

        # 1. Search Filter
        if search:
            q = search.lower().strip()
            items = [
                p for p in items
                if q in p.name.lower() or 
                   q in p.sku.lower() or 
                   q in p.brand.lower() or 
                   q in p.category.lower() or 
                   q in p.tagline.lower() or 
                   q in p.description.lower() or 
                   any(q in f.lower() for f in p.features)
            ]

        # 2. Category Filter
        if category and category.lower() != "all":
            items = [p for p in items if p.category.lower() == category.lower()]

        # 3. Stock Status Filter
        if stock_status and stock_status.lower() != "all":
            items = [p for p in items if p.stock_status.lower() == stock_status.lower()]

        # 4. Price Range
        if min_price is not None:
            items = [p for p in items if p.price >= min_price]
        if max_price is not None:
            items = [p for p in items if p.price <= max_price]

        # 5. Sorting
        if sort_by == "price_asc":
            items.sort(key=lambda x: x.price)
        elif sort_by == "price_desc":
            items.sort(key=lambda x: x.price, reverse=True)
        elif sort_by == "stock_asc":
            items.sort(key=lambda x: x.stock_quantity)
        elif sort_by == "stock_desc":
            items.sort(key=lambda x: x.stock_quantity, reverse=True)
        elif sort_by == "name":
            items.sort(key=lambda x: x.name.lower())
        else:
            items.sort(key=lambda x: x.created_at, reverse=True)

        total_count = len(items)
        total_pages = max(1, (total_count + limit - 1) // limit)
        start_idx = (page - 1) * limit
        paginated_items = items[start_idx : start_idx + limit]

        all_categories = sorted(list({p.category for p in self._products.values()}))

        return ProductListResponseDTO(
            products=paginated_items,
            total_count=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages,
            categories=all_categories
        )

    def get_product_by_id(self, product_id: str) -> Optional[ProductDetailDTO]:
        return self._products.get(product_id)

    def create_product(self, payload: ProductCreateDTO) -> ProductDetailDTO:
        pid = f"prod_{uuid.uuid4().hex[:10]}"
        sku = payload.sku or f"SKU-{uuid.uuid4().hex[:6].upper()}"
        now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        stock_qty = payload.stock_quantity
        reorder_th = payload.reorder_threshold
        if stock_qty == 0:
            status = "Out of Stock"
            in_stock = False
        elif stock_qty <= reorder_th:
            status = "Low Stock"
            in_stock = True
        else:
            status = "In Stock"
            in_stock = True

        image_url = payload.image_url or "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80"
        cost_price = payload.cost_price if payload.cost_price is not None else round(payload.price * 0.7, 2)
        original_price = payload.original_price if payload.original_price is not None else round(payload.price * 1.15, 2)

        new_product = ProductDetailDTO(
            id=pid,
            sku=sku,
            name=payload.name,
            brand=payload.brand,
            category=payload.category,
            price=payload.price,
            cost_price=cost_price,
            original_price=original_price,
            currency="INR",
            stock_quantity=stock_qty,
            reorder_threshold=reorder_th,
            stock_status=status,
            rating=5.0,
            reviews_count=1,
            image_url=image_url,
            tagline=payload.tagline,
            description=payload.description,
            features=payload.features,
            specs=payload.specs,
            in_stock=in_stock,
            delivery_time=payload.delivery_time or "2-3 business days",
            gst_rate_pct=payload.gst_rate_pct,
            hsn_sac_code=payload.hsn_sac_code or "84705010",
            created_at=now_str,
            updated_at=now_str
        )

        self._products[pid] = new_product
        return new_product

    def update_product(self, product_id: str, payload: ProductUpdateDTO) -> Optional[ProductDetailDTO]:
        existing = self._products.get(product_id)
        if not existing:
            return None

        update_dict = payload.model_dump(exclude_unset=True)
        now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        data = existing.model_dump()
        for k, v in update_dict.items():
            if v is not None:
                data[k] = v

        # Re-evaluate stock status
        stock_qty = data["stock_quantity"]
        reorder_th = data["reorder_threshold"]
        if stock_qty == 0:
            data["stock_status"] = "Out of Stock"
            data["in_stock"] = False
        elif stock_qty <= reorder_th:
            data["stock_status"] = "Low Stock"
            data["in_stock"] = True
        else:
            data["stock_status"] = "In Stock"
            data["in_stock"] = True

        data["updated_at"] = now_str
        updated = ProductDetailDTO(**data)
        self._products[product_id] = updated
        return updated

    def adjust_stock(self, product_id: str, quantity: int, adjustment_type: str = "set") -> Optional[ProductDetailDTO]:
        existing = self._products.get(product_id)
        if not existing:
            return None

        current_stock = existing.stock_quantity
        if adjustment_type == "increment":
            new_stock = current_stock + quantity
        elif adjustment_type == "decrement":
            new_stock = max(0, current_stock - quantity)
        else:
            new_stock = max(0, quantity)

        return self.update_product(product_id, ProductUpdateDTO(stock_quantity=new_stock))

    def delete_product(self, product_id: str) -> bool:
        if product_id in self._products:
            del self._products[product_id]
            return True
        return False

    def get_catalog_stats(self) -> CatalogStatsDTO:
        items = list(self._products.values())
        total_products = len(items)
        total_units = sum(p.stock_quantity for p in items)
        total_val = sum(p.price * p.stock_quantity for p in items)
        low_stock = sum(1 for p in items if p.stock_status == "Low Stock")
        out_of_stock = sum(1 for p in items if p.stock_status == "Out of Stock")
        in_stock_items = sum(1 for p in items if p.stock_status == "In Stock")
        in_stock_rate = round((in_stock_items / max(1, total_products)) * 100, 1)
        cat_count = len({p.category for p in items})

        return CatalogStatsDTO(
            total_products=total_products,
            total_inventory_units=total_units,
            total_valuation_inr=round(total_val, 2),
            low_stock_count=low_stock,
            out_of_stock_count=out_of_stock,
            in_stock_rate_pct=in_stock_rate,
            categories_count=cat_count
        )

    def get_categories_breakdown(self) -> List[CategoryCountDTO]:
        items = list(self._products.values())
        breakdown: Dict[str, Dict[str, int]] = {}
        for p in items:
            cat = p.category
            if cat not in breakdown:
                breakdown[cat] = {"count": 0, "units": 0}
            breakdown[cat]["count"] += 1
            breakdown[cat]["units"] += p.stock_quantity

        return [
            CategoryCountDTO(category=k, count=v["count"], total_units=v["units"])
            for k, v in sorted(breakdown.items())
        ]

    def get_ai_readable_context(self) -> AICatalogContextDTO:
        items = list(self._products.values())
        ai_products: List[AICatalogProductItemDTO] = []

        for p in items:
            specs_map = {s.key: s.value for s in p.specs}
            ai_products.append(AICatalogProductItemDTO(
                id=p.id,
                sku=p.sku,
                name=p.name,
                brand=p.brand,
                category=p.category,
                price_inr=p.price,
                stock_status=p.stock_status,
                available_units=p.stock_quantity,
                key_features=p.features,
                specs_summary=specs_map,
                gst_input_credit_pct=p.gst_rate_pct
            ))

        categories = sorted(list({p.category for p in items}))
        instructions = (
            "This structured product catalog is optimized for LLMs, autonomous financial agents, "
            "and conversational commerce bots. All prices are in Indian Rupees (INR) and eligible for 18% GST input credit. "
            "Use the exact product `id` and `sku` when formulating tool calls or generating Razorpay payment links."
        )

        return AICatalogContextDTO(
            schema_version="2026.1",
            platform="RazorRecon Commerce & Inventory System",
            currency="INR",
            last_synced=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            total_items=len(ai_products),
            categories=categories,
            products=ai_products,
            instructions_for_llm=instructions
        )

catalog_service = CatalogService()
