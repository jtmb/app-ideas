import { expect, it } from "vitest";

it("should export pet controller", () => {
  const controller = require("../src/controllers/pet");
  expect(controller).toBeDefined();
});
