'use strict';

/**
 * Добавляет в container объект data на основе шаблона templateElement
 * @param {Object} data
 * @param {HTMLElement} container
 * @return {HTMLElement} element
 */
var getPictureElement = require('./getPictureElement.js');


/**
 * Конструктор для отрисовки одной фотографии в списке
 * @param {Object} data
 * @param {HTMLElement} container
 * @constructor
 */
var Photo = function(data, container) {
  this.data = data;
  this.element = getPictureElement(this.data, container);
  this.onClick = this.onClick.bind(this);
  this.remove = this.remove.bind(this);
  this.element.addEventListener('click', this.onClick);
  container.appendChild(this.element);
};

Photo.prototype.onClick = function(event) {
  event.preventDefault();
  // Добавляем в хэш адреса страницы url текущего изображения
  location.hash = 'photo/' + this.data.url;
};

Photo.prototype.remove = function() {
  this.element.removeEventListener('click', this.onClick);
  this.element.parentNode.removeChild(this.element);
};

module.exports = Photo;
