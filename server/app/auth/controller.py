from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from keycloak.exceptions import KeycloakAuthenticationError
from jose import jwt, JWTError, ExpiredSignatureError
from app.auth.keycloak import keycloak_openid, get_public_key
from app.auth.auth_schema import TokenResponse, UserInfo
from app.config import settings

class AuthController:
    
    @staticmethod
    def get_current_user(credentials: HTTPAuthorizationCredentials) -> UserInfo:
        token = credentials.credentials
        try:
            public_key = get_public_key()
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=settings.KEYCLOAK_CLIENT_ID,
                options={"verify_exp": True}
            )
            return UserInfo(
                sub=payload["sub"],
                preferred_username=payload.get("preferred_username", ""),
                email=payload.get("email"),
                realm_access=payload.get("realm_access")
            )
        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except JWTError as e:
            print(e)
            raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            print(e)
            raise HTTPException(status_code=401, detail="Authentication failed")

    @staticmethod
    def refresh(refresh_token: str) -> TokenResponse:
        try:
            token = keycloak_openid.refresh_token(refresh_token)
            return TokenResponse(
                access_token=token["access_token"],
                refresh_token=token["refresh_token"]
            )
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

    @staticmethod
    def logout(credentials: HTTPAuthorizationCredentials):
        try:
            token = credentials.credentials
            payload = jwt.decode(
                token,
                get_public_key(),
                algorithms=["RS256"],
                options={"verify_exp": False}
            )
            keycloak_openid.logout(payload.get("session_state", ""))
            return {"message": "Logged out successfully"}
        except Exception:
            raise HTTPException(status_code=400, detail="Logout failed")