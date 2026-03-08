"use client";

import { useMemo, useState } from "react";

type Category = "all" | "painting" | "digital" | "sculpture";

type Artwork = {
  category: Exclude<Category, "all">;
  title: string;
  image: string;
  thumbnail: string;
};

const artworks: Artwork[] = [
  {
    category: "painting",
    title: "Golden Echo",
    image: "https://source.unsplash.com/random/900x900?abstract,gold",
    thumbnail: "https://source.unsplash.com/random/600x600?abstract,gold",
  },
  {
    category: "digital",
    title: "Dark Orbit",
    image: "https://source.unsplash.com/random/900x900?dark,abstract",
    thumbnail: "https://source.unsplash.com/random/600x600?dark,abstract",
  },
  {
    category: "painting",
    title: "Bronze Silence",
    image: "https://source.unsplash.com/random/900x900?bronze,texture",
    thumbnail: "https://source.unsplash.com/random/600x600?bronze,texture",
  },
  {
    category: "digital",
    title: "Obsidian Pulse",
    image: "https://source.unsplash.com/random/900x900?dark,geometry",
    thumbnail: "https://source.unsplash.com/random/600x600?dark,geometry",
  },
  {
    category: "sculpture",
    title: "Solar Core",
    image: "https://source.unsplash.com/random/900x900?sculpture,art",
    thumbnail: "https://source.unsplash.com/random/600x600?sculpture,art",
  },
  {
    category: "painting",
    title: "Silent Halo",
    image: "https://source.unsplash.com/random/900x900?surreal,art",
    thumbnail: "https://source.unsplash.com/random/600x600?surreal,art",
  },
];

const filters: Category[] = ["all", "painting", "digital", "sculpture"];

export default function Page() {
  const [activeFilter, setActiveFilter] = useState<Category>("all");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const visibleArtworks = useMemo(() => {
    if (activeFilter === "all") return artworks;
    return artworks.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <main className="min-h-screen bg-[#08070b] font-[Inter,sans-serif] text-[#f4efe7]">
      <header className="sticky top-0 z-40 border-b border-yellow-900/20 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-700" />
            <span className="text-sm uppercase tracking-widest text-gray-300">
              MurMurLab
            </span>
          </div>

          <nav className="flex gap-6 text-sm text-gray-400">
            <a href="#">Artist</a>
            <a href="#gallery">Gallery</a>
            <a href="#">Contact</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-[#d6ba7d]">
            Featured Artist
          </p>

          <h1 className="mb-6 text-5xl font-semibold">PapiiDLèon</h1>

          <p className="mb-6 max-w-lg text-gray-400">
            MurMurLab presents a curated collection of atmospheric works exploring
            shadow, light, and surreal symbolism. Each piece exists between
            sculpture and painting.
          </p>

          <a
            href="#gallery"
            className="rounded-full bg-yellow-500 px-6 py-3 font-medium text-black"
          >
            View Collection
          </a>
        </div>

        <div>
          <img
            src="https://source.unsplash.com/random/800x800?abstract,art"
            alt="Featured artwork"
            className="rounded-3xl border border-yellow-900/20 shadow-2xl"
          />
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-6xl px-4 pb-24">
        <div className="mb-10 flex flex-wrap gap-3">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                className={`rounded-full border px-4 py-2 transition ${
                  isActive
                    ? "border-[#d6ba7d] bg-[rgba(214,186,125,.1)] text-white"
                    : "border-[rgba(214,186,125,.15)] text-[#b9aea0] hover:border-[#d6ba7d] hover:bg-[rgba(214,186,125,.1)] hover:text-white"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter[0].toUpperCase() + filter.slice(1)}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {visibleArtworks.map((artwork) => (
            <button
              type="button"
              key={artwork.title}
              onClick={() => setSelectedArtwork(artwork)}
              className="group overflow-hidden rounded-2xl border border-[rgba(214,186,125,.15)] bg-[#14111a] text-left transition duration-200 hover:-translate-y-1"
            >
              <img src={artwork.thumbnail} alt={artwork.title} />
              <div className="p-4">
                <h3 className="font-medium">{artwork.title}</h3>
                <p className="text-sm capitalize text-gray-400">{artwork.category}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedArtwork ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedArtwork(null);
            }
          }}
        >
          <div className="w-full max-w-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium">{selectedArtwork.title}</h2>
              <button
                type="button"
                aria-label="Close lightbox"
                onClick={() => setSelectedArtwork(null)}
                className="text-xl text-gray-400"
              >
                ×
              </button>
            </div>

            <img
              src={selectedArtwork.image}
              alt={selectedArtwork.title}
              className="rounded-xl border border-yellow-900/20 shadow-2xl"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
