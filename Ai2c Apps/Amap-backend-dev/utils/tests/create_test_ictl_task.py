from tasks.models import Ictl, IctlTasks, Task


def create_test_ictl_task(task: Task, ictl: Ictl, id: int = 1) -> IctlTasks:
    ictl_task = IctlTasks.objects.create(id=id, task=task, ictl=ictl)

    return ictl_task
