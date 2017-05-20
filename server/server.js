(function () {
    "use strict";

    var express = require("express");
    var path = require("path");
    var fs = require("fs");
    var mongoClient = require('mongodb').MongoClient;

    var port = 8080;
    var mongoDbUrl = 'mongodb://localhost:27017/ex3db';
    var app = express();

    // Serving static files
    app.use(express.static(path.join(__dirname, '../')));

    // Checks if the message is scheduled and returns indicator whether it should be displayed
    function isMessageInSchedule(message, screenId) {

        // Indication wether day is valid
        var isValidDay = false;

        // Get the current date (without time factor)
        var currentDate = new Date();

        // Get the current day
        var currentDay =  currentDate.getDay() + 1;

        // Get the current time
        var currentTime = getCurrentTime(currentDate);

        // If the screen is not in the screens array of the message, return false
        if (message.screenIds.indexOf(screenId) == -1) {
            return false;
        }

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

    // Define handler for get request of specific screen
    app.get("/screen=:id", function (request, response) {

        // Get the screen id from the request and parse it to int
        var screenId = parseInt(request.params.id);

        // Connect to the relevant database in MongoDB
        mongoClient.connect(mongoDbUrl, function(err, db) {

            // If the connection succeeded
            if(!err) {

                // Get the messages collection in the database
                var collection = db.collection('messages');

                // Get the messages that relevant to the screen from the database
                collection.find({screenIds:+screenId}).toArray(function(err, results) {

                    // Set array that will contain the messages to send in the response to the client
                    var messagesToResponse = [];

                    // Loop over all fetched messages
                    for (var i in results) {
                        var message = results[i];

                        // If the message is scheduled and it should be displayed - Add it to the messages to response array
                        if (isMessageInSchedule(message, screenId)) {
                            messagesToResponse.push(message);
                        }
                    }

                    // Send the relevant messages in response to the client
                    response.json(messagesToResponse);

                    // Close the MongoDB connection
                    db.close();
                });
            }
            // If an error occurred while the connection
            else {
                console.log("ERROR CONNECTING TO MONGO DB");
            }
        });
    });

    app.listen(port);
    console.log("Server listening on port " + port);

})();