require([
    "esri/widgets/Sketch/SketchViewModel",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/Graphic",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/geometry/geometryEngine",
    "esri/widgets/Expand",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/core/watchUtils"
  ], function(
    SketchViewModel,
    Polyline,
    Point,
    Graphic,
    Map,
    MapView,
    FeatureLayer,
    GraphicsLayer,
    geometryEngine,
    Expand,
    Legend,
    Search,
    watchUtils
  ) {
    // App 'globals'
    let sketchViewModel, featureLayerView, pausableWatchHandle, chartExpand;

    let centerGraphic,
      edgeGraphic,
      polylineGraphic,
      bufferGraphic,
      centerGeometryAtStart,
      labelGraphic;

    const unit = "kilometers";

    // Create layers
    const graphicsLayer = new GraphicsLayer();
    const graphicsLayer2 = new GraphicsLayer();

    const hospitalLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/hospitals/FeatureServer/0",
        outfields: ["*"],
        popupTemplate: {  
            title: "{ENGLISH_NA}" 
        },
        title: "Hospitals"
    });

    const neighborhoodLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/torontocovid/FeatureServer/0",
        outfields: ["*"],
        popupTemplate: {  
            title: "{Name}",
            content: "The vulnerability score for this neighbourhood is." 
        },
        title: "Neighbourhoods"
    });

    const seniorLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Ministry_of_Health_Service_Provider_Locations/FeatureServer/0",
        outfields: ["*"],
        popupTemplate: {  
            title: "{ENGLISH_NA}" 
        },
        title: "Senior Facilities"
    });

    // Create map
    const map = new Map({
      basemap: "dark-gray",
      layers: [neighborhoodLayer, seniorLayer, hospitalLayer, graphicsLayer2, graphicsLayer]
    });    

    // Create view
    const view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 12,
      center: [-79.38, 43.65],
      constraints: {
        maxScale: 0,
        minScale: 300000
      }
    });

    // Update UI
    setUpAppUI();
    setUpSketch();

    function setUpAppUI() {
      // When layer is loaded, create a watcher to trigger drawing of the buffer polygon
      view.whenLayerView(neighborhoodLayer).then(function(layerView) {
        featureLayerView = layerView;

        pausableWatchHandle = watchUtils.pausable(
          layerView,
          "updating",
          function(val) {
            if (!val) {
              drawBufferPolygon();
            }
          }
        );

        // Display directions when the layerView is loading
        watchUtils.whenFalseOnce(layerView, "updating", function() {
          view.popup.open({
            title: "Center point",
            content:
              "Drag this point to move the buffer.<br/> ",
            location: centerGraphic.geometry
          });
          view.popup.alignment = "top-left";
        });
      });

      view.when(function() {
        // Display the chart in an Expand widget
        chartExpand = new Expand({
          expandIconClass: "esri-icon-chart",
          expandTooltip: "COVID-19 Neighbourhood Vulnerability",
          expanded: false,
          view: view,
          content: document.getElementById("chartPanel")
        });

        const search = new Search({
          view: view,
          resultGraphicEnabled: false,
          popupEnabled: false
        });

        // Resume drawBufferPolygon() function; user searched for a new location
        // Must update the buffer polygon and re-run the stats query
        search.on("search-complete", function() {
          pausableWatchHandle.resume();
        });

        // Legend widget
        const legend = new Legend({
          view: view,
          layerInfos: [
            {
              layer: neighborhoodLayer,
              title: "Legend Widget Title"
            }
          ]
        });

        // Display the Legend in an Expand widget
        const legendExpand = new Expand({
          expandTooltip: "Show Legend",
          expanded: false,
          view: view,
          content: legend
        });

        // Add our components to the UI
        view.ui.add(chartExpand, "bottom-left");
        view.ui.add(search, "top-right");
        view.ui.add(legendExpand, "bottom-right");
      });

      // Close the 'help' popup when view is focused
      view.watch("focused", function(newValue) {
        if (newValue) {
          view.popup.close();
        }
      });
    }

    /*****************************************************************
     * Create SketchViewModel and wire up event listeners
     *****************************************************************/
    function setUpSketch() {
      sketchViewModel = new SketchViewModel({
        view: view,
        layer: graphicsLayer
      });

      // Listen to SketchViewModel's update event so that population pyramid chart
      // is updated as the graphics are updated
      sketchViewModel.on("update", onMove);
    }

    /*********************************************************************
     * Edge or center graphics are being moved. Recalculate the buffer with
     * updated geometry information and run the query stats again.
     *********************************************************************/
    function onMove(event) {
      // If the edge graphic is moving, keep the center graphic
      // at its initial location. Only move edge graphic
      if (
        event.toolEventInfo &&
        event.toolEventInfo.mover.attributes.edge
      ) {
        const toolType = event.toolEventInfo.type;
        if (toolType === "move-start") {
          centerGeometryAtStart = centerGraphic.geometry;
        }
        // keep the center graphic at its initial location when edge point is moving
        else if (toolType === "move" || toolType === "move-stop") {
          centerGraphic.geometry = centerGeometryAtStart;
        }
      }

      // the center or edge graphic is being moved, recalculate the buffer
      const vertices = [
        [centerGraphic.geometry.x, centerGraphic.geometry.y],
        [edgeGraphic.geometry.x, edgeGraphic.geometry.y]
      ];

      // client-side stats query of features that intersect the buffer
      calculateBuffer(vertices);

      // user is clicking on the view... call update method with the center and edge graphics
      if (event.state === "cancel" || event.state === "complete") {
        sketchViewModel.update([edgeGraphic, centerGraphic], {
          tool: "move"
        });
      }
    }

    /*********************************************************************
     * Edge or center point is being updated. Recalculate the buffer with
     * updated geometry information.
     *********************************************************************/
    function calculateBuffer(vertices) {
      // Update the geometry of the polyline based on location of edge and center points
      polylineGraphic.geometry = new Polyline({
        paths: vertices,
        spatialReference: view.spatialReference
      });

      // Recalculate the polyline length and buffer polygon
      const length = geometryEngine.geodesicLength(
        polylineGraphic.geometry,
        unit
      );
      const buffer = geometryEngine.geodesicBuffer(
        centerGraphic.geometry,
        length,
        unit
      );

      // Update the buffer polygon
      bufferGraphic.geometry = buffer;

      // Query neighbourhood statistics that intersect
      // the buffer polygon on the client
      queryStatistics(buffer).then(function(newData) {
        // Create a population pyramid chart from the returned result
        updateInfo(newData);
      });

      // Update label graphic to show the length of the polyline
      labelGraphic.geometry = edgeGraphic.geometry;
      labelGraphic.symbol = {
        type: "text",
        color: "#FFEB00",
        text: length.toFixed(2) + " kilometers",
        xoffset: 50,
        yoffset: 10,
        font: {
          // autocast as Font
          size: 14,
          family: "sans-serif"
        }
      };
    }

    /*********************************************************************
     * Spatial query the census tracts feature layer view for statistics
     * using the updated buffer polygon.
     *********************************************************************/
    function queryStatistics(buffer) {
        // Data storage for the chart
        let population_data = [];
        let vi_data = [];

        // Client-side spatial query:
        const query = featureLayerView.layer.createQuery();

        // Set up statistics definition for client-side query
        // const sumPopulation = {
        //     onStatisticField: "Pop_2016",
        //     outStatisticFieldName: "Pop_2016_Sum",
        //     statisticType: "sum"
        // }
        const statDefinitions = [
            "Pop_2016",
            "VI_Norm"
        ].map(function(fieldName) {
            return {
            onStatisticField: fieldName,
            outStatisticFieldName: fieldName + "_TOTAL",
            statisticType: "sum"
            };
        });
        query.outStatistics = statDefinitions;
        query.geometry = buffer;

        // Query the features on the client using FeatureLayerView.queryFeatures
        return featureLayerView
            .queryFeatures(query)
            .then(function(results) {
                // Statistics query returns a feature with 'stats' as attributes
                const attributes = results.features[0].attributes;
                // Loop through attributes and save the values for use in the population pyramid.
                for (var key in attributes) {
                    if (key.includes("Pop_2016")) {
                        population_data.push(attributes[key]);
                    } else {
                        vi_data.push(-Math.abs(attributes[key]));
                    }
                    // data.push(attributes[key])
                }
                // Return information, seperated by gender
                return [population_data, vi_data];
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    /***************************************************
     * Draw the buffer polygon when application loads or
     * when user searches for a new location
     **************************************************/
    function drawBufferPolygon() {
      // When pause() is called on the watch handle, the callback represented by the
      // watch is no longer invoked, but is still available for later use
      // this watch handle will be resumed when user searches for a new location
      pausableWatchHandle.pause();

      // Initial location for the center, edge and polylines on the view
      const viewCenter = view.center.clone();
      const centerScreenPoint = view.toScreen(viewCenter);
      const centerPoint = view.toMap({
        x: centerScreenPoint.x + 120,
        y: centerScreenPoint.y - 120
      });
      const edgePoint = view.toMap({
        x: centerScreenPoint.x + 240,
        y: centerScreenPoint.y - 120
      });

      // Store updated vertices
      const vertices = [
        [centerPoint.x, centerPoint.y],
        [edgePoint.x, edgePoint.y]
      ];

      // Create center, edge, polyline and buffer graphics for the first time
      if (!centerGraphic) {
        const polyline = new Polyline({
          paths: vertices,
          spatialReference: view.spatialReference
        });

        // get the length of the initial polyline and create buffer
        const length = geometryEngine.geodesicLength(polyline, unit);
        const buffer = geometryEngine.geodesicBuffer(
          centerPoint,
          length,
          unit
        );

        // Create the graphics representing the line and buffer
        const pointSymbol = {
          type: "simple-marker",
          style: "circle",
          size: 10,
          color: [0, 255, 255, 0.5]
        };
        centerGraphic = new Graphic({
          geometry: centerPoint,
          symbol: pointSymbol,
          attributes: {
            center: "center"
          }
        });

        edgeGraphic = new Graphic({
          geometry: edgePoint,
          symbol: pointSymbol,
          attributes: {
            edge: "edge"
          }
        });

        polylineGraphic = new Graphic({
          geometry: polyline,
          symbol: {
            type: "simple-line",
            color: [254, 254, 254, 1],
            width: 2.5
          }
        });

        bufferGraphic = new Graphic({
          geometry: buffer,
          symbol: {
            type: "simple-fill",
            color: [150, 150, 150, 0.2],
            outline: {
              color: "#FFEB00",
              width: 2
            }
          }
        });
        labelGraphic = labelLength(edgePoint, length);

        // Add graphics to layer
        graphicsLayer.addMany([centerGraphic, edgeGraphic]);
        // once center and edge point graphics are added to the layer,
        // call sketch's update method pass in the graphics so that users
        // can just drag these graphics to adjust the buffer
        setTimeout(function() {
          sketchViewModel.update([edgeGraphic, centerGraphic], {
            tool: "move"
          });
        }, 1000);

        graphicsLayer2.addMany([
          bufferGraphic,
          polylineGraphic,
          labelGraphic
        ]);
      }
      // Move the center and edge graphics to the new location returned from search
      else {
        centerGraphic.geometry = centerPoint;
        edgeGraphic.geometry = edgePoint;
      }

      // Query features that intersect the buffer
      calculateBuffer(vertices);
    }

    // Create an population pyramid chart for the census tracts that intersect the buffer polygon
    // Chart is created using the Chart.js library
    let chart;

    function updateInfo(newData) {
      chartExpand.expanded = true;

      const population_data = newData[0];
      const vi_data = newData[1];

      if (!chart) {
        // Get the canvas element and render the chart in it
        const canvasElement = document.getElementById("chart");

        chart = new Chart(canvasElement.getContext("2d"), {
          type: "horizontalBar",
          data: {
            // age groups
            labels: [
              "0-1",
              "2-4"
            ],
            datasets: [
              {
                label: "Female",
                backgroundColor: "#B266FF",
                borderColor: "#7F00FF",
                borderWidth: 0.25,
                data: population_data
              },
              {
                label: "Male",
                backgroundColor: "#0080FF",
                borderColor: "#004C99",
                borderWidth: 0.25,
                data: vi_data
              }
            ]
          },
          options: {
            responsive: false,
            legend: {
              position: "bottom"
            },
            title: {
              display: true,
              text: "Population pyramid"
            },
            scales: {
              yAxes: [
                {
                  categorySpacing: 0,
                  barThickness: 10,
                  stacked: true,
                  scaleLabel: {
                    display: true,
                    labelString: "Age group"
                  }
                }
              ],
              xAxes: [
                {
                  ticks: {
                    callback: function(value) {
                      const val = Math.abs(parseInt(value));
                      return numberWithCommas(val);
                    }
                  },
                  scaleLabel: {
                    display: true,
                    labelString: "Population"
                  }
                }
              ]
            },
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  return (
                    data.datasets[tooltipItem.datasetIndex].label +
                    ": " +
                    numberWithCommas(Math.abs(tooltipItem.xLabel))
                  );
                }
              }
            }
          }
        });
      } else {
        chart.data.datasets[0].data = femaleAgeData;
        chart.data.datasets[1].data = maleAgeData;
        chart.update();
      }
    }

    // Helper function for formatting number labels with commas
    function numberWithCommas(value) {
      value = value || 0;
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Label polyline with its length
    function labelLength(geom, length) {
      return new Graphic({
        geometry: geom,
        symbol: {
          type: "text",
          color: "#FFEB00",
          text: length.toFixed(2) + " kilometers",
          xoffset: 50,
          yoffset: 10,
          font: {
            // autocast as Font
            size: 14,
            family: "sans-serif"
          }
        }
      });
    }
  });