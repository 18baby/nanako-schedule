from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

# 기존 테이블에 나중에 추가된 컬럼 (간단 마이그레이션)
ADDED_COLUMNS = [
    "ALTER TABLE schedules ADD COLUMN IF NOT EXISTS retail VARCHAR(100)",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 테이블이 없으면 생성
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        for sql in ADDED_COLUMNS:
            conn.execute(text(sql))
    yield


app = FastAPI(
    title="일정 관리 API",
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)
router = APIRouter(prefix="/api")


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/schedules", response_model=list[schemas.ScheduleOut])
def list_schedules(db: Session = Depends(get_db)):
    return db.scalars(select(models.Schedule).order_by(models.Schedule.id)).all()


@router.post("/schedules", response_model=schemas.ScheduleOut, status_code=201)
def create_schedule(payload: schemas.ScheduleCreate, db: Session = Depends(get_db)):
    obj = models.Schedule(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/schedules/{schedule_id}", response_model=schemas.ScheduleOut)
def update_schedule(
    schedule_id: int, payload: schemas.ScheduleUpdate, db: Session = Depends(get_db)
):
    obj = db.get(models.Schedule, schedule_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")
    for key, value in payload.model_dump().items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/schedules/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Schedule, schedule_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")
    db.delete(obj)
    db.commit()


app.include_router(router)
