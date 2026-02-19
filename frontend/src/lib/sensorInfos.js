export const getSensorInfos = (sensors, sensorId) => {
  const sensorInfos = sensors.find((s) => s.id === sensorId);
  return sensorInfos;
};
