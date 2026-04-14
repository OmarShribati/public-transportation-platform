from django.db import migrations


def keep_single_admin(apps, schema_editor):
    User = apps.get_model('account_management', 'User')
    admin_ids = list(
        User.objects.filter(is_admin=True).order_by('id').values_list('id', flat=True)
    )
    if len(admin_ids) <= 1:
        return

    User.objects.filter(id__in=admin_ids[1:]).update(
        is_admin=False,
        is_superuser=False,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('account_management', '0007_route_vehicle_status_fields'),
    ]

    operations = [
        migrations.RunPython(keep_single_admin, migrations.RunPython.noop),
    ]
