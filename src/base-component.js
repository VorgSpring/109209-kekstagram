'use strict';

/**
 * Описывает базовую DOM-компоненту
 * @param {HTMLElement} element
 * @constructor
 */
var BaseComponent = function(element) {
  this.element = element;
  this.activeEvents = [];
};

BaseComponent.prototype = {

  /**
   * Добавляет element в container
   * @param {HTMLElement} container
   */
  create: function(container) {
    container.appendChild(this.element);
  },

  /**
   * Удаляет element из разметки
   */
  removeElement: function() {
    this.element.parentNode.removeChild(this.element);
  },

  /**
   * Добавляет обработчик события событие
   * @param {HTMLElement} element
   * @param {string} typeEvent
   * @param {function} eventFunction
   */
  addEvent: function(element, typeEvent, eventFunction) {
    element.addEventListener(typeEvent, eventFunction);
    var events = [element, typeEvent, eventFunction];
    this.activeEvents.push(events);
  },

  /**
   * Удаляет обработчики собитий
   */
  removeEvents: function() {
    this.activeEvents.forEach(function(item) {
      item[0].removeEventListener(item[1], item[2]);
    });
    this.activeEvents = [];
  },

  /**
   * Удаляет обработчики собитий и елемент
   */
  remove: function() {
    this.removeEvents();
    this.removeElement();
  }
};

module.exports = BaseComponent;
