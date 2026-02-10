from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  PRODUCTION : bool = "False"
  DATABASE_URL : str
  MQTT_BROKER: str 
  MQTT_PORT: int
  MQTT_USER: str | None = None 
  MQTT_PASS: str | None = None 
  TOPIC_PREFIX: str ="factory/sensors/+/data"


  model_config = SettingsConfigDict(

    # Load environment variables from .env
    env_file="../.env",

    # If a variable is empty in the .env file, ignore it and use the default value
    env_ignore_empty=True, 
    
    # Allow and ignore extra environment variables not defined in this class
    extra="ignore"
  )

settings = Settings()