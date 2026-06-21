import unittest
from fastapi import HTTPException

from backend.auth.scopes import has_scope, require_scope, scope_matches


class ScopeMatchingTests(unittest.TestCase):
    def test_scope_matches_supports_global_wildcard(self):
        self.assertTrue(scope_matches("*", "admin:keys:read"))

    def test_scope_matches_supports_exact_matches(self):
        self.assertTrue(scope_matches("admin:keys:read", "admin:keys:read"))

    def test_scope_matches_supports_namespace_wildcard(self):
        self.assertTrue(scope_matches("admin:*", "admin:keys:rotate"))
        self.assertTrue(scope_matches("admin:*", "admin"))

    def test_scope_matches_rejects_non_matching_scopes(self):
        self.assertFalse(scope_matches("admin:*", "ops:dashboard:read"))
        self.assertFalse(scope_matches("admin:keys:read", "admin:keys:write"))

    def test_has_scope_checks_all_granted_scopes(self):
        granted = ["ops:read", "admin:*", "billing:write"]
        self.assertTrue(has_scope(granted, "admin:keys:read"))
        self.assertFalse(has_scope(granted, "support:read"))

    def test_require_scope_raises_403_for_missing_scope(self):
        with self.assertRaises(HTTPException) as context:
            require_scope(["ops:read"], "admin:keys:read")
        self.assertEqual(context.exception.status_code, 403)
        self.assertIn("Missing required scope", context.exception.detail)


if __name__ == "__main__":
    unittest.main()
