from auto_dsr.models import Unit
from reports.generator.generate_dsr import generate_dsr

# generate_dsr(Unit.objects.get(short_name="10th CAB, 10th MD"), debug=True)
generate_dsr(Unit.objects.get(short_name="6-101 GSAB"), debug=True)
generate_dsr(Unit.objects.get(short_name="2-4 GSAB"), debug=True)

from auto_dsr.models import Unit
from reports.generator.generate_csv_dsr import generate_csv_dsr

generate_csv_dsr(Unit.objects.get(short_name="16th CAB, 7 ID"), debug=True)


from auto_dsr.models import Unit
from reports.daily_status_report import DailyStatusConfig
from reports.daily_status_report import DailyStatusReport

cab = Unit.objects.get(short_name="AASF #2, GA ARNG")
config = DailyStatusConfig("pdf", debug=True)
report = DailyStatusReport(config, cab, [], [], [])
report.generate_report()
