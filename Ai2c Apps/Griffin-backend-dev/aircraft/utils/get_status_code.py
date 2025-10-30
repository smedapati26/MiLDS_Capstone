from aircraft.models import Fault


def get_status_code(status_code: str) -> str:
    """
    Changes the vantage status code to the Choice field status code.
    """
    match status_code:
        case "-":
            status_code_value = Fault.TechnicalStatus.DASH
        case "+":
            status_code_value = Fault.TechnicalStatus.CIRCLE_X
        case "/":
            status_code_value = Fault.TechnicalStatus.DIAGONAL
        case "X":
            status_code_value = Fault.TechnicalStatus.DEADLINE
        case "N":
            status_code_value = Fault.TechnicalStatus.NUCLEAR
        case "B":
            status_code_value = Fault.TechnicalStatus.BIOLOGICAL
        case "C":
            status_code_value = Fault.TechnicalStatus.CHEMICAL
        case "E":
            status_code_value = Fault.TechnicalStatus.ADMIN_DEADLINE
        case _:
            status_code_value = Fault.TechnicalStatus.NO_STATUS

    return status_code_value
