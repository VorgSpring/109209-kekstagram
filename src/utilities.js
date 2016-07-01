'use strict';

module.exports = {
  /**
   * Скрывает блок
   * @param {HTMLElement} block
   */
  hideBlock: function (block) {
    block.classList.add('hidden');
  },

  /**
   * Отображает блок
   * @param {HTMLElement} block
   */
  showBlock: function (block) {
    block.classList.remove('hidden');
  },

  /**
   * Выводит значение message в скобках в теге <sup/> на элементе item
   * @param {HTMLElement} item
   * @param {string} message
   */
  addMessage: function (item, message) {
    var messageContainer = document.createElement('sup');
    item.appendChild(messageContainer);
    messageContainer.innerHTML = ' (' + message + ')';
  },

  /**
   * Блокирует в интерфейсе label
   * @param {HTMLElement} label
   * @param {string} disabledButtonClass
   */
  setRadioButtonDisabled: function (label, disabledButtonClass) {
    label.setAttribute('for', '');
    label.classList.add(disabledButtonClass);
  },

  /**
   * Оптимизирует callback, чтобы функция вызывалась не чаще, чем раз в time интервал времени
   * @param {function} callback
   * @param {number} time
   * @return {function}
   */
  throttle: function (callback, time) {
    var state = null;
    var COOLDOWN = 1;

    return function () {
      if (state) {
        return;
      }
      callback.apply(this, arguments);
      state = COOLDOWN;
      setTimeout(function () {
        state = null;
      }, time);
    };
  },

  /**
   * Проверяет достигнут ли конец блока
   * @param {HTMLElement} container
   * @return {boolean}
   */
  isBottomReached: function (container) {
    // Задел до конца блока
    var GAP = 50;
    var containerPosition = container.getBoundingClientRect();
    return containerPosition.bottom - (window.innerHeight + GAP) <= 0;
  },

  /**
   * Проверяет возможно ли перейти на следующую страницу
   * @param {Array} images
   * @param {number} page
   * @param {number} pageSize
   * @return {boolean}
   */
  isNextPageAvailable: function (images, page, pageSize) {
    return page < Math.ceil(images.length / pageSize);
  }
}
