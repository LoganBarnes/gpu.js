var editors = [];

// On page load
$(function() {

    selector = document.getElementById('sample-selection');

    currSampleType = "none";

    // Load first editor (since there is always at least one)
    createEditor(0); // index 0

    $('ul.tabs').on("click", ".tab-link", clickFunction);

    resetSimulation();
});


function clickFunction() {
    var tab_id = $(this).attr('data-tab');

    $('ul.tabs li').removeClass('current');
    $('.tab-content').removeClass('current');

    $(this).addClass('current');
    $("#"+tab_id).addClass('current');

    for (var i = 0; i < editors.length; ++i) {
        editors[i].resize();
    }
}


function createEditor(index) {
    editors[index] = ace.edit("surface-editor-pass" + (index + 1));
    editors[index].setTheme("ace/theme/twilight");
    editors[index].session.setMode("ace/mode/glsl");
    editors[index].$blockScrolling = Infinity;

    editors[index].getSession().on('change', function () {
        if (surfaceClass != null && document.getElementById('realtime-checkbox').checked) {
            var result = editors[index].getValue();
            var annotations = surfaceClass.setShader(result, index);
            editors[index].getSession().setAnnotations(annotations);
        }
    });
}


function setNumEditors(length) {
    var len = editors.length;
    var size = length - len;

    if (size < 0) {
        editors = editors.splice(0, length);
        
        for (var i = length + 1; i <= len; ++i) {
            $('#tab-' + i).remove();
            $('#tab-div' + i).remove();
        }

        return;
    }

    var id;
    for (var i = 0; i < size; ++i) {
        id = len + i + 1;

        var html = "<div id='tab-div" + id;
        html += "' class='tab-content'>";
        html += "<pre id='surface-editor-pass" + id;
        html += "' class='editor'></pre></div>";

        $('#tab-div').append(html);

        html = "<li id='tab-" + id + "' class='tab-link tabs' data-tab='tab-div" + id;
        html += "'>Pass " + id + "</li>";

        $('#tab-add').before(html);

        createEditor(id - 1);
    }
}


// Start-Stop toggle functionality
$('#start-stop-button').click(function(){
    $button = $(this);
    $button.toggleClass('paused');

    if ($button.is(".paused")) {
        $button.html("Start");
        surfaceClass.paused = true;
        console.log("Render Paused");
    } else {
        $button.html("Pause");
        surfaceClass.paused = false;
        surfaceClass.lastTime = new Date().getTime() - 20;
        surfaceClass.tick();
        console.log("Render Resumed");
    }
});

// attempt to compile shader
function updateShader(i) {
    var result = editors[i].getValue();
    var annotations = surfaceClass.setShader(result, i);
    editors[i].getSession().setAnnotations(annotations);
}

// attempt to compile shader when a change is made to the editor
function realtimeUpdateShader(i) {
    if (document.getElementById('realtime-checkbox').checked) {
        updateShader(i);
    }
}

// attempt to compile shaders
function updateShaders() {
    if (surfaceClass != null) {
        for (var i = 0; i < editors.length; ++i) { 
            updateShader(i);
        }
    }
}

// attempt to compile shaders when a change is made to the editor
function realtimeUpdateShaders() {
    if (surfaceClass != null) {
        for (var i = 0; i < editors.length; ++i) { 
            realtimeUpdateShader(i);
        }
    }
}

// Submit editor text
$('#submit-button').click(updateShaders);

// attempt to compile the editor text when the user initially clicks the realtime checkbox
$('#realtime-checkbox').change(realtimeUpdateShaders);

// TODO: maybe pause while everything loads
$('#sample-selection').on("change", loadShaders);

function setEditor(sampleType, passNum) {
    $.get("res/samples/user_glsl_" + sampleType + "_" + passNum, function(data) {
        editors[passNum].setValue(data);
        editors[passNum].focus();
    });
}


function loadShaders() {
    var sampleType = selector.options[selector.selectedIndex].value;

    setEditor(sampleType, 0); // pass 0

    $('ul.tabs li').removeClass('current');
    $('.tab-content').removeClass('current');

    $("#tab-1").addClass('current');
    $("#tab-div1").addClass('current');

    currSampleType = sampleType;
}


// Reset editor text
$('#reset-button').click(resetSimulation);

function resetSimulation() {

    if (surfaceClass == null) {
        var userRenderer = "res/shaders/render.frag";
        surfaceClass = new SurfaceClass("#surface-canvas");
        surfaceClass.init(userRenderer);

        loadShaders();

        if (surfaceClass.paused)
            surfaceClass.render();
        else
            surfaceClass.tick();
    } else {

        surfaceClass.reset();

        updateShaders();
        
        if (surfaceClass.paused)
            surfaceClass.render();
    }
}


// Editor Config

