from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ScheduleBase(BaseModel):
    retail: Optional[str] = None
    category: Optional[str] = None
    product_name: str = Field(min_length=1)
    launch_date: Optional[date] = None
    quantity: Optional[str] = None
    moq: Optional[int] = None
    apr_date: Optional[date] = None
    data_date: Optional[date] = None
    mass_production_date: Optional[date] = None
    status: Optional[str] = None
    lead_time: Optional[str] = None

    # 프론트에서 빈 문자열이 오면 None 으로 처리
    @field_validator(
        "retail", "category", "quantity", "moq", "launch_date", "apr_date", "data_date",
        "mass_production_date", "status", "lead_time", mode="before",
    )
    @classmethod
    def empty_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(ScheduleBase):
    pass


class ScheduleOut(ScheduleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
