import { zodResolver } from '@hookform/resolvers/zod'
import jsPDF from 'jspdf'
import {
  Bar,
  Cell,
  CartesianGrid,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Flag,
  FolderPlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

import {
  LoadingPanel,
  TimelineWorkspaceLoading,
} from '@/components/common/loading-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUserQuery } from '@/features/auth/hooks/use-current-user-query'
import { useMilestoneSprintStatisticsQuery } from '@/features/milestones/api/milestone.queries'
import { useMilestoneTimelineQuery } from '@/features/milestones/hooks/use-milestone-query'
import { useMilestoneTimelineMutations } from '@/features/milestones/hooks/use-milestone-mutations'
import {
  milestoneFormSchema,
  projectFormSchema,
  type MilestoneFormValues,
  type ProjectFormValues,
} from '@/features/milestones/schemas/milestone.schema'
import { useMilestoneTimelineUiStore } from '@/features/milestones/stores/milestone-ui.store'
import type {
  MilestoneTimelineInspectorMode,
  MilestoneTimelineSelectedEntity,
  DashboardMilestone,
  DashboardMilestoneSprintStatistic,
  DashboardProject,
  TimelineMilestoneBar,
} from '@/features/milestones/types/milestone.types'
import {
  TimelineDateField as DateField,
  TimelineDeleteDialog as DeleteDialog,
  TimelineField as Field,
  TimelineFormActions as FormActions,
  TimelineIssuesTable as MilestoneIssuesTable,
  TimelineMemberStatusSummary as MilestoneMemberStatusSummary,
  TimelineSyncStatusPill,
  TimelineStatusSummary as MilestoneStatusSummary,
  TimelineTodayMarker as TodayMarker,
} from '@/features/timeline-workspace/components/timeline-shared'
import { TimelineDrawerShell } from '@/features/timeline-workspace/components/timeline-drawer-shell'
import { TimelineItemRow } from '@/features/timeline-workspace/components/timeline-item-row'
import { TimelineProjectSection } from '@/features/timeline-workspace/components/timeline-project-section'
import { TimelineViewToggle } from '@/features/timeline-workspace/components/timeline-view-toggle'
import { buildVisibleTimelineViewModel } from '@/features/timeline-workspace/model/build-visible-timeline-view-model'
import {
  addDays,
  buildTimelineItemExportFileName,
  captureTimelineExportSnapshot,
  downloadDataUrl,
  formatDateLabel,
  getGridStyle,
  getTimelineTrackWidthRem,
  getTodayOffsetPercent,
  parseCommaList,
  toInputDate,
  truncateChartAxisLabel,
} from '@/features/timeline-workspace/utils/timeline-workspace.utils'
import {
  formatTimelineItemInspectorTitle,
  getInspectorEyebrow,
  getTimelineInspectorTitle,
} from '@/features/timeline-workspace/utils/timeline-inspector.utils'
const labelColumnWidth = '18.5rem'
const monthHeaderHeight = '2.5rem'
const weekHeaderHeight = '3rem'
const ganttHeaderHeight = `calc(${monthHeaderHeight} + ${weekHeaderHeight})`
export function MilestoneScreen() {
  const { projects, packages, viewModel, isPending, isError } =
    useMilestoneTimelineQuery()
  const currentUserQuery = useCurrentUserQuery()
  const currentUserId = currentUserQuery.data?.id ?? null
  const search = useMilestoneTimelineUiStore((state) => state.search)
  const setSearch = useMilestoneTimelineUiStore((state) => state.setSearch)
  const zoom = useMilestoneTimelineUiStore((state) => state.zoom)
  const setZoom = useMilestoneTimelineUiStore((state) => state.setZoom)
  const collapsedProjectIds = useMilestoneTimelineUiStore(
    (state) => state.collapsedProjectIds,
  )
  const toggleProject = useMilestoneTimelineUiStore(
    (state) => state.toggleProject,
  )
  const selectedEntity = useMilestoneTimelineUiStore(
    (state) => state.selectedEntity,
  )
  const inspectorMode = useMilestoneTimelineUiStore(
    (state) => state.inspectorMode,
  )
  const deleteTarget = useMilestoneTimelineUiStore(
    (state) => state.deleteTarget,
  )
  const setSelectedEntity = useMilestoneTimelineUiStore(
    (state) => state.setSelectedEntity,
  )
  const setInspectorMode = useMilestoneTimelineUiStore(
    (state) => state.setInspectorMode,
  )
  const openCreateProject = useMilestoneTimelineUiStore(
    (state) => state.openCreateProject,
  )
  const openEditProject = useMilestoneTimelineUiStore(
    (state) => state.openEditProject,
  )
  const openCreatePackage = useMilestoneTimelineUiStore(
    (state) => state.openCreatePackage,
  )
  const openEditPackage = useMilestoneTimelineUiStore(
    (state) => state.openEditPackage,
  )
  const setDeleteTarget = useMilestoneTimelineUiStore(
    (state) => state.setDeleteTarget,
  )
  const {
    createProject,
    updateProject,
    removeProject,
    createPackage,
    updatePackage,
    removePackage,
  } = useMilestoneTimelineMutations()

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
        zoom,
      ),
    [effectiveFromDate, effectiveToDate, viewModel, zoom],
  )

  const timelineMinWidth = `${getTimelineTrackWidthRem(
    zoom,
    filteredViewModel.weekColumns.length,
  )}rem`
  const todayOffset = getTodayOffsetPercent(filteredViewModel.weekColumns)
  const selectedProjectId =
    selectedEntity?.type === 'package'
      ? selectedEntity.projectId
      : (selectedEntity?.projectId ?? null)
  const selectedProject = selectedProjectId
    ? (projects.find((project) => project.id === selectedProjectId) ?? null)
    : null
  const selectedMilestone =
    selectedEntity?.type === 'package'
      ? (packages.find(
          (item) =>
            item.id === selectedEntity.packageId &&
            item.bug_tracker_project === selectedEntity.projectId,
        ) ?? null)
      : null
  const selectedMilestoneBar =
    selectedEntity?.type === 'package'
      ? (filteredViewModel.projects
          .flatMap((project) => project.packages)
          .find((item) => item.id === selectedEntity.packageId) ?? null)
      : null

  const openProjectView = (projectId: number) => {
    setSelectedEntity({ type: 'project', projectId })
    setInspectorMode('view-project')
  }

  const handleSelectMilestone = (projectId: number, packageId: number) => {
    setSelectedEntity({ type: 'package', projectId, packageId })
    setInspectorMode('view-package')
  }

  const handleCreateProject = () => {
    openCreateProject()
  }

  const handleCreateMilestone = (projectId?: number) => {
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
        toast.success('Milestone deleted')
      }

      setDeleteTarget(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <section className="ops-bug-shell ops-workspace-screen flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isPending ? <MilestoneTimelineLoadingState /> : null}
        {isError ? <MilestoneTimelineErrorState /> : null}

        {!isPending && !isError ? (
          <>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="ops-bug-toolbar px-4 lg:px-5">
                <div className="ops-bug-toolbar-top">
                  <div className="min-w-0">
                    <p className="ops-kicker">Milestone timeline</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h1 className="text-base font-semibold tracking-[-0.02em]">
                        Milestones
                      </h1>
                      <div className="ops-bug-summary-stats">
                        <span className="ops-bug-stat">
                          {viewModel.totals.projects} projects
                        </span>
                        <span className="ops-bug-stat">
                          {viewModel.totals.packages} milestones
                        </span>
                        <span className="ops-bug-stat ops-bug-stat-strong">
                          {viewModel.totals.resolved}/{viewModel.totals.bugs}{' '}
                          closed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ops-bug-toolbar-actions ml-auto flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCreateMilestone(selectedProjectId ?? undefined)
                      }
                    >
                      <Plus className="size-4" />
                      New milestone
                    </Button>
                    <Button size="sm" onClick={handleCreateProject}>
                      <Plus className="size-4" />
                      New project
                    </Button>
                  </div>
                </div>

                <div className="ops-bug-toolbar-row">
                  <div className="ops-bug-filter-group w-full max-w-[18rem] min-w-[12rem]">
                    <span className="ops-bug-toolbar-label">Search</span>
                    <div className="relative">
                      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        className="ops-workspace-input ops-bug-filter-input h-10 rounded-md pl-9"
                        placeholder="Milestone, key, label, member"
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
                  <TimelineViewToggle value={zoom} onChange={setZoom} />
                </div>
              </div>

              <div className="ops-bug-surface min-h-0 min-w-0 flex-1 overflow-auto border-t border-[color:var(--border)]/80">
                <div
                  className="ops-bug-grid min-h-full"
                  style={{
                    minWidth: `calc(${labelColumnWidth} + ${timelineMinWidth})`,
                    ['--gantt-header-total-h' as string]: ganttHeaderHeight,
                  }}
                >
                  <div
                    className="ops-gantt-header sticky top-0 z-30 grid border-b border-[color:var(--border)]"
                    style={{
                      gridTemplateColumns: `${labelColumnWidth} minmax(${timelineMinWidth}, 1fr)`,
                      gridTemplateRows: `${monthHeaderHeight} ${weekHeaderHeight}`,
                    }}
                  >
                    <div className="ops-bug-sidebar-cell ops-gantt-sidebar row-span-2 grid place-items-center px-0 py-3 text-center">
                      <p className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">
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
                          className={`ops-gantt-week-cell ops-gantt-column ${zoom === 'week' ? 'px-0.5 py-1.5' : 'px-2 py-2'}`}
                          style={{ borderLeftWidth: index === 0 ? 0 : 1 }}
                        >
                          <p
                            className={
                              zoom === 'week'
                                ? 'text-center text-[10px] font-semibold tracking-[-0.02em]'
                                : 'text-[11px] font-semibold tracking-[-0.01em]'
                            }
                          >
                            {column.label}
                          </p>
                          {column.shortLabel ? (
                            <p
                              className={
                                zoom === 'week'
                                  ? 'text-center text-[9px] text-[color:var(--muted-foreground)]'
                                  : 'text-[10px] text-[color:var(--muted-foreground)]'
                              }
                            >
                              {column.shortLabel}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

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
                      <TimelineProjectSection
                        key={project.id}
                        actionMenuId={openActionMenu}
                        columns={filteredViewModel.weekColumns.length}
                        isCollapsed={collapsedProjectIds.includes(project.id)}
                        itemCountLabel="milestones"
                        labelColumnWidth={labelColumnWidth}
                        menuItems={[
                          {
                            label: 'View',
                            icon: <Flag className="size-3.5" />,
                            onSelect: () => openProjectView(project.id),
                          },
                          {
                            label: 'Add milestone',
                            icon: <FolderPlus className="size-3.5" />,
                            onSelect: () => handleCreateMilestone(project.id),
                          },
                          {
                            label: 'Edit',
                            icon: <Pencil className="size-3.5" />,
                            onSelect: () => openEditProject(project.id),
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 className="size-3.5" />,
                            onSelect: () =>
                              setDeleteTarget({
                                type: 'project',
                                projectId: project.id,
                                name: project.name,
                              }),
                          },
                        ]}
                        onCloseMenu={() => setOpenActionMenu(null)}
                        onOpenMenu={setOpenActionMenu}
                        onToggle={() => toggleProject(project.id)}
                        progressLabel="closed"
                        project={project}
                      >
                        {project.packages.map((item) => (
                          <TimelineItemRow
                            key={item.id}
                            actionMenuId={openActionMenu}
                            columns={filteredViewModel.weekColumns.length}
                            item={item}
                            labelColumnWidth={labelColumnWidth}
                            menuId={`package-${item.id}`}
                            menuItems={[
                              {
                                label: 'View',
                                icon: <Flag className="size-3.5" />,
                                onSelect: () =>
                                  handleSelectMilestone(
                                    item.projectId,
                                    item.id,
                                  ),
                              },
                              {
                                label: 'Edit',
                                icon: <Pencil className="size-3.5" />,
                                onSelect: () =>
                                  openEditPackage(item.projectId, item.id),
                              },
                              {
                                label: 'Delete',
                                icon: <Trash2 className="size-3.5" />,
                                onSelect: () =>
                                  setDeleteTarget({
                                    type: 'package',
                                    projectId: item.projectId,
                                    packageId: item.id,
                                    name: item.name,
                                  }),
                              },
                            ]}
                            onCloseMenu={() => setOpenActionMenu(null)}
                            onOpenMenu={setOpenActionMenu}
                            onSelect={() =>
                              handleSelectMilestone(item.projectId, item.id)
                            }
                            progressLabel="closed"
                            selected={
                              selectedEntity?.type === 'package' &&
                              selectedEntity.packageId === item.id
                            }
                          />
                        ))}
                      </TimelineProjectSection>
                    ))}
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
                  Boolean(selectedMilestone && selectedMilestoneBar)) ||
                (inspectorMode === 'edit-package' &&
                  Boolean(selectedMilestone)) ||
                inspectorMode === 'create-project' ||
                inspectorMode === 'create-package' ||
                false
              }
              milestoneMutationState={{
                create: createPackage,
                update: updatePackage,
              }}
              projectOptions={projects}
              project={selectedProject}
              selectedMilestoneBar={selectedMilestoneBar}
              projectMutationState={{
                create: createProject,
                update: updateProject,
              }}
              selectedEntity={selectedEntity}
              selectedMilestone={selectedMilestone}
              onClose={handleCloseDrawer}
              onSubmitCreateMilestone={async (values: MilestoneFormValues) => {
                try {
                  const created = await createPackage.mutateAsync({
                    payload: toMilestonePayload(values),
                  })

                  if (created.task_id) {
                    handleCloseDrawer()
                    toast.success('Milestone syncing with Jira')
                    return
                  }

                  handleSelectMilestone(created.bug_tracker_project, created.id)
                  toast.success('Milestone created')
                } catch {
                  toast.error('Create failed')
                }
              }}
              onSubmitCreateProject={async (values: ProjectFormValues) => {
                if (currentUserId === null) {
                  toast.error('Current user unavailable')
                  return
                }

                try {
                  const created = await createProject.mutateAsync(
                    toProjectPayload(values, currentUserId),
                  )
                  openProjectView(created.id)
                  toast.success('Project created')
                } catch {
                  toast.error('Create failed')
                }
              }}
              onSubmitUpdateMilestone={async (values: MilestoneFormValues) => {
                if (!selectedEntity || selectedEntity.type !== 'package') return
                try {
                  const updated = await updatePackage.mutateAsync({
                    packageId: selectedEntity.packageId,
                    payload: toMilestonePayload(values),
                  })

                  if (updated.task_id) {
                    handleCloseDrawer()
                    toast.success('Milestone syncing with Jira')
                    return
                  }

                  handleSelectMilestone(
                    selectedEntity.projectId,
                    selectedEntity.packageId,
                  )
                  toast.success('Milestone updated')
                } catch {
                  toast.error('Update failed')
                }
              }}
              onSubmitUpdateProject={async (values: ProjectFormValues) => {
                if (!selectedProject) return
                if (currentUserId === null) {
                  toast.error('Current user unavailable')
                  return
                }

                try {
                  await updateProject.mutateAsync({
                    projectId: selectedProject.id,
                    payload: toProjectPayload(values, currentUserId),
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

function CrudDrawer({
  inspectorMode,
  isOpen,
  milestoneMutationState,
  projectOptions,
  project,
  projectMutationState,
  selectedEntity,
  selectedMilestone,
  selectedMilestoneBar,
  onClose,
  onSubmitCreateMilestone,
  onSubmitCreateProject,
  onSubmitUpdateMilestone,
  onSubmitUpdateProject,
}: {
  inspectorMode: MilestoneTimelineInspectorMode
  isOpen: boolean
  milestoneMutationState: {
    create: { isPending: boolean }
    update: { isPending: boolean }
  }
  projectOptions: DashboardProject[]
  project: DashboardProject | null
  projectMutationState: {
    create: { isPending: boolean }
    update: { isPending: boolean }
  }
  selectedEntity: MilestoneTimelineSelectedEntity | null
  selectedMilestone: DashboardMilestone | null
  selectedMilestoneBar: TimelineMilestoneBar | null
  onClose: () => void
  onSubmitCreateMilestone: (values: MilestoneFormValues) => Promise<void>
  onSubmitCreateProject: (values: ProjectFormValues) => Promise<void>
  onSubmitUpdateMilestone: (values: MilestoneFormValues) => Promise<void>
  onSubmitUpdateProject: (values: ProjectFormValues) => Promise<void>
}) {
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    values: {
      name: project?.name ?? '',
      keys: project?.keys ?? '',
      description: project?.description ?? '',
      members: project?.members ?? '',
      labels: project?.labels ?? '',
    },
  })
  const milestoneForm = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    values: {
      projectId:
        selectedEntity?.type === 'package'
          ? selectedEntity.projectId
          : (selectedEntity?.projectId ?? projectOptions[0]?.id ?? 0),
      name: selectedMilestone?.name ?? '',
      description: selectedMilestone?.description ?? '',
      start_date: selectedMilestone?.start_date ?? '',
      end_date: selectedMilestone?.end_date ?? '',
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

  const milestoneViewRef = useRef<HTMLDivElement | null>(null)
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | null>(null)

  if (!isOpen) return null

  const isMilestoneView =
    inspectorMode === 'view-package' && Boolean(selectedMilestone)
  const selectedMilestoneProjectName = selectedMilestone
    ? (projectOptions.find(
        (item) => item.id === selectedMilestone.bug_tracker_project,
      )?.name ?? '')
    : ''

  async function handleExportMilestoneView(format: 'png' | 'pdf') {
    const node = milestoneViewRef.current
    if (!node || exportFormat || !selectedMilestone) return

    setExportFormat(format)

    try {
      await document.fonts?.ready

      const snapshot = await captureTimelineExportSnapshot(node)
      const fileName = buildTimelineItemExportFileName(
        selectedMilestoneProjectName,
        selectedMilestone.name,
      )

      if (format === 'png') {
        downloadDataUrl(snapshot.dataUrl, `${fileName}.png`)
      } else {
        const pdf = new jsPDF({
          format: [snapshot.width, snapshot.height],
          orientation:
            snapshot.width > snapshot.height ? 'landscape' : 'portrait',
          unit: 'px',
        })

        pdf.addImage(
          snapshot.dataUrl,
          'PNG',
          0,
          0,
          snapshot.width,
          snapshot.height,
        )
        pdf.save(`${fileName}.pdf`)
      }

      toast.success(format === 'png' ? 'Image downloaded.' : 'PDF downloaded.')
    } catch {
      toast.error('Failed to export package view.')
    } finally {
      setExportFormat(null)
    }
  }

  return (
    <TimelineDrawerShell
      actions={
        isMilestoneView ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="ops-package-export-trigger rounded-md"
                disabled={exportFormat !== null}
                size="sm"
                variant="outline"
              >
                <Download className="size-4" />
                {exportFormat === null ? 'Export view' : 'Exporting...'}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="ops-bug-chart-menu-content w-44"
            >
              <DropdownMenuLabel>Milestone view</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="ops-bug-chart-menu-item"
                disabled={exportFormat !== null}
                onSelect={() => {
                  void handleExportMilestoneView('png')
                }}
              >
                <FileImage className="size-4" />
                Image (.png)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="ops-bug-chart-menu-item"
                disabled={exportFormat !== null}
                onSelect={() => {
                  void handleExportMilestoneView('pdf')
                }}
              >
                <FileText className="size-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null
      }
      eyebrow={getInspectorEyebrow(inspectorMode)}
      isOpen={isOpen}
      isWide={isMilestoneView}
      onClose={onClose}
      title={
        inspectorMode === 'view-package' && selectedMilestone
          ? formatTimelineItemInspectorTitle({
              projectName: selectedMilestoneProjectName,
              itemName: selectedMilestone.name,
              startDate: selectedMilestone.start_date,
              endDate: selectedMilestone.end_date,
            })
          : getTimelineInspectorTitle({
              mode: inspectorMode,
              projectName: project?.name ?? null,
              itemName: selectedMilestone?.name ?? null,
              itemLabel: 'milestone',
              itemTitle: 'Milestone',
            })
      }
    >
      {inspectorMode === 'view-project' && project ? (
        <ProjectViewPanel project={project} />
      ) : null}
      {inspectorMode === 'view-package' &&
      selectedMilestone &&
      selectedMilestoneBar ? (
        <MilestoneDetailPanel
          key={selectedMilestone.id}
          contentRef={milestoneViewRef}
          packageItem={selectedMilestone}
          packageBar={selectedMilestoneBar}
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
        <MilestoneFormPanel
          allowProjectChange
          form={milestoneForm}
          isPending={milestoneMutationState.create.isPending}
          projects={projectOptions}
          submitLabel="Create milestone"
          onCancel={onClose}
          onSubmit={onSubmitCreateMilestone}
        />
      ) : null}
      {inspectorMode === 'edit-package' && selectedMilestone ? (
        <MilestoneFormPanel
          allowProjectChange={false}
          form={milestoneForm}
          isPending={milestoneMutationState.update.isPending}
          projects={projectOptions}
          submitLabel="Save"
          onCancel={onClose}
          onSubmit={onSubmitUpdateMilestone}
        />
      ) : null}
      {(inspectorMode === 'edit-package' && !selectedMilestone) ||
      (inspectorMode === 'edit-project' && !project) ||
      (inspectorMode === 'view-package' && !selectedMilestone) ||
      (inspectorMode === 'view-project' && !project) ? (
        <div className="p-4">
          <div className="ops-detail-empty rounded-md px-4 py-6 text-sm">
            Item not available.
          </div>
        </div>
      ) : null}
    </TimelineDrawerShell>
  )
}

function ProjectViewPanel({ project }: { project: DashboardProject }) {
  return (
    <div className="p-4">
      <div className="grid gap-4">
        <Field label="Name">
          <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
            {project.name}
          </div>
        </Field>
        <Field label="Keys">
          <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
            {project.keys || '-'}
          </div>
        </Field>
        <Field label="Description">
          <div className="ops-bug-view-field min-h-20 rounded-md px-3 py-2.5 text-sm font-medium whitespace-pre-wrap">
            {project.description || '-'}
          </div>
        </Field>
        <Field label="Members">
          <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
            {project.members || '-'}
          </div>
        </Field>
        <Field label="Labels">
          <div className="ops-bug-view-field rounded-md px-3 py-2.5 text-sm font-medium">
            {project.labels || '-'}
          </div>
        </Field>
      </div>
    </div>
  )
}

function MilestoneDetailPanel({
  contentRef,
  packageBar,
  packageItem,
}: {
  contentRef: React.RefObject<HTMLDivElement | null>
  packageBar: TimelineMilestoneBar
  packageItem: DashboardMilestone
}) {
  const openBugCount = packageBar.totalBug - packageBar.resolvedBug
  const memberNames = parseCommaList(packageItem.members)
  const sprintStatisticsQuery = useMilestoneSprintStatisticsQuery(
    packageItem.id,
  )

  return (
    <div className="p-4">
      <div ref={contentRef} className="grid gap-5">
        {packageBar.isSyncing ? (
          <div className="flex items-center gap-2 rounded-md border border-[color:var(--status-info)]/18 bg-[color:var(--status-info)]/6 px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <TimelineSyncStatusPill compact />
            <span>Jira sync in progress.</span>
          </div>
        ) : null}

        <section className="grid gap-4">
          <MilestoneStatusSummary
            openCount={openBugCount}
            resolvedCount={packageBar.resolvedBug}
            openLabel="Open"
            resolvedLabel="Closed"
          />

          <div>
            <MilestoneMemberStatusSummary
              issues={packageItem.issues}
              members={memberNames}
              mode="assignee"
            />
          </div>
        </section>

        <section className="grid gap-3 xl:grid-cols-2">
          <MilestoneStatusAnalysisSection issues={packageItem.issues} />
          <MilestoneSprintDeliverySection
            isError={sprintStatisticsQuery.isError}
            isPending={sprintStatisticsQuery.isPending}
            statistics={sprintStatisticsQuery.data ?? []}
          />
        </section>

        <section className="grid gap-3">
          <MilestoneIssuesTable
            issues={packageItem.issues}
            members={memberNames}
            showPartnerColumn={false}
          />
        </section>
      </div>
    </div>
  )
}

function MilestoneSprintDeliverySection({
  isPending,
  isError,
  statistics,
}: {
  isPending: boolean
  isError: boolean
  statistics: DashboardMilestoneSprintStatistic[]
}) {
  if (isPending) {
    return <LoadingPanel title="Loading sprint delivery" lines={4} />
  }

  if (isError) {
    return (
      <div className="ops-bug-panel rounded-lg px-4 py-5 text-sm text-[var(--status-danger)]">
        Failed to load sprint delivery data.
      </div>
    )
  }

  const chartData = buildMilestoneSprintChartData(statistics)

  if (!chartData.length) {
    return (
      <div className="ops-bug-panel rounded-lg px-4 py-10 text-sm text-[var(--muted-foreground)]">
        No sprint delivery data.
      </div>
    )
  }

  const latestSprint = chartData.at(-1)
  const completionRate = latestSprint
    ? latestSprint.scopePoint > 0
      ? Math.round(
          (latestSprint.completedPoint / latestSprint.scopePoint) * 100,
        )
      : 0
    : 0

  return (
    <article className="ops-package-sprint-card ops-bug-chart-shell grid gap-2 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold tracking-[-0.02em]">
            Milestone Delivery
          </h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Completed versus remaining scope by sprint.
          </p>
        </div>
        <Badge
          variant="outline"
          className="rounded-full px-2.5 py-0.5 text-[11px]"
        >
          {completionRate}% latest
        </Badge>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 24, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => truncateChartAxisLabel(String(value))}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              width={42}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              cursor={{
                fill: 'color-mix(in srgb, var(--primary) 6%, transparent)',
              }}
              content={({ active, payload }) => (
                <MilestoneSprintTooltip active={active} payload={payload} />
              )}
            />
            <Bar
              dataKey="completedPoint"
              stackId="flow"
              fill="#0c66e4"
              radius={[0, 0, 0, 0]}
              maxBarSize={26}
              name="Completed"
            />
            <Bar
              dataKey="remainingPoint"
              stackId="flow"
              fill="#c8d7f0"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
              name="Remaining"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 px-1 text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#0c66e4]" />
          <span>Completed points</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#c8d7f0]" />
          <span>Remaining points</span>
        </div>
      </div>
    </article>
  )
}

const MILESTONE_STATUS_STEPS = [
  { label: 'Screen', color: '#8e7ea8', aliases: ['screen', 'open'] },
  { label: 'Analysis', color: '#6f86b0', aliases: ['analysis'] },
  {
    label: 'Implementation',
    color: '#7da0c9',
    aliases: ['implementation', 'in progress'],
  },
  { label: 'Integration', color: '#d98b82', aliases: ['integration'] },
  { label: 'Build', color: '#d7a0bb', aliases: ['build'] },
  { label: 'Verify', color: '#e1be68', aliases: ['verify', 'verified'] },
  { label: 'Closed', color: '#8faa58', aliases: ['closed'] },
] as const

function MilestoneStatusAnalysisSection({
  issues,
}: {
  issues: DashboardMilestone['issues']
}) {
  const rawChartData = buildMilestoneStatusChartData(issues)
  const total = rawChartData.reduce((sum, item) => sum + item.value, 0)
  const completeCount = rawChartData
    .filter((item) => item.isComplete)
    .reduce((sum, item) => sum + item.value, 0)
  const completionRate =
    total > 0 ? Math.round((completeCount / total) * 100) : 0
  const chartData = buildMilestoneStatusLegendData(rawChartData)
  const visibleChartData = total
    ? chartData.filter((item) => item.value > 0)
    : [
        {
          id: 'empty',
          label: 'No issues',
          value: 1,
          color: 'color-mix(in srgb, var(--border) 70%, transparent)',
          isComplete: false,
        },
      ]

  return (
    <article className="ops-package-sprint-card ops-bug-chart-shell grid h-full gap-4 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold tracking-[-0.02em]">
            Status Analysis
          </h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Distribution of issues by workflow status.
          </p>
        </div>
        <Badge
          variant="outline"
          className="rounded-full px-2.5 py-0.5 text-[11px]"
        >
          {completionRate}% complete
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleChartData}
                  dataKey="value"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={visibleChartData.length > 1 ? 2 : 0}
                  stroke="color-mix(in srgb, var(--workspace-pane) 92%, white 8%)"
                  strokeWidth={2}
                >
                  {visibleChartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<MilestoneStatusAnalysisTooltip total={total} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-2 self-start">
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
    </article>
  )
}

function MilestoneStatusAnalysisTooltip({
  active,
  payload,
  total = 0,
}: {
  active?: boolean
  payload?: Array<{
    payload: {
      label: string
      value: number
      isComplete: boolean
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
        {item.value} issues
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
      ) : (
        <div className="mt-1 text-[var(--muted-foreground)]">
          {item.isComplete ? 'Counts toward completion' : 'In progress'}
        </div>
      )}
    </div>
  )
}

function MilestoneSprintTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{
    payload?: {
      label: string
      completedPoint: number
      scopePoint: number
      startDate: string
      endDate: string
    }
  }>
}) {
  const datum = payload?.[0]?.payload

  if (!active || !datum) return null

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[var(--workspace-pane)] px-3 py-2 text-xs shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      <p className="font-semibold text-[var(--foreground)]">{datum.label}</p>
      <div className="mt-2 grid gap-1.5">
        <TooltipMetricRow
          label="Completed"
          value={formatCompactMetric(datum.completedPoint)}
        />
        <TooltipMetricRow
          label="Scoped"
          value={formatCompactMetric(datum.scopePoint)}
        />
        <TooltipMetricRow
          label="Remaining"
          value={formatCompactMetric(
            Math.max(datum.scopePoint - datum.completedPoint, 0),
          )}
        />
        <TooltipMetricRow
          label="Duration"
          value={`${formatDateLabel(datum.startDate)} - ${formatDateLabel(datum.endDate)}`}
        />
      </div>
    </div>
  )
}

function TooltipMetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-medium text-[var(--foreground)]">{value}</span>
    </div>
  )
}

function buildMilestoneStatusLegendData(
  chartData: Array<{
    id: string
    label: string
    value: number
    color: string
    isComplete: boolean
  }>,
) {
  const nonZeroData = chartData.filter((item) => item.value > 0)

  if (nonZeroData.length <= 4) {
    return nonZeroData
  }

  const sortedData = [...nonZeroData].sort((left, right) => {
    if (right.value !== left.value) return right.value - left.value
    return left.label.localeCompare(right.label)
  })
  const primaryItems = sortedData.slice(0, 4)
  const remainingItems = sortedData.slice(4)
  const otherValue = remainingItems.reduce((sum, item) => sum + item.value, 0)

  return [
    ...primaryItems,
    {
      id: 'other',
      label: 'Other',
      value: otherValue,
      color: '#7a869a',
      isComplete: false,
      breakdown: remainingItems.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    },
  ]
}

function buildMilestoneStatusChartData(issues: DashboardMilestone['issues']) {
  const counts = new Map<string, number>()

  for (const step of MILESTONE_STATUS_STEPS) {
    counts.set(step.label, 0)
  }

  for (const issue of issues) {
    const normalizedStatus = issue.status.trim().toLowerCase()
    const matchedStep = MILESTONE_STATUS_STEPS.find((step) =>
      step.aliases.some((alias) => alias === normalizedStatus),
    )

    if (!matchedStep) {
      continue
    }

    counts.set(matchedStep.label, (counts.get(matchedStep.label) ?? 0) + 1)
  }

  return MILESTONE_STATUS_STEPS.map((step) => ({
    id: step.label.toLowerCase(),
    label: step.label,
    value: counts.get(step.label) ?? 0,
    color: step.color,
    isComplete: step.label === 'Verify' || step.label === 'Closed',
  }))
}

function buildMilestoneSprintChartData(
  statistics: DashboardMilestoneSprintStatistic[],
) {
  return [...statistics]
    .sort(
      (left, right) =>
        new Date(left.sprint.start_date).getTime() -
          new Date(right.sprint.start_date).getTime() ||
        new Date(left.created_at).getTime() -
          new Date(right.created_at).getTime(),
    )
    .map((item) => ({
      id: item.id,
      label: item.sprint.name,
      completedPoint: item.completed_point,
      scopePoint: item.scope_point,
      remainingPoint: Math.max(item.scope_point - item.completed_point, 0),
      startDate: item.sprint.start_date,
      endDate: item.sprint.end_date,
    }))
}

function formatCompactMetric(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
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
        <Field label="Keys" error={form.formState.errors.keys?.message}>
          <Input
            className="ops-workspace-input h-10 rounded-md"
            {...form.register('keys')}
          />
        </Field>
        <Field
          label="Description"
          error={form.formState.errors.description?.message}
        >
          <Textarea
            className="ops-workspace-input min-h-24 rounded-md"
            {...form.register('description')}
          />
        </Field>
        <Field label="Members" error={form.formState.errors.members?.message}>
          <Input
            className="ops-workspace-input h-10 rounded-md"
            {...form.register('members')}
          />
        </Field>
        <Field label="Labels" error={form.formState.errors.labels?.message}>
          <Input
            className="ops-workspace-input h-10 rounded-md"
            {...form.register('labels')}
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

function MilestoneFormPanel({
  allowProjectChange,
  form,
  isPending,
  projects,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  allowProjectChange: boolean
  form: UseFormReturn<MilestoneFormValues>
  isPending: boolean
  projects: DashboardProject[]
  submitLabel: string
  onCancel: () => void
  onSubmit: (values: MilestoneFormValues) => Promise<void>
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
        <Field
          label="Description"
          error={form.formState.errors.description?.message}
        >
          <Textarea
            className="ops-workspace-input min-h-24 rounded-md"
            {...form.register('description')}
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
        <FormActions
          isPending={isPending}
          submitLabel={submitLabel}
          onCancel={onCancel}
        />
      </div>
    </form>
  )
}

function MilestoneTimelineLoadingState() {
  return <TimelineWorkspaceLoading />
}

function MilestoneTimelineErrorState() {
  return (
    <div className="flex flex-1 items-center px-4 py-4 lg:px-5">
      <div className="w-full rounded-md border border-[color:var(--status-danger)]/25 bg-[color:var(--status-danger)]/8 px-4 py-10 text-sm text-[var(--status-danger)]">
        Failed to load timeline.
      </div>
    </div>
  )
}

function toMilestonePayload(values: MilestoneFormValues) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    start_date: values.start_date,
    end_date: values.end_date,
    bug_tracker_project: values.projectId,
  }
}

function toProjectPayload(values: ProjectFormValues, currentUserId: number) {
  return {
    name: values.name.trim(),
    keys: values.keys.trim(),
    description: values.description.trim(),
    members: values.members.trim(),
    labels: values.labels.trim(),
    pm: currentUserId,
    pl: currentUserId,
  }
}
