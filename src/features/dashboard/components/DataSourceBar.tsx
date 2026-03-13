import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  Database,
  ExternalLink,
  LoaderCircle,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import {
  useDashboardDataSourceStore,
  type JqlModeEntryBehavior,
} from '@/features/dashboard/stores/dashboard-data-source.store'
import type { JqlFormFields } from '@/features/dashboard/utils/jql'
import {
  toRecordSprintOptions,
  toSeriesSprintOptions,
  type SprintOption,
} from '@/features/dashboard/utils/sprint'
import { dashboardService } from '@/services/dashboard.service'

const inputClassName =
  'border-border bg-background text-text-primary placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-primary/25 h-9 w-full rounded-[4px] border px-3 text-sm outline-none transition'

const textareaClassName =
  'border-border bg-background text-text-primary placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-primary/25 min-h-[96px] w-full rounded-[4px] border px-3 py-2 text-sm leading-6 outline-none transition'

export const DataSourceBar = () => {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const {
    data: dashboardData,
    isFetching,
    isJqlDraftMode,
    isUsingJqlResults,
  } = useDashboardQuery()
  const {
    milestones,
    projects,
    selectedMilestoneId,
    selectedProjectId,
    selectedSprint,
    sprints,
    setSelectedMilestoneId,
    setSelectedProjectId,
    setSelectedSprint,
  } = useDashboardFilters()
  const {
    activateJqlMode,
    appliedJql,
    draftJql,
    jqlModeEntryBehavior,
    jqlFields,
    resetToRecordMode,
    seedFromMilestoneJql,
    sourceMode,
    updateJqlField,
    setDraftJql,
    setJqlModeEntryBehavior,
    applyCustomJql,
  } = useDashboardDataSourceStore()

  const isJqlMode = sourceMode === 'jql'
  const isExecutingJql = isJqlMode && Boolean(appliedJql) && isFetching

  const milestoneJqlQuery = useQuery({
    queryKey: ['milestone-jql', selectedMilestoneId],
    enabled: isJqlMode && selectedMilestoneId !== null,
    queryFn: () =>
      dashboardService.getMilestoneJql(selectedMilestoneId as number),
  })

  useEffect(() => {
    if (
      !isJqlMode ||
      selectedMilestoneId === null ||
      !milestoneJqlQuery.data?.jql
    ) {
      return
    }

    seedFromMilestoneJql(selectedMilestoneId, milestoneJqlQuery.data.jql)
  }, [
    isJqlMode,
    milestoneJqlQuery.data?.jql,
    seedFromMilestoneJql,
    selectedMilestoneId,
  ])

  const sprintOptions = useMemo<SprintOption[]>(
    () =>
      isJqlMode
        ? isUsingJqlResults
          ? toSeriesSprintOptions(dashboardData?.burnup ?? [])
          : []
        : toRecordSprintOptions(sprints),
    [dashboardData?.burnup, isJqlMode, isUsingJqlResults, sprints],
  )

  const sprintValue = sprintOptions.some(
    (item) => item.value === String(selectedSprint),
  )
    ? String(selectedSprint)
    : (sprintOptions[sprintOptions.length - 1]?.value ?? '')

  useEffect(() => {
    if (!isJqlMode) {
      return
    }

    const fallbackSprint =
      sprintOptions.length > 0
        ? Number(sprintOptions[sprintOptions.length - 1]?.value)
        : null

    const hasSelectedSprint = sprintOptions.some(
      (item) => item.value === String(selectedSprint),
    )

    if (!hasSelectedSprint && fallbackSprint !== selectedSprint) {
      setSelectedSprint(fallbackSprint)
    }

    if (sprintOptions.length === 0 && selectedSprint !== null) {
      setSelectedSprint(null)
    }
  }, [isJqlMode, selectedSprint, setSelectedSprint, sprintOptions])

  const summary = getSummaryCopy({
    appliedJql,
    isExecutingJql,
    isJqlDraftMode,
    isJqlMode,
    isMilestoneJqlLoading: milestoneJqlQuery.isLoading,
  })

  return (
    <section className="relative">
      <div className="border-border/80 bg-surface-elevated/96 border-b shadow-[0_8px_22px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`status-chip ${isJqlMode ? 'status-chip-warning' : 'status-chip-info'}`}
              >
                {summary.label}
              </span>
              <p className="text-text-muted truncate text-[11px]">
                {summary.description}
              </p>
            </div>

            <button
              className="text-text-muted hover:text-text-primary inline-flex items-center gap-2 text-[10px] tracking-[0.08em] uppercase transition-colors"
              onClick={() => setExpanded((current) => !current)}
              type="button"
            >
              <span>{expanded ? 'Hide controls' : 'Edit controls'}</span>
              <ChevronDown
                className={expanded ? 'rotate-180' : ''}
                size={12}
                strokeWidth={1.6}
              />
            </button>
          </div>
        </div>

        <div
          className={`absolute top-full right-0 left-0 z-30 transition-all duration-200 ${
            expanded
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-2 opacity-0'
          }`}
        >
          <div className="border-border/80 bg-surface-elevated/96 border-b px-6 pt-3 pb-4 shadow-[0_16px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <ModeButton
                active={!isJqlMode}
                icon={<Database size={14} strokeWidth={1.6} />}
                label="Record"
                onClick={resetToRecordMode}
              />
              <ModeButton
                active={isJqlMode}
                icon={<Sparkles size={14} strokeWidth={1.6} />}
                label="JQL"
                onClick={activateJqlMode}
              />
            </div>

            {isJqlMode ? (
              <JqlControls
                advancedOpen={advancedOpen}
                appliedJql={appliedJql}
                draftJql={draftJql}
                isApplyDisabled={draftJql.trim().length === 0 || isExecutingJql}
                isExecutingJql={isExecutingJql}
                isJqlDraftMode={isJqlDraftMode}
                jqlModeEntryBehavior={jqlModeEntryBehavior}
                jqlFields={jqlFields}
                onApply={applyCustomJql}
                onDraftChange={setDraftJql}
                onFieldChange={updateJqlField}
                onModeEntryBehaviorChange={setJqlModeEntryBehavior}
                onSprintChange={setSelectedSprint}
                onToggleAdvanced={() => setAdvancedOpen((current) => !current)}
                sprintOptions={sprintOptions}
                sprintValue={sprintValue}
              />
            ) : (
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <FilterSelect
                  onChange={(value) => setSelectedProjectId(Number(value))}
                  options={projects.map((project) => ({
                    label: project.name,
                    value: String(project.id),
                  }))}
                  placeholder="Select project"
                  value={
                    selectedProjectId !== null ? String(selectedProjectId) : ''
                  }
                />
                <FilterSelect
                  onChange={(value) => setSelectedMilestoneId(Number(value))}
                  options={milestones.map((milestone) => ({
                    label: milestone.name,
                    value: String(milestone.id),
                  }))}
                  placeholder="Select milestone"
                  value={
                    selectedMilestoneId !== null
                      ? String(selectedMilestoneId)
                      : ''
                  }
                />
                <FilterSelect
                  disabled={sprintOptions.length === 0}
                  onChange={(value) => setSelectedSprint(Number(value))}
                  options={sprintOptions}
                  placeholder={
                    sprintOptions.length === 0 ? 'No sprints' : 'Select sprint'
                  }
                  value={sprintValue}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const JqlControls = ({
  advancedOpen,
  appliedJql,
  draftJql,
  isApplyDisabled,
  isExecutingJql,
  isJqlDraftMode,
  jqlModeEntryBehavior,
  jqlFields,
  onApply,
  onDraftChange,
  onFieldChange,
  onModeEntryBehaviorChange,
  onSprintChange,
  onToggleAdvanced,
  sprintOptions,
  sprintValue,
}: {
  advancedOpen: boolean
  appliedJql: string | null
  draftJql: string
  isApplyDisabled: boolean
  isExecutingJql: boolean
  isJqlDraftMode: boolean
  jqlModeEntryBehavior: JqlModeEntryBehavior
  jqlFields: JqlFormFields
  onApply: () => void
  onDraftChange: (value: string) => void
  onFieldChange: (
    field: 'projectKey' | 'labels' | 'assignees' | 'startDate' | 'endDate',
    value: string,
  ) => void
  onModeEntryBehaviorChange: (behavior: JqlModeEntryBehavior) => void
  onSprintChange: (value: number | null) => void
  onToggleAdvanced: () => void
  sprintOptions: SprintOption[]
  sprintValue: string
}) => (
  <div className="space-y-3">
    <div className="border-border bg-surface-elevated flex flex-wrap items-center justify-between gap-3 rounded-[4px] border px-3 py-2.5">
      <div>
        <p className="text-text-primary text-xs">When switching to JQL</p>
        <p className="text-text-muted mt-0.5 text-[11px]">
          Choose whether JQL should follow the current record milestone or keep
          your current JQL state.
        </p>
      </div>
      <div className="border-border bg-background inline-flex rounded-[4px] border p-1">
        <EntryBehaviorButton
          active={jqlModeEntryBehavior === 'sync-record'}
          label="Sync with record"
          onClick={() => onModeEntryBehaviorChange('sync-record')}
        />
        <EntryBehaviorButton
          active={jqlModeEntryBehavior === 'keep-current'}
          label="Keep current"
          onClick={() => onModeEntryBehaviorChange('keep-current')}
        />
      </div>
    </div>

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_160px_160px_auto]">
      <FieldBlock label="Project key">
        <input
          className={inputClassName}
          onChange={(event) => onFieldChange('projectKey', event.target.value)}
          placeholder="TVPLAT"
          type="text"
          value={jqlFields.projectKey}
        />
      </FieldBlock>
      <FieldBlock label="Labels">
        <input
          className={inputClassName}
          onChange={(event) => onFieldChange('labels', event.target.value)}
          placeholder="fpt.flutter.factorywin"
          type="text"
          value={jqlFields.labels}
        />
      </FieldBlock>
      <FieldBlock label="Assignees">
        <input
          className={inputClassName}
          onChange={(event) => onFieldChange('assignees', event.target.value)}
          placeholder="manh.tranduc, hai.lehuu"
          type="text"
          value={jqlFields.assignees}
        />
      </FieldBlock>
      <FieldBlock label="Start date">
        <input
          className={inputClassName}
          onChange={(event) => onFieldChange('startDate', event.target.value)}
          type="date"
          value={jqlFields.startDate}
        />
      </FieldBlock>
      <FieldBlock label="End date">
        <input
          className={inputClassName}
          onChange={(event) => onFieldChange('endDate', event.target.value)}
          type="date"
          value={jqlFields.endDate}
        />
      </FieldBlock>
      <div className="flex items-end gap-2">
        <Button
          className="flex-1"
          disabled={isApplyDisabled}
          onClick={() => onApply()}
          size="sm"
          type="button"
        >
          {isExecutingJql ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ExternalLink />
          )}
          {isExecutingJql ? 'Running JQL...' : 'Run JQL'}
        </Button>
      </div>
    </div>

    <div className="border-border bg-surface-elevated flex flex-wrap items-center justify-between gap-3 rounded-[4px] border px-3 py-2.5">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-text-primary text-xs">Results</p>
          <span
            className={`status-chip ${
              isExecutingJql
                ? 'status-chip-warning'
                : isJqlDraftMode
                  ? 'status-chip-neutral'
                  : appliedJql
                    ? 'status-chip-success'
                    : 'status-chip-neutral'
            }`}
          >
            {isExecutingJql
              ? 'Running'
              : isJqlDraftMode
                ? 'Draft only'
                : appliedJql
                  ? 'Loaded'
                  : 'Pending'}
          </span>
        </div>
        <p className="text-text-muted mt-0.5 text-[11px]">
          {isExecutingJql
            ? 'JQL execution may take a while. Existing results stay visible until the new response arrives.'
            : isJqlDraftMode
              ? 'Run the current JQL to load result sprints and drive the cards and charts.'
              : 'Select which returned sprint drives the cards and charts.'}
        </p>
      </div>
      <div className="max-w-full min-w-[220px] flex-1 sm:flex-none">
        <FilterSelect
          disabled={sprintOptions.length === 0}
          onChange={(value) => onSprintChange(Number(value))}
          options={sprintOptions}
          placeholder={
            sprintOptions.length === 0
              ? 'No result sprints'
              : 'Select result sprint'
          }
          value={sprintValue}
        />
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 text-[11px] transition-colors"
        onClick={onToggleAdvanced}
        type="button"
      >
        <ChevronDown
          className={advancedOpen ? 'rotate-180' : ''}
          size={12}
          strokeWidth={1.6}
        />
        {advancedOpen ? 'Hide raw JQL' : 'Show raw JQL'}
      </button>
    </div>

    {advancedOpen ? (
      <textarea
        className={textareaClassName}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="project = TVPLAT AND labels in (fpt.flutter.factorywin) AND assignee in (manh.tranduc, hai.lehuu) AND startdate >= 2026-01-19 AND enddate <= 2026-01-30"
        value={draftJql}
      />
    ) : null}
  </div>
)

const getSummaryCopy = ({
  appliedJql,
  isExecutingJql,
  isJqlDraftMode,
  isJqlMode,
  isMilestoneJqlLoading,
}: {
  appliedJql: string | null
  isExecutingJql: boolean
  isJqlDraftMode: boolean
  isJqlMode: boolean
  isMilestoneJqlLoading: boolean
}) => {
  if (!isJqlMode) {
    return {
      label: 'Record active',
      description:
        'Project, milestone, and sprint records drive the dashboard.',
    }
  }

  if (isMilestoneJqlLoading) {
    return {
      label: 'JQL loading',
      description: 'Preparing the milestone JQL fields for editing.',
    }
  }

  if (isExecutingJql) {
    return {
      label: 'JQL running',
      description:
        'Query execution can take a bit. Current dashboard results remain visible while loading.',
    }
  }

  if (isJqlDraftMode) {
    return {
      label: 'JQL draft',
      description:
        'Draft query is ready, but the dashboard will not switch to JQL results until you run it.',
    }
  }

  return {
    label: appliedJql ? 'JQL active' : 'JQL draft',
    description: appliedJql
      ? 'Live Jira query drives all dashboard pages.'
      : 'Build a Jira query, then run it.',
  }
}

const ModeButton = ({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  label: string
  onClick: () => void
}) => (
  <button
    className={`inline-flex items-center gap-2 rounded-[4px] border px-3 py-1.5 text-xs transition-colors ${
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-background text-text-secondary hover:border-primary hover:text-text-primary'
    }`}
    onClick={onClick}
    type="button"
  >
    {icon}
    {label}
  </button>
)

const EntryBehaviorButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) => (
  <button
    className={`rounded-[3px] px-3 py-1.5 text-[11px] transition-colors ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
    }`}
    onClick={onClick}
    type="button"
  >
    {label}
  </button>
)

const FieldBlock = ({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) => (
  <label className="block min-w-0">
    <span className="text-text-muted mb-1.5 block text-[10px] tracking-[0.08em] uppercase">
      {label}
    </span>
    {children}
  </label>
)

type FilterSelectProps = {
  disabled?: boolean
  onChange: (value: string) => void
  options: SprintOption[]
  placeholder: string
  value: string
}

const FilterSelect = ({
  disabled = false,
  onChange,
  options,
  placeholder,
  value,
}: FilterSelectProps) => (
  <div className="min-w-0">
    <SelectRoot disabled={disabled} onValueChange={onChange} value={value}>
      <SelectTrigger className="bg-background h-9 w-full min-w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  </div>
)
