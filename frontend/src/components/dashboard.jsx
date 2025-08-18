import { useState } from "react";
import CreatePanel from "./createPanel";
import DeletePanel from "./DeletePanel";
import ExportPanel from "./ExportPanel";
import ProfilePanel from "./ProfileNotifications"; // Profile panel component
import ReadPanel from "./readPanel";
import VideoPanel from "./VideoPanel";
import WeatherDashboard from "./WeatherDashboard";
import WorldMap from "./WorldMap";
import SettingsPanel from "./settingsPanel";

import {
  faCog,
  faFileExport,
  faPen,
  faPlus,
  faSearch,
  faTrash,
  faUser,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Left bar icons
const icons = [
  { id: "create", label: "Create", icon: faPlus },
  { id: "read", label: "Read", icon: faSearch },
  { id: "update", label: "Update", icon: faPen },
  { id: "delete", label: "Delete", icon: faTrash },
  { id: "video", label: "Video", icon: faVideo },
  { id: "export", label: "Export", icon: faFileExport },
  { id: "profile", label: "Profile", icon: faUser },
  { id: "settings", label: "Settings", icon: faCog },
];

// Map icons to panels
const panelComponents = {
  create: CreatePanel,
  read: ReadPanel,
  update: WeatherDashboard,
  delete: DeletePanel,
  video: VideoPanel,
  export: ExportPanel,
  profile: (props) => <ProfilePanel {...props} />, // Profile info / logout
  settings: SettingsPanel
};

export default function Dashboard() {
  const [openPanel, setOpenPanel] = useState(null);

  const togglePanel = (id) => {
    setOpenPanel(openPanel === id ? null : id);
  };

  const PanelComponent = openPanel ? panelComponents[openPanel] : null;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar with Icons */}
      <div
        style={{
          width: 60,
          backgroundColor: "#222",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 20,
          gap: 30,
          userSelect: "none",
          flexShrink: 0,
        
        }}
      >
        {icons.map(({ id, label, icon }) => (
          <div
            key={id}
            title={label}
            onClick={() => togglePanel(id)}
            style={{
              cursor: "pointer",
              fontSize: 24,
              padding: 7,
              borderRadius: 8,
              backgroundColor: openPanel === id ? "#444" : "transparent",
              transition: "background-color 0.3s",
            }}
          >
            <FontAwesomeIcon icon={icon} />
          </div>
        ))}
      </div>

      {/* Sliding Panel (Left Side) */}
      <div
        style={{
          width: openPanel ? 750 : 0,
          backgroundColor: "#f0f0f0",
          overflow: "hidden",
          transition: "width 0.3s ease",
          boxShadow: openPanel ? "2px 0 5px rgba(0,0,0,0.2)" : "none",
          flexShrink: 0,
          padding: openPanel ? 20 : 0,
          position: "relative",
        }}
      >
        {PanelComponent ? (
          <PanelComponent onClose={() => setOpenPanel(null)} />
        ) : null}
      </div>

      {/* Main Content (full width, no right sidebar) */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            overflowY: "auto",
            borderRadius: 8,
          }}
        >
          <WorldMap />
        </div>
      </div>
    </div>
  );
}
