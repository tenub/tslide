/* refer to easing.js for all available easing options */

;(function ($, window, document, undefined) {

    // Setup defaults
    var d = document,
        pluginName = "tslide",
        defaults = {
            pagination: "on",
            maxwidth: 800,
            easing: "swing",
            movetime: 400,
            pausetime: 2000,
            autoplay: "on"
        };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.active = 0;
        this.init();
    }

    Plugin.prototype = {

        init: function() {

            var base = this;

            // before instantiating anything validate user options
            base.validate(base.options);

            // create image container and append images via array generated from images directory
            var html = "<div id='img-container'/>";
            $(this.element).append(this.generateImages(this.options.images)).find("img").wrapAll(html);

            // create and append pagination to slider container if the setting is enabled
            if ( this.options.pagination === "on" ) {
                html = "<div id='pagination'/>";
                $(this.element).append(this.generatePagination(this.options.images)).find(".img-number").click(function(){

                    // store index of currently active image
                    base.active = $("#img-container").children(".active").index();

                    // only animate if the new index is different from the current
                    if ( base.active !== $(this).index() ) {

                        // if autoplay is enabled stop autoplay and wait until animation is complete before starting again
                        if ( base.options.autoplay === "on" ) {
                            base.play(0);
                        }

                        // call animation effect
                        base.move(base.active, $(this).index());

                        // add active class to selected index and remove any previous active classes from other indices
                        base.updateIndex("#pagination", $(this).index());
                        base.updateIndex("#img-container", $(this).index());

                        // set index position after animation to clicked element occurs
                        base.active = $("#img-container").children(".active").index();

                        // if autoplay is enabled restart autoplay
                        if ( base.options.autoplay === "on" ) {
                            base.play(1);
                        }

                    }

                }).wrapAll(html);

                // set initially active index in pagination and image
                $("#pagination").children().eq(0).addClass("active");
                $("#img-container").children().eq(0).addClass("active");

            }

            // resize slider elements/containers
            this.setSize("#img-container > img:first-child","#img-container");
            this.setSize("#img-container","#slider");

            // center pagination module horizontally via negative margin
            $("#pagination").css({
                "margin-left" : "-" + $("#pagination").children().length + "em"
            });

            if ( this.options.autoplay === "on" ) {
                base.play(1);
            }

            return this;

        },

        // create an array of image nodes to be inserted into image container
        generateImages: function(imgsrc) {
            var nodeBuffer = [];
            for ( var i=0; i<imgsrc.length; i++ ) {
                nodeBuffer.push($(d.createElement("img")).attr("src", this.options.dir+imgsrc[i]).attr("alt", imgsrc[i]));
            }
            return nodeBuffer;
        },

        // create an array of pagination index nodes to be inserted into pagination container
        generatePagination: function(imgsrc) {
            if ( this.options.pagination === "on" ) {
                var nodeBuffer = [];
                for ( var i=0; i<imgsrc.length; i++ ) {
                    nodeBuffer.push($("<div class='img-number'/>"));
                }
                return nodeBuffer;
            }
        },

        // resize tslide elements based off maxwidth setting
        setSize: function(el1, el2) {
            var e1 = $(el1);
            var e2 = $(el2);
            var imgw = e1.width();
            var imgh = e1.height();
            var imgr = imgw / imgh;
            var p = e1.innerWidth() - imgw;
            if ( imgw > this.options.maxwidth ) {
                e2.width(this.options.maxwidth + p);
                e2.height(e2.width() / imgr + p);
            }
            else {
                e2.width(imgw + p);
                e2.height(imgh + p);
            }
        },

        // function to validate user settings
        validate: function (object) {
            if ( object.pagination !== "on" && object.pagination !== "off" ) {
                object.pagination = "on";
                console.log("'pagination was neither 'on' nor 'off'. Defaulting to 'on'.");
            }
            if ( isNaN(parseInt(object.maxwidth, 10)) || parseInt(object.maxwidth, 10) < 16 || parseInt(object.maxwidth, 10) > 1920 ) {
                object.maxwidth = 800;
                console.log("'maxwidth' was not between 16 and 1920 pixels. Defaulting to 800.");
            }
            if ( isNaN(parseInt(object.movetime, 10)) || parseInt(object.movetime, 10) < 1 || parseInt(object.movetime, 10) > 10000 ) {
                object.movetime = 400;
                console.log("'movetime' was not between 1 and 10000 ms. Defaulting to 400.");
            }
            var valid;
            for ( var key in $.easing ) {
                valid = 0;
                if ( object.easing === key ) {
                    valid = 1;
                    return;
                }
            }
            if ( !valid ) {
                object.easing = "linear";
                console.log("'easing' was not a valid method. Defaulting to 'linear'.");
            }
        },

        updateIndex: function(el, index) {
            $(el).children().eq(index).addClass("active").siblings().removeClass("active");
        },

        play: function(flag) {
            var base = this;
            if ( flag ) {
                iv = setInterval(function() {
                    if ( base.active === base.options.images.length-1 ) {
                        base.updateIndex("#img-container", 0);
                        base.updateIndex("#pagination", 0);
                        base.move(base.active, 0);
                        base.active = 0;
                    }
                    else {
                        base.updateIndex("#img-container", base.active+1);
                        base.updateIndex("#pagination", base.active+1);
                        base.move(base.active, base.active+1);
                        base.active += 1;
                    }
                }, base.options.pausetime);
            }
            else {
                clearInterval(iv);
            }
        },

        // animation effect for changing image indices
        move: function(cur, dest) {
            $("#img-container > img").animate({
                "right": "+=" + 100 * (dest-cur) + "%"
            }, this.options.movetime, this.options.easing);
        }

    };

    $.fn.tslide = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );

/*
        // validate settings
        _validate(settings);

*/