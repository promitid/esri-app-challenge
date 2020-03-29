require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/Layer"
], function(Map, MapView, FeatureLayer, Layer) {

    const map = new Map({
        basemap: "dark-gray"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-79.38, 43.65],
        zoom: 13
    });

    const neighborhoodRenderer = {
        type: "simple"
    }

    const neighborhoodLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/torontocovid/FeatureServer/0",
        renderer: neighborhoodRenderer
    });

    map.add(neighborhoodLayer);

});





// require([
//     "esri/WebMap",
//     "esri/views/MapView"
//   ], function(WebMap, MapView) {

//     var webmap = new WebMap({
//       portalItem: {
//         id: "e564bdd85ead4c2895e868b8aa26b987"
//       }
//     });

//     var view = new MapView({
//       container: "viewDiv",
//       map: webmap
//       //center: [-118.80500,34.02700],
//       //zoom: 13
//     });

// });