import numpy as np
import pandas as pd
from django.db.models import Q

from personnel.models import Soldier
from personnel.utils import get_soldier_mos_ml
from units.models import Unit


def generate_synth_data(uic):
    unit = Unit.objects.get(uic=uic)

    all_maintainers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics]).exclude(
        Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True) | Q(is_admin=True)
    )

    required_fields = [
        "user_id",
        "rank",
        "first_name",
        "last_name",
        "unit",
        "unit__display_name",
        "primary_mos__mos",
    ]

    maintainers_list = list(all_maintainers.values(*required_fields))

    for maintainer in maintainers_list:
        maintainer["maintenance_level"] = get_soldier_mos_ml(Soldier.objects.get(user_id=maintainer["user_id"]))

    maintainer_df = pd.DataFrame(maintainers_list)

    maintainer_df["unique_id"] = maintainer_df.index + 1

    maintainer_df["first_name"] = np.random.permutation(maintainer_df["first_name"])
    maintainer_df["last_name"] = np.random.permutation(maintainer_df["last_name"])

    maintainer_df = maintainer_df[
        [
            "unique_id",
            "rank",
            "first_name",
            "last_name",
            "unit",
            "unit__display_name",
            "primary_mos__mos",
            "maintenance_level",
        ]
    ]

    # print(maintainer_df.head(10))
    maintainer_df.to_csv("synth_amap_personnel.csv", index=False)


# Using 82nd CAB as example for now
generate_synth_data("WCEZFF")
