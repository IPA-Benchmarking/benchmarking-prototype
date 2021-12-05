/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

if (window.location.search && $('.results').length) {
  window.history.replaceState({}, document.title, window.location.pathname)
}

const evn = window.location.host
const ipaConfig = {
  url: evn.search('localhost') > -1 ? 'http://localhost:4041/api' : 'https://ipamockapi.herokuapp.com/api',
  appDataModel: {}
}

console.log(ipaConfig.url)

const projectsDataModel = []
const paramArr = []
const $resultsListWrapper = $('.results-list')
const $resultPageWrapper = $('.results-page')
const $countWrapper = $('.results-count')
const $assetSectionWrapper = $('.govuk-radios')
const $criteriaWrapper = $('.criteria')
const $regionListWrapper = $('.region-list')

const assetGroups = (section) => {
  const name = _.startCase(_.toLower(section))
  const id = _.camelCase(section)
  return `<section id="${id}" class="${id} sectors"><h3 class="govuk-heading-m">${name}</h3></section>`
}

const radiobuttonTpl = (items) => {
  const type = _.camelCase(items.type) || _.camelCase(items)

  return `<div class="govuk-radios__item">
               <input class="govuk-radios__input" id="${type}" name="${type}" type="radio" value="${type}">
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
  return `<li class="results-item">
  <p class="list-item-title"><a href="#">${results[i].projectName}</a></p>
  <p>Construction address or local authority Project end date: ${results[i].projectEndDate}</p>
  <p>Any other information that might be interested by users can be added here.</p>
  <button class="govuk-button govuk-button--secondary" data-module="govuk-button">Add to compare</button>
  </li>`
}

function getCheckboxOpts () {
  $.getJSON(`${ipaConfig.url}/projectType`, function (data) {
    const items = []

    if ($resultPageWrapper.length > 0 && data.length) {
      data.map((item, index) => {
        items.push({ text: item.type, value: item.id })
        $resultPageWrapper.append(checkboxTpl(items, index))
      })
    }
  })
}

function getAssetOpts () {
  $.getJSON(`${ipaConfig.url}/projectType`, function (data) {
    if ($('.asset-list').length && data.length) {
      //const groupSectors = _.mapValues(_.groupBy(data, 'sector'), sectorList => sectorList.map(sector => _.omit(sector, 'sector')))
      const groupSectors = _.mapValues(_.groupBy(data, 'sector'))
      console.log('groupSectors', groupSectors)

      Object.keys(groupSectors).forEach(function (key, index) {
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

function getProjectData () {
  const params = { page: 1, limit: 10 }

  $.get(`${ipaConfig.url}/projects`, params, function (data) {
    const dataModel = data
    const items = []
    const countTpl = `${items.length}/${dataModel.length}`

    console.log('data', data)

    if (dataModel.length) {
      dataModel.map((item, index) => {
        items.push(item)
        $resultsListWrapper.append(resultsListItemTpl(items, index))
      })
    }

    projectsDataModel.push(...dataModel)
    $countWrapper.text(countTpl)

  }).done((data) => {
    getAllRegions(data)
  })
}

function updateFilteredList (arrayFiltered) {
  // console.log('arrayFiltered', arrayFiltered)

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

function checkboxes () {
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

  // console.log('data', data)
  // console.log('filterOpts', filterOpts)

  const arrayFiltered = data.filter(el => {
    return opts.some(filter => {
      return filter[property] === el[property]
    })
  })
  // console.log('arrayFiltered', arrayFiltered)
  updateFilteredList(arrayFiltered)
}

function getAllRegions (data) {
  if ($criteriaWrapper.length) {
    const groupRegions = _.mapValues(_.groupBy(data, 'assetRegion'))
    const regionList = Object.keys(groupRegions)

    regionList.unshift('All of the uk');

    regionList.map((items, index) => {
      $regionListWrapper.append(checkboxTpl(items, index))
    })
  }
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  getCheckboxOpts()
  getAssetOpts()
  getProjectData()
  checkboxes()

})