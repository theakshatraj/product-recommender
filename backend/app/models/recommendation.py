"""
Recommendation Pydantic Models
"""

from pydantic import BaseModel
from typing import List, Optional


class RecommendationRequest(BaseModel):
    user_id: Optional[int] = None
    product_id: Optional[int] = None
    limit: int = 5


class RecommendationResponse(BaseModel):
    product_id: int
    score: float
    explanation: Optional[str] = None
    
    
class RecommendationList(BaseModel):
    recommendations: List[RecommendationResponse]

