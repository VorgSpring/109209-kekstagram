'use strict';

/**
 * Действие при неудачной загрузке изображения
 * @param {HTMLElement} uploadImage
 * @param {HTMLElement} contantImage
 */
var toFailedLoadImage = require('./utilities').toFailedLoadImage;

/**
 * Конструктор для отрисовки галереи
 * @constructor
 */
var Gallery = function() {

  var self = this;
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

  this.element = {
    /**
       * Блок с галерей
       * @type {HTMLElement}
       */
    gallery: document.querySelector('.gallery-overlay'),
    /**
       * Блок с изображением
       * @type {HTMLElement}
       */
    galleryContantImage: document.querySelector('.gallery-overlay-image'),

    /**
     * Блок с колличеством 'лайков'
     * @type {HTMLElement}
     */
    galleryLikesCount: document.querySelector('.likes-count'),

    /**
     * Блок с колличеством коментариев
     * @type {HTMLElement}
     */
    galleryCommentsCount: document.querySelector('.comments-count')
  };

  /**
   * Массив с изображениями
   * @type {Array}
   */
  var galleryPictures = [];

  /**
   * Номер текущего изображения
   * @type {number}
   */
  this.numberOfCurrentImage = null;

  /**
   * Скрывает галерею, удаляет связанный с ней делегат и чистит хэш адресной строки
   */
  this.hideGallery = function() {
    // Скрываем галерею
    self.element.gallery.classList.add('invisible');

    // Удаляем делегат
    self.element.gallery.removeEventListener('click', self.delegateFunction);

    // Чистим хэш адресной строки
    location.hash = '';
  };

  /**
   * Заполняет галерею
   * @param {number} numberImage
   */
  this.getGalleryElement = function(numberImage) {
    // Находим элемент
    var currentImage = galleryPictures[numberImage];
    // Заполняем галерею данными о комментариях, лайках
    self.element.galleryLikesCount.textContent = currentImage.likes;
    self.element.galleryCommentsCount.textContent = currentImage.comments;
    // Добавляем фото
    var uploadImage = new Image(640, 640);
    var imageLoadTimeout = setTimeout(function() {
      toFailedLoadImage(uploadImage, self.element.galleryContantImage);
    }, LOAD_TIMEOUT);

    // Обработчик загрузки
    uploadImage.onload = function() {
      uploadImage.onerror = null;
      clearTimeout(imageLoadTimeout);
      if (self.element.galleryContantImage.classList.contains('picture-load-failure')) {
        self.element.galleryContantImage.classList.remove('picture-load-failure');
      }
      self.element.galleryContantImage.src = currentImage.url;
    };

    // Обработчик ошибки
    uploadImage.onerror = function() {
      uploadImage.onload = null;
      clearTimeout(imageLoadTimeout);
      toFailedLoadImage(uploadImage, self.element.galleryContantImage);
      self.element.galleryContantImage.src = '';
    };

    uploadImage.src = currentImage.url;
  };

  /**
   * Делегат на галереи
   * @param {Event} event
   */
  this.delegateFunction = function(event) {
    if (event.target.classList.contains('gallery-overlay-image')) {
      self._onPhotoClick();
    } else if (event.target.classList.contains('gallery-overlay-close') ||
      event.target.classList.contains('gallery-overlay')) {
      self.hideGallery();
    }
  };

  /**
   * Обработчик клика на изображении
   */
  this._onPhotoClick = function() {
    // Увиличиваем номер текущего изображения
    self.numberOfCurrentImage++;
    if (self.numberOfCurrentImage === galleryPictures.length) {
      self.numberOfCurrentImage = 0;
    }
    // Заполняем галерею данными
    self.getGalleryElement(self.numberOfCurrentImage);
  };

  /**
   * Обработчик нажатия клавиши 'ESC'
   * @param {Event} event
   */
  this._onDocumentKeyDown = function(event) {
    if (event.keyCode === ESC_KEY_CODE) {
      self.hideGallery();
    }
  };

  /**
   * Сохраняет полученный список с изображениями
   * @param {Array} pictures
   */
  this.initGallery = function(pictures) {
    galleryPictures = pictures;

    // Обработчик нажатия клавиши 'ESC'
    window.addEventListener('keypress', self._onDocumentKeyDown);
  };

  /**
   * Отображает галерею
   * @param {Object} picture
   */
  this.showGallery = function(picture) {
    // Сохраняем номер текущего изображения
    self.numberOfCurrentImage = galleryPictures.indexOf(picture);

    // Заполняем галерею данными
    self.getGalleryElement(self.numberOfCurrentImage);

    // Обработчик клика
    self.element.gallery.addEventListener('click', self.delegateFunction);

    // Отображаем галерею
    self.element.gallery.classList.remove('invisible');
  };
};

var mainGallery = new Gallery();

module.exports = {
  showGallery: mainGallery.showGallery,
  initGallery: mainGallery.initGallery
};
