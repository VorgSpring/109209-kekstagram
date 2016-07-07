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
};

module.exports = Element;
