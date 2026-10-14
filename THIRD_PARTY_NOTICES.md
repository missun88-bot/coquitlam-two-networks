# Third-party libraries

The website bundles existing JavaScript/CSS dependencies locally, so visitors
can load the published map without a CDN or external mapping service.

- **OpenLayers** (`resources/ol.js`, `resources/ol.css`) — OpenLayers v10.7.0,
  BSD-2-Clause licence. Source/licence: https://github.com/openlayers/openlayers
- **Proj4js** (`resources/proj4.js`) — Proj4js v2.5.0,
  MIT licence. Source/licence: https://github.com/proj4js/proj4js
- **Source workflow** — spatial data obtained with QuickOSM/QGIS and first
  exported using qgis2web, then adapted into the current OpenLayers page.

Use and redistribution of these libraries remain governed by their respective
licences. Map data licensing is documented separately in `DATA_LICENSE.md`.
