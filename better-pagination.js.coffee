$ = jQuery
pluginName = "better_pagination"

# Default settings
defaultSettings = 
  starts_at: 15
  load_on_scroll: false 

  loading_selector: "#loading-posts"
  show_more_selector: "#show-more"
  no_more_selector: "#no-more-posts"

  load_path: "posts/load"
  debug: false

$.fn.extend
  better_pagination: (options) ->
    settings = $.extend {}, defaultSettings, options
    element = this

    $loading_elem = $(settings.loading_selector)
    $show_more_elem = $(settings.show_more_selector)
    $no_more_elem = $(settings.no_more_selector)

    check_scroll = ->
      if $(window).scrollTop() == $(document).height() - $(window).height()
        load_more()
        $loading_elem.show()

    check_show_or_not = ->
      console.log $(document).height()
      console.log $(window).height()
      console.log settings.load_on_scroll
      if $(document).height() > $(window).height() and settings.load_on_scroll == true
        $show_more_elem.remove()
        return false
      else
        return true

    load_more = ->
      # When loading remove the check scroll event to serialize loading
      $(window).off("scroll") if settings.load_on_scroll
    
      $.get "/#{settings.load_path}?starts_at=#{settings.starts_at}", (data) ->
        $loading_elem.hide()
        check_show_or_not()
        if data.has_more
          element.append(data.html)
          settings.starts_at = data.new_start
          $(window).on "scroll", check_scroll if settings.load_on_scroll
        else
          settings.starts_at = 0
          $show_more_elem.remove()
          $no_more_elem.show()
      .error (data) ->
        log "Got an error loading more elements."
        $loading_elem.hide()
        # TODO: Caixinha a avisar que não conseguiu ir buscar mais posts

    log = (msg) ->
      console?.log msg if settings.debug

    scroll_bind = ->
      $show_more_elem.hide()
      $(window).on "scroll", check_scroll

    show_more = ->
      log "Binding the show more link"
      $show_more_elem.on "click.better_pagination", (event) ->
        event.preventDefault()
        log "Clicked the show more link"
        load_more()
        check_show_or_not()

    # The master function
    return @each () ->
      if !$.data(this, "plugin_#{pluginName}") || settings.debug
        log "Initializing better_pagination #{if settings.load_on_scroll then "with" else "without"} scroll."
        if check_show_or_not()
          show_more()
        else
          scroll_bind()

        $.data(this, "plugin_#{pluginName}", settings)
