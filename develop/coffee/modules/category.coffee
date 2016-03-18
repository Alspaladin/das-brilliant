$ ->
  $brand = $('[brand]')
  $category = $('[category]')
  params = 
    limit: 20,
    skip: 0

  drawListItem = (product) ->
    $("""
      <div class="brand_item" product="#{product._id}">
        <img src="http://dasbrilliant.com/products/image/#{product._id}"/>
        <div style="padding-bottom:10px;text-align:center;" class="brand_item_caption">#{product.name}</div>
        <div style="padding-bottom:10px;text-align:center;" class="brand_item_caption">#{product.category}</div>
        <div style="font-size:24px;text-align:center;" class="brand_item_price">#{product.price} Р</div>
          <div style="color:#B8B8B8;font-size:16px;text-align:center;">под заказ</div>
      </div>
    """).appendTo($category);


  drawProduct = (product) ->
    template = Handlebars.compile $('[template="product"]').html()
    Modal.show template product
    location.hash = product._id


  getProducts = ->
    $.ajax
      type: 'get'
      url: settings.HOST + "/products/brand/#{$brand.attr('brand')}/category/#{$category.attr('category')}"
      data: params
    .done (data) ->
      $(".breadcrumbs_item_brend_link").text(data.products[0]['brand'])
      $(".breadcrumbs_item_brend_link").attr('href', '/brands/' + $brand.attr('brand'))
      $(".breadcrumbs_item_category").text(data.products[0]['category'])
      $('.brand_actions').removeClass('hidden') if data.products.length > params.limit
      data.products.forEach (product) ->
        drawListItem(product)
      if(data.products.length < params.limit)
        $('[role="category.load-more"]').css("display","none")

  getProduct = (id) ->
    $.ajax
      type: 'get'
      url: settings.HOST + "/products/#{id}"
    .done (data) ->

  $(document).on 'click', '[role="category.load-more"]', ->
    if $category.length < 1
      return false
    $(@)
    .text 'Загрузка'
    .attr 'disabled', 'disabled'
    params.skip += 20
    getProducts()
    .done =>
      $(@)
      .text 'Загрузить еще'
      .remotveAttr 'disabled'
    .fail =>
      $(@).css("display","none")
    false

  if $category.length
    getProducts()

  checkCartResult = () ->
    result = window.cart.getAll()
    price = 0
    for i in result
      price += parseInt(i.col) * parseInt(i.price)
    price = price.toFixed(2)
    $(".cart-result-value").text(price+" Р")

  cartDecrement = () ->
    num = parseInt($(@).next().text()) - 1
    if num == 0
      window.cart.delete($(@).attr("ident"))
      $(@).parent().parent().parent().remove()
      window.cart.check()
      cartCheckType()
    else 
      $(@).next().text(num)
      window.cart.col($(@).attr("ident"),num)
      elem = window.cart.get($(@).attr("ident"))
      cartPriceCheck($(@),elem.col,elem.price)

    checkCartResult() 

  cartIncrement = () ->
    num = parseInt($(@).prev().text()) + 1
    $(@).prev().text(num)
    window.cart.col($(@).attr("ident"),num)
    elem = window.cart.get($(@).attr("ident"))
    cartPriceCheck($(@),elem.col,elem.price)
    checkCartResult()

  cartPriceCheck = (e,col,p) ->
    num = parseInt(col) * parseInt(p)
    e.parent().parent().parent().find(".cart-price-value").text(num.toFixed(2)+" Р")

  cartCheckPrice = () ->
    pr = $(".cart-decrement")
    pr.each (i) ->
      elem = window.cart.get($(@).attr("ident"))
      cartPriceCheck($(@),elem.col,elem.price)

  cartCheckType = () ->
    pr = $(".cart-decrement")

    if(pr.length == 0)
      $(".cart-no").css("display","block")
      $(".cart-result").css("display","none")
      $(".create-order").css("display","none")
    else
      $(".cart-no").css("display","none")
      $(".cart-result").css("display","block")
      $(".create-order").css("display","inline-block")


    
  $('.cart-info, .cart-number').click () ->
    template = Handlebars.compile $('[template="cart"]').html()
    products = {"all" : window.cart.getAll()}
    Modal.show template products
    checkCartResult()
    cartCheckPrice()
    $(".cart-decrement").click cartDecrement
    $(".cart-increment").click cartIncrement
    cartCheckType()
    $(".create-order").click () ->
      Modal.hide
      template = Handlebars.compile $('[template="order"]').html()
      Modal.show template {}
      $('.send-order').click () ->
        adress =  $("#order_adress").val()
        name = $("#order_name").val()
        email = $("#order_email").val()
        phone = $("#order_phone").val()
        $(".cart_error").css("display","none")
        if adress.length == 0 or name.length == 0 or email.length == 0 or phone.length == 0
          $(".cart_error").text("Все поля обязательны для заполнения").css("display","block")
          return null
        products = window.cart.getAll()
        $.ajax
          type: 'post'
          url: "/order/send"
          dataType: 'json'
          data: {"name":name,"email":email,"phone":phone,"adress":adress,"products":products}
        .done (data) ->


        $(".order-info").text("Заказ отправлен в обработку.")
        $(".cart-title").text("Успех")
        for i in products
          window.cart.delete(i.id)
        window.cart.check()




