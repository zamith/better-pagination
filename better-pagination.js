(function() {
  var $, defaultSettings, pluginName;

  $ = jQuery;

  pluginName = "better_pagination";

  defaultSettings = {
    starts_at: 15,
    load_on_scroll: false,
    loading_selector: "#loading-posts",
    show_more_selector: "#show-more",
    no_more_selector: "#no-more-posts",
    load_path: "posts/load",
    debug: false
  };

  $.fn.extend({
    better_pagination: function(options) {
      var $loading_elem, $no_more_elem, $show_more_elem, check_scroll, check_show_or_not, element, load_more, log, scroll_bind, settings, show_more;
      settings = $.extend({}, defaultSettings, options);
      element = this;
      $loading_elem = $(settings.loading_selector);
      $show_more_elem = $(settings.show_more_selector);
      $no_more_elem = $(settings.no_more_selector);
      check_scroll = function() {
        if ($(window).scrollTop() === $(document).height() - $(window).height()) {
          load_more();
          return $loading_elem.show();
        }
      };
      check_show_or_not = function() {
        console.log($(document).height());
        console.log($(window).height());
        console.log(settings.load_on_scroll);
        if ($(document).height() > $(window).height() && settings.load_on_scroll === true) {
          $show_more_elem.remove();
          return false;
        } else {
          return true;
        }
      };
      load_more = function() {
        if (settings.load_on_scroll) {
          $(window).off("scroll");
        }
        return $.get("/" + settings.load_path + "?starts_at=" + settings.starts_at, function(data) {
          $loading_elem.hide();
          check_show_or_not();
          if (data.has_more) {
            element.append(data.html);
            settings.starts_at = data.new_start;
            if (settings.load_on_scroll) {
              return $(window).on("scroll", check_scroll);
            }
          } else {
            settings.starts_at = 0;
            $show_more_elem.remove();
            return $no_more_elem.show();
          }
        }).error(function(data) {
          log("Got an error loading more elements.");
          return $loading_elem.hide();
        });
      };
      log = function(msg) {
        if (settings.debug) {
          return typeof console !== "undefined" && console !== null ? console.log(msg) : void 0;
        }
      };
      scroll_bind = function() {
        $show_more_elem.hide();
        return $(window).on("scroll", check_scroll);
      };
      show_more = function() {
        log("Binding the show more link");
        return $show_more_elem.on("click.better_pagination", function(event) {
          event.preventDefault();
          log("Clicked the show more link");
          load_more();
          return check_show_or_not();
        });
      };
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName) || settings.debug) {
          log("Initializing better_pagination " + (settings.load_on_scroll ? "with" : "without") + " scroll.");
          if (check_show_or_not()) {
            show_more();
          } else {
            scroll_bind();
          }
          return $.data(this, "plugin_" + pluginName, settings);
        }
      });
    }
  });

}).call(this);
