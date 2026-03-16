import type {
  ActivityBookingRecord,
  ActivityCatalogRecord,
  ActivityMediaRecord,
  ActivityProgramRecord,
  ActivityProgramRegistrationRecord,
  ActivityTrackingRecord,
  ChildActivitiesRecord
} from './types.ts'

function documentUrl(childId: string, activityId: string) {
  const query = new URLSearchParams({ child: childId, activity: activityId })
  return `/api/parent/activities/certificate?${query.toString()}`
}

function imageMedia(id: string, label: string, tone: string): ActivityMediaRecord {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800"><rect width="1280" height="800" fill="${tone}" rx="42"/><rect x="70" y="70" width="1140" height="660" rx="32" fill="rgba(255,255,255,0.14)"/><text x="110" y="185" fill="#ffffff" font-family="Aptos,Segoe UI,sans-serif" font-size="66" font-weight="700">${label}</text><text x="110" y="255" fill="rgba(255,255,255,0.82)" font-family="Aptos,Segoe UI,sans-serif" font-size="30">School OS activity gallery preview</text></svg>`
  return { id, kind: 'image', label, url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` }
}

function videoMedia(id: string, label: string): ActivityMediaRecord {
  return { id, kind: 'video', label, url: 'https://example.com/activity-video-preview' }
}

function catalog(payload: ActivityCatalogRecord): ActivityCatalogRecord {
  return payload
}

function booking(payload: ActivityBookingRecord): ActivityBookingRecord {
  return payload
}

function tracking(payload: ActivityTrackingRecord): ActivityTrackingRecord {
  return payload
}

function program(payload: ActivityProgramRecord): ActivityProgramRecord {
  return payload
}

function registration(payload: ActivityProgramRegistrationRecord): ActivityProgramRegistrationRecord {
  return payload
}

const linaCatalog: ActivityCatalogRecord[] = [
  catalog({
    id: 'act-lina-robotics',
    category: 'tech',
    name: 'Robotics Lab',
    summary: 'Hands-on robotics fundamentals, coding logic, and simple sensor projects.',
    instructor: { id: 'inst-youssef', fullName: 'Youssef Kadiri', title: 'Robotics Coach', bio: 'Former STEM competition mentor with 8 years of youth robotics coaching.', qualifications: ['BSc Mechatronics', 'FIRST Robotics mentor', 'Child safeguarding certified'] },
    scheduleLabel: 'Monday & Wednesday - 16:00-17:30',
    location: 'Innovation Lab - Building B',
    price: { perSessionMad: 140, perMonthMad: 980, perTrimesterMad: 2700 },
    spotsTotal: 14,
    spotsRemaining: 3,
    ageRequirement: '8+ years',
    gradeRequirement: 'Grade 3 to Grade 6',
    media: [imageMedia('m-lina-rob-1', 'Robotics build session', '#2b6f8f'), videoMedia('m-lina-rob-2', 'Line follower race highlight')],
    reviews: [
      { id: 'rev-lina-rob-1', parentName: 'A. Bennani', rating: 5, comment: 'Lina is more confident with problem-solving and team communication.', createdAt: '2026-02-28T18:00:00+01:00' },
      { id: 'rev-lina-rob-2', parentName: 'S. El Mansouri', rating: 4, comment: 'Excellent structure and clear weekly objectives.', createdAt: '2026-02-19T18:00:00+01:00' }
    ],
    averageRating: 4.6
  }),
  catalog({
    id: 'act-lina-swim',
    category: 'sports',
    name: 'Swimming Progress Group',
    summary: 'Technique, endurance, and water safety with progressive lane groups.',
    instructor: { id: 'inst-salim', fullName: 'Salim Ouarzazi', title: 'Aquatics Instructor', bio: 'Certified swim coach focused on confidence and safe progression.', qualifications: ['Morocco aquatics federation level 2', 'First aid + CPR', 'Youth sports pedagogy'] },
    scheduleLabel: 'Tuesday & Thursday - 17:00-18:00',
    location: 'Riverside Pool',
    price: { perSessionMad: 120, perMonthMad: 860, perTrimesterMad: 2400 },
    spotsTotal: 18,
    spotsRemaining: 2,
    ageRequirement: '7+ years',
    gradeRequirement: 'Grade 2 to Grade 6',
    media: [imageMedia('m-lina-swim-1', 'Stroke technique practice', '#1a7188')],
    reviews: [{ id: 'rev-lina-swim-1', parentName: 'N. Alaoui', rating: 5, comment: 'Professional coaching and visible progress each month.', createdAt: '2026-03-02T18:00:00+01:00' }],
    averageRating: 4.8
  }),
  catalog({
    id: 'act-lina-theater',
    category: 'arts',
    name: 'Theater & Expression',
    summary: 'Voice, movement, and stage confidence through mini performances.',
    instructor: { id: 'inst-hajar', fullName: 'Hajar Rami', title: 'Theater Facilitator', bio: 'Performer and youth drama teacher specialized in stage confidence.', qualifications: ['Performing Arts diploma', '8 years school theater programs'] },
    scheduleLabel: 'Friday - 15:30-17:00',
    location: 'Auditorium Studio',
    price: { perSessionMad: 100, perMonthMad: 700, perTrimesterMad: 1950 },
    spotsTotal: 20,
    spotsRemaining: 7,
    ageRequirement: '8+ years',
    gradeRequirement: 'Grade 3 to Grade 7',
    media: [imageMedia('m-lina-theater-1', 'Scene rehearsal', '#8a4d6e')],
    reviews: [{ id: 'rev-lina-theater-1', parentName: 'K. Bennani', rating: 4, comment: 'Great for public speaking confidence.', createdAt: '2026-02-16T18:00:00+01:00' }],
    averageRating: 4.3
  })
]

const roboticsBase = linaCatalog[0]!
const swimBase = linaCatalog[1]!
const theaterBase = linaCatalog[2]!

const yanisCatalog: ActivityCatalogRecord[] = [
  { ...theaterBase, id: 'act-yanis-theater', name: 'Creative Theater Junior', ageRequirement: '6+ years', gradeRequirement: 'Grade 1 to Grade 4', spotsRemaining: 5, averageRating: 4.5 },
  { ...swimBase, id: 'act-yanis-swim', name: 'Swimming Starter Group', ageRequirement: '6+ years', gradeRequirement: 'Grade 1 to Grade 4', spotsRemaining: 4, averageRating: 4.7 }
]

const adamCatalog: ActivityCatalogRecord[] = [
  { ...roboticsBase, id: 'act-adam-robotics', name: 'Atlas Robotics Starter', scheduleLabel: 'Tuesday - 16:00-17:30', location: 'Atlas Lab A', spotsRemaining: 6, averageRating: 4.4 },
  { ...theaterBase, id: 'act-adam-music', category: 'arts', name: 'Music Fundamentals', scheduleLabel: 'Thursday - 16:15-17:15', location: 'Music Room 2', spotsRemaining: 8, averageRating: 4.2 }
]

const salmaCatalog: ActivityCatalogRecord[] = [
  { ...roboticsBase, id: 'act-salma-robotics', name: 'Advanced Robotics Project', ageRequirement: '11+ years', gradeRequirement: 'Grade 6 to Grade 9', spotsRemaining: 2, averageRating: 4.9 },
  { ...theaterBase, id: 'act-salma-debate', category: 'languages', name: 'Debate & Public Speaking', scheduleLabel: 'Wednesday - 16:00-17:30', location: 'Debate Hall', spotsRemaining: 3, averageRating: 4.8 }
]

export const childActivitiesById: Record<string, ChildActivitiesRecord> = {
  'student-lina': {
    catalog: linaCatalog,
    bookings: [
      booking({ id: 'book-lina-1', childId: 'student-lina', activityId: 'act-lina-robotics', activityName: 'Robotics Lab', status: 'confirmed', bookedAt: '2026-03-10T10:15:00+01:00', sessionStartsAt: '2026-03-18T16:00:00+01:00', cancellationDeadline: '2026-03-17T16:00:00+01:00', paymentMode: 'invoice', paymentStatus: 'pending_invoice', packageDealId: 'pkg-tech-10plus1', trialSession: false, waitlistPosition: null, confirmationCode: 'ACT-LINA-4451' }),
      booking({ id: 'book-lina-2', childId: 'student-lina', activityId: 'act-lina-swim', activityName: 'Swimming Progress Group', status: 'waitlist', bookedAt: '2026-03-12T08:22:00+01:00', sessionStartsAt: '2026-03-19T17:00:00+01:00', cancellationDeadline: '2026-03-18T17:00:00+01:00', paymentMode: 'pay_now', paymentStatus: 'paid', packageDealId: null, trialSession: true, waitlistPosition: 2, confirmationCode: null })
    ],
    cancellationPolicy: 'Bookings can be cancelled up to 24 hours before session start. Late cancellations are marked as used sessions.',
    packageDeals: [
      { id: 'pkg-tech-10plus1', label: 'Tech bundle', detail: 'Buy 10 sessions of robotics and get 1 bonus session.', bonus: '+1 free session' },
      { id: 'pkg-swim-10plus1', label: 'Swim progression pack', detail: 'Buy 10 swim sessions and unlock one extra coaching slot.', bonus: '+1 free session' }
    ],
    trialSessionNote: 'One trial session is available per activity, subject to spot availability.',
    tracking: [
      tracking({
        activityId: 'act-lina-robotics',
        activityName: 'Robotics Lab',
        weeklyReports: [
          { id: 'rep-lina-rob-1', weekLabel: 'Week of Mar 9', summary: 'Built and tested a line-following prototype in teams.', skillFocus: 'Logical sequencing', nextStep: 'Introduce obstacle sensor calibration.' },
          { id: 'rep-lina-rob-2', weekLabel: 'Week of Mar 2', summary: 'Completed basic motor control challenge.', skillFocus: 'Loop structures', nextStep: 'Practice debugging workflow.' }
        ],
        sessionMedia: [imageMedia('trk-lina-rob-1', 'Robot chassis workshop', '#2b6f8f')],
        skillAssessment: [
          { id: 'skill-lina-logic', skill: 'Computational thinking', level: 'proficient', detail: 'Consistently decomposes tasks and proposes working sequences.' },
          { id: 'skill-lina-team', skill: 'Team collaboration', level: 'advanced', detail: 'Supports peers and documents team decisions clearly.' }
        ],
        attendance: [
          { id: 'att-lina-rob-1', sessionLabel: 'Mar 11', attended: true, note: 'On time and fully engaged.' },
          { id: 'att-lina-rob-2', sessionLabel: 'Mar 4', attended: true, note: 'Completed all checkpoint tasks.' }
        ],
        participationCertificateUrl: documentUrl('student-lina', 'act-lina-robotics'),
        showcaseInfo: 'End-of-year STEM showcase on June 14 with parent attendance slots.'
      })
    ],
    programs: [
      program({ id: 'prog-lina-summer-tech', kind: 'summer_camp', title: 'Summer Tech Camp', summary: '2-week robotics, coding, and 3D printing intensive.', startsAt: '2026-07-06T09:00:00+01:00', endsAt: '2026-07-17T15:30:00+01:00', location: 'Innovation Lab Campus', scheduleLabel: 'Mon-Fri - 09:00-15:30', priceMad: 4800, earlyRegistrationDiscountMad: 600, availableSpots: 11, ageRequirement: '8-13 years' }),
      program({ id: 'prog-lina-holiday-arts', kind: 'holiday_workshop', title: 'Spring Arts Workshop', summary: 'Creative theater and painting workshop during spring break.', startsAt: '2026-04-07T10:00:00+01:00', endsAt: '2026-04-09T14:00:00+01:00', location: 'Auditorium Studio', scheduleLabel: '3 days - 10:00-14:00', priceMad: 950, earlyRegistrationDiscountMad: 120, availableSpots: 9, ageRequirement: '7-12 years' })
    ],
    programRegistrations: [
      registration({ id: 'reg-lina-1', childId: 'student-lina', programId: 'prog-lina-summer-tech', status: 'under_review', submittedAt: '2026-03-13T12:30:00+01:00', updatedAt: '2026-03-14T09:05:00+01:00', seatCode: null, discountAppliedMad: 600 })
    ]
  },
  'student-yanis': {
    catalog: yanisCatalog,
    bookings: [booking({ id: 'book-yanis-1', childId: 'student-yanis', activityId: 'act-yanis-swim', activityName: 'Swimming Starter Group', status: 'confirmed', bookedAt: '2026-03-08T09:05:00+01:00', sessionStartsAt: '2026-03-19T17:00:00+01:00', cancellationDeadline: '2026-03-18T17:00:00+01:00', paymentMode: 'pay_now', paymentStatus: 'paid', packageDealId: null, trialSession: true, waitlistPosition: null, confirmationCode: 'ACT-YANIS-9102' })],
    cancellationPolicy: 'Cancellations are accepted up to 24h before each session.',
    packageDeals: [{ id: 'pkg-junior-10plus1', label: 'Junior activity pack', detail: 'Buy 10 junior sessions and receive 1 free.', bonus: '+1 free session' }],
    trialSessionNote: 'Trial sessions are available once per workshop for new participants.',
    tracking: [],
    programs: [program({ id: 'prog-yanis-summer-mini', kind: 'summer_camp', title: 'Mini Explorers Camp', summary: 'Early years movement, arts, and storytelling camp.', startsAt: '2026-07-13T09:30:00+01:00', endsAt: '2026-07-24T14:30:00+01:00', location: 'Early Years Wing', scheduleLabel: 'Mon-Fri - 09:30-14:30', priceMad: 3600, earlyRegistrationDiscountMad: 400, availableSpots: 12, ageRequirement: '5-8 years' })],
    programRegistrations: []
  },
  'student-adam': {
    catalog: adamCatalog,
    bookings: [booking({ id: 'book-adam-1', childId: 'student-adam', activityId: 'act-adam-robotics', activityName: 'Atlas Robotics Starter', status: 'waitlist', bookedAt: '2026-03-11T15:10:00+01:00', sessionStartsAt: '2026-03-24T16:00:00+01:00', cancellationDeadline: '2026-03-23T16:00:00+01:00', paymentMode: 'invoice', paymentStatus: 'pending_invoice', packageDealId: null, trialSession: false, waitlistPosition: 1, confirmationCode: null })],
    cancellationPolicy: 'Bookings can be cancelled before the 24h cutoff. Waitlist requests are automatically promoted when seats open.',
    packageDeals: [{ id: 'pkg-atlas-tech-10plus1', label: 'Atlas Tech Pack', detail: 'Buy 10 sessions, get 1 free.', bonus: '+1 free session' }],
    trialSessionNote: 'Trial sessions are available for first-time participants when a spot is available.',
    tracking: [],
    programs: [program({ id: 'prog-adam-holiday-tech', kind: 'holiday_workshop', title: 'Holiday Maker Workshop', summary: 'Hands-on design and beginner coding sessions.', startsAt: '2026-04-08T10:00:00+01:00', endsAt: '2026-04-10T15:00:00+01:00', location: 'Atlas Lab A', scheduleLabel: '3 days - 10:00-15:00', priceMad: 1100, earlyRegistrationDiscountMad: 150, availableSpots: 10, ageRequirement: '7-11 years' })],
    programRegistrations: [registration({ id: 'reg-adam-1', childId: 'student-adam', programId: 'prog-adam-holiday-tech', status: 'submitted', submittedAt: '2026-03-12T16:15:00+01:00', updatedAt: '2026-03-12T16:15:00+01:00', seatCode: null, discountAppliedMad: null })]
  },
  'student-salma': {
    catalog: salmaCatalog,
    bookings: [booking({ id: 'book-salma-1', childId: 'student-salma', activityId: 'act-salma-debate', activityName: 'Debate & Public Speaking', status: 'confirmed', bookedAt: '2026-03-07T17:45:00+01:00', sessionStartsAt: '2026-03-20T16:00:00+01:00', cancellationDeadline: '2026-03-19T16:00:00+01:00', paymentMode: 'invoice', paymentStatus: 'pending_invoice', packageDealId: null, trialSession: false, waitlistPosition: null, confirmationCode: 'ACT-SALMA-7719' })],
    cancellationPolicy: 'Cancellations are free up to 24h before start time. After cutoff, sessions remain billable.',
    packageDeals: [{ id: 'pkg-debate-10plus1', label: 'Debate intensive bundle', detail: 'Buy 10 debate sessions and receive one additional coaching slot.', bonus: '+1 free session' }],
    trialSessionNote: 'Trial slots are available at the beginning of each term.',
    tracking: [
      tracking({
        activityId: 'act-salma-debate',
        activityName: 'Debate & Public Speaking',
        weeklyReports: [{ id: 'rep-salma-debate-1', weekLabel: 'Week of Mar 9', summary: 'Delivered structured opening statements with improved pace control.', skillFocus: 'Argument structure', nextStep: 'Strengthen rebuttal timing under pressure.' }],
        sessionMedia: [imageMedia('trk-salma-debate-1', 'Debate rehearsal podium', '#824f67')],
        skillAssessment: [{ id: 'skill-salma-speaking', skill: 'Public speaking', level: 'advanced', detail: 'Clear articulation and strong evidence framing.' }],
        attendance: [{ id: 'att-salma-debate-1', sessionLabel: 'Mar 11', attended: true, note: 'Lead role in mock round.' }],
        participationCertificateUrl: documentUrl('student-salma', 'act-salma-debate'),
        showcaseInfo: 'Year-end debate recital and awards on June 20.'
      })
    ],
    programs: [program({ id: 'prog-salma-summer-lead', kind: 'summer_camp', title: 'Leadership Summer Academy', summary: 'Public speaking, innovation projects, and leadership labs.', startsAt: '2026-07-06T09:00:00+01:00', endsAt: '2026-07-24T15:30:00+01:00', location: 'Leadership Center', scheduleLabel: 'Mon-Fri - 09:00-15:30', priceMad: 5200, earlyRegistrationDiscountMad: 700, availableSpots: 7, ageRequirement: '11-15 years' })],
    programRegistrations: []
  }
}

