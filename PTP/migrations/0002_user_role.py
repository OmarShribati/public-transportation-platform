from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('passenger', 'Passenger'),
                    ('driver', 'Driver'),
                    ('admin', 'Admin'),
                ],
                default='passenger',
                max_length=20,
            ),
        ),
    ]
