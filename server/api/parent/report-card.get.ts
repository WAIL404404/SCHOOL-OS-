import { createError, getQuery, setHeader } from 'h3'
import { seedParentAccounts } from '~/shared/app/data'

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(lines: string[]) {
  const title = lines[0] ?? 'School OS report card'
  const contentLines = ['BT', '/F1 18 Tf', '1 0 0 1 50 790 Tm', `(${escapePdfText(title)}) Tj`, '/F1 11 Tf']
  let y = 764

  for (const line of lines.slice(1)) {
    contentLines.push(`1 0 0 1 50 ${y} Tm (${escapePdfText(line)}) Tj`)
    y -= 18
  }

  contentLines.push('ET')
  const stream = contentLines.join('\n')
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(stream, 'utf8')} >> stream\n${stream}\nendstream endobj`
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${object}\n`
  }

  const xrefStart = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return Buffer.from(pdf, 'utf8')
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''
  const termId = typeof query.term === 'string' ? query.term : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  const child = seedParentAccounts.flatMap((account) => account.children).find((item) => item.id === childId)
  if (!child?.academics?.reportCard) {
    throw createError({ statusCode: 404, statusMessage: 'Report card not found' })
  }

  if (termId && child.academics.reportCard.termId !== termId) {
    throw createError({ statusCode: 404, statusMessage: 'Requested term not found' })
  }

  const lines = [
    `${child.fullName} - ${child.academics.reportCard.trimesterLabel}`,
    `${child.school.name} - ${child.gradeLabel} - ${child.classLabel}`,
    `Published: ${child.academics.reportCard.publishedAt}`,
    `Overall average: ${child.academics.overallAverage}`,
    `Class average: ${child.academics.classAverage}`,
    `Year comparison: ${child.academics.yearComparison}`,
    ...child.academics.subjectGrades.map((subject) => `${subject.subject}: ${subject.latestGrade} (class ${subject.classAverage})`),
    `Attendance today: ${child.academics.attendance.todayStatus.toUpperCase()} - ${child.academics.attendance.todayDetail}`
  ]

  const pdf = buildPdf(lines)
  const safeName = `${child.fullName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${child.academics.reportCard.termId}.pdf`

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `attachment; filename="${safeName}"`)
  return pdf
})
