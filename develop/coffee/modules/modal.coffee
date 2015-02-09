window.Modal = (->
  $(document)
  .on 'click', '[modal_show]', ->
    Modal.show $($(this).attr('content')).html()
    false
  .on 'click', '[modal]', ->
    Modal.hide()
  .on 'click', '[modal_container]', (e) ->
    e.stopPropagation()
    false
  .on 'keyup', (e) ->
    if e.keyCode == 27 and $('[modal]').hasClass('show')
      Modal.hide()

  show: (html) ->
    $('[modal]')
    .find('[modal_content]')
    .html(html)
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
