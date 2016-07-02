'use strict';
/**
 * Выводит сообщения об ошибках
 * @param {HTMLFormElement} leftField
 * @param {HTMLFormElement} topField
 * @param {HTMLFormElement} sideField
 */
function showError(container, leftField, topField, sideField) {
  container.innerHTML = leftField.validationMessage + '<br>' + topField.validationMessage + '<br>' + sideField.validationMessage;
}

module.exports = showError;
