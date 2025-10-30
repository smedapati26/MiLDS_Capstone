from django.apps import AppConfig

class BackEndConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app.back_end"      # full Python path to the app package
    label = "back_end"         # this is the app label used in fixtures
