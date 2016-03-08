(function() {
  window.settings = {
    HOST: 'http://localhost',
    product: null
  };

}).call(this);

(function() {
  $(function() {
    var $brand, $category, cartCheckPrice, cartCheckType, cartDecrement, cartIncrement, cartPriceCheck, checkCartResult, drawListItem, drawProduct, getProduct, getProducts, params;
    $brand = $('[brand]');
    $category = $('[category]');
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
          cart.add(product['_id'], product.category, product.name, 1, product.price);
          return window.Modal.hide();
        });
      });
    });
    $(document).on('click', '[role="brand.load-more"]', function() {
      var load_button;
      load_button = $(this);
      load_button.text('Загрузка').attr('disabled', 'disabled');
      params.skip += 20;
      getProducts().done((function(_this) {
        return function() {
          return load_button.text('Загрузить еще').removeAttr('disabled');
        };
      })(this)).fail((function(_this) {
        return function() {
          return load_button.css("display", "none");
        };
      })(this));
      return false;
    });
    if ($brand.length && $category.length < 1) {
      console.log('getting products');
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
      console.log('cart click');
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
    var $brands, drawCategories, getCategories;
    $brands = $('[brands]');
    if ($brands.length) {
      $.ajax({
        type: 'get',
        url: settings.HOST + '/products/brands/'
      }).done(function(brands) {
        brands.forEach(function(brand) {
          brand.name = brand.name.toString().toLowerCase();
          return $("<div class=brands_item brand=" + brand._id + "><a class=brands_item_link href=/brands/" + brand._id + "/categories><img src=/public/pic/" + brand.name + ".png></a></div>").appendTo($brands);
        });
        $(document).on('click', '[brand] > a', function(e, data) {
          var brand;
          brand = $(this).parent();
          getCategories(brand.attr('brand')).done(function(categories) {
            drawCategories(categories, brand);
            return $(document).on('click', brand, function(e) {
              if ($('body').hasClass('body__modal')) {
                return true;
              }
              drawCategories(categories, brand);
              e.preventDefault();
              return false;
            });
          });
          e.preventDefault();
          return false;
        });
        return false;
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
    getCategories = function(brand_id) {
      return $.ajax({
        type: 'get',
        url: settings.HOST + ("/products/brand/" + brand_id + "/categories")
      }).done(function(data) {});
    };
    return drawCategories = function(categories, brand) {
      var template;
      template = Handlebars.compile($('[template="categories"]').html());
      return Modal.show(template(categories), brand, true);
    };
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
  $(function() {
    var $brand, $category, cartCheckPrice, cartCheckType, cartDecrement, cartIncrement, cartPriceCheck, checkCartResult, drawListItem, drawProduct, getProduct, getProducts, params;
    $brand = $('[brand]');
    $category = $('[category]');
    params = {
      limit: 20,
      skip: 0
    };
    drawListItem = function(product) {
      return $("<div class=\"brand_item\" product=\"" + product._id + "\">\n  <img src=\"http://dasbrilliant.com/products/image/" + product._id + "\"/>\n  <div style=\"padding-bottom:10px;text-align:center;\" class=\"brand_item_caption\">" + product.name + "</div>\n  <div style=\"padding-bottom:10px;text-align:center;\" class=\"brand_item_caption\">" + product.category + "</div>\n  <div style=\"font-size:24px;text-align:center;\" class=\"brand_item_price\">" + product.price + " Р</div>\n    <div style=\"color:#B8B8B8;font-size:16px;text-align:center;\">в наличии</div>\n</div>").appendTo($category);
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
        url: settings.HOST + ("/products/brand/" + ($brand.attr('brand')) + "/category/" + ($category.attr('category'))),
        data: params
      }).done(function(data) {
        $(".breadcrumbs_item_brend_link").text(data.products[0]['brand']);
        $(".breadcrumbs_item_brend_link").attr('href', '/brands/' + $brand.attr('brand'));
        $(".breadcrumbs_item_category").text(data.products[0]['category']);
        if (data.products.length > params.limit) {
          $('.brand_actions').removeClass('hidden');
        }
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
    $(document).on('click', '[role="category.load-more"]', function() {
      console.log('cate length', $category.length);
      if ($category.length < 1) {
        return false;
      }
      $(this).text('Загрузка').attr('disabled', 'disabled');
      params.skip += 20;
      console.log('getting ajax category products');
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
    if ($category.length) {
      console.log('getting category products');
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
  window.Modal = (function() {
    $(document).on('click', '[modal_show]', function() {
      Modal.show($($(this).attr('content')).html());
      return false;
    }).on('click', '[modal]', function() {
      if ($('body').hasClass('body__modal')) {
        return Modal.hide();
      }
    }).on('click', 'body', function(e) {
      console.log('body click');
      if (!($('[modal]').hasClass('show'))) {
        return false;
      }
      if (!$(event.target).closest('[modal]:parent').length && !$(event.target).is('[modal]:parent') && $('body').hasClass('body__modal')) {
        console.log('hiding modal');
        return Modal.hide();
      }
    }).on('click', '[modal_container]', function(e) {
      if ($('[modal_content]').children().hasClass('links') || $(e.target).hasClass('link_to_contacts')) {
        return true;
      } else {
        e.stopPropagation();
        return false;
      }
    }).on('keyup', function(e) {
      if (e.keyCode === 27 && $('[modal]').hasClass('show')) {
        return Modal.hide();
      }
    });
    return {
      show: function(html, parent, force_append) {
        var wrapper;
        wrapper = $('.modal_wrapper');
        if (parent) {
          wrapper.appendTo(parent);
          if (force_append) {
            wrapper.addClass('hasLinks');
          } else {
            wrapper.addClass('hasMap');
          }
        } else {
          $('body').css("overflow", "hidden");
        }
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
        $('[data-init="data-init"]').addClass('init');
        $(document).on('click', '.map_link', function(e, data) {
          Page.drawMap();
          e.preventDefault();
          return false;
        });
        return false;
      },
      drawMap: function(data) {
        var script, template;
        template = Handlebars.compile($('[template="address_map"]').html());
        if (typeof window.map === 'undefined') {
          script = document.createElement('script');
          script.onload = function() {
            Modal.show(template, $('body'));
            Page.initMap();
            return false;
          };
          script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD-rRs1O8Xn8RimjoQ-dKurAD5R1bRfN0A&signed_in=true";
          script.async = true;
          document.getElementsByTagName('head')[0].appendChild(script);
          return false;
        } else {
          Modal.show(template, $('body'));
          Page.initMap();
          return false;
        }
      },
      initMap: function() {
        var coords, customMapType, customMapTypeId, map, marker;
        customMapType = new google.maps.StyledMapType([
          {
            "featureType": "landscape",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }, {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }, {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }, {
            "featureType": "water",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }, {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }, {
            "stylers": [
              {
                "hue": "#00aaff"
              }, {
                "saturation": -100
              }, {
                "gamma": 2.15
              }, {
                "lightness": 12
              }
            ]
          }, {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "visibility": "on"
              }, {
                "lightness": 24
              }
            ]
          }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "lightness": 57
              }
            ]
          }
        ], {
          name: 'Custom Style'
        });
        customMapTypeId = 'custom_style';
        coords = {
          lat: 57.1117155,
          lng: 65.5466005
        };
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: coords,
          mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, customMapTypeId]
          }
        });
        marker = new google.maps.Marker({
          position: coords,
          map: map,
          title: 'Das Brilliant'
        });
        map.mapTypes.set(customMapTypeId, customMapType);
        return map.setMapTypeId(customMapTypeId);
      }
    };
  })();

}).call(this);

(function() {
  $(window).load(function() {
    return Page.init();
  });

}).call(this);
