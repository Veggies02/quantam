"""
Common Pydantic Schemas for Standardized Enterprise API Responses.
"""

from typing import Generic, TypeVar, Optional, Any, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar("T")


class ResponseMeta(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    request_id: Optional[str] = None
    execution_time_ms: Optional[float] = None
    api_version: str = "2.4.0-enterprise"


class ApiResponse(BaseModel, Generic[T]):
    success: bool = Field(default=True, description="True if operation succeeded")
    code: int = Field(default=200, description="HTTP status code")
    message: str = Field(default="Operation completed successfully", description="Human-readable status summary")
    data: T = Field(description="Payload data")
    meta: Optional[ResponseMeta] = Field(default_factory=ResponseMeta, description="Response metadata")


class ApiErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str
    code: Optional[str] = None


class ApiErrorResponse(BaseModel):
    success: bool = Field(default=False)
    code: int = Field(description="HTTP status code")
    error_type: str = Field(description="Error category classification")
    message: str = Field(description="Detailed error description")
    details: Optional[List[ApiErrorDetail]] = None
    meta: Optional[ResponseMeta] = Field(default_factory=ResponseMeta)


class HealthCheckData(BaseModel):
    status: str = "healthy"
    version: str = "2.4.0"
    environment: str = "production"
    uptime_seconds: float
    services: Dict[str, str]
    quantum_backend: Dict[str, Any]
    regulatory_frameworks: List[str]
