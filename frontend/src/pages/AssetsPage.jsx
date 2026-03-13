import React, { useState, useEffect, useMemo } from "react";
import { useSensor } from "../state/sensor";
import { api } from "../services/api";
import {
  SensorType,
  SensorUnit,
  AssetStatus,
  DeviceStatus,
} from "../lib/enums";
import { toast } from "react-toastify";
import { MdOutlineWarningAmber } from "react-icons/md";
import { MdOutlineClose } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState("devices");
  const [search, setSearch] = useState("");
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const sensors = useSensor((state) => state.sensors);
  const loadSensors = useSensor((state) => state.loadSensors);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [assetFormData, setAssetFormData] = useState({
    name: "",
    location_id: "",
    status: "Operational",
  });
  const [sensorFormData, setsensorFormData] = useState({
    name: "",
    sensor_type: "",
    unit: "",
    location_id: "",
    asset_id: "",
    min_critical: "",
    min_warning: "",
    max_warning: "",
    max_critical: "",
    status: "Active",
  });
  const [locationFormData, setLocationFormData] = useState({ name: "" });

  const openLocationModal = (location) => {
    setSelectedLocation(location);
    setExpandedAssetId(null);
    setIsLocationModalOpen(true);
  };
  const openSensorEditModal = (sensor) => {
    setIsEditMode(true);
    setSelectedSensorId(sensor.id);
    setsensorFormData({
      ...sensor,
      asset_id: sensor.asset_id ?? "",
      min_critical:
        sensor.min_critical !== null && sensor.min_critical !== undefined
          ? sensor.min_critical
          : "",
      min_warning:
        sensor.min_warning !== null && sensor.min_warning !== undefined
          ? sensor.min_warning
          : "",
      max_warning:
        sensor.max_warning !== null && sensor.max_warning !== undefined
          ? sensor.max_warning
          : "",
      max_critical:
        sensor.max_critical !== null && sensor.max_critical !== undefined
          ? sensor.max_critical
          : "",
    });
    setIsSensorModalOpen(true);
  };
  const openAssetEditModal = (asset) => {
    setIsEditMode(true);
    setSelectedAsset(asset);
    setAssetFormData({
      name: asset.name,
      location_id: asset.location_id ?? "",
      status: asset.status ?? "",
    });
    setIsAssetModalOpen(true);
  };

  const getLocationStats = (locationId) => {
    const totalAssets = assets.filter(
      (a) => String(a.location_id) === String(locationId)
    ).length;
    const totalDevices = sensors.filter(
      (s) => String(s.location_id) === String(locationId)
    ).length;
    return { totalAssets, totalDevices };
  };

  const handleDeleteSensor = async (sensorId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this sensor? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await api.deleteSensor(sensorId);

      toast.success("Sensor deleted successfully!", {
        theme: "colored",
      });
      await loadSensors();

      setIsSensorModalOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete the sensor.");
    }
  };
  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await api.addLocation(locationFormData);
      toast.success(
        `Location "${locationFormData.name}" created successfully!`,
        {
          theme: "colored",
        }
      );
      const locRes = await api.getLocations();
      setLocations(locRes || []);
      setIsAddLocationModalOpen(false);
      setLocationFormData({ name: "" });
    } catch (err) {
      toast.error("Failed to create location.");
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(userId);
      toast.success("User deleted successfully!");
      const userRes = await api.getUsers();
      setUsers(userRes || []);
    } catch (err) {
      console.error("Delete user failed:", err);
      toast.error("Failed to delete user.");
    }
  };

  const handleDeleteAsset = async () => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await api.deleteAsset(selectedAsset.id);
      toast.success("Asset deleted successfully!");
      const assetRes = await api.getAssets();
      setAssets(assetRes || []);
      setIsAssetModalOpen(false);
      setIsEditMode(false);
      setSelectedAsset(null);
    } catch (err) {
      toast.error("Failed to delete asset.");
      console.error("Failed to delete asset:", err);
    }
  };
  const handleSubmitAsset = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedAsset) {
        await api.updateAsset(selectedAsset.id, assetFormData);
        toast.info(`Asset "${assetFormData.name}" updated!`, {
          theme: "colored",
        });
      } else {
        await api.addAsset(assetFormData);
        toast.success(`Asset "${assetFormData.name}" created successfully!`, {
          theme: "colored",
        });
      }
      const assetRes = await api.getAssets();
      setAssets(assetRes || []);
      setIsAssetModalOpen(false);
      setIsEditMode(false);
      setSelectedAsset(null);
    } catch (err) {
      toast.error(
        isEditMode ? "Failed to update asset." : "Failed to create asset."
      );
      console.error(err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isSensorModalOpen ? "hidden" : "unset";
    document.body.style.paddingRight = isSensorModalOpen ? "15px" : "0px";
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isSensorModalOpen]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [locRes, assetRes, userRes] = await Promise.all([
          api.getLocations(),
          api.getAssets(),
          api.getUsers ? api.getUsers() : Promise.resolve([]),
        ]);
        if (isMounted) {
          setLocations(locRes || []);
          setAssets(assetRes || []);
          setUsers(userRes || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, []);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    if (activeTab === "devices") {
      return (sensors || []).filter((s) => {
        const assetObj = assets.find((a) => a.id === s.asset_id);
        const locationObj = locations.find((l) => l.id === s.location_id);
        return (
          s.name?.toLowerCase().includes(q) ||
          s.id?.toLowerCase().includes(q) ||
          assetObj?.name?.toLowerCase().includes(q) ||
          locationObj?.name?.toLowerCase().includes(q)
        );
      });
    }
    if (activeTab === "locations") {
      return locations.filter((l) => l.name?.toLowerCase().includes(q));
    }
    if (activeTab === "assets") {
      return assets.filter((a) => {
        const locationObj = locations.find((l) => l.id === a.location_id);
        return (
          a.name?.toLowerCase().includes(q) ||
          a.id?.toLowerCase().includes(q) ||
          locationObj?.name?.toLowerCase().includes(q)
        );
      });
    }
    if (activeTab === "users") {
      return users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    return [];
  }, [activeTab, search, sensors, locations, users, assets]);

  const handleSubmitDevice = async (e) => {
    e.preventDefault();
    const payload = {
      ...sensorFormData,
      asset_id: sensorFormData.asset_id === "" ? null : sensorFormData.asset_id,
      min_critical:
        sensorFormData.min_critical === ""
          ? null
          : parseFloat(sensorFormData.min_critical),
      min_warning:
        sensorFormData.min_warning === ""
          ? null
          : parseFloat(sensorFormData.min_warning),
      max_warning:
        sensorFormData.max_warning === ""
          ? null
          : parseFloat(sensorFormData.max_warning),
      max_critical:
        sensorFormData.max_critical === ""
          ? null
          : parseFloat(sensorFormData.max_critical),
    };

    try {
      if (isEditMode && selectedSensorId) {
        await api.updateSensor(selectedSensorId, payload);
        toast.info(`Sensor "${payload.name}" updated!`, { theme: "colored" });
      } else {
        await api.addSensor(payload);
        toast.success(`Sensor "${payload.name}" created successfully!`, {
          theme: "colored",
        });
      }

      await loadSensors();
      setIsSensorModalOpen(false);

      setIsEditMode(false);
      setSelectedSensorId(null);
    } catch (err) {
      toast.error(
        isEditMode ? "Failed to update sensor." : "Failed to create sensor."
      );
      console.error(err);
    }
  };

  const thresholdsValidation = useMemo(() => {
    const { min_critical, min_warning, max_warning, max_critical } =
      sensorFormData;

    const minCrit = min_critical !== "" ? parseFloat(min_critical) : null;
    const minWarn = min_warning !== "" ? parseFloat(min_warning) : null;
    const maxWarn = max_warning !== "" ? parseFloat(max_warning) : null;
    const maxCrit = max_critical !== "" ? parseFloat(max_critical) : null;

    let error = "";

    if (minCrit !== null && minWarn !== null && minCrit >= minWarn) {
      error = "Min Critical must be lower than Min Warning";
    } else if (minWarn !== null && maxWarn !== null && minWarn >= maxWarn) {
      error = "Min Warning must be lower than Max Warning";
    } else if (maxWarn !== null && maxCrit !== null && maxWarn >= maxCrit) {
      error = "Max Warning must be lower than Max Critical";
    }
    const hasSensorInfos =
      !sensorFormData.name ||
      !sensorFormData.location_id ||
      !sensorFormData.sensor_type;
    return {
      isValid: error === "" && !hasSensorInfos,
      errorMessage: error,
    };
  }, [sensorFormData]);

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500 font-medium">
        Loading assets management...
      </div>
    );

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Asset Management
          </h1>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["devices", "locations", "assets", "users"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === t
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          className="w-full md:w-80 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {activeTab !== "users" && (
            <button
              onClick={() => {
                if (activeTab === "devices") {
                  setIsEditMode(false);
                  setSelectedSensorId(null);
                  setsensorFormData({
                    name: "",
                    sensor_type: "",
                    unit: "",
                    location_id: "",
                    asset_id: "",
                    min_critical: "",
                    min_warning: "",
                    max_warning: "",
                    max_critical: "",
                    status: "Active",
                  });
                  setIsSensorModalOpen(true);
                }
                if (activeTab === "locations") {
                  setLocationFormData({ name: "" });
                  setIsAddLocationModalOpen(true);
                }
                if (activeTab === "assets") {
                  setSelectedAsset(null);
                  setAssetFormData({
                    name: "",
                    location_id: "",
                    status: AssetStatus.OPERATIONAL,
                  });
                  setIsAssetModalOpen(true);
                }
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              + Add {activeTab.slice(0, -1)}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {activeTab === "devices" && (
                <>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Device
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    ID / Type
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Location
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Asset
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase ">
                    Action
                  </th>
                </>
              )}
              {activeTab === "locations" && (
                <>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Location Name
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    ID
                  </th>
                  <th className="p-4 text-xs  text-center font-bold text-slate-400 uppercase">
                    Total Assets
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Total Devices
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">
                    Action
                  </th>
                </>
              )}
              {activeTab === "assets" && (
                <>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Asset Name
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    ID
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Location
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Total devices
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Action
                  </th>
                </>
              )}
              {activeTab === "users" && (
                <>
                  <th className="p-4 w-10"></th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    User
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Email
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Phone Number
                  </th>
                  <th className="p-4 text-xs text-center font-bold text-slate-400 uppercase">
                    Role
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                {activeTab === "devices" && (
                  <>
                    <td className="p-4 font-semibold text-slate-700 text-center">
                      {item.name}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-mono text-slate-500 text-center">
                        {item.id}
                      </div>
                      <div className="text-sm text-blue-500 font-bold uppercase text-center">
                        {item.sensor_type}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 text-center">
                      {item.status}
                    </td>
                    <td className="p-4 text-sm text-slate-600 text-center">
                      {locations.find((l) => l.id === item.location_id)?.name ||
                        "Unassigned"}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">
                          {assets.find((a) => a.id === item.asset_id)?.name ||
                            "No Asset Linked"}
                        </span>
                      </div>
                    </td>
                  </>
                )}
                {activeTab === "locations" && (
                  <>
                    <td className="p-4 font-semibold text-slate-700 text-center">
                      {item.name}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500 text-center">
                      {item.id}
                    </td>
                    {(() => {
                      const total = getLocationStats(item.id);
                      return (
                        <>
                          <td className="p-4 text-sm text-center text-slate-600">
                            {total.totalAssets}
                          </td>
                          <td className="p-4 text-sm text-center text-slate-600">
                            {total.totalDevices}
                          </td>
                        </>
                      );
                    })()}
                  </>
                )}
                {activeTab === "assets" && (
                  <>
                    <td className="p-4 font-semibold text-slate-700 text-center">
                      {item.name}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500 text-center">
                      {item.id}
                    </td>
                    <td className="p-4 text-sm text-slate-600 text-center">
                      {locations.find((l) => l.id === item.location_id)?.name ||
                        "Unassigned"}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 text-center">
                      {item.status}
                    </td>
                    <td className="p-4 text-sm text-center text-slate-600">
                      {
                        sensors.filter(
                          (s) => String(s.asset_id) === String(item.id)
                        ).length
                      }{" "}
                      sensor(s)
                    </td>
                  </>
                )}
                {activeTab === "users" && (
                  <>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        className="text-slate-300 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100"
                        title="Delete User"
                      >
                        <MdDeleteOutline size={20} className="text-red-600" />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700 text-center">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400 text-center">
                        {item.id}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500 text-center">
                      {item.email}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500 text-center">
                      {item.phone_number}
                    </td>
                    <td className="p-4 text-center">
                      <span className="p-4 text-sm font-mono text-slate-500">
                        {item.role || "User"}
                      </span>
                    </td>
                  </>
                )}
                {activeTab !== "users" && (
                  <td className="p-4 text-center">
                    <button
                      className="text-blue-600 hover:underline text-sm font-bold"
                      onClick={() => {
                        if (activeTab === "devices") openSensorEditModal(item);
                        if (activeTab === "locations") openLocationModal(item);
                        if (activeTab === "assets") {
                          openAssetEditModal(item);
                        }
                      }}
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="p-10 text-center text-slate-400 italic text-sm">
            No items found in this category.
          </div>
        )}
      </div>

      {/*=================== SENSOR MODAL =======================*/}
      {isSensorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <div className="grid grid-cols-1 gap-2">
                <h2 className="text-xl font-bold text-slate-800">
                  {isEditMode ? sensorFormData.name : "New Sensor"}
                </h2>
                {isEditMode && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedSensorId}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsSensorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <MdOutlineClose />
              </button>
            </div>
            <form onSubmit={handleSubmitDevice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Name
                </label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  value={sensorFormData.name}
                  onChange={(e) =>
                    setsensorFormData({
                      ...sensorFormData,
                      name: e.target.value,
                    })
                  }
                  maxLength={28}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                    value={sensorFormData.sensor_type}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      const associatedUnit = SensorUnit[selectedType] || "";

                      setsensorFormData({
                        ...sensorFormData,
                        sensor_type: selectedType,
                        unit: associatedUnit,
                      });
                    }}
                  >
                    <option value="">Select Type</option>
                    {Object.values(SensorType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Unit
                  </label>
                  <input
                    className="w-full px-3 py-2 bg-slate-100 border rounded-lg outline-none text-slate-500 italic"
                    value={sensorFormData.unit}
                    readOnly
                    placeholder="Unit"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Location
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  value={sensorFormData.location_id}
                  onChange={(e) =>
                    setsensorFormData({
                      ...sensorFormData,
                      location_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Asset
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  value={sensorFormData.asset_id}
                  onChange={(e) =>
                    setsensorFormData({
                      ...sensorFormData,
                      asset_id: e.target.value,
                    })
                  }
                >
                  <option value="">None</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  value={sensorFormData.status}
                  onChange={(e) =>
                    setsensorFormData({
                      ...sensorFormData,
                      status: e.target.value,
                    })
                  }
                >
                  {Object.values(DeviceStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <div className="col-span-2 text-sm font-bold text-slate-800">
                  Alert Thresholds
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase">
                    Min Crit
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-1.5 border rounded-lg"
                    value={sensorFormData.min_critical}
                    onChange={(e) =>
                      setsensorFormData({
                        ...sensorFormData,
                        min_critical: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase">
                    Min Warn
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-1.5 border rounded-lg"
                    value={sensorFormData.min_warning}
                    onChange={(e) =>
                      setsensorFormData({
                        ...sensorFormData,
                        min_warning: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase">
                    Max Warn
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-1.5 border rounded-lg"
                    value={sensorFormData.max_warning}
                    onChange={(e) =>
                      setsensorFormData({
                        ...sensorFormData,
                        max_warning: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase">
                    Max Crit
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-1.5 border rounded-lg"
                    value={sensorFormData.max_critical}
                    onChange={(e) =>
                      setsensorFormData({
                        ...sensorFormData,
                        max_critical: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              {thresholdsValidation.errorMessage && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <MdOutlineWarningAmber />
                  {thresholdsValidation.errorMessage}
                </div>
              )}

              <div className="flex justify-between gap-3 items-center  border-t border-slate-100 pt-4">
                <div>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSensor(selectedSensorId)}
                      className="px-6 py-2 rounded-xl font-bold transition-all bg-red-600 text-white hover:bg-red-700 shadow-md shadow-blue-200"
                    >
                      Delete Sensor
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSensorModalOpen(false)}
                    className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!thresholdsValidation.isValid}
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${
                      thresholdsValidation.isValid
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isEditMode ? "Update Changes" : "Save Sensor"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/*=================== LOCATION MODAL =======================*/}
      {isLocationModalOpen && selectedLocation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain">
            {/* Header */}
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedLocation.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedLocation.id}
                </p>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <MdOutlineClose />
              </button>
            </div>

            <div className="p-6 border-b grid grid-cols-2 gap-4">
              {(() => {
                const stats = getLocationStats(selectedLocation.id);
                return (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-slate-800">
                        {stats.totalAssets}
                      </div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">
                        Assets
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-slate-800">
                        {stats.totalDevices}
                      </div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">
                        Devices
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-6 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase mb-4">
                Assets in this location
              </div>

              {assets.filter(
                (a) => String(a.location_id) === String(selectedLocation.id)
              ).length === 0 ? (
                <div className="text-center text-slate-400 italic text-sm py-6">
                  No assets linked to this location.
                </div>
              ) : (
                assets
                  .filter(
                    (a) => String(a.location_id) === String(selectedLocation.id)
                  )
                  .map((asset) => {
                    const linkedSensors = sensors.filter(
                      (s) => String(s.asset_id) === String(asset.id)
                    );
                    const isExpanded = expandedAssetId === asset.id;

                    return (
                      <div
                        key={asset.id}
                        className="border border-slate-100 rounded-xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAssetId(isExpanded ? null : asset.id)
                          }
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div>
                            <div className="font-semibold text-slate-700 text-sm">
                              {asset.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {asset.id}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-blue-50 text-blue-500 font-bold px-2 py-1 rounded-full">
                              {linkedSensors.length} sensor
                              {linkedSensors.length !== 1 ? "s" : ""}
                            </span>
                            <span
                              className={`text-slate-400 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            >
                              ▾
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50">
                            {linkedSensors.length === 0 ? (
                              <div className="px-4 py-3 text-xs text-slate-400 italic">
                                No sensors linked to this asset.
                              </div>
                            ) : (
                              linkedSensors.map((sensor) => (
                                <div
                                  key={sensor.id}
                                  className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0"
                                >
                                  <div>
                                    <div className="text-sm font-semibold text-slate-700">
                                      {sensor.name}
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono">
                                      {sensor.id}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-blue-500 font-bold uppercase bg-blue-50 px-2 py-0.5 rounded-full">
                                      {sensor.sensor_type}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                        sensor.status === "Active"
                                          ? "bg-green-50 text-green-600"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      {sensor.status}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/*=================== ADD LOCATION MODAL =======================*/}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">New Location</h2>
              <button
                onClick={() => setIsAddLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <MdOutlineClose />
              </button>
            </div>
            <form onSubmit={handleAddLocation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Name
                </label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={locationFormData.name}
                  onChange={(e) =>
                    setLocationFormData({ name: e.target.value })
                  }
                  maxLength={50}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLocationModalOpen(false)}
                  className="flex-1 px-6 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!locationFormData.name.trim()}
                  className={`flex-1 px-6 py-2 rounded-xl font-bold transition-all ${
                    locationFormData.name.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                      : "bg-slate-200 text-slateate-400 cursor-not-allowed"
                  }`}
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/*=================== ASSET MODAL =======================*/}
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isEditMode ? assetFormData.name : "New Asset"}
                </h2>
                {isEditMode && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedAsset?.id}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <MdOutlineClose />
              </button>
            </div>
            <form onSubmit={handleSubmitAsset} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Name
                </label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={assetFormData.name}
                  onChange={(e) =>
                    setAssetFormData({ ...assetFormData, name: e.target.value })
                  }
                  maxLength={50}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Location
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  value={assetFormData.location_id}
                  onChange={(e) =>
                    setAssetFormData({
                      ...assetFormData,
                      location_id: e.target.value,
                    })
                  }
                >
                  <option value="">None</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  value={assetFormData.status}
                  onChange={(e) =>
                    setAssetFormData({
                      ...assetFormData,
                      status: e.target.value,
                    })
                  }
                >
                  {Object.values(AssetStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-100">
                <div>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={handleDeleteAsset}
                      className="px-6 py-2 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200"
                    >
                      Delete Asset
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAssetModalOpen(false)}
                    className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!assetFormData.name.trim()}
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${
                      assetFormData.name.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isEditMode ? "Update Asset" : "Save Asset"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
