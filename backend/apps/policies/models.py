import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal


class InsuranceCompany(models.Model):
    """Insurance provider companies"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    logo = models.URLField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    description = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'insurance_companies'
        ordering = ['name']
        verbose_name_plural = 'Insurance Companies'

    def __str__(self):
        return self.name


class PolicyCategory(models.Model):
    """Insurance policy categories"""

    CATEGORY_CHOICES = [
        ('motor', 'Motor Insurance'),
        ('medical', 'Medical Insurance'),
        ('life', 'Life Insurance'),
        ('home', 'Home Insurance'),
        ('travel', 'Travel Insurance'),
        ('business', 'Business Insurance'),
        ('personal_accident', 'Personal Accident'),
        ('fire', 'Fire Insurance'),
        ('marine', 'Marine Insurance'),
        ('professional_indemnity', 'Professional Indemnity'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon name from icon library')
    display_order = models.IntegerField(default=0, help_text='Order in which to display categories')
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'policy_categories'
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Policy Categories'

    def __str__(self):
        return self.name


class PolicyType(models.Model):
    """Policy templates/types offered by insurance companies"""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('delisted', 'Delisted'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(PolicyCategory, on_delete=models.PROTECT, related_name='policy_types')
    insurance_company = models.ForeignKey(InsuranceCompany, on_delete=models.CASCADE, related_name='policy_types')
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=250, unique=True, blank=True, help_text='Auto-generated from name')
    description = models.TextField()
    base_premium = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    # JSON fields for flexible data
    coverage_details = models.JSONField(default=dict, help_text='Coverage breakdown')
    features = models.JSONField(default=list, help_text='List of features')
    exclusions = models.JSONField(default=list, help_text='List of exclusions')
    requirements = models.JSONField(default=dict, help_text='Required fields for quote/purchase')
    terms_and_conditions = models.TextField(blank=True, help_text='Terms and conditions')

    # Policy terms
    min_coverage_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    max_coverage_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    min_age = models.IntegerField(null=True, blank=True)
    max_age = models.IntegerField(null=True, blank=True)

    # Status and visibility
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True, help_text='Draft policies are hidden from frontend')
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, help_text='Show in featured policies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'policy_types'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['insurance_company', 'is_active']),
            models.Index(fields=['status']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while PolicyType.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.insurance_company.name}"


class Policy(models.Model):
    """Customer policies"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('suspended', 'Suspended'),
    ]

    PAYMENT_FREQUENCY_CHOICES = [
        ('annual', 'Annual'),
        ('semi_annual', 'Semi-Annual'),
        ('quarterly', 'Quarterly'),
        ('monthly', 'Monthly'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    policy_number = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='policies')
    policy_type = models.ForeignKey(PolicyType, on_delete=models.PROTECT, related_name='policies')
    insurance_company = models.ForeignKey(InsuranceCompany, on_delete=models.PROTECT, related_name='policies')

    # Policy details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    premium_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    coverage_amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    payment_frequency = models.CharField(max_length=20, choices=PAYMENT_FREQUENCY_CHOICES, default='annual')

    # Custom policy data (vehicle details, medical info, etc.)
    policy_data = models.JSONField(default=dict, help_text='Policy-specific data')

    # Documents
    certificate_url = models.URLField(blank=True, null=True)
    policy_document_url = models.URLField(blank=True, null=True)

    # Beneficiaries (for life insurance, etc.)
    beneficiaries = models.JSONField(default=list, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    activated_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'policies'
        ordering = ['-created_at']
        verbose_name_plural = 'Policies'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'end_date']),
            models.Index(fields=['policy_number']),
        ]

    def __str__(self):
        return f"{self.policy_number} - {self.user.full_name}"

    @property
    def is_active(self):
        return self.status == 'active'

    @property
    def is_expired(self):
        return self.status == 'expired'

    @property
    def days_to_expiry(self):
        from django.utils import timezone
        if self.end_date:
            delta = self.end_date - timezone.now().date()
            return delta.days
        return None


class PolicyReview(models.Model):
    """Customer reviews for policies"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='policy_reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1)], help_text='Rating from 1-5')
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'policy_reviews'
        ordering = ['-created_at']
        unique_together = ['policy', 'user']

    def __str__(self):
        return f"Review by {self.user.full_name} - {self.rating} stars"
