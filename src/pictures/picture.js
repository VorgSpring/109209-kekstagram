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
  this.element = getPictureElement(data, container);
  this.onClick = function(event) {
    event.preventDefault();
    // Добавляем в хэш адреса страницы url текущего изображения
    location.hash ='photo/' + data.url;
  };
  this.remove = function() {
    this.element.removeEventListener('click', this.onClick);
    this.element.remove();
  };

  this.element.addEventListener('click', this.onClick);
  container.appendChild(this.element);
};

module.exports = Photo;
