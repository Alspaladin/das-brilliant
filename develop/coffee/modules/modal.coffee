window.Modal = (->
  $(document)
  .on 'click', '[modal_show]', ->
    Modal.show $ $(this).attr('content')
    false
  .on 'click', '[modal]', ->
    Modal.hide()
  .on 'click', '[modal_container]', (e) ->
    e.stopPropagation()
    false
  .on 'keyup', (e) ->
    if e.keyCode == 27 and $('[modal]').hasClass('show')
      Modal.hide()

  show: ($content) ->
    $('[modal]')
    .find('[modal_content]')
    .append($content)
    .end()
    .addClass('show')
    $('body').addClass('body__modal')
  hide: ->
    $('[modal]').addClass('hidding')
    setTimeout ->
      $('body').removeClass('body__modal')
      $('[modal]').removeClass('show hidding')
    , 1000  
)()
