import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import { Card } from "../../../src/models/Card.js";
import * as cardService from "../../../src/services/card-service.js";

describe("Card Service - Unit Tests", () => {
  let cardId;
  const mockBoardId = new mongoose.Types.ObjectId();
  const mockListId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    const card = await Card.create({
      boardId: mockBoardId,
      listId: mockListId,
      title: "Test Card",
      description: "Test Description",
      position: "a0",
    });
    cardId = card._id;
  });

  describe("createCard", () => {
    it("should create a card with valid data", async () => {
      const cardData = {
        boardId: new mongoose.Types.ObjectId(),
        listId: new mongoose.Types.ObjectId(),
        title: "New Card",
        description: "New Description",
      };

      const card = await cardService.createCard(cardData);

      expect(card).toBeDefined();
      expect(card.title).toBe("New Card");
      expect(card.description).toBe("New Description");
      expect(card.boardId.toString()).toBe(cardData.boardId.toString());
      expect(card.listId.toString()).toBe(cardData.listId.toString());
    });

    it("should create card without description", async () => {
      const cardData = {
        boardId: new mongoose.Types.ObjectId(),
        listId: new mongoose.Types.ObjectId(),
        title: "Card without Description",
      };

      const card = await cardService.createCard(cardData);

      expect(card).toBeDefined();
      expect(card.title).toBe("Card without Description");
      expect(card.description).toBe("");
    });
  });

  describe("getCardById", () => {
    it("should return card by ID", async () => {
      const card = await cardService.getCardById(cardId);

      expect(card).toBeDefined();
      expect(card._id).toEqual(cardId);
      expect(card.title).toBe("Test Card");
    });

    it("should return null for non-existent card", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const card = await cardService.getCardById(fakeId);

      expect(card).toBeNull();
    });
  });

  describe("updateCard", () => {
    it("should update card title", async () => {
      const updateData = {
        title: "Updated Card Title",
      };

      const updatedCard = await cardService.updateCard(cardId, updateData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.title).toBe("Updated Card Title");
      expect(updatedCard.description).toBe("Test Description");
    });

    it("should update card description", async () => {
      const updateData = {
        description: "Updated Description",
      };

      const updatedCard = await cardService.updateCard(cardId, updateData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.description).toBe("Updated Description");
      expect(updatedCard.title).toBe("Test Card");
    });

    it("should update card with startDate", async () => {
      const startDate = new Date("2026-01-01");
      const updateData = {
        startDate,
      };

      const updatedCard = await cardService.updateCard(cardId, updateData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.startDate.toISOString()).toBe(startDate.toISOString());
    });

    it("should update card with dueDate", async () => {
      const dueDate = new Date("2026-12-31");
      const updateData = {
        dueDate,
      };

      const updatedCard = await cardService.updateCard(cardId, updateData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.dueDate.toISOString()).toBe(dueDate.toISOString());
    });

    it("should update multiple fields at once", async () => {
      const updateData = {
        title: "Multi Update",
        description: "Multi Description",
        startDate: new Date("2026-01-01"),
        dueDate: new Date("2026-12-31"),
      };

      const updatedCard = await cardService.updateCard(cardId, updateData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.title).toBe("Multi Update");
      expect(updatedCard.description).toBe("Multi Description");
      expect(updatedCard.startDate).toBeDefined();
      expect(updatedCard.dueDate).toBeDefined();
    });

    it("should return null for non-existent card", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updatedCard = await cardService.updateCard(fakeId, {
        title: "Updated",
      });

      expect(updatedCard).toBeNull();
    });
  });

  describe("deleteCard", () => {
    it("should delete card by ID", async () => {
      const deletedCard = await cardService.deleteCard(cardId);

      expect(deletedCard).toBeDefined();
      expect(deletedCard._id).toEqual(cardId);

      const card = await Card.findById(cardId);
      expect(card).toBeNull();
    });

    it("should return null for non-existent card", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const deletedCard = await cardService.deleteCard(fakeId);

      expect(deletedCard).toBeNull();
    });
  });

  describe("getAllCards", () => {
    it("should return all cards", async () => {
      const cards = await cardService.getAllCards();

      expect(cards).toBeDefined();
      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0].title).toBe("Test Card");
    });

    it("should return empty array when no cards exist", async () => {
      await Card.deleteMany({});

      const cards = await cardService.getAllCards();

      expect(cards).toBeDefined();
      expect(cards).toHaveLength(0);
    });
  });

  describe("updateCardLabels", () => {
    it("should update card labels", async () => {
      const labelIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const updatedCard = await cardService.updateCardLabels(cardId, labelIds);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.labelIds).toHaveLength(2);
      expect(updatedCard.labelIds[0].toString()).toBe(labelIds[0].toString());
    });

    it("should clear card labels", async () => {
      const updatedCard = await cardService.updateCardLabels(cardId, []);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.labelIds).toHaveLength(0);
    });
  });

  describe("updateCover", () => {
    it("should update card cover with color", async () => {
      const coverData = {
        color: "#ff0000",
      };

      const updatedCard = await cardService.updateCover(cardId, coverData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.cover).toBeDefined();
      expect(updatedCard.cover.color).toBe("#ff0000");
    });

    it("should update card cover with img", async () => {
      const coverData = {
        img: "https://example.com/image.jpg",
      };

      const updatedCard = await cardService.updateCover(cardId, coverData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.cover).toBeDefined();
      expect(updatedCard.cover.img).toBe("https://example.com/image.jpg");
    });

    it("should update card cover with textOverlay", async () => {
      const coverData = {
        textOverlay: true,
      };

      const updatedCard = await cardService.updateCover(cardId, coverData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.cover).toBeDefined();
      expect(updatedCard.cover.textOverlay).toBe(true);
    });

    it("should update card cover with all fields", async () => {
      const coverData = {
        color: "#00ff00",
        img: "https://example.com/image.jpg",
        textOverlay: true,
      };

      const updatedCard = await cardService.updateCover(cardId, coverData);

      expect(updatedCard).toBeDefined();
      expect(updatedCard.cover.color).toBe("#00ff00");
      expect(updatedCard.cover.img).toBe("https://example.com/image.jpg");
      expect(updatedCard.cover.textOverlay).toBe(true);
    });

    it("should throw error for non-existent card", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        cardService.updateCover(fakeId, { color: "#ff0000" })
      ).rejects.toThrow("Card not found");
    });
  });

  describe("addAttachment", () => {
    it("should add attachment to card", async () => {
      const attachmentData = {
        url: "https://example.com/file.pdf",
        name: "Test File",
        publicId: "file_123",
      };

      const updatedCard = await cardService.addAttachment(
        cardId,
        attachmentData
      );

      expect(updatedCard).toBeDefined();
      expect(updatedCard.attachments).toHaveLength(1);
      expect(updatedCard.attachments[0].url).toBe(
        "https://example.com/file.pdf"
      );
      expect(updatedCard.attachments[0].name).toBe("Test File");
      expect(updatedCard.attachments[0].publicId).toBe("file_123");
    });

    it("should add attachment without name", async () => {
      const attachmentData = {
        url: "https://example.com/file.pdf",
      };

      const updatedCard = await cardService.addAttachment(
        cardId,
        attachmentData
      );

      expect(updatedCard).toBeDefined();
      expect(updatedCard.attachments).toHaveLength(1);
      expect(updatedCard.attachments[0].url).toBe(
        "https://example.com/file.pdf"
      );
      expect(updatedCard.attachments[0].name).toBe("");
    });

    it("should trim url whitespace", async () => {
      const attachmentData = {
        url: "  https://example.com/file.pdf  ",
      };

      const updatedCard = await cardService.addAttachment(
        cardId,
        attachmentData
      );

      expect(updatedCard.attachments[0].url).toBe(
        "https://example.com/file.pdf"
      );
    });

    it("should throw error when url is missing", async () => {
      await expect(cardService.addAttachment(cardId, {})).rejects.toThrow(
        "url is required"
      );
    });

    it("should throw error for non-existent card", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        cardService.addAttachment(fakeId, {
          url: "https://example.com/file.pdf",
        })
      ).rejects.toThrow("Card not found");
    });
  });

  describe("removeAttachment", () => {
    beforeEach(async () => {
      await Card.findByIdAndUpdate(cardId, {
        attachments: [
          {
            url: "https://example.com/file1.pdf",
            name: "File 1",
            publicId: "file_1",
          },
          {
            url: "https://example.com/file2.pdf",
            name: "File 2",
            publicId: "file_2",
          },
        ],
      });
    });

    it("should remove attachment from card", async () => {
      const card = await Card.findById(cardId);
      const attachmentId = card.attachments[0]._id;

      const updatedCard = await cardService.removeAttachment(
        cardId,
        attachmentId
      );

      expect(updatedCard).toBeDefined();
      expect(updatedCard.attachments).toHaveLength(1);
      expect(updatedCard.attachments[0].name).toBe("File 2");
    });

    it("should throw error for non-existent card", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        cardService.removeAttachment(fakeId, new mongoose.Types.ObjectId())
      ).rejects.toThrow("Card not found");
    });

    it("should throw error for non-existent attachment", async () => {
      await expect(
        cardService.removeAttachment(cardId, new mongoose.Types.ObjectId())
      ).rejects.toThrow("Attachment not found");
    });
  });

  describe("getComments", () => {
    beforeEach(async () => {
      await Card.findByIdAndUpdate(cardId, {
        comments: [
          {
            author: {
              userId: new mongoose.Types.ObjectId(),
              username: "user1",
              fullname: "User One",
            },
            text: "First comment",
            isEdited: false,
          },
          {
            author: {
              userId: new mongoose.Types.ObjectId(),
              username: "user2",
              fullname: "User Two",
            },
            text: "Second comment",
            isEdited: false,
          },
        ],
      });
    });

    it("should return card comments", async () => {
      const comments = await cardService.getComments(cardId);

      expect(comments).toBeDefined();
      expect(comments).toHaveLength(2);
      expect(comments[0].text).toBe("First comment");
      expect(comments[1].text).toBe("Second comment");
    });

    it("should throw error for non-existent card", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(cardService.getComments(fakeId)).rejects.toThrow(
        "Card not found"
      );
    });
  });
});
