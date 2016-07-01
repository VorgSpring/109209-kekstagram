'use strict';
/**
 * Допустимое время загрузки
 * @constant {number}
 */
var LOAD_TIMEOUT = 10000;

/**
 * Действие при неудачной загрузке списка
 * @param {HTMLElement} container
 */
var toFailedLoadXHR = function (container) {
  container.classList.remove('pictures-loading');
  container.classList.add('pictures-failure');
}

/**
 * Получает список по XMLHttpRequest
 * @param {HTMLElement} container
 * @param {string} url
 * @param {function(Array.<Object>)} callback
 */
var load = function (container, url, callback) {
  container.classList.add('pictures-loading');
  var xhr = new XMLHttpRequest();
  var xhrLoadTimeout = setTimeout(function () {
    toFailedLoadXHR(container);
  }, LOAD_TIMEOUT);

  /**
   * Обработчик загрузки
   * @param {ProgressEvent}
   */
  xhr.onload = function (evt) {
    xhr.onerror = null;
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
  };

  // Обработчик пост загрузки
  xhr.onloadend = function () {
    clearTimeout(xhrLoadTimeout);
    container.classList.remove('pictures-loading');
  };

  // Обработчик ошибки
  xhr.onerror = function () {
    xhr.onload = null;
    toFailedLoadXHR(container);
  };

  xhr.open('GET', url);
  xhr.send();
};

module.exports = load;
