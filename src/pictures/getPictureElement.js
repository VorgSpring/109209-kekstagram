'use strict';

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
 * Создаёт объект element на основе шаблона templateElement
 * @return {HTMLElement} element
 */
var getPictureElement = function() {
  // Клонируем шаблонный элемент
  var element = elementToClone.cloneNode(true);
  element.likesCount = element.querySelector('.picture-likes');
  element.commentsCount = element.querySelector('.picture-comments');
  element.contantImage = element.querySelector('img');
  return element;
};

module.exports = getPictureElement;
