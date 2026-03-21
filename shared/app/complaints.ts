import type {
  ChildComplaintsModuleRecord,
  ComplaintModuleAttachmentRecord,
  ComplaintModuleRecord,
  ComplaintStatusHistoryRecord,
  SatisfactionSurveyCategoryRatingRecord,
  SatisfactionSurveySubmissionRecord
} from './types.ts'

function attachment(payload: ComplaintModuleAttachmentRecord): ComplaintModuleAttachmentRecord {
  return payload
}

function history(payload: ComplaintStatusHistoryRecord): ComplaintStatusHistoryRecord {
  return payload
}

function complaint(payload: ComplaintModuleRecord): ComplaintModuleRecord {
  return payload
}

function categoryRating(payload: SatisfactionSurveyCategoryRatingRecord): SatisfactionSurveyCategoryRatingRecord {
  return payload
}

function surveySubmission(payload: SatisfactionSurveySubmissionRecord): SatisfactionSurveySubmissionRecord {
  return payload
}

function textAsset(id: string, label: string, detail: string, kind: ComplaintModuleAttachmentRecord['kind'] = 'pdf') {
  return attachment({
    id,
    kind,
    label,
    url: `data:text/plain;charset=utf-8,${encodeURIComponent(`${label}\n${detail}`)}`
  })
}

export const childComplaintsById: Record<string, ChildComplaintsModuleRecord> = {
  'student-lina': {
    complaints: [
      complaint({
        id: 'cmp-lina-fac-1',
        childId: 'student-lina',
        title: 'Classroom fan maintenance needed',
        category: 'facilities',
        description: 'The classroom fan has been unstable for two days, and the room becomes too warm after 11:00.',
        priority: 'high',
        anonymous: false,
        createdAt: '2026-03-14T09:10:00+01:00',
        updatedAt: '2026-03-16T15:30:00+01:00',
        status: 'in_progress',
        schoolResponse: 'Maintenance scheduled for tomorrow morning before classes start.',
        estimatedResolutionAt: '2026-03-18T10:00:00+01:00',
        escalation: {
          thresholdDays: 3,
          escalated: false,
          escalatedAt: null,
          detail: 'Escalates automatically to operations manager if unresolved after 3 days.'
        },
        attachments: [
          textAsset('cmp-lina-fac-a1', 'Classroom photo', 'Parent attachment showing the affected fan area.', 'image')
        ],
        history: [
          history({ id: 'cmp-lina-fac-h1', status: 'submitted', note: 'Complaint submitted by parent.', actor: 'parent', createdAt: '2026-03-14T09:10:00+01:00' }),
          history({ id: 'cmp-lina-fac-h2', status: 'in_progress', note: 'Facilities team assigned and inspection started.', actor: 'school', createdAt: '2026-03-15T08:40:00+01:00' })
        ],
        resolutionRating: null
      }),
      complaint({
        id: 'cmp-lina-food-1',
        childId: 'student-lina',
        title: 'Nut-free lunch labeling issue',
        category: 'cantine_food',
        description: 'Two lunch trays were missing nut-free labels this week.',
        priority: 'urgent',
        anonymous: true,
        createdAt: '2026-03-09T11:25:00+01:00',
        updatedAt: '2026-03-11T13:10:00+01:00',
        status: 'resolved',
        schoolResponse: 'Canteen labels were reprinted and allergy-check protocol was rebriefed with all supervisors.',
        estimatedResolutionAt: '2026-03-11T14:00:00+01:00',
        escalation: {
          thresholdDays: 2,
          escalated: false,
          escalatedAt: null,
          detail: 'Escalates to health and safety lead if unresolved after 2 days.'
        },
        attachments: [textAsset('cmp-lina-food-a1', 'Meal plan note', 'Daily allergy meal plan note.', 'file')],
        history: [
          history({ id: 'cmp-lina-food-h1', status: 'submitted', note: 'Anonymous complaint submitted.', actor: 'parent', createdAt: '2026-03-09T11:25:00+01:00' }),
          history({ id: 'cmp-lina-food-h2', status: 'in_progress', note: 'Canteen lead started allergy audit.', actor: 'school', createdAt: '2026-03-09T14:05:00+01:00' }),
          history({ id: 'cmp-lina-food-h3', status: 'resolved', note: 'Protocol updated and issue closed.', actor: 'school', createdAt: '2026-03-11T13:10:00+01:00' })
        ],
        resolutionRating: { score: 4, note: 'Fast response and clear follow-up.', ratedAt: '2026-03-11T20:00:00+01:00' }
      })
    ],
    survey: {
      monthLabel: 'March 2026',
      submissionWindow: 'Open until March 31',
      note: 'Survey results are shared with school leadership only as aggregate indicators.',
      submissions: [
        surveySubmission({
          id: 'survey-lina-1',
          submittedAt: '2026-03-05T21:10:00+01:00',
          monthLabel: 'March 2026',
          anonymous: false,
          npsScore: 8,
          categoryRatings: [
            categoryRating({ category: 'academic', label: 'Teaching quality', score: 4 }),
            categoryRating({ category: 'cantine_food', label: 'Cantine / Food', score: 4 }),
            categoryRating({ category: 'transport', label: 'Transport', score: 5 }),
            categoryRating({ category: 'facilities', label: 'Facilities', score: 3 })
          ],
          suggestion: 'Please share weekly canteen menu updates earlier in the week.'
        })
      ]
    }
  },
  'student-yanis': {
    complaints: [
      complaint({
        id: 'cmp-yanis-beh-1',
        childId: 'student-yanis',
        title: 'Repeated recess pushing incident',
        category: 'behavior',
        description: 'Yanis mentioned repeated pushing near the playground exit during recess.',
        priority: 'urgent',
        anonymous: false,
        createdAt: '2026-03-10T12:30:00+01:00',
        updatedAt: '2026-03-16T10:25:00+01:00',
        status: 'in_progress',
        schoolResponse: 'Supervisor has assigned extra monitoring and classroom mediation is scheduled.',
        estimatedResolutionAt: '2026-03-18T16:00:00+01:00',
        escalation: {
          thresholdDays: 3,
          escalated: true,
          escalatedAt: '2026-03-14T09:10:00+01:00',
          detail: 'Escalated to student wellbeing committee after 3 days without full closure.'
        },
        attachments: [textAsset('cmp-yanis-beh-a1', 'Incident timeline', 'Parent timeline note covering three dates.', 'file')],
        history: [
          history({ id: 'cmp-yanis-beh-h1', status: 'submitted', note: 'Complaint submitted by parent.', actor: 'parent', createdAt: '2026-03-10T12:30:00+01:00' }),
          history({ id: 'cmp-yanis-beh-h2', status: 'in_progress', note: 'Initial review with playground team started.', actor: 'school', createdAt: '2026-03-11T08:35:00+01:00' }),
          history({ id: 'cmp-yanis-beh-h3', status: 'in_progress', note: 'Escalated to wellbeing committee.', actor: 'system', createdAt: '2026-03-14T09:10:00+01:00' })
        ],
        resolutionRating: null
      })
    ],
    survey: {
      monthLabel: 'March 2026',
      submissionWindow: 'Open until March 31',
      note: 'School teams review trends by category and NPS only; no individual identity is exposed in aggregate dashboards.',
      submissions: [
        surveySubmission({
          id: 'survey-yanis-1',
          submittedAt: '2026-03-12T19:05:00+01:00',
          monthLabel: 'March 2026',
          anonymous: true,
          npsScore: 6,
          categoryRatings: [
            categoryRating({ category: 'behavior', label: 'Behavior & discipline', score: 2 }),
            categoryRating({ category: 'safety_security', label: 'Safety & Security', score: 3 }),
            categoryRating({ category: 'academic', label: 'Academic', score: 4 }),
            categoryRating({ category: 'staff_behavior', label: 'Staff behavior', score: 4 })
          ],
          suggestion: 'More proactive playground supervision near gate transition would help.'
        })
      ]
    }
  },
  'student-adam': {
    complaints: [
      complaint({
        id: 'cmp-adam-trp-1',
        childId: 'student-adam',
        title: 'Transport assignment delay',
        category: 'transport',
        description: 'Transport route assignment has been pending for more than one week at the new campus.',
        priority: 'medium',
        anonymous: false,
        createdAt: '2026-03-13T10:40:00+01:00',
        updatedAt: '2026-03-13T10:40:00+01:00',
        status: 'submitted',
        schoolResponse: null,
        estimatedResolutionAt: '2026-03-19T18:00:00+01:00',
        escalation: {
          thresholdDays: 5,
          escalated: false,
          escalatedAt: null,
          detail: 'Escalates to transport coordinator after 5 days.'
        },
        attachments: [],
        history: [
          history({ id: 'cmp-adam-trp-h1', status: 'submitted', note: 'Complaint submitted by parent.', actor: 'parent', createdAt: '2026-03-13T10:40:00+01:00' })
        ],
        resolutionRating: null
      }),
      complaint({
        id: 'cmp-adam-stf-1',
        childId: 'student-adam',
        title: 'Front-desk communication inconsistency',
        category: 'staff_behavior',
        description: 'Different pickup instructions were shared by two reception staff members on the same day.',
        priority: 'high',
        anonymous: false,
        createdAt: '2026-03-08T09:55:00+01:00',
        updatedAt: '2026-03-15T17:10:00+01:00',
        status: 'reopened',
        schoolResponse: 'Case reopened and reassigned to parent relations lead for coaching and process alignment.',
        estimatedResolutionAt: '2026-03-19T12:00:00+01:00',
        escalation: {
          thresholdDays: 4,
          escalated: true,
          escalatedAt: '2026-03-14T09:45:00+01:00',
          detail: 'Escalated after reopen due to repeated inconsistency.'
        },
        attachments: [textAsset('cmp-adam-stf-a1', 'Chat summary', 'Summary of conflicting instructions.', 'file')],
        history: [
          history({ id: 'cmp-adam-stf-h1', status: 'submitted', note: 'Complaint submitted by parent.', actor: 'parent', createdAt: '2026-03-08T09:55:00+01:00' }),
          history({ id: 'cmp-adam-stf-h2', status: 'in_progress', note: 'Reception manager reviewed interaction logs.', actor: 'school', createdAt: '2026-03-09T10:20:00+01:00' }),
          history({ id: 'cmp-adam-stf-h3', status: 'resolved', note: 'School closed complaint after team briefing.', actor: 'school', createdAt: '2026-03-11T15:40:00+01:00' }),
          history({ id: 'cmp-adam-stf-h4', status: 'reopened', note: 'Parent reopened complaint due to repeated issue.', actor: 'parent', createdAt: '2026-03-14T08:30:00+01:00' })
        ],
        resolutionRating: null
      })
    ],
    survey: {
      monthLabel: 'March 2026',
      submissionWindow: 'Open until March 31',
      note: 'Survey analytics show aggregate sentiment and trends only.',
      submissions: []
    }
  },
  'student-salma': {
    complaints: [
      complaint({
        id: 'cmp-salma-acd-1',
        childId: 'student-salma',
        title: 'Debate curriculum pacing',
        category: 'academic',
        description: 'Parent requested better pacing alignment between debate intensive sessions and regular coursework.',
        priority: 'low',
        anonymous: false,
        createdAt: '2026-02-26T14:20:00+01:00',
        updatedAt: '2026-03-02T11:00:00+01:00',
        status: 'resolved',
        schoolResponse: 'Debate coordinator adjusted weekly load and shared a revised pacing plan with teachers.',
        estimatedResolutionAt: '2026-03-03T09:00:00+01:00',
        escalation: {
          thresholdDays: 7,
          escalated: false,
          escalatedAt: null,
          detail: 'Escalates to pedagogy committee if unresolved after 7 days.'
        },
        attachments: [textAsset('cmp-salma-acd-a1', 'Pacing suggestion', 'Parent suggestion memo.', 'pdf')],
        history: [
          history({ id: 'cmp-salma-acd-h1', status: 'submitted', note: 'Complaint submitted by parent.', actor: 'parent', createdAt: '2026-02-26T14:20:00+01:00' }),
          history({ id: 'cmp-salma-acd-h2', status: 'in_progress', note: 'Academic lead reviewed weekly schedule conflict.', actor: 'school', createdAt: '2026-02-28T09:00:00+01:00' }),
          history({ id: 'cmp-salma-acd-h3', status: 'resolved', note: 'Revised schedule and teacher sync completed.', actor: 'school', createdAt: '2026-03-02T11:00:00+01:00' })
        ],
        resolutionRating: { score: 5, note: 'Excellent follow-through and communication.', ratedAt: '2026-03-02T20:15:00+01:00' }
      })
    ],
    survey: {
      monthLabel: 'March 2026',
      submissionWindow: 'Open until March 31',
      note: 'Anonymous mode is supported and school dashboards aggregate results by month and category.',
      submissions: [
        surveySubmission({
          id: 'survey-salma-1',
          submittedAt: '2026-03-06T18:10:00+01:00',
          monthLabel: 'March 2026',
          anonymous: false,
          npsScore: 9,
          categoryRatings: [
            categoryRating({ category: 'academic', label: 'Academic', score: 5 }),
            categoryRating({ category: 'staff_behavior', label: 'Staff behavior', score: 5 }),
            categoryRating({ category: 'safety_security', label: 'Safety & Security', score: 4 }),
            categoryRating({ category: 'facilities', label: 'Facilities', score: 4 })
          ],
          suggestion: 'Continue sharing pre-event logistics this clearly.'
        }),
        surveySubmission({
          id: 'survey-salma-2',
          submittedAt: '2026-03-14T21:30:00+01:00',
          monthLabel: 'March 2026',
          anonymous: true,
          npsScore: 10,
          categoryRatings: [
            categoryRating({ category: 'academic', label: 'Academic', score: 5 }),
            categoryRating({ category: 'transport', label: 'Transport', score: 4 }),
            categoryRating({ category: 'cantine_food', label: 'Cantine / Food', score: 4 }),
            categoryRating({ category: 'staff_behavior', label: 'Staff behavior', score: 5 })
          ],
          suggestion: 'Would love optional monthly parent forum sessions.'
        })
      ]
    }
  }
}
