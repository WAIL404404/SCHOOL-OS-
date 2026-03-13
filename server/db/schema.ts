import { pgTable, text, timestamp, uuid, integer, jsonb } from 'drizzle-orm/pg-core'

export const schools = pgTable('schools', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  campus: text('campus').notNull(),
  supportEmail: text('support_email').notNull(),
  accent: text('accent').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const parentUsers = pgTable('parent_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').notNull(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  preferredLanguage: text('preferred_language').default('en').notNull(),
  childCount: integer('child_count').default(0).notNull(),
  linkedSchoolIds: jsonb('linked_school_ids').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').notNull(),
  parentId: uuid('parent_id').notNull(),
  fullName: text('full_name').notNull(),
  gradeLabel: text('grade_label').notNull(),
  classLabel: text('class_label').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const complaints = pgTable('complaints', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').notNull(),
  parentId: uuid('parent_id').notNull(),
  studentId: uuid('student_id'),
  title: text('title').notNull(),
  status: text('status').notNull(),
  summary: text('summary').notNull(),
  openedAt: timestamp('opened_at', { withTimezone: true }).defaultNow().notNull()
})
