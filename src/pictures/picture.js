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
 * Наследует один тип от другого, продлевая цепочку прототипов с использованием пустого конструктора
 * @param {Type}Parent
 * @param {Type}Child
 */
var inherit = require('../utilities.js').inherit;



/**
 * Конструктор для отрисовки одной фотографии в списке
 * @param {Object} data
 * @param {HTMLElement} container
 * @constructor
 */
var Photo = function(data, container) {
  this.data = data;
  this.element = getPictureElement();
  this.onClick = this.onClick.bind(this);
  this.remove = this.remove.bind(this);
  this.element.addEventListener('click', this.onClick);
  BaseComponent.call(this, this.element);
  // Размер вставляемого изображения
  var size = 182;
  // Заполняем element данными о комментариях, лайках
  this.create.call(this, this.data, size);
  // Вставляем element в container
  this.insert.call(this, container);
};

inherit(Photo, BaseComponent);

/**
 * Обработчик клика на изображении
 * @param {Event} event
 */
Photo.prototype.onClick = function(event) {
  event.preventDefault();
  // Добавляем в хэш адреса страницы url текущего изображения
  BaseComponent.prototype.onClick.call(this, this.data.url);
};

/**
 * Удаляет element из разметки
 */
Photo.prototype.remove = function() {
  this.element.removeEventListener('click', this.onClick);
  BaseComponent.prototype.remove.call(this);
};

module.exports = Photo;
