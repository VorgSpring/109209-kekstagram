'use strict';

/**
 * Действие при неудачной загрузке изображения
 * @param {HTMLElement} uploadImage
 * @param {HTMLElement} contantImage
 */
var toFailedLoadImage = require('../utilities').toFailedLoadImage;

/**
 * Допустимое время загрузки
 * @constant {number}
 */
var LOAD_TIMEOUT = 10000;

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
  }, LOAD_TIMEOUT);

  // Обработчик загрузки
  uploadImage.onload = function() {
    uploadImage.onerror = null;
    clearTimeout(imageLoadTimeout);
    contantImage.src = data.url;
  };

  // Обработчик ошибки
  uploadImage.onerror = function() {
    uploadImage.onload = null;
    clearTimeout(imageLoadTimeout);
    toFailedLoadImage(uploadImage, contantImage);
  };

  uploadImage.src = data.url;

  // Вставляем элемент в DOM
  container.appendChild(element);
  return element;
};

module.exports = getPictureElement;
