// On page load
$(function() {
        
    $('ul.tabs li').click(function(){
        var tab_id = $(this).attr('data-tab');

        $('ul.tabs li').removeClass('current');
        $('.tab-content').removeClass('current');

        $(this).addClass('current');
        $("#"+tab_id).addClass('current');
    });

    selector = document.getElementById('sample-selection');

    // Load text editor
    editor = ace.edit("filters-editor");
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/glsl");
    editor.$blockScrolling = Infinity;

    resetFilterer();
});


// Start-Stop toggle functionality
$('#start-stop-button').click(function(){
    $button = $(this);
    $button.toggleClass('paused');

    if ($button.is(".paused")) {
        $button.html("Start");
        filterer.paused = true;
        console.log("Render Paused");
    } else {
        $button.html("Pause");
        filterer.paused = false;
        filterer.lastTime = new Date().getTime() - 20;
        filterer.tick();
        console.log("Render Resumed");
    }
});


// Submit editor text
$('#submit-button').click(function(){
    var result = editor.getValue();

    // filterer.reset();
    filterer.setShader(result);
});


// attempt to compile shader when a change is made to the editor
// (if the realtime checkbox is checked)
editor.getSession().on('change', function () {

    if (filterer != null && document.getElementById('realtime-checkbox').checked) {
        var result = editor.getValue();
        filterer.setShader(result);
    }
});


// attempt to compile the editor text when the user initially clicks the realtime checkbox
$('#realtime-checkbox').change(function() {
    if(filterer != null && this.checked) {
        var result = editor.getValue();
        filterer.setShader(result);
    }
});


$('#sample-selection').on("change", loadShader);

function loadShader() {
    var sampleType = selector.options[selector.selectedIndex].value

    $.get("res/samples/user_glsl_" + sampleType, function(data) {
        editor.setValue(data);

        editor.focus();

        if (filterer != null) {
            filterer.setShader(data);
        }
    });
}


// Reset editor text
$('#reset-button').click(resetFilterer);

function resetFilterer() {

    if (filterer == null) {
        filterer = new Filterer("#filters-canvas");
        filterer.init();
        loadShader();

        filterer.tick();
    } else {
        filterer.reset();
        filterer.setShader(editor.getValue());
    }
}


// Editor Config

