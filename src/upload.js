/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function () {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, возможно ли перевести value в число.
   * @return {boolean}
   */
  function isNumeric(value) {
    return !isNaN(parseInt(value)) && isFinite(value);
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    fieldSide.setCustomValidity('');
    // Получаем данные с формы
    // Проверяем  возможно ли перевести полученные данные в число, 
    // если возможно переводим в число
    if (isNumeric(fieldOnLeft.value) && isNumeric(fieldFromTop.value) && isNumeric(fieldSide.value)) {
      var positionOnLeft = parseInt(fieldOnLeft.value);
      var positionFromTop = parseInt(fieldFromTop.value);
      var sizeSide = parseInt(fieldSide.value);

      // Поля «сверху» и «слева» не могут быть отрицательными.
      if (positionOnLeft < 0 || positionFromTop < 0) {
        fieldSide.setCustomValidity('Поля «сверху» и «слева» не могут быть отрицательными.');
        return false;
      }

    } else {
      fieldSide.setCustomValidity('В поле необходимо ввести целое число.');
      return false;
    }

    // Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.
    var amountFieldsLeftAndSide = positionOnLeft + sizeSide;
    if (amountFieldsLeftAndSide > currentResizer._image.naturalWidth) {
      fieldSide.setCustomValidity('Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.');
      return false;
    }

    // Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.
    var amountFieldsTopAndSide = positionFromTop + sizeSide;
    if (amountFieldsTopAndSide > currentResizer._image.naturalHeight) {
      fieldSide.setCustomValidity('Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.');
      return false;
    }
    return true;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  ///**
  // * Установка максимальных значений для полей «сверху» и «слева»
  // * @param {HTMLFormElement} left
  // * @param {HTMLFormElement} top
  // * @param {number} side
  // */
  //var setFieldsConstraint = function (left, top, side) {
  //  var maxLeft = currentResizer._image.naturalWidth - side;
  //  if (maxLeft < left.value) {
  //    left.setCustomValidity('Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.');
  //  } else {
  //    left.setCustomValidity('');
  //  }
  //  left.max = maxLeft;
  //  var maxTop = currentResizer._image.naturalHeight - side;
  //  if (maxTop < top.value) {
  //    top.setCustomValidity('Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.');
  //  } else {
  //    top.setCustomValidity('');
  //  }
  //  top.max = maxTop;
  //}

  ///**
  // * Обработчик изменения значения поля «сторона»
  // */ 
  //fieldSide.oninput = function () {
  //  fieldSide.setCustomValidity('');
  //  if (isNumeric(fieldSide.value) && fieldSide.value <= fieldSide.max) {
  //    setFieldsConstraint(fieldOnLeft, fieldFromTop, fieldSide.value);
  //  } else if (fieldSide.value > fieldSide.max) {
  //    fieldSide.setCustomValidity('Значение в поле «сторона» превышает ширину изображения.');
  //  } else {
  //    fieldSide.setCustomValidity('В поле «сторона» необходимо ввести целое число.');
  //  }
  //}

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Поля ввода данных.
   * @type {HTMLFormElement}
   */
  var fieldOnLeft = document.querySelector('#resize-x');
  var fieldFromTop = document.querySelector('#resize-y');
  var fieldSide = document.querySelector('#resize-size');
  var forwardButton = document.querySelector('#resize-fwd');

  /**
   * Создаем новый элемент для вывода сообщений об ошибках
   */
  var errorMessage = document.createElement('div');
  errorMessage.classList.add('upload-form-error');
  resizeForm.appendChild(errorMessage);

  /**
   * Обработчик изменения формы
   */
  resizeForm.oninput = function (evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      forwardButton.style.opacity = 1;
      forwardButton.disabled = false;
    } else {
      forwardButton.style.opacity = 0.3;
      forwardButton.disabled = true;
    }
    errorMessage.innerHTML = fieldSide.validationMessage;
  }

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.onchange = function (evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function () {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();

          //// Установка минимальных значений для полей формы
          //fieldOnLeft.min = 0;
          //fieldFromTop.min = 0;
          //fieldSide.min = 0;

          //// Максимальное значение для поля «сторона» это меньшая сторона фотографии
          //if (currentResizer._image.naturalWidth < currentResizer._image.naturalHeight) {
          //  fieldSide.max = currentResizer._image.naturalWidth;
          //} else {
          //  fieldSide.max = currentResizer._image.naturalHeight;
          //}
        };

        fileReader.readAsDataURL(element.files[0]);

      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  };

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.onreset = function (evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.onsubmit = function (evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.onreset = function (evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.onsubmit = function (evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.onchange = function () {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function (item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  };

  cleanupResizer();
  updateBackground();
})();
