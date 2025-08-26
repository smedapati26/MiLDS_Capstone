from datetime import date
from io import BytesIO
import zipfile

from auto_dsr.models import Unit
from reports.generator.data import fetch_slant_data_for, fetch_simple_dsr_data_for


def generate_csv_dsr(unit: Unit, include_uas: bool = True, debug: bool = False) -> tuple[BytesIO, str]:
    """
    Generates a unit DSR for csv output

    @param unit: (auto_dsr.models.Unit) the unit to generate the DSR for
    @param include_uas: (bool) (default True) a boolean flag indicating if UAS should be included
    @param debug: (bool) a boolean flag indicating if the report should be locally generated
    @returns: (BytesIO, str) A tuple of the DSR CSV as a byte stream and the filename
    """

    slant_csv_filename = "%s slant %s.csv" % (unit.short_name, date.today().isoformat())
    dsr_csv_filename = "%s DSR %s.csv" % (unit.short_name, date.today().isoformat())
    uas_dsr_csv_filename = "%s UAS DSR %s.csv" % (unit.short_name, date.today().isoformat())

    slant_df = fetch_slant_data_for(unit, include_uav=include_uas)
    aircraft_dsr_df, uas_dsr_df = fetch_simple_dsr_data_for(unit)
    if debug:
        slant_df.to_csv(slant_csv_filename, index=False)
        aircraft_dsr_df.to_csv(dsr_csv_filename, index=False)
        uas_dsr_df.to_csv(uas_dsr_csv_filename, index=False)
    else:
        zip_csv_filename = "%s CSV DSR %s.zip" % (unit.short_name, date.today().isoformat())
        zip_buffer = BytesIO(b"")
        zip_file = zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED)
        # Add Slant CSV
        slant_buffer = BytesIO(b"")
        slant_df.to_csv(slant_buffer, mode="wb", index=False)
        slant_buffer.seek(0)
        zip_file.writestr(slant_csv_filename, slant_buffer.getvalue())

        # Add DSR CSV
        dsr_buffer = BytesIO(b"")
        aircraft_dsr_df.to_csv(dsr_buffer, index=False)
        dsr_buffer.seek(0)
        zip_file.writestr(dsr_csv_filename, dsr_buffer.getvalue())

        # Add UAS DSR CSV
        if uas_dsr_df is not None:
            uas_dsr_buffer = BytesIO(b"")
            uas_dsr_df.to_csv(uas_dsr_buffer, index=False)
            uas_dsr_buffer.seek(0)
            zip_file.writestr(uas_dsr_csv_filename, uas_dsr_buffer.getvalue())

        zip_buffer.seek(0)
        return zip_buffer, zip_csv_filename
