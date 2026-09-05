from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ReviewCreateDTO(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5, description="Star rating between 1 and 5")
    review_title: str = Field(..., min_length=2, max_length=150)
    review_text: str = Field(..., min_length=5, max_length=2000)
    customer_id: Optional[str] = "cust_verified_buyer"
    customer_name: Optional[str] = "Verified Buyer"
    images: List[str] = []
    verified_purchase: Optional[bool] = True


class ReviewUpdateDTO(BaseModel):
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    review_title: Optional[str] = Field(default=None, min_length=2, max_length=150)
    review_text: Optional[str] = Field(default=None, min_length=5, max_length=2000)
    images: Optional[List[str]] = None


class ReviewDTO(BaseModel):
    id: str
    product_id: str
    customer_id: str
    customer_name: str
    rating: int
    review_title: str
    review_text: str
    verified_purchase: bool = True
    helpful_votes: int = 0
    images: List[str] = []
    created_at: str
    updated_at: str
    has_voted: Optional[bool] = False


class StarBreakdownDTO(BaseModel):
    star: int
    count: int
    percentage: float


class ProductRatingSummaryDTO(BaseModel):
    product_id: str
    average_rating: float
    total_reviews: int
    rating_breakdown: Dict[str, StarBreakdownDTO]
    verified_purchases_count: int = 0


class ReviewListResponseDTO(BaseModel):
    items: List[ReviewDTO]
    total: int
    limit: int
    offset: int
    summary: ProductRatingSummaryDTO


class HelpfulVoteResponseDTO(BaseModel):
    review_id: str
    helpful_votes: int
    has_voted: bool
    message: str


class ReviewIntelligenceDTO(BaseModel):
    product_id: str
    pros: List[str] = []
    cons: List[str] = []
    customer_sentiment: str = "Positive"
    satisfaction_score: float = 90.0
    recommendation_score: float = 88.0
    before_checkout_summary: str = ""
    total_reviews_analyzed: int = 0

