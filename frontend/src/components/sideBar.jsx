import { NavLink } from "react-router-dom";
import { MdImportantDevices } from "react-icons/md";
import { MdOutlineQueryStats } from "react-icons/md";
import { LuBellRing } from "react-icons/lu";
import { MdOutlineMonitorHeart } from "react-icons/md";
import { MdOutlineLocationOn } from "react-icons/md";
import { MdWebAsset } from "react-icons/md";
import { MdDehaze } from "react-icons/md";
/*import { useState } from "react";*/

export default function SideBar() {
  {
    const items = [
      { to: "/", icon: <MdOutlineQueryStats />, label: "Dashboard" },
      { to: "/devices", icon: <MdImportantDevices />, label: "Devices" },
      { to: "/alerts", icon: <LuBellRing />, label: "Alerts" },
      { to: "/assets", icon: <MdWebAsset />, label: "Assets" },
      { to: "/locations", icon: <MdOutlineLocationOn />, label: "Locations" },
      { to: "/health", icon: <MdOutlineMonitorHeart />, label: "Data Health" },
    ];

    return (
      <div className="w-1/5 flex flex-col md:border-r">
        <div className="flex align-middle py-2 pt-4 text-2xl justify-center items-center">
          <button className="text-3xl w-1/4">
            <MdDehaze />
          </button>
          IoT Sensor
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 transition-colors duration-200
              ${isActive ? "bg-blue-300" : "hover:bg-slate-200"}`
              }
            >
              <span className="text-xl mr-3">{it.icon}</span>
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${
                  open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                {it.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    );
    /* Elia
    s side bar 
  const [open, setOpen] = useState(true);



  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col shadow-2xl
          ${open ? "w-64" : "w-20"} 
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700 h-16">
          {open && (
            <div className="font-bold text-lg text-blue-400 truncate">
              ServerSense ⚡
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 transition mx-auto"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 transition-colors duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white border-r-4 border-blue-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
                `
              }
            >
              <span className="text-xl mr-3">{it.icon}</span>
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${
                  open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                {it.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {open && (
          <div className="p-4 bg-slate-800 border-t border-slate-700 text-sm">
            <label className="block text-indigo-200 text-xs font-semibold mb-1 uppercase">
              Scenes
            </label>
            <select className="w-full bg-slate-700 border-none rounded text-slate-200 text-sm p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select a scene…</option>
              <option value="1">Matinée Labo</option>
              <option value="2">Nuit Surveillance</option>
            </select>

            <label className="block text-indigo-200 text-xs font-semibold mb-1 uppercase">
              Group
            </label>
            <select className="w-full bg-slate-700 border-none rounded text-slate-200 text-sm p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all">All Groups</option>
              <option value="floor1">Étage 1</option>
            </select>

            <label className="block text-indigo-200 text-xs font-semibold mb-1 uppercase">
              Room
            </label>
            <select className="w-full bg-slate-700 border-none rounded text-slate-200 text-sm p-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all">All Rooms</option>
              <option value="lab1">Labo A</option>
            </select>
          </div>
        )}

        <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500">
          {open ? "v1.0.0" : "v1"}
        </div>
      </aside>
    </>
  );*/
  }
}
