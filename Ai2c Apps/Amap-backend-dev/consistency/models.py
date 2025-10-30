from django.db import models


class LogicalClock(models.Model):
    """
    Implements a logical clock to track model updates for system cache validation logic

    ------
    Notes:
    """

    model = models.CharField("The model the logical clock is operating for", max_length=32, primary_key=True)
    current_time = models.IntegerField("The current logical time for the model")

    class Meta:
        verbose_name = "Logical Clock"
        verbose_name_plural = "Logical Clocks"
