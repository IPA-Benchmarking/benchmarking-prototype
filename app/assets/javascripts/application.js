/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

if (window.location.search && $('.results').length) {
  window.history.replaceState({}, document.title, window.location.pathname);
}

const evn = window.location.host;
// const ipaConfig = {
//   url: evn.search('localhost') > -1 ? 'http://localhost:4041/api' : 'https://ipamockapi.herokuapp.com/api'
// }
const ipaConfig = {
  url: 'https://ipamockapi.herokuapp.com/api'
}

console.log('ipaConfig', evn.search('localhost'));
const paramArr = [];
const searchParams = new URLSearchParams(window.location.search);
const searchDataArr = [];
let params = [];
let newArr = [];
const $resultsListWrapper = $('.results-list');
const $checkboxesWrapper = $('.govuk-checkboxes');
const $countWrapper = $('.results-count');

const checkboxTpl = (items, i) => {
  const id = camelize(items[i].text);
  return `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
  <div class="govuk-checkboxes__item">
    <input class="govuk-checkboxes__input" id="${id}" name="projectTypeID" type="checkbox" value="${items[i].value}">
    <label class="govuk-label govuk-checkboxes__label" for="waste">
      ${items[i].text}
    </label>
  </div>`
}

const resultsListItemTpl = (results, i) => {
  return `<li class="results-item">
  <p class="list-item-title"><a href="#">${results[i].ProjectName}</a></p>
  <p>Construction address or local authority Project end date: ${results[i].ProjectEndDate}</p>
  <p>Any other information that might be interested by users can be added here.</p>
  <button class="govuk-button govuk-button--secondary" data-module="govuk-button">Add to benchmark</button>
  </li>`
}

const camelize = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function getCheckboxOpts() {
  $.getJSON( `${ipaConfig.url}/projectType`, function( data ) {
    const items = [];
    data.map((item, index) => {
      items.push({text: item.type, value: item.id });
      $checkboxesWrapper.append(checkboxTpl(items, index));
    })
  })
}

function getProjectData() {
  $.getJSON( `${ipaConfig.url}/projects`, function( data ) {
    const items = [];
 
    if (data.length) {
      data.map((item, index) => {
        items.push(item);
        $resultsListWrapper.append(resultsListItemTpl(items, index));
      });
    }
    
    searchDataArr.push(...data);
    $countWrapper.text(items.length);
  });
}

function onFilter(val, prop) {
  const data = searchDataArr;
  console.log('data', data);
  // const params = searchParams.get('projectTypeID'); //params.getAll('foo'))
  // const paramsArr = parseInt(params.split(","), 10);
  newArr.push({ 'projectTypeID': val });
  let myfilter = newArr;
  // const arrayFiltered = [];
  console.log('newArr', newArr);

  const arrayFiltered = data.filter( el => {
    return myfilter.some( filter => {
      return filter[prop] === el[prop] && filter[prop] === el[prop];
    });
  });

  updateFilteredList(arrayFiltered);
}

function updateFilteredList(arrayFiltered) {
  console.log('arrayFiltered', arrayFiltered);

  $resultsListWrapper.empty();

  const items = [];
 
    if (arrayFiltered.length) {
        arrayFiltered.map((item, index) => {
        items.push(item);
        $resultsListWrapper.append(resultsListItemTpl(items, index));
      });
    }

    $countWrapper.text(items.length);
}

function checkboxes() {
  $checkboxesWrapper.on('click', 'input', function () {
    const checkBox = $(this);
    const value = checkBox.val();
    const name = checkBox.attr('name');
    
    updateParams(checkBox, value);
    onFilter(value, name);
  });
}

function updateParams(el, value) {
  const index = paramArr.indexOf(value);
  if (el.is(':checked')) {
    paramArr.push(value); 
  } else {
    if (index > -1) {
      paramArr.splice(index, 1);
    }
  }
  updateSearchParams(paramArr)
}

function updateSearchParams(arr) {
    const pathname = window.location.pathname;
    let params = '';
    
    searchParams.set("projectTypeID", arr);
    params = searchParams.toString();
    window.history.pushState(null, null, `${pathname}?${params}`);
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  
  getCheckboxOpts();
  getProjectData();
  checkboxes();
})
