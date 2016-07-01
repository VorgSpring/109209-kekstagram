'use strict';

var getPictureElement = require('./getPictureElement.js');
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
    container.innerHTML = '';
  }

  var from = page * pageSize;
  var to = from + pageSize;

  images.slice(from, to).forEach(function(picture) {
    // Перебераем список полученный с сервера
    getPictureElement(picture, container);
  });
};

module.exports = renderPictures;
