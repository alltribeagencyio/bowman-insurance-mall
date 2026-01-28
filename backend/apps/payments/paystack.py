"""
Paystack API Integration Service
Handles card payment initialization, verification, and webhooks
"""

import requests
import hmac
import hashlib
from django.conf import settings
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class PaystackService:
    """
    Service class for Paystack payment integration
    Handles card payments, verification, and webhooks
    """

    def __init__(self):
        self.secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        self.public_key = getattr(settings, 'PAYSTACK_PUBLIC_KEY', '')
        self.webhook_secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', '')
        self.api_url = 'https://api.paystack.co'

    def _get_headers(self) -> Dict[str, str]:
        """
        Get headers for API requests

        Returns:
            dict: Request headers with authorization
        """
        return {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json'
        }

    def initialize_transaction(
        self,
        email: str,
        amount: float,
        reference: str,
        callback_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Initialize a payment transaction

        Args:
            email: Customer email
            amount: Amount in KES (will be converted to kobo/cents)
            reference: Unique transaction reference
            callback_url: URL to redirect after payment
            metadata: Additional transaction metadata

        Returns:
            dict: Response with authorization_url and access_code
        """
        try:
            url = f"{self.api_url}/transaction/initialize"

            # Paystack expects amount in kobo (multiply by 100)
            payload = {
                'email': email,
                'amount': int(amount * 100),
                'reference': reference,
                'currency': 'KES'
            }

            if callback_url:
                payload['callback_url'] = callback_url

            if metadata:
                payload['metadata'] = metadata

            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )

            result = response.json()

            if result.get('status') and result.get('data'):
                data = result['data']
                return {
                    'success': True,
                    'authorization_url': data.get('authorization_url'),
                    'access_code': data.get('access_code'),
                    'reference': data.get('reference'),
                    'message': result.get('message', 'Transaction initialized')
                }
            else:
                return {
                    'success': False,
                    'message': result.get('message', 'Failed to initialize transaction')
                }

        except requests.exceptions.Timeout:
            logger.error("Paystack API timeout")
            return {
                'success': False,
                'message': 'Request timeout. Please try again.'
            }
        except Exception as e:
            logger.error(f"Transaction initialization failed: {str(e)}")
            return {
                'success': False,
                'message': f'Payment initiation failed: {str(e)}'
            }

    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """
        Verify a transaction using its reference

        Args:
            reference: Transaction reference to verify

        Returns:
            dict: Transaction verification details
        """
        try:
            url = f"{self.api_url}/transaction/verify/{reference}"

            response = requests.get(
                url,
                headers=self._get_headers(),
                timeout=30
            )

            result = response.json()

            if result.get('status') and result.get('data'):
                data = result['data']

                return {
                    'success': True,
                    'verified': data.get('status') == 'success',
                    'amount': data.get('amount', 0) / 100,  # Convert from kobo to KES
                    'reference': data.get('reference'),
                    'paid_at': data.get('paid_at'),
                    'channel': data.get('channel'),
                    'currency': data.get('currency'),
                    'customer': data.get('customer'),
                    'authorization': data.get('authorization'),
                    'metadata': data.get('metadata'),
                    'message': result.get('message')
                }
            else:
                return {
                    'success': False,
                    'verified': False,
                    'message': result.get('message', 'Verification failed')
                }

        except Exception as e:
            logger.error(f"Transaction verification failed: {str(e)}")
            return {
                'success': False,
                'verified': False,
                'message': f'Verification failed: {str(e)}'
            }

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """
        Verify webhook signature to ensure it's from Paystack

        Args:
            payload: Raw request body
            signature: X-Paystack-Signature header value

        Returns:
            bool: True if signature is valid
        """
        try:
            computed_signature = hmac.new(
                self.webhook_secret.encode(),
                payload,
                hashlib.sha512
            ).hexdigest()

            return hmac.compare_digest(computed_signature, signature)

        except Exception as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            return False

    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process Paystack webhook event

        Args:
            webhook_data: Webhook payload from Paystack

        Returns:
            dict: Processed event details
        """
        try:
            event = webhook_data.get('event')
            data = webhook_data.get('data', {})

            processed_data = {
                'event': event,
                'reference': data.get('reference'),
                'status': data.get('status'),
                'amount': data.get('amount', 0) / 100,  # Convert from kobo
                'currency': data.get('currency'),
                'paid_at': data.get('paid_at'),
                'customer_email': data.get('customer', {}).get('email'),
                'channel': data.get('channel')
            }

            # Handle different event types
            if event == 'charge.success':
                processed_data['success'] = True
                processed_data['transaction_completed'] = True
            elif event == 'charge.failed':
                processed_data['success'] = False
                processed_data['failure_reason'] = data.get('gateway_response')
            elif event == 'transfer.success':
                processed_data['success'] = True
                processed_data['transfer_completed'] = True

            # Extract authorization details if available
            if 'authorization' in data:
                auth = data['authorization']
                processed_data['authorization'] = {
                    'card_type': auth.get('card_type'),
                    'last4': auth.get('last4'),
                    'exp_month': auth.get('exp_month'),
                    'exp_year': auth.get('exp_year'),
                    'bank': auth.get('bank'),
                    'reusable': auth.get('reusable')
                }

            # Extract metadata
            if 'metadata' in data:
                processed_data['metadata'] = data['metadata']

            return processed_data

        except Exception as e:
            logger.error(f"Webhook processing failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def charge_authorization(
        self,
        authorization_code: str,
        email: str,
        amount: float,
        reference: str
    ) -> Dict[str, Any]:
        """
        Charge a previously authorized card

        Args:
            authorization_code: Authorization code from previous transaction
            email: Customer email
            amount: Amount to charge
            reference: Unique transaction reference

        Returns:
            dict: Charge response
        """
        try:
            url = f"{self.api_url}/transaction/charge_authorization"

            payload = {
                'authorization_code': authorization_code,
                'email': email,
                'amount': int(amount * 100),  # Convert to kobo
                'reference': reference,
                'currency': 'KES'
            }

            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )

            result = response.json()

            if result.get('status'):
                data = result.get('data', {})
                return {
                    'success': True,
                    'charged': data.get('status') == 'success',
                    'reference': data.get('reference'),
                    'amount': data.get('amount', 0) / 100,
                    'message': result.get('message')
                }
            else:
                return {
                    'success': False,
                    'message': result.get('message', 'Charge failed')
                }

        except Exception as e:
            logger.error(f"Authorization charge failed: {str(e)}")
            return {
                'success': False,
                'message': f'Charge failed: {str(e)}'
            }

    def create_refund(
        self,
        reference: str,
        amount: Optional[float] = None,
        currency: str = 'KES'
    ) -> Dict[str, Any]:
        """
        Create a refund for a transaction

        Args:
            reference: Original transaction reference
            amount: Amount to refund (full refund if None)
            currency: Currency code

        Returns:
            dict: Refund response
        """
        try:
            url = f"{self.api_url}/refund"

            payload = {
                'transaction': reference,
                'currency': currency
            }

            if amount:
                payload['amount'] = int(amount * 100)  # Convert to kobo

            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )

            result = response.json()

            if result.get('status'):
                data = result.get('data', {})
                return {
                    'success': True,
                    'refund_status': data.get('status'),
                    'refunded_amount': data.get('amount', 0) / 100,
                    'message': result.get('message')
                }
            else:
                return {
                    'success': False,
                    'message': result.get('message', 'Refund failed')
                }

        except Exception as e:
            logger.error(f"Refund creation failed: {str(e)}")
            return {
                'success': False,
                'message': f'Refund failed: {str(e)}'
            }

    def list_transactions(
        self,
        page: int = 1,
        per_page: int = 50,
        customer: Optional[str] = None,
        status: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List transactions with optional filters

        Args:
            page: Page number
            per_page: Results per page
            customer: Filter by customer ID
            status: Filter by status (success, failed, abandoned)
            from_date: Start date (YYYY-MM-DD)
            to_date: End date (YYYY-MM-DD)

        Returns:
            dict: List of transactions
        """
        try:
            url = f"{self.api_url}/transaction"

            params = {
                'page': page,
                'perPage': per_page
            }

            if customer:
                params['customer'] = customer
            if status:
                params['status'] = status
            if from_date:
                params['from'] = from_date
            if to_date:
                params['to'] = to_date

            response = requests.get(
                url,
                params=params,
                headers=self._get_headers(),
                timeout=30
            )

            result = response.json()

            if result.get('status'):
                data = result.get('data', [])
                meta = result.get('meta', {})

                # Convert amounts from kobo to KES
                for transaction in data:
                    transaction['amount'] = transaction.get('amount', 0) / 100

                return {
                    'success': True,
                    'transactions': data,
                    'total': meta.get('total', 0),
                    'page': meta.get('page', 1),
                    'per_page': meta.get('perPage', per_page)
                }
            else:
                return {
                    'success': False,
                    'message': result.get('message', 'Failed to fetch transactions')
                }

        except Exception as e:
            logger.error(f"Transaction listing failed: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to fetch transactions: {str(e)}'
            }


# Singleton instance
paystack_service = PaystackService()
