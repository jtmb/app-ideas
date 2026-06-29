import { expect, it } from "vitest";

it("should export models", () => {
  const models = require("../src/models");
  expect(models).toBeDefined();
});
