(function () {

  "use strict";

  var toggle = true;
  var _id = 1;

  function setTemplate(templateId) {

    var deferred = new $.Deferred();

    $.get('/templates/' + templateId + '.html')
      .then(
      function (data) {
        var element = $("#notifications-container");
        element.fadeOut(function () {
          element.html(data);
          deferred.resolve();
        });
      },
      function () {
        deferred.reject();
      }
    );

    return deferred.promise();
  }

  function showItem(item) {

    console.log('showing', item.name);

    setTemplate(item.template)
      .then(function () {

        var content = $("#content");

        for (var i in item.content) {
          var contentMessage = item.content[i];

          var p = $('<p />');
          p.html(contentMessage);

          content.append(p);
        }

        var images = $("#images");

        var counter = new Date().getMilliseconds();

        for (var i in item.images) {
          var image = item.images[i];

          var img = $('<img />');
          img.attr('src', image + '?' + counter++);

          images.append(img);
        }

        $("#notifications-container").fadeIn();

      });
  }

  function hideItem(item) {
    console.log('hiding', item.name);
    $("#notifications-container").fadeOut();
  }

  function processItem(item) {
    var deferred = new $.Deferred();

    showItem(item);

    setTimeout(function () {

      console.log('timeout', item.duration * 1000);

      hideItem(item);
      deferred.resolve();
    }, item.duration * 1000);

    return deferred.promise();
  }

  function processItems(items) {

    var lastIndex = -1;
    var getNextItem = function () {
      if (!items.length) {
        return;
      }

      lastIndex++;

      if (lastIndex >= items.length)
      {
          lastIndex=0;
      }

      return items[lastIndex];
    };

    var itemChain = function () {
      var item = getNextItem();
      if (item) {
        processItem(item).then(itemChain);
      }
    };

    itemChain();
  }

  $(function () {

    console.log('hiding');

    $.get('/api/messages/' + _id)
      .then(processItems, function (err) {
        console.error('error', err);
      });
  });

})();
