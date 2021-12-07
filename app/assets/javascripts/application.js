/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

if (window.location.search && $('.results').length) {
  window.history.replaceState({}, document.title, window.location.pathname)
}

/*********  START: HELPERS ***********/

const formatToFixed = (number) => {
  let num = number
  num = parseFloat(num).toFixed(0)
  return `£${Number(num).toLocaleString('en')}`
}

const toSqMetre = (length, width, cost) => {
  if (length && width && cost) {
    const l = length
    const w = width
    const result = l * w
    const m2 = cost / result

    return formatToFixed(m2)
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

  const evn = window.location.host
  const ipaConfig = {
    url: evn.search('localhost') > -1 ? 'http://localhost:4041/api' : 'https://ipamockapi.herokuapp.com/api',
  }

  const getAppSessionData = window.sessionStorage.getItem('app')
  const appSession = JSON.parse(getAppSessionData)

  console.log('ON LOAD ----- appSession', appSession)

  const appDataModel = {
    selectedAsset: { name: '', type: '' },
    assetArray: [],
    appData: [],
    selectedAssetProjects: [],
    compareList: []
  }

  const projectsDataModel = []
  const paramArr = []
  const itemsToCompare = []
  const $resultsListWrapper = $('.results-list')
  const $resultPageWrapper = $('.results-page')
  const $countWrapper = $('.results-count')
  const $assetSectionWrapper = $('.select-asset-type')
  const $regionListWrapper = $('.region-list')
  const $projectCount = $('.project-count')
  const $assetTitle = $('.assetTitle')
  const $compareCount = $('.compare-count')

// function averageCost () {
//   console.log('averageCost', JSON.parse(session).selectedAssetProjects)
//   const array =  JSON.parse(session).selectedAssetProjects
//   const average = array => arr.reduce((a, b) => a + b, 0) / arr.length
//   console.log('average', average)
// }

  const assetGroups = (section) => {
    const name = _.startCase(_.toLower(section))
    const id = _.camelCase(section)
    return `<section id="${id}" class="${id} sectors"><h3 class="govuk-heading-m">${name}</h3></section>`
  }

  const radiobuttonTpl = (items) => {
    const type = _.camelCase(items.type) || _.camelCase(items)
    const isChecked = items.id === '2' ? 'checked' : ''

    return `<div class="govuk-radios__item">
               <input class="govuk-radios__input" id="${type}" name="projectTypeID" data-asset-name="${type}" type="radio" value="${items.id}" ${isChecked}>
               <label class="govuk-label govuk-radios__label" for="${type}">
                        ${items.type || items}
               </label>
           </div>`
  }

  const checkboxTpl = (items, i) => {
    const inputId = items.isArray && $regionListWrapper.length === 0 ? _.camelCase(items[i].text) : _.camelCase(items)
    const inputVal = items.isArray && $regionListWrapper.length === 0 ? _.camelCase(items[i].value) : _.camelCase(items)

    return `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
  <div class="govuk-checkboxes__item">
    <input class="govuk-checkboxes__input" id="${inputId}" name="projectTypeID" type="checkbox" value="${inputVal}">
    <label class="govuk-label govuk-checkboxes__label" for="${inputId}">
      ${items.isArray ? items[i].text : items}
    </label>
  </div>`
  }

  const resultsListItemTpl = (results, i) => {
    const outturnCost = results[i].outturnCost
    const length = results[i].length
    const width = results[i].width
    const volume = results[i].volume

    return `<li class="results-item">
            <div class="result-head">
                <div class="details">
                    <p class="list-item-title"><a href="#">${results[i].projectName}</a></p>
                </div>
                <div class="details">
                    <button class="govuk-button govuk-button--secondary addToCompare" data-compare-id="${results[i].projectID}" data-module="govuk-button">
                        Add to dataset
                    </button>
                </div>
            </div>
            
            <div class="result-icons">
              <p class="icon calendar">Construction completion year: ${results[i].projectEndDate}</p>
              <p class="icon pin"> Region: ${results[i].assetRegion}</p>
            </div>
            
            <div class="result-costs">
                <ul class="govuk-list result-costs-list">
                    <li>Outturn cost <span class="result-figure">${formatToFixed(results[i].outturnCost)}</span></li>
                    <li>Cost/m2 <span class="result-figure">${toSqMetre(length, width, outturnCost)}</span></li>
                    <li>Cost/m3 <span class="result-figure">${toCubic(volume, outturnCost)}</span></li>
                </ul>
            </div>
        </li>`
  }



  function getProjectData () {
    const params = { page: 1, limit: 10 }

    $.get(`${ipaConfig.url}/projects`, params, function (data) {
      const dataModel = data
      projectsDataModel.push(...dataModel)
    }).done((data) => {
      // console.log('getProjectData', data)
      const { appData } = appDataModel
      appData.push(...data)

      getAssetData()
      getAllRegions(data)

      // averageCost()
    })
  }

  /********* START: ASSET SELECTION PAGE  ***********/

  function getAssetOpts () {
    $.get(`${ipaConfig.url}/projectType`, function(data) {
      if ($('.asset-list').length && data.length) {
        const groupSectors = _.mapValues(_.groupBy(data, 'sector'))

        Object.keys(groupSectors).forEach(function (key) {
          const sectorArr = groupSectors[key]
          const keyToCamelcase = _.camelCase(key)
          $assetSectionWrapper.append(assetGroups(key))
          sectorArr.forEach(function (arr, i) {
            $('#' + keyToCamelcase).append(radiobuttonTpl(arr, i))
          })
        })
      }
    })
  }

  function setAssetOpts () {
    if ($assetSectionWrapper.length) {
      const elem = $assetSectionWrapper.find('input:checked')
      const value = elem.val()
      const prop = elem.attr('name')
      const name = elem.data('asset-name')
      const { selectedAsset } = appDataModel
      const assetArr = []

      selectedAsset.name = name
      selectedAsset.type = value
      assetArr.push({ [`${prop}`]: value })

      return assetArr
    }
  }

  function getAssetData (event, asset) {
    if ($assetSectionWrapper.length === 0) {
      return
    }

    const { appData } = appDataModel
    if (appData && appData.length) {
      const currentAsset = asset || setAssetOpts()
      const projectTypeID = currentAsset
      const property = projectTypeID.length ? Object.keys(...projectTypeID) : []
      let filterData = []

      console.log()

      filterData = appData.filter(el => {
        return projectTypeID.some(filter => {
          return filter[property] === el[property]
        })
      })

      // console.log('appDataModel', appDataModel)
      const { selectedAssetProjects, assetArray } = appDataModel
      // console.log('selectedAssetProjects', selectedAssetProjects)
      // console.log('filterData', filterData)

      assetArray.push(...currentAsset)
      selectedAssetProjects.push(...filterData)
      $projectCount.html(filterData.length)

      window.sessionStorage.setItem('app', JSON.stringify(appDataModel))
      console.log('filterData', filterData)
    }
  }

  function assetInputs () {
    $assetSectionWrapper.on('change', 'input', function (event) {
      const input = $(this)
      const value = input.val()
      const prop = input.attr('name')
      const name = input.data('asset-name')
      const selectedAssetArr = []
      const { selectedAsset } = appDataModel

      selectedAsset.name = value
      selectedAsset.type = name

      selectedAssetArr.push({ [`${prop}`]: value })
      getAssetData(event, selectedAssetArr)
    })
  }

  /********* END: ASSET SELECTION PAGE  ***********/

  /********* START: RESULT PAGE ***********/

  function getAllRegions (data) {
    if ($regionListWrapper.length) {
      const groupRegions = _.mapValues(_.groupBy(data, 'assetRegion'))
      const regionList = Object.keys(groupRegions)

      regionList.unshift('All of the uk')
      regionList.map((items, index) => {
        $regionListWrapper.append(checkboxTpl(items, index))
      })
    }
  }

  function getAssetResultsData () {
    if ($resultPageWrapper.length) {
      const getSession = window.sessionStorage.getItem('app')
      const session = JSON.parse(getSession)
      const { selectedAssetProjects, selectedAsset } = session
      const data = selectedAssetProjects

      console.log('data Neil', selectedAssetProjects);

      const items = []
      $assetTitle.html(selectedAsset.name)

      if (data.length) {
        data.map((item, index) => {
          items.push(item)
          $resultsListWrapper.append(resultsListItemTpl(items, index))
        })
      }
    }
  }

  function onInput () {
    $resultPageWrapper.on('click', 'input', function () {
      const checkBox = $(this)
      const value = checkBox.val()
      const name = checkBox.attr('name')

      updateFilterOpts(checkBox, value, name)
    })
  }

  function updateFilterOpts (el, value, propName) {
    let opts = []

    if (el.is(':checked')) {
      paramArr.push({ [`${propName}`]: value })
      opts = paramArr
    } else {
      opts = $.grep(paramArr, function (e) {
        return e[`${propName}`] !== value
      })
    }

    console.log('opts', opts)
    console.log('paramArr', paramArr)

    onFilter(opts, propName)
  }

  function onFilter (filterOpts, property) {
    const data = projectsDataModel
    const opts = filterOpts.length > 0 ? filterOpts : data

    console.log('filterOpts', filterOpts)

    const arrayFiltered = data.filter(el => {
      return opts.some(filter => {
        return filter[property] === el[property]
      })
    })
    console.log('arrayFiltered', arrayFiltered)
    updateFilteredList(arrayFiltered)
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

  $resultsListWrapper.on('click', '.addToCompare', function (event) {
    event.preventDefault()

    const elem = $(this)
    const id = $(this).data('compare-id')

    if (elem.hasClass('added')) {
      elem.text('Add to dataset').removeClass('added')
    } else {
      elem.text('Remove').addClass('added')
    }

    // if (itemsToCompare.length > 1) {
    //   itemsToCompare.map((item) => {
    //     if (...item) {
    //
    //     }
    //   });
    // }

    itemsToCompare.push({ projectID: id })
    $compareCount.html(itemsToCompare.length)

    const { compareList } = appDataModel
    compareList.push(...itemsToCompare)

    const getSession = window.sessionStorage.getItem('app')
    const session = JSON.parse(getSession)

    //console.log('appSession', JSON.parse(session))

    // window.sessionStorage.setItem('app', JSON.stringify(appDataModel))

    //console.log('appSession', appSession)

    // if (appSession) {
    //   const appData = JSON.parse(appSession)
    //
    //   console.log('appData 11111', appData)
    //
    //   appData[compareList] = itemsToCompare
    //   //window.sessionStorage.setItem('app', JSON.stringify(appDataModel))
    //
    // } else {
    //   // window.sessionStorage.setItem('app', JSON.stringify(appDataModel))
    // }
    //
    // console.log('appDataModel', appDataModel)
    // // console.log('itemsToCompare', itemsToCompare)
  })

  /********* END: RESULT PAGE ***********/

  /**** Asset page ****/
  getAssetOpts()
  getProjectData()
  assetInputs()

  /**** Results page ****/
  getAssetResultsData()
  onInput()

  //getCheckboxOpts()
  //getProjectData()

  // const $selectAssetType = $('#selectAssetType')
  // $selectAssetType.submit(function () {
  //   const session = window.sessionStorage.getItem('app')
  //   if (session === null) {
  //     window.sessionStorage.setItem('app', JSON.stringify(appDataModel))
  //   }
  // })

})
