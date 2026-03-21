import { schoolBrand, secondSchoolBrand } from './data.ts'
import type { SchoolProfileRecord } from './types.ts'

function svgTile(title: string, subtitle: string, primary: string, secondary: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs><rect width="1200" height="800" rx="48" fill="url(#g)"/><rect x="72" y="72" width="1056" height="656" rx="36" fill="rgba(255,255,255,0.12)"/><text x="102" y="184" fill="#ffffff" font-family="Aptos,Segoe UI,sans-serif" font-size="76" font-weight="700">${title}</text><text x="102" y="268" fill="rgba(255,255,255,0.9)" font-family="Aptos,Segoe UI,sans-serif" font-size="32">${subtitle}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function logoTile(title: string, initials: string, primary: string, secondary: string) {
  return svgTile(title, initials, primary, secondary)
}

function galleryItem(id: string, kind: 'photo' | 'virtual_tour', label: string, caption: string, url: string) {
  return { id, kind, label, caption, url }
}

function staffItem(id: string, fullName: string, title: string, department: string, bio: string, specialties: string[], photoUrl: string) {
  return { id, fullName, title, department, bio, specialties, photoUrl }
}

function valueItem(id: string, label: string, detail: string) {
  return { id, label, detail }
}

function certificationItem(id: string, label: string, issuer: string, detail: string) {
  return { id, label, issuer, detail }
}

function statItem(id: string, label: string, value: string, detail: string) {
  return { id, label, value, detail }
}

function testimonialItem(id: string, parentName: string, relation: string, quote: string, rating: number) {
  return { id, parentName, relation, quote, rating }
}

function socialLink(id: string, platform: string, url: string) {
  return { id, platform, url }
}

function calendarEvent(id: string, kind: 'holiday' | 'exam' | 'event' | 'conference', title: string, startsAt: string, endsAt: string, detail: string, accent: string) {
  return { id, kind, title, startsAt, endsAt, detail, accent }
}

function downloadItem(id: string, label: string, kind: 'google' | 'apple' | 'ical' | 'pdf', href: string) {
  return { id, label, kind, href }
}

function newsMedia(id: string, kind: 'photo' | 'video', label: string, url: string) {
  return { id, kind, label, url }
}

function newsArticle(id: string, category: string, title: string, publishedAt: string, summary: string, body: string, media: Array<ReturnType<typeof newsMedia>>, shareLinks: Array<ReturnType<typeof socialLink>>) {
  return { id, category, title, publishedAt, summary, body, media, shareLinks }
}

const summitProfile: SchoolProfileRecord = {
  brand: {
    logoUrl: logoTile('Summit Private Academy', 'SPA', '#a67c00', '#f5d36f'),
    primaryColor: '#a67c00',
    secondaryColor: '#1f2937',
    welcomeVideoUrl: 'https://example.com/summit-welcome-video',
    welcomeVideoPosterUrl: svgTile('Welcome to Summit', 'A calm, high-standard school community', '#a67c00', '#1f2937'),
    slogan: 'Rabat learning with warmth, rigor, and character'
  },
  mission: 'To provide a premium bilingual education that is calm, ambitious, and deeply student-centered.',
  vision: 'A school where every child feels known, challenged, and proud of the work they produce.',
  values: [
    valueItem('summit-value-1', 'Care', 'Every student is supported with dignity, attention, and clear communication.'),
    valueItem('summit-value-2', 'Rigor', 'Strong habits and meaningful standards guide learning every day.'),
    valueItem('summit-value-3', 'Community', 'Families, staff, and students work together in a respectful partnership.')
  ],
  certifications: [
    certificationItem('summit-cert-1', 'Cambridge aligned curriculum', 'Academic board', 'International standards are mapped across core subjects.'),
    certificationItem('summit-cert-2', 'Child safeguarding verified', 'Independent audit', 'Campus procedures were reviewed and certified this year.')
  ],
  successStats: [
    statItem('summit-stat-1', 'Graduation rate', '98%', 'Most recent graduating cohort completed on time.'),
    statItem('summit-stat-2', 'University offers', '84%', 'Of graduates received at least one first-choice offer.'),
    statItem('summit-stat-3', 'Awards this year', '31', 'Academic, sports, and arts recognition across the campus.'),
    statItem('summit-stat-4', 'Parent satisfaction', '4.8/5', 'Survey average from the current academic year.')
  ],
  testimonials: [
    testimonialItem('summit-test-1', 'Amira Bennani', 'Parent', 'The communication is clear, the teaching is thoughtful, and the campus feels calm and well run.', 5),
    testimonialItem('summit-test-2', 'Samir El Mansouri', 'Parent', 'The school combines high standards with a personal touch that is rare to find.', 5)
  ],
  socialLinks: [
    socialLink('summit-social-1', 'Instagram', 'https://instagram.com/summitacademy'),
    socialLink('summit-social-2', 'Facebook', 'https://facebook.com/summitacademy'),
    socialLink('summit-social-3', 'LinkedIn', 'https://linkedin.com/company/summitacademy')
  ],
  gallery: [
    galleryItem('summit-gallery-1', 'photo', 'Front courtyard', 'Bright morning arrivals and the central school entrance.', svgTile('Courtyard', 'Front entrance and arrival zone', '#a67c00', '#1f2937')),
    galleryItem('summit-gallery-2', 'photo', 'Library and labs', 'Quiet reading corners and the science lab wing.', svgTile('Library', 'Reading space and lab access', '#1f2937', '#3b82f6')),
    galleryItem('summit-gallery-3', 'virtual_tour', 'Campus virtual tour', 'A guided walk through the main classroom and event spaces.', svgTile('Virtual tour', 'Campus walkthrough preview', '#4b5563', '#a67c00'))
  ],
  staff: [
    staffItem('summit-staff-1', 'Dr. Nadia El Amini', 'Head of School', 'Leadership', 'Sets the academic vision and keeps family communication consistent.', ['Academic strategy', 'Parent relations', 'Safeguarding'], svgTile('Nadia', 'Head of School', '#a67c00', '#1f2937')),
    staffItem('summit-staff-2', 'Ms. Yasmine Berrada', 'Primary Coordinator', 'Primary', 'Oversees routines, classroom culture, and family updates for primary learners.', ['Classroom support', 'Reading progress', 'Daily reports'], svgTile('Yasmine', 'Primary Coordinator', '#3b82f6', '#1f2937')),
    staffItem('summit-staff-3', 'Mr. Karim Ait Said', 'Admissions Lead', 'Admissions', 'Helps families with tours, onboarding, and admissions documentation.', ['Admissions', 'Tours', 'Family onboarding'], svgTile('Karim', 'Admissions', '#10b981', '#1f2937'))
  ],
  calendar: {
    termLabel: '2026 academic year',
    breaks: ['Spring break: April 6-17, 2026', 'Eid break: June 15-19, 2026', 'Summer break begins July 10, 2026'],
    items: [
      calendarEvent('summit-cal-1', 'holiday', 'Spring break', '2026-04-06T00:00:00+01:00', '2026-04-17T23:59:59+01:00', 'No classes across the campus during spring break.', '#a67c00'),
      calendarEvent('summit-cal-2', 'exam', 'Trimester exams', '2026-05-18T08:00:00+01:00', '2026-05-29T15:00:00+01:00', 'End of trimester assessments for primary and middle grades.', '#dc2626'),
      calendarEvent('summit-cal-3', 'conference', 'Parent-teacher conferences', '2026-03-27T14:00:00+01:00', '2026-03-27T18:00:00+01:00', 'Booked family meetings with class teams.', '#2563eb'),
      calendarEvent('summit-cal-4', 'event', 'Spring arts night', '2026-03-28T17:30:00+01:00', '2026-03-28T19:30:00+01:00', 'Student performance and exhibition evening.', '#7c3aed')
    ],
    downloads: [
      downloadItem('summit-download-1', 'Google Calendar', 'google', 'https://calendar.google.com/calendar/u/0/r'),
      downloadItem('summit-download-2', 'Apple Calendar (.ics)', 'ical', 'data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AEND:VCALENDAR'),
      downloadItem('summit-download-3', 'Academic PDF', 'pdf', 'data:application/pdf;base64,JVBERi0xLjQKJSBTaG9ydCBwdWJsaWMgcHJldmlldyBmaWxlCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDU5NSA4NDJdIC9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA0ND4+CnN0cmVhbQpCVAovRjEgMjQgVGYKMTAwIDcwMCBUZAooU2Nob29sIFByb2ZpbGUgUERGIHByZXZpZXcpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNTQgMDAwMDAgbgowMDAwMDAwMTEzIDAwMDAwIG4gCjAwMDAwMDAyMDMgMDAwMDAgbgogdHJhaWxlcgo8PC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI2MAolJUVPRg=='),
      downloadItem('summit-download-4', 'Printable term outline', 'pdf', 'data:application/pdf;base64,JVBERi0xLjQKJSBTaG9ydCB0ZXJtIG91dGxpbmUKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUj4+CmVuZG9iagoyIDAgb2JqCjw8L1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNTk1IDg0Ml0gL0NvbnRlbnRzIDQgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDM4Pj4Kc3RyZWFtCkJUCi9GMSAyMCBUZgowIDEwMCBUZAooU3VtbWl0IHRlcm0gb3V0bGluZSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA1NCAwMDAwMCBuIAowMDAwMDAwMTEzIDAwMDAwIG4gCjAwMDAwMDAyMDMgMDAwMDAgbgogdHJhaWxlcgo8PC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI1MAolJUVPRg==')
    ],
  },
  news: [
      newsArticle('summit-news-1', 'Campus life', 'A calmer arrival system for younger learners', '2026-03-18T08:00:00+01:00', 'The school introduced adjusted morning entry windows for early years families.', 'The new arrival flow gives younger students more time to settle, lowers congestion at the gate, and keeps the day calmer for both families and staff.', [newsMedia('summit-news-media-1', 'photo', 'Arrival gate', svgTile('Arrival flow', 'Calm drop-off lane', '#a67c00', '#1f2937'))], [socialLink('summit-share-1', 'LinkedIn', 'https://linkedin.com/shareArticle')]),
      newsArticle('summit-news-2', 'Student achievements', 'Primary robotics team wins regional award', '2026-03-12T10:30:00+01:00', 'A group of students received recognition for their robotics build and presentation.', 'The team won the regional innovation award after delivering a clear build demo, a concise research log, and a confident Q&A session.', [newsMedia('summit-news-media-2', 'photo', 'Robotics podium', svgTile('Robotics award', 'Student achievement', '#2563eb', '#1f2937')), newsMedia('summit-news-media-3', 'video', 'Award ceremony clip', 'https://example.com/summit-robotics-clip')], [socialLink('summit-share-2', 'Instagram', 'https://instagram.com/share'), socialLink('summit-share-3', 'Facebook', 'https://facebook.com/share')]),
      newsArticle('summit-news-3', 'Parent briefing', 'Term 2 calendar and event summary', '2026-03-08T09:00:00+01:00', 'Families received the updated calendar, conference dates, and key term reminders.', 'The calendar summary includes holidays, exam blocks, conference dates, and major school events to help families plan ahead.', [], [socialLink('summit-share-4', 'WhatsApp', 'https://wa.me/')] )
    ]
  }


const atlasProfile: SchoolProfileRecord = {
  brand: {
    logoUrl: logoTile('Atlas International School', 'AIS', '#2563eb', '#38bdf8'),
    primaryColor: '#2563eb',
    secondaryColor: '#0f172a',
    welcomeVideoUrl: 'https://example.com/atlas-welcome-video',
    welcomeVideoPosterUrl: svgTile('Welcome to Atlas', 'A modern international campus', '#2563eb', '#0f172a'),
    slogan: 'Global learning with a warm local identity'
  },
  mission: 'To build curious, confident learners through multilingual teaching and a supportive campus culture.',
  vision: 'A connected school community that prepares students for international pathways and local leadership.',
  values: [
    valueItem('atlas-value-1', 'Curiosity', 'We encourage questions, exploration, and independent thought.'),
    valueItem('atlas-value-2', 'Confidence', 'Students are supported to speak, present, and lead.'),
    valueItem('atlas-value-3', 'Belonging', 'Every family should feel welcomed and informed.')
  ],
  certifications: [
    certificationItem('atlas-cert-1', 'Bilingual curriculum', 'International academic board', 'Arabic, French, and English pathways are mapped across key subjects.'),
    certificationItem('atlas-cert-2', 'Safety and wellbeing standard', 'Campus review panel', 'Outdoor areas, pickup procedures, and supervision plans were audited.' )
  ],
  successStats: [
    statItem('atlas-stat-1', 'Graduation rate', '97%', 'Current cohort completion rate.'),
    statItem('atlas-stat-2', 'Awards this year', '24', 'Academic and extracurricular recognition.'),
    statItem('atlas-stat-3', 'University pathway offers', '76%', 'For graduating students this cycle.'),
    statItem('atlas-stat-4', 'Parent satisfaction', '4.7/5', 'Latest term family survey average.')
  ],
  testimonials: [
    testimonialItem('atlas-test-1', 'Samir El Mansouri', 'Parent', 'The campus feels modern and responsive, and the family communication has been excellent.', 5),
    testimonialItem('atlas-test-2', 'Meryem El Mansouri', 'Parent', 'The balance between structure and warmth is exactly what we were hoping for.', 5)
  ],
  socialLinks: [
    socialLink('atlas-social-1', 'Instagram', 'https://instagram.com/atlasinternational'),
    socialLink('atlas-social-2', 'Facebook', 'https://facebook.com/atlasinternational'),
    socialLink('atlas-social-3', 'YouTube', 'https://youtube.com/@atlasinternational')
  ],
  gallery: [
    galleryItem('atlas-gallery-1', 'photo', 'Main atrium', 'Large common area with a bright welcome desk and student art.', svgTile('Atrium', 'Campus welcome zone', '#2563eb', '#0f172a')),
    galleryItem('atlas-gallery-2', 'photo', 'Outdoor play court', 'Open play areas for sports, assemblies, and family events.', svgTile('Play court', 'Outdoor activity space', '#0f172a', '#38bdf8')),
    galleryItem('atlas-gallery-3', 'virtual_tour', 'Virtual campus tour', 'A 3D-style walkthrough of classrooms, labs, and event spaces.', svgTile('Virtual tour', 'Explore the Atlas campus', '#334155', '#2563eb'))
  ],
  staff: [
    staffItem('atlas-staff-1', 'Ms. Rania El Idrissi', 'Campus Director', 'Leadership', 'Keeps the campus vision aligned with family expectations and day-to-day execution.', ['Campus strategy', 'Community relations', 'Quality assurance'], svgTile('Rania', 'Campus Director', '#2563eb', '#0f172a')),
    staffItem('atlas-staff-2', 'Mr. Omar Bensalem', 'Primary Lead', 'Primary', 'Supports classroom culture, academic progression, and routine stability.', ['Primary learning', 'Family updates', 'Lesson coordination'], svgTile('Omar', 'Primary Lead', '#38bdf8', '#0f172a')),
    staffItem('atlas-staff-3', 'Ms. Salma Ait Lahcen', 'Student Services', 'Admissions', 'Guides families through admissions, tours, and onboarding.', ['Admissions', 'Tours', 'Onboarding'], svgTile('Salma', 'Student Services', '#0f766e', '#0f172a'))
  ],
  calendar: {
    termLabel: '2026 academic year',
    breaks: ['Spring break: April 6-17, 2026', 'Eid break: June 15-19, 2026', 'Summer break begins July 10, 2026'],
    items: [
      calendarEvent('atlas-cal-1', 'holiday', 'Spring break', '2026-04-06T00:00:00+01:00', '2026-04-17T23:59:59+01:00', 'No classes across the campus during spring break.', '#2563eb'),
      calendarEvent('atlas-cal-2', 'exam', 'Trimester exams', '2026-05-18T08:00:00+01:00', '2026-05-29T15:00:00+01:00', 'End of trimester assessments for linked grades.', '#dc2626'),
      calendarEvent('atlas-cal-3', 'conference', 'Parent-teacher conferences', '2026-03-26T14:00:00+01:00', '2026-03-26T18:00:00+01:00', 'Booked family meetings with class teams.', '#0f766e'),
      calendarEvent('atlas-cal-4', 'event', 'Culture night', '2026-03-31T17:00:00+01:00', '2026-03-31T19:30:00+01:00', 'Families join for music, stories, and student exhibitions.', '#7c3aed')
    ],
    downloads: [
      downloadItem('atlas-download-1', 'Google Calendar', 'google', 'https://calendar.google.com/calendar/u/0/r'),
      downloadItem('atlas-download-2', 'Apple Calendar (.ics)', 'ical', 'data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AEND:VCALENDAR'),
      downloadItem('atlas-download-3', 'Academic PDF', 'pdf', 'data:application/pdf;base64,JVBERi0xLjQKJSBBdGxhcyBwcmV2aWV3CjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDU5NSA4NDJdIC9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA0MD4+CnN0cmVhbQpCVAovRjEgMjQgVGYKMTAwIDcwMCBUZAooQXRsYXMgcHJldmlldykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA1NCAwMDAwMCBuIAowMDAwMDAwMTEzIDAwMDAwIG4gCjAwMDAwMDAyMDMgMDAwMDAgbgogdHJhaWxlcgo8PC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI1MAolJUVPRg==')
    ],
  },
  news: [
      newsArticle('atlas-news-1', 'Campus life', 'A new weekend tour for prospective families', '2026-03-17T08:30:00+01:00', 'Prospective parents can now book a guided tour each Saturday morning.', 'The new tour route covers classrooms, the playground, science areas, and the main family reception desk.', [newsMedia('atlas-news-media-1', 'photo', 'Tour reception', svgTile('Campus tour', 'Family visit preview', '#2563eb', '#0f172a'))], [socialLink('atlas-share-1', 'Instagram', 'https://instagram.com/share')]),
      newsArticle('atlas-news-2', 'Student achievements', 'Debate team advances to the regional final', '2026-03-14T11:00:00+01:00', 'Atlas students earned a spot in the regional debate final after a strong qualifying round.', 'The team was praised for clarity, teamwork, and respectful rebuttal structure in the final qualifier.', [newsMedia('atlas-news-media-2', 'video', 'Qualifier recap', 'https://example.com/atlas-debate-recap'), newsMedia('atlas-news-media-3', 'photo', 'Team photo', svgTile('Debate team', 'Regional final bound', '#7c3aed', '#0f172a'))], [socialLink('atlas-share-2', 'LinkedIn', 'https://linkedin.com/shareArticle'), socialLink('atlas-share-3', 'Facebook', 'https://facebook.com/share')]),
      newsArticle('atlas-news-3', 'Parent briefing', 'Calendar reminders for the next term', '2026-03-09T09:00:00+01:00', 'Families received the updated term calendar and exam windows.', 'The term outline includes the next break, exam dates, parent conferences, and a handful of major community events.', [], [socialLink('atlas-share-4', 'WhatsApp', 'https://wa.me/')])
    ]
  }


export const schoolProfilesById: Record<string, SchoolProfileRecord> = {
  [schoolBrand.id]: summitProfile,
  [secondSchoolBrand.id]: atlasProfile
}
