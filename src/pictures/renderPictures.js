'use strict';
/**
 * Конструктор для отрисовки одной фотографии в списке
 * @param {Object} data
 * @param {HTMLElement} container
 * @constructor
 */
var Photo = require('./picture.js');

var renderedPictures = [];

/**
 * Фунция отображения изображений
 * @param {Array.<Object>} images
 * @param {HTMLElement} container
 * @param {number} page
 * @param {number} pageSize
 * @param {boolean} replace
 */
var renderPictures = function(images, container, page, pageSize, replace) {
  if (replace) {
    renderedPictures.forEach(function(picture) {
      picture.remove();
    })
  }

  var from = page * pageSize;
  var to = from + pageSize;

  images.slice(from, to).forEach(function(picture) {
    // Перебераем список полученный с сервера
    renderedPictures.push(new Photo(picture, container));
  });
};

module.exports = renderPictures;
