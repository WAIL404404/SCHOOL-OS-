<script setup lang="ts">
import { motion } from 'motion-v'
import type { FinancialPaymentHistoryRecord, FinancialRequestRecord, ParentFinancialView } from '~/shared/app/types'

const props = defineProps<{
  viewModel: ParentFinancialView
}>()

const emit = defineEmits<{
  selectChild: [childId: string]
}>()

const paymentMode = ref<'full' | 'partial' | 'installment'>('full')
const paymentGateway = ref<'CMI (Morocco)' | 'Stripe' | 'PayPal'>('CMI (Morocco)')
const partialAmount = ref('')
const installmentCount = ref<2 | 3 | 4>(2)
const enableAutoPay = ref(false)
const paymentFeedback = ref('')
const paymentFeedbackTone = ref<'success' | 'error'>('success')
const paymentLoading = ref(false)

const requestType = ref<'installment_plan' | 'discount' | 'scholarship'>('installment_plan')
const requestAmount = ref('')
const requestDetail = ref('')
const agreementAccepted = ref(false)
const requestFeedback = ref('')
const requestFeedbackTone = ref<'success' | 'error'>('success')
const requestLoading = ref(false)

const liveHistory = ref<FinancialPaymentHistoryRecord[]>([])
const liveRequests = ref<FinancialRequestRecord[]>([])
const loadingFinanceFeed = ref(false)
const feedError = ref('')

watch(
  () => props.viewModel.activeChildId,
  (childId) => {
    paymentFeedback.value = ''
    requestFeedback.value = ''
    feedError.value = ''
    partialAmount.value = ''
    requestAmount.value = ''
    requestDetail.value = ''
    agreementAccepted.value = false
    void refreshLiveData(childId)
  },
  { immediate: true }
)

const paymentHistory = computed(() => {
  if (liveHistory.value.length) return liveHistory.value
  return props.viewModel.paymentTracking.history
})

const requestItems = computed(() => {
  if (liveRequests.value.length) return liveRequests.value
  return props.viewModel.requests.items
})

function formatMad(amount: number) {
  return `MAD ${Math.round(amount).toLocaleString('en-GB')}`
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function monthlyStatusPill(status: 'paid' | 'pending' | 'overdue') {
  if (status === 'paid') return 'status-pill'
  if (status === 'overdue') return 'status-pill status-pill--alert'
  return 'status-pill status-pill--warning'
}

function monthlyStatusLabel(status: 'paid' | 'pending' | 'overdue') {
  if (status === 'paid') return 'Paid'
  if (status === 'overdue') return 'Overdue'
  return 'Pending'
}

function requestStatusPill(status: FinancialRequestRecord['status']) {
  if (status === 'approved') return 'status-pill'
  if (status === 'rejected') return 'status-pill status-pill--alert'
  if (status === 'reviewing') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--neutral'
}

function requestStatusLabel(status: FinancialRequestRecord['status']) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'reviewing') return 'Reviewing'
  return 'Submitted'
}

function requestTypeLabel(type: FinancialRequestRecord['type']) {
  if (type === 'installment_plan') return 'Installment plan'
  if (type === 'discount') return 'Discount'
  return 'Scholarship'
}

async function refreshLiveData(childId: string | null) {
  if (!childId) {
    liveHistory.value = []
    liveRequests.value = []
    return
  }

  loadingFinanceFeed.value = true
  feedError.value = ''
  try {
    const [payments, requests] = await Promise.all([
      $fetch<{ items: FinancialPaymentHistoryRecord[] }>('/api/parent/finance/payments', { query: { child: childId } }),
      $fetch<{ items: FinancialRequestRecord[] }>('/api/parent/finance/requests', { query: { child: childId } })
    ])
    liveHistory.value = payments.items
    liveRequests.value = requests.items
  } catch {
    feedError.value = 'Live finance history could not be refreshed. Showing seeded records.'
    liveHistory.value = []
    liveRequests.value = []
  } finally {
    loadingFinanceFeed.value = false
  }
}

async function submitPayment() {
  const childId = props.viewModel.activeChildId
  if (!childId) {
    paymentFeedbackTone.value = 'error'
    paymentFeedback.value = 'No linked child is selected for payment.'
    return
  }

  let amountMad = 0
  const pendingMonth = props.viewModel.paymentTracking.monthlyStatus.find((item) => item.status === 'pending' || item.status === 'overdue')
  if (paymentMode.value === 'full') {
    amountMad = pendingMonth?.amountDueMad ?? 0
  } else if (paymentMode.value === 'partial') {
    amountMad = Number(partialAmount.value || 0)
  } else {
    amountMad = pendingMonth?.amountDueMad ?? 0
  }

  if (!Number.isFinite(amountMad) || amountMad < props.viewModel.onlinePayment.partialPaymentMinMad) {
    paymentFeedbackTone.value = 'error'
    paymentFeedback.value = `Enter an amount of at least ${formatMad(props.viewModel.onlinePayment.partialPaymentMinMad)}.`
    return
  }

  paymentLoading.value = true
  paymentFeedback.value = ''
  try {
    const response = await $fetch<{
      entry: FinancialPaymentHistoryRecord
      confirmation: { message: string; receiptUrl: string | null }
      items: FinancialPaymentHistoryRecord[]
    }>('/api/parent/finance/payments', {
      method: 'POST',
      body: {
        childId,
        gateway: paymentGateway.value,
        mode: paymentMode.value,
        amountMad,
        installments: paymentMode.value === 'installment' ? installmentCount.value : null,
        autoPay: enableAutoPay.value
      }
    })

    liveHistory.value = response.items
    paymentFeedbackTone.value = 'success'
    paymentFeedback.value = response.confirmation.receiptUrl
      ? `${response.confirmation.message} Receipt is ready for download now.`
      : response.confirmation.message
    partialAmount.value = ''
  } catch {
    paymentFeedbackTone.value = 'error'
    paymentFeedback.value = 'Payment could not be processed right now. Please try again.'
  } finally {
    paymentLoading.value = false
  }
}

async function submitFinancialRequest() {
  const childId = props.viewModel.activeChildId
  if (!childId) {
    requestFeedbackTone.value = 'error'
    requestFeedback.value = 'No linked child is selected for this request.'
    return
  }

  const detail = requestDetail.value.trim()
  if (!detail) {
    requestFeedbackTone.value = 'error'
    requestFeedback.value = 'Add a short explanation before sending your request.'
    return
  }

  if (requestType.value === 'installment_plan' && !agreementAccepted.value) {
    requestFeedbackTone.value = 'error'
    requestFeedback.value = 'Please accept the digital agreement for installment plans before submitting.'
    return
  }

  requestLoading.value = true
  requestFeedback.value = ''
  try {
    const response = await $fetch<{
      item: FinancialRequestRecord
      items: FinancialRequestRecord[]
      notification: string
    }>('/api/parent/finance/requests', {
      method: 'POST',
      body: {
        childId,
        type: requestType.value,
        requestedAmountMad: Number(requestAmount.value || 0) > 0 ? Number(requestAmount.value) : null,
        detail,
        agreementAccepted: agreementAccepted.value
      }
    })

    liveRequests.value = response.items
    requestFeedbackTone.value = 'success'
    requestFeedback.value = response.notification
    requestAmount.value = ''
    requestDetail.value = ''
    agreementAccepted.value = false
  } catch {
    requestFeedbackTone.value = 'error'
    requestFeedback.value = 'The request could not be sent right now. Please try again.'
  } finally {
    requestLoading.value = false
  }
}
</script>

<template>
  <div>
    <motion.section
      class="dashboard-hero-card"
      :initial="{ opacity: 0, y: 18 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.35 }"
    >
      <template v-if="props.viewModel.activeChild">
        <div class="dashboard-hero-card__media">
          <div class="student-avatar">{{ props.viewModel.activeChildInitials }}</div>
        </div>
        <div class="dashboard-hero-card__content">
          <p class="eyebrow">Financial transparency</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} · {{ props.viewModel.activeChild.gradeLabel }} · {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ formatMad(props.viewModel.paymentTracking.totalPaidThisYearMad) }} paid this year</span>
            <span>{{ formatMad(props.viewModel.paymentTracking.totalOutstandingMad) }} outstanding</span>
            <span>{{ props.viewModel.paymentTracking.monthlyStatus.filter((item) => item.status === 'overdue').length }} overdue month(s)</span>
          </div>
          <p class="dashboard-hero-card__highlight">{{ props.viewModel.fees.yearOverYearLabel }}</p>
        </div>
        <div class="dashboard-hero-card__switcher">
          <p class="eyebrow">Switch child</p>
          <div class="child-switcher">
            <button
              v-for="child in props.viewModel.childTabs"
              :key="child.id"
              class="child-switcher__button"
              :class="{ 'child-switcher__button--active': child.isActive }"
              type="button"
              @click="emit('selectChild', child.id)"
            >
              <span class="child-switcher__avatar">{{ child.initials }}</span>
              <span>
                <strong>{{ child.fullName }}</strong>
                <small>{{ child.gradeLabel }} · {{ child.schoolName }}</small>
              </span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="hero-summary hero-summary--single">
          <article class="hero-summary__card">
            <p class="eyebrow">Financial transparency</p>
            <h3>No financial profile linked yet</h3>
            <p>As soon as a child profile is linked, fee structure, invoices, payment history, and tax certificates will appear here automatically.</p>
          </article>
        </div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">At a glance</p>
        <h2>Financial pulse</h2>
        <p>Top billing and payment indicators stay visible without opening separate tools.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <p v-if="feedError" class="form-message form-message--error">{{ feedError }}</p>
      <p v-else-if="loadingFinanceFeed" class="module-note">Refreshing payment and request status...</p>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">4.1 Fee structure</p>
        <h2>Complete yearly breakdown</h2>
        <p>Every major fee category is visible with included vs extra clarity and year-over-year comparison.</p>
      </div>
      <div class="summary-strip summary-strip--muted">
        <span>{{ props.viewModel.fees.includedCount }} included categories</span>
        <span>{{ props.viewModel.fees.extraCount }} extra categories</span>
        <span>{{ formatMad(props.viewModel.fees.totalThisYearMad) }} this year</span>
        <span>{{ formatMad(props.viewModel.fees.totalLastYearMad) }} last year</span>
      </div>
      <div class="subject-grid">
        <article v-for="item in props.viewModel.fees.items" :key="item.id" class="subject-card">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">{{ item.label }}</p>
              <h3>{{ formatMad(item.thisYearAmountMad) }}</h3>
            </div>
            <span :class="item.included ? 'status-pill' : 'status-pill status-pill--warning'">{{ item.included ? 'Included' : 'Extra' }}</span>
          </div>
          <p>{{ item.description }}</p>
          <div class="summary-strip summary-strip--muted">
            <span>{{ item.frequency }}</span>
            <span>Last year {{ formatMad(item.lastYearAmountMad) }}</span>
            <span>{{ item.thisYearAmountMad - item.lastYearAmountMad >= 0 ? '+' : '-' }}{{ formatMad(Math.abs(item.thisYearAmountMad - item.lastYearAmountMad)) }}</span>
          </div>
        </article>
      </div>
      <div class="stack" style="margin-top: 18px;">
        <article v-for="item in props.viewModel.fees.faq" :key="item.id" class="list-card">
          <h3>{{ item.question }}</h3>
          <p>{{ item.answer }}</p>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">4.2 Payment tracking</p>
          <h2>Monthly status and reminders</h2>
          <p>Each month is marked as paid, pending, or overdue, with reminder automation and late notifications.</p>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.paymentTracking.monthlyStatus" :key="item.monthId" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.monthLabel }}</h3>
                <p>Due {{ item.dueDateLabel }} · {{ formatMad(item.amountDueMad) }}</p>
              </div>
              <span :class="monthlyStatusPill(item.status)">{{ monthlyStatusLabel(item.status) }}</span>
            </div>
            <small>{{ item.paidAt ? `Paid ${formatTimestamp(item.paidAt)} · ${formatMad(item.amountPaidMad)}` : 'No payment registered yet' }}</small>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Reminder flow</p>
          <h3>7 days, 3 days, 1 day</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.paymentTracking.reminders" :key="item.id" class="alert-item alert-item--info">
            <div class="alert-item__icon">i</div>
            <div>
              <h3>{{ item.invoiceRef }} · {{ item.triggerDaysBefore }} day(s) before due date</h3>
              <p>{{ item.channel.toUpperCase() }} reminder is {{ item.status }}.</p>
              <small>Due {{ formatTimestamp(item.dueAt) }}</small>
            </div>
          </article>
          <article v-for="notice in props.viewModel.paymentTracking.lateNotices" :key="notice.id" class="alert-item alert-item--warning">
            <div class="alert-item__icon">!</div>
            <div>
              <h3>Late payment notice · {{ notice.invoiceRef }}</h3>
              <p>{{ notice.detail }}</p>
              <small>{{ notice.escalation }}</small>
            </div>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Payment history</p>
          <h2>Invoices and receipts</h2>
          <p>Every payment event is stored with downloadable invoice and receipt documents.</p>
        </div>
        <div class="summary-strip summary-strip--muted">
          <span>Total paid this year: {{ formatMad(paymentHistory.filter((item) => item.status === 'confirmed').reduce((sum, item) => sum + item.amountMad, 0)) }}</span>
          <span>Outstanding: {{ formatMad(props.viewModel.paymentTracking.totalOutstandingMad) }}</span>
        </div>
        <div class="stack">
          <article v-for="item in paymentHistory" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.label }}</h3>
                <p>{{ formatMad(item.amountMad) }} · {{ item.method }}</p>
              </div>
              <span :class="item.status === 'failed' ? 'status-pill status-pill--alert' : item.status === 'pending' ? 'status-pill status-pill--warning' : 'status-pill'">{{ item.status }}</span>
            </div>
            <p>{{ item.note }}</p>
            <small>{{ formatTimestamp(item.postedAt) }}</small>
            <div class="pill-row" style="margin-top: 12px;">
              <a class="asset-pill" :href="item.invoiceUrl">Invoice PDF</a>
              <a v-if="item.receiptUrl" class="asset-pill" :href="item.receiptUrl">Receipt PDF</a>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">4.3 Online payment</p>
          <h2>Pay now with secure checkout</h2>
          <p>Supports CMI, Stripe, PayPal, full or partial payment, installment setup, and recurring auto-pay.</p>
        </div>
        <div class="pill-row">
          <span v-for="gateway in props.viewModel.onlinePayment.gateways" :key="gateway.id" class="status-pill status-pill--neutral">
            {{ gateway.label }}
          </span>
        </div>
        <div class="stack" style="margin-top: 16px;">
          <label class="field-stack">
            <span>Gateway</span>
            <select v-model="paymentGateway" class="input-select">
              <option value="CMI (Morocco)">CMI (Morocco)</option>
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
            </select>
          </label>
          <label class="field-stack">
            <span>Payment mode</span>
            <select v-model="paymentMode" class="input-select">
              <option value="full">Full payment</option>
              <option value="partial">Partial payment</option>
              <option value="installment">Installment plan</option>
            </select>
          </label>
          <label v-if="paymentMode === 'partial'" class="field-stack">
            <span>Amount (MAD)</span>
            <input v-model="partialAmount" type="number" min="0" class="input-textarea input-textarea--single" placeholder="Enter amount" />
          </label>
          <label v-if="paymentMode === 'installment'" class="field-stack">
            <span>Installments</span>
            <select v-model="installmentCount" class="input-select">
              <option v-for="option in props.viewModel.onlinePayment.installmentOptions" :key="option.count" :value="option.count">{{ option.count }} installments</option>
            </select>
          </label>
          <label class="checkbox-row">
            <input v-model="enableAutoPay" type="checkbox" />
            <span>Enable recurring payment (auto-pay)</span>
          </label>
          <button class="button button--primary" type="button" :disabled="paymentLoading" @click="submitPayment">
            {{ paymentLoading ? 'Processing...' : 'Pay now' }}
          </button>
          <p v-if="paymentFeedback" class="form-message" :class="{ 'form-message--error': paymentFeedbackTone === 'error' }">{{ paymentFeedback }}</p>
          <p class="module-note">{{ props.viewModel.onlinePayment.securityComplianceNote }}</p>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">4.4 Financial requests</p>
          <h2>Request plans, discounts, and scholarships</h2>
          <p>Submit financial requests from the app, track status in one list, and receive approval or rejection updates.</p>
        </div>
        <div class="stack">
          <label class="field-stack">
            <span>Request type</span>
            <select v-model="requestType" class="input-select">
              <option value="installment_plan">Installment plan</option>
              <option value="discount">Discount</option>
              <option value="scholarship">Scholarship</option>
            </select>
          </label>
          <label class="field-stack">
            <span>Requested amount (optional, MAD)</span>
            <input v-model="requestAmount" type="number" min="0" class="input-textarea input-textarea--single" placeholder="Optional amount" />
          </label>
          <label class="field-stack">
            <span>Request details</span>
            <textarea v-model="requestDetail" class="input-textarea" rows="4" placeholder="Add context for the finance office."></textarea>
          </label>
          <label class="checkbox-row">
            <input v-model="agreementAccepted" type="checkbox" />
            <span>Accept digital agreement for payment plans</span>
          </label>
          <button class="button button--primary" type="button" :disabled="requestLoading" @click="submitFinancialRequest">
            {{ requestLoading ? 'Submitting...' : 'Submit request' }}
          </button>
          <p v-if="requestFeedback" class="form-message" :class="{ 'form-message--error': requestFeedbackTone === 'error' }">{{ requestFeedback }}</p>
        </div>
        <div class="stack" style="margin-top: 18px;">
          <article v-for="item in requestItems" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ requestTypeLabel(item.type) }}</h3>
                <p>{{ item.requestedAmountMad ? formatMad(item.requestedAmountMad) : 'No amount specified' }}</p>
              </div>
              <span :class="requestStatusPill(item.status)">{{ requestStatusLabel(item.status) }}</span>
            </div>
            <p>{{ item.detail }}</p>
            <small>Updated {{ formatTimestamp(item.updatedAt) }}</small>
            <p v-if="item.decisionNote" class="module-note">{{ item.decisionNote }}</p>
            <div v-if="item.agreementUrl" class="pill-row" style="margin-top: 10px;">
              <a class="asset-pill" :href="item.agreementUrl">Digital agreement</a>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">4.5 Tax documents</p>
        <h2>Annual fee certificates</h2>
        <p>Tax certificates are auto-generated at year end and stay downloadable any time from this module.</p>
      </div>
      <p class="module-note">{{ props.viewModel.taxDocuments.autoGenerationNote }}</p>
      <div class="subject-grid">
        <article v-for="item in props.viewModel.taxDocuments.items" :key="item.id" class="subject-card">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">Tax year</p>
              <h3>{{ item.yearLabel }}</h3>
            </div>
            <span :class="item.status === 'available' ? 'status-pill' : 'status-pill status-pill--warning'">{{ item.status }}</span>
          </div>
          <p>Total paid: {{ formatMad(item.amountPaidMad) }}</p>
          <small>Generated {{ formatTimestamp(item.generatedAt) }}</small>
          <div class="pill-row" style="margin-top: 12px;">
            <a class="asset-pill" :href="item.downloadUrl">{{ item.status === 'available' ? 'Download certificate' : 'Preview pending certificate' }}</a>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
