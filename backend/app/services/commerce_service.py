from __future__ import annotations

import re
import uuid
import datetime
from typing import List, Dict, Any, Optional, Union
from app.schemas.commerce import (
    ProductDTO,
    ProductSpecDTO,
    CartDTO,
    CartItemDTO,
    ComparisonDataDTO,
    ComparisonAttributeDTO,
    CommerceChatResponseDTO,
    CheckoutResponseDTO
)
from app.services.pricing_service import (
    get_applicable_tier,
    calculate_volume_discount,
    apply_volume_pricing,
    pricing_service
)
from app.services.ai_search_service import ai_search_service

# Comprehensive Enterprise & Merchant Product Catalog with Pros & Cons
SAMPLE_PRODUCTS: List[ProductDTO] = [
    # 1. POS TERMINALS
    ProductDTO(
        id="prod_pos_smart_v3",
        name="Razorpay Smart POS Terminal V3 Pro",
        brand="Razorpay Hardware",
        category="Payment Terminals",
        price=14999.00,
        original_price=17999.00,
        currency="INR",
        rating=4.9,
        reviews_count=284,
        image_url="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
        tagline="Next-gen all-in-one smart Android POS terminal with dual displays and 4G eSIM.",
        description="Enterprise-grade Android 13 POS terminal designed for high-throughput retail and restaurant operations. Features contactless NFC, Dynamic QR, UPI Sound, biometric thermal receipt printing, and instant reconciliation sync.",
        features=[
            "Supports NFC, Chip & PIN, Dynamic BharatQR, UPI AutoPay",
            "High-speed 80mm/s Japanese thermal receipt printer",
            "5.5-inch HD IPS touchscreen with secondary customer-facing display",
            "5200mAh all-day hot-swappable battery with fast charge",
            "Direct webhook & ERP reconciliation integration"
        ],
        specs=[
            ProductSpecDTO(key="OS & Processor", value="Android 13 OS / Quad-Core 2.0 GHz"),
            ProductSpecDTO(key="Connectivity", value="4G Dual-SIM eSIM + Wi-Fi 6 + Bluetooth 5.2"),
            ProductSpecDTO(key="Display", value="5.5\" HD IPS Multi-touch (1280x720)"),
            ProductSpecDTO(key="Battery Life", value="18+ hours continuous operating time"),
            ProductSpecDTO(key="Printer", value="High-Speed 80mm/s Built-in Thermal"),
            ProductSpecDTO(key="Warranty", value="2 Years Enterprise Replacement Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Highest rating (4.9 ★) with 280+ verified enterprise reviews",
            "Longest battery endurance (18+ hours hot-swappable)",
            "Built-in 80mm high-speed Japanese thermal receipt printer",
            "Pre-activated lifetime 4G Dual-SIM eSIM included"
        ],
        cons=[
            "Slightly heavier (430g) due to industrial casing",
            "Requires optional charging dock for hands-free counter mode"
        ],
        stock_status="In Stock (42 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=99.4,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_pos_v2_lite",
        name="Razorpay Android POS Terminal V2 Lite",
        brand="Razorpay Hardware",
        category="Payment Terminals",
        price=9999.00,
        original_price=12499.00,
        currency="INR",
        rating=4.7,
        reviews_count=189,
        image_url="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=80",
        tagline="Lightweight handheld Android smart billing terminal for mobile counters.",
        description="Compact 5-inch handheld terminal supporting BharatQR, contactless tap-to-pay, and standard 58mm roll printing. Ideal for quick service kiosks and pop-up storefronts.",
        features=[
            "5-inch bright IPS capacitive display",
            "Integrated 58mm thermal paper printer",
            "4G connectivity + Wi-Fi",
            "3000mAh rechargeable lithium battery",
            "Seamless Razorpay Merchant dashboard synchronization"
        ],
        specs=[
            ProductSpecDTO(key="OS & Processor", value="Android 11 OS / Quad-Core 1.5 GHz"),
            ProductSpecDTO(key="Connectivity", value="4G LTE + Wi-Fi 2.4/5GHz"),
            ProductSpecDTO(key="Display", value="5.0\" FWVGA Touchscreen"),
            ProductSpecDTO(key="Battery Life", value="10-12 hours active usage"),
            ProductSpecDTO(key="Printer", value="58mm Standard Thermal Printer"),
            ProductSpecDTO(key="Warranty", value="1 Year Standard Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Most affordable full Android POS terminal (Under ₹10,000)",
            "Ultra-lightweight (290g) and pocket friendly",
            "Fast 58mm receipt generation"
        ],
        cons=[
            "Smaller 58mm paper rolls require more frequent changes",
            "Lower battery capacity (3000mAh) compared to V3 Pro"
        ],
        stock_status="In Stock (78 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=97.8,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_pos_mini_qr",
        name="Razorpay Pocket Dynamic QR POS Mini",
        brand="Razorpay Hardware",
        category="Payment Terminals",
        price=5999.00,
        original_price=7999.00,
        currency="INR",
        rating=4.6,
        reviews_count=142,
        image_url="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
        tagline="Ultra-portable pocket terminal with dynamic QR screen and audio announcement.",
        description="Entry-level electronic payment device with dynamic UPI QR generation on a color LCD, NFC card tap, and instant multi-language audio feedback.",
        features=[
            "Dynamic UPI QR generation for error-free customer billing",
            "Contactless NFC tap-to-pay support",
            "Loud 2W built-in voice alert speaker",
            "Bluetooth pairing with iOS and Android smartphones",
            "Pocket-sized ergonomic casing"
        ],
        specs=[
            ProductSpecDTO(key="Display", value="2.4\" Color TFT Screen"),
            ProductSpecDTO(key="Connectivity", value="4G eSIM + Bluetooth 5.0"),
            ProductSpecDTO(key="Battery Life", value="24+ hours standby"),
            ProductSpecDTO(key="Printer", value="Digital SMS/WhatsApp Receipts (No Paper)"),
            ProductSpecDTO(key="Warranty", value="1 Year Replacement Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Lowest upfront cost (₹5,999)",
            "Zero paper consumable expenses (digital WhatsApp receipts)",
            "Superb 24+ hour standby battery life"
        ],
        cons=[
            "No physical paper printer built-in",
            "Compact screen not suitable for complex itemized inventory"
        ],
        stock_status="In Stock (110 units available)",
        delivery_eta="2 business days via Delhivery",
        merchant_trust_score=98.1,
        in_stock=True,
        delivery_time="2-3 business days",
        gst_rate_pct=18.0
    ),

    # 2. LAPTOPS & ENTERPRISE WORKSTATIONS
    ProductDTO(
        id="prod_laptop_thinkpad",
        name="Lenovo ThinkPad L14 Gen 4 FinTech Workstation",
        brand="Lenovo",
        category="Workstations & Laptops",
        price=54999.00,
        original_price=64999.00,
        currency="INR",
        rating=4.9,
        reviews_count=192,
        image_url="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
        tagline="Mil-Spec rugged business laptop with 16GB RAM, 512GB NVMe SSD, and discrete TPM 2.0.",
        description="Built for financial analysts, accountants, and store operators. Features AMD Ryzen 5 PRO 7530U, 16GB DDR4 memory, fingerprint reader, Spill-resistant keyboard, and 14-inch Anti-Glare FHD display.",
        features=[
            "AMD Ryzen 5 PRO 7530U (6 Cores / 12 Threads up to 4.5 GHz)",
            "16GB DDR4-3200MHz RAM (Dual-channel upgradeable to 64GB)",
            "512GB PCIe Gen4 M.2 NVMe SSD",
            "14\" Full HD IPS 300-nits Anti-Glare Display",
            "Hardware dTPM 2.0 security chip & biometric fingerprint reader"
        ],
        specs=[
            ProductSpecDTO(key="Processor", value="AMD Ryzen 5 PRO 7530U 6-Core"),
            ProductSpecDTO(key="RAM & Storage", value="16GB DDR4 RAM + 512GB NVMe SSD"),
            ProductSpecDTO(key="Display", value="14.0\" FHD IPS (1920x1080) Anti-Glare"),
            ProductSpecDTO(key="Battery Life", value="11+ hours (57Wh with RapidCharge 80% in 60min)"),
            ProductSpecDTO(key="Warranty", value="3 Years On-site Premier Commercial Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Exceptional MIL-STD-810H durability & spill-resistant keyboard",
            "Comprehensive 3-year on-site enterprise warranty",
            "Hardware dTPM 2.0 encryption for banking data safety",
            "Comfortably under the ₹60,000 corporate budget"
        ],
        cons=[
            "Standard 300-nits brightness (best suited for indoor office/store environments)"
        ],
        stock_status="In Stock (18 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=99.2,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_laptop_asus",
        name="ASUS ExpertBook B1 Business Enterprise Ultrabook",
        brand="ASUS",
        category="Workstations & Laptops",
        price=46999.00,
        original_price=54999.00,
        currency="INR",
        rating=4.7,
        reviews_count=138,
        image_url="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
        tagline="Lightweight 1.4kg corporate ultrabook with Intel Core i5 and numeric keypad.",
        description="Engineered for retail managers and accounting executives. Features Intel Core i5-1235U, 16GB RAM, 512GB SSD, NumberPad 2.0 LED illuminated keypad on trackpad, and Wi-Fi 6E.",
        features=[
            "Intel Core i5-1235U 10-Core Processor (12M Cache, up to 4.4 GHz)",
            "16GB Dual-Channel DDR4 RAM",
            "512GB M.2 NVMe PCIe 4.0 SSD",
            "Ultra-light 1.46kg portable chassis with 180° lay-flat hinge",
            "ASUS NumberPad integrated on touchpad for rapid Excel entry"
        ],
        specs=[
            ProductSpecDTO(key="Processor", value="Intel Core i5-1235U 10-Core"),
            ProductSpecDTO(key="RAM & Storage", value="16GB DDR4 + 512GB SSD"),
            ProductSpecDTO(key="Display", value="14.0\" Full HD NanoEdge Display"),
            ProductSpecDTO(key="Battery Life", value="8-9 hours active use"),
            ProductSpecDTO(key="Warranty", value="1 Year Comprehensive Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Value price (₹46,999) leaving ₹13,000 surplus under ₹60K budget",
            "Innovative LED NumberPad on trackpad for rapid financial accounting",
            "Lightweight (1.46kg) and easy to carry"
        ],
        cons=[
            "1 Year standard warranty (vs 3 years on ThinkPad)",
            "Battery capacity (42Wh) provides ~8 hours under heavy load"
        ],
        stock_status="In Stock (24 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=97.5,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_laptop_hp",
        name="HP ProBook 445 G10 Quad-Core Financial Edition",
        brand="HP",
        category="Workstations & Laptops",
        price=58999.00,
        original_price=67999.00,
        currency="INR",
        rating=4.8,
        reviews_count=165,
        image_url="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
        tagline="Premium aluminum chassis commercial laptop with HP Wolf Security suite.",
        description="Premium commercial laptop featuring AMD Ryzen 5 7530U, 16GB RAM, 512GB NVMe SSD, HP Sure Click hardware malware isolation, and 51Wh long-life battery.",
        features=[
            "AMD Ryzen 5 7530U processor with Radeon Graphics",
            "16GB DDR4-3200 SDRAM",
            "512GB PCIe NVMe Value SSD",
            "HP Wolf Pro Security Edition for zero-threat financial operations",
            "Durable all-aluminum display enclosure and palm rest"
        ],
        specs=[
            ProductSpecDTO(key="Processor", value="AMD Ryzen 5 7530U 6-Core"),
            ProductSpecDTO(key="RAM & Storage", value="16GB RAM + 512GB NVMe SSD"),
            ProductSpecDTO(key="Display", value="14.0\" Diagonal FHD IPS eDP anti-glare"),
            ProductSpecDTO(key="Battery Life", value="10 hours (51Wh HP Long Life Battery)"),
            ProductSpecDTO(key="Warranty", value="2 Years HP Commercial On-site Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "All-aluminum chassis provides premium executive build quality",
            "HP Wolf Security suite provides hardware-level firmware defense",
            "2-Year commercial on-site support included"
        ],
        cons=[
            "Priced near the upper budget limit (₹58,999)",
            "Audio speakers are average for media playback"
        ],
        stock_status="In Stock (12 units available)",
        delivery_eta="2 business days via Delhivery",
        merchant_trust_score=98.9,
        in_stock=True,
        delivery_time="2-3 business days",
        gst_rate_pct=18.0
    ),

    # 3. RECEIPT & BILLING PRINTERS
    ProductDTO(
        id="prod_printer_epson",
        name="Epson TM-T82X High-Speed 80mm GST Thermal Billing Printer",
        brand="Epson",
        category="Receipt & Billing Printers",
        price=7499.00,
        original_price=9499.00,
        currency="INR",
        rating=4.9,
        reviews_count=312,
        image_url="https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80",
        tagline="Heavy-duty 200mm/sec 80mm thermal receipt printer with auto-cutter for high traffic.",
        description="The gold standard in retail receipt printing. High-speed 200mm/s print speed, autocutter rated for 1.5 million cuts, USB + Serial dual interface, and ESC/POS POS software compatibility.",
        features=[
            "Fast 200mm/sec thermal receipt output",
            "Heavy-duty auto-cutter rated for 1,500,000 cuts",
            "Supports 80mm and 58mm paper roll widths",
            "Dual interface: USB 2.0 + RS-232 Serial",
            "Wall-mountable space saving design"
        ],
        specs=[
            ProductSpecDTO(key="Print Speed", value="200 mm/sec Thermal"),
            ProductSpecDTO(key="Paper Width", value="80mm / 58mm with spacer"),
            ProductSpecDTO(key="Auto-Cutter", value="1.5 Million Cuts Rating"),
            ProductSpecDTO(key="Interface", value="USB + Serial + Cash Drawer Port"),
            ProductSpecDTO(key="Warranty", value="2 Years Epson Replacement Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Fastest printing speed (200mm/s) in its class",
            "Highest reliability auto-cutter (1.5M cuts)",
            "Universal compatibility with all billing software (Tally, Marg, Vyapar)"
        ],
        cons=[
            "Requires wired USB connection (Ethernet module optional add-on)"
        ],
        stock_status="In Stock (35 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=99.6,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_printer_tvs",
        name="TVS Electronics RP3200 Star Thermal Receipt Printer",
        brand="TVS Electronics",
        category="Receipt & Billing Printers",
        price=5999.00,
        original_price=7499.00,
        currency="INR",
        rating=4.7,
        reviews_count=215,
        image_url="https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600&auto=format&fit=crop&q=80",
        tagline="Economical 80mm thermal bill printer with rugged Indian voltage fluctuation defense.",
        description="Designed specifically for Indian retail conditions with high voltage fluctuation tolerance. Features 200mm/s print speed, USB + Ethernet connectivity, and drop-in paper loading.",
        features=[
            "Rugged power supply tolerant to 160V-270V fluctuations",
            "USB + Ethernet LAN connectivity included out of the box",
            "Auto-cutter with jam relief mechanism",
            "Drop-in easy paper loading",
            "Low energy consumption Energy Star certified"
        ],
        specs=[
            ProductSpecDTO(key="Print Speed", value="200 mm/sec"),
            ProductSpecDTO(key="Paper Width", value="80mm Thermal Paper"),
            ProductSpecDTO(key="Connectivity", value="USB + Ethernet LAN"),
            ProductSpecDTO(key="Warranty", value="1 Year On-site Manufacturer Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Built-in Ethernet LAN port for network billing across multiple counters",
            "Excellent voltage surge tolerance for Indian power grids",
            "Competitive price (₹5,999)"
        ],
        cons=[
            "Cutter rated for 1.0M cuts (vs 1.5M on Epson)"
        ],
        stock_status="In Stock (50 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=98.0,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_printer_zebra",
        name="Zebra ZD220 Industrial Barcode & Label Printer",
        brand="Zebra Technologies",
        category="Receipt & Billing Printers",
        price=12499.00,
        original_price=15999.00,
        currency="INR",
        rating=4.8,
        reviews_count=180,
        image_url="https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80",
        tagline="Commercial direct thermal & thermal transfer 4-inch label and barcode printer.",
        description="Heavy-duty 4-inch desktop printer designed for inventory barcode tagging, shipping labels, and product price stickers. Supports 102mm/s print speed and 74m ribbon rolls.",
        features=[
            "Dual-wall frame construction for increased durability",
            "Prints barcodes, SKU price stickers, and logistics shipping labels",
            "Direct thermal & Thermal Transfer printing support",
            "OpenACCESS design for easy label loading",
            "ENERGY STAR certified"
        ],
        specs=[
            ProductSpecDTO(key="Print Resolution", value="203 dpi (8 dots/mm)"),
            ProductSpecDTO(key="Max Print Width", value="4.09 in / 104 mm"),
            ProductSpecDTO(key="Print Speed", value="4 in/sec (102 mm/s)"),
            ProductSpecDTO(key="Connectivity", value="USB 2.0"),
            ProductSpecDTO(key="Warranty", value="2 Years Zebra Replacement Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Industrial grade barcode label printing for warehouse & retail tags",
            "Durable dual-wall casing built to last 5+ years",
            "Supports both direct thermal and ribbon transfer"
        ],
        cons=[
            "Higher cost (₹12,499) as it is a specialized label/sticker printer"
        ],
        stock_status="In Stock (20 units available)",
        delivery_eta="2 business days via Delhivery",
        merchant_trust_score=99.1,
        in_stock=True,
        delivery_time="2-3 business days",
        gst_rate_pct=18.0
    ),

    # 4. CCTV & STORE SECURITY CAMERAS
    ProductDTO(
        id="prod_cctv_hikvision",
        name="Hikvision 4K UltraHD AI Smart Store Security Camera",
        brand="Hikvision",
        category="Security & Access",
        price=4999.00,
        original_price=6499.00,
        currency="INR",
        rating=4.9,
        reviews_count=340,
        image_url="https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80",
        tagline="4K 8MP UltraHD Smart AI CCTV with ColorVu 24/7 night vision and human/vehicle detection.",
        description="Industry-leading commercial security camera for store registers, cash counters, and inventory aisles. Features full color night vision, built-in mic, IP67 weatherproof rating, and AcuSense AI false alarm filter.",
        features=[
            "4K 8MP UltraHD resolution with F1.0 super aperture",
            "ColorVu technology for 24/7 vivid color imaging in total darkness",
            "AcuSense AI motion filter categorizing humans vs animals/shadows",
            "Built-in high sensitivity noise-reducing microphone",
            "IP67 water and dust resistant aluminum alloy body"
        ],
        specs=[
            ProductSpecDTO(key="Resolution", value="4K 8MP (3840 x 2160 at 20fps)"),
            ProductSpecDTO(key="Night Vision", value="24/7 Full ColorVu (Up to 30m White Light)"),
            ProductSpecDTO(key="Audio", value="Integrated Audio Mic with G.711u codec"),
            ProductSpecDTO(key="Storage", value="MicroSD slot up to 512GB + NVR/Cloud"),
            ProductSpecDTO(key="Warranty", value="2 Years Hikvision Replacement Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "True 4K 8MP clarity allows reading currency bills and bill receipts",
            "ColorVu 24/7 full color night vision even in total store darkness",
            "AcuSense AI detects shoplifting and perimeter intrusions with zero false alarms"
        ],
        cons=[
            "Requires PoE cable or 12V DC power adapter (PoE switch recommended)"
        ],
        stock_status="In Stock (64 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=99.5,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_cctv_cpplus",
        name="CP PLUS 360° Smart Wi-Fi 4MP Commercial PT Camera",
        brand="CP PLUS",
        category="Security & Access",
        price=2899.00,
        original_price=3999.00,
        currency="INR",
        rating=4.7,
        reviews_count=480,
        image_url="https://images.unsplash.com/photo-1549109926-58f039549485?w=600&auto=format&fit=crop&q=80",
        tagline="Wireless 360° pan-tilt smart store camera with two-way audio talkback.",
        description="Wireless standalone CCTV camera ideal for small retail stores and cafes. 360° panoramic rotation, 4MP 2K resolution, two-way live intercom talkback, and instant mobile phone push notifications.",
        features=[
            "360° Pan & 90° Tilt coverage with auto-motion tracking",
            "4MP 2K crystal clear video streaming",
            "Full duplex two-way audio intercom for remote communication",
            "Wireless Wi-Fi connectivity (No DVR/NVR cabling needed)",
            "Alexa & Google Assistant smart display integration"
        ],
        specs=[
            ProductSpecDTO(key="Resolution", value="4MP 2K (2560 x 1440)"),
            ProductSpecDTO(key="Pan/Tilt", value="355° Horizontal, 90° Vertical"),
            ProductSpecDTO(key="Connectivity", value="2.4GHz Wi-Fi + RJ45 LAN"),
            ProductSpecDTO(key="Storage", value="MicroSD slot up to 256GB + Cloud"),
            ProductSpecDTO(key="Warranty", value="1 Year Manufacturer Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Most affordable 360° camera (₹2,899)",
            "100% wireless Wi-Fi setup without complex wiring",
            "Two-way talkback allows speaking directly to cashiers from mobile app"
        ],
        cons=[
            "Plastic indoor dome housing (not waterproof for outdoor exposure)",
            "Infrared night vision is monochrome black-and-white"
        ],
        stock_status="In Stock (95 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=98.2,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_cctv_dahua",
        name="Dahua WizSense AI Dual-Lens Commercial CCTV",
        brand="Dahua",
        category="Security & Access",
        price=6499.00,
        original_price=8499.00,
        currency="INR",
        rating=4.8,
        reviews_count=175,
        image_url="https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?w=600&auto=format&fit=crop&q=80",
        tagline="Dual-lens optical zoom AI camera with active siren and red-blue strobe deterrent.",
        description="Heavy-duty commercial deterrence camera. Dual optical lenses provide wide panoramic coverage and telephoto cash register zoom simultaneously. Active red-blue strobe lights and voice alarm ward off intruders.",
        features=[
            "Dual-lens setup (Wide Angle + Telephoto Zoom)",
            "Active deterrence with flashing red/blue LED strobes and 110dB siren",
            "WizSense AI vehicle and face recognition engine",
            "Two-way audio intercom with active noise cancellation",
            "IP67 all-weather metallic casing"
        ],
        specs=[
            ProductSpecDTO(key="Resolution", value="5MP SuperHD Dual Sensor"),
            ProductSpecDTO(key="Deterrence", value="110dB Siren + Red/Blue Flashing Strobes"),
            ProductSpecDTO(key="Night Vision", value="Smart Dual Light (IR 40m + Warm Light 30m)"),
            ProductSpecDTO(key="Warranty", value="2 Years Dahua Commercial Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Active strobe lights and siren automatically deter trespassers after hours",
            "Dual lens allows simultaneous wide-angle store view and zoomed register view",
            "Solid metal casing withstands vandalism"
        ],
        cons=[
            "Requires PoE switch and professional mounting setup"
        ],
        stock_status="In Stock (22 units available)",
        delivery_eta="2 business days via Delhivery",
        merchant_trust_score=99.0,
        in_stock=True,
        delivery_time="2-3 business days",
        gst_rate_pct=18.0
    ),

    # 5. SOUNDBOXES & PAYMENT AUDIO ALERTS
    ProductDTO(
        id="prod_soundbox_4g",
        name="Razorpay Smart Soundbox 4G Pro",
        brand="Razorpay Hardware",
        category="Payment Audio Alerts",
        price=2499.00,
        original_price=2999.00,
        currency="INR",
        rating=4.8,
        reviews_count=612,
        image_url="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
        tagline="Instant multi-lingual audio confirmation for UPI & QR payments with LED screen.",
        description="High-volume 3W front-firing speaker device with multi-language voice announcements across 11 Indian regional languages. Powered by 4G IoT connectivity with zero Wi-Fi dependency.",
        features=[
            "Instant voice alerts in Hindi, English, Tamil, Telugu, Kannada, Marathi & more",
            "1.8-inch bright LED amount confirmation display",
            "4G Cat-1 IoT module with pre-activated Lifetime SIM",
            "Heavy-duty 2600mAh battery lasting up to 5 days on a single charge",
            "Tamper-proof casing with IP54 water & dust resistance"
        ],
        specs=[
            ProductSpecDTO(key="Audio Output", value="3W High-fidelity Front Speaker (>95dB)"),
            ProductSpecDTO(key="Supported Languages", value="11 Indian Regional Languages"),
            ProductSpecDTO(key="Battery Standby", value="120 hours standby / 5 days active"),
            ProductSpecDTO(key="Network", value="4G VoLTE / 2G Auto-fallback"),
            ProductSpecDTO(key="Warranty", value="1 Year Standard Manufacturer Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Loud 95dB speaker easily cuts through loud market noise",
            "LED screen provides visual amount confirmation alongside voice",
            "Pre-activated lifetime 4G SIM with zero monthly subscription fee"
        ],
        cons=[
            "Requires charging every 5-6 days"
        ],
        stock_status="In Stock (140 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=99.2,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_soundbox_v2_led",
        name="Razorpay Soundbox V2 LED Multi-Lingual",
        brand="Razorpay Hardware",
        category="Payment Audio Alerts",
        price=1899.00,
        original_price=2299.00,
        currency="INR",
        rating=4.7,
        reviews_count=320,
        image_url="https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80",
        tagline="Compact 4G audio box with high-clarity voice broadcasts.",
        description="Compact audio alert speaker for smaller checkout counters. Features 2.5W speaker, instant 4G payment confirmation, and simple single-button replay.",
        features=[
            "2.5W crystal clear audio speaker",
            "Instant 4G payment confirmation alerts",
            "Multi-language support across 8 languages",
            "Replay button to replay last received payment",
            "2000mAh battery lasting 3-4 days"
        ],
        specs=[
            ProductSpecDTO(key="Audio Output", value="2.5W Speaker (88dB)"),
            ProductSpecDTO(key="Languages", value="8 Regional Languages"),
            ProductSpecDTO(key="Battery", value="2000mAh Lithium Ion (3-4 Days)"),
            ProductSpecDTO(key="Warranty", value="1 Year Replacement Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Budget-friendly price (₹1,899)",
            "Compact footprint fits any counter corner",
            "Dedicated replay button for busy cashiers"
        ],
        cons=[
            "Slightly lower volume (88dB) compared to 4G Pro",
            "No LED amount screen"
        ],
        stock_status="In Stock (85 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=98.4,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_soundbox_solar",
        name="BharatVoice 4G Solar-Charging Smart Soundbox",
        brand="BharatVoice",
        category="Payment Audio Alerts",
        price=2999.00,
        original_price=3499.00,
        currency="INR",
        rating=4.8,
        reviews_count=190,
        image_url="https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80",
        tagline="Continuous solar-powered 4G payment audio notifier for outdoor stalls.",
        description="Built specifically for outdoor vegetable, street food, and market vendors. Integrated high-efficiency top solar panel keeps the 3500mAh battery charged continuously under sunlight.",
        features=[
            "Integrated monocrystalline solar charging panel",
            "Non-stop operation without needing wall outlet charging",
            "Loud 3.5W dual acoustic drivers",
            "IP65 waterproof & dustproof rugged casing",
            "4G Dual SIM auto-network switching"
        ],
        specs=[
            ProductSpecDTO(key="Solar Panel", value="High-efficiency Monocrystalline Panel"),
            ProductSpecDTO(key="Battery", value="3500mAh with Solar Continuous Trickle"),
            ProductSpecDTO(key="Audio Output", value="3.5W Loudspeaker (>98dB)"),
            ProductSpecDTO(key="Durability", value="IP65 All-Weather Waterproof"),
            ProductSpecDTO(key="Warranty", value="1 Year Manufacturer Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Infinite battery life outdoors via solar power",
            "IP65 waterproof rating withstands monsoon rain and dust",
            "Loudest speaker (98dB) for noisy outdoor street markets"
        ],
        cons=[
            "Slightly larger form factor to accommodate solar panel"
        ],
        stock_status="In Stock (38 units available)",
        delivery_eta="2 business days via Delhivery",
        merchant_trust_score=98.7,
        in_stock=True,
        delivery_time="2-3 business days",
        gst_rate_pct=18.0
    ),

    # 6. ENTERPRISE SOFTWARE
    ProductDTO(
        id="prod_finops_ledger_suite",
        name="RazorRecon Enterprise Autonomous FinOps License",
        brand="RazorRecon Software",
        category="Enterprise Software",
        price=49999.00,
        original_price=59999.00,
        currency="INR",
        rating=5.0,
        reviews_count=98,
        image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
        tagline="Autonomous multi-channel reconciliation, vendor memory engine & CFO Copilot (Annual).",
        description="Annual enterprise subscription for RazorRecon AI. Includes multi-entity support, unlimited payment gateway ingestion, real-time fraud sentinel, automated month-end period lock, and custom ERP integration connectors.",
        features=[
            "Unlimited transaction ingestion across Razorpay, Stripe, Amazon, Shopify",
            "Forensic Vendor Behavioral Memory & Counterparty Risk Engine",
            "Autonomous 7-phase Month-End Close agent workflow",
            "ReAct CFO Copilot with custom treasury RAG queries",
            "Dedicated 24/7 Solutions Architect & SLA guarantee"
        ],
        specs=[
            ProductSpecDTO(key="Deployment", value="Cloud Managed SaaS / Dedicated VPC Option"),
            ProductSpecDTO(key="User Seats", value="Up to 25 Enterprise Operators (RBAC)"),
            ProductSpecDTO(key="Data Retention", value="7 Years Statutory Audit Compliance"),
            ProductSpecDTO(key="Compliance", value="SOC2 Type II, ISO 27001, GDPR & RBI Compliant"),
            ProductSpecDTO(key="Billing Cycle", value="Annual Enterprise Contract (Billed Yearly)"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Saves 40+ hours monthly on financial reconciliation & GST audit",
            "Zero-latency multi-bank ledger integration",
            "24/7 Dedicated enterprise SLA & solution architect support"
        ],
        cons=[
            "Requires administrative setup for ERP database connector"
        ],
        stock_status="Instant Digital Provisioning",
        delivery_eta="Instant Automated Activation (0 Minutes)",
        merchant_trust_score=99.9,
        in_stock=True,
        delivery_time="Instant Digital Provisioning",
        gst_rate_pct=18.0
    ),
    # 7. SMART TVS & DISPLAYS
    ProductDTO(
        id="prod_tv_sony_bravia",
        name="Sony Bravia 43-inch 4K Ultra HD Smart Google TV",
        brand="Sony",
        category="Smart TVs & Displays",
        price=37999.00,
        original_price=44990.00,
        currency="INR",
        rating=4.8,
        reviews_count=312,
        image_url="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
        tagline="Immersive 4K HDR entertainment with Google TV and Dolby Atmos Audio.",
        description="Sony Bravia 43-inch 4K Ultra HD Smart Google TV featuring X1 4K Processor, Motionflow XR 100, Dolby Audio, and hands-free voice search. Ideal for premium corporate conference rooms and retail storefront displays.",
        features=[
            "4K Ultra HD LED (3840 x 2160) with Triluminos Pro display",
            "X1 4K HDR Processor for lifelike color and crisp 4K upscaling",
            "Google TV with Google Assistant voice control & Chromecast built-in",
            "20W Clear Phase speakers with Dolby Atmos support",
            "Apple AirPlay 2 and HomeKit certified"
        ],
        specs=[
            ProductSpecDTO(key="Display", value="43\" 4K Ultra HD LED (3840 x 2160)"),
            ProductSpecDTO(key="OS & Smart Platform", value="Google TV (Android TV 12)"),
            ProductSpecDTO(key="Refresh Rate", value="60Hz / Motionflow XR 100"),
            ProductSpecDTO(key="Audio Output", value="20W Dolby Atmos / Clear Phase"),
            ProductSpecDTO(key="Connectivity", value="Wi-Fi 5, Bluetooth 5.0, 3 HDMI, 2 USB"),
            ProductSpecDTO(key="Warranty", value="2 Years Comprehensive Brand Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Stunning 4.8★ rating with 310+ verified enterprise reviews",
            "Dolby Atmos audio and Google TV OS with hands-free microphone",
            "Exceptional 4K upscaling with X1 processor",
            "Fits comfortably under ₹40,000 budget cap (₹37,999)"
        ],
        cons=[
            "60Hz panel refresh rate (standard for productivity and video, not 120Hz gaming)"
        ],
        stock_status="In Stock (35 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=99.2,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0,
        review_sentiment_score=0.95,
        popularity_score=0.92
    ),
    ProductDTO(
        id="prod_tv_samsung_crystal",
        name="Samsung 43-inch Crystal 4K Vivid Pro Ultra HD Smart TV",
        brand="Samsung",
        category="Smart TVs & Displays",
        price=32990.00,
        original_price=39990.00,
        currency="INR",
        rating=4.6,
        reviews_count=248,
        image_url="https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
        tagline="Billion true colors with Crystal Processor 4K and Knox Security.",
        description="Samsung 43-inch Crystal 4K Vivid Pro TV delivers PurColor, OTS Lite 3D surround sound, and integrated Knox Security for secure digital signage or living space viewing.",
        features=[
            "Crystal Processor 4K for dynamic color expression",
            "PurColor vivid color technology with HDR 10+",
            "Object Tracking Sound Lite (OTS Lite) 3D audio",
            "SolarCell Remote control made with recycled plastics",
            "Samsung Knox Security multi-layered data protection"
        ],
        specs=[
            ProductSpecDTO(key="Display", value="43\" Crystal 4K UHD (3840 x 2160)"),
            ProductSpecDTO(key="OS & Smart Platform", value="Tizen Smart TV OS"),
            ProductSpecDTO(key="Audio Output", value="20W OTS Lite / Adaptive Sound"),
            ProductSpecDTO(key="Connectivity", value="Wi-Fi, Bluetooth 5.2, 3 HDMI, 1 USB"),
            ProductSpecDTO(key="Warranty", value="1 Year Comprehensive + 1 Year Additional on Panel"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Economical 4K price at ₹32,990",
            "Solar powered eco remote control",
            "Crisp brightness and HDR10+ support"
        ],
        cons=[
            "Slightly lower rating (4.6★) compared to Sony Bravia (4.8★)"
        ],
        stock_status="In Stock (40 units available)",
        delivery_eta="Tomorrow by 5:00 PM via Delhivery Express",
        merchant_trust_score=98.5,
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0,
        review_sentiment_score=0.91,
        popularity_score=0.89
    ),
    ProductDTO(
        id="prod_tv_lg_nanocell",
        name="LG 43-inch 4K NanoCell AI Smart WebOS TV",
        brand="LG",
        category="Smart TVs & Displays",
        price=41990.00,
        original_price=48990.00,
        currency="INR",
        rating=4.4,
        reviews_count=182,
        image_url="https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop&q=80",
        tagline="Pure colors in Real 4K with α5 AI Processor Gen6 and Magic Remote.",
        description="LG NanoCell 43-inch 4K TV filters out impure hues for ultra-crisp visuals with AI Acoustic Tuning and Game Optimizer.",
        features=[
            "Real 4K NanoCell nano-particle filtration technology",
            "α5 Gen6 AI Processor 4K with 4K upscaling",
            "ThinQ AI with Magic Remote & voice search",
            "Filmmaker Mode & Active HDR support"
        ],
        specs=[
            ProductSpecDTO(key="Display", value="43\" Real 4K NanoCell"),
            ProductSpecDTO(key="OS & Smart Platform", value="webOS 23"),
            ProductSpecDTO(key="Audio Output", value="20W AI Sound Pro"),
            ProductSpecDTO(key="Connectivity", value="Wi-Fi, Bluetooth 5.0, 3 HDMI, 2 USB"),
            ProductSpecDTO(key="Warranty", value="1 Year Standard Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        pros=[
            "Vibrant color purity with NanoCell filter",
            "Intuitive Magic Remote pointer"
        ],
        cons=[
            "Priced above ₹40,000 budget cap (₹41,990)",
            "Rating is 4.4★ (below 4.5+ requirement)"
        ],
        stock_status="In Stock (25 units available)",
        delivery_eta="2-3 business days via Bluedart",
        merchant_trust_score=97.8,
        in_stock=True,
        delivery_time="2-3 business days",
        gst_rate_pct=18.0,
        review_sentiment_score=0.87,
        popularity_score=0.84
    )
]

SAVED_ADDRESSES = [
    {
        "id": "addr_blr_hq",
        "label": "Acme Direct Corp - HQ (Default)",
        "recipient_name": "Finance & Logistics Team",
        "address_line": "Level 4, Prestige Tech Park, Outer Ring Road, Marathahalli",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560103",
        "phone": "+91 98765 43210",
        "is_default": True
    },
    {
        "id": "addr_mum_hub",
        "label": "Mumbai Central Operations Hub",
        "recipient_name": "Store Operations Desk",
        "address_line": "Unit 204, Nesco IT Park, Western Express Highway, Goregaon East",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400063",
        "phone": "+91 98765 43211",
        "is_default": False
    },
    {
        "id": "addr_del_branch",
        "label": "Delhi NCR Branch Office",
        "recipient_name": "Branch Inventory Manager",
        "address_line": "Tower B, Cyber City, DLF Phase 2",
        "city": "Gurugram",
        "state": "Haryana",
        "pincode": "122002",
        "phone": "+91 98765 43212",
        "is_default": False
    }
]

class CommerceService:
    def __init__(self):
        self.products = SAMPLE_PRODUCTS
        self.saved_addresses = SAVED_ADDRESSES

    def get_all_products(self, query: Optional[str] = None, category: Optional[str] = None) -> List[ProductDTO]:
        results = self.products
        if category and category.lower() != "all":
            results = [p for p in results if p.category.lower() == category.lower()]
        if query:
            q = query.lower()
            results = [
                p for p in results 
                if q in p.name.lower() or q in p.tagline.lower() or q in p.description.lower() or q in p.brand.lower() or any(q in f.lower() for f in p.features)
            ]
        return results

    def get_product_by_id(self, product_id: str) -> Optional[ProductDTO]:
        for p in self.products:
            if p.id.lower() == product_id.lower():
                try:
                    from app.services.review_intelligence_service import review_intelligence_service
                    p.review_intelligence = review_intelligence_service.analyze_reviews(p.id)
                except Exception:
                    pass
                return p
        return None


    def calculate_cart_totals(self, cart: CartDTO) -> CartDTO:
        subtotal = 0.0
        total_volume_discount = 0.0

        for item in cart.items:
            prod = self.get_product_by_id(item.product_id)
            if prod:
                pricing = apply_volume_pricing(prod, item.quantity)
                item.tier_used = pricing.get("tier_used")
                item.discount_amount = pricing.get("discount_amount", 0.0)
                item.effective_price = pricing.get("effective_price", item.price)
                line_subtotal = pricing.get("effective_subtotal", round(item.price * item.quantity, 2))
                total_volume_discount += item.discount_amount
            else:
                item.tier_used = None
                item.discount_amount = 0.0
                item.effective_price = item.price
                line_subtotal = round(item.price * item.quantity, 2)
            subtotal += line_subtotal

        subtotal = round(subtotal, 2)
        # GST embedded in items (already included in customer price)
        tax_gst = round(subtotal - (subtotal / 1.18), 2) if subtotal > 0 else 0.0
        shipping = 0.0 # Express Free Delivery
        
        coupon_discount = 0.0
        if cart.coupon_applied:
            code = cart.coupon_applied.strip().upper()
            if code in ["RAZOR2026", "RECON10", "FINTECH2026"]:
                coupon_discount = round(subtotal * 0.10, 2)
            elif code in ["WELCOME20"]:
                coupon_discount = round(subtotal * 0.20, 2)

        total_discount = round(total_volume_discount + coupon_discount, 2)
        total = max(0.0, round(subtotal + shipping - coupon_discount, 2))
        
        cart.subtotal = subtotal
        cart.tax_gst = tax_gst
        cart.shipping = shipping
        cart.discount = total_discount
        cart.total = total
        return cart

    # =========================================================================
    # MULTI-FACTOR RANKING ENGINE (Powered by AISearchService)
    # =========================================================================
    def rank_products(self, query: Optional[str] = None, budget_cap: Optional[float] = None) -> List[ProductDTO]:
        if not self.products:
            self.products = SAMPLE_PRODUCTS

        q = (query or "").strip()
        if budget_cap and "under" not in q.lower() and "below" not in q.lower():
            q = f"{q} under ₹{budget_cap:,.0f}".strip()

        advisor_res = ai_search_service.recommend(query=q, products=self.products or SAMPLE_PRODUCTS, limit=3)
        return advisor_res.recommended_products


    # =========================================================================
    # SIDE-BY-SIDE COMPARISON TABLE GENERATOR (Step 4 of Advisor Workflow)
    # =========================================================================
    def build_comparison_table(self, top_products: List[ProductDTO]) -> ComparisonDataDTO:
        if not top_products or len(top_products) < 2:
            top_products = (self.products or SAMPLE_PRODUCTS)[:3]

        attributes: List[ComparisonAttributeDTO] = []

        # 1. Price
        attributes.append(ComparisonAttributeDTO(
            attribute="Final Price (GST Included)",
            values={p.name: f"₹{p.price:,.0f}" for p in top_products}
        ))

        # 2. Customer Rating
        attributes.append(ComparisonAttributeDTO(
            attribute="Customer Rating",
            values={p.name: f"{p.rating} ★ ({p.reviews_count} reviews)" for p in top_products}
        ))

        # 3. Battery / Power Endurance
        battery_map = {}
        for p in top_products:
            bat_spec = next((s.value for s in p.specs if "battery" in s.key.lower() or "power" in s.key.lower()), None)
            battery_map[p.name] = bat_spec or (p.features[3] if len(p.features) > 3 else "Standard Power")
        attributes.append(ComparisonAttributeDTO(attribute="Battery / Power Life", values=battery_map))

        # 4. Key Spec / Storage / Capacity
        spec_map = {}
        for p in top_products:
            core_spec = next((s.value for s in p.specs if any(k in s.key.lower() for k in ["processor", "print speed", "resolution", "audio output", "os"])), None)
            spec_map[p.name] = core_spec or (p.specs[0].value if p.specs else "Enterprise Grade")
        attributes.append(ComparisonAttributeDTO(attribute="Core Performance / Specs", values=spec_map))

        # 5. Warranty & Replacement
        warranty_map = {}
        for p in top_products:
            w_spec = next((s.value for s in p.specs if "warranty" in s.key.lower()), "1 Year Standard")
            warranty_map[p.name] = w_spec
        attributes.append(ComparisonAttributeDTO(attribute="Warranty Coverage", values=warranty_map))

        # 6. Delivery SLA
        attributes.append(ComparisonAttributeDTO(
            attribute="Delivery Speed",
            values={p.name: p.delivery_eta or "1-2 Days via Delhivery" for p in top_products}
        ))

        verdict = f"Comparing {', '.join(p.name for p in top_products)}: Option #1 ({top_products[0].name}) is the highest rated and provides the best balance of commercial features, warranty, and pricing."

        return ComparisonDataDTO(
            product_ids=[p.id for p in top_products],
            products=top_products,
            attributes=attributes,
            verdict=verdict
        )

    def compare_products(self, product_ids: List[str]) -> ComparisonDataDTO:
        selected = [p for p in self.products if p.id in product_ids]
        if not selected:
            selected = self.products[:3]
        return self.build_comparison_table(selected)

    # =========================================================================
    # AI RECOMMENDATION REASONING ("WHY" ENGINE) (Step 5 of Advisor Workflow)
    # =========================================================================
    def generate_ai_why_reasoning(self, lead_product: ProductDTO, budget_cap: Optional[float] = None) -> Dict[str, Any]:
        why_bullets = []

        # Bullet 1: Rating & Trust
        why_bullets.append(f"Highest Customer Satisfaction: Rated {lead_product.rating} ★ with {lead_product.reviews_count} verified commercial reviews.")

        # Bullet 2: Standout Hardware Feature / Pros
        if lead_product.pros:
            why_bullets.append(f"Key Advantage: {lead_product.pros[0]}")
            if len(lead_product.pros) > 1:
                why_bullets.append(f"Performance: {lead_product.pros[1]}")
        else:
            why_bullets.append(f"Performance: {lead_product.features[0] if lead_product.features else 'Enterprise grade hardware'}")

        # Bullet 3: Budget Match
        if budget_cap and lead_product.price <= budget_cap:
            savings = budget_cap - lead_product.price
            why_bullets.append(f"Budget Fit: Priced at ₹{lead_product.price:,.2f} (saves ₹{savings:,.2f} under your ₹{budget_cap:,.0f} limit).")
        else:
            why_bullets.append(f"Transparent Pricing: ₹{lead_product.price:,.2f} inclusive of 18% GST (ITC Eligible) with zero hidden fees.")

        # Bullet 4: Delivery
        why_bullets.append(f"Fast Fulfillment: {lead_product.delivery_eta or 'Next-day priority delivery'}.")

        return {
            "recommended_product_id": lead_product.id,
            "product_name": lead_product.name,
            "headline": f"Why I recommend the {lead_product.name}:",
            "why_bullets": why_bullets
        }

    # =========================================================================
    # 10-STEP CONVERSATIONAL ADVISOR STATE MACHINE
    # =========================================================================
    def process_chat_query(
        self, 
        query: str, 
        history: List[Any] = [], 
        cart: Optional[CartDTO] = None,
        action: Optional[str] = None,
        selected_product_id: Optional[str] = None,
        selected_address: Optional[Dict[str, Any]] = None,
        quantity: Optional[int] = 1,
        user_id: Optional[str] = None
    ) -> CommerceChatResponseDTO:
        from app.services.ai_autopay_service import ai_autopay_service

        q = query.strip().lower()
        active_cart = cart or CartDTO()
        active_cart = self.calculate_cart_totals(active_cart)

        # Resolve customer addresses with zero demo leak for real registered customers
        active_saved_addresses = self.saved_addresses
        if user_id and user_id != "usr_customer_demo":
            try:
                from app.services.customer_order_service import customer_order_service
                db_addrs = customer_order_service.get_addresses(user_id=user_id)
                active_saved_addresses = [
                    {
                        "id": a.get("id"),
                        "label": a.get("full_name") or "Saved Address",
                        "recipient_name": a.get("full_name") or "Customer",
                        "address_line": f"{a.get('address_line1', '')} {a.get('address_line2', '')}".strip(),
                        "city": a.get("city", "Bengaluru"),
                        "state": a.get("state", "Karnataka"),
                        "pincode": a.get("pincode", "560001"),
                        "phone": a.get("phone", "+91 98765 43210"),
                        "is_default": bool(a.get("is_default", 0))
                    } for a in db_addrs
                ]
            except Exception:
                active_saved_addresses = []

        # Get customer AutoPay rules
        effective_autopay_uid = user_id or "usr_customer_guest"
        autopay_settings = ai_autopay_service.get_settings(user_id=effective_autopay_uid)
        single_limit = float(autopay_settings.get("max_single_purchase_limit") or 0.0)
        monthly_budget = float(autopay_settings.get("monthly_budget") or 0.0)
        spent_month = float(autopay_settings.get("spent_this_month") or 0.0)
        remaining_budget = max(0.0, monthly_budget - spent_month) if monthly_budget > 0 else 0.0
        autopay_enabled = bool(autopay_settings.get("autopay_enabled", False))
        payment_method_name = autopay_settings.get("connected_payment_method") or "No Linked Payment Mandate"


        autopay_guardrail_info = {
            "autopay_enabled": autopay_enabled,
            "monthly_budget": monthly_budget,
            "spent_this_month": spent_month,
            "remaining_budget": remaining_budget,
            "single_limit": single_limit,
            "payment_method": payment_method_name,
            "autopay_status": "ACTIVE" if autopay_enabled else "PAUSED"
        }

        # ---------------------------------------------------------------------
        # STEP 10: PURCHASE EXECUTION (Confirm & Execute AutoPay)
        # ---------------------------------------------------------------------
        if action == "confirm_autopay_purchase" or any(w in q for w in ["confirm purchase", "confirm autopay", "buy with autopay now", "execute order"]):
            target_prod = self.get_product_by_id(selected_product_id or "") or self.products[0]
            chosen_addr = selected_address or (active_saved_addresses[0] if active_saved_addresses else self.saved_addresses[0])
            order_qty = max(1, quantity or 1)
            total_price = float(target_prod.price * order_qty)

            # Validate guardrails
            is_valid_limit = total_price <= single_limit
            is_valid_budget = (spent_month + total_price) <= monthly_budget

            if autopay_enabled and is_valid_limit and is_valid_budget:
                buy_res = ai_autopay_service.direct_one_click_buy(
                    product_id=target_prod.id,
                    quantity=order_qty,
                    user_id="usr_customer_demo",
                    custom_reason=f"Conversational Advisor Purchase of {target_prod.name}",
                    product_name=target_prod.name,
                    unit_price=target_prod.price,
                    category=target_prod.category,
                    is_autonomous_agent=True
                )
                order_id = buy_res.get("order_id", f"ord_{uuid.uuid4().hex[:10]}")
                order_conf = buy_res.get("confirmation", {})
                tracking_id = f"DELHIVERY-{uuid.uuid4().hex[:8].upper()}"

                message = (
                    f"🎉 **Order #{order_id} Placed Successfully via AutoPay!**\n\n"
                    f"• **Product**: {target_prod.name} × {order_qty}\n"
                    f"• **Delivery Address**: {chosen_addr.get('address_line')}, {chosen_addr.get('city')}, {chosen_addr.get('state')} - {chosen_addr.get('pincode')}\n"
                    f"• **Payment Method**: {payment_method_name}\n"
                    f"• **Total Charged**: **₹{total_price:,.2f}** (Inclusive of 18% GST)\n"
                    f"• **Carrier**: Delhivery Express | **Tracking ID**: `{tracking_id}`\n"
                    f"• **Estimated Delivery**: {target_prod.delivery_eta or 'Tomorrow by 5:00 PM'}\n\n"
                    f"Your tax invoice and shipping dossier have been generated and archived in your account."
                )

                return CommerceChatResponseDTO(
                    message=message,
                    flow_step="AUTONOMOUS_PURCHASE",
                    action_triggered="AUTONOMOUS_PURCHASE",
                    selected_product=target_prod,
                    selected_address=chosen_addr,
                    autonomous_order=order_conf,
                    autopay_guardrail_info=autopay_guardrail_info,
                    suggested_prompts=[
                        f"Track order #{order_id}",
                        "View AutoPay Purchase History",
                        "View spending budget balance",
                        "Ask shopping advice for accessories"
                    ]
                )
            else:
                message = (
                    f"⚠️ **AutoPay Purchase Limit Check:**\n\n"
                    f"• **Product Price**: ₹{total_price:,.2f}\n"
                    f"• **Single Transaction Cap**: ₹{single_limit:,.2f}\n"
                    f"• **Monthly Budget Balance**: ₹{remaining_budget:,.2f}\n\n"
                    f"This purchase exceeds your configured AutoPay limits. Would you like to authorize this manually or complete checkout?"
                )
                return CommerceChatResponseDTO(
                    message=message,
                    flow_step="APPROVAL_REQUIRED",
                    requires_approval=True,
                    action_triggered="APPROVAL_REQUIRED",
                    selected_product=target_prod,
                    selected_address=chosen_addr,
                    autopay_guardrail_info=autopay_guardrail_info,
                    suggested_prompts=[
                        f"Approve purchase of {target_prod.name}",
                        "Increase my AutoPay limits",
                        "Return to product comparison"
                    ]
                )

        # ---------------------------------------------------------------------
        # STEP 8 & 9: ADDRESS SELECTED ➔ ORDER SUMMARY & AUTOPAY VALIDATION
        # ---------------------------------------------------------------------
        if action == "select_address" or any(w in q for w in ["ship to", "use address", "deliver to", "confirm address"]):
            target_prod = self.get_product_by_id(selected_product_id or "") or self.products[0]
            chosen_addr = selected_address or (active_saved_addresses[0] if active_saved_addresses else self.saved_addresses[0])
            order_qty = max(1, quantity or 1)

            unit_price = target_prod.price
            subtotal = unit_price * order_qty
            gst_amount = round(subtotal - (subtotal / 1.18), 2)
            base_price = round(subtotal - gst_amount, 2)
            delivery_fee = 0.0 # FREE
            total_amount = subtotal

            order_summary = {
                "product_id": target_prod.id,
                "product_name": target_prod.name,
                "product_image": target_prod.image_url,
                "quantity": order_qty,
                "unit_price": unit_price,
                "base_price": base_price,
                "gst_amount": gst_amount,
                "delivery_fee": delivery_fee,
                "total_amount": total_amount,
                "currency": "INR"
            }

            message = (
                f"📋 **Order Summary & AutoPay Verification**\n\n"
                f"• **Item**: {target_prod.name} (Qty: {order_qty})\n"
                f"• **Subtotal**: ₹{subtotal:,.2f} (Includes ₹{gst_amount:,.2f} GST)\n"
                f"• **Delivery**: FREE Priority Delivery\n"
                f"• **Total Payable**: ₹{total_amount:,.2f}\n"
                f"• **Ship to**: {chosen_addr.get('label', 'Default Location')} ({chosen_addr.get('city')}, {chosen_addr.get('pincode')})\n"
                f"• **AutoPay**: {payment_method_name}\n\n"
                f"Ready to proceed? Say **'Confirm Purchase'** or click below to finalize your order autonomously."
            )

            return CommerceChatResponseDTO(
                message=message,
                flow_step="ORDER_CONFIRMATION",
                action_triggered="ORDER_CONFIRMATION",
                selected_product=target_prod,
                selected_address=chosen_addr,
                order_summary=order_summary,
                saved_addresses=active_saved_addresses,
                autopay_guardrail_info=autopay_guardrail_info,
                suggested_prompts=[
                    "Confirm Purchase with AutoPay",
                    "Change shipping address",
                    "Cancel and choose another product"
                ]
            )

        # ---------------------------------------------------------------------
        # STEP 7: SPECIFIC PRODUCT SELECTED ➔ SHOW SAVED ADDRESSES & AUTOPAY SUMMARY
        # ---------------------------------------------------------------------
        if action == "select_product" or (selected_product_id and not action):
            target_prod = self.get_product_by_id(selected_product_id or "") or self.products[0]

            message = (
                f"🎯 **Great choice! You selected {target_prod.name}.**\n\n"
                f"• **Unit Price**: ₹{target_prod.price:,.2f} (Inclusive of 18% GST)\n"
                f"• **Estimated Delivery**: {target_prod.delivery_eta or 'Tomorrow by 5:00 PM'}\n\n"
                f"Where would you like us to ship this order? Select a saved delivery address below or add a new location:"
            )

            if active_saved_addresses:
                address_prompts = [f"Ship to {a['label']}" for a in active_saved_addresses[:3]] + ["Change product selection"]
            else:
                address_prompts = ["Add new delivery address", "Change product selection"]

            return CommerceChatResponseDTO(
                message=message,
                flow_step="ADDRESS_SELECTION",
                action_triggered="ADDRESS_SELECTION",
                selected_product=target_prod,
                saved_addresses=active_saved_addresses,
                autopay_guardrail_info=autopay_guardrail_info,
                suggested_prompts=address_prompts
            )

        # ---------------------------------------------------------------------
        # STEP 1 to 5: INTENT UNDERSTANDING ➔ MULTI-FACTOR RANKING ➔ TOP 3 COMPARISON & "WHY"
        # ---------------------------------------------------------------------
        advisor_res = ai_search_service.recommend(query=query or "", products=self.products or SAMPLE_PRODUCTS, limit=3)
        top_3 = advisor_res.recommended_products
        if not top_3:
            top_3 = (self.products or SAMPLE_PRODUCTS)[:3]
        lead_product = top_3[0]

        # Extract budget cap if present from parsed intent
        detected_budget = advisor_res.parsed_intent.budget if advisor_res.parsed_intent else None

        # Build side-by-side comparison matrix
        comparison_table = self.build_comparison_table(top_3)

        # Build structured AI reasoning ("WHY" engine)
        ai_reason = self.generate_ai_why_reasoning(lead_product, detected_budget)
        if lead_product.why_recommended:
            ai_reason["explanation"] = lead_product.why_recommended

        # Integrate AI Review Intelligence for top recommendations
        lead_intel = None
        try:
            from app.services.review_intelligence_service import review_intelligence_service
            lead_intel = review_intelligence_service.analyze_reviews(lead_product.id)
            lead_product.review_intelligence = lead_intel
            for prod in top_3:
                if not prod.review_intelligence:
                    prod.review_intelligence = review_intelligence_service.analyze_reviews(prod.id)
        except Exception:
            lead_intel = None

        # Generate shopping advisor message
        why_str = "\n".join([f"• {bullet}" for bullet in ai_reason["why_bullets"]])
        if lead_product.why_recommended:
            why_str = f"• **AI Advisor Verdict**: {lead_product.why_recommended}\n" + why_str

        # Check if customer specifically asked about reviews, pros & cons, or returns
        is_review_intent = any(w in q for w in [
            "pros and cons", "pro and con", "pros & cons", "review", "reviews",
            "sentiment", "satisfaction", "return", "dislike", "opinions",
            "what do customers think", "feedback", "rating", "tradeoff", "trade-off"
        ])

        # Check if customer specifically asked about EMI / installments
        is_emi_intent = any(w in q for w in ["emi", "installment", "installments", "pay in parts", "no cost emi", "monthly plan"])
        emi_block = ""
        if is_emi_intent or lead_product.price >= 10000:
            try:
                from app.services.emi_service import emi_service
                emi_res = emi_service.recommend_best_emi(lead_product.price)
                rec = emi_res.recommended_plan
                emi_block = (
                    f"\n\n💳 **AI Recommended EMI Plan for {lead_product.name}**:\n"
                    f"• **Best Option**: **{rec.tenure} Months {rec.emi_type.replace('_', ' ').title()}** at **₹{rec.emi_amount:,.2f}/month**\n"
                    f"• Interest Rate: **{rec.interest_rate}%** (Total Interest: ₹{rec.total_interest:,.2f})\n"
                    f"• Monthly Budget Impact: **Only {rec.monthly_burden_pct}%** of your disposable monthly cashflow\n"
                    f"• Available Tenures: 3, 6, 9, 12, 18, 24 Months (No Cost EMI available on 3 & 6 Months)"
                )
            except Exception:
                pass

        confidence_pct = int(advisor_res.confidence_score * 100) if advisor_res.confidence_score else 95

        review_intelligence_block = ""
        if lead_intel:
            pros_formatted = "\n".join([f"  {p}" for p in lead_intel.pros])
            cons_formatted = "\n".join([f"  {c}" for c in lead_intel.cons])
            review_intelligence_block = (
                f"\n\n### 🛡️ **AI Review Intelligence & Pre-Purchase Analysis**\n"
                f"• **Overall Satisfaction**: **{int(lead_intel.satisfaction_score)}%** ({lead_intel.customer_sentiment})\n"
                f"• **Verified Recommendation Rate**: **{int(lead_intel.recommendation_score)}%**\n"
                f"• **Pros**:\n{pros_formatted}\n"
                f"• **Cons**:\n{cons_formatted}\n"
                f"⚠️ **Before Checkout Notice**: *\"{lead_intel.before_checkout_summary}\"*"
            )

        if is_emi_intent:
            message = (
                f"💳 **AI EMI Advisor Analysis for {lead_product.name}**\n\n"
                f"For a total price of **₹{lead_product.price:,.2f}**, here is your optimized financing recommendation:"
                f"{emi_block}\n\n"
                f"### 📋 All Available Financing Options:\n"
                f"• **3 Months No Cost EMI**: ₹{round(lead_product.price/3, 2):,.2f}/mo (0% Interest)\n"
                f"• **6 Months No Cost EMI**: ₹{round(lead_product.price/6, 2):,.2f}/mo (0% Interest) ★ **AI Best Pick**\n"
                f"• **9 Months Standard EMI**: ₹{round(lead_product.price/9 * 1.05, 2):,.2f}/mo (14.0% p.a.)\n"
                f"• **12 Months Standard EMI**: ₹{round(lead_product.price/12 * 1.08, 2):,.2f}/mo (14.5% p.a.)\n"
                f"• **18 & 24 Months Bank EMI**: Available via HDFC, ICICI, SBI & Axis Bank Credit Cards\n\n"
                f"Would you like to select this product and proceed with 6 Months No Cost EMI?"
            )
        elif is_review_intent and lead_intel:
            message = (
                f"📊 **AI Review Intelligence Analysis** ({int(lead_intel.satisfaction_score)}% Overall Satisfaction)\n\n"
                f"I analyzed verified enterprise reviews for **{lead_product.name}** to give you an honest pre-purchase breakdown:\n"
                f"{review_intelligence_block}\n\n"
                f"🥇 **#1 Best Match**: **{top_3[0].name}** (₹{top_3[0].price:,.2f})\n"
                f"🥈 **#2 Alternative**: **{top_3[1].name}** (₹{top_3[1].price:,.2f})\n\n"
                f"Would you like to proceed with {lead_product.name} or compare it side-by-side with {top_3[1].name}?"
            )
        else:
            message = (
                f"🤖 **Personal Shopping Advisor Analysis** ({confidence_pct}% Match Confidence)\n\n"
                f"Based on your requirements, I analyzed our enterprise catalog and ranked the **Top 3 Recommendations**:\n\n"
                f"🥇 **#1 Best Match**: **{top_3[0].name}** (₹{top_3[0].price:,.2f}) — {top_3[0].match_score or 96}% Match\n"
                f"🥈 **#2 Alternative**: **{top_3[1].name}** (₹{top_3[1].price:,.2f})\n"
                f"🥉 **#3 Alternative**: **{top_3[2].name}** (₹{top_3[2].price:,.2f})\n\n"
                f"### 💡 Why I Recommend **{lead_product.name}**:\n"
                f"{why_str}"
                f"{review_intelligence_block}"
                f"{emi_block}\n\n"
                f"Review the full specifications, Pros & Cons, and side-by-side comparison below, then click **Select Product** to proceed."
            )


        return CommerceChatResponseDTO(
            message=message,
            flow_step="TOP_RECOMMENDATIONS",
            action_triggered="TOP_RECOMMENDATIONS",
            recommended_products=top_3,
            comparison_data=comparison_table,
            ai_recommendation_reason=ai_reason,
            recommendation_reason=advisor_res.recommendation_reason,
            confidence_score=advisor_res.confidence_score,
            parsed_intent=advisor_res.parsed_intent.model_dump() if advisor_res.parsed_intent else None,
            saved_addresses=active_saved_addresses,
            autopay_guardrail_info=autopay_guardrail_info,
            review_intelligence=lead_intel,
            before_checkout_summary=lead_intel.before_checkout_summary if lead_intel else None,
            suggested_prompts=[
                f"Select {top_3[0].name}",
                f"What are the pros and cons of {top_3[0].name}?",
                f"Select {top_3[1].name}",
                "Filter by another category"
            ]
        )


    def generate_checkout_link(self, cart: CartDTO) -> CheckoutResponseDTO:
        calculated_cart = self.calculate_cart_totals(cart)
        from app.services.payment_service import payment_service
        from app.schemas.payments import CreateOrderRequestDTO, OrderItemDTO

        order_items = [
            OrderItemDTO(
                product_id=i.product_id,
                name=i.name,
                price=i.price,
                quantity=i.quantity
            )
            for i in calculated_cart.items
        ]

        order_res = payment_service.create_order(CreateOrderRequestDTO(
            amount=calculated_cart.total,
            currency="INR",
            customer_email="finance.ops@acmedirect.com",
            customer_phone="+919876543210",
            items=order_items
        ))

        expires_at = (datetime.datetime.utcnow() + datetime.timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S UTC")

        return CheckoutResponseDTO(
            payment_link_id=order_res.order_id,
            payment_url=order_res.checkout_session_url,
            order_id=order_res.order_id,
            amount=calculated_cart.total,
            currency="INR",
            status="created",
            qr_code_mock=f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={order_res.checkout_session_url}",
            expires_at=expires_at,
            summary_items=calculated_cart.items
        )

    # =========================================================================
    # VOLUME TIER PRICING HELPER METHODS
    # =========================================================================
    def get_applicable_tier(
        self,
        price_tiers: Optional[Union[List[Dict[str, Any]], str]],
        quantity: int
    ) -> Optional[Dict[str, Any]]:
        return get_applicable_tier(price_tiers, quantity)

    def calculate_volume_discount(
        self,
        unit_price: float,
        quantity: int,
        tier: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return calculate_volume_discount(unit_price, quantity, tier)

    def apply_volume_pricing(
        self,
        product: Any,
        quantity: int
    ) -> Dict[str, Any]:
        return apply_volume_pricing(product, quantity)


commerce_service = CommerceService()
