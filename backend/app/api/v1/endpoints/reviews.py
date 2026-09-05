from fastapi import APIRouter, HTTPException, Query, Body, Header, Depends
from typing import Optional, List
from app.schemas.reviews import (
    ReviewCreateDTO,
    ReviewUpdateDTO,
    ReviewDTO,
    ProductRatingSummaryDTO,
    ReviewListResponseDTO,
    HelpfulVoteResponseDTO,
    ReviewIntelligenceDTO
)
from app.services.review_service import review_service
from app.services.review_intelligence_service import review_intelligence_service

router = APIRouter()


@router.get("/intelligence/{product_id}", response_model=ReviewIntelligenceDTO)
def get_review_intelligence(product_id: str):
    """
    AI Review Intelligence:
    Analyzes all reviews for a product to extract summarized pros and cons,
    overall customer satisfaction, recommendation score, and pre-checkout warning
    to reduce product returns.
    """
    return review_intelligence_service.analyze_reviews(product_id)



@router.post("", response_model=ReviewDTO)
def add_review(
    payload: ReviewCreateDTO,
    x_customer_id: Optional[str] = Header(default=None)
):
    """
    Submit a customer product review with 1-5 star rating, title, text, and optional photo attachments.
    Automatically verifies purchase against completed orders.
    """
    return review_service.add_review(payload, current_user_id=x_customer_id)


@router.put("/{review_id}", response_model=ReviewDTO)
def edit_review(
    review_id: str,
    payload: ReviewUpdateDTO,
    x_customer_id: Optional[str] = Header(default=None)
):
    """
    Update an existing product review (rating, title, text, photo attachments).
    """
    updated = review_service.edit_review(review_id, payload, current_user_id=x_customer_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Review with id '{review_id}' not found")
    return updated


@router.delete("/{review_id}")
def delete_review(
    review_id: str,
    x_customer_id: Optional[str] = Header(default=None)
):
    """
    Delete an existing product review and update catalog product rating statistics.
    """
    success = review_service.delete_review(review_id, current_user_id=x_customer_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Review with id '{review_id}' not found")
    return {"status": "success", "message": f"Review '{review_id}' successfully deleted"}


@router.get("", response_model=ReviewListResponseDTO)
def get_reviews(
    product_id: str = Query(..., description="Product ID to retrieve reviews for"),
    rating: Optional[int] = Query(default=None, ge=1, le=5, description="Filter by star rating (1-5)"),
    sort_by: str = Query(default="most_helpful", description="Sort by: most_helpful | recent | highest_rating | lowest_rating"),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    voter_id: Optional[str] = Query(default=None, description="Optional voter ID to identify active helpful votes")
):
    """
    Retrieve paginated reviews for a specific product, with star filtering, multi-factor sorting,
    and product rating summary breakdown.
    """
    return review_service.get_reviews(
        product_id=product_id,
        rating_filter=rating,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
        voter_id=voter_id
    )


@router.get("/summary/{product_id}", response_model=ProductRatingSummaryDTO)
def get_product_rating_summary(product_id: str):
    """
    Retrieve product rating statistics and detailed star breakdown (5★ to 1★ counts & percentages).
    """
    return review_service.get_product_rating_summary(product_id)


@router.post("/{review_id}/helpful", response_model=HelpfulVoteResponseDTO)
def vote_helpful(
    review_id: str,
    voter_id: Optional[str] = Query(default=None),
    x_customer_id: Optional[str] = Header(default=None)
):
    """
    Upvote a review as helpful. Toggles vote off if already voted by this user/session.
    """
    effective_voter = x_customer_id or voter_id or "anonymous_voter"
    try:
        return review_service.vote_helpful(review_id, effective_voter)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
