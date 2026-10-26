"""Persistent, versioned global world regions for Vedras Reiche.

This is an internal game-service data layer, NOT an authenticated HTTP API.
A real multiplayer server must resolve player identity from its session, call
player_view with that trusted ID, and redact sprite/terrain tile binaries too.
"""
from __future__ import annotations

from contextlib import contextmanager, closing
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sqlite3


class WorldConflict(ValueError):
    """An operation would change published immutable or stale geography."""


class UnknownCell(ValueError):
    """A requested discovery does not exist in generated geography."""


def _now():
    return datetime.now(timezone.utc).isoformat()


def _ident(value, label):
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,63}", value):
        raise ValueError(label + " must be a safe nonempty identifier (max 64 chars)")
    return value


def _coordinate(value):
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError("global q/r coordinates must be integers")
    return value


def _json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)


def _position(raw):
    if isinstance(raw, dict):
        return _coordinate(raw["q"]), _coordinate(raw["r"])
    if isinstance(raw, (tuple, list)) and len(raw) == 2:
        return _coordinate(raw[0]), _coordinate(raw[1])
    raise ValueError("expected (q,r) coordinates")


def _positions(values, limit=4096):
    positions = list(dict.fromkeys(_position(p) for p in values))
    if len(positions) > limit:
        raise ValueError("too many coordinates in one operation")
    return positions


def _chunks(seq, size=350):
    for start in range(0, len(seq), size):
        yield seq[start:start + size]


class PersistentWorldStore:
    """SQLite-backed global axial-hex geography and discovery history."""

    def __init__(self, database):
        self.database = str(database)
        if self.database == ":memory:":
            raise ValueError("persistent worlds require a SQLite filename, not :memory:")
        Path(self.database).parent.mkdir(parents=True, exist_ok=True)
        with closing(self._connect()) as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS worlds (
                    world_id TEXT PRIMARY KEY, seed TEXT NOT NULL,
                    region_size INTEGER NOT NULL,
                    generator_version TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS regions (
                    world_id TEXT NOT NULL, region_q INTEGER NOT NULL,
                    region_r INTEGER NOT NULL, revision INTEGER NOT NULL,
                    generator_version TEXT NOT NULL, content_version TEXT NOT NULL,
                    edge_json TEXT NOT NULL, published_at TEXT NOT NULL,
                    PRIMARY KEY (world_id, region_q, region_r),
                    FOREIGN KEY (world_id) REFERENCES worlds(world_id)
                );
                CREATE TABLE IF NOT EXISTS hexes (
                    world_id TEXT NOT NULL, q INTEGER NOT NULL, r INTEGER NOT NULL,
                    region_q INTEGER NOT NULL, region_r INTEGER NOT NULL,
                    base_json TEXT NOT NULL, base_revision INTEGER NOT NULL,
                    PRIMARY KEY (world_id, q, r),
                    FOREIGN KEY (world_id, region_q, region_r)
                      REFERENCES regions(world_id, region_q, region_r)
                );
                CREATE INDEX IF NOT EXISTS hexes_region
                  ON hexes(world_id, region_q, region_r);
                CREATE TABLE IF NOT EXISTS region_revisions (
                    world_id TEXT NOT NULL, region_q INTEGER NOT NULL,
                    region_r INTEGER NOT NULL, revision INTEGER NOT NULL,
                    generator_version TEXT NOT NULL, content_version TEXT NOT NULL,
                    edge_json TEXT NOT NULL, cells_json TEXT NOT NULL,
                    published_at TEXT NOT NULL,
                    PRIMARY KEY (world_id, region_q, region_r, revision)
                );
                CREATE TABLE IF NOT EXISTS global_discoveries (
                    world_id TEXT NOT NULL, q INTEGER NOT NULL, r INTEGER NOT NULL,
                    first_player_id TEXT NOT NULL, first_seen_at TEXT NOT NULL,
                    base_revision INTEGER NOT NULL,
                    PRIMARY KEY (world_id, q, r),
                    FOREIGN KEY (world_id, q, r)
                      REFERENCES hexes(world_id, q, r) ON DELETE RESTRICT
                );
                CREATE TABLE IF NOT EXISTS player_discoveries (
                    world_id TEXT NOT NULL, player_id TEXT NOT NULL,
                    q INTEGER NOT NULL, r INTEGER NOT NULL,
                    first_seen_at TEXT NOT NULL,
                    PRIMARY KEY (world_id, player_id, q, r),
                    FOREIGN KEY (world_id, q, r)
                      REFERENCES hexes(world_id, q, r) ON DELETE RESTRICT
                );
                CREATE INDEX IF NOT EXISTS discovered_by_player
                  ON player_discoveries(world_id, player_id);
                CREATE TABLE IF NOT EXISTS world_events (
                    event_id TEXT PRIMARY KEY, world_id TEXT NOT NULL,
                    q INTEGER NOT NULL, r INTEGER NOT NULL,
                    event_type TEXT NOT NULL, state_json TEXT NOT NULL,
                    visibility TEXT NOT NULL, recorded_at TEXT NOT NULL,
                    FOREIGN KEY (world_id, q, r)
                      REFERENCES hexes(world_id, q, r) ON DELETE RESTRICT
                );
                CREATE INDEX IF NOT EXISTS events_by_hex
                  ON world_events(world_id, q, r);
            """)
            db.commit()

    def _connect(self):
        db = sqlite3.connect(self.database, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys=ON")
        db.execute("PRAGMA busy_timeout=10000")
        return db

    @contextmanager
    def _write(self):
        with closing(self._connect()) as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                yield db
                db.commit()
            except Exception:
                db.rollback()
                raise

    @staticmethod
    def _world(db, world_id):
        world = db.execute("SELECT * FROM worlds WHERE world_id=?", (world_id,)).fetchone()
        if world is None:
            raise ValueError("unknown world: " + world_id)
        return world

    def world(self, world_id):
        """Read immutable world identity for publication and migration checks."""
        with closing(self._connect()) as db:
            row = db.execute("SELECT * FROM worlds WHERE world_id=?",
                             (_ident(world_id, "world_id"),)).fetchone()
            return dict(row) if row else None

    def create_world(self, world_id, seed, generator_version, region_size=16):
        world_id = _ident(world_id, "world_id")
        if not isinstance(seed, str) or not seed or len(seed) > 256:
            raise ValueError("world seed must be a nonempty string (max 256 chars)")
        if not isinstance(region_size, int) or isinstance(region_size, bool) or region_size not in (16, 32):
            raise ValueError("supported region sizes: 16 or 32 axial coordinates")
        if not isinstance(generator_version, str) or not generator_version:
            raise ValueError("generator version is required")
        with self._write() as db:
            existing = db.execute("SELECT * FROM worlds WHERE world_id=?", (world_id,)).fetchone()
            if existing:
                if (existing["seed"], existing["region_size"], existing["generator_version"]) != (seed, region_size, generator_version):
                    raise WorldConflict("world identity cannot silently change seed, size or generator")
                return dict(existing)
            db.execute("INSERT INTO worlds VALUES (?,?,?,?,?)",
                       (world_id, seed, region_size, generator_version, _now()))
            return dict(self._world(db, world_id))

    def publish_region(self, world_id, region_q, region_r, cells,
                       generator_version, content_version,
                       edge_constraints=None, expected_revision=0,
                       dry_run=False):
        """Publish a sparse or complete region; previously discovered cells freeze.

        expected_revision is required to protect against accidental concurrent
        regeneration. Regions use floor division (also for negative axial q/r).
        """
        world_id = _ident(world_id, "world_id")
        region_q, region_r = _coordinate(region_q), _coordinate(region_r)
        if not isinstance(generator_version, str) or not generator_version:
            raise ValueError("generator_version required")
        if not isinstance(content_version, str) or not content_version:
            raise ValueError("content_version required")
        if not isinstance(expected_revision, int) or expected_revision < 0:
            raise ValueError("expected_revision must be a nonnegative integer")
        if edge_constraints is None:
            edge_constraints = {}
        if not isinstance(edge_constraints, dict):
            raise ValueError("edge constraints must be a mapping")
        edges = _json(edge_constraints)
        incoming = {}
        for raw in cells:
            if not isinstance(raw, dict):
                raise ValueError("every cell must be a dictionary")
            q, r = _position(raw)
            if (q, r) in incoming:
                raise ValueError("duplicate global hex coordinates")
            if not isinstance(raw.get("terrainId"), str) or not raw["terrainId"]:
                raise ValueError("each cell requires terrainId")
            incoming[q, r] = _json({k: v for k, v in raw.items() if k not in ("q", "r")})
        with self._write() as db:
            size = self._world(db, world_id)["region_size"]
            if any(q // size != region_q or r // size != region_r for q, r in incoming):
                raise ValueError("hex belongs to another global region")
            current = db.execute(
                "SELECT * FROM regions WHERE world_id=? AND region_q=? AND region_r=?",
                (world_id, region_q, region_r)).fetchone()
            revision = current["revision"] if current else 0
            if revision != expected_revision:
                raise WorldConflict("stale region revision: expected %d, current %d" %
                                    (expected_revision, revision))
            previous = {(row["q"], row["r"]): row for row in db.execute(
                "SELECT * FROM hexes WHERE world_id=? AND region_q=? AND region_r=?",
                (world_id, region_q, region_r))}
            frozen = {(row["q"], row["r"]) for row in db.execute(
                """SELECT g.q,g.r FROM global_discoveries g
                   JOIN hexes h ON (g.world_id=h.world_id AND g.q=h.q AND g.r=h.r)
                   WHERE h.world_id=? AND h.region_q=? AND h.region_r=?""",
                (world_id, region_q, region_r))}
            if current and frozen and current["edge_json"] != edges:
                raise WorldConflict("discovered region edge constraints are frozen")
            for pos in frozen:
                if pos not in incoming or previous[pos]["base_json"] != incoming[pos]:
                    raise WorldConflict("discovered geography cannot be edited or removed: " + str(pos))
            next_rev = revision + 1
            if dry_run:
                # Publication validation without altering historical world data.
                return {"world_id": world_id, "region_q": region_q,
                        "region_r": region_r, "revision": next_rev,
                        "cell_count": len(incoming), "frozen_count": len(frozen)}
            published = _now()
            db.execute("""INSERT INTO regions VALUES (?,?,?,?,?,?,?,?)
                          ON CONFLICT(world_id,region_q,region_r) DO UPDATE SET
                            revision=excluded.revision,
                            generator_version=excluded.generator_version,
                            content_version=excluded.content_version,
                            edge_json=excluded.edge_json,
                            published_at=excluded.published_at""",
                       (world_id, region_q, region_r, next_rev, generator_version,
                        content_version, edges, published))
            # Delete only content that no player ever discovered. FK safety
            # protects revealed cells even if validation above changes.
            for pos in previous:
                if pos not in incoming:
                    db.execute("DELETE FROM hexes WHERE world_id=? AND q=? AND r=?",
                               (world_id, *pos))
            for (q, r), basis in incoming.items():
                if (q, r) in frozen:
                    continue  # Preserve first-discovery basis and revision.
                db.execute("""INSERT INTO hexes VALUES (?,?,?,?,?,?,?)
                              ON CONFLICT(world_id,q,r) DO UPDATE SET
                               region_q=excluded.region_q,
                               region_r=excluded.region_r,
                               base_json=excluded.base_json,
                               base_revision=excluded.base_revision""",
                           (world_id, q, r, region_q, region_r, basis, next_rev))
            snapshot = [{"q": q, "r": r, **json.loads(basis)}
                        for (q, r), basis in sorted(incoming.items())]
            db.execute("INSERT INTO region_revisions VALUES (?,?,?,?,?,?,?,?,?)",
                       (world_id, region_q, region_r, next_rev,
                        generator_version, content_version, edges,
                        _json(snapshot), published))
            return {"world_id": world_id, "region_q": region_q, "region_r": region_r,
                    "revision": next_rev, "cell_count": len(incoming),
                    "frozen_count": len(frozen)}

    def region(self, world_id, region_q, region_r):
        """Server/editor-only metadata. Never expose this to unknown clients."""
        with closing(self._connect()) as db:
            row = db.execute("""SELECT * FROM regions
                WHERE world_id=? AND region_q=? AND region_r=?""",
                (_ident(world_id, "world_id"), _coordinate(region_q),
                 _coordinate(region_r))).fetchone()
            if row is None:
                return None
            result = dict(row)
            result["edge_constraints"] = json.loads(result.pop("edge_json"))
            return result

    def rollback_region(self, world_id, region_q, region_r, target_revision,
                        expected_revision):
        """Re-publish an archived revision, respecting every discovery lock."""
        with closing(self._connect()) as db:
            old = db.execute("""SELECT * FROM region_revisions WHERE
                world_id=? AND region_q=? AND region_r=? AND revision=?""",
                (world_id, region_q, region_r, target_revision)).fetchone()
            if old is None:
                raise ValueError("unknown archived region revision")
            snapshot = dict(old)
        return self.publish_region(world_id, region_q, region_r,
            json.loads(snapshot["cells_json"]), snapshot["generator_version"],
            snapshot["content_version"],
            edge_constraints=json.loads(snapshot["edge_json"]),
            expected_revision=expected_revision)

    def discover(self, world_id, player_id, coordinates):
        world_id, player_id = _ident(world_id, "world_id"), _ident(player_id, "player_id")
        positions = _positions(coordinates)
        with self._write() as db:
            self._world(db, world_id)
            new_global = new_personal = 0
            for q, r in positions:
                row = db.execute("""SELECT base_revision FROM hexes
                   WHERE world_id=? AND q=? AND r=?""", (world_id, q, r)).fetchone()
                if row is None:
                    raise UnknownCell("hex not generated: (%d,%d)" % (q, r))
                stamp = _now()
                before = db.total_changes
                db.execute("INSERT OR IGNORE INTO global_discoveries VALUES (?,?,?,?,?,?)",
                           (world_id, q, r, player_id, stamp, row["base_revision"]))
                new_global += db.total_changes - before
                before = db.total_changes
                db.execute("INSERT OR IGNORE INTO player_discoveries VALUES (?,?,?,?,?)",
                           (world_id, player_id, q, r, stamp))
                new_personal += db.total_changes - before
            return {"global_first_discoveries": new_global,
                    "player_first_discoveries": new_personal}

    def append_event(self, world_id, event_id, q, r, event_type, state,
                     visibility="visible"):
        """Persist game changes without altering the immutable geographic base."""
        world_id = _ident(world_id, "world_id")
        event_id, event_type = _ident(event_id, "event_id"), _ident(event_type, "event_type")
        if visibility not in ("visible", "discovered"):
            raise ValueError("event visibility must be visible or discovered")
        if not isinstance(state, dict):
            raise ValueError("event state must be a mapping")
        q, r = _coordinate(q), _coordinate(r)
        with self._write() as db:
            self._world(db, world_id)
            db.execute("INSERT INTO world_events VALUES (?,?,?,?,?,?,?,?)",
                       (event_id, world_id, q, r, event_type, _json(state),
                        visibility, _now()))
            return event_id

    def player_view(self, world_id, player_id, coordinates, visible=()):
        """Player-filtered map DTO; UNKNOWN cells expose ONLY q/r and state.

        'visible' must be decided by trusted game rules, never user-supplied
        request JSON. Unit/temporary events are hidden outside current LOS.
        """
        world_id, player_id = _ident(world_id, "world_id"), _ident(player_id, "player_id")
        positions = _positions(coordinates)
        visible_set = set(_positions(visible))
        if not visible_set.issubset(set(positions)):
            raise ValueError("LOS coordinates must be within requested coordinates")
        known = {}
        events = {}
        with closing(self._connect()) as db:
            self._world(db, world_id)
            for part in _chunks(positions):
                placeholder = ",".join("(?,?)" for _ in part)
                args = (world_id, player_id, *(value for pair in part for value in pair))
                for row in db.execute("""SELECT h.q,h.r,h.base_json FROM hexes h
                    JOIN player_discoveries p ON
                    (p.world_id=h.world_id AND p.q=h.q AND p.r=h.r)
                    WHERE p.world_id=? AND p.player_id=?
                    AND (h.q,h.r) IN (""" + placeholder + ")", args):
                    known[row["q"], row["r"]] = json.loads(row["base_json"])
            keys = list(known)
            for part in _chunks(keys):
                placeholder = ",".join("(?,?)" for _ in part)
                args = (world_id, *(value for pair in part for value in pair))
                for row in db.execute("""SELECT q,r,event_id,event_type,state_json,
                    visibility FROM world_events WHERE world_id=?
                    AND (q,r) IN (""" + placeholder + ") ORDER BY recorded_at,event_id", args):
                    pos = row["q"], row["r"]
                    if pos in visible_set or row["visibility"] == "discovered":
                        events.setdefault(pos, []).append({
                            "event_id": row["event_id"],
                            "type": row["event_type"],
                            "state": json.loads(row["state_json"])})
        result = []
        for q, r in positions:
            pos = q, r
            if pos not in known:
                result.append({"q": q, "r": r, "visibility": "unknown"})
                continue
            result.append({"q": q, "r": r,
                "visibility": "visible" if pos in visible_set else "explored",
                "base": known[pos], "events": events.get(pos, [])})
        return result
