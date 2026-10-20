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

    def d(n: int) -> str:
        return (today + timedelta(days=n)).isoformat()

    def ins(table, **kw):
        if table not in ("project_people", "groupings", "locations", "holidays"):
            kw.setdefault("created_at", ts)
        if table in ("locations", "holidays"):
            kw["created_at"] = ts
        if table not in ("project_people", "absences", "groupings", "locations", "holidays"):
            kw.setdefault("updated_at", ts)
        return conn.execute(f"INSERT INTO {table}({','.join(kw)}) VALUES ({','.join('?' for _ in kw)})", list(kw.values())).lastrowid

    zgz = ins("locations", name="Oficina Norte (ficticia)")
    mad = ins("locations", name="Oficina Centro (ficticia)")
    me = conn.execute("SELECT id FROM people WHERE is_me = 1").fetchone()
    me = me[0] if me else ins("people", name="Yo", is_me=1)
    conn.execute("UPDATE people SET location_id = ?, weekly_capacity_hours = 40 WHERE id = ?", (zgz, me))
    ana = ins("people", name="Ana Ficticia", role="Consultora", weekly_capacity_hours=40, location_id=mad)
    luis = ins("people", name="Luis Ejemplo", role="Desarrollador", weekly_capacity_hours=32, location_id=zgz)
    marta = ins("people", name="Marta Demo", role="Analista", location_id=mad)
    ins("holidays", date=d(3), name="Festivo local (ficticio)", location_id=mad)
    ins("holidays", date=d(10), name="Festivo común (ficticio)", location_id=None)
    c1 = ins("clients", name="Cliente Alfa (ficticio)")
    ins("clients", name="Cliente Beta (ficticio)")
    p1 = ins("projects", name="Migración plataforma Alfa", type="implementacion", client_id=c1, status="activo",
             health="atencion", health_note="Pendiente de accesos del cliente para continuar con las pruebas de conectores",
             summary="Fase de pruebas de integración. Quedan 2 conectores por validar.", summary_updated_at=ts,
             next_action="Confirmar ventana de pruebas con el cliente y enviar plantilla de roles", phase="Pruebas",
             links=jdump([{"label": "Carpeta del proyecto (ejemplo)", "url": "https://example.com/carpeta"}]))
    p2 = ins("projects", name="Propuesta Beta", type="propuesta", status="activo",
             summary="Borrador de alcance enviado internamente.", summary_updated_at=ts, next_action="Revisar estimación con Ana")
    p3 = ins("projects", name="Mantenimiento Gamma", type="mantenimiento", status="activo")
    for p, ppl in ((p1, ((me, 50), (ana, 60), (luis, 100))), (p2, ((me, 30), (ana, 40))), (p3, ((marta, None), (me, 20)))):
        for x, pct in ppl:
            ins("project_people", project_id=p, person_id=x, role="", dedication_pct=pct)
    l1 = ins("groupings", project_id=p1, kind="linea", name="Conectores", position=1)
    l2 = ins("groupings", project_id=p1, kind="linea", name="Roles", position=2)
    ins("milestones", project_id=p1, kind="hito", title="Fin de pruebas de integración", date=d(9))
    ins("milestones", project_id=p1, kind="decision", title="Decidir estrategia de corte", date=d(4))
    ins("milestones", project_id=p2, kind="compromiso", title="Entrega de propuesta", date=d(6))

    t1 = tasks.create_task(conn, {"title": "Validar conector de directorio", "project_id": p1, "workstream_id": l1,
                                  "assignee_id": luis, "reviewer_id": me, "status": "en_revision", "due_date": d(1),
                                  "estimate_hours": 6, "planned_date": d(0), "tags": ["cliente", "pruebas"]})
    tasks.add_step(conn, t1, "Revisar logs de agregación")
    tasks.add_step(conn, t1, "Comparar recuento de cuentas")
    t2 = tasks.create_task(conn, {"title": "Definir matriz de roles", "project_id": p1, "workstream_id": l2,
                                  "assignee_id": me, "status": "en_curso", "due_date": d(3), "priority": "alta", "estimate_hours": 8,
                                  "planned_date": d(1)})
    t3 = tasks.create_task(conn, {"title": "Cargar roles en entorno de pruebas", "project_id": p1, "workstream_id": l2,
                                  "assignee_id": ana, "status": "pendiente", "planned_date": d(2), "parent_id": t2})
    tasks.add_dependency(conn, t3, t2)
    tasks.create_task(conn, {"title": "Credenciales de servicio del cliente", "project_id": p1, "assignee_id": me,
                             "status": "pendiente", "condition": "espera", "wait_on": "Equipo de sistemas del cliente",
                             "wait_reason": "Necesitamos una cuenta de servicio con permisos de lectura sobre el directorio",
                             "follow_up_every_days": 2, "tags": ["cliente"]})
    tasks.create_task(conn, {"title": "Estimación de esfuerzo", "project_id": p2, "assignee_id": ana,
                             "status": "pendiente", "due_date": d(5), "estimate_hours": 4, "planned_date": d(2)})
    tasks.create_task(conn, {"title": "Mejora informe mensual", "project_id": p3, "kind": "mejora",
                             "approval": "pendiente", "status": "backlog", "due_date": d(2)})
    tasks.create_task(conn, {"title": "Idea: automatizar checklist", "status": "backlog", "tags": ["idea"]})
    ins("absences", person_id=ana, start_date=d(2), end_date=d(3), label="")
    recurrence.create(conn, {"title": "Revisar bandeja de incidencias", "project_id": p3, "assignee_id": marta,
                             "rule": "laborables", "start_date": today.isoformat()})
    recurrence.create(conn, {"title": "Seguimiento semanal con el cliente", "project_id": p1, "assignee_id": me,
                             "rule": "semanal", "weekdays": [1, 3], "start_date": today.isoformat()})
    n1 = notes.create_note(conn, {"content": "Reunión seguimiento Alfa\n\n- El cliente confirma ventana de pruebas la semana próxima\n- Pendiente: enviar plantilla de roles\n\nDecisión: mantener conectores actuales."})
    notes.update_note(conn, n1, {"project_id": p1, "kind": "acta"})
    notes.link_task(conn, n1, t2, "Pendiente: enviar plantilla de roles")
    notes.create_note(conn, {"content": "Ideas sueltas\nrevisar plantilla de propuesta y reutilizar sección de riesgos"})
