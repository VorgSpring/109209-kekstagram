'use strict';

/**
  * Проверяет, возможно ли перевести value в число.
  * @return {boolean}
  */
function isNumeric(value) {
  return !isNaN(parseInt(value, 10)) && isFinite(value);
}

function resizeFormIsValid(currentResizer, fieldOnLeft, fieldFromTop, fieldSide) {

  // Обнуляем ошибки всех полей
  fieldOnLeft.setCustomValidity('');
  fieldFromTop.setCustomValidity('');
  fieldSide.setCustomValidity('');

  // Счетчик ошибок
  var counterError = 0;

  // Получаем данные с формы
  // Проверяем  возможно ли перевести полученные данные в число,
  // если возможно переводим в число
  if (isNumeric(fieldOnLeft.value)) {
    var positionOnLeft = parseInt(fieldOnLeft.value, 10);
  } else {
    fieldOnLeft.setCustomValidity('В поле «слева» необходимо ввести целое число.');
    counterError++;
  }
  if (isNumeric(fieldFromTop.value)) {
    var positionFromTop = parseInt(fieldFromTop.value, 10);
  } else {
    fieldFromTop.setCustomValidity('В поле «сверху» необходимо ввести целое число.');
    counterError++;
  }
  if (isNumeric(fieldSide.value)) {
    var sizeSide = parseInt(fieldSide.value, 10);
  } else {
    fieldSide.setCustomValidity('В поле «сторона» необходимо ввести целое число.');
    counterError++;
  }

  // Поля не могут быть отрицательными.
  if (positionOnLeft < 0) {
    fieldOnLeft.setCustomValidity('Поле «слева» не может быть отрицательным.');
    counterError++;
  }

  if (positionFromTop < 0) {
    fieldFromTop.setCustomValidity('Поле «сверху» не может быть отрицательным.');
    counterError++;
  }

  if (sizeSide < 1) {
    fieldSide.setCustomValidity('Поле «сторона» не может быть меньше "1".');
    counterError++;
  }

  // Установка максимальных значений
  // Максимальное значение для поля «сторона» это меньшая сторона фотографии
  fieldSide.max = Math.min(currentResizer._image.naturalWidth, currentResizer._image.naturalHeight);

  // Установка максимальных значений для полей «сверху» и «слева»
  fieldOnLeft.max = currentResizer._image.naturalWidth - sizeSide;
  fieldFromTop.max = currentResizer._image.naturalHeight - sizeSide;


  // Проверка допустимых значений
  if (positionOnLeft > fieldOnLeft.max) {
    fieldOnLeft.setCustomValidity('Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.');
    counterError++;
  }

  if (positionFromTop > fieldFromTop.max) {
    fieldFromTop.setCustomValidity('Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.');
    counterError++;
  }

  if (sizeSide > fieldSide.max) {
    fieldSide.setCustomValidity('Значение в поле «сторона» превышает допустимое значение.');
    counterError++;
  }

  // Если есть ошибки возвращяем false
  if (counterError > 0) {
    return false;
  } else {
    return true;
  }
}

module.exports = resizeFormIsValid;
