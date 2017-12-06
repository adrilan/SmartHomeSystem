function showHideChat() {
    var chatbox = document.getElementById("chat");
    if (chatbox.style.bottom != "0px") {
        chatbox.style.bottom = "0px";
    } else {
        chatbox.style.bottom = "-265px"
    }
}
