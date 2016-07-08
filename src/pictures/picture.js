'use strict';

/**
 * Добавляет в container объект data на основе шаблона templateElement
 * @param {Object} data
 * @param {HTMLElement} container
 * @return {HTMLElement} element
 */
var getPictureElement = require('./getPictureElement');

/**
 * Описывает базовую DOM-компоненту
 * @constructor
 */
var BaseComponent = require('../base-component');

/**
 * Базовые функции
 */
var utilities = require('../utilities');

/**
 * Конструктор для отрисовки одной фотографии в списке
 * @param {Object} data
 * @param {HTMLElement} container
 * @constructor
 */
var Photo = function(data, container) {
  this.data = data;
  this.element = getPictureElement();
  BaseComponent.call(this, this.element);
  this.remove = this.remove.bind(this);
  this.addEvent(this.element, 'click', this.onClick.bind(this));
  // Размер вставляемого изображения
  this.sizeImage = 182;
  // Заполняем element данными о комментариях, лайках
  utilities.createDOM(this.element, this.data, this.sizeImage);
  // Вставляем element в container
  this.create.call(this, container);
};

// Наследуем цепочку прототипов
utilities.inherit(Photo, BaseComponent);

/**
 * Обработчик клика на изображении
 * @param {Event} event
 */
Photo.prototype.onClick = function(event) {
  event.preventDefault();
  if (event.target.classList.contains('picture-likes')) {
    // Увиличиваем количество likes
    this.data.increaseLikesCount();
  } else {
  // Добавляем в хэш адреса страницы url текущего изображения
    location.hash = 'photo/' + this.data.url;
  }
};

/**
 * Удаляет element из разметки
 */
Photo.prototype.remove = function() {
  BaseComponent.prototype.remove.call(this);
};

module.exports = Photo;
