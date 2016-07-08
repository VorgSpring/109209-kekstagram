'use strict';

/**
 * Конструктор для создания объекта в списке
 * @param {Object} data
 * @constructor
 */
var Element = function(data) {
  this.likes = data.likes;
  this.comments = data.comments;
  this.url = data.url;
  this.date = data.date;
};

/**
 * Увиличиваем количество likes
 */
Element.prototype.increaseLikesCount = function() {
  this.likes++;
  // Создаём событие
  var likesEvent = new CustomEvent('increaseLikes', {
    detail: {
      likesCount: this.likes,
      selectorList: 'img[src="' + this.url + '"] + span .picture-likes',
      selectorGallery: 'img[src="' + this.url + '"] + div .likes-count'
    }
  });
  // Инициализируем событие
  document.dispatchEvent(likesEvent);
};

module.exports = Element;
