import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { loadWorkspaces } from "../store/actions/workspace-actions";
import { WorkspacePreview } from "../components/ui/WorkspacePreview";
import { CreateWorkspaceForm } from "../components/CreateWorkspaceForm";
import { Avatar } from "../components/ui/Avatar";
import { selectCurrentUser } from "../store/selectors/auth-selectors";
import {
  selectAccessibleWorkspaces,
  selectOwnedWorkspaces,
  selectMemberWorkspaces,
} from "../store/selectors/workspace-selectors";

export function WorkspaceIndex() {
  const [createFormAnchorEl, setCreateFormAnchorEl] = useState(null);
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const ownedWorkspaces = useSelector(state =>
    selectOwnedWorkspaces(state, currentUser?._id)
  );
  console.log("🚀 ~ WorkspaceIndex ~ ownedWorkspaces:", ownedWorkspaces);

  const memberWorkspaces = useSelector(state =>
    selectMemberWorkspaces(state, currentUser?._id)
  );
  console.log("🚀 ~ WorkspaceIndex ~ memberWorkspaces:", memberWorkspaces);

  const accessibleWorkspaces = useSelector(state =>
    selectAccessibleWorkspaces(state, currentUser?._id)
  );
  console.log(
    "🚀 ~ WorkspaceIndex ~ accessibleWorkspaces:",
    accessibleWorkspaces
  );

  async function onOpenWorkspace(workspaceId) {
    navigate(`/workspace/${workspaceId}`);
  }

  return (
    <section className="workspace-index-page">
      <div className="workspace-index-content">
        {currentUser && (
          <header className="workspace-header">
            <Avatar user={currentUser} size={64} />
            <div className="workspace-info">
              <div className="workspace-name">
                <h1>Workspaces</h1>
              </div>
              <div className="workspace-count">
                <GroupOutlinedIcon fontSize="small" />
                <span>{accessibleWorkspaces.length} workspaces</span>
              </div>
            </div>
          </header>
        )}

        <hr className="workspace-divider" />

        {ownedWorkspaces.length > 0 && (
          <section className="workspace-section">
            <h2 className="section-title">
              <PersonOutlineIcon />
              Your workspaces
            </h2>
            <div className="workspaces-list">
              {ownedWorkspaces.map(workspace => (
                <WorkspacePreview
                  key={workspace._id}
                  workspace={workspace}
                  onOpen={() => onOpenWorkspace(workspace._id)}
                />
              ))}
              <div
                className="workspace-tile create-tile"
                onClick={ev => setCreateFormAnchorEl(ev.currentTarget)}
              >
                <AddIcon />
                <span>Create new workspace</span>
              </div>
            </div>
          </section>
        )}

        {memberWorkspaces.length > 0 && (
          <section className="workspace-section">
            <h2 className="section-title">
              <GroupOutlinedIcon />
              Workspaces you're a member of
            </h2>
            <div className="workspaces-list">
              {memberWorkspaces.map(workspace => (
                <WorkspacePreview
                  key={workspace._id}
                  workspace={workspace}
                  onOpen={() => onOpenWorkspace(workspace._id)}
                />
              ))}
            </div>
          </section>
        )}

        <CreateWorkspaceForm
          anchorEl={createFormAnchorEl}
          isCreateFormOpen={Boolean(createFormAnchorEl)}
          onCloseCreateForm={() => setCreateFormAnchorEl(null)}
        />
      </div>
    </section>
  );
}
