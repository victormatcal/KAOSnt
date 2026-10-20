"""Datos ficticios para demostración. Solo se usan con --demo (carpeta de datos separada)."""
from __future__ import annotations

from datetime import date, timedelta

from . import notes, recurrence, tasks
from .config import Config
from .db import Tx, connect, init_db, jdump, now_utc


def seed_if_empty(cfg: Config) -> bool:
    init_db(cfg.db_path)
    conn = connect(cfg.db_path)
    try:
        if conn.execute("SELECT COUNT(*) FROM projects").fetchone()[0]:
            return False
        with Tx(conn):
            seed(conn)
        return True
    finally:
        conn.close()


def seed(conn) -> None:
    ts = now_utc()
    today = date.today()
    d = lambda n: (today + timedelta(days=n)).isoformat()  # noqa: E731

    def ins(table, **kw):
        if table not in ("project_people", "groupings"):
            kw.setdefault("created_at", ts)
        if table not in ("project_people", "absences", "groupings"):
            kw.setdefault("updated_at", ts)
        cols = ",".join(kw)
        return conn.execute(f"INSERT INTO {table}({cols}) VALUES ({','.join('?' for _ in kw)})", list(kw.values())).lastrowid

    me = conn.execute("SELECT id FROM people WHERE is_me = 1").fetchone()
    me = me[0] if me else ins("people", name="Yo", is_me=1)
    ana = ins("people", name="Ana Ficticia", role="Consultora", weekly_capacity_hours=40)
    luis = ins("people", name="Luis Ejemplo", role="Desarrollador", weekly_capacity_hours=32)
    marta = ins("people", name="Marta Demo", role="Analista")
    c1 = ins("clients", name="Cliente Alfa (ficticio)")
    p1 = ins("projects", name="Migración plataforma Alfa", type="implementacion", client_id=c1, status="activo",
             health="atencion", health_note="Pendiente de accesos del cliente",
             summary="Fase de pruebas de integración. Quedan 2 conectores por validar.", summary_updated_at=ts,
             next_action="Confirmar ventana de pruebas con el cliente", phase="Pruebas",
             links=jdump([{"label": "Carpeta del proyecto (ejemplo)", "url": "https://example.com/carpeta"}]))
    p2 = ins("projects", name="Propuesta Beta", type="propuesta", status="activo",
             summary="Borrador de alcance enviado internamente.", summary_updated_at=ts,
             next_action="Revisar estimación con Ana")
    p3 = ins("projects", name="Mantenimiento Gamma", type="mantenimiento", status="activo")
    for p, ppl in ((p1, (me, ana, luis)), (p2, (me, ana)), (p3, (luis, marta))):
        for x in ppl:
            ins("project_people", project_id=p, person_id=x, role="")
    l1 = ins("groupings", project_id=p1, kind="linea", name="Conectores", position=1)
    l2 = ins("groupings", project_id=p1, kind="linea", name="Roles", position=2)
    ins("milestones", project_id=p1, kind="hito", title="Fin de pruebas de integración", date=d(9))
    ins("milestones", project_id=p1, kind="decision", title="Decidir estrategia de corte", date=d(4))
    ins("milestones", project_id=p2, kind="compromiso", title="Entrega de propuesta", date=d(6))

    t1 = tasks.create_task(conn, {"title": "Validar conector de directorio", "project_id": p1, "workstream_id": l1,
                                  "assignee_id": luis, "reviewer_id": me, "status": "en_revision", "due_date": d(1),
                                  "estimate_hours": 6, "planned_date": d(0)})
    t2 = tasks.create_task(conn, {"title": "Definir matriz de roles", "project_id": p1, "workstream_id": l2,
                                  "assignee_id": me, "status": "en_curso", "due_date": d(3), "priority": "alta"})
    t3 = tasks.create_task(conn, {"title": "Cargar roles en entorno de pruebas", "project_id": p1, "workstream_id": l2,
                                  "assignee_id": ana, "status": "pendiente", "planned_date": d(2)})
    tasks.add_dependency(conn, t3, t2)
    tasks.create_task(conn, {"title": "Credenciales de servicio del cliente", "project_id": p1, "assignee_id": me,
                             "status": "pendiente", "condition": "espera", "wait_on": "Equipo de sistemas del cliente",
                             "wait_reason": "Necesitamos cuenta de servicio", "follow_up_every_days": 2})
    tasks.create_task(conn, {"title": "Estimación de esfuerzo", "project_id": p2, "assignee_id": ana,
                             "status": "pendiente", "due_date": d(5), "estimate_hours": 4})
    tasks.create_task(conn, {"title": "Mejora informe mensual", "project_id": p3, "kind": "mejora",
                             "approval": "pendiente", "status": "backlog", "due_date": d(2)})
    tasks.create_task(conn, {"title": "Idea: automatizar checklist", "status": "backlog"})
    ins("absences", person_id=ana, start_date=d(2), end_date=d(3), label="")
    recurrence.create(conn, {"title": "Revisar bandeja de incidencias", "project_id": p3, "assignee_id": marta,
                             "rule": "laborables", "start_date": today.isoformat()})
    n1 = notes.create_note(conn, {"content": "Reunión seguimiento Alfa\n\n- El cliente confirma ventana de pruebas la semana próxima\n- Pendiente: enviar plantilla de roles\n\nDecisión: mantener conectores actuales."})
    notes.update_note(conn, n1, {"project_id": p1, "kind": "acta"})
    notes.create_note(conn, {"content": "Ideas sueltas\nrevisar plantilla de propuesta y reutilizar sección de riesgos"})
