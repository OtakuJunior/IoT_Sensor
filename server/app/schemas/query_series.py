from pydantic import BaseModel, ConfigDict, model_validator, Field
from datetime import datetime

class QuerySeriesBase(BaseModel):
  from_time : datetime | None = None
  end_time : datetime | None = None
  limit : int | None = Field(default=None, le=10000)
  bucket_ms : int | None = Field(default=None, ge=1000)

  @model_validator(mode="after")
  def check_date(self):
    if self.from_time and self.end_time and self.from_time > self.end_time:
      raise ValueError("from date must be before end date !")
    return self
  
  model_config = ConfigDict(from_attributes=True)




