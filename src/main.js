'use strict';

require('./resizer');
require('./upload');

var getFilteredImages = require('./filter');
var renderPictures = require('./pictures/renderPictures');
var load = require('./load');
var utilities = require('./utilities.js');

/**
 * ������ � �������������, ������� ��������� � �������
 * @type {Array}
 */
var pictures = [];

/**
 * ������ � ���������������� �������������, ������� ��������� � �������
 * @type {Array}
 */
var filterImages = [];

/**
 * ������ ��������������� ������ �����������
 */
var filteredImages = {};

/**
 * ���� � ������������
 * @type {HTMLElement}
 */
var picturesContainer = document.querySelector('.pictures');

/**
 * ���� � ���������
 * @type {HTMLElement}
 */
var filters = document.querySelector('.filters');

// �������� ���� � ���������
utilities.hideBlock(filters);

/**
 * URL ����� JSON
 * @constant {string}
 */
var IMAGE_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json';

/**
 * ����� ����� ������� ����������� �������
 * @constant {number}
 */
var THROTTLE_DELAY = 100;

/**
 * ��������� ����� ��������
 * @type {number}
 */
var pageNumber = 0;

/**
 * ����������� ���������� �� ��������
 * @constant {number}
 */
var PAGE_SIZE = 5;

/**
 * ���������������� ������� ��������� ��������� �������� ��� �������� scrollbar
 */
var optimizedScroll = utilities.throttle(function () {
  if (utilities.isBottomReached(picturesContainer) &&
      utilities.isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
    pageNumber++;
    renderPictures(filterImages, picturesContainer, pageNumber, PAGE_SIZE, false);
  }
}, THROTTLE_DELAY);


/**
 * ���������� ���� � ���������������� �������������
 * @param {string} filter
 */
var renderImagesByFilter = function (filter) {
  filterImages = filteredImages[filter];
  pageNumber = 0;
  renderPictures(filterImages, picturesContainer, pageNumber, PAGE_SIZE, true);
  // ���� �������� �� ����������
  while (utilities.isBottomReached(picturesContainer) &&
      utilities.isNextPageAvailable(filterImages, pageNumber, PAGE_SIZE)) {
    pageNumber++;
    console.log(pageNumber);
    renderPictures(filterImages, picturesContainer, pageNumber, PAGE_SIZE, false);
  }
};

/**
 * ��������� ���������� ����� �� �������� �������, ������� �������
 * ��������� �������� ��� ������ �� ������ � ���� �� ���� �� ���������
 * �� �������� �� ������-���� �� ��������, ��������� � ����������
 * ������ ���������������� �������
 */
var setFiltrationEnabled = function () {
  // ������� ��� ����� ������
  var filtersItem = document.querySelectorAll('.filters-radio');
  for (var i = 0; i < filtersItem.length; i++) {
    // �����������, ������� ��������� �������� ��� ������ �� ��������
    var filtersArrayLength = filteredImages[filtersItem[i].value].length;
    var labelItem = document.querySelector('#' + filtersItem[i].id + '+label');

    // ���������� �������� ������� � ������� � ���� <sup/>
    utilities.addMessage(labelItem, filtersArrayLength);

    if (filtersArrayLength === 0) {
      utilities.setRadioButtonDisabled(labelItem, 'filters-item--disabled');
    }

    // ���� ������ ������ ������������ ���
    if (filtersItem[i].checked === true) {
      renderImagesByFilter(filtersItem[i].value);
    }
  }
  // ���������� �����
  filters.addEventListener('click', function (event) {
    if (event.target.classList.contains('filters-radio')) {
      renderImagesByFilter(event.target.value);
    }
  });
};

// ���������� ���� � �������������
load(picturesContainer, IMAGE_LOAD_URL, function (loadedImages) {
  pictures = loadedImages;
  filteredImages = getFilteredImages(pictures);
  setFiltrationEnabled();
  window.addEventListener('scroll', optimizedScroll);
});

// ���������� ���� � ���������
utilities.showBlock(filters);
