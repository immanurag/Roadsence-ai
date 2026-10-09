from pydantic import BaseModel


class CountByLabel(BaseModel):
    label: str
    count: int


class SeverityBreakdown(BaseModel):
    breakdown: list[CountByLabel]
    total: int


class HourlyCount(BaseModel):
    hour: int
    count: int
    fatal_count: int
    serious_count: int
    slight_count: int


class YearlyCount(BaseModel):
    year: int
    count: int


class CrossTab(BaseModel):
    dimension_a: str
    dimension_b: str
    count: int
