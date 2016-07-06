'use strict';

/**
 * Описывает базовую DOM-компоненту
 * @param {HTMLElement} element
 * @constructor
 */
var BaseComponent = function(element) {
  /**
   * Допустимое время загрузки изображения
   * @constant {number}
   */
  this.LOAD_TIMEOUT = 5000;

  this.element = element;
};

/**
 * Создание DOM-разметки в element
 * @param {Object} data
 * @param {number} size
 */
BaseComponent.prototype.create = function(data, size) {
  this.element.likesCount.textContent = data.likes;
  this.element.commentsCount.textContent = data.comments;
  var contantImage = this.element.contantImage;
  // Добавляем фото
  var uploadImage = new Image();
  var imageLoadTimeout = setTimeout(function() {
    contantImage.classList.add('picture-load-failure');
  }, this.LOAD_TIMEOUT);

  // Обработчик загрузки
  uploadImage.onload = function() {
    uploadImage.onerror = null;
    clearTimeout(imageLoadTimeout);
    if (contantImage.classList.contains('picture-load-failure')) {
      contantImage.classList.remove('picture-load-failure');
    }
    contantImage.width = size;
    contantImage.height = size;
    contantImage.src = data.url;
  };

  // Обработчик ошибки
  uploadImage.onerror = function() {
    uploadImage.onload = null;
    clearTimeout(imageLoadTimeout);
    contantImage.classList.add('picture-load-failure');
    contantImage.src = '';
  };

  uploadImage.src = data.url;
};

/**
 * Обработчик клика
 * @param {string} url
 */
BaseComponent.prototype.onClick = function(url) {
  location.hash = 'photo/' + url;
};

/**
 * Добавляет element в container
 * @param {HTMLElement} container
 */
BaseComponent.prototype.insert = function(container) {
  container.appendChild(this.element);
};

/**
 * Удаляет element из разметки
 */
BaseComponent.prototype.remove = function() {
  this.element.parentNode.removeChild(this.element);
};

module.exports = BaseComponent;
