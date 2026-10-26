export type TaskStatus = "backlog" | "pendiente" | "en_curso" | "en_revision" | "hecha" | "cancelada";
export type Priority = "urgente" | "alta" | "normal" | "baja";
export type Condition = "espera" | "bloqueada" | null;
export type Rule = "diaria" | "laborables" | "semanal" | "cada_n_dias";

export interface Link { label: string; url: string }

export interface Person {
  id: number; name: string; role: string; is_me: number; weekly_capacity_hours: number | null;
  location_id: number | null; active: number; notes: string;
}
export interface Client { id: number; name: string; notes: string; projects?: number }
export interface Location { id: number; name: string; people?: number; holidays?: number }
export interface Holiday { id: number; date: string; name: string; location_id: number | null; location?: string | null }
export interface Grouping { id: number; project_id: number; kind: "linea" | "fase" | "entregable"; name: string; position: number }
export interface Tag { id: number; name: string; tasks: number; notes: number }

export interface Milestone {
  id: number; project_id: number; kind: "hito" | "decision" | "compromiso"; title: string;
  date: string | null; status: "pendiente" | "cumplido" | "cancelado"; notes: string; project_name?: string;
}

export interface ProjectListItem {
  id: number; name: string; type: string; client_id: number | null; client_name?: string | null;
  status: "activo" | "pausado" | "cerrado" | "archivado"; health: "normal" | "atencion" | "bloqueado" | null;
  health_note: string; summary: string; summary_updated_at: string | null; next_action: string;
  objective: string; phase: string; links: Link[]; open_tasks?: number; conditioned_tasks?: number; updated_at: string;
}

export interface Project extends ProjectListItem {
  client: Client | null;
  people: { id: number; name: string; person_role: string; role: string; dedication_pct: number | null;
    weekly_capacity_hours: number | null; dedication_hours: number | null }[];
  groupings: Grouping[]; milestones: Milestone[]; signals: Record<string, number>;
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
  subtasks_total: number; subtasks_closed: number; steps_total: number; steps_done: number;
  parent_title: string | null; signals?: string[]; series_more?: number; undo_id?: number | null;
}

export interface TaskRef { id: number; title: string; status: TaskStatus; assignee_id: number | null; project_id: number | null }
export interface Step { id: number; text: string; done: boolean; done_at: string | null }
export interface HistoryEntry { id: number; at: string; kind: string; text: string; edited_at: string | null; editable: boolean }
export interface RecurrenceInfo { id: number; rule: Rule; interval_days: number | null; weekdays: number[];
  start_date: string; end_date: string | null; non_working: string; active: boolean }

export interface TaskDetail extends Task {
  blocked_by: TaskRef[]; blocks: TaskRef[];
  subtasks: (TaskRef & { estimate_hours: number | null; due_date: string | null })[];
  steps: Step[];
  notes: { id: number; display_title: string; state: string; excerpt: string | null }[];
  history: HistoryEntry[];
  allocations: { week_start: string; hours: number }[];
  recurrence: RecurrenceInfo | null;
}

export interface NoteSummary {
  id: number; title_manual: string | null; display_title: string; title_is_suggested: boolean;
  kind: "acta" | "decision" | "documentacion" | null; project_id: number | null; pinned: boolean;
  state: "activa" | "archivada" | "papelera"; version: number; created_at: string; updated_at: string;
  tags: string[]; linked_tasks: number; excerpt: string;
}
export interface Note extends NoteSummary { content: string; tasks: (TaskRef & { excerpt: string | null })[] }

export interface Reminder {
  id: number; rule: string; rule_label: string; task_id: number | null; project_id: number | null;
  title: string; due_at: string; status: string; snoozed_until: string | null; notified: number;
  task_title?: string | null; project_name?: string | null; task_shown_elsewhere?: boolean;
  resolved_at?: string | null; grouped?: number; grouped_ids?: number[];
}
export interface ReminderBuckets { active: Reminder[]; scheduled: Reminder[]; resolved: Reminder[] }

export interface Settings {
  app_name: string; timezone: string; start_view: string; last_view: string; due_soon_days: number;
  work_schedule: WorkSchedule; backup_retention: number;
  quiet_start: string; quiet_end: string; notifications_enabled: boolean; notifications_discreet: boolean;
  recurrence_horizon_days: number; project_types: string[];
  language: "es" | "en"; date_format: "dd/mm/aaaa" | "aaaa-mm-dd" | "mm/dd/aaaa"; week_start: 1 | 7;
  theme_mode: "sistema" | "claro" | "oscuro"; theme_id: string; custom_themes: import("./theme").ThemeDef[];
  undo_seconds: number; group_recurring: boolean; task_panel_width: number | null;
}
export type WorkSchedule = Record<"1" | "2" | "3" | "4" | "5" | "6" | "7", { start: string; end: string } | null>;

export interface Filters {
  project_id?: string; person_id?: string; status?: string; priority?: string; tag?: string;
  condition?: string; include_backlog?: boolean; include_closed?: boolean; sort?: string;
}
export interface SavedView { id: number; name: string; view: "kanban" | "lista" | "calendario"; filters: Filters }

export interface Bootstrap {
  version: string; demo: boolean; data_dir: string; settings: Settings; me_id: number | null;
  people: Person[]; clients: Client[]; locations: Location[]; projects: ProjectListItem[]; tags: string[];
  saved_views: SavedView[]; groupings: Grouping[];
}

export interface DayContext {
  holidays: { name: string; location: string | null; people: string[] }[];
  absences: { person_id: number; name: string }[];
}

export interface TodayData {
  today: string; week_end: string; me_id: number | null;
  sections: { vence: Task[]; revisar: Task[]; bloqueos_externos: Task[]; depende_de_mi: Task[] };
  reminders: Reminder[]; scheduled: Reminder[];
  team: { person_id: number; name: string; is_me: boolean; active: number; in_review: number; blocked: number;
    due_this_week: number; absences: { id: number; start_date: string; end_date: string; label: string }[];
    holidays: { date: string; name: string; location: string | null }[] }[];
  milestones: Milestone[];
}
