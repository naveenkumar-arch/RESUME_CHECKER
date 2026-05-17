import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return extractFromPDF(file);
  if (ext === 'docx' || ext === 'doc') return extractFromDOCX(file);
  if (ext === 'txt') return file.text();
  throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
}

async function extractFromPDF(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: unknown) => (item as { str: string }).str).join(' ') + '\n';
  }
  return text.replace(/\s{3,}/g, '  ').trim();
}

async function extractFromDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.replace(/\s{3,}/g, '  ').trim();
}
