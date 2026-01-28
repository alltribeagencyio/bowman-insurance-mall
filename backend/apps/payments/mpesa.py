"""
M-Pesa Daraja API Integration Service
Handles STK Push, payment callbacks, and transaction verification
"""

import base64
import requests
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class MpesaService:
    """
    Service class for M-Pesa Daraja API integration
    Handles payment initiation, verification, and callbacks
    """

    def __init__(self):
        self.consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', '')
        self.consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', '')
        self.business_shortcode = getattr(settings, 'MPESA_SHORTCODE', '')
        self.passkey = getattr(settings, 'MPESA_PASSKEY', '')
        self.callback_url = getattr(settings, 'MPESA_CALLBACK_URL', '')
        self.api_url = getattr(settings, 'MPESA_API_URL', 'https://sandbox.safaricom.co.ke')

    def _generate_access_token(self) -> Optional[str]:
        """
        Generate OAuth access token for API authentication

        Returns:
            str: Access token or None if failed
        """
        try:
            api_url = f"{self.api_url}/oauth/v1/generate?grant_type=client_credentials"

            # Create basic auth header
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()

            headers = {
                'Authorization': f'Basic {encoded_credentials}'
            }

            response = requests.get(api_url, headers=headers, timeout=30)
            response.raise_for_status()

            result = response.json()
            return result.get('access_token')

        except Exception as e:
            logger.error(f"Failed to generate M-Pesa access token: {str(e)}")
            return None

    def _generate_password(self) -> str:
        """
        Generate password for STK Push request

        Returns:
            str: Base64 encoded password
        """
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{self.business_shortcode}{self.passkey}{timestamp}"
        return base64.b64encode(data_to_encode.encode()).decode()

    def _format_phone_number(self, phone: str) -> str:
        """
        Format phone number to required format (254XXXXXXXXX)

        Args:
            phone: Phone number in various formats

        Returns:
            str: Formatted phone number
        """
        # Remove spaces, dashes, and plus sign
        phone = phone.replace(' ', '').replace('-', '').replace('+', '')

        # Handle different formats
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        elif phone.startswith('7') or phone.startswith('1'):
            phone = '254' + phone
        elif not phone.startswith('254'):
            phone = '254' + phone

        return phone

    def initiate_stk_push(
        self,
        phone_number: str,
        amount: float,
        account_reference: str,
        transaction_desc: str = "Payment"
    ) -> Dict[str, Any]:
        """
        Initiate STK Push payment request

        Args:
            phone_number: Customer phone number
            amount: Amount to charge
            account_reference: Reference for the transaction
            transaction_desc: Description of the transaction

        Returns:
            dict: Response with checkout_request_id or error
        """
        try:
            access_token = self._generate_access_token()
            if not access_token:
                return {
                    'success': False,
                    'message': 'Failed to authenticate with M-Pesa'
                }

            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self._generate_password()
            formatted_phone = self._format_phone_number(phone_number)

            api_url = f"{self.api_url}/mpesa/stkpush/v1/processrequest"

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                'BusinessShortCode': self.business_shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),
                'PartyA': formatted_phone,
                'PartyB': self.business_shortcode,
                'PhoneNumber': formatted_phone,
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference,
                'TransactionDesc': transaction_desc
            }

            response = requests.post(api_url, json=payload, headers=headers, timeout=30)
            result = response.json()

            if response.status_code == 200 and result.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'checkout_request_id': result.get('CheckoutRequestID'),
                    'merchant_request_id': result.get('MerchantRequestID'),
                    'message': result.get('CustomerMessage', 'Payment request sent')
                }
            else:
                return {
                    'success': False,
                    'message': result.get('errorMessage', 'Failed to initiate payment'),
                    'response_code': result.get('ResponseCode')
                }

        except requests.exceptions.Timeout:
            logger.error("M-Pesa API timeout")
            return {
                'success': False,
                'message': 'Request timeout. Please try again.'
            }
        except Exception as e:
            logger.error(f"STK Push failed: {str(e)}")
            return {
                'success': False,
                'message': f'Payment initiation failed: {str(e)}'
            }

    def query_transaction_status(self, checkout_request_id: str) -> Dict[str, Any]:
        """
        Query the status of an STK Push transaction

        Args:
            checkout_request_id: The checkout request ID from STK Push

        Returns:
            dict: Transaction status details
        """
        try:
            access_token = self._generate_access_token()
            if not access_token:
                return {
                    'success': False,
                    'message': 'Authentication failed'
                }

            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self._generate_password()

            api_url = f"{self.api_url}/mpesa/stkpushquery/v1/query"

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                'BusinessShortCode': self.business_shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id
            }

            response = requests.post(api_url, json=payload, headers=headers, timeout=30)
            result = response.json()

            if response.status_code == 200:
                return {
                    'success': True,
                    'result_code': result.get('ResultCode'),
                    'result_desc': result.get('ResultDesc'),
                    'data': result
                }
            else:
                return {
                    'success': False,
                    'message': result.get('errorMessage', 'Query failed')
                }

        except Exception as e:
            logger.error(f"Transaction query failed: {str(e)}")
            return {
                'success': False,
                'message': f'Status check failed: {str(e)}'
            }

    def process_callback(self, callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process M-Pesa callback data

        Args:
            callback_data: Callback payload from M-Pesa

        Returns:
            dict: Processed transaction details
        """
        try:
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})

            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            merchant_request_id = stk_callback.get('MerchantRequestID')
            checkout_request_id = stk_callback.get('CheckoutRequestID')

            processed_data = {
                'checkout_request_id': checkout_request_id,
                'merchant_request_id': merchant_request_id,
                'result_code': result_code,
                'result_desc': result_desc,
                'success': result_code == 0
            }

            # Extract callback metadata if payment was successful
            if result_code == 0:
                callback_metadata = stk_callback.get('CallbackMetadata', {})
                items = callback_metadata.get('Item', [])

                for item in items:
                    name = item.get('Name')
                    value = item.get('Value')

                    if name == 'Amount':
                        processed_data['amount'] = value
                    elif name == 'MpesaReceiptNumber':
                        processed_data['mpesa_receipt'] = value
                    elif name == 'TransactionDate':
                        processed_data['transaction_date'] = value
                    elif name == 'PhoneNumber':
                        processed_data['phone_number'] = value

            return processed_data

        except Exception as e:
            logger.error(f"Callback processing failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def validate_transaction(
        self,
        mpesa_receipt: str,
        amount: float,
        phone_number: str
    ) -> bool:
        """
        Validate a transaction by checking its details

        Args:
            mpesa_receipt: M-Pesa receipt number
            amount: Expected amount
            phone_number: Expected phone number

        Returns:
            bool: True if transaction is valid
        """
        # In production, you would query M-Pesa API to verify
        # For now, basic validation
        return bool(mpesa_receipt and amount > 0 and phone_number)


# Singleton instance
mpesa_service = MpesaService()
