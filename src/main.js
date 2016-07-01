'use strict';

require('./resizer');
require('./upload');

var getFilteredImages = require('./filter');
var renderPictures = require('./pictures/renderPictures');
var load = require('./load');
var utilities = require('./utilities.js');

/**
 * Массив с изображениями, которые полученны с сервера
 * @type {Array}
 */
var pictures = [];

/**
 * Массив с отфильтрованными изображениями, которые полученны с сервера
 * @type {Array}
 */
var filterImages = [];

/**
 * Хранит отфильтрованные списки изображений
 */
var filteredImages = {};

/**
 * Блок с фотографиями
 * @type {HTMLElement}
 */
var picturesContainer = document.querySelector('.pictures');

/**
 * Блок с фильтрами
 * @type {HTMLElement}
 */
var filters = document.querySelector('.filters');

// Скрываем блок с фильтрами
utilities.hideBlock(filters);

/**
 * URL файла JSON
 * @constant {string}
 */
var IMAGE_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json';

/**
 * Время через которое выполняется функция
 * @constant {number}
 */
var THROTTLE_DELAY = 100;

/**
 * Начальный номер страницы
 * @type {number}
 */
var pageNumber = 0;

/**
 * Колличество фотографий на странице
 * @constant {number}
 */
var PAGE_SIZE = 5;

/**
 * Оптимизированная функция отрисовки следующей страницы при прокрути scrollbar
 */
var optimizedScroll = utilities.throttle(function () {
  if (utilities.isBottomReached(picturesContainer) &&
      utilities.isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
    pageNumber++;
    renderPictures(filterImages, picturesContainer, pageNumber, PAGE_SIZE, false);
  }
}, THROTTLE_DELAY);


/**
 * Отображает блок с отфильтрованными изображениеми
 * @param {string} filter
 */
var renderImagesByFilter = function (filter) {
  filterImages = filteredImages[filter];
  pageNumber = 0;
  renderPictures(filterImages, picturesContainer, pageNumber, PAGE_SIZE, true);
  // Если страница не заполненна
  while (utilities.isBottomReached(picturesContainer) &&
      utilities.isNextPageAvailable(filterImages, pageNumber, PAGE_SIZE)) {
    pageNumber++;
    console.log(pageNumber);
    renderPictures(filterImages, picturesContainer, pageNumber, PAGE_SIZE, false);
  }
};

/**
 * Добавляет обработчик клика на элементы фильтра, считает сколько
 * элементов подходит под каждый из фильтр и если ни один из элементов
 * не проходит по какому-либо из фильтров, блокирует в интерфейсе
 * кнопку соответствующего фильтра
 */
var setFiltrationEnabled = function () {
  // Находим все радио кнопки
  var filtersItem = document.querySelectorAll('.filters-radio');
  for (var i = 0; i < filtersItem.length; i++) {
    // Посчитываем, сколько элементов подходит под каждый из фильтров
    var filtersArrayLength = filteredImages[filtersItem[i].value].length;
    var labelItem = document.querySelector('#' + filtersItem[i].id + '+label');

    // Полученное значение выводим в скобках в теге <sup/>
    utilities.addMessage(labelItem, filtersArrayLength);

    if (filtersArrayLength === 0) {
      utilities.setRadioButtonDisabled(labelItem, 'filters-item--disabled');
    }

    // Если фильтр выбран отрисовываем его
    if (filtersItem[i].checked === true) {
      renderImagesByFilter(filtersItem[i].value);
    }
  }
  // Обработчик клика
  filters.addEventListener('click', function (event) {
    if (event.target.classList.contains('filters-radio')) {
      renderImagesByFilter(event.target.value);
    }
  });
};

// Отображаем блок с изображениеми
load(picturesContainer, IMAGE_LOAD_URL, function (loadedImages) {
  pictures = loadedImages;
  filteredImages = getFilteredImages(pictures);
  setFiltrationEnabled();
  window.addEventListener('scroll', optimizedScroll);
});

// Отображаем блок с фильтрами
utilities.showBlock(filters);
