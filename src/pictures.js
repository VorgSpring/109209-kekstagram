'use strict';

/**
 * Блок с фильтрами
 * @type {HTMLElement}
 */
var filters = document.querySelector('.filters');
// Скрываем блок с фильтрами
filters.classList.add('hidden');

/**
 * Массив с изображениями, которые полученны с сервера
 * @type {Array}
 */
var pictures = [];

/**
 * Массив с отфильтрованными изображениями, которые полученны с сервера
 * @type {Array}
 */
var filteredImages = [];

/**
 * Блок с фотографиями
 * @type {HTMLElement}
 */
var picturesContainer = document.querySelector('.pictures');

/**
 * Допустимое время загрузки фотографии
 * @constant {number}
 */
var IMAGE_LOAD_TIMEOUT = 10000;

/**
 * Четыре дня в миллисекундах
 * @constant {number}
 */
var FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;

/**
 * URL файла JSON
 * @constant {string}
 */
var IMAGE_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json';

/**
 * Колличество фотографий на странице
 * @constant {number}
 */
var PAGE_SIZE = 5;

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
 * Шаблон для блока с фотографиями
 * @type {HTMLElement}
 */
var templateElement = document.querySelector('template');

/**
 * content элемента templateElement
 * @type {HTMLElement}
 */
var elementToClone;

// Если браузер не поддерживает тег 'template'
if ('content' in templateElement) {
  elementToClone = templateElement.content.querySelector('.picture');
} else {
  elementToClone = templateElement.querySelector('.picture');
}

/**
 * Действие при неудачной загрузке изображения
 * @param {HTMLElement} uploadImage
 * @param {HTMLElement} contantImage
 */
var toFailedLoadImage = function(uploadImage, contantImage) {
  uploadImage.src = '';
  contantImage.classList.add('picture-load-failure');
};

/**
 * Действие при неудачной загрузке списка изображений
 */
var toFailedLoadXHR = function() {
  picturesContainer.classList.remove('pictures-loading');
  picturesContainer.classList.add('pictures-failure');
};

/**
 * Добавляет в container объект data на основе шаблона templateElement
 * @param {Object} data
 * @param {HTMLElement} container
 * @return {HTMLElement} element
 */
var getPictureElement = function(data, container) {
  // Клонируем шаблонный элемент
  var element = elementToClone.cloneNode(true);
  // Заполняем элемент данными о комментариях, лайках
  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;
  // Добавляем фото
  var contantImage = element.querySelector('img');
  var uploadImage = new Image(182, 182);
  var imageLoadTimeout = setTimeout(function() {
    toFailedLoadImage(uploadImage, contantImage);
  }, IMAGE_LOAD_TIMEOUT);

  // Обработчик загрузки
  uploadImage.onload = function() {
    uploadImage.onerror = null;
    clearTimeout(imageLoadTimeout);
    contantImage.src = data.url;
  };

  // Обработчик ошибки
  uploadImage.onerror = function() {
    uploadImage.onload = null;
    toFailedLoadImage(uploadImage, contantImage);
  };

  uploadImage.src = data.url;

  // Вставляем элемент в DOM
  container.appendChild(element);
  return element;
};

/**
 * Получает список изображений по XMLHttpRequest
 * @param {function(Array.<Object>)} callback
 */
var getPictures = function(callback) {
  picturesContainer.classList.add('pictures-loading');
  var xhr = new XMLHttpRequest();
  var xhrLoadTimeout = setTimeout(function() {
    toFailedLoadXHR();
  }, IMAGE_LOAD_TIMEOUT);

  /**
   * Обработчик загрузки
   * @param {ProgressEvent}
   */
  xhr.onload = function(evt) {
    xhr.onerror = null;
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
  };

  // Обработчик пост загрузки
  xhr.onloadend = function() {
    clearTimeout(xhrLoadTimeout);
    picturesContainer.classList.remove('pictures-loading');
  };

  // Обработчик ошибки
  xhr.onerror = function() {
    xhr.onload = null;
    toFailedLoadXHR();
  };

  xhr.open('GET', IMAGE_LOAD_URL);
  xhr.send();
};

/**
 * Проверяет достигнут ли конец страницы
 * @return {boolean}
 */
var isBottomReached = function() {
  // Задел до конца страницы
  var GAP = 50;
  var picturesContainerPosition = picturesContainer.getBoundingClientRect();
  return picturesContainerPosition.bottom - (window.innerHeight + GAP) <= 0;
};

/**
 * Проверяет возможно ли перейти на следующую страницу
 * @param {Array} images
 * @param {number} page
 * @param {number} pageSize
 * @return {boolean}
 */
var isNextPageAvailable = function(images, page, pageSize) {
  return page < Math.ceil(images.length / pageSize);
};

/**
 * Оптимизирует callback, чтобы функция вызывалась не чаще, чем раз в time интервал времени
 * @param {function} callback
 * @param {number} time
 * @return {function}
 */
function throttle(callback, time) {
  var state = null;
  var COOLDOWN = 1;

  return function() {
    if (state) {
      return;
    }

    callback.apply(this, arguments);
    state = COOLDOWN;
    setTimeout(function() {
      state = null;
    }, time);
  };
}

/**
 * Оптимизированная функция отрисовки следующей страницы при прокрути scrollbar
 */
var optimizedScroll = throttle(function() {
  if (isBottomReached() &&
      isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
    pageNumber++;
    renderPictures(filteredImages, pageNumber, false);
  }
}, THROTTLE_DELAY);

/**
 * Фунция отображения изображений
 * @param {Array.<Object>} images
 */
var renderPictures = function(images, page, replace) {
  if (replace) {
    picturesContainer.innerHTML = '';
  }

  var from = page * PAGE_SIZE;
  var to = from + PAGE_SIZE;

  images.slice(from, to).forEach(function(picture) {
    // Перебераем список полученный с сервера
    getPictureElement(picture, picturesContainer);
    console.log('изображение');
  });

  // Если страница не заполненна
  if (isBottomReached() &&
      isNextPageAvailable(images, pageNumber, PAGE_SIZE)) {
    console.log('страница не заполненна');
    pageNumber++;
    console.log(pageNumber);
    renderPictures(images, pageNumber, false);
  }
};

/**
 * Возвращает список изображений, сделанных за последние четыре дня
 * @param {Array.<Object>} images
 * @return {Array.<Object>} imagesInFourDays
 */
var getPictureInFourDays = function(images) {
  var now = new Date();
  var imagesInFourDays = images.filter(function(item) {
    var interval = now - Date.parse(item.date);
    return interval <= FOUR_DAYS;
  });

  return imagesInFourDays;
};

/**
 * Сортирует изображения по выбранному фильтру
 * @param {Array.<Object>} images
 * @param {string} filter
 * @return {Array.<Object>} imagesToFilter
 */
var getFilteredImages = function(images, filter) {
  var imagesToFilter = images.slice(0);

  switch (filter) {
    case 'popular':
      break;
    case 'new':
      imagesToFilter = getPictureInFourDays(imagesToFilter);
      imagesToFilter.sort(function(a, b) {
        return Date.parse(b.date) - Date.parse(a.date);
      });
      break;
    case 'discussed':
      imagesToFilter.sort(function(a, b) {
        return b.comments - a.comments;
      });
      break;
  }
  return imagesToFilter;
};

/**
 * Отображает блок с отфильтрованными изображениеми
 * @param {string} filter
 */
var setFilterEnabled = function(filter) {
  filteredImages = getFilteredImages(pictures, filter);
  pageNumber = 0;
  renderPictures(filteredImages, pageNumber, true);
};

/**
 * Блокирует в интерфейсе кнопку фильтра
 * @param {HTMLElement} item
 */
var setFilterDisabled = function(item) {
  item.setAttribute('for', '');
  item.classList.add('filters-item--disabled');
};

/**
 * Выводит значение message в скобках в теге <sup/> на элементе item
 * @param {HTMLElement} item
 * @param {string} message
 */
var addFilterCounter = function(item, message) {
  var messageContainer = document.createElement('sup');
  item.appendChild(messageContainer);
  messageContainer.innerHTML = ' (' + message + ')';
};

/**
 * Добавляет обработчик клика на элементы фильтра, считает сколько
 * элементов подходит под каждый из фильтр и если ни один из элементов
 * не проходит по какому-либо из фильтров, блокирует в интерфейсе
 * кнопку соответствующего фильтра
 */
var setFiltrationEnabled = function() {
  // Находим все радио кнопки
  var filtersItem = document.querySelectorAll('.filters-radio');
  for (var i = 0; i < filtersItem.length; i++) {
    // Посчитываем, сколько элементов подходит под каждый из фильтров
    var filtersArrayLength = getFilteredImages(pictures, filtersItem[i].value).length;
    var labelItem = document.querySelector('#' + filtersItem[i].id + '+label');

    // Полученное значение выводим в скобках в теге <sup/>
    addFilterCounter(labelItem, filtersArrayLength);

    if (filtersArrayLength === 0) {
      setFilterDisabled(labelItem);
    }

    // Если фильтр выбран отрисовываем его
    if (filtersItem[i].checked === true) {
      setFilterEnabled(filtersItem[i].value);
    }
    // Обработчик клика
    filters.addEventListener('click', function(event) {
      if (event.target.classList.contains('filters-radio')) {
        setFilterEnabled(event.target.value);
      }
    });
  }
};

// Отображаем блок с изображениеми
getPictures(function(loadedImages) {
  pictures = loadedImages;
  setFiltrationEnabled();
  window.addEventListener('scroll', optimizedScroll);
});

// Отображаем блок с фильтрами
filters.classList.remove('hidden');
