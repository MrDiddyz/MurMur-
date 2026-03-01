import importlib.util
import tempfile
import unittest
from pathlib import Path

from modules.config import load_config

HAS_YAML = importlib.util.find_spec("yaml") is not None


@unittest.skipUnless(HAS_YAML, "PyYAML is not installed in this environment")
class ConfigTests(unittest.TestCase):
    def test_load_config_parses_valid_yaml(self) -> None:
        yaml_text = """
canvas:
  size: 1080
  margin: 32
theme:
  background: "#000"
  accent: "#0ff"
  soft: "#aaa"
branding:
  symbol: "★"
  footer_left: "MurMur"
  footer_right_prefix: "@"
fonts:
  quote: "Inter"
  ui: "Arial"
sizes:
  quote: 64
  subtitle: 28
  footer: 22
layout:
  line_spacing: 16
  quote_y_ratio: 0.42
  subtitle_gap: 20
  footer_y_offset: 48
effects:
  glow: true
  glow_radius: 6
  glow_strength: 2
""".strip()

        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "config.yaml"
            path.write_text(yaml_text, encoding="utf-8")
            config = load_config(str(path))

        self.assertEqual(config.canvas.size, 1080)
        self.assertEqual(config.theme.accent, "#0ff")
        self.assertEqual(config.layout.quote_y_ratio, 0.42)
        self.assertTrue(config.effects.glow)

    def test_load_config_raises_for_missing_file(self) -> None:
        with self.assertRaises(FileNotFoundError):
            load_config("/tmp/definitely-missing-config.yaml")

    def test_load_config_raises_for_directory_path(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            with self.assertRaises(IsADirectoryError):
                load_config(tmpdir)

    def test_load_config_raises_for_missing_key(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "config.yaml"
            path.write_text("theme: {}\n", encoding="utf-8")

            with self.assertRaises(KeyError):
                load_config(str(path))

    def test_load_config_raises_for_non_mapping_root(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "config.yaml"
            path.write_text("- not\n- a\n- mapping\n", encoding="utf-8")

            with self.assertRaises(TypeError):
                load_config(str(path))

    def test_load_config_raises_for_non_mapping_section(self) -> None:
        yaml_text = """
canvas: oops
theme:
  background: "#000"
  accent: "#0ff"
  soft: "#aaa"
branding:
  symbol: "★"
  footer_left: "MurMur"
  footer_right_prefix: "@"
fonts:
  quote: "Inter"
  ui: "Arial"
sizes:
  quote: 64
  subtitle: 28
  footer: 22
layout:
  line_spacing: 16
  quote_y_ratio: 0.42
  subtitle_gap: 20
  footer_y_offset: 48
effects:
  glow: true
  glow_radius: 6
  glow_strength: 2
""".strip()

        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "config.yaml"
            path.write_text(yaml_text, encoding="utf-8")

            with self.assertRaises(TypeError):
                load_config(str(path))

    def test_load_config_parses_boolean_string_values(self) -> None:
        yaml_text = """
canvas:
  size: 1080
  margin: 32
theme:
  background: "#000"
  accent: "#0ff"
  soft: "#aaa"
branding:
  symbol: "★"
  footer_left: "MurMur"
  footer_right_prefix: "@"
fonts:
  quote: "Inter"
  ui: "Arial"
sizes:
  quote: 64
  subtitle: 28
  footer: 22
layout:
  line_spacing: 16
  quote_y_ratio: 0.42
  subtitle_gap: 20
  footer_y_offset: 48
effects:
  glow: "true"
  glow_radius: 6
  glow_strength: 2
""".strip()

        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "config.yaml"
            path.write_text(yaml_text, encoding="utf-8")
            config = load_config(str(path))

        self.assertTrue(config.effects.glow)

    def test_load_config_rejects_invalid_boolean_values(self) -> None:
        yaml_text = """
canvas:
  size: 1080
  margin: 32
theme:
  background: "#000"
  accent: "#0ff"
  soft: "#aaa"
branding:
  symbol: "★"
  footer_left: "MurMur"
  footer_right_prefix: "@"
fonts:
  quote: "Inter"
  ui: "Arial"
sizes:
  quote: 64
  subtitle: 28
  footer: 22
layout:
  line_spacing: 16
  quote_y_ratio: 0.42
  subtitle_gap: 20
  footer_y_offset: 48
effects:
  glow: "not-bool"
  glow_radius: 6
  glow_strength: 2
""".strip()

        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "config.yaml"
            path.write_text(yaml_text, encoding="utf-8")

            with self.assertRaises(TypeError):
                load_config(str(path))


class ConfigDependencyTests(unittest.TestCase):
    def test_load_config_raises_clear_error_when_pyyaml_missing(self) -> None:
        from unittest.mock import patch
        import builtins

        real_import = builtins.__import__

        def fake_import(name, *args, **kwargs):
            if name == "yaml":
                raise ModuleNotFoundError("No module named 'yaml'")
            return real_import(name, *args, **kwargs)

        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "config.yaml"
            path.write_text("canvas: {}\n", encoding="utf-8")
            with patch("builtins.__import__", side_effect=fake_import):
                with self.assertRaises(ModuleNotFoundError) as ctx:
                    load_config(str(path))

        self.assertIn("PyYAML is required", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
