from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0009_driver_account_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='driver',
            name='deactivation_requested',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
