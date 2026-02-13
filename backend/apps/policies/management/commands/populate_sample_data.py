"""
Management command to populate database with sample insurance data
Run with: python manage.py populate_sample_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.policies.models import (
    InsuranceCompany, PolicyCategory, PolicyType
)
from apps.users.models import User
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populates database with sample insurance data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting data population...'))

        # Create admin user if not exists
        self.create_admin_user()

        # Create insurance companies
        companies = self.create_insurance_companies()
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(companies)} insurance companies'))

        # Create policy categories
        categories = self.create_policy_categories()
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(categories)} policy categories'))

        # Create policy types
        policy_types = self.create_policy_types(companies, categories)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(policy_types)} policy types'))

        self.stdout.write(self.style.SUCCESS('\n=== DATA POPULATION COMPLETE ==='))
        self.stdout.write(self.style.SUCCESS(f'Insurance Companies: {len(companies)}'))
        self.stdout.write(self.style.SUCCESS(f'Policy Categories: {len(categories)}'))
        self.stdout.write(self.style.SUCCESS(f'Policy Types: {len(policy_types)}'))
        self.stdout.write(self.style.SUCCESS(f'Featured Policies: {sum(1 for p in policy_types if p.is_featured)}'))

    def create_admin_user(self):
        """Create admin user if not exists"""
        if not User.objects.filter(email='admin@bowman.co.ke').exists():
            User.objects.create_superuser(
                email='admin@bowman.co.ke',
                password='Admin123!',
                first_name='Admin',
                last_name='User',
                phone='+254700000000'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created admin user (admin@bowman.co.ke / Admin123!)'))
        else:
            self.stdout.write(self.style.WARNING('⚠ Admin user already exists'))

    def create_insurance_companies(self):
        """Create sample insurance companies"""
        companies_data = [
            {
                'name': 'Jubilee Insurance',
                'description': 'Leading insurance provider in East Africa with over 80 years of experience',
                'logo': 'https://via.placeholder.com/200x80/0066cc/ffffff?text=Jubilee',
                'website': 'https://jubileeinsurance.com',
                'contact_email': 'info@jubilee.co.ke',
                'contact_phone': '+254-20-3283000',
                'rating': Decimal('4.5'),
            },
            {
                'name': 'AAR Insurance',
                'description': 'Comprehensive health and medical insurance solutions',
                'logo': 'https://via.placeholder.com/200x80/cc0000/ffffff?text=AAR',
                'website': 'https://aar-insurance.com',
                'contact_email': 'info@aar.co.ke',
                'contact_phone': '+254-20-2717100',
                'rating': Decimal('4.3'),
            },
            {
                'name': 'Britam Insurance',
                'description': 'Diversified financial services group offering insurance and asset management',
                'logo': 'https://via.placeholder.com/200x80/ff6600/ffffff?text=Britam',
                'website': 'https://britam.com',
                'contact_email': 'info@britam.co.ke',
                'contact_phone': '+254-20-2806000',
                'rating': Decimal('4.6'),
            },
            {
                'name': 'CIC Insurance',
                'description': 'Trusted insurance partner for individuals and businesses',
                'logo': 'https://via.placeholder.com/200x80/009933/ffffff?text=CIC',
                'website': 'https://cic.co.ke',
                'contact_email': 'info@cic.co.ke',
                'contact_phone': '+254-20-2829000',
                'rating': Decimal('4.4'),
            },
            {
                'name': 'Madison Insurance',
                'description': 'Innovative insurance solutions for modern lifestyles',
                'logo': 'https://via.placeholder.com/200x80/6600cc/ffffff?text=Madison',
                'website': 'https://madison.co.ke',
                'contact_email': 'info@madison.co.ke',
                'contact_phone': '+254-20-2808000',
                'rating': Decimal('4.2'),
            },
        ]

        companies = []
        for data in companies_data:
            company, created = InsuranceCompany.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            companies.append(company)

        return companies

    def create_policy_categories(self):
        """Create sample policy categories"""
        categories_data = [
            {
                'name': 'Motor',
                'slug': 'motor',
                'description': 'Comprehensive coverage for your vehicles',
                'icon': 'Car',
            },
            {
                'name': 'Medical',
                'slug': 'medical',
                'description': 'Medical and health coverage for you and your family',
                'icon': 'Heart',
            },
            {
                'name': 'Life',
                'slug': 'life',
                'description': 'Financial protection for your loved ones',
                'icon': 'Users',
            },
            {
                'name': 'Home',
                'slug': 'home',
                'description': 'Protect your property and belongings',
                'icon': 'Home',
            },
            {
                'name': 'Travel',
                'slug': 'travel',
                'description': 'Stay covered wherever you go',
                'icon': 'Plane',
            },
            {
                'name': 'Business',
                'slug': 'business',
                'description': 'Comprehensive coverage for your business',
                'icon': 'Briefcase',
            },
        ]

        categories = []
        for data in categories_data:
            category, created = PolicyCategory.objects.get_or_create(
                slug=data['slug'],
                defaults=data
            )
            # Update name if category already exists
            if not created:
                category.name = data['name']
                category.save()
            categories.append(category)

        return categories

    def create_policy_types(self, companies, categories):
        """Create sample policy types"""
        # Get categories by slug
        motor_cat = next(c for c in categories if c.slug == 'motor')
        medical_cat = next(c for c in categories if c.slug == 'medical')
        life_cat = next(c for c in categories if c.slug == 'life')
        home_cat = next(c for c in categories if c.slug == 'home')
        travel_cat = next(c for c in categories if c.slug == 'travel')
        business_cat = next(c for c in categories if c.slug == 'business')

        policy_types_data = [
            # Motor Insurance
            {
                'name': 'Comprehensive Motor Insurance',
                'category': motor_cat,
                'insurance_company': companies[0],
                'description': 'Complete protection for your vehicle against accidents, theft, and third-party liabilities. Includes 24/7 roadside assistance and nationwide coverage.',
                'base_premium': '15000',
                'min_coverage_amount': '500000',
                'max_coverage_amount': '10000000',
                'features': [
                    'Accident damage cover up to vehicle value',
                    'Third party liability cover',
                    'Theft and vandalism protection',
                    '24/7 roadside assistance',
                    'Windscreen and glass cover',
                    'Personal accident cover for driver',
                    'Flood and natural disaster cover',
                    'Courtesy car while in repair'
                ],
                'exclusions': [
                    'Wear and tear',
                    'Mechanical or electrical breakdowns',
                    'Driving under influence of alcohol',
                    'Use of vehicle for racing',
                    'Unroadworthy vehicles'
                ],
                'is_featured': True,
            },
            {
                'name': 'Third Party Motor Insurance',
                'category': motor_cat,
                'insurance_company': companies[1],
                'description': 'Affordable coverage for third-party liabilities. Meets all legal requirements for vehicle insurance in Kenya.',
                'base_premium': '8000',
                'min_coverage_amount': '200000',
                'max_coverage_amount': '3000000',
                'features': [
                    'Third party property damage',
                    'Third party bodily injury',
                    'Legal liability cover',
                    'Nationwide acceptance',
                    'Quick claims processing'
                ],
                'exclusions': [
                    'Own vehicle damage',
                    'Theft of own vehicle',
                    'Personal accident',
                    'Windscreen damage'
                ],
                'is_featured': True,
            },
            # Medical Insurance
            {
                'name': 'Family Health Plus',
                'category': medical_cat,
                'insurance_company': companies[1],
                'description': 'Comprehensive medical coverage for your entire family. Access to a wide network of hospitals and specialists.',
                'base_premium': '25000',
                'min_coverage_amount': '1000000',
                'max_coverage_amount': '10000000',
                'features': [
                    'Inpatient and outpatient cover',
                    'Maternity and child wellness',
                    'Specialist consultations',
                    'Chronic disease management',
                    'Emergency evacuation',
                    'Dental and optical cover',
                    'International coverage',
                    'Pre-existing conditions after waiting period'
                ],
                'exclusions': [
                    'Cosmetic procedures',
                    'Experimental treatments',
                    'Self-inflicted injuries',
                    'War-related injuries'
                ],
                'is_featured': True,
            },
            {
                'name': 'Individual Medical Cover',
                'category': medical_cat,
                'insurance_company': companies[2],
                'description': 'Personal medical insurance with flexible benefits and affordable premiums.',
                'base_premium': '12000',
                'min_coverage_amount': '500000',
                'max_coverage_amount': '5000000',
                'features': [
                    'Inpatient hospitalization',
                    'Outpatient services',
                    'Prescription medication',
                    'Laboratory tests',
                    'Emergency services',
                    'Specialist referrals'
                ],
                'exclusions': [
                    'Dental work',
                    'Optical services',
                    'Alternative medicine',
                    'Pre-existing conditions (first year)'
                ],
                'is_featured': True,
            },
            # Life Insurance
            {
                'name': 'Whole Life Insurance',
                'category': life_cat,
                'insurance_company': companies[2],
                'description': 'Lifetime protection with guaranteed benefits for your beneficiaries. Build cash value while securing your family\'s future.',
                'base_premium': '18000',
                'min_coverage_amount': '1000000',
                'max_coverage_amount': '50000000',
                'features': [
                    'Lifetime coverage',
                    'Guaranteed death benefit',
                    'Cash value accumulation',
                    'Tax advantages',
                    'Policy loans available',
                    'Flexible premium payments',
                    'Terminal illness benefit',
                    'Funeral expense cover'
                ],
                'exclusions': [
                    'Suicide within first 2 years',
                    'Death during criminal activity',
                    'War-related death',
                    'Pre-existing terminal illness'
                ],
                'is_featured': True,
            },
            {
                'name': 'Term Life Insurance',
                'category': life_cat,
                'insurance_company': companies[3],
                'description': 'Affordable life coverage for a specified period. Perfect for young families and mortgage protection.',
                'base_premium': '8000',
                'min_coverage_amount': '500000',
                'max_coverage_amount': '20000000',
                'features': [
                    'Fixed premium for term',
                    'High coverage at low cost',
                    'Renewable option',
                    'Convertible to whole life',
                    'Accidental death benefit',
                    'Critical illness rider available'
                ],
                'exclusions': [
                    'Suicide within first year',
                    'Hazardous activities',
                    'Criminal activity',
                    'Undisclosed medical conditions'
                ],
                'is_featured': False,
            },
            # Home Insurance
            {
                'name': 'Homeowners Comprehensive',
                'category': home_cat,
                'insurance_company': companies[3],
                'description': 'Complete protection for your home and contents against fire, theft, and natural disasters.',
                'base_premium': '20000',
                'min_coverage_amount': '2000000',
                'max_coverage_amount': '50000000',
                'features': [
                    'Building structure cover',
                    'Contents insurance',
                    'Alternative accommodation',
                    'Public liability',
                    'Fire and lightning',
                    'Burglary and theft',
                    'Water damage',
                    'Storm and flood damage'
                ],
                'exclusions': [
                    'Normal wear and tear',
                    'Gradual deterioration',
                    'Unoccupied property (>30 days)',
                    'War and terrorism'
                ],
                'is_featured': True,
            },
            {
                'name': 'Tenants Insurance',
                'category': home_cat,
                'insurance_company': companies[4],
                'description': 'Protect your personal belongings and liability as a tenant.',
                'base_premium': '5000',
                'min_coverage_amount': '200000',
                'max_coverage_amount': '2000000',
                'features': [
                    'Personal property cover',
                    'Liability protection',
                    'Additional living expenses',
                    'Fire and smoke damage',
                    'Theft protection',
                    'Water damage from pipes'
                ],
                'exclusions': [
                    'Building structure',
                    'Landlord\'s property',
                    'Flood damage',
                    'Earthquake'
                ],
                'is_featured': False,
            },
            # Travel Insurance
            {
                'name': 'International Travel Insurance',
                'category': travel_cat,
                'insurance_company': companies[0],
                'description': 'Comprehensive coverage for international trips including medical emergencies and trip cancellations.',
                'base_premium': '10000',
                'min_coverage_amount': '1000000',
                'max_coverage_amount': '5000000',
                'features': [
                    'Medical emergency cover',
                    'Trip cancellation/interruption',
                    'Lost luggage compensation',
                    'Travel delay',
                    'Emergency evacuation',
                    'Personal liability',
                    '24/7 assistance hotline',
                    'Covid-19 coverage'
                ],
                'exclusions': [
                    'Pre-existing conditions',
                    'High-risk activities',
                    'Travel to war zones',
                    'Unattended baggage'
                ],
                'is_featured': False,
            },
            # Business Insurance
            {
                'name': 'Business Liability Insurance',
                'category': business_cat,
                'insurance_company': companies[4],
                'description': 'Protect your business from liability claims and lawsuits.',
                'base_premium': '30000',
                'min_coverage_amount': '2000000',
                'max_coverage_amount': '100000000',
                'features': [
                    'Public liability',
                    'Professional indemnity',
                    'Employers liability',
                    'Product liability',
                    'Legal defense costs',
                    'Business interruption',
                    'Equipment breakdown',
                    'Cyber liability'
                ],
                'exclusions': [
                    'Intentional acts',
                    'Contractual liability',
                    'Criminal prosecution',
                    'Pollution'
                ],
                'is_featured': False,
            },
        ]

        policy_types = []
        for data in policy_types_data:
            # Convert lists to JSON-serializable format
            features = data.pop('features')
            exclusions = data.pop('exclusions')

            policy_type, created = PolicyType.objects.get_or_create(
                name=data['name'],
                insurance_company=data['insurance_company'],
                defaults={
                    **data,
                    'features': features,
                    'exclusions': exclusions,
                    'status': 'published',  # Make policies visible on frontend
                }
            )

            if not created:
                # Update features, exclusions, and status if already exists
                policy_type.features = features
                policy_type.exclusions = exclusions
                policy_type.status = 'published'
                policy_type.save()

            policy_types.append(policy_type)

        return policy_types
