from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('policies', '0005_comprehensive_payment_flow'),
    ]

    operations = [
        migrations.AddField(
            model_name='policytype',
            name='min_premium',
            field=models.DecimalField(
                blank=True, decimal_places=2, max_digits=10, null=True,
                help_text='Minimum annual premium enforced regardless of calculated amount (comprehensive motor floor)'
            ),
        ),
    ]
