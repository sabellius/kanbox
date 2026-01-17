import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createWorkspace,
  loadWorkspace,
} from "../store/actions/workspace-actions";
import { Popover } from "./Popover";
import {
  GRADIENT_BACKGROUNDS,
  IMAGE_BACKGROUNDS,
  SOLID_BACKGROUNDS,
} from "../services/board-backgrounds";
import { BackgroundGrid } from "./ui/BackgroundGrid";

export function CreateWorkspaceForm({
  anchorEl,
  isCreateFormOpen,
  onCloseCreateForm,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [background, setBackground] = useState(GRADIENT_BACKGROUNDS[8]);
  const navigate = useNavigate();

  async function onCreateWorkspace() {
    if (!title.trim()) return;

    const newWorkspace = await createWorkspace({
      title,
      description,
      appearance: { background },
    });

    await loadWorkspace(newWorkspace._id);
    navigate(`/workspace/${newWorkspace._id}`);
    onCloseCreateForm();
  }

  return (
    <Popover
      anchorEl={anchorEl}
      transitionDuration={0}
      isOpen={isCreateFormOpen}
      onClose={onCloseCreateForm}
      title={"Create workspace"}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      paperProps={{ sx: { mt: 1, pt: 0.7 } }}
      slotProps={{ transition: { onExited: () => onCloseCreateForm() } }}
    >
      <section className="create-workspace-content">
        <h4 className="section-title">Background</h4>

        <p className="sub-section-title">Gradients</p>
        <BackgroundGrid
          backgrounds={GRADIENT_BACKGROUNDS}
          value={background}
          onChange={setBackground}
          size="small"
        />

        <p className="sub-section-title">Colors</p>
        <BackgroundGrid
          backgrounds={SOLID_BACKGROUNDS}
          value={background}
          onChange={setBackground}
          size="small"
        />

        <p className="sub-section-title">Images</p>
        <BackgroundGrid
          backgrounds={IMAGE_BACKGROUNDS}
          value={background}
          onChange={setBackground}
          size="small"
        />

        <h4 className="section-title">
          Workspace title <span className="required">*</span>
        </h4>

        <input
          className="workspace-title-input"
          placeholder="Workspace title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        <h4 className="section-title">Description</h4>

        <textarea
          className="workspace-description-input"
          placeholder="Workspace description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />

        {!title && <p className="error-text">👋 Workspace title is required</p>}

        <button
          className="create-workspace-btn"
          disabled={!title.trim()}
          onClick={onCreateWorkspace}
        >
          Create
        </button>
      </section>
    </Popover>
  );
}
