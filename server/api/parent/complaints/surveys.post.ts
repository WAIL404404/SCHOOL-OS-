import { createError, readBody } from 'h3'
import type { ComplaintCategory } from '~/shared/app/types'
import { findComplaintChildById, submitSatisfactionSurvey } from '~/server/utils/parent-complaints'

interface SurveyBody {
  childId?: string
  anonymous?: boolean
  npsScore?: number
  categoryRatings?: Array<{
    category?: ComplaintCategory
    label?: string
    score?: number
  }>
  suggestion?: string
}

const validCategories: ComplaintCategory[] = ['academic', 'behavior', 'facilities', 'transport', 'cantine_food', 'safety_security', 'staff_behavior', 'other']

export default defineEventHandler(async (event) => {
  const body = await readBody<SurveyBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  if (!childId || !findComplaintChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const rawNpsScore = Number(body.npsScore)
  if (!Number.isFinite(rawNpsScore) || rawNpsScore < 0 || rawNpsScore > 10) {
    throw createError({ statusCode: 400, statusMessage: 'NPS score must be between 0 and 10' })
  }

  const categoryRatings = Array.isArray(body.categoryRatings)
    ? body.categoryRatings
      .filter((item) => item && validCategories.includes(item.category as ComplaintCategory) && Number.isFinite(Number(item.score)))
      .map((item) => ({
        category: item.category as ComplaintCategory,
        label: typeof item.label === 'string' && item.label.trim().length > 0 ? item.label.trim() : item.category as string,
        score: Math.max(1, Math.min(5, Math.round(Number(item.score)))) as 1 | 2 | 3 | 4 | 5
      }))
    : []

  if (!categoryRatings.length) {
    throw createError({ statusCode: 400, statusMessage: 'At least one category rating is required' })
  }

  try {
    return submitSatisfactionSurvey({
      childId,
      anonymous: Boolean(body.anonymous),
      npsScore: Math.round(rawNpsScore),
      categoryRatings,
      suggestion: typeof body.suggestion === 'string' ? body.suggestion : ''
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Survey submission failed' })
  }
})
