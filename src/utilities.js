﻿'use strict';

module.exports = {
  /**
   * Допустимое время загрузки изображения
   * @constant {number}
   */
  LOAD_TIMEOUT: 5000,

  /**
   * Выводит значение message в скобках в теге <sup/> на элементе item
   * @param {HTMLElement} item
   * @param {string} message
   */
  addMessage: function(item, message) {
    var messageContainer = document.createElement('sup');
    item.appendChild(messageContainer);
    messageContainer.innerHTML = ' (' + message + ')';
  },

  /**
   * Блокирует в интерфейсе label
   * @param {HTMLElement} label
   * @param {string} disabledButtonClass
   */
  setRadioButtonDisabled: function(label, disabledButtonClass) {
    label.setAttribute('for', '');
    label.classList.add(disabledButtonClass);
  },

  /**
   * Оптимизирует callback, чтобы функция вызывалась не чаще, чем раз в time интервал времени
   * @param {function} callback
   * @param {number} time
   * @return {function}
   */
  throttle: function(callback, time) {
    var state = null;
    var COOLDOWN = 1;

    return function() {
      if (state) {
        return;
      }
      callback.apply(this, arguments);
      state = COOLDOWN;
      setTimeout(function() {
        state = null;
      }, time);
    };
  },

  /**
   * Получить веремя от 17 июня
   * @return {Date}
   */
  getBirthDayDifferent: function() {
    var dateNow = new Date();
    var dateBirth = new Date(dateNow.getFullYear(), 5, 17);
    var birthDayDifferent = 0;

    if (dateNow > dateBirth) {
      birthDayDifferent = dateNow - dateBirth;
    } else {
      birthDayDifferent = dateNow - dateBirth.setFullYear(dateNow.getFullYear() - 1);
    }

    return birthDayDifferent;
  },

  /**
   * Находит в массиве объект который содержит url и возвращает индекс в массиве
   * @param {Array.<Object>} array
   * @param {string} url
   * @returns {Object}
   */
  searchInArray: function(array, url) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].url === url) {
        return i;
      }
    }
    return null;
  },

  /**
   * Наследует один тип от другого, продлевая цепочку прототипов с использованием пустого конструктора
   * @param {Type} Parent
   * @param {Type} Child
   */
  inherit: function(Child, Parent) {
    var EmptyConstructor = function() { };
    EmptyConstructor.prototype = Parent.prototype;
    Child.prototype = new EmptyConstructor();
    Child.prototype.constructor = Child;
  },

  /**
   * Создание DOM-разметки в element
   * @param {HTMLElement} element
   * @param {Object} data
   * @param {number} size
   */
  createDOM: function(element, data, size) {
    element.likesCount.textContent = data.likes;
    element.commentsCount.textContent = data.comments;
    var contentImage = element.contantImage;
    // Добавляем фото
    var uploadImage = new Image();
    var imageLoadTimeout = setTimeout(function() {
      contentImage.classList.add('picture-load-failure');
    }, this.LOAD_TIMEOUT);

    // Обработчик загрузки
    uploadImage.onload = function() {
      uploadImage.onerror = null;
      clearTimeout(imageLoadTimeout);
      if (contentImage.classList.contains('picture-load-failure')) {
        contentImage.classList.remove('picture-load-failure');
      }
      contentImage.width = size;
      contentImage.height = size;
      contentImage.src = data.url;
    };

    // Обработчик ошибки
    uploadImage.onerror = function() {
      uploadImage.onload = null;
      clearTimeout(imageLoadTimeout);
      contentImage.classList.add('picture-load-failure');
      contentImage.src = '';
    };

    uploadImage.src = data.url;
  },

  /**
   * Изменяет поле лайков в DOM списке и в галерее (обработчик события "increaseLikes")
   * @param {Event} event
   */
  updateLikesCount: function(event) {
    var likesContainerList = document.querySelector(event.detail.selectorList);
    var likesContainerGallery = document.querySelector(event.detail.selectorGallery);
    if (likesContainerList) {
      likesContainerList.textContent = event.detail.likesCount;
    }
    if (likesContainerGallery) {
      likesContainerGallery.textContent = event.detail.likesCount;
    }
  }
};
