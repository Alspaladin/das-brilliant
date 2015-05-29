  window.cart = {}

  window.cart.add = (id,category,name,col,price) ->
    elem = {"id":id, "category":category, "col":col, "name":name, "price":price}
    old = $.cookie(id)
    if(old)
      old = $.parseJSON(old)
      old.col += 1
      $.cookie(id, $.toJSON(old), { expires: 7, path: '/' })
      cart.check()
      return null

    $.cookie(id, $.toJSON(elem), { expires: 7, path: '/' })
    window.cart.addList(id)
    window.cart.increment()
    window.cart.check()
  
  window.cart.addList = (id) ->
    list = $.cookie('list') 

    if list
      list = $.parseJSON(list)
    else
      list = []
    list.push(id)
    $.cookie('list', $.toJSON(list), { expires: 7, path: '/' })

  window.cart.decrement = () ->
    count = parseInt($.cookie('count'))
    if !count
      count = 0

    if count == 0
      return null
    count -= 1
    $.cookie('count',count, { expires: 7, path: '/' })

  window.cart.increment = () ->
    count = parseInt($.cookie('count'))
    console.log(count)
    if !count
      count = 0
    count += 1
    $.cookie('count',count, { expires: 7, path: '/' })

  window.cart.check = () ->
    count = parseInt($.cookie('count'))
    if !count
      count = 0

    if count == 0
      $(".cart-number").css("display","none")
    else
      $(".cart-number").css("display","block").text(count)

  window.cart.getAll = () ->
    list = $.cookie('list')
    if(!list)
      return []
    list = $.parseJSON(list);
    elems = [];
    #console.log(list)
    for i in list
      
      elems.push($.parseJSON($.cookie(i)))
    return elems

  window.cart.delete = (id) ->
    elem = $.cookie(id)
    if elem
      $.removeCookie(id, { path: '/' })
      cart.decrement()
      list = $.cookie('list')
      if(!list)
        return []
      list = $.parseJSON(list)
      listResult = []
      for l in list
        if l != id
          listResult.push(l)
          
      
      $.cookie('list', $.toJSON(listResult), { expires: 7, path: '/' })

  window.cart.col = (id,col) ->
    elem = $.cookie(id)
    if elem
      elem = $.parseJSON(elem)
      elem.col = col
      $.cookie(id,$.toJSON(elem), { expires: 7, path: '/' })

  window.cart.get = (id) ->
    elem = $.cookie(id)
    if elem
      elem = $.parseJSON(elem)
    return elem

  window.cart.check();


  