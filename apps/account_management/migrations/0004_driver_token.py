from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('account_management', '0003_driver_image_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='DriverToken',
            fields=[
                ('key', models.CharField(max_length=40, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('driver', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='auth_token', to='account_management.driver')),
            ],
            options={
                'db_table': 'driver_token',
            },
        ),
    ]
