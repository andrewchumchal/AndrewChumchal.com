/***
uglify: true
***/

$(function() {
  var eml = 'andrew' + '@' + 'andrewchumchal.com';
  $('.email').attr('href', 'mailto:' + eml);
  $('.email-text').text(eml);
});
