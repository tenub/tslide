/* refer to easing.js for all available easing options */

;(function ($, window, document, undefined) {

    // Setup defaults
    var d = document,
        pluginName = "tslide",
        defaults = {
            legend: "on",
            maxwidth: 800,
            easing: "swing",
            aduration: 400,
            pduration: 2000,
            autoplay: "on"
        };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.item = 0;
        this.playing = 1;
        this.init();
    }

    Plugin.prototype = {

        init: function() {

            var base = this;

            // create image container and append images via array generated from images directory
            var html = "<div id='img-container'/>";
            $(this.element).append(this.generateImages(this.options.images)).find("img").wrapAll(html);

            // create and append pagination to slider container if the setting is enabled
            if ( this.options.legend === "on" ) {
                html = "<div id='legend'/>";
                $(this.element).append(this.generateLegend(this.options.images)).find(".img-number").click(function(){

                    // store index of currently active image
                    base.item = $("#img-container").children(".active").index();

                    // only animate if the new index is different from the current
                    if ( base.item !== $(this).index() ) {

                        // stop autoplay and wait until animation is complete before starting again
                        base.play(0);

                        // call animation effect
                        base.move(base.item, $(this).index());

                        // add active class to selected index and remove any previous active classes from other indices
                        base.updateIndex("#legend", $(this).index());
                        base.updateIndex("#img-container", $(this).index());

                        // set index position after animation to clicked element occurs
                        base.item = $("#img-container").children(".active").index();

                        // restart autoplay
                        base.play(1);

                    }

                }).wrapAll(html);

                // set initially active index in legend and image
                $("#legend").children().eq(0).addClass("active");
                $("#img-container").children().eq(0).addClass("active");

                /*******************************************/
                /**** TO DO: center legend horizontally ****/
                /*******************************************/
                //console.log(this.getWidth($("#legend")));

            }

            // resize slider elements/containers
            this.setsize("#img-container > img:first-child","#img-container");
            this.setsize("#img-container","#slider");

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

        // create an array of legend index nodes to be inserted into legend container
        generateLegend: function(imgsrc) {
            if ( this.options.legend === "on" ) {
                var nodeBuffer = [];
                for ( var i=0; i<imgsrc.length; i++ ) {
                    nodeBuffer.push($("<div class='img-number'/>"));
                }
                return nodeBuffer;
            }
        },

        // resize tslide elements based off maxwidth setting
        setsize: function(el1, el2) {
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

        updateIndex: function(el, index) {
            $(el).children().eq(index).addClass("active").siblings().removeClass("active");
        },

        play: function(flag) {
            var base = this;
            if ( flag ) {
                iv = setInterval(function() {
                    if ( base.item === base.options.images.length-1 ) {
                        base.updateIndex("#img-container", 0);
                        base.updateIndex("#legend", 0);
                        base.move(base.item, 0);
                        base.item = 0;
                    }
                    else {
                        base.updateIndex("#img-container", base.item+1);
                        base.updateIndex("#legend", base.item+1);
                        base.move(base.item, base.item+1);
                        base.item += 1;
                    }
                }, base.options.pduration);
            }
            else {
                clearInterval(iv);
            }
        },

        // animation effect for changing image indices
        move: function(cur, dest) {
            $("#img-container > img").animate({
                "right": "+=" + 100 * (dest-cur) + "%"
            }, this.options.aduration, this.options.easing);
        },

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
       
        // define slide movements
        function moveLeft() {
            $(".img-number").eq(n-1).css("background-color", "");
            n -= 1;
            if ( n === 0 ) {
                $("#img-container > img").animate({
                    "right": "+=" + 100 * (slider_images.length-1) + "%"
                }, settings.duration, settings.easing);
                $(".img-number").eq(n+slider_images.length-1).css("background-color", "rgba(0,0,0,1)");
                n = slider_images.length;
            }
            else {
                $("#img-container > img").animate({
                    "right": "-=100%"
                }, settings.duration, settings.easing);
                $(".img-number").eq(n-1).css("background-color", "rgba(0,0,0,1)");
            }
        }

        function moveRight() {
            $(".img-number").eq(n-1).css("background-color", "");
            n += 1;
            if ( n === slider_images.length + 1 ) {
                n = 1;
                $("#img-container > img").animate({
                    "right": "-=" + 100 * (slider_images.length-1) + "%"
                }, settings.duration, settings.easing);
                $(".img-number").eq(n-1).css("background-color", "rgba(0,0,0,1)");
            }
            else {
                $("#img-container > img").animate({
                    "right": "+=100%"
                }, settings.duration, settings.easing);
                $(".img-number").eq(n-1).css("background-color", "rgba(0,0,0,1)");
            }
        }

        // function to validate user settings
        function _validate(object) {
            if ( object.legend !== "on" || object.legend !== "off" ) {
                object.legend = "on";
            }
            if ( isNaN(parseInt(object.maxwidth, 10)) || parseInt(object.maxwidth, 10) < 16 || parseInt(object.maxwidth, 10) > 1920 ) {
                object.maxwidth = 800;
            }
            if ( isNaN(parseInt(object.duration, 10)) || parseInt(object.duration, 10) < 1 || parseInt(object.duration, 10) > 10000 ) {
                object.duration = 400;
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
            }
        }

*/