"""Input validation with Pydantic. PATCH requests use exclude_unset: an explicit null clears the field."""
from __future__ import annotations

import re
from datetime import date
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

Str200 = Annotated[str, Field(max_length=200)]
Str2000 = Annotated[str, Field(max_length=2000)]
Text = Annotated[str, Field(max_length=200_000)]
Name = Annotated[str, Field(min_length=1, max_length=200)]
TagName = Annotated[str, Field(min_length=1, max_length=60)]
DateStr = Annotated[str, Field(pattern=r"^\d{4}-\d{2}-\d{2}$")]
DateTimeStr = Annotated[str, Field(pattern=r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$")]

TaskStatus = Literal["backlog", "pendiente", "en_curso", "en_revision", "hecha", "cancelada"]
Priority = Literal["urgente", "alta", "normal", "baja"]
TaskKind = Literal["tarea", "peticion", "incidencia", "mejora", "evolutivo"]
Approval = Literal["no_requerida", "pendiente", "aprobada", "rechazada"]
Condition = Literal["espera", "bloqueada"]
Rule = Literal["diaria", "laborables", "semanal", "cada_n_dias"]
NonWorking = Literal["saltar", "siguiente_laborable", "mantener"]

SAFE_SCHEMES = ("http://", "https://", "mailto:", "file:")


def validate_url(url: str) -> str:
    u = url.strip()
    if not u:
        raise ValueError("Empty link")
    if len(u) > 2000:
        raise ValueError("Enlace demasiado largo")
    if re.search(r"[\x00-\x1f]", u):
        raise ValueError("The link contains control characters")
    if not u.lower().startswith(SAFE_SCHEMES):
        raise ValueError("Link scheme not allowed (use http, https, mailto or file)")
    return u


def _check_date(v):
    if v is not None:
        date.fromisoformat(v)
    return v


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Link(BaseModel):
    label: Annotated[str, Field(max_length=200)] = ""
    url: str

    @field_validator("url")
    @classmethod
    def _url(cls, v: str) -> str:
        return validate_url(v)


# ---------- Clientes, personas, oficinas ----------
class ClientIn(Strict):
    name: Name
    notes: Text = ""


class ClientPatch(Strict):
    name: Optional[Name] = None
    notes: Optional[Text] = None


class PersonIn(Strict):
    name: Name
    role: Str200 = ""
    weekly_capacity_hours: Optional[Annotated[float, Field(ge=0, le=168)]] = None
    location_id: Optional[int] = None
    active: bool = True
    notes: Text = ""


class PersonPatch(Strict):
    name: Optional[Name] = None
    role: Optional[Str200] = None
    weekly_capacity_hours: Optional[Annotated[float, Field(ge=0, le=168)]] = None
    location_id: Optional[int] = None
    active: Optional[bool] = None
    notes: Optional[Text] = None


class LocationIn(Strict):
    name: Annotated[str, Field(min_length=1, max_length=100)]


class HolidayIn(Strict):
    date: DateStr
    name: Str200 = ""
    location_id: Optional[int] = None
    _d = field_validator("date")(_check_date)


class AbsenceIn(Strict):
    person_id: int
    start_date: DateStr
    end_date: DateStr
    label: Str200 = ""
    _d = field_validator("start_date", "end_date")(_check_date)


# ---------- Proyectos ----------
ProjectStatus = Literal["activo", "pausado", "cerrado", "archivado"]
Health = Literal["normal", "atencion", "bloqueado"]


class ProjectIn(Strict):
    name: Name
    type: Annotated[str, Field(min_length=1, max_length=50)] = "implementacion"
    client_id: Optional[int] = None
    status: ProjectStatus = "activo"
    health: Optional[Health] = None
    health_note: Str2000 = ""
    summary: Text = ""
    next_action: Str2000 = ""
    objective: Str2000 = ""
    phase: Str200 = ""
    links: list[Link] = []


class ProjectPatch(Strict):
    name: Optional[Name] = None
    type: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    client_id: Optional[int] = None
    status: Optional[ProjectStatus] = None
    health: Optional[Health] = None
    health_note: Optional[Str2000] = None
    summary: Optional[Text] = None
    next_action: Optional[Str2000] = None
    objective: Optional[Str2000] = None
    phase: Optional[Str200] = None
    links: Optional[list[Link]] = None


class ProjectPersonIn(Strict):
    person_id: int
    role: Str200 = ""
    dedication_pct: Optional[Annotated[float, Field(ge=0, le=100)]] = None


class GroupingIn(Strict):
    kind: Literal["linea", "fase", "entregable"]
    name: Name
    position: float = 0


class GroupingPatch(Strict):
    name: Optional[Name] = None
    position: Optional[float] = None


class MilestoneIn(Strict):
    kind: Literal["hito", "decision", "compromiso"] = "hito"
    title: Annotated[str, Field(min_length=1, max_length=300)]
    date: Optional[DateStr] = None
    status: Literal["pendiente", "cumplido", "cancelado"] = "pendiente"
    notes: Text = ""
    _d = field_validator("date")(_check_date)


class MilestonePatch(Strict):
    kind: Optional[Literal["hito", "decision", "compromiso"]] = None
    title: Optional[Annotated[str, Field(min_length=1, max_length=300)]] = None
    date: Optional[DateStr] = None
    status: Optional[Literal["pendiente", "cumplido", "cancelado"]] = None
    notes: Optional[Text] = None
    _d = field_validator("date")(_check_date)


# ---------- Tasks ----------
class TaskFields(Strict):
    description: Optional[Text] = None
    kind: Optional[TaskKind] = None
    project_id: Optional[int] = None
    workstream_id: Optional[int] = None
    phase_id: Optional[int] = None
    deliverable_id: Optional[int] = None
    parent_id: Optional[int] = None
    assignee_id: Optional[int] = None
    reviewer_id: Optional[int] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    position: Optional[float] = None
    due_date: Optional[DateStr] = None
    planned_date: Optional[DateStr] = None
    started_at: Optional[DateTimeStr] = None
    completed_at: Optional[DateTimeStr] = None
    estimate_hours: Optional[Annotated[float, Field(ge=0, le=10000)]] = None
    approval: Optional[Approval] = None
    condition: Optional[Condition] = None
    wait_reason: Optional[Str2000] = None
    wait_on: Optional[Str200] = None
    wait_on_person_id: Optional[int] = None
    wait_since: Optional[DateTimeStr] = None
    wait_next_action: Optional[Str2000] = None
    follow_up_at: Optional[DateTimeStr] = None
    follow_up_every_days: Optional[Annotated[int, Field(ge=1, le=365)]] = None
    next_review_at: Optional[DateTimeStr] = None
    review_after_start_hours: Optional[Annotated[float, Field(gt=0, le=100000)]] = None
    review_after_idle_hours: Optional[Annotated[float, Field(gt=0, le=100000)]] = None
    review_hours_mode: Optional[Literal["natural", "laborable"]] = None
    links: Optional[list[Link]] = None
    tags: Optional[list[TagName]] = None
    archived: Optional[bool] = None
    _d = field_validator("due_date", "planned_date")(_check_date)


class TaskCreate(TaskFields):
    title: Annotated[str, Field(min_length=1, max_length=300)]


class TaskPatch(TaskFields):
    title: Optional[Annotated[str, Field(min_length=1, max_length=300)]] = None
    force: bool = False  # confirms starting execution while approval is pending


class TaskUpdateNote(Strict):
    text: Annotated[str, Field(min_length=1, max_length=5000)]


class FollowUpIn(Strict):
    text: Annotated[str, Field(max_length=5000)] = ""


class DependencyIn(Strict):
    depends_on_id: int


class AllocationIn(Strict):
    week_start: DateStr
    hours: Annotated[float, Field(ge=0, le=168)]
    _d = field_validator("week_start")(_check_date)


class GroupMove(Strict):
    """Kanban group change (0.5): the field of the grouping and its new value (None = «Without …»)."""
    field: Literal["assignee_id", "project_id", "workstream_id", "phase_id", "deliverable_id"]
    value: Optional[int] = None


class ReorderIn(Strict):
    status: Optional[TaskStatus] = None
    before_id: Optional[int] = None
    after_id: Optional[int] = None
    force: bool = False
    group: Optional[GroupMove] = None
    scope: Literal["this", "following", "all"] = "this"


class StepIn(Strict):
    text: Annotated[str, Field(min_length=1, max_length=500)]


class StepPatch(Strict):
    text: Optional[Annotated[str, Field(min_length=1, max_length=500)]] = None
    done: Optional[bool] = None
    position: Optional[float] = None


# ---------- Recurrencias ----------
class RuleIn(Strict):
    rule: Rule
    interval_days: Optional[Annotated[int, Field(ge=1, le=365)]] = None
    weekdays: list[Annotated[int, Field(ge=1, le=7)]] = []
    start_date: Optional[DateStr] = None
    end_date: Optional[DateStr] = None
    non_working: NonWorking = "saltar"
    _d = field_validator("start_date", "end_date")(_check_date)


class RecurrenceIn(Strict):
    title: Annotated[str, Field(min_length=1, max_length=300)]
    description: Text = ""
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None
    priority: Priority = "normal"
    estimate_hours: Optional[Annotated[float, Field(ge=0, le=1000)]] = None
    rule: Rule
    interval_days: Optional[Annotated[int, Field(ge=1, le=365)]] = None
    weekdays: list[Annotated[int, Field(ge=1, le=7)]] = []
    start_date: DateStr
    end_date: Optional[DateStr] = None
    non_working: NonWorking = "saltar"
    active: bool = True
    _d = field_validator("start_date", "end_date")(_check_date)


class RecurrencePatch(Strict):
    title: Optional[Annotated[str, Field(min_length=1, max_length=300)]] = None
    description: Optional[Text] = None
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None
    priority: Optional[Priority] = None
    estimate_hours: Optional[Annotated[float, Field(ge=0, le=1000)]] = None
    end_date: Optional[DateStr] = None
    non_working: Optional[NonWorking] = None
    active: Optional[bool] = None
    apply_to_future: bool = False  # 0.4 compatibility: true = scope «from_today»
    scope: Optional[Literal["new", "from_today", "all"]] = None


# ---------- Notes ----------
class NoteCreate(Strict):
    content: Text = ""
    title_manual: Optional[Annotated[str, Field(max_length=300)]] = None
    project_id: Optional[int] = None
    kind: Optional[Literal["acta", "decision", "documentacion"]] = None
    task_id: Optional[int] = None  # creates the note already linked to this task


class NotePatch(Strict):
    content: Optional[Text] = None
    title_manual: Optional[Annotated[str, Field(max_length=300)]] = None
    project_id: Optional[int] = None
    kind: Optional[Literal["acta", "decision", "documentacion"]] = None
    pinned: Optional[bool] = None
    state: Optional[Literal["activa", "archivada", "papelera"]] = None
    tags: Optional[list[TagName]] = None
    base_version: Optional[int] = None


class NoteToTaskIn(Strict):
    title: Annotated[str, Field(min_length=1, max_length=300)]
    excerpt: Annotated[str, Field(max_length=5000)] = ""
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None
    due_date: Optional[DateStr] = None


class NoteLinkIn(Strict):
    task_id: int


class NoteTabsIn(Strict):
    open: list[int]
    active: Optional[int] = None
    split: Optional[int] = None  # note of the right pane in split screen (0.3)


# ---------- Tags, reminders, views, restore ----------
class TagPatch(Strict):
    name: TagName


class ManualReminderIn(Strict):
    title: Annotated[str, Field(min_length=1, max_length=300)]
    due_at: DateTimeStr
    task_id: Optional[int] = None
    project_id: Optional[int] = None


class ReminderAction(Strict):
    action: Literal["posponer", "descartar", "atendido", "reabrir"]
    until: Optional[DateTimeStr] = None
    also_ids: list[int] = Field(default_factory=list, max_length=500)  # grouped notices of the same series (0.3)


class ReminderPatch(Strict):
    title: Optional[Annotated[str, Field(min_length=1, max_length=300)]] = None
    due_at: Optional[DateTimeStr] = None


# ---------- 0.3 ----------
class BulkArchiveIn(Strict):
    ids: list[int] = Field(min_length=1, max_length=2000)


class HolidayImportIn(Strict):
    text: Annotated[str, Field(max_length=500_000)]
    create_locations: bool = False
    dry_run: bool = True


class ResetIn(Strict):
    confirm_text: Annotated[str, Field(max_length=200)]
    reseed_demo: bool = False


class PersonDeleteIn(Strict):
    confirm: bool = False
    reassign_to: Optional[int] = None  # reassign open tasks and series to this person; None = leave unassigned


class ProjectDeleteIn(Strict):
    mode: Literal["desvincular", "eliminar"]
    confirm: bool = False


class SavedViewIn(Strict):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    view: Literal["kanban", "lista", "calendario"]
    filters: dict = {}


class RestoreIn(Strict):
    data: dict
    confirm: bool = False
