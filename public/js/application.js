(function() {
  window.settings = {
    HOST: 'http://dasbrilliant.com',
    product: null
  };

}).call(this);

(function() {
  $(function() {
    var $brand, cartCheckPrice, cartCheckType, cartDecrement, cartIncrement, cartPriceCheck, checkCartResult, drawListItem, drawProduct, getProduct, getProducts, params;
    $brand = $('[brand]');
    params = {
      limit: 20,
      skip: 0
    };
    drawListItem = function(product) {
      return $("<div class=\"brand_item\" product=\"" + product._id + "\">\n  <img src=\"http://dasbrilliant.com/products/image/" + product._id + "\"/>\n  <div style=\"padding-bottom:10px;text-align:center;\" class=\"brand_item_caption\">" + product.name + "</div>\n  <div style=\"font-size:24px;text-align:center;\" class=\"brand_item_price\">" + product.price + " Р</div>\n    <div style=\"color:#B8B8B8;font-size:16px;text-align:center;\">в наличии</div>\n</div>").appendTo($brand);
    };
    drawProduct = function(product) {
      var template;
      template = Handlebars.compile($('[template="product"]').html());
      Modal.show(template(product));
      return location.hash = product._id;
    };
    getProducts = function() {
      return $.ajax({
        type: 'get',
        url: settings.HOST + ("/products/brand/" + ($brand.attr('brand'))),
        data: params
      }).done(function(data) {
        $(".breadcrumbs_item_brend").text(data.products[0]['brand']);
        return data.products.forEach(function(product) {
          return drawListItem(product);
        });
      });
    };
    getProduct = function(id) {
      return $.ajax({
        type: 'get',
        url: settings.HOST + ("/products/" + id)
      }).done(function(data) {});
    };
    $(document).on('click', '[product]', function() {
      return getProduct($(this).attr('product')).done(function(product) {
        window.settings['product'] = product;
        product.attributes_values = product.attributes_values.slice(0, 8);
        drawProduct(product);
        return $('.cart-add').click(function() {
          console.log(product);
          cart.add(product['_id'], product.category, product.name, 1, product.price);
          return window.Modal.hide();
        });
      });
    });
    $(document).on('click', '[role="brand.load-more"]', function() {
      $(this).text('Загрузка').attr('disabled', 'disabled');
      params.skip += 20;
      getProducts().done((function(_this) {
        return function() {
          return $(_this).text('Загрузить еще').remotveAttr('disabled');
        };
      })(this)).fail((function(_this) {
        return function() {
          return $(_this).css("display", "none");
        };
      })(this));
      return false;
    });
    if ($brand.length) {
      getProducts();
    }
    if (location.hash.replace('#', '')) {
      getProduct(location.hash.replace('#', '')).done(function(product) {
        return drawProduct(product);
      });
    }
    checkCartResult = function() {
      var i, price, result, _i, _len;
      result = window.cart.getAll();
      price = 0;
      for (_i = 0, _len = result.length; _i < _len; _i++) {
        i = result[_i];
        price += parseInt(i.col) * parseInt(i.price);
      }
      price = price.toFixed(2);
      return $(".cart-result-value").text(price + " Р");
    };
    cartDecrement = function() {
      var elem, num;
      num = parseInt($(this).next().text()) - 1;
      if (num === 0) {
        window.cart["delete"]($(this).attr("ident"));
        $(this).parent().parent().parent().remove();
        window.cart.check();
        cartCheckType();
      } else {
        $(this).next().text(num);
        window.cart.col($(this).attr("ident"), num);
        elem = window.cart.get($(this).attr("ident"));
        cartPriceCheck($(this), elem.col, elem.price);
      }
      return checkCartResult();
    };
    cartIncrement = function() {
      var elem, num;
      num = parseInt($(this).prev().text()) + 1;
      $(this).prev().text(num);
      window.cart.col($(this).attr("ident"), num);
      elem = window.cart.get($(this).attr("ident"));
      cartPriceCheck($(this), elem.col, elem.price);
      return checkCartResult();
    };
    cartPriceCheck = function(e, col, p) {
      var num;
      num = parseInt(col) * parseInt(p);
      return e.parent().parent().parent().find(".cart-price-value").text(num.toFixed(2) + " Р");
    };
    cartCheckPrice = function() {
      var pr;
      pr = $(".cart-decrement");
      return pr.each(function(i) {
        var elem;
        elem = window.cart.get($(this).attr("ident"));
        return cartPriceCheck($(this), elem.col, elem.price);
      });
    };
    cartCheckType = function() {
      var pr;
      pr = $(".cart-decrement");
      if (pr.length === 0) {
        $(".cart-no").css("display", "block");
        $(".cart-result").css("display", "none");
        return $(".create-order").css("display", "none");
      } else {
        $(".cart-no").css("display", "none");
        $(".cart-result").css("display", "block");
        return $(".create-order").css("display", "inline-block");
      }
    };
    return $('.cart-info, .cart-number').click(function() {
      var products, template;
      template = Handlebars.compile($('[template="cart"]').html());
      products = {
        "all": window.cart.getAll()
      };
      Modal.show(template(products));
      checkCartResult();
      cartCheckPrice();
      $(".cart-decrement").click(cartDecrement);
      $(".cart-increment").click(cartIncrement);
      cartCheckType();
      return $(".create-order").click(function() {
        Modal.hide;
        template = Handlebars.compile($('[template="order"]').html());
        Modal.show(template({}));
        return $('.send-order').click(function() {
          var adress, email, i, name, phone, _i, _len;
          adress = $("#order_adress").val();
          name = $("#order_name").val();
          email = $("#order_email").val();
          phone = $("#order_phone").val();
          $(".cart_error").css("display", "none");
          if (adress.length === 0 || name.length === 0 || email.length === 0 || phone.length === 0) {
            $(".cart_error").text("Все поля обязательны для заполнения").css("display", "block");
            return null;
          }
          products = window.cart.getAll();
          $.ajax({
            type: 'post',
            url: "/order/send",
            dataType: 'json',
            data: {
              "name": name,
              "email": email,
              "phone": phone,
              "adress": adress,
              "products": products
            }
          }).done(function(data) {});
          $(".order-info").text("Заказ отправлен в обработку.");
          $(".cart-title").text("Успех");
          for (_i = 0, _len = products.length; _i < _len; _i++) {
            i = products[_i];
            window.cart["delete"](i.id);
          }
          return window.cart.check();
        });
      });
    });
  });

}).call(this);

(function() {
  $(function() {
    var $brands;
    $brands = $('[brands]');
    if ($brands.length) {
      return $.ajax({
        type: 'get',
        url: settings.HOST + '/products/brands/'
      }).done(function(brands) {
        return brands.forEach(function(brand) {
          brand.name = brand.name.toString().toLowerCase();
          return $("<a class=brands_item href=/brands/" + brand._id + "><img src=/public/pic/" + brand.name + ".png></a>").appendTo($brands);
        });
      }).done(function(brands) {
        var $cont;
        $cont = $('.brands_container');
        return $cont.imagesLoaded(function() {
          return $cont.masonry({
            columnWidth: 250,
            gutter: 52,
            itemSelector: '.brands_item'
          });
        });
      });
    }
  });

}).call(this);

(function() {
  window.cart = {};

  window.cart.add = function(id, category, name, col, price) {
    var elem, old;
    elem = {
      "id": id,
      "category": category,
      "col": col,
      "name": name,
      "price": price
    };
    old = $.cookie(id);
    if (old) {
      old = $.parseJSON(old);
      old.col += 1;
      $.cookie(id, $.toJSON(old), {
        expires: 7,
        path: '/'
      });
      cart.check();
      return null;
    }
    $.cookie(id, $.toJSON(elem), {
      expires: 7,
      path: '/'
    });
    window.cart.addList(id);
    window.cart.increment();
    return window.cart.check();
  };

  window.cart.addList = function(id) {
    var list;
    list = $.cookie('list');
    if (list) {
      list = $.parseJSON(list);
    } else {
      list = [];
    }
    list.push(id);
    return $.cookie('list', $.toJSON(list), {
      expires: 7,
      path: '/'
    });
  };

  window.cart.decrement = function() {
    var count;
    count = parseInt($.cookie('count'));
    if (!count) {
      count = 0;
    }
    if (count === 0) {
      return null;
    }
    count -= 1;
    return $.cookie('count', count, {
      expires: 7,
      path: '/'
    });
  };

  window.cart.increment = function() {
    var count;
    count = parseInt($.cookie('count'));
    console.log(count);
    if (!count) {
      count = 0;
    }
    count += 1;
    return $.cookie('count', count, {
      expires: 7,
      path: '/'
    });
  };

  window.cart.check = function() {
    var count;
    count = parseInt($.cookie('count'));
    if (!count) {
      count = 0;
    }
    if (count === 0) {
      return $(".cart-number").css("display", "none");
    } else {
      return $(".cart-number").css("display", "block").text(count);
    }
  };

  window.cart.getAll = function() {
    var elems, i, list, _i, _len;
    list = $.cookie('list');
    if (!list) {
      return [];
    }
    list = $.parseJSON(list);
    elems = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      i = list[_i];
      elems.push($.parseJSON($.cookie(i)));
    }
    return elems;
  };

  window.cart["delete"] = function(id) {
    var elem, l, list, listResult, _i, _len;
    elem = $.cookie(id);
    if (elem) {
      $.removeCookie(id, {
        path: '/'
      });
      cart.decrement();
      list = $.cookie('list');
      if (!list) {
        return [];
      }
      list = $.parseJSON(list);
      listResult = [];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        l = list[_i];
        if (l !== id) {
          listResult.push(l);
        }
      }
      return $.cookie('list', $.toJSON(listResult), {
        expires: 7,
        path: '/'
      });
    }
  };

  window.cart.col = function(id, col) {
    var elem;
    elem = $.cookie(id);
    if (elem) {
      elem = $.parseJSON(elem);
      elem.col = col;
      return $.cookie(id, $.toJSON(elem), {
        expires: 7,
        path: '/'
      });
    }
  };

  window.cart.get = function(id) {
    var elem;
    elem = $.cookie(id);
    if (elem) {
      elem = $.parseJSON(elem);
    }
    return elem;
  };

  window.cart.check();

}).call(this);

(function() {
  window.Modal = (function() {
    $(document).on('click', '[modal_show]', function() {
      Modal.show($($(this).attr('content')).html());
      return false;
    }).on('click', '[modal]', function() {
      return Modal.hide();
    }).on('click', '[modal_container]', function(e) {
      e.stopPropagation();
      return false;
    }).on('keyup', function(e) {
      if (e.keyCode === 27 && $('[modal]').hasClass('show')) {
        return Modal.hide();
      }
    });
    return {
      show: function(html) {
        $('body').css("overflow", "hidden");
        $('.modal_wrapper').mousewheel();
        $('.modal_content').focus();
        $('[modal]').find('[modal_content]').html(html);
        $('[modal]').addClass('showing');
        $('body').addClass('body__modal');
        setTimeout(function() {
          return $('[modal]').addClass('show');
        }, 20);
        return setTimeout(function() {
          return $('[modal]').removeClass('showing');
        }, 1000);
      },
      hide: function() {
        $('[modal]').addClass('hidding');
        setTimeout(function() {
          $('body').removeClass('body__modal');
          $('[modal]').removeClass('show hidding');
          return $('body').css("overflow", "auto");
        }, 1000);
        return location.hash = '';
      }
    };
  })();

}).call(this);

(function() {
  window.Page = (function() {
    return {
      init: function() {
        return $('[data-init="data-init"]').addClass('init');
      }
    };
  })();

}).call(this);

(function() {
  $(window).load(function() {
    return Page.init();
  });

}).call(this);
