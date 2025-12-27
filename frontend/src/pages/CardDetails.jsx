import { useSelector, shallowEqual } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { CardModal } from "../components/CardModal";
import { useState, useEffect } from "react";
import {
  deleteCard,
  editCard,
  loadBoard,
} from "../store/actions/board-actions";
import {
  selectCardById,
  selectListById,
} from "../store/selectors/board-selectors";

export function CardDetails() {
  const { boardId, listId, cardId } = useParams();
  const [modalOpen, setModalOpen] = useState(true);
  const navigate = useNavigate();
  const board = useSelector(s => s.boards.board, shallowEqual);
  const card = useSelector(
    state => selectCardById(state, cardId),
    shallowEqual
  );
  const list = useSelector(
    state => selectListById(state, listId),
    shallowEqual
  );
  const backgroundClass = board?.appearance
    ? `bg-${board?.appearance?.background}`
    : "bg-blue";

  useEffect(() => {
    if (!board || board._id !== boardId) {
      loadBoard(boardId);
    }
  }, [boardId, board]);

  function handleCloseModal() {
    setModalOpen(false);
    navigate(`/board/${boardId}`);
  }

  async function handleDeleteCard() {
    try {
      await deleteCard(boardId, cardId, listId);
      handleCloseModal();
    } catch (error) {
      console.error("Card delete failed:", error);
    }
  }

  async function handleEditCard(card) {
    try {
      await editCard(boardId, card, listId);
    } catch (error) {
      console.error("Card delete failed:", error);
    }
  }

  if (!card) {
    return <section className={`card-details-container ${backgroundClass}`} />;
  }

  return (
    <section className={`card-details-container ${backgroundClass}`}>
      <CardModal
        listTitle={list.title}
        card={card}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
        onClose={handleCloseModal}
        isOpen={modalOpen}
      />
    </section>
  );
}
