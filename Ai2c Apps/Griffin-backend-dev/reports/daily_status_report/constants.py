from reportlab.lib.styles import ParagraphStyle

from reports.base.constants import HALF_INCH, PAGE_HEIGHT, PAGE_WIDTH, QUARTER_INCH, THREE_QUARTER_INCH, inch

HEADER_FONT_SIZE = 24
TABLE_FONT_SIZE = 5
RTL_TABLE_FONT_SIZE = 4
DSR_SLANT_TABLE_HEADER_FONT_SIZE = 6
DSR_SLANT_TABLE_FONT_SIZE = 16
SUMMARY_TABLE_FONT_SIZE = 8
UNIT_LOGO_SIZE = THREE_QUARTER_INCH
FOOTER_LOGO_SIZE = 25
MODS_HEADER_ROTATION = 50
LANDSCAPE_FULL_FRAME_WIDTH = PAGE_WIDTH - HALF_INCH
DSR_DETAILS_FRAME_HEIGHT = PAGE_HEIGHT - (2 * inch)
DSR_SLANT_FRAME_START = DSR_DETAILS_FRAME_HEIGHT + HALF_INCH
BASE_COLUMN_COUNT = 12

REMARKS_STYLE = ParagraphStyle(
    name="dsr_remarks_style", fontName="Roboto", fontSize=TABLE_FONT_SIZE, leading=TABLE_FONT_SIZE
)

PMC_STATUSES = set(["PMC", "PMCS", "PMCM"])
NMC_STATUSES = set(["NMC", "NMCM", "NMCS", "FIELD", "SUST", "DADE"])

GRAPH_LOCATIONS = {
    0: {"x": HALF_INCH, "y": 4.5 * inch},
    1: {"x": 5.5 * inch, "y": 4.5 * inch},
    2: {"x": HALF_INCH, "y": 1.5 * inch},
    3: {"x": 5.5 * inch, "y": 1.5 * inch},
    "single_model": {"x": 0, "y": 1.5 * inch},
}

PHASE_FLOW_CHART_DIMENSIONS = {
    "single_model": {
        "x": 100,
        "y": 100,
        "height": 250,
        "width": 600,
    },
    "multiple_models": {
        "x": 50,
        "y": 50,
        "height": 125,
        "width": 300,
    },
}

PHASE_FLOW_CHART_SPECS = {
    "CH-47FV2": {
        "max_val": 640,
        "min_val": 0,
        "val_step": 40,
    },
    "HH-60M": {
        "max_val": 480,
        "min_val": 0,
        "val_step": 48,
    },
    "UH-60M": {
        "max_val": 480,
        "min_val": 0,
        "val_step": 48,
    },
    "UH-60L": {
        "max_val": 480,
        "min_val": 0,
        "val_step": 48,
    },
    "UH-60V": {
        "max_val": 480,
        "min_val": 0,
        "val_step": 48,
    },
    "UH-70A": {
        "max_val": 800,
        "min_val": 0,
        "val_step": 80,
    },
    "AH-64D": {
        "max_val": 500,
        "min_val": 0,
        "val_step": 50,
    },
    "AH-64E": {
        "max_val": 500,
        "min_val": 0,
        "val_step": 50,
    },
    "default": {
        "max_val": 800,
        "min_val": 0,
        "val_step": 80,
    },
}
