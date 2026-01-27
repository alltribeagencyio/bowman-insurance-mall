import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model"""

    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
        ('assessor', 'Assessor'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, db_index=True)
    id_number = models.CharField(max_length=50, blank=True, null=True)
    kra_pin = models.CharField(max_length=50, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer', db_index=True)

    # Status fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    phone_verified_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['role', 'is_active']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def has_role(self, role):
        """Check if user has specific role"""
        return self.role == role

    def verify_email(self):
        """Mark email as verified"""
        self.is_verified = True
        self.email_verified_at = timezone.now()
        self.save(update_fields=['is_verified', 'email_verified_at'])

    def verify_phone(self):
        """Mark phone as verified"""
        self.phone_verified_at = timezone.now()
        self.save(update_fields=['phone_verified_at'])


class NotificationPreference(models.Model):
    """User notification preferences"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preference')

    # Email preferences
    email_policy_updates = models.BooleanField(default=True)
    email_payment_reminders = models.BooleanField(default=True)
    email_claim_updates = models.BooleanField(default=True)
    email_marketing = models.BooleanField(default=False)

    # SMS preferences
    sms_policy_updates = models.BooleanField(default=True)
    sms_payment_reminders = models.BooleanField(default=True)
    sms_claim_updates = models.BooleanField(default=True)

    # WhatsApp preferences
    whatsapp_enabled = models.BooleanField(default=False)

    # In-app preferences
    in_app_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_preferences'

    def __str__(self):
        return f"Notification preferences for {self.user.email}"
