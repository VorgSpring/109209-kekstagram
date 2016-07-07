'use strict';

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
   * @param {Object} data
   * @param {number} size
   */
  createDOM: function(element, data, size) {
    element.likesCount.textContent = data.likes;
    element.commentsCount.textContent = data.comments;
    var contantImage = element.contantImage;
    // Добавляем фото
    var uploadImage = new Image();
    var imageLoadTimeout = setTimeout(function() {
      contantImage.classList.add('picture-load-failure');
    }, this.LOAD_TIMEOUT);

    // Обработчик загрузки
    uploadImage.onload = function() {
      uploadImage.onerror = null;
      clearTimeout(imageLoadTimeout);
      if (contantImage.classList.contains('picture-load-failure')) {
        contantImage.classList.remove('picture-load-failure');
      }
      contantImage.width = size;
      contantImage.height = size;
      contantImage.src = data.url;
    };

    // Обработчик ошибки
    uploadImage.onerror = function() {
      uploadImage.onload = null;
      clearTimeout(imageLoadTimeout);
      contantImage.classList.add('picture-load-failure');
      contantImage.src = '';
    };

    uploadImage.src = data.url;
  }
};
