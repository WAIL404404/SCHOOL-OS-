import type {
  ChildMessagesRecord,
  CommunicationAnnouncementRecord,
  CommunicationAppointmentRecord,
  CommunicationAppointmentReminderRecord,
  CommunicationAppointmentSlotRecord,
  CommunicationAttachmentRecord,
  CommunicationConversationRecord,
  ConversationMessageRecord,
  CommunicationParticipantRecord,
  CommunicationNotificationPreferencesRecord
} from './types.ts'

function attachment(payload: CommunicationAttachmentRecord): CommunicationAttachmentRecord {
  return payload
}

function message(payload: ConversationMessageRecord): ConversationMessageRecord {
  return payload
}

function conversation(payload: CommunicationConversationRecord): CommunicationConversationRecord {
  return payload
}

function announcement(payload: CommunicationAnnouncementRecord): CommunicationAnnouncementRecord {
  return payload
}

function slot(payload: CommunicationAppointmentSlotRecord): CommunicationAppointmentSlotRecord {
  return payload
}

function reminder(payload: CommunicationAppointmentReminderRecord): CommunicationAppointmentReminderRecord {
  return payload
}

function appointment(payload: CommunicationAppointmentRecord): CommunicationAppointmentRecord {
  return payload
}

function participant(payload: CommunicationParticipantRecord): CommunicationParticipantRecord {
  return payload
}

function textAttachment(id: string, kind: CommunicationAttachmentRecord['kind'], label: string, detail: string) {
  return attachment({
    id,
    kind,
    label,
    url: `data:text/plain;charset=utf-8,${encodeURIComponent(`${label}\n${detail}`)}`
  })
}

const linaTeacher = participant({
  id: 'msg-staff-zohra',
  role: 'class_teacher',
  fullName: 'Zohra El Amrani',
  title: 'Grade 4 class teacher',
  averageResponseHours: 5.2,
  officeHours: 'Mon-Thu 15:30-17:30',
  availabilityNote: 'Best for class progress, behavior, and homework follow-up.'
})

const linaMathTeacher = participant({
  id: 'msg-staff-hamza',
  role: 'subject_teacher',
  fullName: 'Hamza Idrissi',
  title: 'Math teacher',
  averageResponseHours: 8.1,
  officeHours: 'Tue-Thu 16:00-18:00',
  availabilityNote: 'Use for subject-specific questions and assessment follow-up.'
})

const linaAdmin = participant({
  id: 'msg-staff-admin',
  role: 'administration',
  fullName: 'Nadia Tazi',
  title: 'Parent relations office',
  averageResponseHours: 2.4,
  officeHours: 'Mon-Fri 08:00-18:00',
  availabilityNote: 'Billing, logistics, attendance notes, and documents.'
})

const director = participant({
  id: 'msg-staff-director',
  role: 'director',
  fullName: 'Mounir Benjelloun',
  title: 'School director',
  averageResponseHours: 18.5,
  officeHours: 'Tue and Thu 11:00-13:00',
  availabilityNote: 'For escalations, strategic concerns, and high-priority meetings.'
})

const supervisor = participant({
  id: 'msg-staff-supervisor',
  role: 'supervisor',
  fullName: 'Hind Ouhammou',
  title: 'Campus supervisor',
  averageResponseHours: 3.3,
  officeHours: 'Mon-Fri 07:30-16:30',
  availabilityNote: 'Dismissal, safety flow, and transport-adjacent supervision topics.'
})

const psychologist = participant({
  id: 'msg-staff-psych',
  role: 'psychologist',
  fullName: 'Dr. Salma Raji',
  title: 'School psychologist',
  averageResponseHours: 11.7,
  officeHours: 'Wed-Fri 09:00-15:00',
  availabilityNote: 'For wellbeing check-ins, adjustment, and confidential support.'
})

const yanisTeacher = participant({
  id: 'msg-staff-yanis',
  role: 'class_teacher',
  fullName: 'Imane Chraibi',
  title: 'Grade 1 class teacher',
  averageResponseHours: 4.8,
  officeHours: 'Mon-Thu 15:00-17:00',
  availabilityNote: 'For daily classroom routines and early years communication.'
})

const salmaTeacher = participant({
  id: 'msg-staff-salma',
  role: 'subject_teacher',
  fullName: 'Karim El Gharbi',
  title: 'Debate coach',
  averageResponseHours: 6.4,
  officeHours: 'Mon-Wed 16:30-18:00',
  availabilityNote: 'Debate club, competitions, and showcase preparation.'
})

export const childMessagesById: Record<string, ChildMessagesRecord> = {
  'student-lina': {
    conversations: [
      conversation({
        id: 'conv-lina-zohra',
        participant: linaTeacher,
        subject: 'Weekly classroom follow-up',
        archived: false,
        lastMessagePreview: 'Thank you, I will upload the signed trip note tonight.',
        messages: [
          message({ id: 'msg-lina-zohra-1', sender: 'school', senderName: linaTeacher.fullName, body: 'Lina had a strong week in writing. I also sent the museum trip note for your review.', sentAt: '2026-03-15T16:20:00+01:00', seenAt: '2026-03-15T16:35:00+01:00', attachments: [textAttachment('msg-lina-zohra-a1', 'pdf', 'Museum trip note', 'Grade 4 museum trip form')] }),
          message({ id: 'msg-lina-zohra-2', sender: 'parent', senderName: 'Amira Bennani', body: 'Thank you, I will upload the signed trip note tonight.', sentAt: '2026-03-15T16:42:00+01:00', seenAt: '2026-03-15T17:08:00+01:00', attachments: [] })
        ]
      }),
      conversation({
        id: 'conv-lina-hamza',
        participant: linaMathTeacher,
        subject: 'Fractions quiz follow-up',
        archived: false,
        lastMessagePreview: 'I attached the corrected worksheet and a short voice explanation.',
        messages: [
          message({ id: 'msg-lina-hamza-1', sender: 'parent', senderName: 'Amira Bennani', body: 'Could you share what Lina should focus on before the next quiz?', sentAt: '2026-03-14T19:10:00+01:00', seenAt: '2026-03-14T21:00:00+01:00', attachments: [] }),
          message({ id: 'msg-lina-hamza-2', sender: 'school', senderName: linaMathTeacher.fullName, body: 'I attached the corrected worksheet and a short voice explanation.', sentAt: '2026-03-14T20:42:00+01:00', seenAt: '2026-03-14T21:00:00+01:00', attachments: [textAttachment('msg-lina-hamza-a1', 'file', 'Corrected worksheet', 'Fractions correction sheet'), textAttachment('msg-lina-hamza-a2', 'voice_note', 'Voice note', 'Revision voice note by teacher')] })
        ]
      }),
      conversation({
        id: 'conv-lina-admin',
        participant: linaAdmin,
        subject: 'Invoice and document support',
        archived: true,
        lastMessagePreview: 'Your invoice PDF is now attached and the payment reminder has been updated.',
        messages: [
          message({ id: 'msg-lina-admin-1', sender: 'school', senderName: linaAdmin.fullName, body: 'Your invoice PDF is now attached and the payment reminder has been updated.', sentAt: '2026-03-12T10:05:00+01:00', seenAt: '2026-03-12T10:18:00+01:00', attachments: [textAttachment('msg-lina-admin-a1', 'pdf', 'Invoice PDF', 'March tuition invoice')] })
        ]
      }),
      conversation({
        id: 'conv-lina-psych',
        participant: psychologist,
        subject: 'Confidence check-in',
        archived: false,
        lastMessagePreview: 'We can book a short virtual follow-up next week if helpful.',
        messages: [
          message({ id: 'msg-lina-psych-1', sender: 'school', senderName: psychologist.fullName, body: 'We can book a short virtual follow-up next week if helpful.', sentAt: '2026-03-16T12:05:00+01:00', seenAt: null, attachments: [] })
        ]
      })
    ],
    announcements: [
      announcement({
        id: 'ann-lina-emergency',
        scope: 'emergency',
        title: 'Emergency alert: afternoon pickup gate change',
        body: 'Due to road works, all afternoon pickups will use the east gate today. A priority push notification has been sent.',
        createdAt: '2026-03-17T13:05:00+01:00',
        pinned: true,
        read: false,
        acknowledgedAt: null,
        targetLabel: 'School-wide',
        attachments: [textAttachment('ann-lina-emg-a1', 'image', 'Updated gate map', 'East gate access map')]
      }),
      announcement({
        id: 'ann-lina-class',
        scope: 'class',
        title: 'Grade 4 museum trip checklist',
        body: 'Please review the lunch, notebook, and uniform checklist before Friday.',
        createdAt: '2026-03-16T15:12:00+01:00',
        pinned: true,
        read: true,
        acknowledgedAt: '2026-03-16T16:01:00+01:00',
        targetLabel: 'Grade 4',
        attachments: [textAttachment('ann-lina-class-a1', 'pdf', 'Checklist PDF', 'Field trip checklist')]
      }),
      announcement({
        id: 'ann-lina-personal',
        scope: 'personal',
        title: 'Personal note: parent-teacher meeting summary posted',
        body: 'Your last meeting summary is now available in the communication archive.',
        createdAt: '2026-03-14T18:40:00+01:00',
        pinned: false,
        read: false,
        acknowledgedAt: null,
        targetLabel: 'Lina Bennani',
        attachments: [textAttachment('ann-lina-personal-a1', 'pdf', 'Meeting summary', 'Teacher meeting summary')]
      })
    ],
    appointmentSlots: [
      slot({ id: 'slot-lina-zohra-1', participantId: linaTeacher.id, startsAt: '2026-03-20T15:45:00+01:00', endsAt: '2026-03-20T16:05:00+01:00', mode: 'virtual', available: true }),
      slot({ id: 'slot-lina-zohra-2', participantId: linaTeacher.id, startsAt: '2026-03-21T16:10:00+01:00', endsAt: '2026-03-21T16:30:00+01:00', mode: 'in_person', available: true }),
      slot({ id: 'slot-lina-psych-1', participantId: psychologist.id, startsAt: '2026-03-24T10:00:00+01:00', endsAt: '2026-03-24T10:25:00+01:00', mode: 'virtual', available: true }),
      slot({ id: 'slot-lina-director-1', participantId: director.id, startsAt: '2026-03-26T11:30:00+01:00', endsAt: '2026-03-26T11:50:00+01:00', mode: 'in_person', available: true })
    ],
    appointments: [
      appointment({
        id: 'appt-lina-zohra',
        participantId: linaTeacher.id,
        participantLabel: `${linaTeacher.fullName} · ${linaTeacher.title}`,
        purpose: 'Discuss field trip readiness and math confidence',
        status: 'confirmed',
        startsAt: '2026-03-20T15:45:00+01:00',
        endsAt: '2026-03-20T16:05:00+01:00',
        mode: 'virtual',
        meetingLink: 'https://meet.google.com/schoolos-lina-zohra',
        reminders: [
          reminder({ id: 'appt-lina-zohra-r1', trigger: '1_day', scheduledFor: '2026-03-19T15:45:00+01:00', status: 'scheduled' }),
          reminder({ id: 'appt-lina-zohra-r2', trigger: '1_hour', scheduledFor: '2026-03-20T14:45:00+01:00', status: 'scheduled' })
        ],
        summary: 'Teacher will share a short revision plan and museum supervision expectations.',
        actionItems: ['Parent to sign trip approval tonight', 'Teacher to upload extra fraction revision sheet'],
        createdAt: '2026-03-16T18:00:00+01:00',
        updatedAt: '2026-03-16T18:06:00+01:00'
      })
    ],
    preferences: {
      channels: { push: true, email: true, sms: false, whatsapp: true },
      frequency: 'instant',
      doNotDisturbStart: '21:30',
      doNotDisturbEnd: '06:45',
      whatsapp: {
        optIn: true,
        invoiceReminders: true,
        emergencyAlerts: true,
        absenceNotifications: true,
        busTrackingLink: true,
        updatedAt: '2026-03-10T19:00:00+01:00'
      }
    }
  },
  'student-yanis': {
    conversations: [
      conversation({
        id: 'conv-yanis-imane',
        participant: yanisTeacher,
        subject: 'Reading circle progress',
        archived: false,
        lastMessagePreview: 'Yanis was very engaged today and I attached a photo from reading time.',
        messages: [
          message({ id: 'msg-yanis-1', sender: 'school', senderName: yanisTeacher.fullName, body: 'Yanis was very engaged today and I attached a photo from reading time.', sentAt: '2026-03-16T15:18:00+01:00', seenAt: '2026-03-16T16:00:00+01:00', attachments: [textAttachment('msg-yanis-a1', 'image', 'Reading circle photo', 'Early years reading session photo')] })
        ]
      }),
      conversation({
        id: 'conv-yanis-supervisor',
        participant: supervisor,
        subject: 'Dismissal queue note',
        archived: false,
        lastMessagePreview: 'Tomorrow dismissal will be slightly slower because of gate maintenance.',
        messages: [
          message({ id: 'msg-yanis-supervisor-1', sender: 'school', senderName: supervisor.fullName, body: 'Tomorrow dismissal will be slightly slower because of gate maintenance.', sentAt: '2026-03-17T07:25:00+01:00', seenAt: null, attachments: [] })
        ]
      })
    ],
    announcements: [
      announcement({
        id: 'ann-yanis-school',
        scope: 'school_wide',
        title: 'Spring storytelling week',
        body: 'Families are invited to send one favorite storybook photo for the week display.',
        createdAt: '2026-03-15T09:40:00+01:00',
        pinned: true,
        read: false,
        acknowledgedAt: null,
        targetLabel: 'School-wide',
        attachments: []
      })
    ],
    appointmentSlots: [
      slot({ id: 'slot-yanis-imane-1', participantId: yanisTeacher.id, startsAt: '2026-03-21T15:10:00+01:00', endsAt: '2026-03-21T15:30:00+01:00', mode: 'in_person', available: true })
    ],
    appointments: [],
    preferences: {
      channels: { push: true, email: false, sms: false, whatsapp: true },
      frequency: 'daily_digest',
      doNotDisturbStart: '21:00',
      doNotDisturbEnd: '07:00',
      whatsapp: {
        optIn: true,
        invoiceReminders: false,
        emergencyAlerts: true,
        absenceNotifications: true,
        busTrackingLink: false,
        updatedAt: '2026-03-09T18:10:00+01:00'
      }
    }
  },
  'student-adam': {
    conversations: [
      conversation({
        id: 'conv-adam-admin',
        participant: linaAdmin,
        subject: 'Atlas transition support',
        archived: false,
        lastMessagePreview: 'Please send the updated pickup contact once you sign the authorization.',
        messages: [
          message({ id: 'msg-adam-admin-1', sender: 'school', senderName: linaAdmin.fullName, body: 'Please send the updated pickup contact once you sign the authorization.', sentAt: '2026-03-16T11:20:00+01:00', seenAt: '2026-03-16T11:41:00+01:00', attachments: [] })
        ]
      }),
      conversation({
        id: 'conv-adam-director',
        participant: director,
        subject: 'Campus adjustment feedback',
        archived: true,
        lastMessagePreview: 'Thank you for sharing the transition notes from Adam’s first week.',
        messages: [
          message({ id: 'msg-adam-director-1', sender: 'school', senderName: director.fullName, body: 'Thank you for sharing the transition notes from Adam’s first week.', sentAt: '2026-03-11T13:00:00+01:00', seenAt: '2026-03-11T13:08:00+01:00', attachments: [] })
        ]
      })
    ],
    announcements: [
      announcement({
        id: 'ann-adam-personal',
        scope: 'personal',
        title: 'Atlas orientation pack updated',
        body: 'Your personal orientation pack now includes the revised support timetable.',
        createdAt: '2026-03-16T14:05:00+01:00',
        pinned: true,
        read: false,
        acknowledgedAt: null,
        targetLabel: 'Adam Bennani',
        attachments: [textAttachment('ann-adam-personal-a1', 'pdf', 'Orientation pack', 'Atlas orientation pack')]
      })
    ],
    appointmentSlots: [
      slot({ id: 'slot-adam-director-1', participantId: director.id, startsAt: '2026-03-25T11:00:00+01:00', endsAt: '2026-03-25T11:20:00+01:00', mode: 'virtual', available: true })
    ],
    appointments: [
      appointment({
        id: 'appt-adam-transition',
        participantId: director.id,
        participantLabel: `${director.fullName} · ${director.title}`,
        purpose: 'Review first month transition plan',
        status: 'requested',
        startsAt: '2026-03-25T11:00:00+01:00',
        endsAt: '2026-03-25T11:20:00+01:00',
        mode: 'virtual',
        meetingLink: 'https://meet.google.com/schoolos-adam-transition',
        reminders: [
          reminder({ id: 'appt-adam-r1', trigger: '1_day', scheduledFor: '2026-03-24T11:00:00+01:00', status: 'scheduled' }),
          reminder({ id: 'appt-adam-r2', trigger: '1_hour', scheduledFor: '2026-03-25T10:00:00+01:00', status: 'scheduled' })
        ],
        summary: null,
        actionItems: [],
        createdAt: '2026-03-16T16:10:00+01:00',
        updatedAt: '2026-03-16T16:10:00+01:00'
      })
    ],
    preferences: {
      channels: { push: true, email: true, sms: true, whatsapp: false },
      frequency: 'instant',
      doNotDisturbStart: null,
      doNotDisturbEnd: null,
      whatsapp: {
        optIn: false,
        invoiceReminders: false,
        emergencyAlerts: false,
        absenceNotifications: false,
        busTrackingLink: false,
        updatedAt: '2026-03-14T12:00:00+01:00'
      }
    }
  },
  'student-salma': {
    conversations: [
      conversation({
        id: 'conv-salma-debate',
        participant: salmaTeacher,
        subject: 'Debate finals prep',
        archived: false,
        lastMessagePreview: 'I uploaded the speaking rubric and tomorrow’s rehearsal schedule.',
        messages: [
          message({ id: 'msg-salma-debate-1', sender: 'school', senderName: salmaTeacher.fullName, body: 'I uploaded the speaking rubric and tomorrow’s rehearsal schedule.', sentAt: '2026-03-16T17:25:00+01:00', seenAt: '2026-03-16T18:02:00+01:00', attachments: [textAttachment('msg-salma-debate-a1', 'file', 'Speaking rubric', 'Debate finals rubric'), textAttachment('msg-salma-debate-a2', 'pdf', 'Rehearsal schedule', 'Tomorrow rehearsal plan')] })
        ]
      }),
      conversation({
        id: 'conv-salma-director',
        participant: director,
        subject: 'Leadership seminar invitation',
        archived: false,
        lastMessagePreview: 'We would be pleased to meet next week about the seminar invitation.',
        messages: [
          message({ id: 'msg-salma-director-1', sender: 'school', senderName: director.fullName, body: 'We would be pleased to meet next week about the seminar invitation.', sentAt: '2026-03-15T10:12:00+01:00', seenAt: null, attachments: [] })
        ]
      })
    ],
    announcements: [
      announcement({
        id: 'ann-salma-emergency',
        scope: 'emergency',
        title: 'Emergency alert: city center traffic disruption',
        body: 'Debate rehearsal departure is delayed by 20 minutes. Families will receive updated transport timing shortly.',
        createdAt: '2026-03-17T14:10:00+01:00',
        pinned: true,
        read: false,
        acknowledgedAt: null,
        targetLabel: 'Debate team',
        attachments: []
      }),
      announcement({
        id: 'ann-salma-class',
        scope: 'class',
        title: 'Debate finals attire guidance',
        body: 'Formal navy and white dress code applies for the district finals.',
        createdAt: '2026-03-16T13:05:00+01:00',
        pinned: false,
        read: true,
        acknowledgedAt: '2026-03-16T13:44:00+01:00',
        targetLabel: 'Debate club',
        attachments: [textAttachment('ann-salma-class-a1', 'image', 'Dress code board', 'Debate attire preview')]
      })
    ],
    appointmentSlots: [
      slot({ id: 'slot-salma-debate-1', participantId: salmaTeacher.id, startsAt: '2026-03-22T17:00:00+01:00', endsAt: '2026-03-22T17:20:00+01:00', mode: 'virtual', available: true }),
      slot({ id: 'slot-salma-director-1', participantId: director.id, startsAt: '2026-03-27T11:10:00+01:00', endsAt: '2026-03-27T11:30:00+01:00', mode: 'in_person', available: true })
    ],
    appointments: [
      appointment({
        id: 'appt-salma-debate',
        participantId: salmaTeacher.id,
        participantLabel: `${salmaTeacher.fullName} · ${salmaTeacher.title}`,
        purpose: 'Post-finals debrief',
        status: 'completed',
        startsAt: '2026-03-12T17:00:00+01:00',
        endsAt: '2026-03-12T17:20:00+01:00',
        mode: 'virtual',
        meetingLink: 'https://meet.google.com/schoolos-salma-debrief',
        reminders: [
          reminder({ id: 'appt-salma-r1', trigger: '1_day', scheduledFor: '2026-03-11T17:00:00+01:00', status: 'sent' }),
          reminder({ id: 'appt-salma-r2', trigger: '1_hour', scheduledFor: '2026-03-12T16:00:00+01:00', status: 'sent' })
        ],
        summary: 'Coach highlighted strong rebuttal structure and pacing improvements.',
        actionItems: ['Student to rehearse closing statement timing', 'Parent to confirm finals attendance'],
        createdAt: '2026-03-09T18:00:00+01:00',
        updatedAt: '2026-03-12T17:30:00+01:00'
      })
    ],
    preferences: {
      channels: { push: true, email: true, sms: false, whatsapp: true },
      frequency: 'weekly',
      doNotDisturbStart: '22:00',
      doNotDisturbEnd: '07:30',
      whatsapp: {
        optIn: true,
        invoiceReminders: true,
        emergencyAlerts: true,
        absenceNotifications: false,
        busTrackingLink: false,
        updatedAt: '2026-03-08T20:15:00+01:00'
      }
    }
  }
}
