import { NextResponse } from 'next/server';

import { uploadFileToPinata, uploadJsonToPinata } from '@/lib/pinata-server';

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = asTrimmedString(formData.get('name'));
    const description = asTrimmedString(formData.get('description'));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required.' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'The file cannot be empty.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed.' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be at most ${MAX_NAME_LENGTH} characters.` },
        { status: 400 },
      );
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required.' }, { status: 400 });
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        {
          error: `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    const imageHash = await uploadFileToPinata(file, `${name}-image`);
    const metadataHash = await uploadJsonToPinata(
      {
        name,
        description,
        image: `ipfs://${imageHash}`,
      },
      `${name}-metadata`,
    );

    return NextResponse.json(
      {
        imageIpfs: `ipfs://${imageHash}`,
        metadataIpfs: `ipfs://${metadataHash}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('IPFS upload route failed:', error);

    return NextResponse.json(
      { error: 'Unable to upload to IPFS right now. Please try again later.' },
      { status: 500 },
    );
  }
}
