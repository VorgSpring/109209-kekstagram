/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

// Подключаем библиотеку browser-cookies
var browserCookies = require('browser-cookies');
// Подключаем модули валидации
var resizeFormIsValid = require('./validation/resizeFormIsValid');
var showError = require('./validation/showError');

(function() {
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
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

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

  // Установка минимальных значений для полей формы
  fieldOnLeft.min = 0;
  fieldFromTop.min = 0;
  fieldSide.min = 1;


  /**
   * Создаем новый элемент для вывода сообщений об ошибках
   */
  var errorMessage = document.createElement('div');
  errorMessage.classList.add('upload-form-error');
  resizeForm.appendChild(errorMessage);



  /**
   * Обработчик изменения формы
   */
  resizeForm.addEventListener('input', function(evt) {
    evt.preventDefault();
    currentResizer.setConstraint(parseInt(fieldOnLeft.value, 10), parseInt(fieldFromTop.value, 10), parseInt(fieldSide.value, 10));

    if (resizeFormIsValid(currentResizer, fieldOnLeft, fieldFromTop, fieldSide)) {
      forwardButton.style.opacity = 1;
      forwardButton.disabled = false;
    } else {
      forwardButton.style.opacity = 0.3;
      forwardButton.disabled = true;
    }

    showError(errorMessage, fieldOnLeft, fieldFromTop, fieldSide);
  });

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
   * Значения последнего выбранного фильтра
   * @type {string}
   */
  var lastFilter;

  /**
   * Название cookie
   * @type {string}
   */
  var cookieNameFilter = 'filter';

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string} message
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
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);

      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid(currentResizer, fieldOnLeft, fieldFromTop, fieldSide)) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');

      var filterName = browserCookies.get(cookieNameFilter) || 'none';
      filterImage.className = 'filter-image-preview filter-' + filterName;
      var filterDefault = document.querySelector('#upload-filter-' + filterName);
      filterDefault.setAttribute('checked', true);
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Получить веремя жизни cookie
   * @return {Date}
   */
  var getBirthDayDifferent = require('./utilities').getBirthDayDifferent;

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
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
    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];

    // Устанавливаем значения последнего выбранного фильтра
    lastFilter = document.querySelector('.upload-filter-controls input:checked').value;

    // Записываем в cookie
    browserCookies.set(cookieNameFilter, lastFilter, { expires: Date.now() + getBirthDayDifferent() });
  });

  /**
   * Обработчик изменения размера
   */
  window.addEventListener('resizerchange', function() {
    var offsetAndSideOfFrame = currentResizer.getConstraint();
    fieldOnLeft.value = Math.floor(offsetAndSideOfFrame.x);
    fieldFromTop.value = Math.floor(offsetAndSideOfFrame.y);
    fieldSide.value = Math.floor(offsetAndSideOfFrame.side);
  });

  cleanupResizer();
  updateBackground();
})();
