import test from "node:test";
import assert from "node:assert/strict";
import { can, type AuthContext } from "./authz.js";

const context = (permissions: string[]): AuthContext => ({
  user: {
    id: "u1",
    email: "operator@murmur.local",
    roleId: "r1",
    createdAt: new Date()
  },
  permissions: new Set(permissions)
});

test("can returns true when permission exists", () => {
  assert.equal(can(context(["session.start"]), "session.start"), true);
});

test("can returns false when permission does not exist", () => {
  assert.equal(can(context(["session.read"]), "session.stop"), false);
});
