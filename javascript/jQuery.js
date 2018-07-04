// $(selector).action()
// selector is css and XPath style
// $(this).hide()       : Hide current html element
// $('#test').hide()    : Hide id="test" element
// $('p).hide()         : Hide all <p> elements
// $('.test').hide()    : Hide all class="test" elements
// $('p.intro')         : select all <p class='intro'> elements
// $('p#demo')          : select all <p id='demo'> elements
// $('[href'])          : select all elements with href attributes
// $("[href='#']")      : select all elements whose href equal to '#'
// $("[href!='#']")     : select all elements whose href not equal to '#'
// $("[href$='.jpg']")  : select all elements whose href ends with .jpg
// $("ul li:first")     : select first <li> in <ul>
// $("div#intro .head") : select all elements which is div and has attribute intro and class='head'

// Naming conflict
// Use var jq=jQuery.noConflict(); jq is the new name

$(document).ready(function() {
    // Run jQuery functions
    // Hide or show
    $("button#hide_show").click(function() {
        $("span#hide_show").toggle(); // Can also use hide() or show() 
    });
    $("button#hide_show_speed").click(function() {
        $("span#hide_show_speed").toggle('slow', function() {
            console.debug("Done");
        });
    });
    // Fade in or out
    $("button#fade_in_out").click(function() {
        $("span#fade_in_out").fadeToggle(); // fadeIn() fadeOut() 
        // $(selector).fadeTo(speed,opacity,callback); 
    });
    // Slide down or up
    $("button#slide_down_up").click(function() {
        $("span#slide_down_up").slideToggle(3000); // slideDown() slideUp()
    });
    // Animation: $(selector).animate({params},speed,callback);
    $("button#animation").click(function(){
        var span=$("span#animation");
        span.animate({height:'300px',opacity:'0.4'},"slow");
        span.animate({width:'300px',opacity:'0.8'},"slow") // Chaining
            .animate({height:'100px',opacity:'0.4'},"slow")
            .animate({width:'100px',opacity:'0.8'},"slow");
    });

    // Get content: text() html() val()
    // Set content: text(v) html(v) val(v)
    // Get attribute: attr(att)
    // Set attribute: attr(att, v)
    //                attr(att, function(i, orgValue) {
    //                      return newValue; })

    // Add content: append() prepend() after() before()
    // Delete content: remove() empty()

    // addClass() removeClass() toggleClass() css()
});



































































