from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PTP', '0002_user_role'),
    ]

    operations = [
        migrations.RenameField(
            model_name='driver',
            old_name='id_card_image_1_url',
            new_name='id_card_image_1',
        ),
        migrations.RenameField(
            model_name='driver',
            old_name='id_card_image_2_url',
            new_name='id_card_image_2',
        ),
        migrations.RenameField(
            model_name='driver',
            old_name='license_image_url',
            new_name='license_image',
        ),
        migrations.AlterField(
            model_name='driver',
            name='id_card_image_1',
            field=models.FileField(upload_to='drivers/id_cards/'),
        ),
        migrations.AlterField(
            model_name='driver',
            name='id_card_image_2',
            field=models.FileField(upload_to='drivers/id_cards/'),
        ),
        migrations.AlterField(
            model_name='driver',
            name='license_image',
            field=models.FileField(upload_to='drivers/licenses/'),
        ),
    ]
