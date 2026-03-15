from sqlalchemy import text
from app.database import engine
from datetime import datetime
import math

def init_timescale():
      with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
        connection.execute(text("SELECT create_hypertable('sensor_data', 'time', if_not_exists => TRUE, migrate_data => TRUE);"))        


def init_continuous_aggregates() :
    with engine.begin() as connection:
      connection.execute(text("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS cagg_hour
        WITH (timescaledb.continuous) AS
        SELECT
          sensor_id,
          time_bucket('1 hour', time) AS bucket,
          AVG(value) AS avg,
          MIN(value) AS min,
          MAX(value) AS max,
          COUNT(*) AS count
        FROM sensor_data
        GROUP BY sensor_id, bucket
        WITH NO DATA;
        """))
         
      connection.execute(text("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS cagg_day
        WITH (timescaledb.continuous) AS
        SELECT
          sensor_id,
          time_bucket('1 day', time) AS bucket,
          AVG(value) AS avg,
          MIN(value) AS min,
          MAX(value) AS max,
          COUNT(*) AS count
        FROM sensor_data
        GROUP BY sensor_id, bucket
        WITH NO DATA;
      """))

      connection.execute(text("""
        SELECT add_continuous_aggregate_policy('cagg_hour',
          start_offset => '1 month',
          end_offset => INTERVAL '1 h',
          schedule_interval => INTERVAL '1 h',
          if_not_exists => TRUE);
        """))
      
      connection.execute(text("""
        SELECT add_continuous_aggregate_policy('cagg_day',
          start_offset => '1 month',
          end_offset => INTERVAL '1 day',
          schedule_interval => INTERVAL '1 day',
          if_not_exists => TRUE);
        """))
      
      connection.execute(text("""
        create index if not exists idx_cagg_hour on cagg_hour(sensor_id, bucket DESC);
        create index if not exists idx_cagg_hour on cagg_day(sensor_id, bucket DESC);
      """))


# Manual refresh 
def refresh_cagg(from_time : datetime | None = None, end_time : datetime | None = None):
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as connection:
      connection.execute(text("call refresh_continuous_aggregate('cagg_hour', :from_time, :end_time);"), {"from_time" : from_time, "end_time" : end_time})
      connection.execute(text("call refresh_continuous_aggregate('cagg_day', :from_time, :end_time);"), {"from_time" : from_time, "end_time" : end_time})

def downsample(data, max_points=150):
    if len(data) <= max_points:
        return data
    stride = math.ceil(len(data) / max_points)
    result = data[::stride]
    if result[-1] != data[-1]:
        result = list(result) + [data[-1]]
    return result

def query_series(sensor_id: str, bucket_ms: int = 0, from_time: datetime | None = None, end_time: datetime | None = None):
    if bucket_ms and bucket_ms >= 86400000:
        with engine.begin() as connection:
            rows = connection.execute(text("""
                SELECT bucket as ts, avg, min, max, count 
                FROM cagg_day 
                WHERE sensor_id = :sensor_id AND bucket 
                BETWEEN :from_time AND :end_time 
                ORDER BY bucket ASC;
            """), {"sensor_id": sensor_id, "from_time": from_time, "end_time": end_time}).fetchall()
            return downsample(rows)

    elif bucket_ms and bucket_ms >= 3600000:
        with engine.begin() as connection:
            rows = connection.execute(text("""
                SELECT bucket as ts, avg, min, max, count 
                FROM cagg_hour 
                WHERE sensor_id = :sensor_id AND bucket 
                BETWEEN :from_time AND :end_time 
                ORDER BY bucket ASC;
            """), {"sensor_id": sensor_id, "from_time": from_time, "end_time": end_time}).fetchall()
            return downsample(rows)

    elif bucket_ms and bucket_ms > 0:
        seconds = int(bucket_ms / 1000)
        with engine.connect() as connection:
            rows = connection.execute(text(f"""
                SELECT time_bucket('{seconds} seconds'::interval, time) AS ts,
                count(*) AS count, avg(value) AS avg, min(value) AS min, max(value) AS max 
                FROM sensor_data 
                WHERE sensor_id = :sensor_id 
                AND time BETWEEN :from_time AND :end_time 
                GROUP BY ts 
                ORDER BY ts ASC
            """), {"sensor_id": sensor_id, "from_time": from_time, "end_time": end_time}).fetchall()
            return downsample(rows)

    else:
        with engine.connect() as connection:
            rows = connection.execute(text("""
                SELECT extract(epoch FROM time)*1000 AS ts, value 
                FROM sensor_data
                WHERE sensor_id = :sensor_id 
                AND time BETWEEN :from_time AND :end_time 
                ORDER BY time ASC
                LIMIT 100000;
            """), {"sensor_id": sensor_id, "from_time": from_time, "end_time": end_time}).fetchall()
            return downsample(rows)

    return []