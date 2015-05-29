$ ->
  $brands = $('[brands]')

  if $brands.length

    $.ajax
      type: 'get'
      url: settings.HOST + '/products/brands/'
      # crossDomain: true
      # xhrFields:
      #   withCredentials: true
    .done (brands) ->
      brands.forEach (brand) ->
        brand.name = brand.name.toString().toLowerCase()
        $("<a class=brands_item href=/brands/#{brand._id }><img src=/public/pic/#{brand.name}.png></a>")
        .appendTo($brands)
    .done (brands) ->
      $cont = $('.brands_container')
      $cont.imagesLoaded () ->
        $cont.masonry
          columnWidth: 250,
          gutter: 52 
          itemSelector: '.brands_item'

    
  
  