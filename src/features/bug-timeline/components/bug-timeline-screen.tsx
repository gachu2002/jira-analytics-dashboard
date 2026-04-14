import { zodResolver } from '@hookform/resolvers/zod'
import jsPDF from 'jspdf'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Bug,
  ChevronDown,
  Download,
  FileImage,
  FileText,
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
import { WorkspaceSelect } from '@/components/common/workspace-select'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useCustomJqlBugStatisticsQuery,
  useCustomJqlPackageQuery,
  useCustomJqlSprintStatisticsQuery,
  usePackageBugStatisticsQuery,
  usePackageSprintStatisticsQuery,
} from '@/features/bug-timeline/api/bug-timeline.queries'
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
  BugTimelineInspectorMode,
  BugTimelineSelectedEntity,
  BugTrackerPackage,
  BugTrackerPackagePayload,
  BugTrackerProject,
  BugTrackerProjectPayload,
  PackageBugStatistic,
  PackageSprintStatistic,
  TimelinePackageBar,
} from '@/features/bug-timeline/types/bug-timeline.types'
import {
  TimelineDateField as DateField,
  TimelineDeleteDialog as DeleteDialog,
  TimelineField as Field,
  TimelineFormActions as FormActions,
  TimelineIssuesTable as PackageIssuesTable,
  TimelineMemberStatusSummary as PackageMemberStatusSummary,
  TimelineSyncStatusPill,
  TimelineStatusSummary as PackageStatusSummary,
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
const BUG_CATEGORY_COLORS = [
  '#0c66e4',
  '#c9372c',
  '#8f7ee7',
  '#22a06b',
  '#e56910',
  '#00a3bf',
  '#ae4787',
  '#f5a524',
  '#5e4db2',
  '#216e4e',
  '#b65c02',
  '#7f5f01',
  '#943d73',
  '#44546f',
  '#388bff',
  '#36b37e',
  '#8777d9',
]

export function BugTimelineScreen() {
  const { projects, packages, viewModel, isPending, isError } =
    useBugTimelineQuery()
  const search = useBugTimelineUiStore((state) => state.search)
  const setSearch = useBugTimelineUiStore((state) => state.setSearch)
  const zoom = useBugTimelineUiStore((state) => state.zoom)
  const setZoom = useBugTimelineUiStore((state) => state.setZoom)
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
  const [isCustomJqlOpen, setIsCustomJqlOpen] = useState(false)

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
    setIsCustomJqlOpen(false)
    setSelectedEntity({ type: 'project', projectId })
    setInspectorMode('view-project')
  }

  const handleSelectPackage = (projectId: number, packageId: number) => {
    setIsCustomJqlOpen(false)
    setSelectedEntity({ type: 'package', projectId, packageId })
    setInspectorMode('view-package')
  }

  const handleCreateProject = () => {
    setIsCustomJqlOpen(false)
    openCreateProject()
  }

  const handleCreatePackage = (projectId?: number) => {
    setIsCustomJqlOpen(false)
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
    <section className="ops-bug-shell ops-workspace-screen flex h-full min-h-0 min-w-0 flex-1 flex-col">
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
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h1 className="text-base font-semibold tracking-[-0.02em]">
                        Packages
                      </h1>
                      <div className="ops-bug-summary-stats">
                        <span className="ops-bug-stat">
                          {viewModel.totals.projects} projects
                        </span>
                        <span className="ops-bug-stat">
                          {viewModel.totals.packages} packages
                        </span>
                        <span className="ops-bug-stat ops-bug-stat-strong">
                          {viewModel.totals.resolved}/{viewModel.totals.bugs}{' '}
                          resolved
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ops-bug-toolbar-actions ml-auto flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleCloseDrawer()
                        setIsCustomJqlOpen(true)
                      }}
                    >
                      <Bug className="size-4" />
                      Custom JQL
                    </Button>
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
                  <div className="ops-bug-filter-group w-full max-w-[18rem] min-w-[12rem]">
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
                        itemCountLabel="packages"
                        labelColumnWidth={labelColumnWidth}
                        menuItems={[
                          {
                            label: 'View',
                            icon: <Bug className="size-3.5" />,
                            onSelect: () => openProjectView(project.id),
                          },
                          {
                            label: 'Add package',
                            icon: <FolderPlus className="size-3.5" />,
                            onSelect: () => handleCreatePackage(project.id),
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
                        progressLabel="resolved"
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
                                icon: <Bug className="size-3.5" />,
                                onSelect: () =>
                                  handleSelectPackage(item.projectId, item.id),
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
                              handleSelectPackage(item.projectId, item.id)
                            }
                            progressLabel="resolved"
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
              onOpenEditPackage={() => {
                if (selectedEntity?.type !== 'package') return
                openEditPackage(
                  selectedEntity.projectId,
                  selectedEntity.packageId,
                )
              }}
              onOpenEditProject={() => {
                if (!selectedProject) return
                openEditProject(selectedProject.id)
              }}
              onClose={handleCloseDrawer}
              onSubmitCreatePackage={async (values: PackageFormValues) => {
                try {
                  const created = await createPackage.mutateAsync({
                    payload: toPackagePayload(values),
                  })

                  if (created.task_id) {
                    handleCloseDrawer()
                    toast.success('Package syncing with Jira')
                    return
                  }

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
              onSubmitUpdatePackage={async (
                payload: Partial<BugTrackerPackagePayload>,
              ) => {
                if (!selectedEntity || selectedEntity.type !== 'package') return

                if (!Object.keys(payload).length) {
                  handleSelectPackage(
                    selectedEntity.projectId,
                    selectedEntity.packageId,
                  )
                  return
                }

                try {
                  const updated = await updatePackage.mutateAsync({
                    packageId: selectedEntity.packageId,
                    payload,
                  })

                  if (hasSyncingPackageChanges(payload) && updated.task_id) {
                    handleCloseDrawer()
                    toast.success('Package syncing with Jira')
                    return
                  }

                  handleSelectPackage(
                    selectedEntity.projectId,
                    selectedEntity.packageId,
                  )
                  toast.success('Package updated')
                } catch {
                  toast.error('Update failed')
                }
              }}
              onSubmitUpdateProject={async (
                payload: Partial<BugTrackerProjectPayload>,
              ) => {
                if (!selectedProject) return

                if (!Object.keys(payload).length) {
                  openProjectView(selectedProject.id)
                  return
                }

                try {
                  await updateProject.mutateAsync({
                    projectId: selectedProject.id,
                    payload,
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

            <CustomJqlDrawer
              initialEndDate={effectiveToDate}
              initialStartDate={effectiveFromDate}
              isOpen={isCustomJqlOpen}
              onClose={() => setIsCustomJqlOpen(false)}
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
  packageMutationState,
  packageOptions,
  project,
  projectMutationState,
  selectedEntity,
  selectedPackage,
  selectedPackageBar,
  onOpenEditPackage,
  onOpenEditProject,
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
  onOpenEditPackage: () => void
  onOpenEditProject: () => void
  onClose: () => void
  onSubmitCreatePackage: (values: PackageFormValues) => Promise<void>
  onSubmitCreateProject: (values: ProjectFormValues) => Promise<void>
  onSubmitUpdatePackage: (
    payload: Partial<BugTrackerPackagePayload>,
  ) => Promise<void>
  onSubmitUpdateProject: (
    payload: Partial<BugTrackerProjectPayload>,
  ) => Promise<void>
}) {
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { name: project?.name ?? '' },
  })
  const packageForm = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: buildPackageFormValues(
      selectedEntity,
      selectedPackage,
      packageOptions,
    ),
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

  useEffect(() => {
    if (
      !isOpen ||
      (inspectorMode !== 'create-project' && inspectorMode !== 'edit-project')
    ) {
      return
    }

    projectForm.reset({ name: project?.name ?? '' })
    projectForm.clearErrors()
  }, [inspectorMode, isOpen, project, projectForm])

  useEffect(() => {
    if (
      !isOpen ||
      (inspectorMode !== 'create-package' && inspectorMode !== 'edit-package')
    ) {
      return
    }

    packageForm.reset(
      buildPackageFormValues(selectedEntity, selectedPackage, packageOptions),
    )
    packageForm.clearErrors()
  }, [
    inspectorMode,
    isOpen,
    packageForm,
    packageOptions,
    selectedEntity,
    selectedPackage,
  ])

  const packageViewRef = useRef<HTMLDivElement | null>(null)
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | null>(null)

  if (!isOpen) return null

  const isPackageView =
    inspectorMode === 'view-package' && Boolean(selectedPackage)
  const selectedPackageProjectName = selectedPackage
    ? (packageOptions.find(
        (item) => item.id === selectedPackage.bug_tracker_project,
      )?.name ?? '')
    : ''

  async function handleExportPackageView(format: 'png' | 'pdf') {
    const node = packageViewRef.current
    if (!node || exportFormat || !selectedPackage) return

    setExportFormat(format)

    try {
      await document.fonts?.ready

      const snapshot = await captureTimelineExportSnapshot(node)
      const fileName = buildTimelineItemExportFileName(
        selectedPackageProjectName,
        selectedPackage.name,
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
        <>
          {inspectorMode === 'view-package' && selectedPackage ? (
            <Button size="sm" variant="outline" onClick={onOpenEditPackage}>
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : inspectorMode === 'view-project' && project ? (
            <Button size="sm" variant="outline" onClick={onOpenEditProject}>
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : null}
          {isPackageView ? (
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
                <DropdownMenuLabel>Package view</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="ops-bug-chart-menu-item"
                  disabled={exportFormat !== null}
                  onSelect={() => {
                    void handleExportPackageView('png')
                  }}
                >
                  <FileImage className="size-4" />
                  Image (.png)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="ops-bug-chart-menu-item"
                  disabled={exportFormat !== null}
                  onSelect={() => {
                    void handleExportPackageView('pdf')
                  }}
                >
                  <FileText className="size-4" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </>
      }
      eyebrow={getInspectorEyebrow(inspectorMode)}
      isOpen={isOpen}
      isWide={isPackageView}
      onClose={onClose}
      title={
        inspectorMode === 'view-package' && selectedPackage
          ? formatTimelineItemInspectorTitle({
              projectName: selectedPackageProjectName,
              itemName: selectedPackage.name,
              startDate: selectedPackage.start_date,
              endDate: selectedPackage.end_date,
            })
          : getTimelineInspectorTitle({
              mode: inspectorMode,
              projectName: project?.name ?? null,
              itemName: selectedPackage?.name ?? null,
              itemLabel: 'package',
              itemTitle: 'Package',
            })
      }
    >
      {inspectorMode === 'view-project' && project ? (
        <ProjectViewPanel project={project} />
      ) : null}
      {inspectorMode === 'view-package' &&
      selectedPackage &&
      selectedPackageBar ? (
        <PackageDetailPanel
          key={selectedPackage.id}
          contentRef={packageViewRef}
          packageItem={selectedPackage}
          packageBar={selectedPackageBar}
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
          onSubmit={() =>
            onSubmitUpdateProject(
              toProjectPatchPayload(
                projectForm.getValues(),
                projectForm.formState.dirtyFields,
              ),
            )
          }
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
          onSubmit={() =>
            onSubmitUpdatePackage(
              toPackagePatchPayload(
                packageForm.getValues(),
                packageForm.formState.dirtyFields,
              ),
            )
          }
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
    </TimelineDrawerShell>
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
  contentRef,
  packageBar,
  packageItem,
}: {
  contentRef: React.RefObject<HTMLDivElement | null>
  packageBar: TimelinePackageBar
  packageItem: BugTrackerPackage
}) {
  const openBugCount = packageBar.totalBug - packageBar.resolvedBug
  const statisticsQuery = usePackageBugStatisticsQuery(packageItem.id, true)
  const sprintStatisticsQuery = usePackageSprintStatisticsQuery(
    packageItem.id,
    true,
  )

  return (
    <BugDetailContent
      bugStatistics={statisticsQuery.data ?? []}
      bugStatisticsError={statisticsQuery.isError}
      bugStatisticsPending={statisticsQuery.isPending}
      contentRef={contentRef}
      issues={packageItem.issues}
      notice={
        packageBar.isSyncing ? (
          <div className="flex items-center gap-2 rounded-md border border-[color:var(--status-info)]/18 bg-[color:var(--status-info)]/6 px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <TimelineSyncStatusPill compact />
            <span>Jira sync in progress.</span>
          </div>
        ) : null
      }
      openCount={openBugCount}
      resolvedCount={packageBar.resolvedBug}
      sprintStatistics={sprintStatisticsQuery.data ?? []}
      sprintStatisticsError={sprintStatisticsQuery.isError}
      sprintStatisticsPending={sprintStatisticsQuery.isPending}
      note={packageItem.note}
    />
  )
}

function CustomJqlDrawer({
  initialEndDate,
  initialStartDate,
  isOpen,
  onClose,
}: {
  initialEndDate: string
  initialStartDate: string
  isOpen: boolean
  onClose: () => void
}) {
  const [projectKeysInput, setProjectKeysInput] = useState('')
  const [labelsInput, setLabelsInput] = useState('')
  const [assigneesInput, setAssigneesInput] = useState('')
  const [startDateInput, setStartDateInput] = useState(initialStartDate)
  const [endDateInput, setEndDateInput] = useState(initialEndDate)
  const [isEditingRawJql, setIsEditingRawJql] = useState(false)
  const [jqlInput, setJqlInput] = useState(() =>
    buildCustomBugJql({
      assignees: '',
      endDate: initialEndDate,
      labels: '',
      projectKeys: '',
      startDate: initialStartDate,
    }),
  )
  const [submittedJql, setSubmittedJql] = useState('')
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const customPackageQuery = useCustomJqlPackageQuery(submittedJql, isOpen)
  const customBugStatisticsQuery = useCustomJqlBugStatisticsQuery(
    submittedJql,
    isOpen,
  )
  const customSprintStatisticsQuery = useCustomJqlSprintStatisticsQuery(
    submittedJql,
    isOpen,
  )
  const generatedJql = useMemo(
    () =>
      buildCustomBugJql({
        assignees: assigneesInput,
        endDate: endDateInput,
        labels: labelsInput,
        projectKeys: projectKeysInput,
        startDate: startDateInput,
      }),
    [
      assigneesInput,
      endDateInput,
      labelsInput,
      projectKeysInput,
      startDateInput,
    ],
  )

  useEffect(() => {
    if (!isOpen) return

    setStartDateInput(initialStartDate)
    setEndDateInput(initialEndDate)
  }, [initialEndDate, initialStartDate, isOpen])

  useEffect(() => {
    if (isEditingRawJql) return
    setJqlInput(generatedJql)
  }, [generatedJql, isEditingRawJql])

  if (!isOpen) return null

  const customPackage = customPackageQuery.data ?? null

  async function handleExportCustomJqlView(format: 'png' | 'pdf') {
    const node = contentRef.current
    if (!node || exportFormat || !customPackage) return

    setExportFormat(format)

    try {
      await document.fonts?.ready

      const snapshot = await captureTimelineExportSnapshot(node)
      const fileName = buildTimelineItemExportFileName('custom-jql', 'bug-view')

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
      toast.error('Failed to export custom view.')
    } finally {
      setExportFormat(null)
    }
  }

  function handleLoadCustomJql() {
    const nextJql = jqlInput.trim()

    if (!nextJql) {
      toast.error('Enter a JQL query.')
      return
    }

    if (nextJql === submittedJql) {
      void Promise.all([
        customPackageQuery.refetch(),
        customBugStatisticsQuery.refetch(),
        customSprintStatisticsQuery.refetch(),
      ])
      return
    }

    setSubmittedJql(nextJql)
  }

  function handleResetGeneratedJql() {
    setIsEditingRawJql(false)
    setJqlInput(generatedJql)
  }

  return (
    <TimelineDrawerShell
      actions={
        customPackage ? (
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
              <DropdownMenuLabel>Custom view</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="ops-bug-chart-menu-item"
                disabled={exportFormat !== null}
                onSelect={() => {
                  void handleExportCustomJqlView('png')
                }}
              >
                <FileImage className="size-4" />
                Image (.png)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="ops-bug-chart-menu-item"
                disabled={exportFormat !== null}
                onSelect={() => {
                  void handleExportCustomJqlView('pdf')
                }}
              >
                <FileText className="size-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null
      }
      eyebrow="Custom query"
      isOpen={isOpen}
      isWide
      onClose={onClose}
      title="Custom JQL"
    >
      <div className="grid gap-4 p-4">
        <div className="ops-jql-builder-shell grid gap-3 rounded-lg p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.4fr)]">
            <Field label="Project keys">
              <Input
                className="ops-workspace-input h-10 rounded-md"
                placeholder="qeventth, qeventsit"
                value={projectKeysInput}
                onChange={(event) => setProjectKeysInput(event.target.value)}
              />
            </Field>
            <Field label="Labels">
              <Input
                className="ops-workspace-input h-10 rounded-md"
                placeholder="fpt.flutter.home"
                value={labelsInput}
                onChange={(event) => setLabelsInput(event.target.value)}
              />
            </Field>
            <Field label="Assignees">
              <Input
                className="ops-workspace-input h-10 rounded-md"
                placeholder="thehoang.nguyen, phu.nguyenhoc, linh.nguyengia"
                value={assigneesInput}
                onChange={(event) => setAssigneesInput(event.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
            <Field label="Start">
              <Input
                className="ops-workspace-input h-10 rounded-md"
                type="date"
                value={startDateInput}
                onChange={(event) => setStartDateInput(event.target.value)}
              />
            </Field>
            <Field label="End">
              <Input
                className="ops-workspace-input h-10 rounded-md"
                type="date"
                value={endDateInput}
                onChange={(event) => setEndDateInput(event.target.value)}
              />
            </Field>
            <div className="flex gap-2 lg:justify-end">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  if (isEditingRawJql) {
                    handleResetGeneratedJql()
                    return
                  }

                  setIsEditingRawJql(true)
                  setJqlInput(generatedJql)
                }}
              >
                {isEditingRawJql ? 'Use generated' : 'Edit JQL'}
              </Button>
              <Button size="sm" type="button" onClick={handleLoadCustomJql}>
                Load
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <span className="ops-bug-toolbar-label">JQL</span>
            {isEditingRawJql ? (
              <Textarea
                className="ops-workspace-input min-h-28 rounded-md font-mono text-xs"
                value={jqlInput}
                onChange={(event) => setJqlInput(event.target.value)}
              />
            ) : (
              <div className="ops-bug-jql ops-jql-preview rounded-lg px-3 py-3 text-xs break-all">
                {jqlInput || 'Add filters to generate the query.'}
              </div>
            )}
          </div>
        </div>

        {!submittedJql ? (
          <div className="ops-detail-empty rounded-md px-4 py-8 text-sm">
            Build a query to load a custom bug view.
          </div>
        ) : customPackageQuery.isPending ? (
          <LoadingPanel title="Loading custom query" />
        ) : customPackageQuery.isError || !customPackage ? (
          <div className="ops-detail-empty rounded-md px-4 py-8 text-sm text-[var(--status-danger)]">
            Failed to load custom query data.
          </div>
        ) : (
          <BugDetailContent
            bugStatistics={customBugStatisticsQuery.data ?? []}
            bugStatisticsError={customBugStatisticsQuery.isError}
            bugStatisticsPending={customBugStatisticsQuery.isPending}
            contentRef={contentRef}
            issues={customPackage.issues}
            openCount={Math.max(
              customPackage.total_bug - customPackage.resolved_bug,
              0,
            )}
            resolvedCount={customPackage.resolved_bug}
            sprintStatistics={customSprintStatisticsQuery.data ?? []}
            sprintStatisticsError={customSprintStatisticsQuery.isError}
            sprintStatisticsPending={customSprintStatisticsQuery.isPending}
          />
        )}
      </div>
    </TimelineDrawerShell>
  )
}

function BugDetailContent({
  bugStatistics,
  bugStatisticsError,
  bugStatisticsPending,
  contentRef,
  issues,
  notice,
  note,
  openCount,
  resolvedCount,
  sprintStatistics,
  sprintStatisticsError,
  sprintStatisticsPending,
}: {
  bugStatistics: PackageBugStatistic[]
  bugStatisticsError: boolean
  bugStatisticsPending: boolean
  contentRef: React.RefObject<HTMLDivElement | null>
  issues: BugTrackerPackage['issues']
  notice?: React.ReactNode
  note?: string
  openCount: number
  resolvedCount: number
  sprintStatistics: PackageSprintStatistic[]
  sprintStatisticsError: boolean
  sprintStatisticsPending: boolean
}) {
  const [optionalCharts, setOptionalCharts] = useState<
    Array<'velocity' | 'reopen'>
  >([])

  return (
    <div className="p-4">
      <div ref={contentRef} className="grid gap-5">
        {notice ?? null}

        <section className="grid gap-3">
          <Field label="Note">
            <div className="ops-bug-view-field min-h-20 rounded-md px-3 py-2.5 text-sm whitespace-pre-wrap">
              {note || '-'}
            </div>
          </Field>
        </section>

        <section className="grid gap-4">
          <PackageStatusSummary
            openCount={openCount}
            resolvedCount={resolvedCount}
          />

          <div>
            <PackageMemberStatusSummary issues={issues} mode="partner" />
          </div>
        </section>

        <section className="grid gap-3">
          <div className="px-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="ops-bug-chart-menu-trigger w-48 justify-between rounded-md"
                  size="sm"
                  variant="outline"
                >
                  <span className="truncate text-left">Visible charts</span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="ops-bug-chart-menu-content w-48"
              >
                <DropdownMenuLabel>Charts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked
                  className="ops-bug-chart-menu-item"
                  disabled
                  onSelect={(event) => event.preventDefault()}
                >
                  Bug analysis
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked
                  className="ops-bug-chart-menu-item"
                  disabled
                  onSelect={(event) => event.preventDefault()}
                >
                  Bug fixing
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={optionalCharts.includes('velocity')}
                  className="ops-bug-chart-menu-item"
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) => {
                    setOptionalCharts((current) =>
                      checked
                        ? [...current, 'velocity']
                        : current.filter((item) => item !== 'velocity'),
                    )
                  }}
                >
                  Velocity
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={optionalCharts.includes('reopen')}
                  className="ops-bug-chart-menu-item"
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) => {
                    setOptionalCharts((current) =>
                      checked
                        ? [...current, 'reopen']
                        : current.filter((item) => item !== 'reopen'),
                    )
                  }}
                >
                  Reopen rate
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            <PackageBugStatisticsSection
              isError={bugStatisticsError}
              isPending={bugStatisticsPending}
              statistics={bugStatistics}
            />
            <PackageSprintChartsSection
              isError={sprintStatisticsError}
              isPending={sprintStatisticsPending}
              statistics={sprintStatistics}
              chartKeys={['flow']}
            />
            {optionalCharts.includes('velocity') ? (
              <PackageSprintChartsSection
                isError={sprintStatisticsError}
                isPending={sprintStatisticsPending}
                statistics={sprintStatistics}
                chartKeys={['velocity']}
              />
            ) : null}
            {optionalCharts.includes('reopen') ? (
              <PackageSprintChartsSection
                isError={sprintStatisticsError}
                isPending={sprintStatisticsPending}
                statistics={sprintStatistics}
                chartKeys={['reopen']}
              />
            ) : null}
          </div>
        </section>

        <section className="grid gap-3">
          <PackageIssuesTable issues={issues} />
        </section>
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
    return <LoadingPanel title="Loading bug analysis" />
  }

  if (isError) {
    return (
      <div className="ops-package-sprint-card ops-bug-chart-shell rounded-xl px-4 py-10 text-sm text-[var(--status-danger)]">
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
  const directLegendCount = sortedChartData.length > 4 ? 3 : 4
  const topCategories = sortedChartData.slice(0, directLegendCount)
  const remainingCategories = sortedChartData.slice(directLegendCount)
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
    <div className="ops-package-sprint-card ops-bug-chart-shell grid h-full gap-4 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold tracking-[-0.02em]">
            Bug Analysis
          </h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Distribution of bugs by category.
          </p>
        </div>
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
                  paddingAngle={chartData.length > 1 ? 2 : 0}
                  stroke="color-mix(in srgb, var(--workspace-pane) 92%, white 8%)"
                  strokeWidth={2}
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

function PackageSprintChartsSection({
  chartKeys,
  isError,
  isPending,
  statistics,
}: {
  chartKeys: Array<'flow' | 'velocity' | 'reopen'>
  isError: boolean
  isPending: boolean
  statistics: PackageSprintStatistic[]
}) {
  if (isPending) {
    return <LoadingPanel title="Loading sprint metrics" />
  }

  if (isError) {
    return (
      <div className="ops-bug-chart-shell rounded-md px-4 py-10 text-sm text-[var(--status-danger)]">
        Failed to load sprint statistics.
      </div>
    )
  }

  if (!statistics.length) {
    return (
      <div className="ops-bug-chart-shell rounded-md px-4 py-10 text-sm text-[var(--muted-foreground)]">
        No sprint statistics.
      </div>
    )
  }

  const chartData = buildSprintChartData(statistics)

  return (
    <>
      {chartKeys.map((key) => {
        if (key === 'flow') {
          return <SprintDefectFlowChart key={key} data={chartData} />
        }

        if (key === 'velocity') {
          return <SprintVelocityChart key={key} data={chartData} />
        }

        return <SprintReopenChart key={key} data={chartData} />
      })}
    </>
  )
}

function SprintDefectFlowChart({ data }: { data: SprintChartDatum[] }) {
  return (
    <article className="ops-package-sprint-card ops-bug-chart-shell grid gap-2 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold tracking-[-0.02em]">
            Bug Fixing
          </h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Resolved versus total backlog by sprint.
          </p>
        </div>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
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
              content={
                <SprintChartTooltip
                  rows={[
                    { key: 'totalBug', label: 'Total' },
                    { key: 'resolvedBug', label: 'Resolved' },
                    { key: 'remainingBug', label: 'Remaining' },
                    { key: 'newBug', label: 'New' },
                  ]}
                />
              }
            />
            <Bar
              dataKey="resolvedBug"
              stackId="flow"
              fill="#0c66e4"
              radius={[0, 0, 0, 0]}
              maxBarSize={26}
              name="Resolved"
            />
            <Bar
              dataKey="remainingBug"
              stackId="flow"
              fill="#c8d7f0"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
              name="Remaining"
            />
            <Line
              type="linear"
              dataKey="newBug"
              stroke="#42526e"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              name="New"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        items={[
          { color: '#0c66e4', label: 'Resolved' },
          { color: '#c8d7f0', label: 'Remaining' },
          { color: '#42526e', label: 'New' },
        ]}
        xLabel="Sprint"
        yLabel="Bugs"
      />
    </article>
  )
}

function SprintVelocityChart({ data }: { data: SprintChartDatum[] }) {
  const hasTarget = data.some((item) => item.targetVelocity > 0)

  return (
    <article className="ops-package-sprint-card ops-bug-chart-shell grid gap-3 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold tracking-[-0.02em]">
            Bug Fixing Velocity
          </h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            New vs resolved with fix rate and target.
          </p>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
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
              yAxisId="count"
              width={42}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              width={36}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              content={
                <SprintChartTooltip
                  rows={[
                    { key: 'newBug', label: 'New bugs' },
                    { key: 'resolvedVelocity', label: 'Resolved bugs' },
                    {
                      key: 'resolutionRate',
                      label: 'Rate',
                      format: 'percent',
                    },
                    ...(hasTarget
                      ? ([{ key: 'targetVelocity', label: 'Target' }] as const)
                      : []),
                  ]}
                />
              }
            />
            <Bar
              yAxisId="count"
              dataKey="newBug"
              fill="#c8d7f0"
              radius={[8, 8, 0, 0]}
              maxBarSize={18}
              name="New bugs"
            />
            <Bar
              yAxisId="count"
              dataKey="resolvedVelocity"
              fill="#22a06b"
              radius={[8, 8, 0, 0]}
              maxBarSize={18}
              name="Resolved bugs"
            />
            {hasTarget ? (
              <Line
                yAxisId="count"
                type="linear"
                dataKey="targetVelocity"
                stroke="#f5a623"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
                activeDot={false}
                name="Target"
              />
            ) : null}
            <Line
              yAxisId="rate"
              type="linear"
              dataKey="resolutionRate"
              stroke="#0c66e4"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              name="Rate"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        items={[
          { color: '#c8d7f0', label: 'New bugs' },
          { color: '#22a06b', label: 'Resolved bugs' },
          { color: '#0c66e4', label: 'Rate' },
          ...(hasTarget
            ? [{ color: '#f5a623', label: 'Target', dashed: true }]
            : []),
        ]}
        xLabel="Sprint"
        yLabel="Count / rate"
      />
    </article>
  )
}

function SprintReopenChart({ data }: { data: SprintChartDatum[] }) {
  const hasTarget = data.some((item) => item.targetReopenedRate > 0)

  return (
    <article className="ops-package-sprint-card ops-bug-chart-shell grid gap-3 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold tracking-[-0.02em]">
            Reopened Rate
          </h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Reopened bugs with reopen rate by sprint.
          </p>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
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
              yAxisId="count"
              width={42}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              width={36}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              content={
                <SprintChartTooltip
                  rows={[
                    { key: 'reopenedBug', label: 'Reopened' },
                    {
                      key: 'reopenedRate',
                      label: 'Reopen rate',
                      format: 'percent',
                    },
                    ...(hasTarget
                      ? ([
                          {
                            key: 'targetReopenedRate',
                            label: 'Target rate',
                            format: 'percent',
                          },
                        ] as const)
                      : []),
                  ]}
                />
              }
            />
            {hasTarget ? (
              <Line
                yAxisId="rate"
                type="linear"
                dataKey="targetReopenedRate"
                stroke="#f5a623"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
                activeDot={false}
                name="Target rate"
              />
            ) : null}
            <Bar
              yAxisId="count"
              dataKey="reopenedBug"
              fill="#f5a623"
              radius={[8, 8, 0, 0]}
              maxBarSize={26}
              name="Reopened"
            />
            <Line
              yAxisId="rate"
              type="linear"
              dataKey="reopenedRate"
              stroke="#c9372c"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              name="Reopen rate"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        items={[
          { color: '#f5a623', label: 'Reopened' },
          { color: '#c9372c', label: 'Reopen rate' },
          ...(hasTarget
            ? [{ color: '#f5a623', label: 'Target rate', dashed: true }]
            : []),
        ]}
        xLabel="Sprint"
        yLabel="Count / rate"
      />
    </article>
  )
}

function ChartLegend({
  items,
  xLabel,
  yLabel,
}: {
  items: Array<{ color: string; dashed?: boolean; label: string }>
  xLabel: string
  yLabel: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)]/70 pt-2">
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4 rounded-full"
              style={{
                background: item.dashed ? 'transparent' : item.color,
                borderTop: item.dashed ? `2px dashed ${item.color}` : undefined,
              }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-[10px] font-medium tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
        <span>X: {xLabel}</span>
        <span>Y: {yLabel}</span>
      </div>
    </div>
  )
}

function SprintChartTooltip({
  active,
  payload,
  rows,
}: {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number
    color?: string
    payload?: SprintChartDatum
  }>
  rows: Array<{
    key: keyof SprintChartDatum
    label: string
    format?: 'compact' | 'percent'
  }>
}) {
  if (!active || !payload?.length) return null

  const datum = payload[0]?.payload
  if (!datum) return null

  return (
    <div className="ops-bug-chart-tooltip rounded-md px-3 py-2 text-xs shadow-sm">
      <div className="font-medium text-[var(--foreground)]">{datum.label}</div>
      <div className="mt-2 grid gap-1.5 text-[var(--muted-foreground)]">
        {rows.map((row) => (
          <TooltipRow
            key={row.label}
            label={row.label}
            value={formatTooltipMetric(datum[row.key], row.format)}
          />
        ))}
        <TooltipRow
          label="Duration"
          value={`${formatDateLabel(datum.startDate)} - ${formatDateLabel(datum.endDate)}`}
        />
      </div>
    </div>
  )
}

function TooltipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-[var(--foreground)]">{value}</span>
    </div>
  )
}

type SprintChartDatum = {
  id: number
  label: string
  createdAt: number
  startDate: string
  endDate: string
  newBug: number
  resolvedBug: number
  remainingBug: number
  totalBug: number
  resolvedVelocity: number
  targetVelocity: number
  reopenedBug: number
  reopenedRate: number
  resolutionRate: number
  targetReopenedRate: number
}

function buildSprintChartData(
  statistics: PackageSprintStatistic[],
): SprintChartDatum[] {
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
      createdAt: new Date(item.created_at).getTime(),
      startDate: item.sprint.start_date,
      endDate: item.sprint.end_date,
      newBug: item.new_bug,
      resolvedBug: item.resolved_bug,
      remainingBug: Math.max(item.total_bug - item.resolved_bug, 0),
      totalBug: item.total_bug,
      resolvedVelocity: item.resolved_bug_velocity,
      targetVelocity: item.target_bug_velocity,
      reopenedBug: item.reopened_bug,
      resolutionRate:
        item.new_bug > 0 ? item.resolved_bug_velocity / item.new_bug : 0,
      reopenedRate:
        item.resolved_bug > 0
          ? item.resolved_bug_reopened / item.resolved_bug
          : 0,
      targetReopenedRate: item.target_reopened_rate,
    }))
}

function formatMetricValue(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

function formatTooltipMetric(
  value: SprintChartDatum[keyof SprintChartDatum],
  format: 'compact' | 'percent' = 'compact',
) {
  const numericValue = typeof value === 'number' ? value : 0

  if (format === 'percent') {
    return `${Math.round(numericValue * 100)}%`
  }

  return formatMetricValue(numericValue)
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
  const projectOptions = projects.map((project) => ({
    value: String(project.id),
    label: project.name,
  }))

  return (
    <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <Field label="Project" error={form.formState.errors.projectId?.message}>
          {allowProjectChange ? (
            <WorkspaceSelect
              value={String(form.watch('projectId'))}
              options={projectOptions}
              placeholder="Select project"
              onValueChange={(value) => {
                form.setValue('projectId', Number(value), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            />
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
        <Field label="Note">
          <Textarea
            className="ops-workspace-input min-h-24 rounded-md"
            {...form.register('note')}
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

function BugTimelineLoadingState() {
  return <TimelineWorkspaceLoading />
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

function buildPackageFormValues(
  selectedEntity: BugTimelineSelectedEntity | null,
  selectedPackage: BugTrackerPackage | null,
  packageOptions: BugTrackerProject[],
): PackageFormValues {
  return {
    projectId:
      selectedEntity?.type === 'package'
        ? selectedEntity.projectId
        : (selectedEntity?.projectId ?? packageOptions[0]?.id ?? 0),
    name: selectedPackage?.name ?? '',
    keys: selectedPackage?.keys ?? '',
    labels: selectedPackage?.labels ?? '',
    members: selectedPackage?.members ?? '',
    note: selectedPackage?.note ?? '',
    start_date: selectedPackage?.start_date ?? '',
    end_date: selectedPackage?.end_date ?? '',
  }
}

function toPackagePayload(values: PackageFormValues) {
  return {
    name: values.name.trim(),
    keys: values.keys.trim(),
    labels: values.labels.trim(),
    members: values.members.trim(),
    note: values.note.trim(),
    start_date: values.start_date,
    end_date: values.end_date,
    bug_tracker_project: values.projectId,
  }
}

type DirtyFormFields<T extends Record<string, unknown>> = Partial<
  Record<keyof T, boolean | undefined>
>

function toProjectPatchPayload(
  values: ProjectFormValues,
  dirtyFields: DirtyFormFields<ProjectFormValues>,
) {
  const payload: Partial<BugTrackerProjectPayload> = {}

  if (dirtyFields.name) {
    payload.name = values.name.trim()
  }

  return payload
}

function toPackagePatchPayload(
  values: PackageFormValues,
  dirtyFields: DirtyFormFields<PackageFormValues>,
) {
  const payload: Partial<BugTrackerPackagePayload> = {}

  if (dirtyFields.projectId) {
    payload.bug_tracker_project = values.projectId
  }

  if (dirtyFields.name) {
    payload.name = values.name.trim()
  }

  if (dirtyFields.keys) {
    payload.keys = values.keys.trim()
  }

  if (dirtyFields.labels) {
    payload.labels = values.labels.trim()
  }

  if (dirtyFields.members) {
    payload.members = values.members.trim()
  }

  if (dirtyFields.note) {
    payload.note = values.note.trim()
  }

  if (dirtyFields.start_date) {
    payload.start_date = values.start_date
  }

  if (dirtyFields.end_date) {
    payload.end_date = values.end_date
  }

  return payload
}

function hasSyncingPackageChanges(payload: Partial<BugTrackerPackagePayload>) {
  return (
    payload.name !== undefined ||
    payload.keys !== undefined ||
    payload.labels !== undefined ||
    payload.members !== undefined ||
    payload.start_date !== undefined ||
    payload.end_date !== undefined ||
    payload.bug_tracker_project !== undefined
  )
}

function buildCustomBugJql({
  assignees,
  endDate,
  labels,
  projectKeys,
  startDate,
}: {
  assignees: string
  endDate: string
  labels: string
  projectKeys: string
  startDate: string
}) {
  const clauses: string[] = []
  const normalizedProjectKeys = parseCommaList(projectKeys)
  const normalizedLabels = parseCommaList(labels)
  const normalizedAssignees = parseCommaList(assignees)

  if (normalizedProjectKeys.length) {
    clauses.push(
      `project in (${normalizedProjectKeys.map((item) => `"${item}"`).join(', ')})`,
    )
  }

  if (normalizedLabels.length) {
    clauses.push(`labels in (${normalizedLabels.join(', ')})`)
  }

  if (normalizedAssignees.length) {
    clauses.push(`assignee in (${normalizedAssignees.join(', ')})`)
  }

  if (startDate) {
    clauses.push(`startdate >= ${startDate}`)
  }

  if (endDate) {
    clauses.push(`enddate <= ${endDate}`)
  }

  return clauses.join(' and ')
}

function formatBugCategoryLabel(value: string) {
  return value.replace(/^FPT\.BUG\./, '').replaceAll('_', ' ')
}
