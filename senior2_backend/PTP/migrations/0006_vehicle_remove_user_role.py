from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0005_remove_driver_users'),
    ]

    operations = [
        migrations.CreateModel(
            name='Vehicle',
            fields=[
                ('vehicle_id', models.AutoField(db_column='vehicle_id', primary_key=True, serialize=False)),
                ('vehicle_number', models.CharField(max_length=50, unique=True)),
                ('vehicle_type', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'vehicle',
            },
        ),
        migrations.RemoveField(
            model_name='user',
            name='role',
        ),
        migrations.AddField(
            model_name='driver',
            name='vehicle',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='PTP.vehicle'),
        ),
    ]
