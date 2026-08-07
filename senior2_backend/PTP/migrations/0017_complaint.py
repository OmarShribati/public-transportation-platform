from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0016_favoritetrip'),
    ]

    operations = [
        migrations.CreateModel(
            name='Complaint',
            fields=[
                ('complaint_id', models.AutoField(db_column='complaint_id', primary_key=True, serialize=False)),
                ('message', models.TextField()),
                ('image', models.FileField(blank=True, null=True, upload_to='complaints/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('passenger', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='complaints', to='PTP.user')),
            ],
            options={
                'db_table': 'complaint',
            },
        ),
    ]
