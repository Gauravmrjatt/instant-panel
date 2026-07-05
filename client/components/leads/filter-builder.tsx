'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Plus, Filter as FilterIcon, XCircle, SlidersHorizontal } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { Filter, FilterField, FilterOperator } from './filter-types'
import { FILTERABLE_FIELDS, OPERATOR_LABELS, getFieldConfig } from './filter-types'

function FilterChip({ f, onRemove }: { f: Filter; onRemove: () => void }) {
  const config = getFieldConfig(f.field)
  const label = config?.label || f.field
  const opLabel = OPERATOR_LABELS[f.op] || f.op
  const valLabel = Array.isArray(f.value) ? f.value.join(', ') : f.value
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/10 text-xs font-medium">
      <span className="text-primary">{label}</span>
      <span className="text-muted-foreground">{opLabel}</span>
      <span className="font-mono">{valLabel}</span>
      <button onClick={onRemove} className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

export function FilterChips({ filters, onRemove }: { filters: Filter[]; onRemove: (index: number) => void }) {
  if (filters.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {filters.map((f, i) => (
        <FilterChip key={i} f={f} onRemove={() => onRemove(i)} />
      ))}
    </div>
  )
}

interface FilterBuilderProps {
  filters: Filter[]
  onChange: (filters: Filter[]) => void
}

export function FilterBuilder({ filters, onChange }: FilterBuilderProps) {
  const [open, setOpen] = useState(false)
  const [newField, setNewField] = useState<FilterField | ''>('')
  const [newOp, setNewOp] = useState<FilterOperator | ''>('')
  const [newValue, setNewValue] = useState<string>('')

  const fieldConfig = newField ? getFieldConfig(newField) : undefined
  const hasActiveFilters = filters.length > 0
  const canAdd = newField && newOp && newValue

  const handleAdd = () => {
    if (!newField || !newOp || !newValue) return
    onChange([...filters, { field: newField, op: newOp, value: newValue }])
    setNewField('')
    setNewOp('')
    setNewValue('')
  }

  const handleRemove = (index: number) => {
    onChange(filters.filter((_, i) => i !== index))
  }

  const handleClear = () => {
    onChange([])
    setOpen(false)
  }

  const handleFieldChange = (field: string) => {
    const f = field as FilterField
    setNewField(f)
    const config = getFieldConfig(f)
    if (config) setNewOp(config.operators[0])
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <FilterIcon className={`h-4 w-4 ${hasActiveFilters ? 'text-primary' : ''}`} />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-xs">
                  {filters.length}
                </Badge>
              )}
            </Button>
          }
        />
        <SheetContent side="right" className="p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {filters.length}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1.5">
                {filters.map((f, i) => (
                  <FilterChip key={i} f={f} onRemove={() => handleRemove(i)} />
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Field</label>
                <Select value={newField} onValueChange={(v) => v && handleFieldChange(v)}>
                  <SelectTrigger className="h-10 w-full text-sm">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTERABLE_FIELDS.map((f) => (
                      <SelectItem key={f.field} value={f.field} className="text-sm">
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {fieldConfig && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Operator</label>
                  <Select
                    value={newOp}
                    onValueChange={(v) => v && setNewOp(v as FilterOperator)}
                  >
                    <SelectTrigger className="h-10 w-full text-sm">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldConfig.operators.map((op) => (
                        <SelectItem key={op} value={op} className="text-sm">
                          {OPERATOR_LABELS[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {fieldConfig && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Value</label>
                  {fieldConfig.type === 'select' && fieldConfig.options ? (
                    <Select value={newValue} onValueChange={(v) => v && setNewValue(v)}>
                      <SelectTrigger className="h-10 w-full text-sm">
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldConfig.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : fieldConfig.type === 'number' ? (
                    <Input
                      type="number"
                      className="h-10 w-full text-sm"
                      placeholder="Enter value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                  ) : fieldConfig.type === 'date' ? (
                    <Input
                      type="date"
                      className="h-10 w-full text-sm"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                  ) : (
                    <Input
                      className="h-10 w-full text-sm"
                      placeholder="Enter value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                  )}
                </div>
              )}

              {fieldConfig && (
                <Button className="w-full gap-1.5" disabled={!canAdd} onClick={handleAdd}>
                  <Plus className="h-4 w-4" />
                  Add Filter
                </Button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="border-t px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{filters.length} filter(s) active</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive gap-1"
                onClick={() => { handleClear(); setOpen(false) }}
              >
                <XCircle className="h-4 w-4" />
                Clear all
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
