import { type Course } from '@/lib/learning';
import { wrapCanvasText } from './text';

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.95) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Não foi possível gerar a imagem do certificado.'));
    }, type, quality);
  });
}

export function createPdfFromJpeg(image: Uint8Array, width: number, height: number) {
  const encoder = new TextEncoder();
  const chunks: (string | Uint8Array)[] = [];
  const offsets: number[] = [];
  let length = 0;

  const add = (chunk: string | Uint8Array) => {
    chunks.push(chunk);
    length += typeof chunk === 'string' ? encoder.encode(chunk).length : chunk.byteLength;
  };

  const addObject = (body: string | Uint8Array, prefix: string, suffix = '\nendobj\n') => {
    offsets.push(length);
    add(prefix);
    add(body);
    add(suffix);
  };

  const pageWidth = 842;
  const pageHeight = 595;
  const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ`;

  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  addObject('<< /Type /Catalog /Pages 2 0 R >>', '1 0 obj\n');
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '2 0 obj\n');
  addObject(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    '3 0 obj\n',
  );
  addObject(
    image,
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.byteLength} >>\nstream\n`,
    '\nendstream\nendobj\n',
  );
  addObject(content, `5 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n`, '\nendstream\nendobj\n');

  const xrefOffset = length;
  add(`xref\n0 6\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob(chunks, { type: 'application/pdf' });
}

export async function createCertificatePdf(course: Course, competencies: string[], currentUser: { name: string }) {
  const width = 1684;
  const height = 1190;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível preparar o certificado.');
  }

  const issueDate = new Date().toLocaleDateString('pt-BR');
  const certificateCode = `INN-${course.id}-100-${Date.now().toString().slice(-6)}`;
  const totalMinutes = course.modules.reduce((sum, module) => sum + module.time, 0);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#17C7B2');
  gradient.addColorStop(1, '#1464E9');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 24);
  ctx.fillRect(0, height - 24, width, 24);

  ctx.strokeStyle = '#d5dce5';
  ctx.lineWidth = 4;
  ctx.strokeRect(74, 74, width - 148, height - 148);
  ctx.strokeStyle = '#1464E9';
  ctx.lineWidth = 2;
  ctx.strokeRect(104, 104, width - 208, height - 208);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#111827';
  ctx.font = '700 44px Arial';
  ctx.fillText('InnovaGov', width / 2, 178);

  ctx.fillStyle = '#1464E9';
  ctx.font = '700 72px Arial';
  ctx.fillText('CERTIFICADO', width / 2, 290);

  ctx.fillStyle = '#4b5563';
  ctx.font = '400 30px Arial';
  ctx.fillText('Certificamos que', width / 2, 390);

  ctx.fillStyle = '#111827';
  ctx.font = '700 54px Arial';
  ctx.fillText(currentUser.name, width / 2, 475);

  ctx.fillStyle = '#4b5563';
  ctx.font = '400 30px Arial';
  ctx.fillText('concluiu com êxito o curso', width / 2, 548);

  ctx.fillStyle = '#111827';
  ctx.font = '700 44px Arial';
  wrapCanvasText(ctx, course.title, 1160).forEach((line, index) => {
    ctx.fillText(line, width / 2, 625 + index * 52);
  });

  ctx.fillStyle = '#4b5563';
  ctx.font = '400 26px Arial';
  ctx.fillText(`Carga horária: ${totalMinutes} minutos   •   Nível: ${course.level}`, width / 2, 760);

  ctx.fillStyle = '#1464E9';
  ctx.font = '700 28px Arial';
  ctx.fillText('Competências desenvolvidas', width / 2, 835);

  ctx.fillStyle = '#374151';
  ctx.font = '400 25px Arial';
  wrapCanvasText(ctx, competencies.join(' • '), 1120).slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, width / 2, 885 + index * 34);
  });

  ctx.fillStyle = '#6b7280';
  ctx.font = '400 23px Arial';
  ctx.fillText(`Data de emissão: ${issueDate}`, width / 2, 1010);
  ctx.font = '700 23px Arial';
  ctx.fillText(`Código: ${certificateCode}`, width / 2, 1050);

  const imageBlob = await canvasToBlob(canvas);
  const image = new Uint8Array(await imageBlob.arrayBuffer());
  return createPdfFromJpeg(image, width, height);
}
