"""Tests for the features added in 0.6 (server side: the «Live» editor mode setting)."""


def test_note_editor_mode_accepts_live(client):
    assert client.get("/api/settings").json()["note_editor_mode"] == "editar"  # Edit stays the default
    for mode in ("live", "vista_previa", "editar"):
        r = client.patch("/api/settings", json={"note_editor_mode": mode})
        assert r.status_code == 200 and r.json()["note_editor_mode"] == mode
    bad = client.patch("/api/settings", json={"note_editor_mode": "wysiwyg"})
    assert bad.status_code == 422 and bad.json()["message_key"] == "Modo de editor no admitido"


def test_live_mode_survives_export_and_restore(client):
    client.patch("/api/settings", json={"note_editor_mode": "live"})
    data = client.get("/api/export/full").json()
    client.patch("/api/settings", json={"note_editor_mode": "editar"})
    assert client.post("/api/restore", json={"data": data, "confirm": True}).status_code == 200
    assert client.get("/api/settings").json()["note_editor_mode"] == "live"
