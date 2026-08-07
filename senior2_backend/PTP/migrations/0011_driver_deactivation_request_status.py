from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0010_driver_deactivation_request_vehicle_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='driver',
            name='deactivation_request_status',
            field=models.CharField(default='none', max_length=50),
        ),
    ]
