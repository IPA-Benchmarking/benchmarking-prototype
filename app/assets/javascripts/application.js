/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

// if (window.location.search && $('.results').length) {
//   window.history.replaceState({}, document.title, window.location.pathname)
// }

/*********  START: HELPERS ***********/

const formatToFixed = (number) => {
  let num = number
  num = parseFloat(num).toFixed(2)
  return `£${Number(num).toLocaleString('en')}`
}

const toSqMetre = (length, width, cost, noFormat) => {
  if (length && width && cost) {
    const l = length
    const w = width
    const result = l * w
    const m2 = cost / result

    return noFormat ? m2 : formatToFixed(m2)
  }
}

const toCubic = (volume, cost) => {
  const vol = volume || 0
  const figure = cost || 0
  const m3 = figure / vol

  return formatToFixed(m3)
}

/*********  END: HELPERS ***********/



$(document).ready(function () {
  window.GOVUKFrontend.initAll()



  // const evn = window.location.host
  const ipaConfig = {
    url: 'https://ipamockapi.herokuapp.com/api'
  }

  // const projectsDataModel = []
  let paramArr = []
  let itemsToCompare = []
  const selectedOpts = []
  //const selectedCategoriesArr = []
  let selectedFilterOptions = []

  const $resultsListWrapper = $('.results-list')
  const $resultPageWrapper = $('.results-page')
  const $countWrapper = $('.results-count')
  const $assetSectionWrapper = $('.select-asset-type')
  const $regionListWrapper = $('.region-list')
  const $projectCount = $('.project-count')
  const $assetTitle = $('.assetTitle')
  const $compareCount = $('.compare-count')
  const $currentResultsCount = $('.current-results-count')
  const $costTable = $('.cost-table')
  const $results = $('.results')
  const $projectScheduleTable = $('.project-schedule')
  const $average = $('.average')
  const $assetDetails = $('.asset-details')
  const $resultsTitle = $('.results-title')
  const $detailPage = $('.full-detail-page')
  const $assetList = $('.asset-list')

  const chart = document.getElementById('chart_div')
  //const $assetAmount = $('.asset-amount')

  const getAppSessionData = window.sessionStorage.getItem('app')
  const appSession = JSON.parse(getAppSessionData)

  console.log('ON LOAD ----- appSession', appSession)

  const { selectedAsset, assetArray, appData, selectedAssetProjects } = appSession || {}

  const appDataModel = {
    selectedAsset: {
      name: !_.isNull(appSession) && selectedAsset ? selectedAsset.name : '',
      type: !_.isNull(appSession) && selectedAsset ? selectedAsset.type : ''
    },
    assetArray: !_.isNull(appSession) && assetArray ? assetArray : [],
    appData: !_.isNull(appSession) && appData ? appData : [],
    selectedAssetProjects: !_.isNull(appSession) && selectedAssetProjects ? selectedAssetProjects : [],
    compareList: [],
    filterOpts: [],
    // category: [],
    options: []
  }

  const radiobuttonTpl = (items) => {
    const type = _.camelCase(items.type) || _.camelCase(items)
    const isChecked = items.id === '2' ? 'checked' : ''

    return `<div class="govuk-radios__item">
               <input class="govuk-radios__input" id="${type}" name="projectTypeID" data-asset-name="${type}" type="radio" value="${items.id}" ${isChecked}>
               <label class="govuk-label govuk-radios__label asset-type-label" for="${type}">
                        ${items.type || items} <span class="asset-amount">(0)</span>
               </label>
           </div>`
  }

  const checkboxTpl = (items, i, property) => {
    const name = _.camelCase(items)
    const mapName = _.startCase(items)

    // const inputId = items.isArray && $regionListWrapper.length === 0 ? _.camelCase(items[i].text) : _.camelCase(items)
    // const inputVal = items.isArray && $regionListWrapper.length === 0 ? _.camelCase(items[i].value) : _.camelCase(items)

    return `<div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input filter-item" id="${name}" name="${property}" type="checkbox" value="${name}">
                <label class="govuk-label govuk-checkboxes__label" for="${name}">
                  ${mapName}
                </label>
             </div>`
  }

  const resultsListItemTpl = (results) => {

    const { projectName, projectEndDate, assetRegion, projectID, outturnCost, length, width, volume } = results

    return `<li class="results-item">
              <div class="result-head">
                  <div class="details">
                      <p class="list-item-title"><a href="#">${projectName}</a></p>
                  </div>
                  <div class="details">
                      <button class="govuk-button govuk-button--secondary addToCompare" data-compare-id="${projectID}" data-module="govuk-button">
                          Add to dataset
                      </button>
                  </div>
              </div>
  
              <div class="result-icons">
                <p class="icon calendar">Construction completion year: ${projectEndDate}</p>
                <p class="icon pin"> Region: ${assetRegion}</p>
              </div>
  
              <div class="result-costs">
                  <ul class="govuk-list result-costs-list">
                      <li>Outturn cost <span class="result-figure">${formatToFixed(outturnCost)}</span></li>
                      <li>Cost/m2 <span class="result-figure">${toSqMetre(length, width, outturnCost)}</span></li>
                      <li>Cost/m3 <span class="result-figure">${toCubic(volume, outturnCost)}</span></li>
                  </ul>
              </div>
          </li>`
  }

  const costTableTpl = (asset) => {
    const { projectName, length, height, width, outturnCost, volume } = asset

    return `<tr class="govuk-table__row">
                <th scope="row" class="govuk-table__header"><a data-title="${projectName}" class="asset-details" href="benchmarking-asset-detail">${projectName}</a></th>
                <td class="govuk-table__cell">${length}</td>
                <td class="govuk-table__cell">${height}</td>
                <td class="govuk-table__cell">${toSqMetre(length, width, outturnCost)}</td>
                <td class="govuk-table__cell">${formatToFixed(volume, outturnCost)}</td>
                <td class="govuk-table__cell">${formatToFixed(outturnCost)}</td>
            </tr>`
  }

  const projectScheduleTpl = (asset) => {
    const { projectName, duration_of_build_weeks } = asset
    const num = parseFloat(duration_of_build_weeks).toFixed(0)

    return `<tr class="govuk-table__row">
                <th scope="row" class="govuk-table__header"><a data-title="${projectName}" class="asset-details" href="benchmarking-asset-detail">${projectName}</a></th>
                <td class="govuk-table__cell">N/A</td>
                <td class="govuk-table__cell">${num} weeks</td>
            </tr>`
  }

  const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length

  function getProjectData () {
    $.get(`${ipaConfig.url}/projects`, function (data) {
    }).done((data) => {
      appDataModel.appData = data
      getAssetData()
      getAllRegions(data)
    })
  }

  /********* START: ASSET SELECTION PAGE  ***********/

  function getAssetOpts () {
    $assetList.css('display', 'none')
    $.get(`${ipaConfig.url}/projectType`, function (data) {
      if ($('.asset-list').length && data.length) {
        const groupSectors = _.mapValues(_.groupBy(data, 'sector'))

        Object.keys(groupSectors).forEach(function (key) {
          const sectorArr = groupSectors[key]
          const keyToCamelcase = _.camelCase(key)
          //$assetSectionWrapper.append(assetGroups(key))
          sectorArr.forEach(function (arr, i) {
            // console.log(keyToCamelcase)
            $('#' + keyToCamelcase).append(radiobuttonTpl(arr, i))
          })
        })
      }
    }).done(() => {
      $('.ajax-loader').css('display', 'none')
      $assetList.css('display', 'block')
    })
  }

  function setAssetOpts () {
    if ($assetSectionWrapper.length) {
      const elem = $assetSectionWrapper.find('input[name="projectTypeID"]:checked')
      const value = elem.val()
      const prop = elem.attr('name')
      const name = elem.data('asset-name')
      const { selectedAsset } = appDataModel
      const assetArr = []

      const countElem = elem.closest('.govuk-radios__item').find('.asset-amount')
      countElem.text(`(${appDataModel.selectedAssetProjects.length})`)

      selectedAsset.name = name
      selectedAsset.type = value
      assetArr.push({ [`${prop}`]: value })

      return assetArr
    }
  }

  function getAssetData (event, asset) {
    if ($assetSectionWrapper.length) {

      setTimeout(function () {
        const { appData } = appDataModel
        if (appData && appData.length) {
          const currentAsset = asset || setAssetOpts()
          const projectTypeID = currentAsset
          const property = projectTypeID.length ? Object.keys(...projectTypeID) : []

          const filterData = appData.filter(el => {
            return projectTypeID.some(filter => {
              return filter[property] === el[property]
            })
          }).map(obj => ({ ...obj }))

          console.log('filterData', new Array(filterData))

          const { assetArray, selectedAssetProjects } = appDataModel
          assetArray.push(...currentAsset)
          appDataModel.selectedAssetProjects = filterData
          $projectCount.html(filterData.length)
          window.sessionStorage.setItem('app', JSON.stringify(appDataModel))
        }
      }, 100)
    }
  }

  function assetInputs () {
    $assetSectionWrapper.on('change', 'input[name="projectTypeID"]', function (event) {
      const input = $(this)
      const value = input.val()
      const prop = input.attr('name')
      const name = input.data('asset-name')
      const selectedAssetArr = []
      const { selectedAsset } = appDataModel
      const countElem = input.closest('.govuk-radios__item').find('.asset-amount')

      console.log(input)

      selectedAsset.name = value
      selectedAsset.type = name

      // console.log('yes...')

      selectedAssetArr.push({ [`${prop}`]: value })
      getAssetData(event, selectedAssetArr)
      countElem.text(`(${appDataModel.selectedAssetProjects.length})`)
    })
  }

  /********* END: ASSET SELECTION PAGE  ***********/

  /********* START: RESULT PAGE ***********/

  function setCountOnload () {
    if ($countWrapper.length) {
      const { selectedAssetProjects, selectedAsset } = appSession
      const assetName = !_.isEmpty(selectedAsset) ? selectedAsset.name.slice(0, -1) : {}
      $assetTitle.html(assetName)
      $countWrapper.html(selectedAssetProjects.length)
    }
  }

  function getAllRegions (data) {
    if ($regionListWrapper.length) {
      const groupRegions = _.mapValues(_.groupBy(data, 'assetRegion'))
      const regionList = Object.keys(groupRegions).sort()
      const property = 'assetRegion'

      regionList.unshift('All of the uk')
      regionList.map((items, index) => {
        $regionListWrapper.append(checkboxTpl(items, index, property))
      })
    }
  }

  function updateFilterOpts (el, value, propName) {
    if (el.is(':checked')) {
      paramArr.push({ [`${propName}`]: value })
    } else {
      paramArr = $.grep(paramArr, function (obj) {
        return obj[`${propName}`] !== value
      })
    }

    window.sessionStorage.setItem('app', JSON.stringify(appDataModel))
    setSelectedFilterOpts(paramArr)
    onFilter(paramArr, propName)
  }

  function setSelectedFilterOpts (paramArr) {
    if (paramArr.length) {
      appSession.filterOpts = paramArr
      window.sessionStorage.setItem('app', JSON.stringify(appSession))
    }
  }

  function getFilterOpts () {
    const getSession = window.sessionStorage.getItem('app')
    const session = JSON.parse(getSession)
    const { filterOpts } = session || {}
    const optionList = []

    if (session && filterOpts.length) {
      const opts = filterOpts

      opts.forEach((items) => {
        const category = Object.keys(items)
        const optValue = Object.values(items)
        optionList.push(category, optValue)
      })

      return [...new Set(optionList.flat())]
    }
  }

  function setActiveInputs () {
    const filter = getFilterOpts() || []

    filter.forEach(elem => {
      $('#' + elem).attr('checked', 'checked')
    })
  }

  function onInput () {
    $resultPageWrapper.on('click', 'input', function (e) {
      const $checkBox = $(this)
      const value = $checkBox.val()
      const name = $checkBox.attr('name')

      if ($checkBox.hasClass('filter-item')) {
        updateFilterOpts($checkBox, value, name)
      }
    })
  }

  function onFilter (filterOpts, property) {
    const getSession = window.sessionStorage.getItem('app')
    const session = JSON.parse(getSession)
    const { selectedAssetProjects } = session
    const data = [...selectedAssetProjects]
    const opts = filterOpts.length > 0 ? filterOpts : data

    const arrayFiltered = data.filter(el => {
      return opts.some(filter => {
        return filter[property] === el[property]
      })
    })


    $countWrapper.html(arrayFiltered.length)
    updateFilteredList(arrayFiltered)
    /*** Used on revision 1 ***/
    createAssetTables(arrayFiltered)

    collectGraphData(arrayFiltered)
    setAverage(arrayFiltered)
  }

  $resultsListWrapper.on('click', '.addToCompare', function (event) {
    event.preventDefault()

    const elem = $(this)
    const id = $(this).data('compare-id')

    if (elem.hasClass('remove')) {
      elem.text('Add to dataset').removeClass('remove')
      const removeId = itemsToCompare.filter(e => e.projectID !== id)
      itemsToCompare = removeId
    } else {
      elem.text('Remove').addClass('remove')
      itemsToCompare.push({ projectID: id })
    }

    console.log('itemsToCompare', itemsToCompare)

    const session = appSession
    $compareCount.html(itemsToCompare.length)
    appDataModel.compareList = itemsToCompare

    session.compareList = itemsToCompare
    window.sessionStorage.setItem('app', JSON.stringify(session))

    console.log('ON CLICK ----- appSession', appSession)
    console.log('ON CLICK ----- appDataModel', appDataModel)

  })

  const mode = (arr) => {
    if (arr && arr.length) {
      return arr.sort((a, b) =>
        arr.filter(v => v === a).length - arr.filter(v => v === b).length
      ).pop()
    }
  }

  const median = (array) => {
    if (array && array.length) {
      array = array.sort()

      if (array.length % 2 === 0) { // array with even number elements
        return (array[array.length / 2] + array[(array.length / 2) - 1]) / 2
      } else {
        return array[(array.length - 1) / 2] // array with odd number elements
      }
    }
  }

  function collectGraphData (filteredList) {
    const getSession = window.sessionStorage.getItem('app')
    const session = JSON.parse(getSession)
    const { selectedAssetProjects } = session
    const projects = filteredList || selectedAssetProjects
    const graphData = []

    projects.forEach(asset => {
      const { length, width, outturnCost, projectName } = asset

      const costFormatted = parseInt(parseFloat(outturnCost).toFixed(0))
      const assetCost = costFormatted
      const costPer = parseInt(toSqMetre(length, width, costFormatted, true).toFixed(0))

      graphData.push([costPer, assetCost, `<a class="asset-details" data-title="${projectName}" href='benchmarking-asset-detail'>${projectName}</a>`])

      session.graphData = graphData
      window.sessionStorage.setItem('app', JSON.stringify(session))

      if (filteredList) {
        drawChart(graphData)
        // const data = new google.visualization.DataTable()
        //
        // data.addColumn('number', 'Cost Per m2')
        // data.addColumn('number', 'Total asset')
        // data.addColumn({ type: 'string', role: 'tooltip' })
        // data.addRows(graphData)
        //
        // const options = {
        //   title: 'Total asset cost (million)',
        //   hAxis: { format: 'short', title: 'Cost per m2' },
        //   vAxis: { format: 'short', title: 'Total asset cost (million)', ticks: [0, 1000000, 2000000, 3000000, 4000000] },
        //   legend: 'none'
        // }
        //
        // const chart = new google.visualization.ScatterChart(document.getElementById('chart_div'))
        // chart.draw(data, options)
      }
    })
  }

  function setAverage (filteredList) {
    const { selectedAssetProjects } = appDataModel
    const data = filteredList || selectedAssetProjects
    const metreSq = []

    data.forEach(asset => {
      const { length, width, outturnCost } = asset
      const result = toSqMetre(length, width, outturnCost, true)
      metreSq.push(result)
    })

    $average.text(`£${parseFloat(average(metreSq)).toFixed(0)}K`)
    setMean(metreSq)
    setMode(metreSq)
  }

  function setMode (metreSq) {
    const modeSum = median(metreSq)
    const $mode = $('.mode')

    $mode.text(formatToFixed(modeSum))
    return mode(modeSum)
  }

  function setMean (metreSq) {
    const medianSum = median(metreSq)
    const $median = $('.median')

    $median.text(`${formatToFixed(medianSum)}`)
    return median(medianSum)
  }

  function createAssetTables (filter) {
    if ($('.ipa-data-table').length) {
      const assetData = appDataModel ? appDataModel.selectedAssetProjects : []
      const filterData = _.isUndefined(filter) ? assetData : filter

      $('.cost-data-table').pagination({
        dataSource: filterData,
        pageSize: 10,
        prevText: '&laquo; Previous',
        nextText: 'Next &raquo;',
        totalNumber: filterData.length,
        callback: function (data, pagination) {
          // console.log('pagination', pagination)
          $costTable.empty()
          data.forEach(function (el) {
            $costTable.append(costTableTpl(el))
          })
        }
      })

      $('.project-schedule-data-table').pagination({
        dataSource: filterData,
        pageSize: 10,
        prevText: '&laquo; Previous',
        nextText: 'Next &raquo;',
        totalNumber: filterData.length,
        callback: function (data, pagination) {
          $projectScheduleTable.empty()
          data.forEach(function (el) {
            $projectScheduleTable.append(projectScheduleTpl(el))
          })
        }
      })
    }
  }

  $('.project-schedule, .cost-table').on('click', $assetDetails, function (evt) {
    const elem = evt.target
    appDataModel.detailPageTitle = elem.dataset.title
    window.sessionStorage.setItem('app', JSON.stringify(appDataModel))
  })

  if ($detailPage.length) {
    const getSession = window.sessionStorage.getItem('app')
    const session = JSON.parse(getSession)
    const { detailPageTitle } = session

    $resultsTitle.text(detailPageTitle)
  }

  /*** START: Used on revision 1 ***/

  function getAssetResultsData () {
    if ($results.length) {
      const getSession = window.sessionStorage.getItem('app')
      const session = JSON.parse(getSession)
      const { selectedAssetProjects } = session
      const projectData = selectedAssetProjects

      $results.pagination({
        dataSource: projectData,
        pageSize: 10,
        prevText: 'Previous',
        nextText: 'Next',
        totalNumber: selectedAssetProjects.length,
        callback: function (data, pagination) {
          $currentResultsCount.html(pagination.pageSize)
          data.forEach(function (el, i) {
            $resultsListWrapper.append(resultsListItemTpl(el, i))
          })
        }
      })
    }
  }

  function updateFilteredList (arrayFiltered) {
    $resultsListWrapper.empty()

    const items = []

    if (arrayFiltered.length) {
      arrayFiltered.map((item, index) => {
        items.push(item)
        $resultsListWrapper.append(resultsListItemTpl(items, index))
      })
    }

    $countWrapper.text(items.length)
  }

  function drawChart (filteredGraphData) {
    if (chart) {
      const getSession = window.sessionStorage.getItem('app')
      const data = new google.visualization.DataTable()
      const graphData = filteredGraphData || JSON.parse(getSession).graphData

      data.addColumn('number', 'Cost Per m2')
      data.addColumn('number', 'Total asset')
      data.addColumn({ type: 'string', role: 'tooltip', 'p': { 'html': true } })
      data.addRows(graphData)

      const options = {
        pointShape: 'diamond',
        pointSize: 10,
        width: 628,
        height: 360,
        colors: ['#1D70B8'],
        tooltip: { trigger: 'selection', isHtml: true },
        //title: 'Total asset cost (million)',
        hAxis: { format: 'short', title: 'Cost per m2' },
        vAxis: { format: 'short', title: 'Total asset cost (million)', ticks: [0, 1000000, 2000000, 3000000, 4000000] },
        legend: 'none'
      }

      const chart = new google.visualization.ScatterChart(document.getElementById('chart_div'))
      chart.draw(data, options)
    }
  }

  /*** END: Used on revision 1 ***/

  /********* END: RESULT PAGE ***********/

  /**** Asset page ****/
  getAssetOpts()
  getProjectData()
  assetInputs()

  /**** Results page ****/
  getAssetResultsData()
  onInput()
  setCountOnload()
  createAssetTables()
  setAverage()
  getFilterOpts()
  setActiveInputs()
  collectGraphData()

  google.charts.load('current', { 'packages': ['corechart'] })
  google.charts.setOnLoadCallback(drawChart)


  //getCheckboxOpts()
  //getProjectData()

  $(window).scroll(function () {
    stickyNav()
  })

  const navbar = document.querySelector('.govuk-header')
  const sticky = navbar.offsetHeight
  const compareBar = document.querySelector('.compare-dataset')

  function stickyNav () {
    if (compareBar) {
      if (window.pageYOffset >= sticky) {
        compareBar.classList.add('sticky')
      } else {
        compareBar.classList.remove('sticky')
      }
    }
  }

})
