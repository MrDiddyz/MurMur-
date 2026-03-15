import { NextResponse } from "next/server";
import { pinata } from "@/lib/pinata-server";

interface UploadRequestBody {
  imageUrl?: string;
  name?: string;
  description?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UploadRequestBody;
    const { imageUrl, name, description } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
    }

    const blob = await imageRes.blob();
    const file = new File([blob], "murmur.png", { type: blob.type || "image/png" });

    const imageUpload = await pinata.upload.file(file);
    const imageIpfs = `ipfs://${imageUpload.IpfsHash}`;

    const metadata = {
      name: name || "MurMur Artwork",
      description: description || "AI generated art",
      image: imageIpfs,
    };

    const metadataUpload = await pinata.upload.json(metadata);
    const metadataIpfs = `ipfs://${metadataUpload.IpfsHash}`;

    return NextResponse.json({
      imageIpfs,
      metadataIpfs,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "IPFS upload failed" }, { status: 500 });
  }
}
