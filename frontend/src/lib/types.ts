export type TaskStatus = "backlog" | "pendiente" | "en_curso" | "en_revision" | "hecha" | "cancelada";
export type Priority = "urgente" | "alta" | "normal" | "baja";
export type Condition = "espera" | "bloqueada" | null;

export interface Link { label: string; url: string }

export interface Person {
  id: number; name: string; role: string; is_me: number; weekly_capacity_hours: number | null;
  active: number; notes: string;
}

export interface Client { id: number; name: string; notes: string }

export interface Grouping { id: number; project_id: number; kind: "linea" | "fase" | "entregable"; name: string; position: number }

export interface Milestone {
  id: number; project_id: number; kind: "hito" | "decision" | "compromiso"; title: string;
  date: string | null; status: "pendiente" | "cumplido" | "cancelado"; notes: string; project_name?: string;
}

export interface ProjectListItem {
  id: number; name: string; type: string; client_id: number | null; client_name?: string | null;
  status: "activo" | "pausado" | "cerrado" | "archivado"; health: "normal" | "atencion" | "bloqueado" | null;
  health_note: string; summary: string; summary_updated_at: string | null; next_action: string;
  objective: string; phase: string; links: Link[]; open_tasks?: number; conditioned_tasks?: number;
  updated_at: string;
}

export interface Project extends ProjectListItem {
  client: Client | null;
  people: { id: number; name: string; person_role: string; role: string }[];
  groupings: Grouping[];
  milestones: Milestone[];
  signals: Record<string, number>;
  commitments: { type: string; id: number; title: string; date: string }[];
}

export interface Task {
  id: number; title: string; description: string; kind: string; project_id: number | null;
  workstream_id: number | null; phase_id: number | null; deliverable_id: number | null; parent_id: number | null;
  assignee_id: number | null; reviewer_id: number | null; status: TaskStatus; priority: Priority; position: number;
  due_date: string | null; planned_date: string | null; started_at: string | null; completed_at: string | null;
  estimate_hours: number | null; approval: "no_requerida" | "pendiente" | "aprobada" | "rechazada";
  condition: Condition; wait_reason: string; wait_on: string; wait_on_person_id: number | null;
  wait_since: string | null; wait_next_action: string; follow_up_at: string | null;
  follow_up_every_days: number | null; last_follow_up_at: string | null; next_review_at: string | null;
  review_after_start_hours: number | null; review_after_idle_hours: number | null;
  review_hours_mode: "natural" | "laborable"; last_significant_update: string; links: Link[];
  recurrence_id: number | null; occurrence_date: string | null; archived: boolean;
  created_at: string; updated_at: string; tags: string[]; open_blockers: number; open_dependents: number;
  subtasks_total: number; subtasks_closed: number; signals?: string[];
}

export interface TaskRef { id: number; title: string; status: TaskStatus; assignee_id: number | null }

export interface TaskDetail extends Task {
  blocked_by: TaskRef[]; blocks: TaskRef[];
  subtasks: (TaskRef & { estimate_hours: number | null })[];
  notes: { id: number; display_title: string; state: string; excerpt: string | null }[];
  history: { at: string; kind: string; text: string }[];
  allocations: { week_start: string; hours: number }[];
}

export interface NoteSummary {
  id: number; title_manual: string | null; display_title: string; title_is_suggested: boolean;
  kind: "acta" | "decision" | "documentacion" | null; project_id: number | null; pinned: boolean;
  state: "activa" | "archivada" | "papelera"; version: number; created_at: string; updated_at: string;
  tags: string[]; linked_tasks: number; excerpt: string;
}

export interface Note extends NoteSummary {
  content: string;
  tasks: { id: number; title: string; status: TaskStatus; assignee_id: number | null; excerpt: string | null }[];
}

export interface Reminder {
  id: number; rule: string; rule_label: string; task_id: number | null; project_id: number | null;
  title: string; due_at: string; status: string; snoozed_until: string | null; notified: number;
  task_title?: string | null; project_name?: string | null; task_shown_elsewhere?: boolean;
}

export interface Settings {
  app_name: string; timezone: string; start_view: string; last_view: string; due_soon_days: number;
  workdays: number[]; work_start: string; work_end: string; holidays: string[]; backup_retention: number;
  quiet_start: string; quiet_end: string; notifications_enabled: boolean; notifications_discreet: boolean;
  recurrence_horizon_days: number; project_types: string[];
}

export interface SavedView { id: number; name: string; view: "kanban" | "lista" | "calendario"; filters: Filters }

export interface Filters {
  project_id?: string; person_id?: string; status?: string; priority?: string; tag?: string;
  condition?: string; include_backlog?: boolean; include_closed?: boolean; sort?: string;
}

export interface Bootstrap {
  version: string; demo: boolean; data_dir: string; settings: Settings; me_id: number | null;
  people: Person[]; clients: Client[]; projects: ProjectListItem[]; tags: string[];
  saved_views: SavedView[]; groupings: Grouping[];
}

export interface TodayData {
  today: string; week_end: string; me_id: number | null;
  sections: { vence: Task[]; revisar: Task[]; bloqueos_externos: Task[]; depende_de_mi: Task[] };
  reminders: Reminder[];
  team: { person_id: number; name: string; is_me: boolean; active: number; in_review: number; blocked: number;
    due_this_week: number; absences: { id: number; start_date: string; end_date: string; label: string }[] }[];
  milestones: Milestone[];
}
