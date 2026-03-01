import { describe, expect, test } from "vitest";
import { MusicEngine } from "../src/engine/MusicEngine";

describe("MusicEngine", () => {
  test("builds a prompt and computes bars", () => {
    const engine = new MusicEngine();
    const result = engine.compose(
      { title: "Skyline", bpm: 124, key: "A minor", genre: "electronic" },
      [
        { section: "intro", bars: 8 },
        { section: "drop", bars: 16 }
      ]
    );

    expect(result.prompt).toContain("Skyline");
    expect(result.lengthInBars).toBe(24);
  });
});
