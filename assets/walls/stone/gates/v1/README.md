# Stone gates v1 — all six facings

Closed stone gate sprites for NO (0), O (1), SO (2), SW (3), W (4). NW (5) reuses the SO image without mirroring, but uses the direction-5 anchor. All six facings use the matching stone-wall footprint and common stone piers/shadows. Diagonals are 468 × 501 RGBA; edge-on gates are 120 × 648 RGBA and preserve the original wall alpha silhouette, with a modified upper gate lintel/parapet only. NO is an independently painted variant with right-hand illumination. No runtime rotation or distortion. The editor supports all six facings; palisade gates are not yet implemented. Nature collision clearance uses the footprint of the plant plus construction width and pier area, non-destructively.

### Edge-on gates (v3)
East and west use a horizontally mirrored sprite with a wider center gatehouse (~86 source pixels instead of ~59); canvas dimensions and endpoints remain unchanged. The common global cast-shadow direction remains independent of facing.

### Nature clearance
Constructing walls/gates now removes overlapping saved nature instances and legacy nature assignments, and prevents automatic/manual replanting on the occupied corridor. The asset library itself remains unchanged. Render-time clearance also handles legacy demo flora and relief-adjusted foot positions.
