from enum import IntEnum


class PhaseInterval(IntEnum):
    """
    Aircraft Phase Intervals based on MDS
    """

    CHINOOK = 640
    BLACKHAWK = 480
    LAKOTA = 800
    APACHE = 500
    KINGAIR = 200
    CITATION = 100
    DEFAULT = 480


def get_phase_interval(model: str) -> int:
    """
    Gets an aircraft phase interval based on a given model name

    @param model: str the aircraft's model (ie. UH-60M)
    """
    series = model[1:5]
    if series.startswith("H"):  # this is a rotary wing aircraft
        if series == "H-60":
            return PhaseInterval.BLACKHAWK
        elif series == "H-47":
            return PhaseInterval.CHINOOK
        elif series == "H-64":
            return PhaseInterval.APACHE
        elif series == "H-72":
            return PhaseInterval.LAKOTA
        else:
            return PhaseInterval.DEFAULT
    else:  # this is a fixed wing aircraft
        if model[:4] == "C-12":
            return PhaseInterval.KINGAIR
        elif model[:5] == "UC-35":
            return PhaseInterval.CITATION
        return PhaseInterval.DEFAULT
