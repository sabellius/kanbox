import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import { Board } from "../../../src/models/Board.js";
import * as boardService from "../../../src/services/board-service.js";

describe("Board Service - Unit Tests", () => {
  let boardId;
  const mockOwner = {
    userId: new mongoose.Types.ObjectId(),
    username: "testuser",
    fullname: "Test User",
  };
  const mockWorkspaceId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    const board = await Board.create({
      title: "Test Board",
      description: "Test Description",
      workspaceId: mockWorkspaceId,
      owner: mockOwner,
      members: [mockOwner],
    });
    boardId = board._id;
  });

  describe("createBoard", () => {
    it("should create a board with valid data", async () => {
      const boardData = {
        title: "New Board",
        description: "New Description",
        workspaceId: new mongoose.Types.ObjectId(),
        owner: {
          userId: new mongoose.Types.ObjectId(),
          username: "newuser",
          fullname: "New User",
        },
        members: [
          {
            userId: new mongoose.Types.ObjectId(),
            username: "newuser",
            fullname: "New User",
          },
        ],
      };

      const board = await boardService.createBoard(boardData);

      expect(board).toBeDefined();
      expect(board.title).toBe("New Board");
      expect(board.description).toBe("New Description");
      expect(board.owner.username).toBe("newuser");
      expect(board.members).toHaveLength(1);
    });

    it("should create board with appearance background", async () => {
      const boardData = {
        title: "Board with Background",
        workspaceId: new mongoose.Types.ObjectId(),
        owner: mockOwner,
        members: [mockOwner],
        appearance: {
          background: "#ff0000",
        },
      };

      const board = await boardService.createBoard(boardData);

      expect(board.appearance).toBeDefined();
      expect(board.appearance.background).toBe("#ff0000");
    });

    it("should create board without appearance", async () => {
      const boardData = {
        title: "Board without Background",
        workspaceId: new mongoose.Types.ObjectId(),
        owner: mockOwner,
        members: [mockOwner],
      };

      const board = await boardService.createBoard(boardData);

      expect(board.appearance).toEqual({ background: null });
    });
  });

  describe("getBoardById", () => {
    it("should return board by ID", async () => {
      const board = await boardService.getBoardById(boardId);

      expect(board).toBeDefined();
      expect(board._id).toEqual(boardId);
      expect(board.title).toBe("Test Board");
    });

    it("should return null for non-existent board", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const board = await boardService.getBoardById(fakeId);

      expect(board).toBeNull();
    });
  });

  describe("updateBoard", () => {
    it("should update board title", async () => {
      const updateData = {
        title: "Updated Board Title",
      };

      const updatedBoard = await boardService.updateBoard(boardId, updateData);

      expect(updatedBoard).toBeDefined();
      expect(updatedBoard.title).toBe("Updated Board Title");
      expect(updatedBoard.description).toBe("Test Description");
    });

    it("should update board description", async () => {
      const updateData = {
        description: "Updated Description",
      };

      const updatedBoard = await boardService.updateBoard(boardId, updateData);

      expect(updatedBoard).toBeDefined();
      expect(updatedBoard.description).toBe("Updated Description");
      expect(updatedBoard.title).toBe("Test Board");
    });

    it("should update board appearance background", async () => {
      const updateData = {
        appearance: {
          background: "#00ff00",
        },
      };

      const updatedBoard = await boardService.updateBoard(boardId, updateData);

      expect(updatedBoard).toBeDefined();
      expect(updatedBoard.appearance.background).toBe("#00ff00");
    });

    it("should return null for non-existent board", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updatedBoard = await boardService.updateBoard(fakeId, {
        title: "Updated",
      });

      expect(updatedBoard).toBeNull();
    });
  });

  describe("deleteBoard", () => {
    it("should delete board by ID", async () => {
      const deletedBoard = await boardService.deleteBoard(boardId);

      expect(deletedBoard).toBeDefined();
      expect(deletedBoard._id).toEqual(boardId);

      const board = await Board.findById(boardId);
      expect(board).toBeNull();
    });

    it("should return null for non-existent board", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const deletedBoard = await boardService.deleteBoard(fakeId);

      expect(deletedBoard).toBeNull();
    });
  });

  describe("getAllBoards", () => {
    it("should return all boards", async () => {
      const boards = await boardService.getAllBoards();

      expect(boards).toBeDefined();
      expect(boards.length).toBeGreaterThan(0);
      expect(boards[0].title).toBe("Test Board");
    });

    it("should return empty array when no boards exist", async () => {
      await Board.deleteMany({});

      const boards = await boardService.getAllBoards();

      expect(boards).toBeDefined();
      expect(boards).toHaveLength(0);
    });
  });

  describe("getBoardLabels", () => {
    beforeEach(async () => {
      await Board.findByIdAndUpdate(boardId, {
        labels: [
          { title: "Bug", color: "#ff0000" },
          { title: "Feature", color: "#00ff00" },
        ],
      });
    });

    it("should return board with labels", async () => {
      const board = await boardService.getBoardLabels(boardId);

      expect(board).toBeDefined();
      expect(board.labels).toBeDefined();
      expect(board.labels).toHaveLength(2);
      expect(board.labels[0].title).toBe("Bug");
    });

    it("should throw error for non-existent board", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(boardService.getBoardLabels(fakeId)).rejects.toThrow(
        "Board not found"
      );
    });
  });

  describe("addLabelToBoard", () => {
    it("should add label to board", async () => {
      const labelData = { title: "Urgent", color: "#ff0000" };

      const addedLabel = await boardService.addLabelToBoard(boardId, labelData);

      expect(addedLabel).toBeDefined();
      expect(addedLabel.title).toBe("Urgent");
      expect(addedLabel.color).toBe("#ff0000");

      const board = await Board.findById(boardId);
      expect(board.labels).toHaveLength(1);
    });
  });

  describe("updateLabelInBoard", () => {
    beforeEach(async () => {
      await Board.findByIdAndUpdate(boardId, {
        labels: [{ title: "Bug", color: "#ff0000" }],
      });
    });

    it("should update label in board", async () => {
      const board = await Board.findById(boardId);
      const labelId = board.labels[0]._id;

      const updatedLabel = await boardService.updateLabelInBoard(
        boardId,
        labelId,
        {
          title: "Critical Bug",
          color: "#ff00ff",
        }
      );

      expect(updatedLabel).toBeDefined();
      expect(updatedLabel.title).toBe("Critical Bug");
      expect(updatedLabel.color).toBe("#ff00ff");
    });
  });

  describe("removeLabelFromBoard", () => {
    beforeEach(async () => {
      await Board.findByIdAndUpdate(boardId, {
        labels: [
          { title: "Bug", color: "#ff0000" },
          { title: "Feature", color: "#00ff00" },
        ],
      });
    });

    it("should remove label from board", async () => {
      const board = await Board.findById(boardId);
      const labelId = board.labels[0]._id;

      const result = await boardService.removeLabelFromBoard(boardId, labelId);

      expect(result).toBeDefined();

      const updatedBoard = await Board.findById(boardId);
      expect(updatedBoard.labels).toHaveLength(1);
      expect(updatedBoard.labels[0].title).toBe("Feature");
    });
  });
});
