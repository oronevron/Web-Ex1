var messages;

// Gets JSON of all the messages and sends them to be processed
$(function() {

    // Get the messages array from the json file
    $.getJSON("data/data.json", function(messagesJson){
        messages = messagesJson;

        // Process messages and display them accordingly
        processMessages(messages);
    });
});

// Go in cycle over each message and display it if neeeded
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
            // If the message is in schedule
            if(isMessageInSchedule(message))
            {
                // Handle and display the message
                handleMessage(message).then(messageChain);
            }
            else
            {
                waitBeforeNextRound().then(messageChain);
            }
        }
    };

    messageChain();
}

// Checks if the message is scheduled and returns indicator wether it should be displayed
function isMessageInSchedule(message) {

    // Indication wether day is valid
    var isValidDay = false;

    // Get the current date (without time factor)
    var currentDate = new Date();

    // Get the current day
    var currentDay =  currentDate.getDay() + 1;

    // Get the current time
    var currentTime = getCurrentTime(currentDate);

    // Now that we dont need to extract time from the date, we reset it (irrelevant for comparisons)
    currentDate.setHours(0, 0, 0, 0);

    // Go through each schedule of the message
    for (var i in message.scheduling) {

        // Get the current schedule
        var schedule = message.scheduling[i];

        // Get the valid from and valid to dates
        var validFrom = new Date(schedule.validFrom);
        validFrom.setHours(0, 0, 0, 0);
        var validTo = new Date(schedule.validTo);
        validTo.setHours(0, 0, 0, 0);

        // If the current date is not between the validation dates, return false
        if((currentDate < validFrom) || (currentDate > validTo))
        {
            continue;
        }

        // Go through each schedule day
        for( var j in schedule.days) {

            // Get the schedule day
            var day = schedule.days[j];

            // If there is mismatch with the current day, continue searching
            if( day.number != "all" &&
                day.number != currentDay)
            {
                continue;
            }

            // If the times match, set indication and exit
            if( (currentTime >= day.start) && (currentTime <= day.end)){
                isValidDay = true;
                break;
            }
        }

        // If the day is valid, return true, else continue
        if(isValidDay)
        {
            return true;
        }
    }

    // If no schedule matches, return false
    return false;
}

// Get the current time
function getCurrentTime(date) {
    function addLeadingZeros(i) {
        return (i < 10) ? "0" + i : i;
    }

    var h = addLeadingZeros(date.getHours());
    var m = addLeadingZeros(date.getMinutes());
    var s = addLeadingZeros(date.getSeconds());

    return (h + ":" + m + ":" + s);
}

function waitBeforeNextRound() {
    var deferred = new $.Deferred();

    // Wait for a little bit in order to avoid callstack from reaching max size
    setTimeout(function () {
        deferred.resolve();
    }, 100);

    return deferred.promise();
}

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