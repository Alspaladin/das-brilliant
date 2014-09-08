(function() {
  window.Page = (function() {
    return {
      init: function() {
        $('[data-role="page"]').addClass("page__" + ($('[data-page]').data('page')));
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
