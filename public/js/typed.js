$(function(){
    $(".typed").typed({
        strings: ["Smarter.", "Easier.", "More secure.", "Automatic."],
        // Optionally use an HTML element to grab strings from (must wrap each string in a <p>)
        stringsElement: null,
        // typing speed
        typeSpeed: 30,
        // time before typing starts
        startDelay: 300,
        // backspacing speed
        backSpeed: 20,
        // time before backspacing
        backDelay: 500,
        // loop
        loop: true,
        // false = infinite
        loopCount: false,
        // show cursor
        showCursor: false,
        // character for cursor
        cursorChar: "|"
    });
});