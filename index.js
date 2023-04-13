import { state_data } from "./data/state_data.js";

let geo_json;
let parsed_data;
let current_state;
let current_overlay = "wind";

// Retrieve state_capitals.csv and parse the data
$.ajax({
	url: "data/state_capitals.csv",
	dataType: "text",
	success: function (data) {
		parsed_data = Papa.parse(data, { header: true });
	},
});

function update_data_text(data) {
	$(".state-data").text(data);
}

// Returns the latitude and longitude of the given state
function get_capitol_coordinates(state) {
	let result = parsed_data.data.find(function (row) {
		return row.state === state;
	});

	if (result) {
		return { latitude: result.latitude, longitude: result.longitude };
	}

	return null;
}

function kelvin_to_celcius(temperature_kelvin) {
	return temperature_kelvin - 273.15;
}

// Uses the `Point Forecast` API to get the temperature data from the given state capitol
async function get_capitol_data(capitol) {
	let my_headers = new Headers();

	my_headers.append("Content-Type", "application/json");

	let raw = JSON.stringify({
		lat: capitol.latitude,
		lon: capitol.longitude,
		model: "namConus",
		parameters: [current_overlay],
		levels: ["surface"],
		key: "3puqsfIl40xpSwYF3NZuFeHmhijnBNWh",
	});

	let request_options = {
		method: "POST",
		headers: my_headers,
		body: raw,
		redirect: "follow",
	};

	try {
		const response = await fetch(
			"https://api.windy.com/api/point-forecast/v2",
			request_options
		);
		return await response.json();
	} catch (error) {
		console.log("error", error);
	}
}

async function get_current_overlay_data(state) {
	let data = new Array();

	let capitol_data = await get_capitol_data(get_capitol_coordinates(state));

	if (current_overlay === "wind") {
		capitol_data["wind_v-surface"].forEach((wind_record) => {
			data.push(Math.round(wind_record));
		});
	} else if (current_overlay === "temp") {
		capitol_data["temp-surface"].forEach((temperature_record) => {
			data.push(Math.round(kelvin_to_celcius(temperature_record)));
		});
	} else if (current_overlay === "pressure") {
		capitol_data["pressure-surface"].forEach((pressure_record) => {
			data.push(Math.round(pressure_record));
		});
	}

	return data;
}

function highlight_feature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 3,
		fillColor: "#666",
		color: "#333",
		dashArray: "",
		fillOpacity: 0.5,
	});

	layer.bringToFront();
}

function reset_highlight(e) {
	geo_json.resetStyle(e.target);
}

async function zoom_to_feature(e, map) {
	map.fitBounds(e.target.getBounds());
	current_state = e.target.feature.properties.name;
	const data = await get_current_overlay_data(current_state);

	$(".selected-state").text(current_state);
	update_data_text(data);
}

function on_each_feature(feature, layer, map) {
	layer.on({
		mouseover: highlight_feature,
		mouseout: reset_highlight,
		click: function (e) {
			zoom_to_feature(e, map);
		},
	});
}

const options = {
	key: "xgrXMKpHDvXDH9Z2RK1d1hr5UIIyzbbL",
	verbose: false,
	lat: 37.8,
	lon: -96,
	zoom: 4,
};

windyInit(options, (windyAPI) => {
	const { map } = windyAPI;
	const store = windyAPI.store;

	// Listen for changes in the currently selected overlay or layer
	store.on("overlay", (overlay) => {
		current_overlay = overlay;

		async (data) => {
			await get_current_overlay_data(current_state).then(
				update_data_text(data)
			);
		};
	});

	geo_json = L.geoJson(state_data, {
		style: {
			weight: 2,
			opacity: 1,
			color: "transparent",
			dashArray: "1",
			fillOpacity: 0.7,
		},
		onEachFeature: function (feature, layer) {
			on_each_feature(feature, layer, map);
		},
	}).addTo(map);
});
