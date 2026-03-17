import { NavLink } from "react-router-dom";
import { MdImportantDevices } from "react-icons/md";
import { MdOutlineQueryStats } from "react-icons/md";
import { LuBellRing } from "react-icons/lu";
import { MdOutlineMonitorHeart } from "react-icons/md";
import { MdOutlineLocationOn } from "react-icons/md";
import { MdWebAsset } from "react-icons/md";
import { MdOutlineLogout } from "react-icons/md";
import { logout } from "../services/oidc";
export default function SideBar() {
  {
    const items = [
      { to: "/", icon: <MdOutlineQueryStats />, label: "Dashboard" },
      { to: "/devices", icon: <MdImportantDevices />, label: "Devices" },
      { to: "/alerts", icon: <LuBellRing />, label: "Alerts" },
      { to: "/assets", icon: <MdWebAsset />, label: "Assets" },
    ];

    return (
      <div className="w-1/6 flex flex-col md:border-r bg-blue-300">
        <div className="flex align-middle py-2 pt-4 text-2xl justify-center items-center">
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
              </span>{" "}
            </NavLink>
          ))}{" "}
          <button
            onClick={logout}
            className="flex flex-row items-center bg-slate-200 rounded-2xl w-1/2 mt-4 ml-2 transition-colors duration-200 hover:bg-red-500 cursor-pointer"
          >
            <span className="text-xl m-3">
              <MdOutlineLogout />
            </span>
            <span className="">Logout</span>
          </button>
        </nav>
      </div>
    );
  }
}
