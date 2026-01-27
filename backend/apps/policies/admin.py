from django.contrib import admin
from .models import InsuranceCompany, PolicyCategory, PolicyType, Policy, PolicyReview


@admin.register(InsuranceCompany)
class InsuranceCompanyAdmin(admin.ModelAdmin):
    """Admin interface for InsuranceCompany model"""

    list_display = ('name', 'code', 'is_active', 'rating', 'total_policies', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'code', 'email')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('name', 'code', 'logo')}),
        ('Contact Information', {'fields': ('email', 'phone', 'website', 'address')}),
        ('Status & Rating', {'fields': ('is_active', 'rating', 'total_policies')}),
        ('Description', {'fields': ('description',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(PolicyCategory)
class PolicyCategoryAdmin(admin.ModelAdmin):
    """Admin interface for PolicyCategory model"""

    list_display = ('name', 'slug', 'display_order', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('name', 'slug', 'icon')}),
        ('Content', {'fields': ('description',)}),
        ('Status', {'fields': ('is_active', 'display_order')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(PolicyType)
class PolicyTypeAdmin(admin.ModelAdmin):
    """Admin interface for PolicyType model"""

    list_display = ('name', 'category', 'company', 'premium_amount', 'is_active', 'created_at')
    list_filter = ('category', 'company', 'is_active', 'created_at')
    search_fields = ('name', 'company__name', 'category__name')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('name', 'category', 'company')}),
        ('Description', {'fields': ('description', 'short_description')}),
        ('Pricing', {'fields': ('premium_amount', 'currency')}),
        ('Coverage Details', {'fields': ('coverage_amount', 'coverage_details', 'features', 'exclusions')}),
        ('Requirements', {'fields': ('requirements',)}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    """Admin interface for Policy model"""

    list_display = ('policy_number', 'user', 'policy_type', 'status', 'premium_amount', 'start_date', 'end_date')
    list_filter = ('status', 'policy_type__category', 'start_date', 'end_date', 'created_at')
    search_fields = ('policy_number', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('policy_number', 'created_at', 'updated_at')
    date_hierarchy = 'start_date'

    fieldsets = (
        (None, {'fields': ('policy_number', 'user', 'policy_type')}),
        ('Policy Details', {'fields': ('status', 'premium_amount', 'coverage_amount', 'currency')}),
        ('Dates', {'fields': ('start_date', 'end_date', 'issued_at', 'activated_at', 'cancelled_at')}),
        ('Payment', {'fields': ('payment_frequency', 'auto_renewal')}),
        ('Additional Data', {'fields': ('policy_data', 'beneficiaries', 'terms_conditions')}),
        ('Cancellation', {'fields': ('cancellation_reason',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'policy_type', 'policy_type__company', 'policy_type__category')


@admin.register(PolicyReview)
class PolicyReviewAdmin(admin.ModelAdmin):
    """Admin interface for PolicyReview model"""

    list_display = ('policy', 'user', 'rating', 'is_verified', 'created_at')
    list_filter = ('rating', 'is_verified', 'created_at')
    search_fields = ('policy__policy_number', 'user__email', 'comment')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('policy', 'user', 'rating')}),
        ('Review Content', {'fields': ('comment',)}),
        ('Status', {'fields': ('is_verified',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('policy', 'user', 'policy__policy_type')
