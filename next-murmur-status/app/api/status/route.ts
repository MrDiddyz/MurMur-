import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Her kan du bytte ut IP med Terraform-output senere
    const murmurIp = process.env.MURMUR_IP || "127.0.0.1";
    const murmurPort = 64738;

    // Enkel TCP-check (dummy for nå)
    const status = {
      server: murmurIp,
      port: murmurPort,
      online: true,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(status, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Unable to fetch Murmur status" },
      { status: 500 }
    );
  }
}
