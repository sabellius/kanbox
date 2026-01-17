import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { BoardPreview } from "../components/ui/BoardPreview";
import { Avatar } from "../components/ui/Avatar";
import {
  loadWorkspace,
  loadWorkspaceBoards,
  deleteWorkspace,
} from "../store/actions/workspace-actions";
import {
  selectWorkspace,
  selectWorkspaceBoards,
  selectIsWorkspaceOwner,
} from "../store/selectors/workspace-selectors";
import { selectCurrentUser } from "../store/selectors/auth-selectors";
import { CreateBoardForm } from "../components/CreateBoardForm";

export function WorkspaceDetails() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [createFormAnchorEl, setCreateFormAnchorEl] = useState(null);
  const workspace = useSelector(state => selectWorkspace(state, workspaceId));
  const workspaceBoards = useSelector(state => selectWorkspaceBoards(state));
  const currentUser = useSelector(selectCurrentUser);
  const isOwner = useSelector(state =>
    selectIsWorkspaceOwner(state, workspaceId, currentUser?._id)
  );

  useEffect(() => {
    if (workspaceId) {
      loadWorkspace(workspaceId);
      loadWorkspaceBoards(workspaceId);
    }
  }, [workspaceId]);

  async function onDeleteWorkspace() {
    if (
      window.confirm(
        "Are you sure you want to delete this workspace? This will also delete all boards in it."
      )
    ) {
      await deleteWorkspace(workspaceId);
      navigate("/workspaces");
    }
  }

  async function onCreateBoard() {
    await loadWorkspace(workspaceId);
  }

  return (
    <section className="workspace-details-page">
      <div className="workspace-details-content">
        <header className="workspace-header">
          <Avatar user={workspace?.owner} size={64} />
          <div className="workspace-info">
            <div className="workspace-name">
              <h1>{workspace?.title}</h1>
            </div>
            <div className="workspace-description">
              {workspace?.description}
            </div>
            {isOwner && (
              <button
                className="delete-workspace-btn"
                onClick={onDeleteWorkspace}
              >
                Delete workspace
              </button>
            )}
          </div>
        </header>

        <hr className="workspace-divider" />

        <section className="boards-section">
          <div className="section-header">
            <h2 className="section-title">Boards ({workspaceBoards.length})</h2>
            {isOwner && (
              <div
                className="board-tile create-tile"
                onClick={ev => setCreateFormAnchorEl(ev.currentTarget)}
              >
                <AddIcon />
                <span>Create new board</span>
              </div>
            )}
          </div>

          {workspaceBoards.length === 0 ? (
            <div className="empty-state">
              <p>No boards in this workspace yet.</p>
              {isOwner && <p>Create your first board to get started!</p>}
            </div>
          ) : (
            <div className="boards-list">
              {workspaceBoards.map(board => (
                <BoardPreview
                  key={board._id}
                  boardTitle={board.title}
                  boardAppearance={board.appearance}
                  onOpen={() => navigate(`/board/${board._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        <CreateBoardForm
          anchorEl={createFormAnchorEl}
          isCreateFormOpen={Boolean(createFormAnchorEl)}
          onCloseCreateForm={() => setCreateFormAnchorEl(null)}
          onCreateBoard={onCreateBoard}
        />
      </div>
    </section>
  );
}
