import secrets
import string

def generate_short_code(length=7):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))