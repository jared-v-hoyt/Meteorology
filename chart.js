import { get_capitol_coordinates } from "./index.js";

async function get_weather_data(state) {
  const capitol = get_capitol_coordinates(state);
  const url = `http://api.weatherapi.com/v1/forecast.json?key=920add450c4c4cfe85f154155231404&q=${capitol.capitol}&days=3&aqi=no&alerts=no`;

  return await fetch(url)
    .then((response) => response.json())
    .then((result) => {
      let data = {
        wind: [],
        temperature: [],
        pressure: [],
      };

      let forecast = result.forecast.forecastday;

      forecast.forEach((day) => {
        day.hour.forEach((hour) => {
          data.wind.push({
            x: hour.time,
            y: hour.wind_kph,
          });
          data.temperature.push({
            x: hour.time,
            y: hour.temp_c,
          });
          data.pressure.push({
            x: hour.time,
            y: hour.pressure_in,
          });
        });
      });

      return data;
    });
}

let x_axis = [];

for (let i = 0; i < 72; i++) {
  x_axis.push(i.toString());
}

export async function update_chart(state) {
  const data = await get_weather_data(state);
  const chart = new Chart("line-chart", {
    type: "line",
    data: {
      labels: x_axis,
      datasets: [
        {
          label: "Wind Speed (kph)",
          data: data.wind,
          borderColor: "blue",
          fill: false,
          tension: 0.4,
        },
        {
          label: "Temperature (C)",
          data: data.temperature,
          borderColor: "red",
          fill: false,
          tension: 0.4,
        },
        {
          label: "Pressure (lb/in^2)",
          data: data.pressure,
          borderColor: "green",
          fill: false,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
        },
      },
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          type: "time",
          display: true,
          title: {
            display: true,
          },
        },
        y: {
          display: true,
          title: {
            display: true,
          },
        },
      },
    },
  });

  return chart;
}
