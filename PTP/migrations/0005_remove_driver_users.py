from django.db import migrations


def remove_driver_users(apps, schema_editor):
    User = apps.get_model('PTP', 'User')
    User.objects.filter(role='driver').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0004_driver_token'),
    ]

    operations = [
        migrations.RunPython(remove_driver_users, migrations.RunPython.noop),
    ]
