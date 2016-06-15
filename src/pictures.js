'use strict';

/**
 * Добавляет скрипт с JSON в разметку и выполняет callback функцию в этом JSON
 * @param {string} data
 * @param {function} callBackFunction
 */
function toPerformJSON(adress, callBackFunction) {
  var script = document.createElement('script');
  script.src = adress;

  if (script.readyState == 'loaded' || script.readyState == 'completed') {
    callBackFunction();
  } else {
    setTimeout(function () {
      toPerformJSON(script, callBackFunction);
    }, 100);
  }

  document.body.appendChild(script);
}

var __picturesLoadCallback = function () {
  console.log(arguments[0]); // тут объект, который вернулся из запроса
  var pictures = arguments[0] || [];
  pictures.forEach(function (picture) {
    // Перебераем список полученный с сервера
    getPictureElement(picture, picturesContainer);
  })
};
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
    uploadImage.src = '';
    contantImage.classList.add('picture-load-failure');
  }, IMAGE_LOAD_TIMEOUT);

  // Обработчик загрузки
  uploadImage.onload = function() {
    clearTimeout(imageLoadTimeout);
    contantImage.src = data.url;
  };

  // Обработчик ошибки
  uploadImage.onerror = function() {
    contantImage.classList.add('picture-load-failure');
  };

  uploadImage.src = data.url;
  // Вставляем элемент в DOM
  container.appendChild(element);
  return element;
};

// Добавляем скрипт с JSON
toPerformJSON('https://up.htmlacademy.ru/assets/js_intensive/jsonp/pictures.js', __picturesLoadCallback);

// Отображаем блок с фильтрами
filters.classList.remove('hidden');
