export type FilterField =
  | 'status'
  | 'event'
  | 'user'
  | 'refer'
  | 'userAmount'
  | 'referAmount'
  | 'ip'
  | 'paymentStatus'
  | 'message'
  | 'clicktoconv'
  | 'createdAt'

export type FilterOperator =
  | 'is'
  | 'isNot'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'before'
  | 'after'
  | 'in'
  | 'notIn'

export interface Filter {
  field: FilterField
  op: FilterOperator
  value: string | string[]
}

export interface FilterOption {
  field: FilterField
  label: string
  type: 'text' | 'number' | 'date' | 'select'
  operators: FilterOperator[]
  options?: { label: string; value: string }[]
}

export const FILTERABLE_FIELDS: FilterOption[] = [
  { field: 'status', label: 'Status', type: 'select', operators: ['is', 'isNot', 'in'], options: [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'REJECTED', value: 'REJECTED' },
    { label: 'PENDING', value: 'PENDING' },
  ]},
  { field: 'event', label: 'Event', type: 'text', operators: ['is', 'isNot', 'contains', 'startsWith'] },
  { field: 'user', label: 'User', type: 'text', operators: ['is', 'isNot', 'contains', 'startsWith'] },
  { field: 'refer', label: 'Refer', type: 'text', operators: ['is', 'isNot', 'contains', 'startsWith'] },
  { field: 'userAmount', label: 'User Amt', type: 'number', operators: ['is', 'gt', 'gte', 'lt', 'lte'] },
  { field: 'referAmount', label: 'Refer Amt', type: 'number', operators: ['is', 'gt', 'gte', 'lt', 'lte'] },
  { field: 'ip', label: 'IP', type: 'text', operators: ['is', 'isNot', 'contains'] },
  { field: 'paymentStatus', label: 'Payment', type: 'select', operators: ['is', 'isNot', 'in'], options: [
    { label: 'PENDING', value: 'PENDING' },
    { label: 'Approved', value: 'Approved' },
    { label: 'REJECTED', value: 'REJECTED' },
    { label: 'FAILURE', value: 'FAILURE' },
  ]},
  { field: 'message', label: 'Message', type: 'text', operators: ['is', 'isNot', 'contains'] },
  { field: 'clicktoconv', label: 'Clicktoconv', type: 'text', operators: ['is', 'isNot', 'contains'] },
  { field: 'createdAt', label: 'Created At', type: 'date', operators: ['is', 'before', 'after'] },
]

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  is: 'is',
  isNot: 'is not',
  contains: 'contains',
  notContains: 'not contains',
  startsWith: 'starts with',
  endsWith: 'ends with',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  before: 'before',
  after: 'after',
  in: 'in',
  notIn: 'not in',
}

export function getFieldConfig(field: FilterField): FilterOption | undefined {
  return FILTERABLE_FIELDS.find(f => f.field === field)
}

export function serializeFilters(filters: Filter[]): string {
  return JSON.stringify(filters)
}

export function deserializeFilters(raw: string): Filter[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (f: any) =>
        f && typeof f.field === 'string' && typeof f.op === 'string' && f.value !== undefined
    )
  } catch {
    return []
  }
}
