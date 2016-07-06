'use strict';

/**
 * Действие при неудачной загрузке изображения
 * @param {HTMLElement} uploadImage
 * @param {HTMLElement} contantImage
 */
var toFailedLoadImage = require('./utilities').toFailedLoadImage;

/**
 * Находит в массиве объект который содержит url и возвращает этот объект
 * @param {Array.<Object>} array
 * @param {string} url
 * @returns {Object}
 */
var searchInArray = require('./utilities.js').searchInArray;

/**
 * Конструктор для отрисовки галереи
 * @constructor
 */
var Gallery = function() {

  
  /**
   * Допустимое время загрузки
   * @constant {number}
   */
  this.LOAD_TIMEOUT = 10000;

  /**
   * Код клавиши 'ESC'
   * @constant {number}
   */
  this.ESC_KEY_CODE = 27;

  /**
   * Регулярное выражение для проверки
   * @constant {RegExp}
   */
  this.REG_EXP = /#photo\/(\S+)/;

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
  this.galleryPictures = [];

  /**
   * Номер текущего изображения
   * @type {number}
   */
  this.numberOfCurrentImage = null;

  /**
   * Скрывает галерею, удаляет связанный с ней делегат и чистит хэш адресной строки
   */
  this.hideGallery = this.hideGallery.bind(this);

  /**
   * Заполняет галерею
   * @param {number} or {string} numberOrUrlOfImage
   */
  this.getGalleryElement = this.getGalleryElement.bind(this);

  /**
   * Делегат на галереи
   * @param {Event} event
   */
  this.delegateFunction = this.delegateFunction.bind(this);

  /**
   * Обработчик клика на изображении
   */
  this._onPhotoClick = this._onPhotoClick.bind(this);

  /**
   * Обработчик нажатия клавиши 'ESC'
   * @param {Event} event
   */
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);

  /**
   * Обработчик изменения адресной строки
   */
  this._onHashChange = this._onHashChange.bind(this);

  /**
   * Сохраняет полученный список с изображениями
   * @param {Array} pictures
   */
  this.initGallery = this.initGallery.bind(this);

  /**
   * Отображает галерею
   * @param {string} pictureUrl
   */
  this.showGallery = this.showGallery.bind(this);
};

Gallery.prototype.hideGallery = function() {
  // Скрываем галерею
  this.element.gallery.classList.add('invisible');

  // Удаляем делегат
  this.element.gallery.removeEventListener('click', this.delegateFunction);

  // Чистим хэш адресной строки
  location.hash = '';
};

Gallery.prototype.getGalleryElement = function(numberOrUrlOfImage) {
  // Находим элемент
  var currentImage = null;
  // Сохраняем номер текущего изображения
  if (typeof numberOrUrlOfImage === 'string') {
    this.numberOfCurrentImage = searchInArray(this.galleryPictures, numberOrUrlOfImage);
    currentImage = this.galleryPictures[this.numberOfCurrentImage];
  } else if (typeof numberOrUrlOfImage === 'number') {
    this.numberOfCurrentImage = numberOrUrlOfImage;
    currentImage = this.galleryPictures[numberOrUrlOfImage];
  }
  // Заполняем галерею данными о комментариях, лайках
  this.element.galleryLikesCount.textContent = currentImage.likes;
  this.element.galleryCommentsCount.textContent = currentImage.comments;
  var galleryContantImage = this.element.galleryContantImage;
  // Добавляем фото
  var uploadImage = new Image(640, 640);
  var imageLoadTimeout = setTimeout(function() {
    galleryContantImage.classList.add('picture-load-failure');
  }, this.LOAD_TIMEOUT);

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
    galleryContantImage.classList.add('picture-load-failure');
    galleryContantImage.src = '';
  };

  uploadImage.src = currentImage.url;
};

Gallery.prototype.delegateFunction = function(event) {
  if (event.target.classList.contains('gallery-overlay-image')) {
    this._onPhotoClick();
  } else if (event.target.classList.contains('gallery-overlay-close') ||
    event.target.classList.contains('gallery-overlay')) {
    this.hideGallery();
  }
};

Gallery.prototype._onPhotoClick = function() {
  // Увиличиваем номер текущего изображения
  this.numberOfCurrentImage++;
  if (this.numberOfCurrentImage === this.galleryPictures.length) {
    this.numberOfCurrentImage = 0;
  }

  // Добавляем в хэш адреса страницы url следующего изображения
  location.hash = 'photo/' + this.galleryPictures[this.numberOfCurrentImage].url;
};

Gallery.prototype._onDocumentKeyDown = function(event) {
  if (event.keyCode === this.ESC_KEY_CODE) {
    this.hideGallery();
  }
};

Gallery.prototype._onHashChange = function() {
  var adress = location.hash;
  if (!adress.match(this.REG_EXP)) {
    this.hideGallery();
  } else {
    this.showGallery(adress);
  }
};

Gallery.prototype.initGallery = function(pictures) {
  this.galleryPictures = pictures;

  // Обработчик нажатия клавиши 'ESC'
  window.addEventListener('keypress', this._onDocumentKeyDown);

  // Обработчик изменения адресной строки
  window.addEventListener('hashchange', this._onHashChange);
};

Gallery.prototype.showGallery = function(pictureUrl) {
  pictureUrl = pictureUrl.match(this.REG_EXP);
  if (!pictureUrl) {
    return;
  } else {
    pictureUrl = pictureUrl[1];
  }
  // Заполняем галерею данными
  this.getGalleryElement(pictureUrl);

  // Обработчик клика
  this.element.gallery.addEventListener('click', this.delegateFunction);

  // Отображаем галерею
  this.element.gallery.classList.remove('invisible');
};

var mainGallery = new Gallery();

module.exports = {
  showGallery: mainGallery.showGallery,
  initGallery: mainGallery.initGallery
};
