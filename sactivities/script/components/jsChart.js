import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.defaults.global.defaultFontFamily = 'iran_sans';
Chart.defaults.global.animation.duration = 2000;
var XvaluRotation = 0;
var XvaluesDisplay = true;
var chartPadding = 0;

let defaults = {
    rankChartStepSize: 50
}

if ($(window).width() <= 960) {
    Chart.defaults.global.defaultFontSize = 9;
    XvaluRotation = 0;
    XvaluesDisplay = false;
    chartPadding = 12;
} else {
    XvaluRotation = 25;
    XvaluesDisplay = true;
    chartPadding = 0;
}

Chart.plugins.unregister(ChartDataLabels);
export const JsChart = (function () {
    var chartData = [];
    var chartLables = [];
    var ctx = null;
    //var chartI = null;
    var scaleValue = 0;
    const initialize = function (el, arr, titles, allrank, colorCode, title, yAxisPosition, yAxisreverse) {
        //console.log(titles)
        ctx = el.getContext('2d');
        chartData.length = 0;
        //console.log(arr)
        chartData = arr.slice();
        chartLables.length = 0;
        //chartI = null;

        titles.map((title) =>
            chartLables.push(title)
        ); // Creatng X-axis aliases
        // console.log(JSON.stringify(chartLables));
        // console.log(chartData);
        let max = Math.max(...chartData).toString().length - 1
        scaleValue = Math.pow(10, max);

        return render(allrank, colorCode, title, yAxisPosition, yAxisreverse)
    };

    function render(allrank, colorCode, title, yAxisPosition, yAxisreverse) {
        // console.log(JSON.stringify(chartLables));
        // console.log(JSON.stringify(allrank));
        // console.log(JSON.stringify(title));
        // console.log(JSON.stringify(chartData));
        return ()=>new Chart(ctx, {
            responsive: true,
            plugins: [ChartDataLabels],
            data: {
                labels: chartLables.slice(),
                datasets: [{
                    type: 'line',
                    lineTension: 0,
                    label: title,
                    data: chartData.slice(),
                    borderColor: colorCode,
                    backgroundColor: 'transparent',
                    pointRadius: 6,
                    pointBorderWidth: 1,
                    pointHoverRadius: 8,
                    pointHoverBorderWidth: 2,
                    pointBackgroundColor: colorCode,
                    pointHoverBackgroundColor: colorCode,
                    pointHoverBorderColor: colorCode,
                    datalabels: {
                        anchor: 'end',
                        color: colorCode,
                        align: 'top',
                        textAlign: 'left',
                    },
                    tooltipItem: {

                    }
                }],
            },

            options: {
                layout: {
                    padding: {
                        left: chartPadding,
                        right: chartPadding,
                        top: 0,
                        bottom: chartPadding,
                    }
                },
                tooltips: {
                    callbacks: {
                        // title: function(tooltipItems, data) {
                        //     var label = data.datasets[tooltipItem.datasetIndex].label || '';
                        //     return "Hi";
                        // },
                        label: function (tooltipItem, data) {
                            // console.log(this)
                            // console.log(data)
                            var label = data.datasets[tooltipItem.datasetIndex].label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += Math.round(tooltipItem.yLabel * 100) / 100;
                            if (allrank) {
                                label += ` مابین ${allrank[tooltipItem.index]} مدرسه`;
                            }
                            return label;
                        }
                    }
                },
                title: {
                    display: true,
                    text: title,
                    fontColor: colorCode,
                },
                legend: {
                    display: false,
                },
                plugins: {
                    datalabels: {
                        display: 'auto'
                    },
                },

                scales: {
                    yAxes: [{
                        position: yAxisPosition,
                        ticks: {
                            reverse: yAxisreverse,
                            padding: 20,
                            max: yAxisreverse ? Math.ceil(Math.max(...allrank) / defaults.rankChartStepSize) * defaults.rankChartStepSize : Math.round((Math.max(...chartData) + scaleValue) / scaleValue) * scaleValue,
                            //suggestedMax: yAxisreverse ? Math.ceil(Math.max(...allrank) / defaults.rankChartStepSize) * defaults.rankChartStepSize : Math.round((Math.max(...chartData) + scaleValue) / scaleValue) * scaleValue,
                            min: yAxisreverse ? 1 : Math.max(Math.round((Math.min(...chartData) - scaleValue) / scaleValue) * scaleValue, 0),
                            //stepSize: yAxisreverse ? defaults.rankChartStepSize  / scaleValue - (Math.max(...allrank) % 10) : scaleValue,
                            maxTicksLimit: yAxisreverse ? getMaxTicksLimit(Math.max(...allrank), scaleValue) : 200,
                            precision: 0,
                        },
                        gridLines: {
                            drawTicks: false,
                        },
                    },],
                    xAxes: [{
                        ticks: {
                            display: XvaluesDisplay,
                            autoSkip: false,
                            padding: 10,
                            fontColor: colorCode,
                            maxRotation: XvaluRotation,
                            minRotation: XvaluRotation,
                            fontSize: 10,
                        },
                    },],
                },
            },
        });
    }

    return {
        initialize: (el, arr, titles, allrank, colorCode, title, yAxisPosition, yAxisreverse) => initialize(el, arr, titles, allrank, colorCode, title, yAxisPosition, yAxisreverse),
        //render:(allrank, colorCode, title, yAxisPosition, yAxisreverse)=>render(allrank, colorCode, title, yAxisPosition, yAxisreverse)
    };
})();

function getMaxTicksLimit(all, scale) {
    // console.log(all % 10)
    // console.log(all, scale);
    return defaults.rankChartStepSize - (all % defaults.rankChartStepSize) //Math.round((all - scaleValue))
}