import { createError, getQuery, setHeader } from 'h3'
import { childFinanceById } from '~/shared/app/finance'
import { findFinanceChildById, listFinancePayments, listFinanceRequests } from '~/server/utils/parent-finance'

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(lines: string[]) {
  const title = lines[0] ?? 'School OS finance document'
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

function formatMad(amount: number) {
  return `MAD ${Math.round(amount).toLocaleString('en-GB')}`
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''
  const type = typeof query.type === 'string' ? query.type : ''
  const ref = typeof query.ref === 'string' ? query.ref : ''
  const year = typeof query.year === 'string' ? query.year : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }
  const child = findFinanceChildById(childId)
  if (!child) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const financeRecord = childFinanceById[childId]
  if (!financeRecord) {
    throw createError({ statusCode: 404, statusMessage: 'Finance record not found' })
  }

  let lines: string[] = []
  let fileLabel = 'finance-document'

  if (type === 'invoice' || type === 'receipt') {
    const history = listFinancePayments(childId)
    const payment = history.find((item) => item.invoiceRef === ref || item.receiptRef === ref) ?? history[0]
    if (!payment) {
      throw createError({ statusCode: 404, statusMessage: 'Payment document not found' })
    }

    lines = [
      `${type === 'invoice' ? 'Invoice' : 'Receipt'} · ${ref || payment.invoiceRef}`,
      `${child.fullName} · ${child.school.name}`,
      `${child.gradeLabel} · ${child.classLabel}`,
      `Posted: ${new Date(payment.postedAt).toLocaleString('en-GB')}`,
      `Amount: ${formatMad(payment.amountMad)}`,
      `Method: ${payment.method}`,
      `Status: ${payment.status.toUpperCase()}`,
      `Invoice ref: ${payment.invoiceRef}`,
      `Receipt ref: ${payment.receiptRef ?? 'Pending'}`
    ]
    if (payment.note) lines.push(`Note: ${payment.note}`)
    fileLabel = `${type}-${(ref || payment.invoiceRef).toLowerCase()}`
  } else if (type === 'agreement') {
    const requests = listFinanceRequests(childId)
    const item = requests.find((request) => request.agreementUrl?.includes(ref)) ?? requests.find((request) => request.type === 'installment_plan')
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Agreement not found' })
    }

    lines = [
      `Financial Agreement · ${ref || item.id}`,
      `${child.fullName} · ${child.school.name}`,
      `Request type: ${item.type}`,
      `Status: ${item.status.toUpperCase()}`,
      `Requested amount: ${item.requestedAmountMad ? formatMad(item.requestedAmountMad) : 'Not specified'}`,
      `Created: ${new Date(item.createdAt).toLocaleString('en-GB')}`,
      `Updated: ${new Date(item.updatedAt).toLocaleString('en-GB')}`,
      `Request detail: ${item.detail}`,
      'Digital signature: Parent accepted payment plan agreement terms in app.'
    ]
    fileLabel = `agreement-${(ref || item.id).toLowerCase()}`
  } else if (type === 'tax-certificate') {
    const doc = financeRecord.taxDocuments.find((item) => item.yearLabel === year) ?? financeRecord.taxDocuments[0]
    if (!doc) {
      throw createError({ statusCode: 404, statusMessage: 'Tax certificate not found' })
    }

    lines = [
      `Annual Fee Certificate · ${doc.yearLabel}`,
      `${child.fullName} · ${child.school.name}`,
      `${child.gradeLabel} · ${child.classLabel}`,
      `Generation status: ${doc.status.toUpperCase()}`,
      `Generated at: ${new Date(doc.generatedAt).toLocaleString('en-GB')}`,
      `Total paid: ${formatMad(doc.amountPaidMad)}`,
      `Auto-generation: ${financeRecord.autoGenerationNote}`
    ]
    fileLabel = `tax-certificate-${doc.yearLabel.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported document type' })
  }

  const pdf = buildPdf(lines)
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileLabel}.pdf"`)
  return pdf
})
