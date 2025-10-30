def get_or_status(status: str) -> str:
    return_status = status

    if "PMC" in status:
        return_status = "PMC"
    elif status in ["FIELD", "NMCS", "SUST", "NMC", "NMCM"]:
        return_status = "NMC"

    return return_status
