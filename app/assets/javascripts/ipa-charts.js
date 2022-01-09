// if (document.getElementById('chart_div')) {
//   const getSession = window.sessionStorage.getItem('app')
//
//   google.charts.load('current', { 'packages': ['corechart'] })
//   google.charts.setOnLoadCallback(drawChart)
//
//   function drawChart () {
//     const data = new google.visualization.DataTable()
//     data.addColumn('number', 'Cost Per m2')
//     data.addColumn('number', 'Total asset')
//     data.addColumn({ type: 'string', role: 'tooltip', 'p': { 'html': true } })
//     data.addRows(JSON.parse(getSession).graphData)
//
//     const options = {
//       pointShape: 'diamond',
//       pointSize: 10,
//       width: 628,
//       height: 360,
//       colors: ['#1D70B8'],
//       tooltip: { trigger: 'selection', isHtml: true },
//       //title: 'Total asset cost (million)',
//       hAxis: { format: 'short', title: 'Cost per m2' },
//       vAxis: { format: 'short', title: 'Total asset cost (million)', ticks: [0, 1000000, 2000000, 3000000, 4000000] },
//       legend: 'none'
//     }
//
//     const chart = new google.visualization.ScatterChart(document.getElementById('chart_div'))
//
//     chart.draw(data, options)
//   }
// }