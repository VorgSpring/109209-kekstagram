'use strict';

/**
 * Находит в массиве объект который содержит url и возвращает этот объект
 * @param {Array.<Object>} array
 * @param {string} url
 * @returns {Object}
 */
var searchInArray = require('./utilities.js').searchInArray;

/**
 * Описывает базовую DOM-компоненту
 * @constructor
 */
var BaseComponent = require('./base-component');

/**
 * Наследует один тип от другого, продлевая цепочку прототипов с использованием пустого конструктора
 * @param {Type} Parent
 * @param {Type} Child
 */
var inherit = require('./utilities.js').inherit;


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
    contantImage: document.querySelector('.gallery-overlay-image'),

    /**
     * Блок с колличеством 'лайков'
     * @type {HTMLElement}
     */
    likesCount: document.querySelector('.likes-count'),

    /**
     * Блок с колличеством коментариев
     * @type {HTMLElement}
     */
    commentsCount: document.querySelector('.comments-count')
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

  BaseComponent.call(this, this.element);

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


inherit(Gallery, BaseComponent);

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
  // Размер вставляемого изображения
  var size = 640;
  // Заполняем галерею данными о комментариях, лайках
  BaseComponent.prototype.create.call(this, currentImage, size);
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
  BaseComponent.prototype.onClick.call(this, this.galleryPictures[this.numberOfCurrentImage].url);
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
  if (pictureUrl === '') {
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
