var messages;

$(function() {

    // Get the messages array from the json file
    $.getJSON("data/data.json", function(messagesJson){
        messages = messagesJson;

        displayNextPage(messages[getNextMessageIndex()]);
    });
});

function getNextMessageIndex() {
    return 0;
}

function displayNextPage(message) {

    $("#messagesContainer").load("./templates/" + message.template + ".html", function() {

        var content = $("#content");

        for (var i in message.content) {
            var contentMessage = message.content[i];

            var p = $('<p />');
            p.html(contentMessage);

            content.append(p);
        }

        var images = $("#images");

        var counter = new Date().getMilliseconds();

        for (var i in message.images) {
            var image = message.images[i];

            var img = $('<img />');
            img.attr('src', image + '?' + counter++);

            images.append(img);
        }
    });
};