import { expect, it } from "vitest";

it("should export auth middleware", () => {
  const middleware = require("../src/middleware/auth");
  expect(middleware).toBeDefined();
});
