import type {
  ChildSchoolLifeRecord,
  SchoolLifeBadgeRecord,
  SchoolLifeBehaviorAlertRecord,
  SchoolLifeBehaviorMonthRecord,
  SchoolLifeDailyPhotoRecord,
  SchoolLifeDailyReportRecord,
  SchoolLifeDietRequestRecord,
  SchoolLifeEmergencyContactRecord,
  SchoolLifeEventMediaRecord,
  SchoolLifeEventRecord,
  SchoolLifeHealthIncidentRecord,
  SchoolLifeLeaderboardRecord,
  SchoolLifeMedicalFileRecord,
  SchoolLifeMedicalVisitRecord,
  SchoolLifePaymentRecord,
  SchoolLifeSkillProgressRecord,
  SchoolLifeVaccinationRecord,
  SchoolLifeWeeklyMenuItemRecord
} from './types.ts'

function svgData(label: string, subtitle: string, tone: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="${tone}"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="960" height="640" rx="40" fill="url(#g)"/><rect x="52" y="52" width="856" height="536" rx="32" fill="rgba(255,255,255,0.08)"/><text x="80" y="180" fill="#ffffff" font-family="Aptos,Segoe UI,sans-serif" font-size="62" font-weight="700">${label}</text><text x="80" y="250" fill="rgba(255,255,255,0.88)" font-family="Aptos,Segoe UI,sans-serif" font-size="28">${subtitle}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function meal(payload: SchoolLifeWeeklyMenuItemRecord): SchoolLifeWeeklyMenuItemRecord {
  return payload
}

function payment(payload: SchoolLifePaymentRecord): SchoolLifePaymentRecord {
  return payload
}

function request(payload: SchoolLifeDietRequestRecord): SchoolLifeDietRequestRecord {
  return payload
}

function contact(payload: SchoolLifeEmergencyContactRecord): SchoolLifeEmergencyContactRecord {
  return payload
}

function vaccination(payload: SchoolLifeVaccinationRecord): SchoolLifeVaccinationRecord {
  return payload
}

function incident(payload: SchoolLifeHealthIncidentRecord): SchoolLifeHealthIncidentRecord {
  return payload
}

function visit(payload: SchoolLifeMedicalVisitRecord): SchoolLifeMedicalVisitRecord {
  return payload
}

function photo(payload: SchoolLifeDailyPhotoRecord): SchoolLifeDailyPhotoRecord {
  return payload
}

function skill(payload: SchoolLifeSkillProgressRecord): SchoolLifeSkillProgressRecord {
  return payload
}

function badge(payload: SchoolLifeBadgeRecord): SchoolLifeBadgeRecord {
  return payload
}

function alert(payload: SchoolLifeBehaviorAlertRecord): SchoolLifeBehaviorAlertRecord {
  return payload
}

function month(payload: SchoolLifeBehaviorMonthRecord): SchoolLifeBehaviorMonthRecord {
  return payload
}

function leaderboard(payload: SchoolLifeLeaderboardRecord): SchoolLifeLeaderboardRecord {
  return payload
}

function media(payload: SchoolLifeEventMediaRecord): SchoolLifeEventMediaRecord {
  return payload
}

function event(payload: SchoolLifeEventRecord): SchoolLifeEventRecord {
  return payload
}

const linaMenu = [
  meal({ id: 'lina-mon', dayLabel: 'Monday', mealName: 'Halal chicken couscous', photoLabel: 'Couscous bowl', photoUrl: svgData('Couscous', 'Halal chicken and vegetables', '#8b5e34'), nutrition: '540 kcal | 24g protein | balanced carbs', allergens: ['gluten'], dietTags: ['halal'], preselected: true, parentRating: 5, childRating: 4 }),
  meal({ id: 'lina-tue', dayLabel: 'Tuesday', mealName: 'Lentil soup with brown bread', photoLabel: 'Soup bowl', photoUrl: svgData('Soup', 'Warm lentil lunch', '#7c3aed'), nutrition: '430 kcal | 18g protein | high fiber', allergens: ['gluten'], dietTags: ['halal', 'vegetarian'], preselected: false, parentRating: 4, childRating: 4 }),
  meal({ id: 'lina-wed', dayLabel: 'Wednesday', mealName: 'Pasta primavera', photoLabel: 'Pasta plate', photoUrl: svgData('Pasta', 'Fresh seasonal vegetables', '#0f766e'), nutrition: '470 kcal | 16g protein | calcium rich', allergens: ['gluten', 'dairy'], dietTags: ['vegetarian'], preselected: false, parentRating: 4, childRating: 5 }),
  meal({ id: 'lina-thu', dayLabel: 'Thursday', mealName: 'Grilled fish and rice', photoLabel: 'Fish plate', photoUrl: svgData('Fish', 'Light grilled lunch', '#2563eb'), nutrition: '460 kcal | 28g protein | omega-3 rich', allergens: ['fish'], dietTags: ['halal'], preselected: false, parentRating: 5, childRating: 4 }),
  meal({ id: 'lina-fri', dayLabel: 'Friday', mealName: 'Veggie tajine with fruit', photoLabel: 'Tajine plate', photoUrl: svgData('Tajine', 'Weekend-friendly meal', '#b45309'), nutrition: '500 kcal | 15g protein | low sugar', allergens: [], dietTags: ['halal', 'vegetarian'], preselected: false, parentRating: 5, childRating: 5 })
]

const yanisMenu = [
  meal({ id: 'yanis-mon', dayLabel: 'Monday', mealName: 'Rice bowl with roasted vegetables', photoLabel: 'Rice bowl', photoUrl: svgData('Rice', 'Vegetarian lunch', '#1d4ed8'), nutrition: '420 kcal | 13g protein | gentle on digestion', allergens: [], dietTags: ['vegetarian'], preselected: true, parentRating: 5, childRating: 5 }),
  meal({ id: 'yanis-tue', dayLabel: 'Tuesday', mealName: 'Chicken kebab wraps', photoLabel: 'Wrap tray', photoUrl: svgData('Wraps', 'Halal protein lunch', '#be185d'), nutrition: '510 kcal | 23g protein | high energy', allergens: ['gluten', 'dairy'], dietTags: ['halal'], preselected: false, parentRating: 4, childRating: 4 }),
  meal({ id: 'yanis-wed', dayLabel: 'Wednesday', mealName: 'Tomato pasta with fruit cup', photoLabel: 'Pasta tray', photoUrl: svgData('Pasta', 'Simple lunch box', '#ea580c'), nutrition: '460 kcal | 14g protein | easy to eat', allergens: ['gluten'], dietTags: ['vegetarian'], preselected: false, parentRating: 4, childRating: 4 }),
  meal({ id: 'yanis-thu', dayLabel: 'Thursday', mealName: 'Baked fish with potatoes', photoLabel: 'Fish plate', photoUrl: svgData('Fish', 'Soft baked dinner style meal', '#0f766e'), nutrition: '440 kcal | 26g protein | omega-3 rich', allergens: ['fish'], dietTags: ['halal'], preselected: false, parentRating: 5, childRating: 4 }),
  meal({ id: 'yanis-fri', dayLabel: 'Friday', mealName: 'Vegetable pizza slice', photoLabel: 'Pizza slice', photoUrl: svgData('Pizza', 'Friday lunch special', '#7c2d12'), nutrition: '480 kcal | 18g protein | crowd favorite', allergens: ['gluten', 'dairy'], dietTags: ['vegetarian'], preselected: false, parentRating: 4, childRating: 5 })
]

const adamMenu = [
  meal({ id: 'adam-mon', dayLabel: 'Monday', mealName: 'Halal chicken rice bowl', photoLabel: 'Rice bowl', photoUrl: svgData('Rice', 'Comfort lunch', '#334155'), nutrition: '530 kcal | 25g protein | filling lunch', allergens: [], dietTags: ['halal'], preselected: true, parentRating: 5, childRating: 4 }),
  meal({ id: 'adam-tue', dayLabel: 'Tuesday', mealName: 'Vegetable soup and toast', photoLabel: 'Soup bowl', photoUrl: svgData('Soup', 'Soft meal for focus', '#0f766e'), nutrition: '390 kcal | 12g protein | low spice', allergens: ['gluten'], dietTags: ['vegetarian', 'halal'], preselected: false, parentRating: 4, childRating: 4 }),
  meal({ id: 'adam-wed', dayLabel: 'Wednesday', mealName: 'Turkey pasta bake', photoLabel: 'Bake tray', photoUrl: svgData('Bake', 'Protein rich tray', '#7c3aed'), nutrition: '560 kcal | 22g protein | energy boost', allergens: ['gluten', 'dairy'], dietTags: ['halal'], preselected: false, parentRating: 4, childRating: 4 }),
  meal({ id: 'adam-thu', dayLabel: 'Thursday', mealName: 'Fish rice and salad', photoLabel: 'Fish plate', photoUrl: svgData('Fish', 'Light lunch option', '#2563eb'), nutrition: '450 kcal | 24g protein | balanced', allergens: ['fish'], dietTags: ['halal'], preselected: false, parentRating: 5, childRating: 5 }),
  meal({ id: 'adam-fri', dayLabel: 'Friday', mealName: 'Fruit yogurt bowl', photoLabel: 'Yogurt bowl', photoUrl: svgData('Yogurt', 'Friday breakfast style lunch', '#db2777'), nutrition: '360 kcal | 11g protein | light meal', allergens: ['dairy'], dietTags: ['vegetarian'], preselected: false, parentRating: 4, childRating: 4 })
]

const salmaMenu = [
  meal({ id: 'salma-mon', dayLabel: 'Monday', mealName: 'Mediterranean salad box', photoLabel: 'Salad box', photoUrl: svgData('Salad', 'Fresh and light', '#0f766e'), nutrition: '410 kcal | 12g protein | fresh greens', allergens: [], dietTags: ['vegetarian'], preselected: true, parentRating: 5, childRating: 5 }),
  meal({ id: 'salma-tue', dayLabel: 'Tuesday', mealName: 'Halal chicken wrap', photoLabel: 'Wrap tray', photoUrl: svgData('Wrap', 'Quick lunch', '#be123c'), nutrition: '520 kcal | 21g protein | high energy', allergens: ['gluten', 'dairy'], dietTags: ['halal'], preselected: false, parentRating: 5, childRating: 4 }),
  meal({ id: 'salma-wed', dayLabel: 'Wednesday', mealName: 'Tomato pasta with basil', photoLabel: 'Pasta plate', photoUrl: svgData('Pasta', 'Debate day lunch', '#f97316'), nutrition: '470 kcal | 15g protein | balanced carbs', allergens: ['gluten'], dietTags: ['vegetarian'], preselected: false, parentRating: 4, childRating: 5 }),
  meal({ id: 'salma-thu', dayLabel: 'Thursday', mealName: 'Baked salmon and rice', photoLabel: 'Salmon plate', photoUrl: svgData('Salmon', 'Protein and omega-3', '#2563eb'), nutrition: '500 kcal | 27g protein | brain fuel', allergens: ['fish'], dietTags: ['halal'], preselected: false, parentRating: 5, childRating: 5 }),
  meal({ id: 'salma-fri', dayLabel: 'Friday', mealName: 'Fruit and hummus bowl', photoLabel: 'Fruit bowl', photoUrl: svgData('Fruit', 'Weekend light meal', '#84cc16'), nutrition: '380 kcal | 10g protein | low fat', allergens: [], dietTags: ['vegetarian'], preselected: false, parentRating: 5, childRating: 5 })
]

const linaMedical: SchoolLifeMedicalFileRecord = {
  bloodType: 'A+',
  allergies: ['nuts'],
  chronicConditions: ['Seasonal asthma'],
  currentMedications: ['Salbutamol inhaler as needed'],
  vaccinations: [
    vaccination({ id: 'lina-vax-1', label: 'MMR', status: 'up_to_date', updatedAt: '2025-09-12T08:20:00+01:00', note: 'Next dose not due' }),
    vaccination({ id: 'lina-vax-2', label: 'Tetanus booster', status: 'up_to_date', updatedAt: '2025-11-05T08:20:00+01:00', note: 'Valid until 2030' })
  ],
  emergencyContacts: [
    contact({ id: 'lina-contact-1', fullName: 'Amira Bennani', relationship: 'Mother', phone: '+212 600 000 010', priority: 1 }),
    contact({ id: 'lina-contact-2', fullName: 'Omar Bennani', relationship: 'Father', phone: '+212 600 000 011', priority: 2 }),
    contact({ id: 'lina-contact-3', fullName: 'Khadija Bennani', relationship: 'Grandmother', phone: '+212 600 000 012', priority: 3 })
  ],
  incidents: [
    incident({ id: 'lina-inc-1', occurredAt: '2026-03-10T11:40:00+01:00', title: 'Mild stomach discomfort', whatHappened: 'Lina reported discomfort after lunch and rested with the nurse.', actionTaken: 'Hydration, observation, and parent update sent.', pickupRequested: false, handledBy: 'School nurse' })
  ],
  visits: [
    visit({ id: 'lina-visit-1', visitedAt: '2026-03-10T11:55:00+01:00', reason: 'Nurse follow-up', doctor: 'Dr. Yasmine El Fassi', recommendation: 'Keep nut-free lunch plan visible and continue inhaler availability.', followUpAt: '2026-03-24T10:00:00+01:00' })
  ],
  recommendations: ['Keep allergy card in the school bag.', 'Inhaler remains in the nurse office.']
}

const yanisMedical: SchoolLifeMedicalFileRecord = {
  bloodType: 'O-',
  allergies: ['dairy'],
  chronicConditions: [],
  currentMedications: [],
  vaccinations: [
    vaccination({ id: 'yanis-vax-1', label: 'Polio booster', status: 'up_to_date', updatedAt: '2025-08-20T08:00:00+01:00', note: 'Fully covered' })
  ],
  emergencyContacts: [
    contact({ id: 'yanis-contact-1', fullName: 'Samir El Mansouri', relationship: 'Father', phone: '+212 600 000 021', priority: 1 }),
    contact({ id: 'yanis-contact-2', fullName: 'Nora Alaoui', relationship: 'Mother', phone: '+212 600 000 022', priority: 2 })
  ],
  incidents: [
    incident({ id: 'yanis-inc-1', occurredAt: '2026-03-08T09:15:00+01:00', title: 'Minor knee scrape', whatHappened: 'Yanis slipped during playtime and scraped his knee.', actionTaken: 'Cleaned, bandaged, and returned to class.', pickupRequested: false, handledBy: 'Campus nurse' })
  ],
  visits: [
    visit({ id: 'yanis-visit-1', visitedAt: '2026-03-08T09:25:00+01:00', reason: 'First aid check', doctor: 'Dr. Hajar Merzouki', recommendation: 'No further action required.', followUpAt: null })
  ],
  recommendations: ['Prefer dairy-free dessert options when available.']
}

const adamMedical: SchoolLifeMedicalFileRecord = {
  bloodType: 'B+',
  allergies: ['gluten'],
  chronicConditions: ['Mild asthma'],
  currentMedications: ['Preventive inhaler', 'Salbutamol inhaler'],
  vaccinations: [
    vaccination({ id: 'adam-vax-1', label: 'Flu shot', status: 'due_soon', updatedAt: '2026-03-01T09:00:00+01:00', note: 'Planned for this month' })
  ],
  emergencyContacts: [
    contact({ id: 'adam-contact-1', fullName: 'Amira Bennani', relationship: 'Mother', phone: '+212 600 000 010', priority: 1 }),
    contact({ id: 'adam-contact-2', fullName: 'Atlas campus receptionist', relationship: 'School desk', phone: '+212 500 000 300', priority: 2 })
  ],
  incidents: [
    incident({ id: 'adam-inc-1', occurredAt: '2026-03-12T13:10:00+01:00', title: 'Coughing during lunch', whatHappened: 'Adam reported a short coughing fit after eating.', actionTaken: 'Observed by the nurse and water given.', pickupRequested: false, handledBy: 'School nurse' })
  ],
  visits: [
    visit({ id: 'adam-visit-1', visitedAt: '2026-03-12T13:25:00+01:00', reason: 'Asthma check', doctor: 'Dr. Najib Rhouati', recommendation: 'Keep inhaler access in the classroom and monitor lunch ingredients.', followUpAt: '2026-03-26T10:30:00+01:00' })
  ],
  recommendations: ['Gluten-free lunch option should remain the default.', 'Share update with homeroom teacher at the start of each week.']
}

const salmaMedical: SchoolLifeMedicalFileRecord = {
  bloodType: 'AB+',
  allergies: [],
  chronicConditions: [],
  currentMedications: [],
  vaccinations: [
    vaccination({ id: 'salma-vax-1', label: 'Hepatitis A', status: 'up_to_date', updatedAt: '2025-10-14T08:40:00+01:00', note: 'Complete' })
  ],
  emergencyContacts: [
    contact({ id: 'salma-contact-1', fullName: 'Samir El Mansouri', relationship: 'Father', phone: '+212 600 000 021', priority: 1 }),
    contact({ id: 'salma-contact-2', fullName: 'Meryem El Mansouri', relationship: 'Older sister', phone: '+212 600 000 023', priority: 2 })
  ],
  incidents: [],
  visits: [
    visit({ id: 'salma-visit-1', visitedAt: '2026-02-27T09:00:00+01:00', reason: 'Annual sports clearance', doctor: 'Dr. Leila Bensouda', recommendation: 'Cleared for all school activities.', followUpAt: null })
  ],
  recommendations: ['Keep hydration notes visible on sports days.']
}

const linaDailyReport: SchoolLifeDailyReportRecord = {
  sentAt: '2026-03-19T16:45:00+01:00',
  ate: true,
  mealAmount: 'Three-quarters of the lunch portion',
  nap: false,
  napDuration: 'No nap today',
  mood: 'happy',
  activities: ['Reading circle', 'Science lab', 'Art and coloring'],
  photos: [
    photo({ id: 'lina-photo-1', label: 'Reading circle', url: svgData('Reading', 'Small group story time', '#7c3aed'), caption: 'Lina read aloud with confidence.' }),
    photo({ id: 'lina-photo-2', label: 'Science lab', url: svgData('Science', 'Prototype testing table', '#0f766e'), caption: 'She helped test the classroom bridge project.' })
  ],
  teacherComment: 'Lina stayed focused, helped her peers, and asked thoughtful questions in science.',
  diaperChanges: null,
  skills: [
    skill({ id: 'lina-skill-1', label: 'Reading fluency', level: 'Strong', detail: 'Keeps a steady pace and remembers punctuation.' }),
    skill({ id: 'lina-skill-2', label: 'Fine motor control', level: 'Growing', detail: 'Cuts and glues with more precision each week.' })
  ]
}

const yanisDailyReport: SchoolLifeDailyReportRecord = {
  sentAt: '2026-03-19T16:20:00+01:00',
  ate: true,
  mealAmount: 'Half the lunch portion',
  nap: true,
  napDuration: '52 minutes',
  mood: 'okay',
  activities: ['Phonics practice', 'Outdoor play', 'Story drawing'],
  photos: [
    photo({ id: 'yanis-photo-1', label: 'Outdoor play', url: svgData('Play', 'Playground movement time', '#2563eb'), caption: 'Yanis joined the play tower group.' })
  ],
  teacherComment: 'Yanis settled well after lunch and showed more confidence during phonics practice.',
  diaperChanges: 1,
  skills: [
    skill({ id: 'yanis-skill-1', label: 'Language awareness', level: 'Developing', detail: 'Recognizes letters faster when pictures are present.' }),
    skill({ id: 'yanis-skill-2', label: 'Self regulation', level: 'Developing', detail: 'Calms down quicker after transitions.' })
  ]
}

const adamDailyReport: SchoolLifeDailyReportRecord = {
  sentAt: '2026-03-19T16:55:00+01:00',
  ate: true,
  mealAmount: 'Full lunch eaten',
  nap: false,
  napDuration: 'Quiet rest only',
  mood: 'happy',
  activities: ['Math workshop', 'Robot club intro', 'Quiet reading'],
  photos: [
    photo({ id: 'adam-photo-1', label: 'Robot club', url: svgData('Robot', 'Hands-on starter kit', '#334155'), caption: 'Adam explored the robotics club setup.' }),
    photo({ id: 'adam-photo-2', label: 'Reading corner', url: svgData('Books', 'Calm reading corner', '#7c3aed'), caption: 'He finished the transition reading task.' })
  ],
  teacherComment: 'Adam is more confident with routine and responded well to scaffolded instructions.',
  diaperChanges: null,
  skills: [
    skill({ id: 'adam-skill-1', label: 'Routine independence', level: 'Improving', detail: 'Can unpack, settle, and begin work with fewer prompts.' }),
    skill({ id: 'adam-skill-2', label: 'Math focus', level: 'Emerging', detail: 'Completes task steps with support and less hesitation.' })
  ]
}

const salmaDailyReport: SchoolLifeDailyReportRecord = {
  sentAt: '2026-03-19T17:05:00+01:00',
  ate: true,
  mealAmount: 'All of lunch eaten',
  nap: false,
  napDuration: 'No nap required',
  mood: 'happy',
  activities: ['Debate rehearsal', 'Library reading', 'Sports training'],
  photos: [
    photo({ id: 'salma-photo-1', label: 'Debate rehearsal', url: svgData('Debate', 'Practice podium', '#be123c'), caption: 'Salma rehearsed her opening statement.' }),
    photo({ id: 'salma-photo-2', label: 'Library reading', url: svgData('Library', 'Reading corner', '#0f766e'), caption: 'She logged extra reading time after lunch.' })
  ],
  teacherComment: 'Salma supported classmates during rehearsal and led the closing discussion with confidence.',
  diaperChanges: null,
  skills: [
    skill({ id: 'salma-skill-1', label: 'Public speaking', level: 'Advanced', detail: 'Speaks clearly, maintains eye contact, and organizes ideas well.' }),
    skill({ id: 'salma-skill-2', label: 'Leadership', level: 'Advanced', detail: 'Keeps the team moving and gives useful feedback.' })
  ]
}

const linaBehavior = {
  points: 48,
  badges: [
    badge({ id: 'lina-badge-1', title: 'Star Student', earnedAt: '2026-03-15T08:00:00+01:00', detail: 'Excellent focus and teamwork across the week.' }),
    badge({ id: 'lina-badge-2', title: 'Kindness Champion', earnedAt: '2026-03-18T08:00:00+01:00', detail: 'Helped a classmate complete a science activity.' })
  ],
  alerts: [
    alert({ id: 'lina-alert-1', tone: 'calm', title: 'Positive behavior note', detail: 'Handled a classroom disagreement calmly and respectfully.', context: 'Classroom discussion', createdAt: '2026-03-18T10:45:00+01:00' })
  ],
  monthlyReports: [
    month({ id: 'lina-month-1', monthLabel: 'March 2026', points: 48, positiveHighlights: ['Perfect attendance week', 'Helped peers', 'Completed reading goals'], improvementArea: 'Keep asking for help sooner when tasks feel hard.', leaderboardRank: 2 }),
    month({ id: 'lina-month-2', monthLabel: 'February 2026', points: 41, positiveHighlights: ['Consistent homework', 'Respectful transitions'], improvementArea: 'Speak a little louder during group work.', leaderboardRank: 3 })
  ],
  leaderboardEnabled: true,
  leaderboard: [
    leaderboard({ rank: 1, name: 'Salma El Mansouri', points: 61 }),
    leaderboard({ rank: 2, name: 'Lina Bennani', points: 48 }),
    leaderboard({ rank: 3, name: 'Yanis Bennani', points: 37 })
  ]
}

const yanisBehavior = {
  points: 37,
  badges: [
    badge({ id: 'yanis-badge-1', title: 'Reading Master', earnedAt: '2026-03-16T08:00:00+01:00', detail: 'Completed the weekly reading log with a strong finish.' }),
    badge({ id: 'yanis-badge-2', title: 'Perfect Attendance', earnedAt: '2026-03-19T08:00:00+01:00', detail: 'No absences or late arrivals this month.' })
  ],
  alerts: [
    alert({ id: 'yanis-alert-1', tone: 'info', title: 'Gentle reminder', detail: 'Needs a few prompts when moving between activities.', context: 'Transition time', createdAt: '2026-03-17T09:40:00+01:00' })
  ],
  monthlyReports: [
    month({ id: 'yanis-month-1', monthLabel: 'March 2026', points: 37, positiveHighlights: ['Consistent routines', 'Improved reading confidence'], improvementArea: 'Stay seated a little longer during group tasks.', leaderboardRank: 3 })
  ],
  leaderboardEnabled: true,
  leaderboard: [
    leaderboard({ rank: 1, name: 'Salma El Mansouri', points: 61 }),
    leaderboard({ rank: 2, name: 'Lina Bennani', points: 48 }),
    leaderboard({ rank: 3, name: 'Yanis Bennani', points: 37 })
  ]
}

const adamBehavior = {
  points: 29,
  badges: [
    badge({ id: 'adam-badge-1', title: 'Most Improved', earnedAt: '2026-03-19T08:00:00+01:00', detail: 'Strong progress after the transition to the new campus.' })
  ],
  alerts: [
    alert({ id: 'adam-alert-1', tone: 'warning', title: 'Transition wobble', detail: 'Raised voice once during line-up, then recovered after support.', context: 'Afternoon dismissal', createdAt: '2026-03-14T15:10:00+01:00' })
  ],
  monthlyReports: [
    month({ id: 'adam-month-1', monthLabel: 'March 2026', points: 29, positiveHighlights: ['Followed the new routine', 'Finished work with support'], improvementArea: 'Reduce the time needed to settle after lunch.', leaderboardRank: null })
  ],
  leaderboardEnabled: false,
  leaderboard: []
}

const salmaBehavior = {
  points: 61,
  badges: [
    badge({ id: 'salma-badge-1', title: 'Perfect Attendance', earnedAt: '2026-03-19T08:00:00+01:00', detail: 'Present every day this month.' }),
    badge({ id: 'salma-badge-2', title: 'Reading Master', earnedAt: '2026-03-18T08:00:00+01:00', detail: 'Maintained a strong reading habit during the term.' })
  ],
  alerts: [
    alert({ id: 'salma-alert-1', tone: 'calm', title: 'Leadership note', detail: 'Took responsibility for group materials and timekeeping.', context: 'Debate rehearsal', createdAt: '2026-03-18T16:20:00+01:00' })
  ],
  monthlyReports: [
    month({ id: 'salma-month-1', monthLabel: 'March 2026', points: 61, positiveHighlights: ['Debate rehearsal leadership', 'Consistent attendance', 'Respectful peer support'], improvementArea: 'Continue balancing ambition with patience in group work.', leaderboardRank: 1 })
  ],
  leaderboardEnabled: true,
  leaderboard: [
    leaderboard({ rank: 1, name: 'Salma El Mansouri', points: 61 }),
    leaderboard({ rank: 2, name: 'Lina Bennani', points: 48 }),
    leaderboard({ rank: 3, name: 'Yanis Bennani', points: 37 })
  ]
}

const linaEvents = {
  calendarLabel: 'Spring calendar',
  volunteerNote: 'Parent volunteers are welcome for the gardening day and science showcase setup.',
  items: [
    event({ id: 'lina-event-1', title: 'Spring family picnic', startsAt: '2026-03-22T10:00:00+01:00', endsAt: '2026-03-22T13:00:00+01:00', location: 'Riverside lawn', dressCode: 'Casual school colors', description: 'Families join the class for games, lunch, and a short student showcase.', rsvpStatus: 'going', ticketStatus: 'available', requiresTicket: false, ticketPriceMad: null, volunteerSlots: 6, volunteerSignedUp: true, media: [media({ id: 'lina-event-media-1', kind: 'photo', label: 'Picnic setup', url: svgData('Picnic', 'Outdoor family event', '#0f766e') })] }),
    event({ id: 'lina-event-2', title: 'Science showcase evening', startsAt: '2026-03-28T17:30:00+01:00', endsAt: '2026-03-28T19:30:00+01:00', location: 'Innovation hall', dressCode: 'Smart casual', description: 'Students present projects to parents and the school leadership team.', rsvpStatus: 'maybe', ticketStatus: 'reserved', requiresTicket: true, ticketPriceMad: 120, volunteerSlots: 4, volunteerSignedUp: false, media: [media({ id: 'lina-event-media-2', kind: 'photo', label: 'Showcase banner', url: svgData('Showcase', 'Evening presentation', '#7c3aed') }), media({ id: 'lina-event-media-3', kind: 'video', label: 'Past showcase clip', url: 'https://example.com/school-life-showcase-video' })] })
  ]
}

const yanisEvents = {
  calendarLabel: 'Early years calendar',
  volunteerNote: 'Family volunteers can help at the spring storytelling corner.',
  items: [
    event({ id: 'yanis-event-1', title: 'Storytelling morning', startsAt: '2026-03-21T09:00:00+01:00', endsAt: '2026-03-21T10:15:00+01:00', location: 'Early years hall', dressCode: 'Comfortable clothes', description: 'Parents join for a storytelling session and classroom songs.', rsvpStatus: 'going', ticketStatus: 'available', requiresTicket: false, ticketPriceMad: null, volunteerSlots: 2, volunteerSignedUp: true, media: [media({ id: 'yanis-event-media-1', kind: 'photo', label: 'Story corner', url: svgData('Stories', 'Storytelling morning', '#1d4ed8') })] }),
    event({ id: 'yanis-event-2', title: 'Class picnic', startsAt: '2026-03-29T11:00:00+01:00', endsAt: '2026-03-29T13:00:00+01:00', location: 'Courtyard', dressCode: 'School cap and sun hat', description: 'Picnic lunch, simple games, and photo moments with families.', rsvpStatus: 'pending', ticketStatus: 'available', requiresTicket: false, ticketPriceMad: null, volunteerSlots: 3, volunteerSignedUp: false, media: [] })
  ]
}

const adamEvents = {
  calendarLabel: 'Transition calendar',
  volunteerNote: "The school is still confirming volunteer slots for Adam's campus events.",
  items: [
    event({ id: 'adam-event-1', title: 'Atlas welcome tea', startsAt: '2026-03-23T14:30:00+01:00', endsAt: '2026-03-23T15:30:00+01:00', location: 'Atlas reception', dressCode: 'Casual', description: 'Meet the teaching team and review the transition plan for the new campus.', rsvpStatus: 'going', ticketStatus: 'available', requiresTicket: false, ticketPriceMad: null, volunteerSlots: 2, volunteerSignedUp: false, media: [] }),
    event({ id: 'adam-event-2', title: 'Music trial recital', startsAt: '2026-03-30T16:00:00+01:00', endsAt: '2026-03-30T17:00:00+01:00', location: 'Music room 2', dressCode: 'School uniform', description: 'Short recital for the children trying music club for the first time.', rsvpStatus: 'maybe', ticketStatus: 'reserved', requiresTicket: true, ticketPriceMad: 90, volunteerSlots: 1, volunteerSignedUp: false, media: [media({ id: 'adam-event-media-1', kind: 'photo', label: 'Recital stage', url: svgData('Music', 'Trial recital space', '#7c3aed') })] })
  ]
}

const salmaEvents = {
  calendarLabel: 'Leadership calendar',
  volunteerNote: 'Volunteer roles are available for debate finals and library support.',
  items: [
    event({ id: 'salma-event-1', title: 'Debate final', startsAt: '2026-03-25T16:00:00+01:00', endsAt: '2026-03-25T18:30:00+01:00', location: 'Debate hall', dressCode: 'Formal school uniform', description: 'Final round for the debate team with parent seating available.', rsvpStatus: 'going', ticketStatus: 'available', requiresTicket: true, ticketPriceMad: 150, volunteerSlots: 5, volunteerSignedUp: true, media: [media({ id: 'salma-event-media-1', kind: 'photo', label: 'Debate podium', url: svgData('Debate', 'Final round stage', '#be123c') }), media({ id: 'salma-event-media-2', kind: 'video', label: 'Team highlight clip', url: 'https://example.com/debate-highlight-video' })] }),
    event({ id: 'salma-event-2', title: 'Library volunteer morning', startsAt: '2026-04-02T09:00:00+01:00', endsAt: '2026-04-02T11:00:00+01:00', location: 'School library', dressCode: 'Comfortable smart casual', description: 'Parent volunteers help with reading shelves and event prep.', rsvpStatus: 'maybe', ticketStatus: 'available', requiresTicket: false, ticketPriceMad: null, volunteerSlots: 4, volunteerSignedUp: false, media: [] })
  ]
}

export const childSchoolLifeById: Record<string, ChildSchoolLifeRecord> = {
  'student-lina': {
    canteen: {
      weeklyMenu: linaMenu,
      balanceMad: 320,
      paymentHistory: [
        payment({ id: 'lina-pay-1', label: 'March canteen top-up', postedAt: '2026-03-08T09:40:00+01:00', amountMad: 500, method: 'CMI', status: 'paid', note: 'Auto-top-up completed successfully.' }),
        payment({ id: 'lina-pay-2', label: 'Pending lunch balance', postedAt: '2026-03-19T08:15:00+01:00', amountMad: 320, method: 'Parent wallet', status: 'pending', note: 'Waiting for the next top-up cycle.' })
      ],
      specialDietRequests: [
        request({ id: 'lina-diet-1', type: 'nut_free', status: 'approved', createdAt: '2026-03-01T08:00:00+01:00', detail: 'Nut-free handling and separate utensils are already active.' }),
        request({ id: 'lina-diet-2', type: 'halal', status: 'approved', createdAt: '2026-03-01T08:05:00+01:00', detail: 'All lunches are prepared with halal ingredients.' })
      ],
      notes: 'Allergy-safe prep labels are printed every morning for this child.'
    },
    health: linaMedical,
    dailyReport: linaDailyReport,
    behavior: linaBehavior,
    events: linaEvents
  },
  'student-yanis': {
    canteen: {
      weeklyMenu: yanisMenu,
      balanceMad: 0,
      paymentHistory: [
        payment({ id: 'yanis-pay-1', label: 'Weekly canteen pack', postedAt: '2026-03-14T08:10:00+01:00', amountMad: 420, method: 'Stripe', status: 'paid', note: 'Week pack settled.' })
      ],
      specialDietRequests: [
        request({ id: 'yanis-diet-1', type: 'vegetarian', status: 'approved', createdAt: '2026-02-27T09:00:00+01:00', detail: 'Vegetarian meals are the default for this child.' }),
        request({ id: 'yanis-diet-2', type: 'dairy_free', status: 'reviewing', createdAt: '2026-03-18T10:00:00+01:00', detail: 'Family asked to reduce dairy-heavy dessert items.' })
      ],
      notes: 'The canteen team labels dairy-containing dishes for faster review.'
    },
    health: yanisMedical,
    dailyReport: yanisDailyReport,
    behavior: yanisBehavior,
    events: yanisEvents
  },
  'student-adam': {
    canteen: {
      weeklyMenu: adamMenu,
      balanceMad: 540,
      paymentHistory: [
        payment({ id: 'adam-pay-1', label: 'Transition lunch balance', postedAt: '2026-03-07T08:15:00+01:00', amountMad: 540, method: 'Bank transfer', status: 'paid', note: 'Balance loaded after campus move.' })
      ],
      specialDietRequests: [
        request({ id: 'adam-diet-1', type: 'gluten_free', status: 'approved', createdAt: '2026-03-06T09:10:00+01:00', detail: 'Gluten-free replacement meals are active each day.' }),
        request({ id: 'adam-diet-2', type: 'halal', status: 'approved', createdAt: '2026-03-06T09:12:00+01:00', detail: 'All offered meals are kept halal.' })
      ],
      notes: "Gluten-free alternatives are prepared first for Adam's lunch tray."
    },
    health: adamMedical,
    dailyReport: adamDailyReport,
    behavior: adamBehavior,
    events: adamEvents
  },
  'student-salma': {
    canteen: {
      weeklyMenu: salmaMenu,
      balanceMad: 180,
      paymentHistory: [
        payment({ id: 'salma-pay-1', label: 'March canteen deposit', postedAt: '2026-03-03T08:30:00+01:00', amountMad: 600, method: 'CMI', status: 'paid', note: 'Top-up loaded in advance.' }),
        payment({ id: 'salma-pay-2', label: 'Lunch reserve', postedAt: '2026-03-19T08:45:00+01:00', amountMad: 180, method: 'Parent wallet', status: 'pending', note: 'Reserved for the debate week.' })
      ],
      specialDietRequests: [
        request({ id: 'salma-diet-1', type: 'vegetarian', status: 'approved', createdAt: '2026-02-20T08:20:00+01:00', detail: 'Vegetarian meals are always available when requested.' })
      ],
      notes: 'Vegetarian preference is highlighted on the kitchen prep list.'
    },
    health: salmaMedical,
    dailyReport: salmaDailyReport,
    behavior: salmaBehavior,
    events: salmaEvents
  }
}
