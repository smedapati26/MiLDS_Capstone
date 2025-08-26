from tasks.models import Ictl, MOS, IctlTasks


def create_test_ictl_task(task: MOS, ictl: Ictl, id: int = 1) -> IctlTasks:
    ictl_task = IctlTasks.objects.create(id=id, task=task, ictl=ictl)

    return ictl_task
