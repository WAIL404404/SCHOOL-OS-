import { createError, getQuery, setHeader } from 'h3'
import { findActivityChildById, listActivityTracking } from '~/server/utils/parent-activities'

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(lines: string[]) {
  const title = lines[0] ?? 'School OS participation certificate'
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
  const activityId = typeof query.activity === 'string' ? query.activity : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }
  const child = findActivityChildById(childId)
  if (!child) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const tracking = listActivityTracking(childId)
  const item = tracking.find((entry) => entry.activityId === activityId) ?? tracking[0]
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Participation record not found' })
  }

  const attendanceRate = item.attendance.length
    ? `${Math.round((item.attendance.filter((entry) => entry.attended).length / item.attendance.length) * 100)}%`
    : 'N/A'

  const lines = [
    `Participation Certificate · ${item.activityName}`,
    `${child.fullName} · ${child.school.name}`,
    `${child.gradeLabel} · ${child.classLabel}`,
    `Issued: ${new Date().toLocaleDateString('en-GB')}`,
    `Attendance rate: ${attendanceRate}`,
    ...item.skillAssessment.map((skill) => `${skill.skill}: ${skill.level.toUpperCase()} · ${skill.detail}`),
    `Showcase info: ${item.showcaseInfo}`
  ]

  const pdf = buildPdf(lines)
  const safeName = `${child.fullName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${item.activityId}.pdf`
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `attachment; filename="${safeName}"`)
  return pdf
})
