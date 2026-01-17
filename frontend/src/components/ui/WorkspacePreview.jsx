import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

export function WorkspacePreview({ workspace, onOpen }) {
  return (
    <div className="workspace-preview" onClick={onOpen}>
      <div
        className={`workspace-preview-card ${workspace.appearance || "default"}`}
        style={{
          background: workspace.appearance?.startsWith("#")
            ? workspace.appearance
            : undefined,
        }}
      >
        <div className="workspace-preview-content">
          <h3 className="workspace-preview-title">{workspace.title}</h3>
          <div className="workspace-preview-meta">
            <div className="workspace-preview-owner">
              <PersonOutlineIcon fontSize="small" />
              <span>Owner: {workspace.owner?.fullname}</span>
            </div>
            <div className="workspace-preview-members">
              <GroupOutlinedIcon fontSize="small" />
              <span>{workspace.members?.length || 0} members</span>
            </div>
          </div>
        </div>
        <div className="workspace-preview-lock">
          <LockOutlinedIcon fontSize="inherit" />
        </div>
      </div>
    </div>
  );
}
