from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0006_vehicle_remove_user_role'),
    ]

    operations = [
        migrations.CreateModel(
            name='Route',
            fields=[
                ('route_id', models.AutoField(db_column='route_id', primary_key=True, serialize=False)),
                ('route_name', models.CharField(max_length=255, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'route',
            },
        ),
        migrations.AddField(
            model_name='vehicle',
            name='is_full',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='ownership',
            field=models.CharField(
                choices=[
                    ('government', 'Government'),
                    ('driver', 'Driver'),
                ],
                default='driver',
                max_length=20,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vehicle',
            name='route',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='PTP.route'),
        ),
    ]
