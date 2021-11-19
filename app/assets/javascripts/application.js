/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

const evn = window.location.host; 
const ipaConfig = {
  url: evn.search('localhost') > -1 ? 'http://localhost:4041/api' : 'https://ipamockapi.herokuapp.com/api'
}

console.log('url', ipaConfig.url);

const checkboxTpl = (items, i) => {
  return `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
  <div class="govuk-checkboxes__item">
    <input class="govuk-checkboxes__input" id="${items[i].text}" name="${items[i].text}" type="checkbox" value="${items[i].value}">
    <label class="govuk-label govuk-checkboxes__label" for="waste">
      ${items[i].text}
    </label>
  </div>`
}

const resultsListItemTpl = (results, i) => {
  return `<li class="results-item">
  <p><a href="#">${results[i].ProjectName}</a></p>
  <p>Construction address or local authority Project end date: ${results[i].ProjectEndDate}</p>
  <p>Any other information that might be interested by users can be added here.</p>
  <button class="govuk-button govuk-button--secondary" data-module="govuk-button">Add to benchmark</button>
  </li>`
}



function getCheckboxData() {
  const $checkboxesWrapper = $('.govuk-checkboxes');
  $.getJSON( `${ipaConfig.url}/projectType`, function( data ) {
    const items = [];
    data.map((item, index) => {
      items.push({text: item.type, value: item.id });
      $checkboxesWrapper.append(checkboxTpl(items, index));
    })
  });
}

function getProjectData() {
  const $resultsListWrapper = $('.results-list');
  $.getJSON( `${ipaConfig.url}/projects`, function( data ) {
    const items = [];

    console.log('data', data);

    data.map((item, index) => {
      items.push(item);
      $resultsListWrapper.append(resultsListItemTpl(items, index));
    })

    $('.results-count').text(items.length);

  });
}


$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  
  getCheckboxData();
  getProjectData();

})
