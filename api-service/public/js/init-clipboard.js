
// init tooltips
$('.btn-clipboard').tooltip({
    trigger: 'click',
    placement: 'bottom'
});


/**
 * Functions
 */
function showTooltip(btn, message) {
    $(btn).tooltip('hide')
        .attr('data-original-title', message)
        .tooltip('show');
}

function hideTooltip(btn) {
    setTimeout(function() {
        $(btn).tooltip('hide');
    }, 1000);
}

function sumCopy(giphyId) {
    console.log('Sumando a '+giphyId);
    $.ajax( {
        url:'/admin/giphies/sum',
        method:'POST',
        data: {
           id: giphyId
        },
        success: function( bolUpdated ) { 
            if( bolUpdated ) { 
                console.log('Sum ('+giphyId+') OK');
            }   
        }, 
        fail: function() {
            console.log('Sum ('+giphyId+') ERROR');
        }   
    }); 
}

/**
 * Init Clipboard library
 */
var clipboard = new ClipboardJS('.btn-clipboard');
clipboard.on('success', function(e) {
    // console.info('Action:', e.action);
    // console.info('Text:', e.text);
    // console.info('Trigger:', e.trigger);
    var title = $(e.trigger).data('title');
    showTooltip(e.trigger, title +' copied!');
    hideTooltip(e.trigger);

    var giphyId = $(e.trigger).data('id');
    sumCopy()
    e.clearSelection();
});
clipboard.on('error', function(e) {
    // console.error('Action:', e.action);
    // console.error('Trigger:', e.trigger);
    showTooltip(e.trigger, fallbackMessage(e.action));
    hideTooltip(e.trigger);
});


