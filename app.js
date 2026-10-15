/* Coquitlam's two synchronized networks, adapted from the supplied qgis2web OpenLayers export.
   Coordinate reference system: EPSG:3347 (NAD83 / Statistics Canada Lambert).
   Data source: OpenStreetMap contributors; original QuickOSM/qgis2web export.
*/
(function () {
  'use strict';
  const MAP_BG = '#101820';
  const PROJ = 'EPSG:3347';
  proj4.defs(PROJ, '+proj=lcc +lat_0=63.390675 +lon_0=-91.8666666666667 +lat_1=49 +lat_2=77 +x_0=6200000 +y_0=3000000 +datum=NAD83 +units=m +no_defs');
  ol.proj.proj4.register(proj4);

  const reader = new ol.format.GeoJSON();
  function makeSource(data) {
    return new ol.source.Vector({
      features: reader.readFeatures(data, {dataProjection:'EPSG:4326', featureProjection:PROJ}),
      attributions: '© OpenStreetMap contributors'
    });
  }
  const vehicles = makeSource(window.COQUITLAM_VEHICLES);
  const walking = makeSource(window.COQUITLAM_WALKING);
  // Derive the real extent of BOTH networks; the original QGIS canvas extent cropped some eastern roads.
  const FULL_EXTENT = ol.extent.buffer(ol.extent.extend(vehicles.getExtent().slice(), walking.getExtent()), 650);

  // Road widths and colour are based on OSM "highway" CLASSIFICATION, not measured physical width.
  // zIndex puts important routes above local streets where lines intersect.
  const roadTypes = {
    motorway:      {width:3.7, colour:'#ffb66c', order:5, halo:true},
    trunk:         {width:3.5, colour:'#ffb66c', order:5, halo:true},
    primary:       {width:2.6, colour:'#f79b59', order:4, halo:true},
    secondary:     {width:2.15,colour:'#f79b59', order:4, halo:true},
    tertiary:      {width:1.55,colour:'#ed854e', order:3, halo:false},
    residential:   {width:0.95,colour:'#d27848', order:2, halo:false},
    unclassified:  {width:0.95,colour:'#d27848', order:2, halo:false},
    living_street: {width:0.95,colour:'#d27848', order:2, halo:false},
    service:       {width:0.55,colour:'#9c6348', order:1, halo:false}
  };
  const cache = {};
  function vehicleStyle(feature, resolution) {
    const roadClass = feature.get('highway') || 'service';
    const kind = roadTypes[roadClass] || roadTypes.service;
    // Subtle boost as visitors zoom in; never let thin streets dominate the city overview.
    const factor = resolution < 5 ? 1.3 : (resolution < 15 ? 1.13 : 1);
    const key = roadClass + ':' + factor;
    if (!cache[key]) {
      const main = new ol.style.Style({
        stroke: new ol.style.Stroke({color:kind.colour,width:kind.width*factor,lineCap:'round',lineJoin:'round'}),
        zIndex:kind.order*10+1
      });
      cache[key] = kind.halo ? [
        new ol.style.Style({stroke:new ol.style.Stroke({color:'rgba(255,158,86,0.19)',width:(kind.width+2.2)*factor,lineCap:'round',lineJoin:'round'}),zIndex:kind.order*10}),
        main
      ] : main;
    }
    return cache[key];
  }
  // Named major roads appear only as the visitor zooms in. A separate decluttered
  // layer preserves the underlying road-width hierarchy and prevents labels from
  // colliding with one another. Labels follow the line geometry.
  const majorLabelStyles = new Map();
  const labelResolution = {motorway:18, trunk:18, primary:9, secondary:9, tertiary:4.5};
  function vehicleLabelStyle(feature, resolution) {
    const type = feature.get('highway');
    const label = feature.get('name');
    if (!label || !(type in labelResolution) || resolution > labelResolution[type]) return null;
    const prominent = type === 'motorway' || type === 'trunk';
    const key = type + '|' + label;
    if (!majorLabelStyles.has(key)) {
      majorLabelStyles.set(key, new ol.style.Style({
        text: new ol.style.Text({
          text:label,
          placement:'line',
          maxAngle:Math.PI / 5,
          overflow:false,
          font:prominent?'700 15px "Segoe UI", Arial, sans-serif':'650 14px "Segoe UI", Arial, sans-serif',
          fill:new ol.style.Fill({color:prominent?'#ffe1b5':'#f6d0af'}),
          stroke:new ol.style.Stroke({color:'rgba(10,19,25,0.98)',width:4}),
          padding:[3,6,3,6]
        }),
        zIndex:100
      }));
    }
    return majorLabelStyles.get(key);
  }
  const walkingStyles = [1.08,1.21,1.4].map(width=>new ol.style.Style({
    stroke:new ol.style.Stroke({color:'#45C9A2',width:width,lineCap:'round',lineJoin:'round'}),zIndex:2
  }));
  function pedestrianStyle(_feature,resolution) {return walkingStyles[resolution<5?2:resolution<15?1:0];}
  const view = new ol.View({projection:PROJ,center:[4039548,1995580],zoom:9,maxZoom:19,minZoom:6,constrainResolution:false});

  function makeMap(id, source, styleFn, roadLabels) {
    const layers = [new ol.layer.Vector({source,style:styleFn,declutter:false,renderBuffer:140})];
    if (roadLabels) layers.push(new ol.layer.Vector({
      source,style:vehicleLabelStyle,declutter:true,renderBuffer:200
    }));
    return new ol.Map({
      target:id,
      layers,
      view:view, // deliberately SHARED: pan/zoom on either map updates both
      controls:[new ol.control.Zoom(), new ol.control.Attribution({collapsible:true})],
      moveTolerance:4
    });
  }
  const vehicleMap = makeMap('map-vehicles',vehicles,vehicleStyle,true);
  const walkingMap = makeMap('map-walking',walking,pedestrianStyle);

  function resetView() {
    vehicleMap.updateSize();walkingMap.updateSize();
    const size1 = vehicleMap.getSize(), size2 = walkingMap.getSize();
    if (!size1 || !size2) return;
    // One view/resolution for both panels. Use the SMALLER of the two viewports.
    const w = Math.min(size1[0],size2[0]);
    const h = Math.min(size1[1],size2[1]);
    view.fit(FULL_EXTENT,{size:[w,h],padding:[30,35,30,35],duration:0,maxZoom:15});
  }
  document.getElementById('reset-view').addEventListener('click',resetView);

  // Hover inspector for named and unnamed OSM features on BOTH maps. Keep touch
  // single-click support; hover tooltips follow the cursor and avoid panel edges.
  function attachInspector(map, infoId, network) {
    const info = document.getElementById(infoId);
    const parent = info.parentElement;
    let currentFeature = null;
    function hide() {info.hidden = true;currentFeature = null;}
    function setInfo(feature) {
      if (feature === currentFeature && !info.hidden) return;
      currentFeature = feature;
      const recordedName = String(feature.get('name')||'').trim();
      const name = recordedName || (network === 'vehicles' ? 'Unnamed road' : 'Unnamed path');
      const type = String(feature.get('highway') || 'route').replaceAll('_',' ');
      info.replaceChildren();
      const title=document.createElement('div');title.className='feature-name';title.textContent=name;
      const sub=document.createElement('div');sub.className='feature-type';
      const category = network==='vehicles' ? 'Road type' : 'Path type';
      sub.textContent=category+': '+type;
      info.append(title,sub);
      if (!recordedName) {
        const note=document.createElement('div');note.className='feature-no-name';
        note.textContent='Name not recorded in OpenStreetMap';
        info.append(note);
      }
      info.hidden=false;
    }
    function placeInfo(pixel) {
      // Position relative to the OpenLayers target, which fills the map-frame.
      const container = parent.getBoundingClientRect();
      const measured = info.getBoundingClientRect();
      const gap = 14, margin = 9;
      let left = pixel[0]+gap;
      let top = pixel[1]+gap;
      if (left + measured.width > container.width-margin) left = pixel[0]-measured.width-gap;
      if (top + measured.height > container.height-margin) top = pixel[1]-measured.height-gap;
      info.style.left=Math.max(margin,Math.min(left,container.width-measured.width-margin))+'px';
      info.style.top=Math.max(margin,Math.min(top,container.height-measured.height-margin))+'px';
    }
    function showAt(event) {
      // Labels and linework use the same source; query only the base line layer.
      const hit=map.forEachFeatureAtPixel(event.pixel,feature=>feature,{
        hitTolerance:6,
        layerFilter:layer=>layer === map.getLayers().item(0)
      });
      map.getTargetElement().style.cursor=hit?'pointer':'grab';
      if (!hit) {hide();return;}
      setInfo(hit);
      placeInfo(event.pixel);
    }
    map.on('pointermove',function(event){
      if (event.dragging){hide();return;}
      showAt(event);
    });
    map.on('singleclick',showAt); // touchscreens and click-to-inspect
    map.on('pointerdrag',hide);
    map.on('movestart',hide);
    map.getTargetElement().addEventListener('pointerleave',hide);
  }
  attachInspector(vehicleMap,'info-vehicles','vehicles');
  attachInspector(walkingMap,'info-walking','walking');

  const format = new Intl.NumberFormat('en-CA');
  document.getElementById('data-count').textContent = `${format.format(vehicles.getFeatures().length)} road segments · ${format.format(walking.getFeatures().length)} mapped paths`;
  requestAnimationFrame(resetView);
  let previousMobile = window.matchMedia('(max-width:720px)').matches;
  window.addEventListener('resize',function(){
    vehicleMap.updateSize(); walkingMap.updateSize();
    const mobile = window.matchMedia('(max-width:720px)').matches;
    if(mobile!==previousMobile){previousMobile=mobile;resetView();}
  });
})();
