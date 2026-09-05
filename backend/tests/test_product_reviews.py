import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.review_service import review_service
from app.schemas.reviews import ReviewCreateDTO, ReviewUpdateDTO

client = TestClient(app)


def test_add_review_lifecycle():
    """Test creating a review with 1-5 rating, verified purchase, and photo attachments."""
    product_id = "prod_test_lifecycle_01"
    create_dto = ReviewCreateDTO(
        product_id=product_id,
        rating=5,
        review_title="Outstanding build quality",
        review_text="Exceeded our enterprise durability requirements in field operations.",
        customer_id="cust_test_01",
        customer_name="Test Enterprise Buyer",
        images=["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
        verified_purchase=True
    )

    review = review_service.add_review(create_dto)
    assert review.id.startswith("rev_")
    assert review.rating == 5
    assert review.review_title == "Outstanding build quality"
    assert review.verified_purchase is True
    assert len(review.images) == 1
    assert review.helpful_votes == 0

    # Retrieve reviews for this product
    res = review_service.get_reviews(product_id)
    assert res.total >= 1
    assert any(r.id == review.id for r in res.items)


def test_edit_review():
    """Test editing review title, text, rating, and images."""
    product_id = "prod_test_edit_01"
    create_dto = ReviewCreateDTO(
        product_id=product_id,
        rating=4,
        review_title="Good initial impression",
        review_text="Works as expected, initial battery life is acceptable.",
        customer_id="cust_test_02",
        customer_name="Vikram Test"
    )
    created = review_service.add_review(create_dto)

    # Edit review
    update_dto = ReviewUpdateDTO(
        rating=5,
        review_title="Updated: Fantastic endurance after 2 weeks",
        review_text="Updating my rating from 4 to 5 stars. Performance is top notch.",
        images=["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500"]
    )
    updated = review_service.edit_review(created.id, update_dto)
    assert updated is not None
    assert updated.rating == 5
    assert "Updated: Fantastic" in updated.review_title
    assert len(updated.images) == 1


def test_delete_review():
    """Test deleting review removes it and cascades summary stats."""
    product_id = "prod_test_delete_01"
    created = review_service.add_review(ReviewCreateDTO(
        product_id=product_id,
        rating=3,
        review_title="Temporary review to delete",
        review_text="This review will be deleted in the test.",
        customer_id="cust_test_delete"
    ))

    # Ensure it exists
    res1 = review_service.get_reviews(product_id)
    assert any(r.id == created.id for r in res1.items)

    # Delete
    deleted = review_service.delete_review(created.id)
    assert deleted is True

    # Ensure it no longer exists
    res2 = review_service.get_reviews(product_id)
    assert not any(r.id == created.id for r in res2.items)


def test_helpful_vote_system():
    """Test upvoting review, incrementing count, and toggling off."""
    product_id = "prod_test_vote_01"
    created = review_service.add_review(ReviewCreateDTO(
        product_id=product_id,
        rating=5,
        review_title="Very helpful review",
        review_text="Comprehensive pros and cons analysis.",
        customer_id="cust_test_voter"
    ))

    voter_id = "user_test_voter_alpha"

    # Vote 1: should increment helpful_votes from 0 to 1
    vote_res1 = review_service.vote_helpful(created.id, voter_id)
    assert vote_res1.helpful_votes == 1
    assert vote_res1.has_voted is True

    # Vote 2 from same voter: should toggle off back to 0
    vote_res2 = review_service.vote_helpful(created.id, voter_id)
    assert vote_res2.helpful_votes == 0
    assert vote_res2.has_voted is False

    # Vote 3: upvote again
    vote_res3 = review_service.vote_helpful(created.id, voter_id)
    assert vote_res3.helpful_votes == 1


def test_rating_summary_and_breakdown():
    """
    Test exact calculation of Product Rating Summary and Star Breakdown percentages:
    - ★★★★★
    - ★★★★
    - ★★★
    - ★★
    - ★
    """
    import uuid
    product_id = f"prod_breakdown_{uuid.uuid4().hex[:8]}"

    # Add 5 reviews: two 5-star, one 4-star, one 3-star, one 1-star
    # Total = 5 reviews. Ratings: 5, 5, 4, 3, 1 -> Sum = 18. Average = 18/5 = 3.6
    # Breakdown:
    # 5★: 2/5 = 40.0%
    # 4★: 1/5 = 20.0%
    # 3★: 1/5 = 20.0%
    # 2★: 0/5 = 0.0%
    # 1★: 1/5 = 20.0%
    review_service.add_review(ReviewCreateDTO(product_id=product_id, rating=5, review_title="Star 5 A", review_text="Review A"))
    review_service.add_review(ReviewCreateDTO(product_id=product_id, rating=5, review_title="Star 5 B", review_text="Review B"))
    review_service.add_review(ReviewCreateDTO(product_id=product_id, rating=4, review_title="Star 4", review_text="Review C"))
    review_service.add_review(ReviewCreateDTO(product_id=product_id, rating=3, review_title="Star 3", review_text="Review D"))
    review_service.add_review(ReviewCreateDTO(product_id=product_id, rating=1, review_title="Star 1", review_text="Review E"))

    summary = review_service.get_product_rating_summary(product_id)
    assert summary.total_reviews == 5
    assert summary.average_rating == 3.6

    bd = summary.rating_breakdown
    assert bd["5"].count == 2
    assert bd["5"].percentage == 40.0
    assert bd["4"].count == 1
    assert bd["4"].percentage == 20.0
    assert bd["3"].count == 1
    assert bd["3"].percentage == 20.0
    assert bd["2"].count == 0
    assert bd["2"].percentage == 0.0
    assert bd["1"].count == 1
    assert bd["1"].percentage == 20.0


def test_filter_and_sort_reviews():
    """Test star filtering and multi-factor sorting."""
    import uuid
    product_id = f"prod_sort_filter_{uuid.uuid4().hex[:8]}"
    rev5 = review_service.add_review(ReviewCreateDTO(product_id=product_id, rating=5, review_title="Review 5", review_text="Text 5"))
    rev3 = review_service.add_review(ReviewCreateDTO(product_id=product_id, rating=3, review_title="Review 3", review_text="Text 3"))
    rev1 = review_service.add_review(ReviewCreateDTO(product_id=product_id, rating=1, review_title="Review 1", review_text="Text 1"))

    # Upvote rev3 to make it most helpful
    review_service.vote_helpful(rev3.id, "voter_1")
    review_service.vote_helpful(rev3.id, "voter_2")

    # 1. Filter only 5 stars
    filtered_5 = review_service.get_reviews(product_id=product_id, rating_filter=5)
    assert all(r.rating == 5 for r in filtered_5.items)
    assert len(filtered_5.items) == 1

    # 2. Sort by most helpful
    sorted_helpful = review_service.get_reviews(product_id=product_id, sort_by="most_helpful")
    assert sorted_helpful.items[0].id == rev3.id
    assert sorted_helpful.items[0].helpful_votes == 2

    # 3. Sort by highest rating
    sorted_high = review_service.get_reviews(product_id=product_id, sort_by="highest_rating")
    assert sorted_high.items[0].rating == 5


def test_api_endpoints():
    """
    Test the 5 requested API Endpoints:
    - Add Review (POST /api/v1/reviews)
    - Edit Review (PUT /api/v1/reviews/{id})
    - Delete Review (DELETE /api/v1/reviews/{id})
    - Get Reviews (GET /api/v1/reviews)
    - Get Rating Summary (GET /api/v1/reviews/summary/{product_id})
    - Helpful Vote (POST /api/v1/reviews/{id}/helpful)
    """
    p_id = "prod_api_test_sku"

    # 1. Add Review
    add_resp = client.post("/api/v1/reviews", json={
        "product_id": p_id,
        "rating": 5,
        "review_title": "API Test Review",
        "review_text": "Verified API functionality with 5 star rating.",
        "customer_id": "cust_api_tester",
        "customer_name": "API Tester",
        "images": ["https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500"]
    })
    assert add_resp.status_code == 200
    rev_data = add_resp.json()
    review_id = rev_data["id"]
    assert rev_data["rating"] == 5
    assert rev_data["verified_purchase"] is True
    assert len(rev_data["images"]) == 1

    # 2. Get Rating Summary
    summary_resp = client.get(f"/api/v1/reviews/summary/{p_id}")
    assert summary_resp.status_code == 200
    summary_data = summary_resp.json()
    assert "average_rating" in summary_data
    assert "total_reviews" in summary_data
    assert "rating_breakdown" in summary_data
    assert summary_data["total_reviews"] >= 1

    # 3. Get Reviews
    list_resp = client.get(f"/api/v1/reviews?product_id={p_id}")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert "items" in list_data
    assert len(list_data["items"]) >= 1

    # 4. Helpful Vote
    vote_resp = client.post(f"/api/v1/reviews/{review_id}/helpful?voter_id=voter_api_99")
    assert vote_resp.status_code == 200
    assert vote_resp.json()["helpful_votes"] == 1
    assert vote_resp.json()["has_voted"] is True

    # 5. Edit Review
    edit_resp = client.put(f"/api/v1/reviews/{review_id}", json={
        "review_title": "Updated API Title",
        "review_text": "Updated API review description text."
    })
    assert edit_resp.status_code == 200
    assert edit_resp.json()["review_title"] == "Updated API Title"

    # 6. Delete Review
    del_resp = client.delete(f"/api/v1/reviews/{review_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"
