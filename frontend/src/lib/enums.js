export const SensorType = {
  TEMPERATURE: "Temperature",
  HUMIDITY: "Humidity",
  GAZ: "Gaz",
  PRESSURE: "Pressure",
  SMOKE: "Smoke",
};

export const UserRole = {
  ADMIN: "admin",
  TECHNICIAN: "technician",
  ANALYST: "analyst",
  VIEWER: "viewer",
};

export const DeviceStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  MAINTENANCE: "Maintenance",
};

export const Units = {
  CELSIUS: "°C",
  PERCENTAGE: "%",
  HECTOPASCAL: "hPa",
  PARTS_PER_MILLION: "ppm",
};

export const SensorUnit = {
  [SensorType.TEMPERATURE]: Units.CELSIUS,
  [SensorType.HUMIDITY]: Units.PERCENTAGE,
  [SensorType.GAZ]: Units.PARTS_PER_MILLION,
  [SensorType.PRESSURE]: Units.HECTOPASCAL,
  [SensorType.SMOKE]: Units.PARTS_PER_MILLION,
};
