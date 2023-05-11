import { state_outlines } from "./data/state_outlines.js";
import { update_chart } from "./chart.js";

let geo_json = null;
let capitol_data = null;
let state = null;
let current_marker = null;

// Parses state_capitols.csv and sets the capitol_data variable to the parsed object
$.ajax({
  url: "data/state_capitols.csv",
  dataType: "text",
  success: (data) => {
    capitol_data = Papa.parse(data, {
      header: true,
    });
  },
});

// Returns the capitol, latitude, and longitude of the given state
export function get_capitol_coordinates(state) {
  let result = capitol_data.data.find((row) => {
    return row.state === state;
  });

  if (result) {
    return {
      capitol: result.capitol,
      latitude: result.latitude,
      longitude: result.longitude,
    };
  }

  return null;
}

const options = {
  // Required: API key
  key: "xgrXMKpHDvXDH9Z2RK1d1hr5UIIyzbbL",

  // Put additional console output
  verbose: false,

  // Optional: Initial state of the map
  lat: 37.8,
  lon: -96,
  zoom: 4,
};

windyInit(options, (windyAPI) => {
  const { map } = windyAPI;

  geo_json = L.geoJson(state_outlines, {
    style: {
      weight: 2,
      opacity: 1,
      color: "transparent",
      dashArray: "1",
      fillOpacity: 0.7,
    },
    onEachFeature: (_, layer) => {
      layer.on({
        mouseover: (event) => {
          var layer = event.target;

          layer.setStyle({
            weight: 3,
            fillColor: "#666",
            color: "#333",
            dashArray: "",
            fillOpacity: 0.5,
          });

          layer.bringToFront();
        },
        mouseout: (event) => {
          geo_json.resetStyle(event.target);
        },
        click: async (event) => {
          map.fitBounds(event.target.getBounds());
          state = event.target.feature.properties.name;

          if (current_marker) {
            map.removeLayer(current_marker);
          }

          let capitol = get_capitol_coordinates(state);
          current_marker = L.marker([capitol.latitude, capitol.longitude]).addTo(map);

          current_marker.on("click", async () => {
            $("#capitol_modal").css("display", "flex");
            $("#modal-title").text(`${capitol.capitol}, ${state}`);

            const chart = await update_chart(state);
            chart.canvas.id = "line-chart";
            $("#line-chart").replaceWith(chart.canvas);

            $("#close-modal").on("click", () => {
              $("#capitol_modal").css("display", "none");
            });

            window.addEventListener("click", (event) => {
              if (event.target === capitol_modal) {
                capitol_modal.style.display = "none";
              }
            });
          });
        },
      });
    },
  }).addTo(map);
});
