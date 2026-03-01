import { useApp } from "@/context/AppContext";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const { notifications, clearNotifications } = useApp();

  return (
    <button
      type="button"
      onClick={clearNotifications}
      className="relative p-2 rounded-xl transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,45,120,0.15)",
        color: "rgba(240,230,255,0.7)",
      }}
      aria-label={`${notifications} notifications`}
    >
      <Bell size={18} />
      {notifications > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-bold rounded-full"
          style={{
            background: "linear-gradient(135deg, #ff2d78, #9b5de5)",
            color: "white",
            width: 18,
            height: 18,
            minWidth: 18,
            boxShadow: "0 0 8px rgba(255,45,120,0.6)",
          }}
        >
          {notifications > 9 ? "9+" : notifications}
        </span>
      )}
    </button>
  );
}
