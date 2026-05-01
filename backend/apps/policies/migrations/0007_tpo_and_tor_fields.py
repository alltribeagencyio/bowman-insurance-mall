from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('policies', '0006_add_min_premium_to_policy_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='policytype',
            name='motor_cover_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('tpo', 'Third Party Only (Annual)'),
                    ('comprehensive', 'Comprehensive'),
                    ('tor', 'Time on Risk (1 Month TPO)'),
                ],
                help_text='Motor cover sub-type — determines payment flow and duration',
                max_length=20,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='policytype',
            name='tpo_max_installments',
            field=models.IntegerField(
                choices=[(1, '1 Installment (Full Payment)'), (2, '2 Installments')],
                default=1,
                help_text='For TPO: admin-configured number of installments allowed',
            ),
        ),
        migrations.AddField(
            model_name='policytype',
            name='tpo_installment_1_amount',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Admin-set amount for TPO first installment',
                max_digits=10,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='policytype',
            name='tpo_installment_2_amount',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Admin-set amount for TPO second installment (balance)',
                max_digits=10,
                null=True,
            ),
        ),
    ]
