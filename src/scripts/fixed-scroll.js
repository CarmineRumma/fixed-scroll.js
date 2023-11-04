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
        var _initialize;
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
        ."+wrapperIdentifier+".fixed > "+sectionsSelector+" {\
            position: absolute;\
        }\
    </style>";
        $(css.trim().replace(/\s\s+/g, ' ')).appendTo(head);
        var minContainerHeight = 0;
        var settings = $.extend({
            callback: null
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
            if (sections.length > 0) {
                $(sections).each( function (i, item) {
                    const $this = $(this);
                    $this.removeAttr('data-fixed-section');
                    $this.addClass(sectionsClass);
                });
                $(sectionsSelector).wrapAll("<div class='"+wrapperIdentifier+"'></div>");
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
                    callback: function() {
                        if (typeof(settings.callback) == 'function') {
                            settings.callback();
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
                sectionsCache[i].nOffsetTop = i > 0 ? sectionsCache[i-1].height : 0;
                lastRTop += sectionsCache[i].height
            });
            //log('sectionsCache', sectionsCache);

            $(win).on('scroll', function () {
                const scrollTop = $(window).scrollTop(); 
                //log('scrollTop', scrollTop)
                const scrollZero = $('.' + wrapperIdentifier).offset().top;
                if (scrollTop > sectionsCache[0].offsetTop) { 
                    $('.' + wrapperIdentifier).addClass("fixed");
                }
                for (var i = 0; i < sectionsCache.length; i++) {
                    const nOt = sectionsCache[i].nOffsetTop;
                    var percent = 0;
                    if (scrollTop + scrollZero >= sectionsCache[i].offsetTop) {
                        
                        var dy = scrollTop - nOt - scrollZero;
                        const finalY = nOt + sectionsCache[i].height + scrollZero - winHeight;
                        if (scrollTop >= nOt) {
                            const loaded = sectionsCache[i].nOffsetTop + scrollZero;
                            percent = (scrollTop-loaded) * 100 / (sectionsCache[i].height-winHeight);
                        }
                        if (scrollTop >= finalY) {
                            dy = null;
                            percent = 100;
                            sectionsCache[i].handler.find("." + wrapperInnerIdentifier).addClass("hid")
                        } 
                        if (dy >= 0) {
                            sectionsCache[i].handler.find("." + wrapperInnerIdentifier).css("transform", "translateY("+dy+"px)translateZ(0)");
                        }
                        settings.callback(i, percent);
                    } else {
                        sectionsCache[i].handler.find("." + wrapperInnerIdentifier).css("transform", "translateY(0px)translateZ(0)")
                    }
                    sectionsCache[i].handler.isInViewport() ? sectionsCache[i].handler.removeClass(unvisibleClass) : sectionsCache[i].handler.addClass(unvisibleClass)
                    sectionsCache[i].handler.find(".text > span").html("(" + (percent > 0 ? percent.toFixed(2) : 0) + "%)");
                }
              });
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
