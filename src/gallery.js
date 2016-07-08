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
 * Базовые функции
 */
var utilities = require('./utilities');


/**
 * Конструктор для отрисовки галереи
 * @constructor
 */
var Gallery = function() {

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
  this.hideGallery = this.hideGallery.bind(this);
  this.getGalleryElement = this.getGalleryElement.bind(this);
  this.delegateFunction = this.delegateFunction.bind(this);
  this._onPhotoClick = this._onPhotoClick.bind(this);
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  this._onHashChange = this._onHashChange.bind(this);
  this.initGallery = this.initGallery.bind(this);
  this.showGallery = this.showGallery.bind(this);
};

// Наследуем цепочку прототипов
utilities.inherit(Gallery, BaseComponent);

/**
 * Скрывает галерею, удаляет связанный с ней делегат и чистит хэш адресной строки
 */
Gallery.prototype.hideGallery = function() {
  // Скрываем галерею
  this.element.gallery.classList.add('invisible');

  // Удаляем делегат
  this.removeEvents.call(this);

  // Чистим хэш адресной строки
  location.hash = '';
};

/**
 * Заполняет галерею
 * @param {number} or {string} numberOrUrlOfImage
 */
Gallery.prototype.getGalleryElement = function(numberOrUrlOfImage) {
  // Находим элемент
  var currentObject = null;
  // Сохраняем номер текущего изображения
  if (typeof numberOrUrlOfImage === 'string') {
    this.numberOfCurrentImage = searchInArray(this.galleryPictures, numberOrUrlOfImage);
    currentObject = this.galleryPictures[this.numberOfCurrentImage];
  } else if (typeof numberOrUrlOfImage === 'number') {
    this.numberOfCurrentImage = numberOrUrlOfImage;
    currentObject = this.galleryPictures[numberOrUrlOfImage];
  }
  // Размер вставляемого изображения
  var size = 640;
  // Заполняем галерею данными о комментариях, лайках
  utilities.createDOM(this.element, currentObject, size);
};

/**
 * Делегат на галереи
 * @param {Event} event
 */
Gallery.prototype.delegateFunction = function(event) {
  if (event.target.classList.contains('gallery-overlay-image')) {
    // Отображаем следующее изображение
    this._onPhotoClick();
  } else if (event.target.classList.contains('likes-count')) {
    // Увиличиваем количество likes
    var currentObject = this.galleryPictures[this.numberOfCurrentImage];
    currentObject.increaseLikesCount();
  }else if (event.target.classList.contains('gallery-overlay-close') ||
    event.target.classList.contains('gallery-overlay')) {
    // Закрываем галерею
    this.hideGallery();
  }
};

/**
 * Обработчик клика на изображении
 */
Gallery.prototype._onPhotoClick = function() {
  // Увиличиваем номер текущего изображения
  this.numberOfCurrentImage++;
  if (this.numberOfCurrentImage === this.galleryPictures.length) {
    this.numberOfCurrentImage = 0;
  }

  // Добавляем в хэш адреса страницы url следующего изображения
  location.hash = 'photo/' + this.galleryPictures[this.numberOfCurrentImage].url;
};

/**
 * Обработчик нажатия клавиши 'ESC'
 * @param {Event} event
 */
Gallery.prototype._onDocumentKeyDown = function(event) {
  if (event.keyCode === this.ESC_KEY_CODE) {
    this.hideGallery();
  }
};

/**
 * Обработчик изменения адресной строки
 */
Gallery.prototype._onHashChange = function() {
  var adress = location.hash;
  if (!adress.match(this.REG_EXP)) {
    this.hideGallery();
  } else {
    this.showGallery(adress);
  }
};

/**
 * Сохраняет полученный список с изображениями
 * @param {Array} pictures
 */
Gallery.prototype.initGallery = function(pictures) {
  this.galleryPictures = pictures;

  // Обработчик нажатия клавиши 'ESC'
  window.addEventListener('keypress', this._onDocumentKeyDown);

  // Обработчик изменения адресной строки
  window.addEventListener('hashchange', this._onHashChange);
};

/**
 * Отображает галерею
 * @param {string} pictureUrl
 */
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
  this.addEvent.call(this, this.element.gallery, 'click', this.delegateFunction.bind(this));

  // Отображаем галерею
  this.element.gallery.classList.remove('invisible');
};

var mainGallery = new Gallery();

module.exports = {
  showGallery: mainGallery.showGallery,
  initGallery: mainGallery.initGallery
};
