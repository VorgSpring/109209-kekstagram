'use strict';
var Element = require('./element.js');

/**
 * Четыре дня в миллисекундах
 * @constant {number}
 */
var FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;

/**
 * Возвращает список изображений, сделанных за последние четыре дня
 * @param {Array.<Object>} list
 * @return {Array.<Object>} listInFourDays
 */
var getListInFourDays = function(list) {
  var now = new Date();
  var listInFourDays = list.filter(function(item) {
    var interval = now - Date.parse(item.date);
    return interval <= FOUR_DAYS;
  });

  return listInFourDays;
};

/**
 * Сортирует список по существующим фильтрам и заносит их в объект filteredList
 * @param {Array.<Object>} list
 * @return {Array.<Object>} filteredList
 */
var getFilteredList = function(list) {
  //Хранит отфильтрованные списки изображений
  var filteredList = {
    'popular': [],
    'new': [],
    'discussed': []
  };

  var listToFilter = [];
  list.slice(0).forEach(function(item) {
    listToFilter.push(new Element(item));
  });

  filteredList.popular = listToFilter.slice();

  filteredList.new = getListInFourDays(listToFilter).sort(function(a, b) {
    return Date.parse(b.date) - Date.parse(a.date);
  });

  filteredList.discussed = listToFilter.sort(function(a, b) {
    return b.comments - a.comments;
  });

  return filteredList;
};

module.exports = getFilteredList;
