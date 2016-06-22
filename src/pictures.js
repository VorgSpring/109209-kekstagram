'use strict';

/**
 * Блок с фильтрами
 * @type {HTMLElement}
 */
var filters = document.querySelector('.filters');
// Скрываем блок с фильтрами
filters.classList.add('hidden');

var pictures = [];

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
 * URL файла JSON
 * @constant {string}
 */
var IMAGE_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json';

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
 * @return {HTMLElement}
 */
var getPictureElement = function(data, container) {
  // Клонируем шаблонный элемент
  var element = elementToClone.cloneNode(true);
  // Заполняем элемент данными о комментариях, лайках
  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;
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
    toFailedLoadXHR();
  };

  xhr.open('GET', IMAGE_LOAD_URL);
  xhr.send();
};

/**
 * Фунция отображения изображений
 * @param {Array.<Object>} pictures
 */
var renderPictures = function(images) {
  picturesContainer.innerHTML = '';
  images.forEach(function(picture) {
    // Перебераем список полученный с сервера
    getPictureElement(picture, picturesContainer);
  });
};

/**
 * Возвращает список изображений, сделанных за последние четыре дня
 * @param {Array.<Object>} images
 * @return {Array.<Object>} imagesInFourDays
 */
var getPictureInFourDays = function(images) {
  // Четыре дня в миллисекундах
  var fourDays = 1000;

  var now = new Date();
  var imagesInFourDays = images.filter(function(item) {
    var interval = now - Date.parse(item.date);
    return interval <= fourDays;
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
  var filteredImages = getFilteredImages(pictures, filter);
  renderPictures(filteredImages);
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
    var lengthMessage = document.createElement('sup');
    labelItem.appendChild(lengthMessage);
    lengthMessage.innerHTML = ' (' + filtersArrayLength + ')';

    // Если список пуст блокируем кнопку
    if (filtersArrayLength === 0) {
      labelItem.setAttribute('for', '');
      labelItem.classList.add('filters-item--disabled');
    }

    // Если фильтр выбран отрисовываем его
    if (filtersItem[i].checked === true) {
      setFilterEnabled(filtersItem[i].value);
    }

    // Обработчик клика
    filtersItem[i].onclick = function() {
      setFilterEnabled(this.value);
    };
  }
};


// Отображаем блок с изображениеми
getPictures(function(loadedImages) {
  pictures = loadedImages;
  setFiltrationEnabled();
});

// Отображаем блок с фильтрами
filters.classList.remove('hidden');
