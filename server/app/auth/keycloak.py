from keycloak import KeycloakOpenID
from app.config import settings

keycloak_openid = KeycloakOpenID(
    server_url=settings.KEYCLOAK_SERVER_URL,
    realm_name=settings.KEYCLOAK_REALM,
    client_id=settings.KEYCLOAK_CLIENT_ID,
    client_secret_key=settings.KEYCLOAK_CLIENT_SECRET
)

def get_public_key() -> str:
    try:
        return keycloak_openid.public_key()
    except Exception as e:
        print(e)

