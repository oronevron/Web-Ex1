$(function() {
    // Handler for .ready() called
    var messages;

    // Get the messages array from the json file
    $.getJSON("data/data.json", function(messagesJson){
        messages = messagesJson;
    });
});