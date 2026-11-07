from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Schedule(Base):
    """columns.txt 기준 일정 테이블"""

    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    retail: Mapped[Optional[str]] = mapped_column(String(100))              # 리테일 (범주형)
    category: Mapped[Optional[str]] = mapped_column(String(100))            # 종류 (범주형)
    product_name: Mapped[str] = mapped_column(String(255))                  # 상품명
    launch_date: Mapped[Optional[date]] = mapped_column(Date)               # 전개일
    quantity: Mapped[Optional[str]] = mapped_column(String(100))            # 수량
    moq: Mapped[Optional[int]] = mapped_column(Integer)                     # MOQ (수치형)
    apr_date: Mapped[Optional[date]] = mapped_column(Date)                  # APR입고일
    data_date: Mapped[Optional[date]] = mapped_column(Date)                 # 데이터입고일
    mass_production_date: Mapped[Optional[date]] = mapped_column(Date)      # 양산의뢰
    status: Mapped[Optional[str]] = mapped_column(String(50))               # 상태 (범주형)
    lead_time: Mapped[Optional[str]] = mapped_column(String(100))           # 생산리드타임

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
