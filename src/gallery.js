'use strict';

/**
 * Действие при неудачной загрузке изображения
 * @param {HTMLElement} uploadImage
 * @param {HTMLElement} contantImage
 */
var toFailedLoadImage = require('./utilities').toFailedLoadImage;

/**
 * Допустимое время загрузки
 * @constant {number}
 */
var LOAD_TIMEOUT = 10000;

/**
 * Блок с галерей
 * @type {HTMLElement}
 */
var gallery = document.querySelector('.gallery-overlay');

/**
 * Блок с изображением
 * @type {HTMLElement}
 */
var gallaryContantImage = gallery.querySelector('.gallery-overlay-image');

/**
 * Блок с колличеством 'лайков'
 * @type {HTMLElement}
 */
var gallaryLikesCount = gallery.querySelector('.likes-count');

/**
 * Блок с колличеством коментариев
 * @type {HTMLElement}
 */
var gallaryCommentsCount = gallery.querySelector('.comments-count');

/**
 * Массив с изображениями
 * @type {Array}
 */
var galleryPictures = [];

/**
 * Номер текущего изображения
 * @type {number}
 */
var numberOfCurrentImage = null;

/**
 * Скрывает галерею и удаляет связанные с ней делегат и событие
 */
var hideGallery = function() {
  // Скрываем галерею
  gallery.classList.add('invisible');

  // Удаляем делегат
  window.removeEventListener('click', delegateFunction);

  // Удаляем событие при нажатии 'ESC'
  window.removeEventListener('keypress', _onDocumentKeyDown);
};

/**
 * Заполняет галерею
 * @param {number} numberImage
 */
var getGalleryElement = function(numberImage) {
  // Находим элемент
  var currentImage = galleryPictures[numberImage];
  // Заполняем галерею данными о комментариях, лайках
  gallaryLikesCount.textContent = currentImage.likes;
  gallaryCommentsCount.textContent = currentImage.comments;
  // Добавляем фото
  var uploadImage = new Image(640, 640);
  var imageLoadTimeout = setTimeout(function() {
    toFailedLoadImage(uploadImage, gallaryContantImage);
  }, LOAD_TIMEOUT);

  // Обработчик загрузки
  uploadImage.onload = function() {
    uploadImage.onerror = null;
    clearTimeout(imageLoadTimeout);
    if (gallaryContantImage.classList.contains('picture-load-failure')) {
      gallaryContantImage.classList.remove('picture-load-failure');
    }
    gallaryContantImage.src = currentImage.url;
  };

  // Обработчик ошибки
  uploadImage.onerror = function() {
    uploadImage.onload = null;
    toFailedLoadImage(uploadImage, gallaryContantImage);
    gallaryContantImage.src = '';
  };

  uploadImage.src = currentImage.url;
};

/**
 * Делегат на галереи
 * @param {Event} event
 */
var delegateFunction = function(event) {
  if (event.target.classList.contains('gallery-overlay-image')) {
    _onPhotoClick();
  } else if (event.target.classList.contains('gallery-overlay-close') ||
    event.target.classList.contains('gallery-overlay')) {
    hideGallery();
  }
};

/**
 * Обработчик клика на изображении
 */
var _onPhotoClick = function() {
  // Увиличиваем номер текущего изображения
  numberOfCurrentImage++;
  // Заполняем галерею данными
  getGalleryElement(numberOfCurrentImage);
};

/**
 * Обработчик нажатия клавиши 'ESC'
 * @param {Event} event
 */
var _onDocumentKeyDown = function(event) {
  if (event.keyCode === 27) {
    hideGallery();
  }
};

module.exports = {
  /**
   * Сохраняет полученный список с изображениями
   * @param {Array} pictures
   */
  seveGallery: function(pictures) {
    galleryPictures = pictures;
  },

  /**
   * Отображает галерею
   * @param {number} numberImage
   */
  showGallery: function(numberImage) {
    // Сохраняем номер текущего изображения
    numberOfCurrentImage = numberImage;

    // Заполняем галерею данными
    getGalleryElement(numberImage);

    // Обработчик клика
    gallery.addEventListener('click', delegateFunction);

    // Обработчик нажатия клавиши 'ESC'
    window.addEventListener('keypress', _onDocumentKeyDown);

    // Отображаем галерею
    gallery.classList.remove('invisible');
  }
};
