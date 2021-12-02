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
  url: evn.search('localhost') > -1 ? 'http://localhost:4041/api' : 'https://ipamockapi.herokuapp.com/api'
}

console.log(ipaConfig.url)

// const searchParams = new URLSearchParams(window.location.search)
const searchDataArr = []
const projectsDataModel = []
const paramArr = []
// let params = []
const newArr = []
const $resultsListWrapper = $('.results-list')
const $checkboxesWrapper = $('.govuk-checkboxes')
const $countWrapper = $('.results-count')

const checkboxTpl = (items, i) => {
  const inputId = _.camelCase(items[i].text)
  return `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
  <div class="govuk-checkboxes__item">
    <input class="govuk-checkboxes__input" id="${inputId}" name="projectTypeID" type="checkbox" value="${items[i].value}">
    <label class="govuk-label govuk-checkboxes__label" for="waste">
      ${items[i].text}
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
    if (data.length) {
      data.map((item, index) => {
        items.push({ text: item.type, value: item.id })
        $checkboxesWrapper.append(checkboxTpl(items, index))
      })
    }
  })
}

function getProjectData () {
  const params = { page: 1, limit: 10 }

  $.get(`${ipaConfig.url}/projects`, params, function (data) {

    // console.log('data', data)
    const dataModel = data
    const items = []
    const countTpl = `${items.length}/${dataModel.length}`

    if (dataModel.length) {
      dataModel.map((item, index) => {
        items.push(item)
        $resultsListWrapper.append(resultsListItemTpl(items, index))
      })
    }

    projectsDataModel.push(...dataModel)
    $countWrapper.text(countTpl)
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
  $checkboxesWrapper.on('click', 'input', function () {
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

$(document).ready(function () {
  window.GOVUKFrontend.initAll()

  getCheckboxOpts()
  getProjectData()
  checkboxes()
})
