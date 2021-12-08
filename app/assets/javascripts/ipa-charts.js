google.charts.load('current', { 'packages': ['corechart'] })
google.charts.setOnLoadCallback(drawChart)

function drawChart () {
  var data = google.visualization.arrayToDataTable([
    ['Age', 'Weight'],
    [8, 12],
    [4, 5.5],
    [11, 14],
    [4, 5],
    [3, 3.5],
    [6.5, 7]
  ])

  var options = {
    title: 'Total asset cost (million)',
    hAxis: { title: 'Cost per m2', minValue: 0, maxValue: 15 },
    vAxis: { title: 'Total asset cost (million)', minValue: 0, maxValue: 15 },
    legend: 'none'
  }

  var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'))

  chart.draw(data, options)
}
