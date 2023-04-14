import {
    get_current_overlay_data,
    create_weather_data
} from "./index.js";

const xValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let yValues = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14];

export async function update_chart(state) {
    yValues = await create_weather_data(state);
    new Chart("myChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                fill: false,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues
            }],
        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 50,
                },
                x: {
                    min: 0,
                    max: 30,
                }
            }
        }
    });
}