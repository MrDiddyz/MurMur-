import { MurmurStore, defaultStorePath } from "../src/murmurMediaEngine/store";
import { runMurmurPipeline } from "../src/murmurMediaEngine/pipeline";

async function main() {
  const store = new MurmurStore(defaultStorePath);
  const result = await runMurmurPipeline(
    {
      source: { name: "cli-seed", kind: "manual" },
      articles: [
        {
          title: "Semiconductor cycle update",
          body: "Chip makers see growth but analysts flag supply risk and pricing volatility.",
        },
        {
          title: "Media ad spend rotation",
          body: "Ad buyers repeat focus on creator-led channels and performance lift in small communities.",
        },
      ],
    },
    store,
  );

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
