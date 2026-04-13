import pytest
from unittest.mock import patch, MagicMock
from fastapi.security import HTTPAuthorizationCredentials
from fastapi import HTTPException
from jose import ExpiredSignatureError, JWTError
from app.auth.controller import AuthController
from app.auth.dependencies import get_current_user, require_admin, require_master
from app.services.enums import UserRole
from app.main import app
from app.auth.dependencies import get_current_user
# ================================
# AuthController.get_current_user tests
# ================================

def test_get_current_user_success():
    """Valid token should return a UserInfo with decoded payload"""
    mock_payload = {
        "sub": "user-uuid-123",
        "preferred_username": "john.doe",
        "email": "john@example.com",
        "realm_access": {"roles": ["Admin"]},
        "exp": 9999999999
    }
    mock_credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="fake_valid_token"
    )
    with patch("app.auth.controller.get_public_key", return_value="fake_key"), \
    patch("jose.jwt.decode", return_value=mock_payload):
        result = AuthController.get_current_user(mock_credentials)
        assert result.id == "user-uuid-123"
        assert result.name == "john.doe"
        assert result.email == "john@example.com"

# ================================
# AuthController.refresh tests
# ================================

def test_refresh_success():
    """Valid refresh token should return a new TokenResponse"""
    mock_token = {
        "access_token": "new_access_token",
        "refresh_token": "new_refresh_token"
    }
    with patch("app.auth.controller.keycloak_openid.refresh_token", return_value=mock_token):
        result = AuthController.refresh("valid_refresh_token")
        assert result.access_token == "new_access_token"

def test_refresh_invalid_token():
    """Invalid or expired refresh token should return 401"""
    with patch("app.auth.controller.keycloak_openid.refresh_token", side_effect=Exception):
        with pytest.raises(HTTPException) as exc:
            AuthController.refresh("invalid_refresh_token")
        assert exc.value.status_code == 401

# ================================
# Route (endpoint) tests
# ================================

def test_me_endpoint_without_token(test_client):
    """GET /auth/me without a token should return 403"""
    app.dependency_overrides.pop(get_current_user, None)
    response = test_client.get("/auth/me")
    assert response.status_code == 401

def test_logout_endpoint(test_client):
    """POST /auth/logout with valid token should return 200"""
    mock_payload = {"session_state": "fake_session"}
    with patch("app.auth.controller.get_public_key", return_value="fake_key"), \
         patch("app.auth.controller.jwt.decode", return_value=mock_payload), \
         patch("app.auth.controller.keycloak_openid.logout", return_value=None):
        response = test_client.post(
            "/auth/logout",
            headers={"Authorization": "Bearer fake_token"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Logged out successfully"

# ================================
# dependencies.get_current_user tests
# ================================

def test_dependency_get_current_user_success(db_session):
    """Valid token + existing user in DB should return the user"""
    mock_user = MagicMock()
    mock_user.role = UserRole.ADMIN
    mock_user.keycloak_id = "user-uuid-123"

    mock_credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="fake_valid_token"
    )
    mock_user_info = MagicMock()
    mock_user_info.id = "user-uuid-123"

    with patch("app.auth.dependencies.AuthController.get_current_user", return_value=mock_user_info), \
         patch("app.crud.user.get_user", return_value=mock_user):
        result = get_current_user(credentials=mock_credentials, db=db_session)
        assert result.keycloak_id == "user-uuid-123"
        assert result.role == UserRole.ADMIN


# ================================
# dependencies.require_admin tests
# ================================

def test_require_admin_success():
    """User with Admin role should pass require_admin"""
    mock_user = MagicMock()
    mock_user.role = "ADMIN"  # string comparison in dependencies.py
    result = require_admin(user=mock_user)
    assert result.role == "ADMIN"

def test_require_admin_with_master():
    """User with Master role should also pass require_admin"""
    mock_user = MagicMock()
    mock_user.role = "MASTER"
    result = require_admin(user=mock_user)
    assert result.role == "MASTER"

def test_require_admin_forbidden():
    """User with Analyst role should be rejected by require_admin"""
    mock_user = MagicMock()
    mock_user.role = "Analyst"
    with pytest.raises(HTTPException) as exc:
        require_admin(user=mock_user)
    assert exc.value.status_code == 403
    assert exc.value.detail == "Admin access required"

# ================================
# dependencies.require_master tests
# ================================

def test_require_master_success():
    """User with Master role should pass require_master"""
    mock_user = MagicMock()
    mock_user.role = "MASTER"
    result = require_master(user=mock_user)
    assert result.role == "MASTER"

def test_require_master_forbidden():
    """User with Admin role should be rejected by require_master"""
    mock_user = MagicMock()
    mock_user.role = "ADMIN"
    with pytest.raises(HTTPException) as exc:
        require_master(user=mock_user)
    assert exc.value.status_code == 403
    assert exc.value.detail == "Master access required"