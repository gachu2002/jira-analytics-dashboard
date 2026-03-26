import { zodResolver } from '@hookform/resolvers/zod'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Bug,
  ChevronDown,
  Ellipsis,
  FolderPlus,
  PanelRightClose,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePackageBugStatisticsQuery } from '@/features/bug-timeline/api/bug-timeline.queries'
import { useBugTimelineQuery } from '@/features/bug-timeline/hooks/use-bug-timeline-query'
import { useBugTimelineMutations } from '@/features/bug-timeline/hooks/use-bug-timeline-mutations'
import {
  packageFormSchema,
  projectFormSchema,
  type PackageFormValues,
  type ProjectFormValues,
} from '@/features/bug-timeline/schemas/bug-timeline.schema'
import { useBugTimelineUiStore } from '@/features/bug-timeline/stores/bug-timeline-ui.store'
import type {
  BugTimelineDeleteTarget,
  BugTimelineInspectorMode,
  BugTimelineSelectedEntity,
  BugTimelineViewModel,
  BugTrackerPackage,
  BugTrackerProject,
  PackageBugStatistic,
  TimelinePackageBar,
  TimelineProjectGroup,
} from '@/features/bug-timeline/types/bug-timeline.types'
import { cn } from '@/lib/utils'

const labelColumnWidth = '20rem'
const weekColumnWidthRem = 7.5
const BUG_CATEGORY_COLORS = [
  '#0c66e4',
  '#22a06b',
  '#f5a524',
  '#e56910',
  '#c9372c',
  '#8f7ee7',
  '#4b8bff',
  '#579dff',
  '#6b778c',
  '#36b37e',
  '#ff8b00',
  '#ff5630',
  '#6554c0',
  '#00a3bf',
  '#8777d9',
]

type MonthGroup = {
  key: string
  label: string
  start: number
  span: number
}

type WeekColumn = {
  key: string
  label: string
  shortLabel: string
  start: Date
  end: Date
}

type VisibleTimelineViewModel = {
  rangeStart: Date
  rangeEnd: Date
  monthGroups: MonthGroup[]
  weekColumns: WeekColumn[]
  projects: TimelineProjectGroup[]
}

export function BugTimelineScreen() {
  const { projects, packages, viewModel, isPending, isError } =
    useBugTimelineQuery()
  const search = useBugTimelineUiStore((state) => state.search)
  const setSearch = useBugTimelineUiStore((state) => state.setSearch)
  const collapsedProjectIds = useBugTimelineUiStore(
    (state) => state.collapsedProjectIds,
  )
  const toggleProject = useBugTimelineUiStore((state) => state.toggleProject)
  const selectedEntity = useBugTimelineUiStore((state) => state.selectedEntity)
  const inspectorMode = useBugTimelineUiStore((state) => state.inspectorMode)
  const deleteTarget = useBugTimelineUiStore((state) => state.deleteTarget)
  const setSelectedEntity = useBugTimelineUiStore(
    (state) => state.setSelectedEntity,
  )
  const setInspectorMode = useBugTimelineUiStore(
    (state) => state.setInspectorMode,
  )
  const openCreateProject = useBugTimelineUiStore(
    (state) => state.openCreateProject,
  )
  const openEditProject = useBugTimelineUiStore(
    (state) => state.openEditProject,
  )
  const openCreatePackage = useBugTimelineUiStore(
    (state) => state.openCreatePackage,
  )
  const openEditPackage = useBugTimelineUiStore(
    (state) => state.openEditPackage,
  )
  const setDeleteTarget = useBugTimelineUiStore(
    (state) => state.setDeleteTarget,
  )
  const {
    createProject,
    updateProject,
    removeProject,
    createPackage,
    updatePackage,
    removePackage,
  } = useBugTimelineMutations()

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null)

  const effectiveFromDate = fromDate || toInputDate(viewModel.rangeStart)
  const effectiveToDate = toDate || toInputDate(addDays(viewModel.rangeEnd, -1))

  const filteredViewModel = useMemo(
    () =>
      buildVisibleTimelineViewModel(
        viewModel,
        effectiveFromDate,
        effectiveToDate,
      ),
    [effectiveFromDate, effectiveToDate, viewModel],
  )

  const timelineMinWidth = `${Math.max(filteredViewModel.weekColumns.length * weekColumnWidthRem, 44)}rem`
  const todayOffset = getTodayOffsetPercent(filteredViewModel.weekColumns)
  const selectedProjectId =
    selectedEntity?.type === 'package'
      ? selectedEntity.projectId
      : (selectedEntity?.projectId ?? null)
  const selectedProject = selectedProjectId
    ? (projects.find((project) => project.id === selectedProjectId) ?? null)
    : null
  const selectedPackage =
    selectedEntity?.type === 'package'
      ? (packages.find(
          (item) =>
            item.id === selectedEntity.packageId &&
            item.bug_tracker_project === selectedEntity.projectId,
        ) ?? null)
      : null
  const selectedPackageBar =
    selectedEntity?.type === 'package'
      ? (filteredViewModel.projects
          .flatMap((project) => project.packages)
          .find((item) => item.id === selectedEntity.packageId) ?? null)
      : null

  const openProjectView = (projectId: number) => {
    setSelectedEntity({ type: 'project', projectId })
    setInspectorMode('view-project')
  }

  const handleSelectPackage = (projectId: number, packageId: number) => {
    setSelectedEntity({ type: 'package', projectId, packageId })
    setInspectorMode('view-package')
  }

  const handleCreateProject = () => {
    openCreateProject()
  }

  const handleCreatePackage = (projectId?: number) => {
    openCreatePackage(projectId)
  }

  const handleCloseDrawer = () => {
    setSelectedEntity(null)
    setInspectorMode('view-package')
    setOpenActionMenu(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === 'project') {
        await removeProject.mutateAsync(deleteTarget.projectId)
        if (
          selectedEntity?.type === 'project' &&
          selectedEntity.projectId === deleteTarget.projectId
        ) {
          setSelectedEntity(null)
        }
        if (
          selectedEntity?.type === 'package' &&
          selectedEntity.projectId === deleteTarget.projectId
        ) {
          setSelectedEntity(null)
        }
        toast.success('Project deleted')
      } else {
        await removePackage.mutateAsync({
          projectId: deleteTarget.projectId,
          packageId: deleteTarget.packageId,
        })
        if (
          selectedEntity?.type === 'package' &&
          selectedEntity.packageId === deleteTarget.packageId
        ) {
          setSelectedEntity(null)
        }
        toast.success('Package deleted')
      }

      setDeleteTarget(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <section className="ops-bug-shell ops-workspace-screen flex min-h-[calc(100vh-3rem)] min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isPending ? <BugTimelineLoadingState /> : null}
        {isError ? <BugTimelineErrorState /> : null}

        {!isPending && !isError ? (
          <>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="ops-bug-toolbar px-4 lg:px-5">
                <div className="ops-bug-toolbar-top">
                  <div className="min-w-0">
                    <p className="ops-kicker">Bug timeline</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h1 className="text-base font-semibold tracking-[-0.02em]">
                        Packages
                      </h1>
                      <div className="ops-bug-inline-meta">
                        <span>{viewModel.totals.projects} projects</span>
                        <span>{viewModel.totals.packages} packages</span>
                        <span>
                          {viewModel.totals.resolved}/{viewModel.totals.bugs}{' '}
                          resolved
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCreatePackage(selectedProjectId ?? undefined)
                      }
                    >
                      <Plus className="size-4" />
                      New package
                    </Button>
                    <Button size="sm" onClick={handleCreateProject}>
                      <Plus className="size-4" />
                      New project
                    </Button>
                  </div>
                </div>

                <div className="ops-bug-toolbar-row">
                  <div className="w-full max-w-[18rem] min-w-[12rem]">
                    <span className="ops-bug-toolbar-label">Search</span>
                    <div className="relative">
                      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        className="ops-workspace-input ops-bug-filter-input h-10 rounded-md pl-9"
                        placeholder="Package, key, label, member"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                  </div>

                  <DateField
                    label="From"
                    value={effectiveFromDate}
                    onChange={setFromDate}
                  />
                  <DateField
                    label="To"
                    value={effectiveToDate}
                    onChange={setToDate}
                  />
                </div>
              </div>

              <div className="ops-bug-surface min-h-0 min-w-0 flex-1 overflow-auto border-t border-[color:var(--border)]/80">
                <div
                  className="ops-bug-grid min-h-full"
                  style={{
                    minWidth: `calc(${labelColumnWidth} + ${timelineMinWidth})`,
                  }}
                >
                  <div
                    className="ops-gantt-header sticky top-0 z-20 grid border-b border-[color:var(--border)]"
                    style={{
                      gridTemplateColumns: `${labelColumnWidth} minmax(${timelineMinWidth}, 1fr)`,
                      gridTemplateRows: '2.25rem 3.25rem',
                    }}
                  >
                    <div className="ops-bug-sidebar-cell ops-gantt-sidebar row-span-2 border-r border-[color:var(--border)] px-4 py-2.5">
                      <p className="text-xs font-semibold tracking-[-0.02em]">
                        Project
                      </p>
                    </div>

                    <div
                      className="grid h-full overflow-hidden border-b border-[color:var(--border)]/80"
                      style={getGridStyle(filteredViewModel.weekColumns.length)}
                    >
                      {filteredViewModel.monthGroups.map((month) => (
                        <div
                          key={month.key}
                          className="ops-gantt-month-cell px-3"
                          style={{
                            gridColumn: `${month.start} / span ${month.span}`,
                          }}
                        >
                          <p className="text-[11px] font-semibold tracking-[0.04em] text-[color:var(--muted-foreground)] uppercase">
                            {month.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div
                      className="ops-gantt-grid-frame relative grid h-full overflow-hidden"
                      style={getGridStyle(filteredViewModel.weekColumns.length)}
                    >
                      {todayOffset !== null ? (
                        <TodayMarker offset={todayOffset} />
                      ) : null}
                      {filteredViewModel.weekColumns.map((column, index) => (
                        <div
                          key={column.key}
                          className="ops-gantt-week-cell ops-gantt-column px-2 py-2"
                          style={{ borderLeftWidth: index === 0 ? 0 : 1 }}
                        >
                          <p className="text-[11px] font-semibold tracking-[-0.01em]">
                            {column.label}
                          </p>
                          <p className="text-[10px] text-[color:var(--muted-foreground)]">
                            {column.shortLabel}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="min-h-[calc(100vh-7.5rem)]">
                    <div className="ops-gantt-body relative">
                      {todayOffset !== null ? (
                        <div
                          className="ops-gantt-today-layer pointer-events-none absolute inset-y-0"
                          style={{ left: labelColumnWidth, right: 0 }}
                        >
                          <TodayMarker offset={todayOffset} />
                        </div>
                      ) : null}
                      {filteredViewModel.projects.map((project) => (
                        <ProjectSection
                          key={project.id}
                          columns={filteredViewModel.weekColumns.length}
                          isCollapsed={collapsedProjectIds.includes(project.id)}
                          actionMenuId={openActionMenu}
                          onAddPackage={handleCreatePackage}
                          onCloseMenu={() => setOpenActionMenu(null)}
                          onDeletePackage={(target) => setDeleteTarget(target)}
                          onDeleteProject={(target) => setDeleteTarget(target)}
                          onEditPackage={openEditPackage}
                          onEditProject={openEditProject}
                          onViewProject={openProjectView}
                          onSelectPackage={handleSelectPackage}
                          onOpenMenu={setOpenActionMenu}
                          onToggle={() => toggleProject(project.id)}
                          project={project}
                          selectedEntity={selectedEntity}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CrudDrawer
              inspectorMode={inspectorMode}
              isOpen={
                (inspectorMode === 'view-project' &&
                  Boolean(selectedProject)) ||
                (inspectorMode === 'edit-project' &&
                  Boolean(selectedProject)) ||
                (inspectorMode === 'view-package' &&
                  Boolean(selectedPackage && selectedPackageBar)) ||
                (inspectorMode === 'edit-package' &&
                  Boolean(selectedPackage)) ||
                inspectorMode === 'create-project' ||
                inspectorMode === 'create-package' ||
                false
              }
              packageMutationState={{
                create: createPackage,
                update: updatePackage,
              }}
              packageOptions={projects}
              project={selectedProject}
              selectedPackageBar={selectedPackageBar}
              projectMutationState={{
                create: createProject,
                update: updateProject,
              }}
              selectedEntity={selectedEntity}
              selectedPackage={selectedPackage}
              onClose={handleCloseDrawer}
              onSubmitCreatePackage={async (values: PackageFormValues) => {
                try {
                  const created = await createPackage.mutateAsync({
                    payload: toPackagePayload(values),
                  })
                  handleSelectPackage(created.bug_tracker_project, created.id)
                  toast.success('Package created')
                } catch {
                  toast.error('Create failed')
                }
              }}
              onSubmitCreateProject={async (values: ProjectFormValues) => {
                try {
                  const created = await createProject.mutateAsync(values)
                  openProjectView(created.id)
                  toast.success('Project created')
                } catch {
                  toast.error('Create failed')
                }
              }}
              onSubmitUpdatePackage={async (values: PackageFormValues) => {
                if (!selectedEntity || selectedEntity.type !== 'package') return
                try {
                  await updatePackage.mutateAsync({
                    packageId: selectedEntity.packageId,
                    payload: toPackagePayload(values),
                  })
                  handleSelectPackage(
                    selectedEntity.projectId,
                    selectedEntity.packageId,
                  )
                  toast.success('Package updated')
                } catch {
                  toast.error('Update failed')
                }
              }}
              onSubmitUpdateProject={async (values: ProjectFormValues) => {
                if (!selectedProject) return
                try {
                  await updateProject.mutateAsync({
                    projectId: selectedProject.id,
                    payload: values,
                  })
                  openProjectView(selectedProject.id)
                  toast.success('Project updated')
                } catch {
                  toast.error('Update failed')
                }
              }}
            />

            <DeleteDialog
              isOpen={Boolean(deleteTarget)}
              isPending={
                deleteTarget?.type === 'project'
                  ? removeProject.isPending
                  : removePackage.isPending
              }
              target={deleteTarget}
              onCancel={() => setDeleteTarget(null)}
              onConfirm={handleDeleteConfirm}
            />
          </>
        ) : null}
      </div>
    </section>
  )
}

function ProjectSection({
  columns,
  actionMenuId,
  isCollapsed,
  onAddPackage,
  onCloseMenu,
  onDeletePackage,
  onDeleteProject,
  onEditPackage,
  onEditProject,
  onViewProject,
  onSelectPackage,
  onOpenMenu,
  onToggle,
  project,
  selectedEntity,
}: {
  columns: number
  actionMenuId: string | null
  isCollapsed: boolean
  onAddPackage: (projectId?: number) => void
  onCloseMenu: () => void
  onDeletePackage: (target: BugTimelineDeleteTarget) => void
  onDeleteProject: (target: BugTimelineDeleteTarget) => void
  onEditPackage: (projectId: number, packageId: number) => void
  onEditProject: (projectId: number) => void
  onViewProject: (projectId: number) => void
  onSelectPackage: (projectId: number, packageId: number) => void
  onOpenMenu: (id: string | null) => void
  onToggle: () => void
  project: TimelineProjectGroup
  selectedEntity: BugTimelineSelectedEntity | null
}) {
  const projectHealth = getHealthFromProgress(
    project.resolvedBug,
    project.totalBug,
  )
  const projectWindow = getProjectWindow(project.packages)

  return (
    <section className="ops-project-section bg-[var(--workspace-pane)]">
      <div
        className={cn(
          'ops-project-header-row sticky z-10 grid border-b border-[color:var(--border)]',
          actionMenuId === `project-${project.id}` && 'z-30',
        )}
        style={{ gridTemplateColumns: `${labelColumnWidth} minmax(0, 1fr)` }}
      >
        <div className="group/row ops-bug-sidebar-cell ops-gantt-project px-4 py-2.5">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={onToggle}
            >
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={cn(
                    'text-muted-foreground size-4 shrink-0 transition-transform',
                    isCollapsed && '-rotate-90',
                  )}
                />
                <p className="truncate text-sm font-semibold tracking-[-0.02em]">
                  {project.name}
                </p>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-6">
                <div className="ops-bug-inline-meta text-[11px]">
                  <span>{project.packageCount} packages</span>
                  <span>
                    {project.resolvedBug}/{project.totalBug} resolved
                  </span>
                </div>
                <StatusPill compact health={projectHealth} />
              </div>
            </button>

            <div className="flex shrink-0 items-start gap-1">
              <RowMenu
                isOpen={actionMenuId === `project-${project.id}`}
                onClose={onCloseMenu}
                onOpen={() => onOpenMenu(`project-${project.id}`)}
                items={[
                  {
                    label: 'View',
                    icon: <Bug className="size-3.5" />,
                    onSelect: () => onViewProject(project.id),
                  },
                  {
                    label: 'Add package',
                    icon: <FolderPlus className="size-3.5" />,
                    onSelect: () => onAddPackage(project.id),
                  },
                  {
                    label: 'Edit',
                    icon: <Pencil className="size-3.5" />,
                    onSelect: () => onEditProject(project.id),
                  },
                  {
                    label: 'Delete',
                    icon: <Trash2 className="size-3.5" />,
                    onSelect: () =>
                      onDeleteProject({
                        type: 'project',
                        projectId: project.id,
                        name: project.name,
                      }),
                  },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="ops-gantt-project-band ops-gantt-grid-frame relative min-h-[3rem] py-2.5">
          <TimelineGrid columns={columns} />
          {projectWindow ? (
            <div
              className="ops-project-summary-bar absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full"
              style={{
                left: `${projectWindow.leftPercent}%`,
                width: `${projectWindow.widthPercent}%`,
                background: getProjectBandColor(projectHealth),
              }}
            />
          ) : null}
        </div>
      </div>

      {!isCollapsed ? (
        <div className="ops-project-packages bg-[var(--workspace-pane)]">
          {project.packages.map((item) => (
            <PackageRow
              key={item.id}
              actionMenuId={actionMenuId}
              columns={columns}
              item={item}
              onCloseMenu={onCloseMenu}
              selected={
                selectedEntity?.type === 'package' &&
                selectedEntity.packageId === item.id
              }
              onDeletePackage={onDeletePackage}
              onEditPackage={onEditPackage}
              onOpenMenu={onOpenMenu}
              onSelect={() => onSelectPackage(item.projectId, item.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function PackageRow({
  columns,
  actionMenuId,
  item,
  onCloseMenu,
  onDeletePackage,
  onEditPackage,
  onOpenMenu,
  onSelect,
  selected,
}: {
  columns: number
  actionMenuId: string | null
  item: TimelinePackageBar
  onCloseMenu: () => void
  onDeletePackage: (target: BugTimelineDeleteTarget) => void
  onEditPackage: (projectId: number, packageId: number) => void
  onOpenMenu: (id: string | null) => void
  onSelect: () => void
  selected: boolean
}) {
  return (
    <div
      className={cn(
        'ops-gantt-row grid border-b border-[color:var(--border)]/70',
        actionMenuId === `package-${item.id}` && 'z-30',
      )}
      style={{ gridTemplateColumns: `${labelColumnWidth} minmax(0, 1fr)` }}
    >
      <div
        className={cn(
          'group/row ops-bug-sidebar-cell ops-gantt-package px-4 py-2.5 transition-colors',
          selected && 'ops-bug-selected',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onSelect}
            className="ops-package-rail min-w-0 flex-1 text-left"
          >
            <span className="ops-package-rail-line" aria-hidden="true" />
            <div className="ops-package-rail-content">
              <p className="truncate text-sm font-medium tracking-[-0.015em]">
                {item.name}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[color:var(--muted-foreground)]">
                <div className="ops-bug-inline-meta min-w-0">
                  <span>
                    {formatDateLabel(item.startDate)} -{' '}
                    {formatDateLabel(item.endDate)}
                  </span>
                </div>
                <div className="ops-bug-inline-meta min-w-0">
                  <span>{item.keys.length} keys</span>
                </div>
                <div className="ops-bug-inline-meta min-w-0">
                  <span>{item.members.length} members</span>
                  <span>
                    {item.resolvedBug}/{item.totalBug} resolved
                  </span>
                </div>
              </div>
            </div>
          </button>
          <div className="flex shrink-0 items-start gap-1">
            <StatusPill health={item.health} />
            <RowMenu
              isOpen={actionMenuId === `package-${item.id}`}
              onClose={onCloseMenu}
              onOpen={() => onOpenMenu(`package-${item.id}`)}
              items={[
                {
                  label: 'View',
                  icon: <Bug className="size-3.5" />,
                  onSelect: onSelect,
                },
                {
                  label: 'Edit',
                  icon: <Pencil className="size-3.5" />,
                  onSelect: () => onEditPackage(item.projectId, item.id),
                },
                {
                  label: 'Delete',
                  icon: <Trash2 className="size-3.5" />,
                  onSelect: () =>
                    onDeletePackage({
                      type: 'package',
                      projectId: item.projectId,
                      packageId: item.id,
                      name: item.name,
                    }),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="ops-gantt-package-band ops-gantt-grid-frame relative min-h-[4rem] overflow-hidden py-2.5">
        <TimelineGrid columns={columns} />
        <button
          type="button"
          onClick={onSelect}
          className={cnSelected(
            'ops-timeline-bar absolute top-2.5 flex h-10 min-w-[5rem] items-center rounded-lg border px-3 text-left text-white transition-[box-shadow,filter] hover:brightness-[0.99]',
            selected,
          )}
          style={{
            left: `${item.leftPercent}%`,
            width: `${item.widthPercent}%`,
            background: getBarTrackColor(item.health),
          }}
        >
          <span
            className="pointer-events-none absolute inset-y-0 left-0 rounded-[inherit]"
            style={{
              width: `${Math.max(item.progress * 100, 8)}%`,
              background: getBarColor(item.health),
            }}
          />
          <div className="relative z-10 flex w-full items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{item.name}</div>
              <div className="mt-0.5 truncate text-[10px] font-semibold text-white/88">
                {item.resolvedBug}/{item.totalBug} resolved ·{' '}
                {Math.round(item.progress * 100)}%
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

function CrudDrawer({
  inspectorMode,
  isOpen,
  packageMutationState,
  packageOptions,
  project,
  projectMutationState,
  selectedEntity,
  selectedPackage,
  selectedPackageBar,
  onClose,
  onSubmitCreatePackage,
  onSubmitCreateProject,
  onSubmitUpdatePackage,
  onSubmitUpdateProject,
}: {
  inspectorMode: BugTimelineInspectorMode
  isOpen: boolean
  packageMutationState: {
    create: { isPending: boolean }
    update: { isPending: boolean }
  }
  packageOptions: BugTrackerProject[]
  project: BugTrackerProject | null
  projectMutationState: {
    create: { isPending: boolean }
    update: { isPending: boolean }
  }
  selectedEntity: BugTimelineSelectedEntity | null
  selectedPackage: BugTrackerPackage | null
  selectedPackageBar: TimelinePackageBar | null
  onClose: () => void
  onSubmitCreatePackage: (values: PackageFormValues) => Promise<void>
  onSubmitCreateProject: (values: ProjectFormValues) => Promise<void>
  onSubmitUpdatePackage: (values: PackageFormValues) => Promise<void>
  onSubmitUpdateProject: (values: ProjectFormValues) => Promise<void>
}) {
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    values: { name: project?.name ?? '' },
  })
  const packageForm = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    values: {
      projectId:
        selectedEntity?.type === 'package'
          ? selectedEntity.projectId
          : (selectedEntity?.projectId ?? packageOptions[0]?.id ?? 0),
      name: selectedPackage?.name ?? '',
      keys: selectedPackage?.keys ?? '',
      labels: selectedPackage?.labels ?? '',
      members: selectedPackage?.members ?? '',
      jql: selectedPackage?.jql ?? '',
      start_date: selectedPackage?.start_date ?? '',
      end_date: selectedPackage?.end_date ?? '',
    },
  })

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isPackageView =
    inspectorMode === 'view-package' && Boolean(selectedPackage)

  return (
    <div className="ops-side-drawer-backdrop fixed inset-0 z-40 flex justify-end">
      <div
        className={cn(
          'ops-side-drawer-panel flex h-full w-full flex-col',
          isPackageView
            ? 'max-w-[min(72rem,calc(100vw-2rem))]'
            : 'max-w-[28rem]',
        )}
      >
        <div className="flex items-start justify-between border-b border-[color:var(--border)] px-4 py-4">
          <div>
            <p className="ops-inspector-label">
              {inspectorMode.startsWith('create')
                ? 'Create'
                : inspectorMode.startsWith('edit')
                  ? 'Edit'
                  : 'Details'}
            </p>
            <p className="mt-1 text-base font-semibold tracking-[-0.02em]">
              {getInspectorTitle(inspectorMode, project, selectedPackage)}
            </p>
          </div>
          <Button
            className="size-8 rounded-md px-0"
            size="sm"
            variant="ghost"
            onClick={onClose}
          >
            <PanelRightClose className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          {inspectorMode === 'view-project' && project ? (
            <ProjectViewPanel project={project} />
          ) : null}
          {inspectorMode === 'view-package' &&
          selectedPackage &&
          selectedPackageBar ? (
            <PackageDetailPanel
              packageItem={selectedPackage}
              packageBar={selectedPackageBar}
              projectName={
                packageOptions.find(
                  (item) => item.id === selectedPackage.bug_tracker_project,
                )?.name ?? ''
              }
            />
          ) : null}
          {inspectorMode === 'create-project' ? (
            <ProjectFormPanel
              form={projectForm}
              isPending={projectMutationState.create.isPending}
              submitLabel="Create project"
              onCancel={onClose}
              onSubmit={onSubmitCreateProject}
            />
          ) : null}
          {inspectorMode === 'edit-project' && project ? (
            <ProjectFormPanel
              form={projectForm}
              isPending={projectMutationState.update.isPending}
              submitLabel="Save"
              onCancel={onClose}
              onSubmit={onSubmitUpdateProject}
            />
          ) : null}
          {inspectorMode === 'create-package' ? (
            <PackageFormPanel
              allowProjectChange
              form={packageForm}
              isPending={packageMutationState.create.isPending}
              projects={packageOptions}
              submitLabel="Create package"
              onCancel={onClose}
              onSubmit={onSubmitCreatePackage}
            />
          ) : null}
          {inspectorMode === 'edit-package' && selectedPackage ? (
            <PackageFormPanel
              allowProjectChange={false}
              form={packageForm}
              isPending={packageMutationState.update.isPending}
              projects={packageOptions}
              submitLabel="Save"
              onCancel={onClose}
              onSubmit={onSubmitUpdatePackage}
            />
          ) : null}
          {(inspectorMode === 'edit-package' && !selectedPackage) ||
          (inspectorMode === 'edit-project' && !project) ||
          (inspectorMode === 'view-package' && !selectedPackage) ||
          (inspectorMode === 'view-project' && !project) ? (
            <div className="p-4">
              <div className="ops-detail-empty rounded-md px-4 py-6 text-sm">
                Item not available.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function DeleteDialog({
  isOpen,
  isPending,
  target,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean
  isPending: boolean
  target: BugTimelineDeleteTarget | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}) {
  if (!isOpen || !target) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/28 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-xl border border-[color:var(--border)] bg-[var(--workspace-pane)] p-0 shadow-[0_20px_56px_rgba(9,30,66,0.22)]">
        <DeletePanel
          isPending={isPending}
          target={target}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  )
}

function ProjectViewPanel({ project }: { project: BugTrackerProject }) {
  return (
    <div className="p-4">
      <div className="grid gap-4">
        <Field label="Name">
          <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
            {project.name}
          </div>
        </Field>
      </div>
    </div>
  )
}

function PackageDetailPanel({
  packageBar,
  packageItem,
  projectName,
}: {
  packageBar: TimelinePackageBar
  packageItem: BugTrackerPackage
  projectName: string
}) {
  const openBugCount = packageBar.totalBug - packageBar.resolvedBug
  const statisticsQuery = usePackageBugStatisticsQuery(packageItem.id, true)

  return (
    <div className="p-4">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.88fr)] xl:items-start">
        <div className="grid gap-5">
          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-[-0.02em]">
                Bug categories
              </h3>
              {statisticsQuery.isSuccess ? (
                <span className="text-xs text-[var(--muted-foreground)]">
                  {statisticsQuery.data.reduce(
                    (sum, item) => sum + item.number_of_bugs,
                    0,
                  )}{' '}
                  bugs
                </span>
              ) : null}
            </div>
            <PackageBugStatisticsSection
              isError={statisticsQuery.isError}
              isPending={statisticsQuery.isPending}
              statistics={statisticsQuery.data ?? []}
            />
          </section>

          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-[-0.02em]">
                Issues
              </h3>
              <span className="text-xs text-[var(--muted-foreground)]">
                {packageItem.issues.length} items
              </span>
            </div>
            <PackageIssuesTable issues={packageItem.issues} />
          </section>
        </div>

        <div className="grid gap-4 xl:sticky xl:top-0">
          <Field label="Project">
            <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
              {projectName || '-'}
            </div>
          </Field>
          <Field label="Name">
            <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
              {packageItem.name}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
                {packageItem.start_date}
              </div>
            </Field>
            <Field label="End">
              <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
                {packageItem.end_date}
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MetricBlock label="Resolved" value={`${packageBar.resolvedBug}`} />
            <MetricBlock label="Open" value={`${openBugCount}`} />
            <MetricBlock
              label="Issues"
              value={`${packageItem.issues.length}`}
            />
          </div>
          <Field label="Keys">
            <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm">
              {packageItem.keys || '-'}
            </div>
          </Field>
          <Field label="Labels">
            <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm">
              {packageItem.labels || '-'}
            </div>
          </Field>
          <Field label="Members">
            <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm">
              {packageItem.members || '-'}
            </div>
          </Field>
          <Field label="JQL">
            <div className="ops-bug-view-field min-h-[7rem] rounded-md px-3 py-3 text-sm break-all">
              {packageItem.jql || '-'}
            </div>
          </Field>
        </div>
      </div>
    </div>
  )
}

function PackageBugStatisticsSection({
  isError,
  isPending,
  statistics,
}: {
  isError: boolean
  isPending: boolean
  statistics: PackageBugStatistic[]
}) {
  if (isPending) {
    return (
      <div className="ops-bug-chart-shell rounded-md px-4 py-10 text-sm text-[var(--muted-foreground)]">
        Loading statistics.
      </div>
    )
  }

  if (isError) {
    return (
      <div className="ops-bug-chart-shell rounded-md px-4 py-10 text-sm text-[var(--status-danger)]">
        Failed to load statistics.
      </div>
    )
  }

  const total = statistics.reduce((sum, item) => sum + item.number_of_bugs, 0)
  const rawChartData = statistics.map((item, index) => ({
    id: item.id,
    label: formatBugCategoryLabel(item.bug_category.name),
    value: item.number_of_bugs,
    color: BUG_CATEGORY_COLORS[index % BUG_CATEGORY_COLORS.length],
  }))
  const sortedChartData = [...rawChartData].sort((left, right) => {
    if (right.value !== left.value) return right.value - left.value
    return left.label.localeCompare(right.label)
  })
  const topCategories = sortedChartData.slice(0, 5)
  const remainingCategories = sortedChartData.slice(5)
  const otherValue = remainingCategories.reduce(
    (sum, item) => sum + item.value,
    0,
  )
  const chartData =
    remainingCategories.length > 0
      ? [
          ...topCategories,
          {
            id: -1,
            label: 'Other',
            value: otherValue,
            color: '#6b778c',
            breakdown: remainingCategories,
          },
        ]
      : topCategories
  const emptyChartData = [
    {
      id: -2,
      label: 'No bugs',
      value: 1,
      color: 'color-mix(in srgb, var(--border) 70%, transparent)',
    },
  ]
  const visibleChartData = total > 0 ? chartData : emptyChartData

  return (
    <div className="ops-bug-chart-shell grid gap-4 rounded-md p-3">
      <div className="flex flex-wrap items-start gap-4">
        <div className="h-52 w-full max-w-[13rem] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visibleChartData}
                dataKey="value"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={chartData.length > 1 ? 2 : 0}
                stroke="none"
              >
                {visibleChartData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={<PackageBugStatisticsTooltip total={total} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid min-w-0 flex-1 content-start gap-2 self-start">
          {chartData.map((item) => (
            <div
              key={item.id}
              className="ops-bug-chart-legend-item flex items-center justify-between gap-3 rounded-md px-3 py-2"
              title={
                item.label === 'Other' && 'breakdown' in item
                  ? item.breakdown
                      .map((entry) => `${entry.label}: ${entry.value}`)
                      .join('\n')
                  : undefined
              }
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="truncate text-sm">{item.label}</span>
              </div>
              <div className="text-right text-xs text-[var(--muted-foreground)]">
                <div className="font-medium text-[var(--foreground)]">
                  {item.value}
                </div>
                <div>
                  {total > 0
                    ? `${Math.round((item.value / total) * 100)}%`
                    : '0%'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PackageBugStatisticsTooltip({
  active,
  payload,
  total = 0,
}: {
  active?: boolean
  payload?: Array<{
    payload: {
      label: string
      value: number
      breakdown?: Array<{ label: string; value: number }>
    }
  }>
  total?: number
}) {
  if (!active || !payload?.length) return null

  const item = payload[0]?.payload
  if (!item) return null

  return (
    <div className="ops-bug-chart-tooltip rounded-md px-3 py-2 text-xs shadow-sm">
      <div className="font-medium text-[var(--foreground)]">{item.label}</div>
      <div className="mt-1 text-[var(--muted-foreground)]">
        {item.value} bugs
        {total > 0 ? ` (${Math.round((item.value / total) * 100)}%)` : ''}
      </div>
      {item.label === 'Other' && item.breakdown?.length ? (
        <div className="mt-2 grid gap-1 border-t border-[color:var(--border)]/80 pt-2 text-[var(--muted-foreground)]">
          {item.breakdown.map((entry) => (
            <div
              key={entry.label}
              className="flex items-center justify-between gap-3"
            >
              <span className="truncate">{entry.label}</span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function PackageIssuesTable({
  issues,
}: {
  issues: BugTrackerPackage['issues']
}) {
  if (!issues.length) {
    return (
      <div className="ops-bug-table-shell rounded-md px-4 py-10 text-sm text-[var(--muted-foreground)]">
        No issues.
      </div>
    )
  }

  return (
    <div className="ops-bug-table-shell overflow-hidden rounded-md">
      <div className="max-h-[22rem] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="ops-bug-table-head sticky top-0 z-[1]">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Key</th>
              <th className="px-3 py-2 text-left font-medium">Summary</th>
              <th className="px-3 py-2 text-left font-medium">Assignee</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.key} className="ops-bug-table-row align-top">
                <td className="px-3 py-2.5">
                  <a
                    className="font-medium text-[var(--primary)] hover:underline"
                    href={issue.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {issue.key}
                  </a>
                </td>
                <td className="px-3 py-2.5">
                  <div className="line-clamp-2 min-w-0 text-[var(--foreground)]">
                    {issue.summary}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[var(--muted-foreground)]">
                  {issue.assignee || '-'}
                </td>
                <td className="px-3 py-2.5">
                  <IssueStatusBadge status={issue.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function IssueStatusBadge({ status }: { status: string }) {
  const tone = getIssueStatusTone(status)
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium"
      style={{
        background: `color-mix(in srgb, ${tone} 14%, transparent)`,
        color: tone,
      }}
    >
      {status}
    </span>
  )
}

function ProjectFormPanel({
  form,
  isPending,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  form: UseFormReturn<ProjectFormValues>
  isPending: boolean
  submitLabel: string
  onCancel: () => void
  onSubmit: (values: ProjectFormValues) => Promise<void>
}) {
  return (
    <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input
            className="ops-workspace-input h-10 rounded-md"
            {...form.register('name')}
          />
        </Field>
        <FormActions
          isPending={isPending}
          submitLabel={submitLabel}
          onCancel={onCancel}
        />
      </div>
    </form>
  )
}

function PackageFormPanel({
  allowProjectChange,
  form,
  isPending,
  projects,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  allowProjectChange: boolean
  form: UseFormReturn<PackageFormValues>
  isPending: boolean
  projects: BugTrackerProject[]
  submitLabel: string
  onCancel: () => void
  onSubmit: (values: PackageFormValues) => Promise<void>
}) {
  return (
    <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <Field label="Project" error={form.formState.errors.projectId?.message}>
          {allowProjectChange ? (
            <select
              className="ops-bug-select h-10 rounded-md"
              {...form.register('projectId', {
                setValueAs: (value) => Number(value),
              })}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
              {projects.find(
                (project) => project.id === form.getValues('projectId'),
              )?.name ?? '-'}
            </div>
          )}
        </Field>
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input
            className="ops-workspace-input h-10 rounded-md"
            {...form.register('name')}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Start"
            error={form.formState.errors.start_date?.message}
          >
            <Input
              className="ops-workspace-input h-10 rounded-md"
              type="date"
              {...form.register('start_date')}
            />
          </Field>
          <Field label="End" error={form.formState.errors.end_date?.message}>
            <Input
              className="ops-workspace-input h-10 rounded-md"
              type="date"
              {...form.register('end_date')}
            />
          </Field>
        </div>
        <Field label="Keys">
          <Input
            className="ops-workspace-input h-10 rounded-md"
            {...form.register('keys')}
          />
        </Field>
        <Field label="Labels">
          <Input
            className="ops-workspace-input h-10 rounded-md"
            {...form.register('labels')}
          />
        </Field>
        <Field label="Members">
          <Input
            className="ops-workspace-input h-10 rounded-md"
            {...form.register('members')}
          />
        </Field>
        <Field label="JQL">
          <textarea
            className="ops-bug-textarea rounded-md"
            rows={5}
            {...form.register('jql')}
          />
        </Field>
        <FormActions
          isPending={isPending}
          submitLabel={submitLabel}
          onCancel={onCancel}
        />
      </div>
    </form>
  )
}

function DeletePanel({
  isPending,
  target,
  onCancel,
  onConfirm,
}: {
  isPending: boolean
  target: BugTimelineDeleteTarget
  onCancel: () => void
  onConfirm: () => Promise<void>
}) {
  return (
    <div className="p-5">
      <div className="rounded-xl border border-[color:var(--status-danger)]/18 bg-[color:var(--status-danger)]/5 p-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Delete {target.type}
        </p>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          {target.name}
        </p>
        <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
          This change cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            Delete
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({
  children,
  error,
  label,
}: {
  children: ReactNode
  error?: string
  label: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className="ops-bug-toolbar-label">{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] text-[var(--status-danger)]">{error}</span>
      ) : null}
    </label>
  )
}

function FormActions({
  isPending,
  submitLabel,
  onCancel,
}: {
  isPending: boolean
  submitLabel: string
  onCancel: () => void
}) {
  return (
    <div className="flex gap-2 pt-2">
      <Button size="sm" type="submit" disabled={isPending}>
        {submitLabel}
      </Button>
      <Button size="sm" type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="ops-bug-date-field">
      <span className="ops-bug-toolbar-label">{label}</span>
      <Input
        className="ops-workspace-input ops-bug-filter-input h-10 min-w-[9.5rem] rounded-md"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function RowActionButton({
  children,
  className,
  label,
  onClick,
}: {
  children: ReactNode
  className?: string
  label: string
  onClick: () => void
}) {
  return (
    <Button
      size="icon-xs"
      variant="ghost"
      className={cn('text-muted-foreground hover:text-foreground', className)}
      title={label}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      {children}
    </Button>
  )
}

function RowMenu({
  isOpen,
  items,
  onClose,
  onOpen,
}: {
  isOpen: boolean
  items: Array<{ label: string; icon: ReactNode; onSelect: () => void }>
  onClose: () => void
  onOpen: () => void
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuStyle, setMenuStyle] = useState<{
    top: number
    left: number
  } | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      setMenuStyle({
        top: rect.bottom + 6,
        left: rect.right - 144,
      })
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      onClose()
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isOpen, onClose])

  return (
    <div ref={triggerRef}>
      <RowActionButton
        className={cn(
          'opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100',
          isOpen && 'opacity-100',
        )}
        label="More actions"
        onClick={() => (isOpen ? onClose() : onOpen())}
      >
        <Ellipsis className="size-3.5" />
      </RowActionButton>
      {isOpen && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              className="ops-row-menu fixed z-[120] min-w-[9rem] rounded-md p-1"
              style={{ top: menuStyle.top, left: menuStyle.left }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="ops-row-menu-item flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm"
                  onClick={() => {
                    onClose()
                    item.onSelect()
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="ops-bug-metric rounded-md border border-[color:var(--border)]/80 bg-[var(--workspace-pane-muted)] px-3 py-2.5">
      <span className="ops-bug-metric-label">{label}</span>
      <span className="text-sm font-semibold text-[color:var(--foreground)]">
        {value}
      </span>
    </div>
  )
}

function StatusPill({
  compact = false,
  health,
}: {
  compact?: boolean
  health: TimelinePackageBar['health']
}) {
  const label =
    health === 'healthy' ? 'Healthy' : health === 'watch' ? 'Watch' : 'Risk'
  const color =
    health === 'healthy'
      ? 'var(--status-success)'
      : health === 'watch'
        ? 'var(--status-warning)'
        : 'var(--status-danger)'

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'}`}
      style={{
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  )
}

function TimelineGrid({ columns }: { columns: number }) {
  return (
    <div className="grid h-full" style={getGridStyle(columns)}>
      {Array.from({ length: columns }, (_, index) => (
        <div
          key={index}
          className="ops-gantt-column h-full"
          style={{ borderLeftWidth: index === 0 ? 0 : 1 }}
        />
      ))}
    </div>
  )
}

function TodayMarker({ offset }: { offset: number }) {
  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-[color:var(--primary)]/60"
      style={{ left: `${offset}%` }}
    />
  )
}

function BugTimelineLoadingState() {
  return (
    <div className="flex flex-1 items-center px-4 py-4 lg:px-5">
      <div className="ops-detail-empty w-full rounded-md px-4 py-10 text-sm">
        Loading timeline.
      </div>
    </div>
  )
}

function BugTimelineErrorState() {
  return (
    <div className="flex flex-1 items-center px-4 py-4 lg:px-5">
      <div className="w-full rounded-md border border-[color:var(--status-danger)]/25 bg-[color:var(--status-danger)]/8 px-4 py-10 text-sm text-[var(--status-danger)]">
        Failed to load timeline.
      </div>
    </div>
  )
}

function getInspectorTitle(
  mode: BugTimelineInspectorMode,
  project: BugTrackerProject | null,
  packageItem: BugTrackerPackage | null,
) {
  if (mode === 'create-project') return 'New project'
  if (mode === 'create-package') return 'New package'
  if (mode === 'edit-project') return `Edit ${project?.name ?? 'project'}`
  if (mode === 'edit-package') return `Edit ${packageItem?.name ?? 'package'}`
  if (mode === 'view-project') return project?.name ?? 'Project'
  return packageItem?.name ?? 'Package'
}

function toPackagePayload(values: PackageFormValues) {
  return {
    name: values.name.trim(),
    keys: values.keys.trim(),
    labels: values.labels.trim(),
    members: values.members.trim(),
    jql: values.jql.trim(),
    start_date: values.start_date,
    end_date: values.end_date,
    bug_tracker_project: values.projectId,
  }
}

function getGridStyle(columns: number) {
  return { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
}

function getTodayOffsetPercent(weekColumns: WeekColumn[]) {
  if (!weekColumns.length) return null
  const now = new Date()
  const current = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime()
  const columnIndex = weekColumns.findIndex(
    (column) =>
      current >= column.start.getTime() && current < column.end.getTime(),
  )
  if (columnIndex === -1) return null
  const column = weekColumns[columnIndex]
  const columnDuration = column.end.getTime() - column.start.getTime()
  const withinColumn =
    columnDuration > 0 ? (current - column.start.getTime()) / columnDuration : 0
  return ((columnIndex + withinColumn) / weekColumns.length) * 100
}

function getBarColor(health: TimelinePackageBar['health']) {
  if (health === 'healthy') return 'var(--timeline-bar-healthy)'
  if (health === 'watch') return 'var(--timeline-bar-watch)'
  return 'var(--timeline-bar-risk)'
}

function getBarTrackColor(health: TimelinePackageBar['health']) {
  const color = getBarColor(health)
  return `color-mix(in srgb, ${color} 32%, var(--workspace-pane))`
}

function getProjectBandColor(health: TimelinePackageBar['health']) {
  const color = getBarColor(health)
  return `color-mix(in srgb, ${color} 22%, transparent)`
}

function getHealthFromProgress(resolvedBug: number, totalBug: number) {
  if (totalBug === 0) return 'healthy' as const
  const progress = resolvedBug / totalBug
  if (progress >= 0.75) return 'healthy' as const
  if (progress >= 0.4) return 'watch' as const
  return 'risk' as const
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function formatWeekLabel(value: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(value)
}

function formatWeekShortLabel(start: Date, end: Date) {
  return `${start.getDate()}-${addDays(end, -1).getDate()}`
}

function formatBugCategoryLabel(value: string) {
  return value.replace(/^FPT\.BUG\./, '').replaceAll('_', ' ')
}

function getIssueStatusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'closed' || normalized === 'resolved') {
    return 'var(--status-success)'
  }
  if (
    normalized === 'in progress' ||
    normalized === 'open' ||
    normalized === 'fixready'
  ) {
    return 'var(--status-warning)'
  }
  return 'var(--status-danger)'
}

function cnSelected(base: string, selected: boolean) {
  return `${base} ${selected ? 'ops-bug-selected' : ''}`
}

function getProjectWindow(packages: TimelinePackageBar[]) {
  if (!packages.length) return null

  const leftPercent = Math.min(...packages.map((item) => item.leftPercent))
  const rightPercent = Math.max(
    ...packages.map((item) => item.leftPercent + item.widthPercent),
  )

  return {
    leftPercent,
    widthPercent: Math.max(rightPercent - leftPercent, 6),
  }
}

function toInputDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function parseInputDate(value: string, fallback: Date) {
  if (!value) return new Date(fallback)
  return new Date(`${value}T00:00:00`)
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfWeek(date: Date) {
  const next = startOfDay(date)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(next, diff)
}

function buildVisibleTimelineViewModel(
  viewModel: BugTimelineViewModel,
  fromDate: string,
  toDate: string,
): VisibleTimelineViewModel {
  const rawStart = startOfDay(parseInputDate(fromDate, viewModel.rangeStart))
  const rawEnd = addDays(
    startOfDay(parseInputDate(toDate, addDays(viewModel.rangeEnd, -1))),
    1,
  )
  const rangeStart = rawStart
  const rangeEnd = rawEnd > rawStart ? rawEnd : addDays(rawStart, 1)
  const totalDuration = rangeEnd.getTime() - rangeStart.getTime()

  const weekColumns: WeekColumn[] = []
  for (
    let cursor = startOfWeek(rangeStart);
    cursor < rangeEnd;
    cursor = addDays(cursor, 7)
  ) {
    const start = new Date(Math.max(cursor.getTime(), rangeStart.getTime()))
    const end = new Date(
      Math.min(addDays(cursor, 7).getTime(), rangeEnd.getTime()),
    )
    weekColumns.push({
      key: `${start.toISOString()}-${end.toISOString()}`,
      label: formatWeekLabel(start),
      shortLabel: formatWeekShortLabel(start, end),
      start,
      end,
    })
  }

  const monthGroups: MonthGroup[] = []
  weekColumns.forEach((column, index) => {
    const midpoint = new Date(
      column.start.getTime() +
        (column.end.getTime() - column.start.getTime()) / 2,
    )
    const monthKey = `${midpoint.getFullYear()}-${midpoint.getMonth()}`
    const lastGroup = monthGroups.at(-1)
    if (lastGroup?.key === monthKey) {
      lastGroup.span += 1
      return
    }
    monthGroups.push({
      key: monthKey,
      label: formatMonthLabel(midpoint),
      start: index + 1,
      span: 1,
    })
  })

  const projects = viewModel.projects
    .map<TimelineProjectGroup>((project) => {
      const projectPackages = project.packages
        .map((item) => {
          const itemStart = startOfDay(new Date(`${item.startDate}T00:00:00`))
          const itemEnd = addDays(
            startOfDay(new Date(`${item.endDate}T00:00:00`)),
            1,
          )
          if (itemEnd <= rangeStart || itemStart >= rangeEnd) return null
          const clippedStart = new Date(
            Math.max(itemStart.getTime(), rangeStart.getTime()),
          )
          const clippedEnd = new Date(
            Math.min(itemEnd.getTime(), rangeEnd.getTime()),
          )
          return {
            ...item,
            leftPercent:
              ((clippedStart.getTime() - rangeStart.getTime()) /
                totalDuration) *
              100,
            widthPercent: Math.max(
              ((clippedEnd.getTime() - clippedStart.getTime()) /
                totalDuration) *
                100,
              3,
            ),
          }
        })
        .filter((item): item is TimelinePackageBar => item !== null)

      return {
        ...project,
        packageCount: projectPackages.length,
        totalBug: projectPackages.reduce((sum, item) => sum + item.totalBug, 0),
        resolvedBug: projectPackages.reduce(
          (sum, item) => sum + item.resolvedBug,
          0,
        ),
        packages: projectPackages,
      }
    })
    .filter((project) => project.packages.length > 0)

  return { rangeStart, rangeEnd, monthGroups, weekColumns, projects }
}
