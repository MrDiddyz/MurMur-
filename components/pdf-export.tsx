'use client';

import { Button } from '@/components/ui/button';

export function PdfExport() {
  return <Button variant="secondary" onClick={() => window.print()}>Export PDF</Button>;
}
