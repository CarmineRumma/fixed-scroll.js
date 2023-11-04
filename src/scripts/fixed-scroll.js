(function($) {
    'use strict';
    $.fn.isInViewport = function() {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
        return elementBottom > viewportTop && elementTop < viewportBottom;
    };

    $.fn.fixedScroll = function(options) {
        const win = $(window);
        const html = $('html');
        const body = $('body');
        const head = $('head');
        var sections = this;
        var winHeight = win.height();
        var animateTarget;
        var _initialize, _scroll;
        var sectionsCache = [];
        const sectionsClass = "fixed-scroll-section";
        const sectionsSelector = "." + sectionsClass;
        const wrapperIdentifier = "f-scroll-wrapper";
        const wrapperInnerIdentifier = "f-scroll-inner";
        const unvisibleClass = "f-unvisible";
        const css = "<style type='text/css'>\
        "+sectionsSelector+" {\
            width: 100%;\
            height:100vh;\
            position: relative;\
            overflow: hidden;\
        }\
        "+sectionsSelector+".fixed {\
            position: fixed!important;\
            top: 0!important;\
        }\
        ."+unvisibleClass+" {\
            visibility: hidden;\
        }\
        ."+wrapperIdentifier+"{\
            position: relative;\
        }\
        ."+wrapperInnerIdentifier+"{\
            position: absolute;\
            top: 0;\
            left: 0;\
            width: 100%;\
            height: 100vh;\
            overflow: hidden;\
            transform: translate3d(0,0,0);\
        }\
        ."+wrapperInnerIdentifier+".go-down{\
            bottom: 0;\
            top: auto;\
        }\
        ."+wrapperIdentifier+".fixed > "+sectionsSelector+" {\
            position: absolute;\
        }\
    </style>";
        $(css.trim().replace(/\s\s+/g, ' ')).appendTo(head);
        var minContainerHeight = 0;
        var settings = $.extend({
            useCSSFixed: true,
            onEnter: null,
            onExit: null,
            onScroll: null,
        }, options);


        function log(message, args){
            console.log(message, args);
        }

        // Recalculate var
        function update() {
            winHeight = win.height();
            _initialize(true); // initialize with refresh
        };

        // Debounce window resize, run update
        (function windowResizeHandler() {
            var resizeTimeout;
            win.on('resize', function() {
                resizeTimeout ? clearTimeout(resizeTimeout) : 0;
                resizeTimeout = setTimeout(update, 150);
            });
        })();

        // Switch animation target based on browser
        // FireFox requires html to animate
        // Chrome requires body to animate
        (function browserCheck() {
            var firefox = typeof InstallTrigger !== 'undefined';
            if (firefox) {
                animateTarget = html;
            } else {
                animateTarget = body;
            }
        })();

        // init
        _initialize = (function init(refresh) {
            var lastTop = 0;
            if (!refresh) {
                if (sections.length > 0) {
                    $(sections).each( function (i, item) {
                        const $this = $(this);
                        $this.removeAttr('data-fixed-section');
                        $this.addClass(sectionsClass);
                    });
                    $(sectionsSelector).wrapAll("<div class='"+wrapperIdentifier+"'></div>");
                }
            }
            if (refresh === true) {
                sectionsCache = [];
            }
            minContainerHeight = 0;
            $(sectionsSelector).each(function (i, item){
                const $this = $(this);
                var dh = $this.data("duration") ? $this.data("duration") * winHeight : winHeight;
                var ot = $this.offset().top;
                minContainerHeight += dh; 
                sectionsCache.push({   
                    handler: $(item),
                    offsetTop: ot, 
                    height: dh,
                    entered: false,
                    exited: true,
                    onEnter: function(args) {
                        if (typeof(settings.onEnter) == 'function') {
                            settings.onEnter(args);
                        }
                    },
                    onExit: function(args) {
                        if (typeof(settings.onExit) == 'function') {
                            settings.onExit(args);
                        }
                    },
                    onScroll: function(args) {
                        if (typeof(settings.onScroll) == 'function') {
                            settings.onScroll(args);
                        }
                    }
                });
                lastTop = ot + dh;
                //$this.removeAttr("data-duration");
            });

            $('.' + wrapperIdentifier).css('minHeight', minContainerHeight);

            var lastRTop = 0
            $(sectionsSelector).each(function (i, item){
                const $this = $(this);
                if (!refresh) {
                    $this.wrapInner("<div class='"+wrapperInnerIdentifier+"' ></div>");
                }
                $this.css({
                    top: lastRTop,
                    height: sectionsCache[i].height,
                    zIndex: (100 - i)
                });
                sectionsCache[i].nOffsetTop = i > 0 ? sectionsCache[i-1].nOffsetTop + sectionsCache[i-1].height : 0;
                lastRTop += sectionsCache[i].height
            });
            //log('sectionsCache', sectionsCache);

            var lastScrollTop = 0;
            // scroll event listener
            $(win).on('scroll', function () {
                const scrollTop = $(window).scrollTop(); 
                const scrollDirection = scrollTop >= lastScrollTop ? "down" : "up";
                lastScrollTop = scrollTop;
                const scrollZero = $('.' + wrapperIdentifier).offset().top;
                if (scrollTop  > sectionsCache[0].offsetTop) { 
                    $('.' + wrapperIdentifier).addClass("fixed");
                }
                for (var i = 0; i < sectionsCache.length; i++) {
                    const nOt = sectionsCache[i].nOffsetTop;
                    var percent = 0;
                    const sign = scrollDirection === "up" ? -1 : 1;
                    const $handler = sectionsCache[i].handler;
                    const $innerHandler = $handler.find("." + wrapperInnerIdentifier);
                    if (scrollTop + (scrollZero * sign) >= sectionsCache[i].offsetTop) {
                        
                        var dy = scrollTop - nOt - scrollZero;
                        const finalY = nOt + sectionsCache[i].height + scrollZero - winHeight;
                        if (scrollTop + winHeight >= nOt) {
                            const loaded = sectionsCache[i].nOffsetTop + scrollZero;
                            percent = (scrollTop-loaded) * 100 / (sectionsCache[i].height-winHeight);
                        }
                        if (scrollTop >= finalY) {
                            dy = null;
                            percent = 100;
                            $handler.removeClass("fixed"); 
                            $innerHandler.addClass("go-down");
                            if (!sectionsCache[i].exited) {
                                settings.onExit(i, $handler);
                                sectionsCache[i].exited = true;
                            }
                            
                        } 
                        if (dy >= 0 && !settings.useCSSFixed) {
                            $innerHandler.css("transform", "translateY("+dy+"px)translateZ(0)");
                        }
                        if (settings.useCSSFixed && percent > 0 && percent < 100) {
                            $handler.addClass("fixed"); 
                            if (!sectionsCache[i].entered) {
                                settings.onEnter(i, $handler);
                                sectionsCache[i].entered = true;
                            }
                            $innerHandler.removeClass("go-down");
                        } else {
                            $handler.removeClass("fixed");  
                            //scrollDirection === "down" ? $innerHandler.removeClass("go-down") : $innerHandler.addClass("go-down");
                        }
                        if (percent >= 0 && percent <= 100 && $handler.hasClass("fixed")) {
                            settings.onScroll(i, percent, $handler);
                        }
                    } else {
                        $innerHandler.css("transform", "translateY(0px)translateZ(0)");
                        $handler.removeClass("fixed"); 
                        if (!sectionsCache[i].exited) {
                            settings.onExit(i, $handler);
                            sectionsCache[i].exited = true;
                        }
                        //$innerHandler.addClass("go-down");
                    }
                    $handler.isInViewport() ? $handler.removeClass(unvisibleClass) : $handler.addClass(unvisibleClass);
                }
              });
              $(win).trigger("scroll");
              return init;
        })();

        jQuery.extend(jQuery.easing, {
            // Custom Easing Function
            fixedScrollEasing: function(x, t, b, c, d) {
                var ts = (t /= d) * t;
                var tc = ts * t;
                return b + c * (-0.749999 * tc * ts + 2.5 * ts * ts + -2 * tc + -1.5 * ts + 2.75 * t);
            }
        });

        return this;

    }
})(jQuery);
