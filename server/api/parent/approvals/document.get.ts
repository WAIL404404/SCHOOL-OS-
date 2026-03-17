import { createError, getQuery, setHeader } from 'h3'
import { findApprovalChildById, getApprovalRecord } from '~/server/utils/parent-approvals'

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(lines: string[]) {
  const title = lines[0] ?? 'School OS approval document'
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
  const approvalId = typeof query.approval === 'string' ? query.approval : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  const child = findApprovalChildById(childId)
  if (!child) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const record = getApprovalRecord(childId)
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Approvals record not found' })
  }

  const approval = record.items.find((item) => item.id === approvalId) ?? record.items[0]
  if (!approval) {
    throw createError({ statusCode: 404, statusMessage: 'Approval not found' })
  }

  const relatedLog = record.signatureLog.filter((item) => item.approvalId === approval.id)
  const lines = [
    `${approval.title} · ${approval.id}`,
    `${child.fullName} · ${child.gradeLabel} · ${child.classLabel}`,
    `${child.school.name}`,
    `Type: ${approval.type}`,
    `Status: ${approval.status.toUpperCase()}`,
    `Requested by: ${approval.requestedBy}`,
    `Requested at: ${new Date(approval.requestedAt).toLocaleString('en-GB')}`,
    `Updated at: ${new Date(approval.updatedAt).toLocaleString('en-GB')}`,
    `Event date: ${approval.eventDate ? new Date(approval.eventDate).toLocaleString('en-GB') : 'Not event-based'}`,
    `Summary: ${approval.summary}`,
    `Detail: ${approval.detail}`,
    ...approval.attachments.map((item) => `Attachment: ${item.label} (${item.kind.toUpperCase()})`),
    ...approval.reminders.map((item) => `Reminder ${item.triggerHoursAfter}h: ${item.status.toUpperCase()} at ${new Date(item.scheduledFor).toLocaleString('en-GB')}`),
    ...relatedLog.map((item) => `${item.action.toUpperCase()}: ${item.actorName} · ${new Date(item.actedAt).toLocaleString('en-GB')} · IP ${item.ipAddress} · ${item.deviceInfo}`),
    `School confirmation: ${approval.schoolConfirmation}`,
    `Revocation policy: ${approval.revokePolicy}`
  ]

  const pdf = buildPdf(lines)
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `attachment; filename="${approval.id.toLowerCase()}.pdf"`)
  return pdf
})
