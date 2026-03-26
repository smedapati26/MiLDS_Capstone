from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("back_end", "0007_remove_scenarioevent_current_unit_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="AppLock",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
                ("locked_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
