import { expect, it } from "vitest";

it("should export config module", () => {
  const config = require("../src/config/database");
  expect(config).toBeDefined();
});
