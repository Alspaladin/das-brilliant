window.Modal = (->
  $(document)
  .on 'click', '[modal_show]', ->
    Modal.show $($(this).attr('content')).html()
    false
  .on 'click', '[modal]', ->
    Modal.hide()
  .on 'click', '[modal_container]', (e) ->
    if $(e.target).hasClass('link_to_contacts')
      return true
      
    if $('[modal_content]').children().hasClass('links') || $('[modal_content]').children().hasClass('map')
      return true
    else
      e.stopPropagation()
      false
  .on 'keyup', (e) ->
    if e.keyCode == 27 and $('[modal]').hasClass('show')
      Modal.hide()

  show: (html, parent, force_append) ->
    wrapper = $('.modal_wrapper');
    if parent
      wrapper.appendTo(parent)
      if force_append
        wrapper.addClass('hasLinks')
      else
        wrapper.addClass('hasMap')
    else
      $('body').css("overflow","hidden")
    $('.modal_wrapper').mousewheel()
    $('.modal_content').focus()
    $('[modal]')
    .find('[modal_content]')
    .html(html)
    $('[modal]')
    .addClass('showing')
    $('body').addClass('body__modal');
    setTimeout( ->
      $('[modal]')
      .addClass('show')
    , 20)
    setTimeout( ->
      $('[modal]')
      .removeClass('showing')
    , 1000)
  hide: ->
    
    $('[modal]').addClass('hidding')
    setTimeout ->
      $('body').removeClass('body__modal')
      $('[modal]').removeClass('show hidding');
      $('body').css("overflow","auto")
    , 1000
    location.hash = ''; 
)()
