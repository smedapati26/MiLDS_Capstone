from django.utils import timezone

from aircraft.models import RawSurvivalPredictions, ShortLife, SurvivalPredictions


def transform_survival_preds():
    """
    Transforms raw short life records into clean ShortLife records

    @params request: (django.http.HttpRequest) the request object
    """

    def standard_error_calculations(prediction_row):
        errors = {
            f"std_err_{horizon}": horizon * (1 - prediction_row[f"horizon_{horizon}"]) * 0.005
            for horizon in range(5, 105, 5)
        }
        return errors

    prediction_columns = [
        "aircraft_model",
        "work_unit_code",
        "part_number",
        "serial_number",
        "horizon_5",
        "horizon_10",
        "horizon_15",
        "horizon_20",
        "horizon_25",
        "horizon_30",
        "horizon_35",
        "horizon_40",
        "horizon_45",
        "horizon_50",
        "horizon_55",
        "horizon_60",
        "horizon_65",
        "horizon_70",
        "horizon_75",
        "horizon_80",
        "horizon_85",
        "horizon_90",
        "horizon_95",
        "horizon_100",
    ]

    raw_predictions_qs = RawSurvivalPredictions.objects.all().values(*prediction_columns)

    # Step 2: Iterate over the records:
    new_records = []
    update_records = []
    for raw_prediction_record in raw_predictions_qs:
        try:
            shortlife = ShortLife.objects.get(
                work_unit_code=raw_prediction_record["work_unit_code"],
                comp_serial_number=raw_prediction_record["serial_number"],
                part_number=raw_prediction_record["part_number"],
            )
            aircraft = shortlife.aircraft
            nomenclature = shortlife.nomenclature
        except Exception:
            continue

        standard_errors = standard_error_calculations(raw_prediction_record)
        # Step 3: Get or Create corresponding shortlife record
        try:
            prediction_record = SurvivalPredictions.objects.get(
                aircraft=aircraft,
                comp_serial_number=raw_prediction_record["serial_number"],
                work_unit_code=raw_prediction_record["work_unit_code"],
            )
            prediction_record.nomenclature = nomenclature
            prediction_record.part_number = raw_prediction_record["part_number"]
            prediction_record.horizon_5 = raw_prediction_record["horizon_5"]
            prediction_record.horizon_10 = raw_prediction_record["horizon_10"]
            prediction_record.horizon_15 = raw_prediction_record["horizon_15"]
            prediction_record.horizon_20 = raw_prediction_record["horizon_20"]
            prediction_record.horizon_25 = raw_prediction_record["horizon_25"]
            prediction_record.horizon_30 = raw_prediction_record["horizon_30"]
            prediction_record.horizon_35 = raw_prediction_record["horizon_35"]
            prediction_record.horizon_40 = raw_prediction_record["horizon_40"]
            prediction_record.horizon_45 = raw_prediction_record["horizon_45"]
            prediction_record.horizon_50 = raw_prediction_record["horizon_50"]
            prediction_record.horizon_55 = raw_prediction_record["horizon_55"]
            prediction_record.horizon_60 = raw_prediction_record["horizon_60"]
            prediction_record.horizon_65 = raw_prediction_record["horizon_65"]
            prediction_record.horizon_70 = raw_prediction_record["horizon_70"]
            prediction_record.horizon_75 = raw_prediction_record["horizon_75"]
            prediction_record.horizon_80 = raw_prediction_record["horizon_80"]
            prediction_record.horizon_85 = raw_prediction_record["horizon_85"]
            prediction_record.horizon_90 = raw_prediction_record["horizon_90"]
            prediction_record.horizon_95 = raw_prediction_record["horizon_95"]
            prediction_record.horizon_100 = raw_prediction_record["horizon_100"]
            prediction_record.std_err_5 = standard_errors["std_err_5"]
            prediction_record.std_err_10 = standard_errors["std_err_10"]
            prediction_record.std_err_15 = standard_errors["std_err_15"]
            prediction_record.std_err_20 = standard_errors["std_err_20"]
            prediction_record.std_err_25 = standard_errors["std_err_25"]
            prediction_record.std_err_30 = standard_errors["std_err_30"]
            prediction_record.std_err_35 = standard_errors["std_err_35"]
            prediction_record.std_err_40 = standard_errors["std_err_40"]
            prediction_record.std_err_45 = standard_errors["std_err_45"]
            prediction_record.std_err_50 = standard_errors["std_err_50"]
            prediction_record.std_err_55 = standard_errors["std_err_55"]
            prediction_record.std_err_60 = standard_errors["std_err_60"]
            prediction_record.std_err_65 = standard_errors["std_err_65"]
            prediction_record.std_err_70 = standard_errors["std_err_70"]
            prediction_record.std_err_75 = standard_errors["std_err_75"]
            prediction_record.std_err_80 = standard_errors["std_err_80"]
            prediction_record.std_err_85 = standard_errors["std_err_85"]
            prediction_record.std_err_90 = standard_errors["std_err_90"]
            prediction_record.std_err_95 = standard_errors["std_err_95"]
            prediction_record.std_err_100 = standard_errors["std_err_100"]
            prediction_record.last_updated = timezone.now()
            update_records.append(prediction_record)
        except SurvivalPredictions.DoesNotExist:
            prediction_record = SurvivalPredictions(
                aircraft=aircraft,
                work_unit_code=raw_prediction_record["work_unit_code"],
                nomenclature=nomenclature,
                part_number=raw_prediction_record["part_number"],
                comp_serial_number=raw_prediction_record["serial_number"],
                horizon_5=raw_prediction_record["horizon_5"],
                horizon_10=raw_prediction_record["horizon_10"],
                horizon_15=raw_prediction_record["horizon_15"],
                horizon_20=raw_prediction_record["horizon_20"],
                horizon_25=raw_prediction_record["horizon_25"],
                horizon_30=raw_prediction_record["horizon_30"],
                horizon_35=raw_prediction_record["horizon_35"],
                horizon_40=raw_prediction_record["horizon_40"],
                horizon_45=raw_prediction_record["horizon_45"],
                horizon_50=raw_prediction_record["horizon_50"],
                horizon_55=raw_prediction_record["horizon_55"],
                horizon_60=raw_prediction_record["horizon_60"],
                horizon_65=raw_prediction_record["horizon_65"],
                horizon_70=raw_prediction_record["horizon_70"],
                horizon_75=raw_prediction_record["horizon_75"],
                horizon_80=raw_prediction_record["horizon_80"],
                horizon_85=raw_prediction_record["horizon_85"],
                horizon_90=raw_prediction_record["horizon_90"],
                horizon_95=raw_prediction_record["horizon_95"],
                horizon_100=raw_prediction_record["horizon_100"],
                std_err_5=standard_errors["std_err_5"],
                std_err_10=standard_errors["std_err_10"],
                std_err_15=standard_errors["std_err_15"],
                std_err_20=standard_errors["std_err_20"],
                std_err_25=standard_errors["std_err_25"],
                std_err_30=standard_errors["std_err_30"],
                std_err_35=standard_errors["std_err_35"],
                std_err_40=standard_errors["std_err_40"],
                std_err_45=standard_errors["std_err_45"],
                std_err_50=standard_errors["std_err_50"],
                std_err_55=standard_errors["std_err_55"],
                std_err_60=standard_errors["std_err_60"],
                std_err_65=standard_errors["std_err_65"],
                std_err_70=standard_errors["std_err_70"],
                std_err_75=standard_errors["std_err_75"],
                std_err_80=standard_errors["std_err_80"],
                std_err_85=standard_errors["std_err_85"],
                std_err_90=standard_errors["std_err_90"],
                std_err_95=standard_errors["std_err_95"],
                std_err_100=standard_errors["std_err_100"],
                last_updated=timezone.now(),
            )
            new_records.append(prediction_record)

    SurvivalPredictions.objects.bulk_create(new_records)
    SurvivalPredictions.objects.bulk_update(
        update_records,
        [
            "aircraft",
            "work_unit_code",
            "nomenclature",
            "part_number",
            "comp_serial_number",
            "horizon_5",
            "horizon_10",
            "horizon_15",
            "horizon_20",
            "horizon_25",
            "horizon_30",
            "horizon_35",
            "horizon_40",
            "horizon_45",
            "horizon_50",
            "horizon_55",
            "horizon_60",
            "horizon_65",
            "horizon_70",
            "horizon_75",
            "horizon_80",
            "horizon_85",
            "horizon_90",
            "horizon_95",
            "horizon_100",
            "std_err_5",
            "std_err_10",
            "std_err_15",
            "std_err_20",
            "std_err_25",
            "std_err_30",
            "std_err_35",
            "std_err_40",
            "std_err_45",
            "std_err_50",
            "std_err_55",
            "std_err_60",
            "std_err_65",
            "std_err_70",
            "std_err_75",
            "std_err_80",
            "std_err_85",
            "std_err_90",
            "std_err_95",
            "std_err_100",
            "last_updated",
        ],
    )
    return f"Transformation completed successfully! Added {len(new_records)} new SurvivalPredictions records and updated {len(update_records)} records."
