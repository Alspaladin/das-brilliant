$(window).on 'load', ->
  $('.brands_container').masonry
    columnWidth: 250,
    gutter: 52 
    itemSelector: '.brands_item'
  