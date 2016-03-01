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
        $("<div class=brands_item brand=#{brand._id}><a class=brands_item_link href=/brands/#{brand._id }/categories><img src=/public/pic/#{brand.name}.png></a></div>")
        .appendTo($brands)
      $(document).on 'click', '[brand] > a', (e, data) ->
        brand = $(@).parent()
        getCategories(brand.attr('brand'))
          .done (categories) ->
            drawCategories(categories, brand)
            $(document).on 'click', brand, (e) ->
              if $('body').hasClass('body__modal')
                return true
              drawCategories(categories, brand)
              e.preventDefault()
              false
        e.preventDefault()
        false
      false
            
    .done (brands) ->
      $cont = $('.brands_container')
      $cont.imagesLoaded () ->
        $cont.masonry
          columnWidth: 250,
          gutter: 52 
          itemSelector: '.brands_item'
          
  getCategories = (brand_id) ->
    $.ajax
      type: 'get'
      url: settings.HOST + "/products/brand/#{brand_id}/categories"
    .done (data) ->

  drawCategories = (categories, brand) ->
    template = Handlebars.compile $('[template="categories"]').html()
    Modal.show(template(categories), brand, true)
    
  
  