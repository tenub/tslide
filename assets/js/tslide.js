/* refer to easing.js for all available easing options */

;(function ($, window, document, undefined) {

    // setup defaults
    var d = document,
        pluginName = "tslide",
        defaults = {
            dir: "images/",
            images: [],
            pagination: "on",
            autoplay: "on",
            easing: "linear",
            movetime: 500,
            pausetime: 5000
        };

    // instantiate plugin
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

            // cache plugin element in a variable
            var base = this;

            // clear any previously generated html within slider container
            $(base.element).html();

            // check to make sure there are actual images to load
            if ( !base.options.images.length  || !base.options.dir.length ) {
                $(base.element).html("No images loaded! Check image directory name and/or contents.");
                return;
            }

            // validate user options before proceeding
            base.validate(base.options);

            // create image container and append images via array generated from images directory
            var html = "<div id='img-container'/>";
            $(this.element).append(this.generateImages(this.options.images)).find("img").wrapAll(html);

            // set initially active index first image
            $("#img-container").children().eq(0).addClass("active");

            // create and append pagination to slider container if the setting is enabled
            if ( this.options.pagination === "on" ) {

                // store pagination container in our html variable to wrap around image index dots
                html = "<div id='pagination'/>";

                // generate image index dots and provide click functionality 
                $(this.element).append(this.generatePagination(this.options.images)).find(".page-index").click(function(){

                    // store index of currently active image
                    base.active = $("#img-container").children(".active").index();

                    // only animate if the new index is different from the current
                    if ( base.active !== $(this).index() ) {

                        // if autoplay is enabled stop autoplay and wait until animation is complete from clicking an image index before starting again
                        if ( base.options.autoplay === "on" ) {
                            base.play(0);
                        }

                        // call animation effect
                        base.move(base.active, $(this).index());

                        // add active class to selected image index and remove any previous active classes from other indices
                        base.updateIndex("#pagination", $(this).index());
                        base.updateIndex("#img-container", $(this).index());

                        // set image index position after animation to clicked element occurs
                        base.active = $("#img-container").children(".active").index();

                        // if autoplay is enabled restart autoplay after click animation and image index updates have concluded
                        if ( base.options.autoplay === "on" ) {
                            base.play(1);
                        }

                    }

                }).wrapAll(html);

                // set initially active index in pagination
                $("#pagination").children().eq(0).addClass("active");

            }

            // set slider container to height of absolutely positioned image container
            base.resize("#img-container", "#slider");

            // center dynamically generated pagination module horizontally via negative margin
            $("#pagination").css({
                "margin-left" : "-" + $("#pagination").children().length + "em"
            });

            // show pagination module when mouse enters image container, otherwise hide it
            $("#slider").on({
                mouseenter: function() {
                    $("#pagination").slideDown(200);
                },
                mouseleave: function() {
                    $("#pagination").fadeOut(400);
                }
            });

            // play slider if autoplay is enabled in user options
            if ( this.options.autoplay === "on" ) {
                base.play(1);
            }

            // resize slider element and image container
            $(window).resize(function() {
                base.resize("#img-container", "#slider");
            });

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
                    nodeBuffer.push($("<div class='page-index'/>"));
                }
                return nodeBuffer;
            }
        },

        // set height of second element to that of first
        resize: function(el1, el2) {
            var e1 = $(el1);
            var e2 = $(el2);
            //var e1w = e1.width();
            var e1h = e1.height();
            //var r = e1w / e1h;
            //var p = e1.innerWidth() - e1w;
            e2.height(e1h);
        },

        // function to validate user settings
        validate: function (object) {
            if ( object.pagination !== "on" && object.pagination !== "off" ) {
                console.log("pagination of '" + object.pagination + "' is neither on nor off. Defaulting to on.");
                object.pagination = "on";
            }
            if ( object.autoplay !== "on" && object.autoplay !== "off" ) {
                console.log("autoplay of '" + object.autoplay + "' is neither on nor off. Defaulting to on.");
                object.autoplay = "on";
            }
            if ( isNaN(parseInt(object.movetime, 10)) || parseInt(object.movetime, 10) < 1 || parseInt(object.movetime, 10) > 10000 ) {
                console.log("movetime of '" + object.movetime + "' is not between 1 and 10000 ms. Defaulting to 500.");
                object.movetime = 500;
            }
            if ( isNaN(parseInt(object.pausetime, 10)) || parseInt(object.pausetime, 100) < 1 || parseInt(object.pausetime, 10) > 20000 ) {
                console.log("pausetime of '" + object.pausetime + "' is not between 0.1 and 20 s. Defaulting to 5000.");
                object.pausetime = 5000;
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
                console.log("easing of '" + object.easing + "' is not a valid method. Defaulting to linear.");
                object.easing = "linear";
            }
        },

        // update element to active state and reset all other elements
        updateIndex: function(el, index) {
            $(el).children().eq(index).addClass("active").siblings().removeClass("active");
        },

        // autoplay functionality
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