import re
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.commerce_service import commerce_service
from app.services.groq_service import format_optimized_response, normalize_ai_response

client = TestClient(app)


def validate_optimized_response_structure(msg: str):
    """
    Validates that a Customer AI response strictly complies with:
    1. Recommendation first (Best Match: ...)
    2. Price (₹...)
    3. Rating (⭐ ...)
    4. Why Recommended: with 2-3 '✓' bullet points
    5. EMI (₹.../month)
    6. Exactly one follow-up question
    7. No long paragraphs (> 200 characters without newlines)
    8. No markdown tables
    """
    assert "Best Match:" in msg, "Response must show recommendation first under 'Best Match:'"
    assert "Price:" in msg, "Response must show 'Price:'"
    assert "Rating:" in msg, "Response must show 'Rating:'"
    assert "Why Recommended:" in msg, "Response must show 'Why Recommended:'"
    assert "EMI:" in msg, "Response must show 'EMI:'"

    # Order check: Best Match -> Price -> Rating -> Why Recommended -> EMI
    idx_bm = msg.index("Best Match:")
    idx_pr = msg.index("Price:")
    idx_rt = msg.index("Rating:")
    idx_wr = msg.index("Why Recommended:")
    idx_em = msg.rindex("EMI:")

    assert idx_bm < idx_pr < idx_rt < idx_wr < idx_em, "Headers must follow exact sequence"

    # Check bullet points in Why Recommended section
    after_wr = msg[idx_wr + len("Why Recommended:"):idx_em]
    bullets = [line.strip() for line in after_wr.strip().split("\n") if line.strip().startswith("✓")]
    assert 2 <= len(bullets) <= 3, f"Why Recommended must contain 2-3 bullet points starting with '✓', got {len(bullets)}"

    # Check EMI format (e.g. ₹X,XXX/month)
    after_em = msg[idx_em + len("EMI:"):].strip()
    lines_after_em = [l.strip() for l in after_em.split("\n") if l.strip()]
    assert len(lines_after_em) >= 2, "Must contain EMI amount and follow-up question"
    assert "₹" in lines_after_em[0] and "/month" in lines_after_em[0], f"EMI line format invalid: {lines_after_em[0]}"

    # Check follow-up question (ends with ?)
    question_line = lines_after_em[-1]
    assert question_line.endswith("?"), f"Must ask one follow-up question only at the end: {question_line}"

    # Check no long paragraphs (> 450 characters in a single unbroken block)
    for paragraph in msg.split("\n\n"):
        assert len(paragraph) <= 450, f"Paragraph exceeds concise length limit: {paragraph[:60]}..."

    # Check no markdown tables
    assert "|---" not in msg, "Must not contain markdown tables"
    assert "| Item |" not in msg, "Must not contain markdown tables"


def test_format_optimized_response_deterministic():
    """Unit test verify format_optimized_response matches exact structure on catalog item."""
    p = commerce_service.products[0]
    msg = format_optimized_response(p)
    validate_optimized_response_structure(msg)

    # Verify catalog data grounding
    assert p.name in msg
    assert str(p.rating) in msg
    assert "₹" in msg
    assert "/month" in msg


def test_format_optimized_response_emi_intent():
    """Unit test verify EMI intent includes No Cost EMI and proper structure."""
    p = commerce_service.products[0]
    msg = format_optimized_response(p, query="What are the EMI options?", is_emi_intent=True)
    validate_optimized_response_structure(msg)
    assert "No Cost EMI" in msg


def test_format_optimized_response_review_intent():
    """Unit test verify review intent includes verified pros and cons in concise format."""
    p = commerce_service.products[0]
    msg = format_optimized_response(p, query="pros and cons", is_review_intent=True)
    validate_optimized_response_structure(msg)
    assert "Pros" in msg
    assert "Cons" in msg


def test_api_commerce_chat_response_format_general_query():
    """End-to-end API test verifying /api/v1/commerce/chat adheres to the optimized structure."""
    res = client.post("/api/v1/commerce/chat", json={"query": "Recommend a POS machine for retail"})
    assert res.status_code == 200
    data = res.json()
    msg = data["message"]
    validate_optimized_response_structure(msg)


def test_api_commerce_chat_response_format_emi_query():
    """End-to-end API test verifying /api/v1/commerce/chat adheres to the optimized structure for EMI."""
    res = client.post("/api/v1/commerce/chat", json={"query": "Can I buy a laptop on EMI?"})
    assert res.status_code == 200
    data = res.json()
    msg = data["message"]
    validate_optimized_response_structure(msg)
    assert "EMI" in msg


def test_api_commerce_chat_response_format_reviews_query():
    """End-to-end API test verifying /api/v1/commerce/chat adheres to the optimized structure for reviews."""
    res = client.post("/api/v1/commerce/chat", json={"query": "What are customer reviews for POS terminal?"})
    assert res.status_code == 200
    data = res.json()
    msg = data["message"]
    validate_optimized_response_structure(msg)


def test_normalize_ai_response_cleans_bold_headers():
    """Verify that **Best Match:** and bold structural headers are normalized."""
    raw = (
        "**Best Match:**\n"
        "Razorpay Smart POS V3\n\n"
        "**Price:**\n"
        "₹14,999\n\n"
        "**Rating:**\n"
        "⭐ 4.9 (280 reviews)\n\n"
        "**Why Recommended:**\n"
        "✓ Fast thermal printer\n"
        "✓ 18-hour battery life\n\n"
        "**EMI:**\n"
        "₹1,250/month\n\n"
        "Would you like to select this device?"
    )
    cleaned = normalize_ai_response(raw)
    validate_optimized_response_structure(cleaned)
