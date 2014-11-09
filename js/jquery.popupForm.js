/*
 * jquery.popupForm
 * https://elohr.me/
 *
 * Copyright (c) 2014 elohr
 * Licensed under the MIT license.
 */

function PopupForm(element, options) {
    'use strict';

    var s = {
        previousOverlay: null,

        overlay: window.jQuery('<div/>', {
            class: 'plugin-overlay popup-form-overlay'
        }),

        popup: window.jQuery('<div/>', {
            class: 'popup-form-popup'
        }),

        closeButton: window.jQuery('<img/>', {
            class: 'popup-form-close-icon',
            src: 'http://cdn.getforge.com/elohr.me/1415469529/css/close.png'
        }),

        formTitle: window.jQuery('<h3/>'),

        init: function() {
            // Add Events to DOM Elements
            s.closeButton.click(s.close);
            s.overlay.click(s.close);
            s.popup.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', '.steps-container-popup', s.transitionEnded);
            $(element).children('.steps-popup div').click(s.stepDivClicked);
            $(element).find('.next-button-popup').click(s.nextButtonClicked);
            $(element).on('keydown', 'input, button', s.keyDownInput);

            // Only show title if it is not empty
            if(options.formTitle) {
                s.formTitle = s.formTitle.text(options.formTitle);
                s.popup.prepend(s.formTitle);
            }

            // Append elements to Popup
            s.popup.append(s.closeButton, [element]);

            // Show element (because it is now inside popup and popup is hidden)
            $(element).show();

            // If a custom z-index was specified, assign it to popup and overlay
            if(options.customzindex) {
                s.popup.css('z-index', options.customzindex + 1);
                s.overlay.css('z-index', options.customzindex);
            }

            // Append Popup and Overlay to DOM
            $(document.body).append(s.popup, [s.overlay]);
            
            // Trigger
            options.initialized();
        },

        open: function(event) {
            event.preventDefault();

            // Trigger opening Event
            options.opening();
            s.previousOverlay = $('.plugin-overlay:visible');
            s.previousOverlay.hide();

            s.overlay.show();
            s.popup.addClass('plugin-fade');
            s.adjustStepContainerHeight();
            $(element).children('.steps-container-popup:first').children('.step-one-container-popup:first').children('input:first').focus();

            // Trigger opened Event
            options.opened();
        },

        close: function() {
            // Trigger closing event
            options.closing();

            // Hide Popup
            s.overlay.hide();
            s.previousOverlay.show();
            s.popup.removeClass('plugin-fade');
            s.resetForm();

            // Trigger closed event
            options.closed();
        },

        submit: function(event) {
            event.preventDefault();

            // Trigger submitting event
            if(options.submitting()) {
                $.post(
                    $(element).attr('action'),
                    $(element).serialize(),
                    function(data) {
                        // Trigger submitSuccess event
                        options.submitSuccess(data);
                    }
                ).fail(function(xhr) {
                    // Trigger submitFailed event
                    options.submitFailed(xhr);
                });

                // Trigger submitted event
                options.submitted();

                s.close();
            }
        },

        centerPopup: function() {
            s.popup.css({
                left: ($(window).width() - s.popup.outerWidth()) / 2,
                top: $(options.openPopupButton).offset().top + 24
            });
        },

        adjustStepContainerHeight: function() {
            var currentStep = s.getCurrentStep(),
                stepsContainer = $(element).children('.steps-container-popup:first');

            if(currentStep === 1) {
                stepsContainer.height(stepsContainer.children('.step-one-container-popup:first').height() + 'px');
            } else if(currentStep === 2) {
                stepsContainer.height(stepsContainer.children('.step-two-container-popup:first').height() + 'px');
            } else {
                stepsContainer.height(stepsContainer.children('.step-three-container-popup:first').height() + 'px');
            }

            s.centerPopup();
        },

        getCurrentStep: function() {
            var step = $(element).children('.steps-popup:first').children('.active-step-popup:first');

            if(step.hasClass('step-one-popup')) {
                return 1;
            } else if(step.hasClass('step-two-popup')) {
                return 2;
            }

            return 3;
        },

        moveTo: function(container, goTo) {
            var steps = container.prev();

            container.css('margin-left', (-32) + ((- 350 - 64) * (goTo - 1)) + 'px');
            steps.children('.active-step-popup').removeClass('active-step-popup');

            if(goTo === 1) {
                steps.children('.step-one-popup').addClass('active-step-popup');
            } else if (goTo === 2) {
                steps.children('.step-two-popup').addClass('active-step-popup');
            } else if (goTo === 3) {
                steps.children('.step-three-popup').addClass('active-step-popup');
            }

            s.adjustStepContainerHeight();
        },

        transitionEnded: function() {
            if(s.getCurrentStep() === 1) {
                $(this).children('.step-one-container-popup').children('input:first').focus(); // TODO: Does not work
            } else if(s.getCurrentStep() === 2) {
                $(this).children('.step-two-container-popup').children('input:first').focus();
            } else {
                $(this).children('.step-three-container-popup').children('input:first').focus();
            }
        },

        stepDivClicked: function() {
            var t = $(this),
                goTo = 1,
                isValid = true;

            if(t.hasClass('step-two-popup')) {
                goTo = 2;
            } else if(t.hasClass('step-three-popup')) {
                goTo = 3;
            }

            if(s.getCurrentStep() === 1 && goTo > 1) {
                isValid = options.validateStepOne(t.parent().next().children('.step-one-container-popup'));
            } else if(s.getCurrentStep() === 2 && goTo > 2) {
                isValid = options.validateStepTwo(t.parent().next().children('.step-two-container-popup'));
            }

            if(isValid) {
                s.moveTo(t.parent().next(), goTo);
            }
        },

        nextButtonClicked: function() {
            var currentStepContainer = $(this).parent(),
                stepsContainer,
                isValid;

            if(s.getCurrentStep() === 1) {
                isValid = options.validateStepOne(currentStepContainer);
            } else {
                isValid = options.validateStepTwo(currentStepContainer);
            }

            if(isValid) {
                stepsContainer = currentStepContainer.parent();
                s.moveTo(stepsContainer, (s.getCurrentStep() === 1 ? 2 : 3));
            }
        },

        resetForm: function() {
            var stepsContainer = $(element).children('.steps-container-popup:first');

            stepsContainer.children().each(function() {
                $(this).children('input, textarea').each(function() {
                    $(this).val('');
                });
            });

            stepsContainer.find('.selectable').each(function() {
                $(this).data('Selectable').removeSelection();
            });

            s.moveTo(stepsContainer, 1);
        },

        keyDownInput: function(e) {
            var button;

            if(e.which == 13) { // Enter
                button = $(this).siblings(':last');
                
                if(button.hasClass('next-button-popup')) {
                    e.preventDefault();
                    button.click();
                }
            } else if (e.which == 9 && $(this).nextAll('input, .selectable').length === 0) {
                button = $(this).siblings(':last');
                
                if(button.hasClass('next-button-popup')) {
                    e.preventDefault();
                    button.click();
                }
            }
        }
    };

    // Basic Options
    options = options || {};

    options.formTitle = options.formTitle;
    options.openPopupButton = options.openPopupButton;
    options.customzindex = options.customzindex;

    // Custom Event Callbacks
    options.initialized = options.initialized || function() {};
    options.opening = options.opening || function() {};
    options.opened = options.opened || function() {};
    options.closing = options.closing || function() {};
    options.closed = options.closed || function() {};
    options.submitting = options.submitting || function() { return true; };
    options.submitted = options.submitted || function() {};
    options.submitFailed = options.submitFailed || function() {};
    options.submitSuccess = options.submitSuccess || function() {};
    options.validateStepOne = options.validateStepOne || function() {};
    options.validateStepTwo = options.validateStepTwo || function() {};

    // Setup event capturing
    var events = {
        handleEvent: function(event) {
            switch (event.type) {
                case 'click': this.click(event); break;
            }
        },

        click: function(event) {
            s.open(event);
        }
    };

    s.init();
    options.openPopupButton.addEventListener('click', events, false);
    $(element).submit(s.submit);

    // Expose the API
    return {
        kill: function() {
        },
        submit: s.submit,
        reset: s.resetForm,
        validate: function() {
        },
        open: s.open,
        close: s.close,
        adjustStepContainerHeight: s.adjustStepContainerHeight,
        getCurrentStep: s.getCurrentStep,
        moveTo: s.moveTo
    };
}


if (window.jQuery) {
    (function($) {
        // **********************************
        // ***** Start: Private Members *****
        
        var pluginName = 'PopupForm';
        
        // ***** Fin: Private Members *****
        // ********************************
        

        // *********************************
        // ***** Start: Public Methods *****
        var methods = {
            init: function(options) {
                return this.each(function() {
                    var $this = $(this);
                    var data = $this.data(pluginName);
                    
                    // If the plugin hasn't been initialized yet
                    if (!data){
                        $this.data(pluginName, new PopupForm($(this)[0], options));
                    }
                });
            }
        };

        // ***** Fin: Public Methods *****
        // *******************************


        // *****************************
        // ***** Start: Supervisor *****
        
        $.fn[pluginName] = function( method ) {
            if (methods[method]) {
                return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } else if ( typeof method === 'object' || !method ) {
                return methods.init.apply( this, arguments );
            } else {
                $.error( 'Method ' + method + ' does not exist in jQuery.' + pluginName );
            }
        };

        // ***** Fin: Supervisor *****
        // ***************************
    })(window.jQuery);
}