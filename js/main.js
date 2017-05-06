var messages;

$(function() {

    // The id of the screen we want to show its messages
    var screenId = 3;

    // Gets JSON of all the relevant messages from the server and sends them to be processed and displayed
    $.get('http://localhost:8080/?screen=' + screenId)
        .then(processMessages, function (error) {
            console.error('Error occured: ', error);
        });
});

// Go in cycle over each message and display it
function processMessages(messages) {

    var lastIndex = -1;

    var getNextMessage = function () {
        if (!messages.length) {
            return;
        }

        lastIndex++;

        if (lastIndex >= messages.length)
        {
            lastIndex=0;
        }

        return messages[lastIndex];
    };

    var messageChain = function () {
        // Get the next message to handle
        var message = getNextMessage();

        // If found message
        if (message)
        {
            // Handle and display the message
            handleMessage(message).then(messageChain);
        }
    };

    messageChain();
}

// function waitBeforeNextRound() {
//     var deferred = new $.Deferred();
//
//     // Wait for a little bit in order to avoid callstack from reaching max size
//     setTimeout(function () {
//         deferred.resolve();
//     }, 100);
//
//     return deferred.promise();
// }

function handleMessage(message) {
    var deferred = new $.Deferred();

    // Display the message
    displayMessage(message).then(function() {

        // After message has been displayed, hide it after the message's duration
        setTimeout(function () {

            console.log('timeout', message.duration * 1000);
            $("#messagesContainer").fadeOut();
            deferred.resolve();
        }, message.duration * 1000);

    });

    return deferred.promise();
}

function displayMessage(message) {

    var dfd = new $.Deferred();

    $("#messagesContainer").load("./templates/" + message.template + ".html", function() {

        // Display new data after half a second
        var millisecondsToWait = 500;
        setTimeout(function() {

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

            $("#messagesContainer").fadeIn();

            dfd.resolve();

        }, millisecondsToWait);
    });

    return dfd.promise();
};