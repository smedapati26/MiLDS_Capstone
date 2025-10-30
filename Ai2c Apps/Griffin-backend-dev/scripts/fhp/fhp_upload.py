import pandas as pd

from auto_dsr.models import Unit
from fhp.models import MonthlyProjection


def import_monthly_projections(file_path):
    # Read the Excel file into a pandas DataFrame
    df = pd.read_excel(file_path)
    df["reporting_month"] = pd.to_datetime(df["reporting_month"], errors="coerce")

    # Iterate through the rows of the DataFrame
    for index, row in df.iterrows():
        try:
            # Get the Unit object (assuming the Excel sheet has a column for unit_uic)
            unit = Unit.objects.get(uic=row["unit_uic"])

            # Create or update the MonthlyProjection object
            obj = MonthlyProjection.objects.create(
                unit=unit,
                model=row["model"],
                reporting_month=row["reporting_month"],
                projected_hours=row["projected_hours"],
                source=row["source"],
            )

            print(f"Created new MonthlyProjection for unit {unit} and model {row['model']}.")

        except Unit.DoesNotExist:
            print(f"Unit with UIC {row['unit_uic']} does not exist. Skipping row {index}.")
        except Exception as e:
            print(f"Error processing row {index}: {e}")
