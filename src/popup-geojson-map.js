/*!

  © Nick Freear, 2016-09-26 | License: MIT.
*/

(function (W) {

  'use strict';

  var defaults = {
    latLng: [ 51.505, -0.09 ], // London, UK!
    zoom: 3,
    minZoom: 2,
    maxZoom: 6,  //Was: 18,
    opacity: 1,
    mapId: 'mapid',
    popupTemplate: '',  // Example: document.querySelector('#popup-template').innerText
    checkProperty: 'audio_url',
    geoJsonUrl: '../data/world-audio-geo-data.json', // alt: "?p=map/audio-geo-data.json", <!--EDIT-ME-->
    tileUrl: 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    //'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}'
    subdomains: '',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    accessToken: '<%= ENV.ACCESS_TOKEN %>'
  };

  var JSON = W.JSON  // Derive "globals".
    , request = W.superagent
    , L = W.L  // Leaflet
    , _ = W._  // Lodash
    , CFG = _.extend(defaults, W.MAP_CONFIG)
    ;

  W.console.debug('Map config:', CFG);

  var mymap = L.map(CFG.mapId).setView(CFG.latLng, CFG.zoom)
    , popup_template = _.template(CFG.popupTemplate)
    , accessToken = _.template(CFG.accessToken)
    ;

  L.tileLayer(CFG.tileUrl, {
    subdomains:  CFG.subdomains,
    attribution: CFG.attribution,
    maxZoom: CFG.maxZoom,
    minZoom: CFG.minZoom,
    // Not needed! //id: 'your.mapbox.project.id',
    accessToken: accessToken(W.ENV || { ENV: {} })
  }).addTo(mymap);

  request
    .get(CFG.geoJsonUrl)
    .then(function (response) {

    var geo_data = JSON.parse(response.text);

    W.console.debug('GeoJSON:', geo_data);

    L.geoJson(geo_data, {
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties[ CFG.checkProperty ]) {
            layer.bindPopup(popup_template(feature.properties));
        }
        else if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
      }
    }).addTo(mymap);

  }, function (error) {
    W.console.error('Superagent HTTP error.', error);
    W.alert('HTTP error. ' + error);
  });

}(window));
