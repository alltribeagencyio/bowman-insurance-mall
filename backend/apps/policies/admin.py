from django.contrib import admin
from .models import InsuranceCompany, PolicyCategory, PolicyType, Policy, PolicyReview


@admin.register(InsuranceCompany)
class InsuranceCompanyAdmin(admin.ModelAdmin):
    """Admin interface for InsuranceCompany model"""

    list_display = ('name', 'is_active', 'rating', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'contact_email', 'contact_phone')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_active',)

    fieldsets = (
        (None, {'fields': ('name', 'logo')}),
        ('Contact Information', {'fields': ('contact_email', 'contact_phone', 'website')}),
        ('Details', {'fields': ('description', 'rating')}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(PolicyCategory)
class PolicyCategoryAdmin(admin.ModelAdmin):
    """Admin interface for PolicyCategory model"""

    list_display = ('name', 'slug', 'icon', 'display_order', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('display_order', 'is_active')

    fieldsets = (
        (None, {'fields': ('name', 'slug', 'icon')}),
        ('Content', {'fields': ('description',)}),
        ('Status', {'fields': ('is_active', 'display_order')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(PolicyType)
class PolicyTypeAdmin(admin.ModelAdmin):
    """Admin interface for PolicyType model"""

    list_display = ('name', 'category', 'insurance_company', 'base_premium', 'status', 'is_featured', 'is_active', 'created_at')
    list_filter = ('status', 'category', 'insurance_company', 'is_featured', 'is_active', 'created_at')
    search_fields = ('name', 'slug', 'description', 'insurance_company__name', 'category__name')
    readonly_fields = ('slug', 'created_at', 'updated_at')
    list_editable = ('status', 'is_featured', 'is_active')
    prepopulated_fields = {}  # slug is auto-generated

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'insurance_company', 'description')
        }),
        ('Pricing & Coverage', {
            'fields': ('base_premium', 'min_coverage_amount', 'max_coverage_amount')
        }),
        ('Policy Details', {
            'fields': ('coverage_details', 'features', 'exclusions', 'requirements', 'terms_and_conditions'),
            'classes': ('collapse',)
        }),
        ('Age Requirements', {
            'fields': ('min_age', 'max_age'),
            'classes': ('collapse',)
        }),
        ('Status & Visibility', {
            'fields': ('status', 'is_active', 'is_featured')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('category', 'insurance_company')

    actions = ['make_published', 'make_draft', 'make_delisted', 'make_featured']

    def make_published(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(request, f'{updated} policy types set to Published.')
    make_published.short_description = "Set status to Published"

    def make_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} policy types set to Draft.')
    make_draft.short_description = "Set status to Draft"

    def make_delisted(self, request, queryset):
        updated = queryset.update(status='delisted')
        self.message_user(request, f'{updated} policy types set to Delisted.')
    make_delisted.short_description = "Set status to Delisted"

    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} policy types marked as Featured.')
    make_featured.short_description = "Mark as Featured"


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    """Admin interface for Policy model"""

    list_display = ('policy_number', 'user', 'policy_type', 'status', 'premium_amount', 'start_date', 'end_date', 'created_at')
    list_filter = ('status', 'policy_type__category', 'payment_frequency', 'start_date', 'end_date', 'created_at')
    search_fields = ('policy_number', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('policy_number', 'created_at', 'updated_at')
    date_hierarchy = 'start_date'

    fieldsets = (
        ('Policy Identification', {
            'fields': ('policy_number', 'user', 'policy_type', 'insurance_company')
        }),
        ('Policy Details', {
            'fields': ('status', 'premium_amount', 'coverage_amount', 'payment_frequency')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Documents', {
            'fields': ('certificate_url', 'policy_document_url'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('policy_data', 'beneficiaries'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'policy_type', 'insurance_company', 'policy_type__category')


@admin.register(PolicyReview)
class PolicyReviewAdmin(admin.ModelAdmin):
    """Admin interface for PolicyReview model"""

    list_display = ('user', 'policy_type', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__email', 'policy_type__name', 'review')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('user', 'policy_type', 'rating')}),
        ('Review Content', {'fields': ('review',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'policy_type')
