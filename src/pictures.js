'use strict';

/**
 * Блок с фильтрами
 * @type {HTMLElement}
 */
var filters = document.querySelector('.filters');
// Скрываем блок с фильтрами
filters.classList.add('hidden');

// Создаём для каждой записи массива pictures блок фотографии на основе шаблона #picture-template.

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
 */
var toFailedLoadImage = function(uploadImage, contantImage) {
  uploadImage.src = '';
  contantImage.classList.add('picture-load-failure');
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
  // Заполняем элемент данными о комментариях и лайках
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
var getPictures = function (callback) {
  var xhr = new XMLHttpRequest();

  /** @param {ProgressEvent} */
  xhr.onload = function (evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
  };

  xhr.open('GET', IMAGE_LOAD_URL);
  xhr.send();
};

/**
 * Фунция отображения изображений
 * @param {Array.<Object>} pictures
 */
var renderPictures = function(pictures) {
  pictures.forEach(function(picture) {
    // Перебераем список полученный с сервера
    getPictureElement(picture, picturesContainer);
  });
};

getPictures(function (loadedImages) {
  var pictures = loadedImages;
  renderPictures(pictures);
})

// Отображаем блок с фильтрами
filters.classList.remove('hidden');
