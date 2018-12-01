/***
uglify: true
***/

$(document).ready(function() {

  var fallback = [{
    tags: ['andrewchumchal'],
    link: 'https://www.instagram.com/p/Boc_AT1BNmwO-r6qc7JqLkDAwBSXVmN9jLb9Uc0/',
    caption: {text: '"Everyday I need you."'},
    images: {low_resolution: {url: '/img/everydayineedyou.jpg'}}
  }, {
    tags: ['thecatpj'],
    link: 'https://www.instagram.com/p/BmD8lnZhfvCBHr5uuI-sdna0Yb5bcd01AE3BZo0/',
    caption: {text: 'Guest What?'},
    images: {low_resolution: {url: '/img/thecatpj.jpg'}}
  }];

  var render = _.template('<a href="<%= link %>" title="<%= caption.text %>" target="_blank"><img src="<%= images.low_resolution.url %>" class="img-thumbnail" alt="instagram"></a>');

// returns the chosen picture (instagram object)
  function renderWithFirst(pics, tag) {
    var pic = _.find(pics, function(pic) {
      return _.contains(pic.tags, tag);
    });
    // if we don't have a picture matching the request, then just use the first one
    if (!pic) {
      pic = pics.shift();
    }
    var i = $('<img/>');
    i.on('load', function() {
      $('div.' + tag).html(render(pic));
    });
    i.attr('src', pic.images.low_resolution.url);

    return pic;
  }

  function handleInstagrams(response) {
    var data;
    if (response && response.meta.code == 200) {
      data = response.data;
    } else {
      data = fallback;
    }

    var pic = renderWithFirst(data, 'andrewchumchal');
    var remainders = _.without(data, pic);
    renderWithFirst(remainders, 'thecatpj');
  }

  var callbackFnName = 'handleInstagrams';
  window[callbackFnName] = handleInstagrams;

// Andrew accessToken
  var accessToken = '274538233.1677ed0.016b819c877f4a3cb3e45ac2e835ab3e';
  var instagramApiUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + accessToken + '&callback=' + callbackFnName;

  $.getScript(instagramApiUrl);

  /*
   $(window).resize(function() {
   $('#headerHeight').text($('header').height());
   $('#pageWidth').text($(window).width());
   }).resize();
   */

});
