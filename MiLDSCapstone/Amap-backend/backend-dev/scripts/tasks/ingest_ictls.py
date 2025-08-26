import os
import json
from datetime import datetime

from tasks.models import MOS, MosIctls, Ictl, IctlTasks, Task
from tasks.model_utils import Proponent


def ingest_ictls():
    # Access ICTL directory
    os.chdir("C:\\Users\\1036553100121004.MIL\\OneDrive - US Army\\Documents\\ICTLs\\New_ICTLs_29SEP24")
    files = []
    # Loop through ICTLs
    for filename in os.listdir():
        print("\nNEW ICTL\n")
        # files.append(filename)
        file = open(filename)
        ictl_dict = json.load(file)
        files.append(ictl_dict)

        iso_date_seconds = ictl_dict["statusDate"] / 1000
        formatted_date = datetime.fromtimestamp(iso_date_seconds).strftime("%Y-%m-%d")

        ictl, _ = Ictl.objects.get_or_create(
            ictl_title=ictl_dict["title"],
            status=ictl_dict["status"],
            skill_level=ictl_dict["specialty"]["skillLevel"]["code"],
            target_audience=ictl_dict["targetAudience"],
            date_published=formatted_date,
            proponent=Proponent.USAACE,
        )
        ictl_title = ictl_dict["title"]
        multi_mos_list = ictl_title[ictl_title.rfind("(") + 1 : ictl_title.rfind(")")].split(",")

        # If ICTL only refers to one MOS
        if len(multi_mos_list) == 1:
            mos = MOS.objects.get(mos_code=ictl_dict["specialty"]["mos"]["code"])
            print("Single MOS:", mos)
            mos_ictl, _ = MosIctls.objects.get_or_create(mos=mos, ictl=ictl)
            print(mos_ictl)
            mos_ictl.save()
        else:  # If ICTL refers to multiple MOS
            for ind_mos in multi_mos_list:
                print("Multi MOS:", ind_mos.strip())
                # Strip whitespaces from mos
                mos_code = ind_mos.strip()
                mos_ictl, _ = MosIctls.objects.get_or_create(mos=mos, ictl=ictl)
                print(mos_ictl)
                mos_ictl.save()
        print(ictl)
        ictl.save()

        # Ingest all tasks
        for task_dict in ictl_dict["individualTasks"]["individualTask"]:
            task_number = task_dict["taskNumber"]
            # Create a new task, or update an existing task
            task, created = Task.objects.get_or_create(task_number=task_number)
            if not created:
                print("Task", task_number, "already existed")
            task.task_title = task_dict["title"]
            task.pdf_url = task_dict.get("carURL", None)
            task.training_location = task_dict.get("trainLocation", None)
            task.frequency = task_dict.get("sustainmentFreq", None)
            task.subject_area = task_dict.get("subjectArea", None)
            task.unit_task_pdf = None

            task.save()

            # Add task to Ictl-Task table
            ictl_task, _ = IctlTasks.objects.get_or_create(task=task, ictl=ictl)
            print(ictl_task)
            ictl_task.save()


ingest_ictls()
