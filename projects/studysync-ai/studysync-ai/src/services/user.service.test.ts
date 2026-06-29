import { describe, it, expect, jest } from "@jest/globals";
import { getUserById, updateUser } from "./user.service";

describe("UserService", () => {
  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        bio: "Student",
        avatarUrl: "https://example.com/avatar.jpg",
        timezone: "America/New_York",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-06-01"),
      };

      jest.mock("pg", () => ({
        createPool: jest.fn(() => ({
          query: jest.fn((sql, params) => {
            if (params && params[0] === "1") {
              return Promise.resolve({ rows: [mockUser] });
            }
            return Promise.resolve({ rows: [] });
          }),
        })),
      }));

      const result = await getUserById("1");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      jest.mock("pg", () => ({
        createPool: jest.fn(() => ({
          query: jest.fn(() => Promise.resolve({ rows: [] })),
        })),
      }));

      const result = await getUserById("999");
      expect(result).toBeNull();
    });

    it("should throw error on database failure", async () => {
      jest.mock("pg", () => ({
        createPool: jest.fn(() => ({
          query: jest.fn(() => Promise.reject(new Error("Connection failed"))),
        })),
      }));

      await expect(getUserById("1")).rejects.toThrow("Failed to fetch user");
    });
  });

  describe("updateUser", () => {
    it("should update user with valid data", async () => {
      const userId = "1";
      const updateData = { name: "Updated Name", email: "updated@example.com" };

      jest.mock("pg", () => ({
        createPool: jest.fn(() => ({
          query: jest.fn((sql, params) => {
            if (sql.includes("UPDATE users")) {
              return Promise.resolve({ rows: [{ id: userId, name: "Updated Name", email: "updated@example.com" }] });
            }
            return Promise.resolve({ rows: [] });
          }),
        })),
      }));

      const result = await updateUser(userId, updateData);
      expect(result.name).toBe("Updated Name");
      expect(result.email).toBe("updated@example.com");
    });

    it("should lowercase and trim email", async () => {
      const userId = "1";
      const updateData = { name: "Test User", email: "  TEST@EXAMPLE.COM  " };

      jest.mock("pg", () => ({
        createPool: jest.fn(() => ({
          query: jest.fn((sql, params) => {
            if (sql.includes("UPDATE users")) {
              return Promise.resolve({ rows: [] });
            }
            return Promise.resolve({ rows: [{ id: userId, name: "Test User", email: "test@example.com" }] });
          }),
        })),
      }));

      const result = await updateUser(userId, updateData);
      expect(result.email).toBe("test@example.com");
    });

    it("should throw error when no valid fields to update", async () => {
      jest.mock("pg", () => ({
        createPool: jest.fn(() => ({
          query: jest.fn(() => Promise.reject(new Error("No valid fields"))),
        })),
      }));

      await expect(updateUser("1", {})).rejects.toThrow("No valid fields to update");
    });

    it("should throw error on database failure", async () => {
      jest.mock("pg", () => ({
        createPool: jest.fn(() => ({
          query: jest.fn(() => Promise.reject(new Error("Database error"))),
        })),
      }));

      await expect(updateUser("1", { name: "Test" })).rejects.toThrow("Failed to update user");
    });
  });
});
