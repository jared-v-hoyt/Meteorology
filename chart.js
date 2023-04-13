import {
    get_current_overlay_data
} from "./index.js";

const xValues = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
let yValues = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15];

export async function update_chart(state) {
    yValues = await get_current_overlay_data(state);
    new Chart("myChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                fill: false,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues
            }]
        },
        options: {}
    });
}