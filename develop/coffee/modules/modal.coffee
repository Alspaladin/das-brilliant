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
    $('body').css("overflow","hidden")
    $('.modal_wrapper').mousewheel()
    $('.modal_content').focus()
    $('[modal]')
    .find('[modal_content]')
    .html(html)
    .end()
    .addClass('show').focus()
    $('body').addClass('body__modal')
  hide: ->
    
    $('[modal]').addClass('hidding')
    setTimeout ->
      $('body').removeClass('body__modal')
      $('[modal]').removeClass('show hidding')
      $('body').css("overflow","auto")
    , 1000  
)()
