import hashlib
import hmac
import urllib.parse

class VNPay:
    def __init__(self, tmn_code, hash_secret, payment_url, return_url):
        self.tmn_code = tmn_code
        self.hash_secret = hash_secret
        self.payment_url = payment_url
        self.return_url = return_url

    def get_payment_url(self, order_id, amount, order_desc, ip_addr, create_date):
        input_data = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": self.tmn_code,
            "vnp_Amount": str(int(amount * 100)), # Amount must be multiplied by 100
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": order_id,
            "vnp_OrderInfo": order_desc,
            "vnp_OrderType": "billpayment",
            "vnp_Locale": "vn",
            "vnp_ReturnUrl": self.return_url,
            "vnp_IpAddr": ip_addr,
            "vnp_CreateDate": create_date
        }

        # Sort the keys
        input_data = dict(sorted(input_data.items()))

        # Build query string
        query_string = ''
        seq = 0
        for key, val in input_data.items():
            if seq == 1:
                query_string = query_string + "&" + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                query_string = key + '=' + urllib.parse.quote_plus(str(val))

        # Generate Hash
        hash_value = hmac.new(
            self.hash_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        payment_url = self.payment_url + "?" + query_string + '&vnp_SecureHash=' + hash_value
        return payment_url

    def validate_response(self, response_data):
        vnp_SecureHash = response_data.pop('vnp_SecureHash', '')
        # Remove vnp_SecureHashType if it exists
        if 'vnp_SecureHashType' in response_data:
            response_data.pop('vnp_SecureHashType')

        # Sort data
        input_data = dict(sorted(response_data.items()))
        
        # Build query string
        query_string = ''
        seq = 0
        for key, val in input_data.items():
            if seq == 1:
                query_string = query_string + "&" + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                query_string = key + '=' + urllib.parse.quote_plus(str(val))

        # Generate Hash
        hash_value = hmac.new(
            self.hash_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        return vnp_SecureHash == hash_value
