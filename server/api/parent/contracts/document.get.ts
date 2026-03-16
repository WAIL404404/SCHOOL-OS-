import { createError, getQuery, setHeader } from 'h3'
import { childContractsById } from '~/shared/app/contracts'
import { findContractChildById, getContractReEnrollment, listContractSignerStatuses, listContractSignatures } from '~/server/utils/parent-contracts'

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(lines: string[]) {
  const title = lines[0] ?? 'School OS contract document'
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
  const type = typeof query.type === 'string' ? query.type : ''
  const ref = typeof query.ref === 'string' ? query.ref : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }
  const child = findContractChildById(childId)
  if (!child) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }
  const record = childContractsById[childId]
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Contracts record not found' })
  }

  let lines: string[] = []
  let fileName = 'contract-document'

  if (type === 'current') {
    const current = record.current
    const signers = listContractSignerStatuses(childId)
    lines = [
      `${current.title} · ${current.contractRef}`,
      `${child.fullName} · ${child.gradeLabel} · ${child.classLabel}`,
      `${child.school.name}`,
      `Start date: ${new Date(current.startsAt).toLocaleDateString('en-GB')}`,
      `End date: ${new Date(current.endsAt).toLocaleDateString('en-GB')}`,
      `Renewal deadline: ${new Date(current.renewalDate).toLocaleDateString('en-GB')}`,
      `Status: ${current.status.toUpperCase()}`,
      ...current.coverage.map((item) => `${item.included ? 'Covered' : 'Extra'}: ${item.label} · ${item.detail}`),
      ...signers.map((item) => `${item.label} (${item.fullName}): ${item.status.toUpperCase()}${item.signedAt ? ` at ${new Date(item.signedAt).toLocaleString('en-GB')}` : ''}`),
      `Cancellation policy: ${current.cancellationPolicy}`,
      current.legalNote
    ]
    fileName = current.contractRef.toLowerCase()
  } else if (type === 'history' || type === 'amendment') {
    const item = record.history.find((entry) => entry.pdfUrl.includes(ref)) ?? record.history.find((entry) => entry.kind === type)
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Archived contract not found' })
    }

    lines = [
      `${item.title} · ${item.yearLabel}`,
      `${child.fullName} · ${child.school.name}`,
      `Type: ${item.kind.toUpperCase()}`,
      `Signed at: ${new Date(item.signedAt).toLocaleString('en-GB')}`,
      `Summary: ${item.summary}`
    ]
    fileName = item.id.toLowerCase()
  } else if (type === 'reenrollment') {
    const item = getContractReEnrollment(childId)
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Re-enrollment document not found' })
    }
    const log = listContractSignatures(childId)
    lines = [
      `Re-enrollment · ${item.yearLabel}`,
      `${child.fullName} · ${child.school.name}`,
      `Status: ${item.status.toUpperCase()}`,
      `Submitted: ${new Date(item.submittedAt).toLocaleString('en-GB')}`,
      `Updated: ${new Date(item.updatedAt).toLocaleString('en-GB')}`,
      `Seat reserved: ${item.seatReserved ? `YES (${item.seatReservationCode ?? 'code pending'})` : 'NO'}`,
      `Early bird eligible: ${item.earlyBirdEligible ? 'YES' : 'NO'}`,
      `Early bird discount: ${item.earlyBirdDiscountMad ? `MAD ${item.earlyBirdDiscountMad}` : 'Not applicable'}`,
      ...item.documents.map((doc) => `${doc.label}: ${doc.status.toUpperCase()}${doc.fileName ? ` (${doc.fileName})` : ''}`),
      ...log.map((entry) => `Signature log: ${entry.signedBy} · ${entry.roleId} · ${new Date(entry.signedAt).toLocaleString('en-GB')} · IP ${entry.ipAddress}`)
    ]
    fileName = `reenrollment-${childId}`
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported contract document type' })
  }

  const pdf = buildPdf(lines)
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}.pdf"`)
  return pdf
})
