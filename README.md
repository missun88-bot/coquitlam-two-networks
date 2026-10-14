# Two Networks, One City — Coquitlam, BC

**Faster through the city. Further into its landscape.**

A two-panel interactive map comparing Coquitlam's roads and mapped pedestrian
paths. Pan or zoom either map and the other follows, showing two ways to
experience the same place: roads that move people across the city and paths
that lead into parks, trails, creeks and the mountain landscape.

**Designed and developed by Iris Sun**  
**#30DayMapChallenge 2026 · OpenStreetMap theme**

## Explore the visualization

- **City for Vehicles** — streets classified by OpenStreetMap road category,
  with graduated orange line weights and labels for major named roads on zoom.
- **City for People** — turquoise mapped footways, paths, pedestrian ways and
  steps, including routes beyond the vehicle street network.
- **Synchronized views** — pan/zoom either map; both use the same view and
  **EPSG:3347 / NAD83 Statistics Canada Lambert** projection.
- **Interactive identification** — hover a line, or tap on a touchscreen, to
  see the recorded OSM name and path/road type. Many pedestrian ways have no
  recorded OSM name, even beside a named road.
- **Responsive** — side by side on larger screens; stacked on mobile.

The contrasts are interpretive: line width reflects OSM road class, not actual
traffic volume or width; the pathways layer is not a complete pedestrian
network or a measured walking-distance analysis.

## Publish with GitHub Pages

1. Create a **public** repository, e.g. `coquitlam-two-networks`.
2. Upload **all the files and folders in this repository package**, with
   `index.html` in the repository root (not inside an extra enclosing folder).
3. Open your repository's **Settings → Pages**.
4. Set **Source: Deploy from a branch**, **Branch: `main`**, and **Folder: `/(root)`**; save.
5. After GitHub finishes deploying, visit
   `https://YOUR-USERNAME.github.io/coquitlam-two-networks/` (replace username
   and repository name as appropriate).

There is **no build step** and no need for a server-side GIS service.
The checked-in `.nojekyll` file allows these ready-made static assets to be
served directly.

## Test locally

From the extracted repository folder, double-click `index.html` to open it in
Edge or Chrome. If a browser blocks local loading, start a local web server:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8000/ . This package bundles all map dependencies
and geographic data locally; no live basemap tile requests are needed.

## What's in the repository

```text
index.html                 Main page, story, credits and map containers
styles.css                 Responsive layout and typography
app.js                     OpenLayers maps, labels, tooltips and interaction
data/
  vehicles.js              OSM-derived road geometries and attributes
  walking.js               OSM-derived pedestrian geometries and attributes
resources/
  ol.js / ol.css           Local OpenLayers library
  proj4.js                 Local projection support
.nojekyll                  GitHub Pages static publishing
DATA_LICENSE.md            OpenStreetMap data licence/attribution
THIRD_PARTY_NOTICES.md     External dependency notices
```

## Editing after publication

- **Text, footer and content:** `index.html`
- **Fonts, legend, layout:** `styles.css`
- **Road hierarchy:** `roadTypes` in `app.js`
- **Road-label thresholds:** `labelResolution` in `app.js` (map metres/pixel;
  lower numbers mean labels wait until further zoom-in)
- **Map tooltip behaviour:** `attachInspector` in `app.js`

Keep the `data/` and `resources/` folders alongside `index.html`. Edits here
will not change the original QGIS GeoPackage/project; keep the QGIS source
separately if you plan to re-export.

## Credits and licensing

- Design and development: **Iris Sun**
- Map data: **© OpenStreetMap contributors**, ODbL 1.0 —
  https://www.openstreetmap.org/copyright
- Geographic workflow: **QGIS · QuickOSM · qgis2web**
- Web mapping: **OpenLayers · Proj4js**
- Projection: **EPSG:3347 — NAD83 / Statistics Canada Lambert**

See [data licensing](DATA_LICENSE.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
