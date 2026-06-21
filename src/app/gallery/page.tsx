"use client";

import { useEffect, useState } from "react";
import { getGalleryItems } from "@murmur/blockchain";
import { ipfsToGatewayUrl } from "@murmur/ipfs";

type MetadataAttribute = {
  trait_type: string;
  value: string;
};

type GalleryCard = {
  tokenId: number;
  tokenUri: string;
  name: string;
  description: string;
  image: string;
  attributes: MetadataAttribute[];
};

const DEMO_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";

function normalizeUri(uri: string): string {
  return ipfsToGatewayUrl(uri);
}

export default function GalleryPage() {
  const [contractAddress, setContractAddress] = useState(DEMO_CONTRACT);
  const [items, setItems] = useState<GalleryCard[]>([]);
  const [status, setStatus] = useState("Ready.");

  async function loadGallery() {
    if (!contractAddress.trim()) {
      setStatus("Add a contract address first.");
      setItems([]);
      return;
    }

    try {
      setStatus("Loading gallery from contract...");

      const galleryItems = await getGalleryItems({
        contractAddress,
      });

      const cards = await Promise.all(
        galleryItems.map(async (item) => {
          const metadataUrl = normalizeUri(item.tokenUri);
          const response = await fetch(metadataUrl);
          const metadata = (await response.json()) as {
            name?: string;
            description?: string;
            image?: string;
            attributes?: MetadataAttribute[];
          };

          return {
            tokenId: item.tokenId,
            tokenUri: item.tokenUri,
            name: metadata.name || `MurMur NFT #${item.tokenId}`,
            description: metadata.description || "No description",
            image: metadata.image ? normalizeUri(metadata.image) : "",
            attributes: metadata.attributes || [],
          };
        }),
      );

      setItems(cards);
      setStatus(`Loaded ${cards.length} NFT${cards.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setItems([]);
      setStatus(error instanceof Error ? error.message : "Failed to load gallery.");
    }
  }

  useEffect(() => {
    if (contractAddress.trim()) {
      void loadGallery();
    }
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            background: "#141420",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h1 style={{ marginTop: 0 }}>MurMur Gallery</h1>
          <p style={{ color: "#a8b0c3" }}>
            Live contract read using <code>tokenCounter()</code> and <code>tokenURI()</code>.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              style={{ flex: 1, minWidth: 280 }}
              placeholder="NFT contract address"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            />
            <button onClick={loadGallery}>Refresh gallery</button>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              background: "#0f1020",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <strong>Status:</strong> {status}
          </div>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {items.map((item) => (
            <article
              key={item.tokenId}
              style={{
                background: "#141420",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  aspectRatio: "1 / 1",
                  background: "#0f1020",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: "#a8b0c3" }}>No image</span>
                )}
              </div>

              <div style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h2 style={{ margin: "0 0 6px", fontSize: 20 }}>{item.name}</h2>
                    <div style={{ color: "#a8b0c3", fontSize: 14 }}>Token #{item.tokenId}</div>
                  </div>
                </div>

                <p style={{ color: "#d8deee", lineHeight: 1.6 }}>{item.description}</p>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#a8b0c3",
                    wordBreak: "break-word",
                  }}
                >
                  <strong style={{ color: "#fff" }}>Token URI:</strong> {item.tokenUri}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
