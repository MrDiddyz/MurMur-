import unittest

from app import ArtistStudioRequest, run_artist_studio


class ArtistStudioTests(unittest.TestCase):
    def test_known_and_unknown_modules_are_partitioned(self) -> None:
        req = ArtistStudioRequest(
            user="artist_id",
            modules=["beat_generator", "lyrics_ai", "voice_trainer", "mixing_ai", "foo"],
            genres=["trap", "opera"],
            language="no",
            project="Midnight Echo",
            tempo_bpm=92,
            genre="Cinematic Trap",
        )

        payload = run_artist_studio(req)

        self.assertEqual(payload["artistId"], "artist_id")
        self.assertEqual(payload["enabledModules"], ["beat_generator", "lyrics_ai", "voice_trainer", "mixing_ai"])
        self.assertEqual(payload["unknownModules"], ["foo"])
        self.assertEqual(len(payload["plan"]), 4)
        self.assertEqual(payload["studio"], "MurMur Studio")
        self.assertEqual(payload["project"], "Midnight Echo")
        self.assertEqual(payload["tempoBpm"], 92)
        self.assertEqual(payload["genre"], "Cinematic Trap")
        self.assertIn("[ Mixing AI ]", payload["moduleCards"])
        self.assertTrue(all(step["language"] == "no" for step in payload["plan"]))
        self.assertTrue(all(step["genres"] == ["trap", "opera"] for step in payload["plan"]))


if __name__ == "__main__":
    unittest.main()
