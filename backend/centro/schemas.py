"""Validación de entradas con Pydantic. Los PATCH usan exclude_unset: null explícito borra el campo."""
from __future__ import annotations

import re
from datetime import date
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

Str200 = Annotated[str, Field(max_length=200)]
Text = Annotated[str, Field(max_length=200_000)]
DateStr = Annotated[str, Field(pattern=r"^\d{4}-\d{2}-\d{2}$")]
DateTimeStr = Annotated[str, Field(pattern=r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$")]

TaskStatus = Literal["backlog", "pendiente", "en_curso", "en_revision", "hecha", "cancelada"]
Priority = Literal["urgente", "alta", "normal", "baja"]
TaskKind = Literal["tarea", "peticion", "incidencia", "mejora", "evolutivo"]
Approval = Literal["no_requerida", "pendiente", "aprobada", "rechazada"]
Condition = Literal["espera", "bloqueada"]

SAFE_SCHEMES = ("http://", "https://", "mailto:", "file:")


def validate_url(url: str) -> str:
    u = url.strip()
    if not u:
        raise ValueError("Enlace vacío")
    if len(u) > 2000:
        raise ValueError("Enlace demasiado largo")
    if re.search(r"[\x00-\x1f\s]", u.replace(" ", "%20")):
        raise ValueError("El enlace contiene caracteres de control")
    if not u.lower().startswith(SAFE_SCHEMES):
        raise ValueError("Esquema de enlace no permitido (usa http, https, mailto o file)")
    return u


def _check_date(v):
    if v is not None:
        date.fromisoformat(v)
    return v


class Link(BaseModel):
    label: Annotated[str, Field(max_length=200)] = ""
    url: str

    @field_validator("url")
    @classmethod
    def _url(cls, v: str) -> str:
        return validate_url(v)


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=False)


# ---------- Clientes, personas, proyectos ----------
class ClientIn(Strict):
    name: Annotated[str, Field(min_length=1, max_length=200)]
    notes: Text = ""


class ClientPatch(Strict):
    name: Optional[Annotated[str, Field(min_length=1, max_length=200)]] = None
    notes: Optional[Text] = None


class PersonIn(Strict):
    name: Annotated[str, Field(min_length=1, max_length=200)]
    role: Str200 = ""
    weekly_capacity_hours: Optional[Annotated[float, Field(ge=0, le=168)]] = None
    active: bool = True
    notes: Text = ""


class PersonPatch(Strict):
    name: Optional[Annotated[str, Field(min_length=1, max_length=200)]] = None
    role: Optional[Str200] = None
    weekly_capacity_hours: Optional[Annotated[float, Field(ge=0, le=168)]] = None
    active: Optional[bool] = None
    notes: Optional[Text] = None


ProjectStatus = Literal["activo", "pausado", "cerrado", "archivado"]
Health = Literal["normal", "atencion", "bloqueado"]


class ProjectIn(Strict):
    name: Annotated[str, Field(min_length=1, max_length=200)]
    type: Annotated[str, Field(min_length=1, max_length=50)] = "implementacion"
    client_id: Optional[int] = None
    status: ProjectStatus = "activo"
    health: Optional[Health] = None
    health_note: Str200 = ""
    summary: Text = ""
    next_action: Annotated[str, Field(max_length=2000)] = ""
    objective: Annotated[str, Field(max_length=2000)] = ""
    phase: Str200 = ""
    links: list[Link] = []


class ProjectPatch(Strict):
    name: Optional[Annotated[str, Field(min_length=1, max_length=200)]] = None
    type: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    client_id: Optional[int] = None
    status: Optional[ProjectStatus] = None
    health: Optional[Health] = None
    health_note: Optional[Str200] = None
    summary: Optional[Text] = None
    next_action: Optional[Annotated[str, Field(max_length=2000)]] = None
    objective: Optional[Annotated[str, Field(max_length=2000)]] = None
    phase: Optional[Str200] = None
    links: Optional[list[Link]] = None


class ProjectPersonIn(Strict):
    person_id: int
    role: Str200 = ""


class GroupingIn(Strict):
    kind: Literal["linea", "fase", "entregable"]
    name: Annotated[str, Field(min_length=1, max_length=200)]
    position: float = 0


class GroupingPatch(Strict):
    name: Optional[Annotated[str, Field(min_length=1, max_length=200)]] = None
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


class AbsenceIn(Strict):
    person_id: int
    start_date: DateStr
    end_date: DateStr
    label: Str200 = ""
    _d = field_validator("start_date", "end_date")(_check_date)


# ---------- Tareas ----------
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
    wait_reason: Optional[Annotated[str, Field(max_length=2000)]] = None
    wait_on: Optional[Str200] = None
    wait_on_person_id: Optional[int] = None
    wait_since: Optional[DateTimeStr] = None
    wait_next_action: Optional[Annotated[str, Field(max_length=2000)]] = None
    follow_up_at: Optional[DateTimeStr] = None
    follow_up_every_days: Optional[Annotated[int, Field(ge=1, le=365)]] = None
    next_review_at: Optional[DateTimeStr] = None
    review_after_start_hours: Optional[Annotated[float, Field(gt=0, le=100000)]] = None
    review_after_idle_hours: Optional[Annotated[float, Field(gt=0, le=100000)]] = None
    review_hours_mode: Optional[Literal["natural", "laborable"]] = None
    links: Optional[list[Link]] = None
    tags: Optional[list[Annotated[str, Field(min_length=1, max_length=60)]]] = None
    archived: Optional[bool] = None
    _d = field_validator("due_date", "planned_date")(_check_date)


class TaskCreate(TaskFields):
    title: Annotated[str, Field(min_length=1, max_length=300)]


class TaskPatch(TaskFields):
    title: Optional[Annotated[str, Field(min_length=1, max_length=300)]] = None
    force: bool = False  # confirma iniciar ejecución con aprobación pendiente


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


class ReorderIn(Strict):
    status: Optional[TaskStatus] = None
    before_id: Optional[int] = None  # colocar antes de esta tarea
    after_id: Optional[int] = None   # colocar después de esta tarea
    force: bool = False


# ---------- Recurrencias ----------
class RecurrenceIn(Strict):
    title: Annotated[str, Field(min_length=1, max_length=300)]
    description: Text = ""
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None
    priority: Priority = "normal"
    estimate_hours: Optional[Annotated[float, Field(ge=0, le=1000)]] = None
    rule: Literal["diaria", "laborables", "semanal", "cada_n_dias"]
    interval_days: Optional[Annotated[int, Field(ge=1, le=365)]] = None
    weekdays: list[Annotated[int, Field(ge=1, le=7)]] = []
    start_date: DateStr
    end_date: Optional[DateStr] = None
    non_working: Literal["saltar", "siguiente_laborable", "mantener"] = "saltar"
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
    non_working: Optional[Literal["saltar", "siguiente_laborable", "mantener"]] = None
    active: Optional[bool] = None
    apply_to_future: bool = False


# ---------- Notas ----------
class NoteCreate(Strict):
    content: Text = ""
    title_manual: Optional[Annotated[str, Field(max_length=300)]] = None
    project_id: Optional[int] = None
    kind: Optional[Literal["acta", "decision", "documentacion"]] = None


class NotePatch(Strict):
    content: Optional[Text] = None
    title_manual: Optional[Annotated[str, Field(max_length=300)]] = None
    project_id: Optional[int] = None
    kind: Optional[Literal["acta", "decision", "documentacion"]] = None
    pinned: Optional[bool] = None
    state: Optional[Literal["activa", "archivada", "papelera"]] = None
    tags: Optional[list[Annotated[str, Field(min_length=1, max_length=60)]]] = None
    base_version: Optional[int] = None  # control de concurrencia optimista


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


# ---------- Recordatorios, vistas, ajustes ----------
class ManualReminderIn(Strict):
    title: Annotated[str, Field(min_length=1, max_length=300)]
    due_at: DateTimeStr
    task_id: Optional[int] = None
    project_id: Optional[int] = None


class ReminderAction(Strict):
    action: Literal["posponer", "descartar", "atendido"]
    until: Optional[DateTimeStr] = None


class SavedViewIn(Strict):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    view: Literal["kanban", "lista", "calendario"]
    filters: dict = {}


class RestoreIn(Strict):
    data: dict
    confirm: bool = False
