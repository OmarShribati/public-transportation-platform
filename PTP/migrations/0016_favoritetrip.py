from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0015_vehiclelocation_distance_to_route_meters_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='FavoriteTrip',
            fields=[
                ('favorite_trip_id', models.AutoField(db_column='favorite_trip_id', primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('passenger', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorite_trips', to='PTP.user')),
                ('route', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorite_trips', to='PTP.route')),
            ],
            options={
                'db_table': 'favorite_trip',
            },
        ),
        migrations.AddConstraint(
            model_name='favoritetrip',
            constraint=models.UniqueConstraint(fields=('passenger', 'route'), name='unique_passenger_favorite_trip'),
        ),
    ]
