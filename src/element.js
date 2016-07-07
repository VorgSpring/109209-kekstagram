'use strict';

var Element = function(data) {
  this.likes = data.likes;
  this.comments = data.comments;
  this.url = data.url;
  this.date = data.date;
};

Element.prototype.setLikesCount = function() {
  this.likes++;
};

module.exports = Element;
