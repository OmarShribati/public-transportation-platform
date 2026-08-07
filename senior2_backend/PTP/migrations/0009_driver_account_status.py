from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0008_keep_single_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='driver',
            name='account_status',
            field=models.CharField(default='active', max_length=50),
        ),
    ]
