from fastapi import APIRouter, Query

from app.schemas.loyalty import Dashboard, Member, MemberCreate, Transaction
from app.services.loyalty_service import LoyaltyService

router = APIRouter()
service = LoyaltyService()


@router.get("", response_model=list[Member])
def list_members(
    tier_id: int | None = Query(default=None, description="会员等级ID"),
    points_min: int | None = Query(default=None, description="最低积分"),
    points_max: int | None = Query(default=None, description="最高积分"),
    birthday_month: int | None = Query(default=None, ge=1, le=12, description="生日月份(1-12)"),
    phone: str | None = Query(default=None, description="手机号(模糊匹配)"),
) -> list[dict]:
    return service.list_members(
        tier_id=tier_id, points_min=points_min, points_max=points_max,
        birthday_month=birthday_month, phone=phone,
    )


@router.post("", response_model=Member)
def create_member(payload: MemberCreate) -> dict:
    return service.create_member(payload.name, payload.phone, payload.birthday)


@router.get("/dashboard", response_model=Dashboard)
def dashboard(
    tier_id: int | None = Query(default=None, description="会员等级ID"),
    points_min: int | None = Query(default=None, description="最低积分"),
    points_max: int | None = Query(default=None, description="最高积分"),
    birthday_month: int | None = Query(default=None, ge=1, le=12, description="生日月份(1-12)"),
    phone: str | None = Query(default=None, description="手机号(模糊匹配)"),
) -> dict:
    return service.filtered_dashboard(
        tier_id=tier_id, points_min=points_min, points_max=points_max,
        birthday_month=birthday_month, phone=phone,
    )


@router.get("/{member_id}", response_model=Member)
def get_member(member_id: int) -> dict:
    return service.get_member_or_404(member_id)


@router.get("/{member_id}/transactions", response_model=list[Transaction])
def list_member_transactions(member_id: int) -> list[dict]:
    service.get_member_or_404(member_id)
    return service.list_transactions(member_id)
