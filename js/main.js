$(function() {
    // Handler for .ready() called
    var messages;

    // Get the messages array from the json file
    $.getJSON("data/data.json", function(messagesJson){
        messages = messagesJson;

        setTemplate(messages[getNextMessageIndex()].template);
    });
});

function getNextMessageIndex() {
    return 0;
}

function setTemplate(templateId) {
    $("#messagesContainer").load("./templates/" + templateId + ".html");
}