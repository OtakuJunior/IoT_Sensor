from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
  PRODUCTION : bool = "False"
  DATABASE_URL : str
  MQTT_BROKER: str 
  MQTT_PORT: int
  MQTT_USER: str | None = None 
  MQTT_PASS: str | None = None 
  TOPIC_PREFIX: str ="factory/sensors/+/data"
  KEYCLOAK_SERVER_URL: str
  KEYCLOAK_REALM: str
  KEYCLOAK_CLIENT_ID: str
  KEYCLOAK_CLIENT_SECRET: str
  SEED_USERNAME: str
  SEED_PASSWORD: str
  REDIS_URL: str

  model_config = SettingsConfigDict(

    # Load environment variables from .env
    env_file = Path(__file__).parent.parent / ".env",

    # If a variable is empty in the .env file, ignore it and use the default value
    env_ignore_empty=True, 
    
    # Allow and ignore extra environment variables not defined in this class
    extra="ignore"
  )

settings = Settings()