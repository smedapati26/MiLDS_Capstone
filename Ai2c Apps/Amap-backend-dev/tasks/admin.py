from django.contrib import admin

from .models import *


class IctlAdmin(admin.ModelAdmin):
    exclude = ["id"]


class TaskAdmin(admin.ModelAdmin):
    pass


class IctlTasksAdmin(admin.ModelAdmin):
    exclude = ["id"]


class MosAdmin(admin.ModelAdmin):
    exclude = ["id"]


class MosIctlsAdmin(admin.ModelAdmin):
    exclude = ["id"]


admin.site.register(Ictl, IctlAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(IctlTasks, IctlTasksAdmin)
admin.site.register(MOS, MosAdmin)
admin.site.register(MosIctls, MosIctlsAdmin)
