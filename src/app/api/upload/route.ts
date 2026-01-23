import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const pinataFormData = new FormData();
        pinataFormData.append("file", file);

        const pinataKey = process.env.PINATA_API_KEY;
        const pinataSecret = process.env.PINATA_SECRET_API_KEY;

        const headers: any = {};

        // SMART AUTH: Detect if the secret is actually a JWT (starts with eyJ)
        if (pinataSecret?.startsWith('eyJ')) {
            headers['Authorization'] = `Bearer ${pinataSecret}`;
        } else {
            headers['pinata_api_key'] = pinataKey;
            headers['pinata_secret_api_key'] = pinataSecret;
        }

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: headers,
            body: pinataFormData,
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Pinata Error:", data);
            return NextResponse.json({ error: data.error || "Pinata upload failed" }, { status: res.status });
        }

        return NextResponse.json({ ipfsHash: data.IpfsHash });
    } catch (error: any) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
