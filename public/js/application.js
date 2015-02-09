(function() {
  $(window).on('load', function() {
    return $('.brands_container').masonry({
      columnWidth: 250,
      gutter: 52,
      itemSelector: '.brands_item'
    });
  });

}).call(this);

(function() {
  window.Modal = (function() {
    $(document).on('click', '[modal_show]', function() {
      Modal.show($($(this).attr('content')));
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
      show: function($content) {
        $('[modal]').find('[modal_content]').append($content).end().addClass('show');
        return $('body').addClass('body__modal');
      },
      hide: function() {
        $('[modal]').addClass('hidding');
        return setTimeout(function() {
          $('body').removeClass('body__modal');
          return $('[modal]').removeClass('show hidding');
        }, 1000);
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
