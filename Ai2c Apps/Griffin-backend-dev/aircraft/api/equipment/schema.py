from ninja import Field, FilterSchema, ModelSchema, Schema


class AircraftModelStatusOut(Schema):
    model: str
    total: int
    rtl: int
    nrtl: int
    # Flying today is not in the MVP
    # flying_today: int
    in_phase: int
    fmc_count: int
    fmc_percent: float
    pmc_count: int
    pmc_percent: float
    nmc_count: int
    nmc_percent: float
    dade_count: int
    dade_percent: float
