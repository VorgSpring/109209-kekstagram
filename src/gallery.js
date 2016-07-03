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
 * Код клавиши 'ESC'
 * @constant {number}
 */
var ESC_KEY_CODE = 27;

/**
 * Блок с галерей
 * @type {HTMLElement}
 */
var gallery = document.querySelector('.gallery-overlay');

/**
 * Блок с изображением
 * @type {HTMLElement}
 */
var galleryContantImage = gallery.querySelector('.gallery-overlay-image');

/**
 * Блок с колличеством 'лайков'
 * @type {HTMLElement}
 */
var galleryLikesCount = gallery.querySelector('.likes-count');

/**
 * Блок с колличеством коментариев
 * @type {HTMLElement}
 */
var galleryCommentsCount = gallery.querySelector('.comments-count');

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
 * Скрывает галерею и удаляет связанный с ней делегат
 */
var hideGallery = function() {
  // Скрываем галерею
  gallery.classList.add('invisible');

  // Удаляем делегат
  window.removeEventListener('click', delegateFunction);
};

/**
 * Заполняет галерею
 * @param {number} numberImage
 */
var getGalleryElement = function(numberImage) {
  // Находим элемент
  var currentImage = galleryPictures[numberImage];
  // Заполняем галерею данными о комментариях, лайках
  galleryLikesCount.textContent = currentImage.likes;
  galleryCommentsCount.textContent = currentImage.comments;
  // Добавляем фото
  var uploadImage = new Image(640, 640);
  var imageLoadTimeout = setTimeout(function() {
    toFailedLoadImage(uploadImage, galleryContantImage);
  }, LOAD_TIMEOUT);

  // Обработчик загрузки
  uploadImage.onload = function() {
    uploadImage.onerror = null;
    clearTimeout(imageLoadTimeout);
    if (galleryContantImage.classList.contains('picture-load-failure')) {
      galleryContantImage.classList.remove('picture-load-failure');
    }
    galleryContantImage.src = currentImage.url;
  };

  // Обработчик ошибки
  uploadImage.onerror = function() {
    uploadImage.onload = null;
    clearTimeout(imageLoadTimeout);
    toFailedLoadImage(uploadImage, galleryContantImage);
    galleryContantImage.src = '';
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
  if (event.keyCode === ESC_KEY_CODE) {
    hideGallery();
  }
};

module.exports = {
  /**
   * Сохраняет полученный список с изображениями
   * @param {Array} pictures
   */
  initGallery: function(pictures) {
    galleryPictures = pictures;

    // Обработчик нажатия клавиши 'ESC'
    window.addEventListener('keypress', _onDocumentKeyDown);
  },

  /**
   * Отображает галерею
   * @param {Object} data
   */
  showGallery: function(data) {
    // Сохраняем номер текущего изображения
    numberOfCurrentImage = galleryPictures.indexOf(data);

    // Заполняем галерею данными
    getGalleryElement(numberOfCurrentImage);

    // Обработчик клика
    gallery.addEventListener('click', delegateFunction);

    // Отображаем галерею
    gallery.classList.remove('invisible');
  }
};
