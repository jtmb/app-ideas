import { expect, it } from "vitest";

it("should export pet routes", () => {
  const routes = require("../src/routes/pet");
  expect(routes).toBeDefined();
});
