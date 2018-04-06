(function ($) {
    "use strict";

    var MAX_ITEMS = "maxItems",
        MIN_ITEMS = "minItems",
        DATA_MF_NAME = "data-granite-coral-multifield-name",
        RS_MULTIFIELD = "granite/ui/components/coral/foundation/form/multifield",
        SLING_RES_TYPE = "sling:resourceType",
        MIN = 0,
        MAX = 0;

    $(document).on("dialog-ready", function () {
        addMinMaxCheck();
    });

    function addMinMaxCheck() {
        // http://localhost:4502/apps/AEM63App/components/content/multifield/cq:dialog.infinity.json
        $.ajax(getDialogPath() + ".infinity.json").done(function (data) {
            // data is .content xml data in /apps/AEM63App/components/content/multifield/cq:dialog

            // mfProperties is multifield dialog data after looping in .content xml data from /apps

            var mfProperties = fillItemsOfMultifield(data, mfProperties);
            handleBtn(mfProperties);
            addValidator();
        });
    }

    function handleBtn(mfProperties) {
        var multifield = $("[" + DATA_MF_NAME + "='" + mfProperties.field.name + "']");

        MIN = parseInt(mfProperties[MIN_ITEMS]);
        MAX = parseInt(mfProperties[MAX_ITEMS]);

        // Item count
        var count = getItemLength(multifield);

        var removeButton = $(multifield[0]).find('button.coral-Multifield-remove');
        var addButton = $(multifield[0]).find('[coral-multifield-add]');

        showHideAddButton();

        // Event handler for remove button
        $(removeButton).on('click.button.coral-Multifield-remove', function () {
            count = getItemLength(multifield);
            count--;
            updateDialogUI();
        });

        // Event handler for add button
        $(addButton).click(function () {
            count = getItemLength(multifield);
            count++;
            updateDialogUI();
            setTimeout(
                function () {
                    $(multifield[0]).find('button.coral-Multifield-remove').on('click.button.coral-Multifield-remove', function () {
                        count = getItemLength(multifield);
                        count--;
                        updateDialogUI();
                    });
                }, 200
            )

        });

        // Update dialog ui based on item length
        // Disable add button if item length > max, else enable add button
        function updateDialogUI() {
            // if (count > MAX) {
            //     addButton.attr('disabled', 'disabled');
            // } else {
            //     addButton.removeAttr('disabled');
            // }

            showHideAddButton();
        }

        // Hide add button if the item length = max, else show add button
        function showHideAddButton() {
            if (count == MAX) {
                addButton.hide();
            } else {
                addButton.show();
            }

            if (count == MIN) {
                removeButton.hide();
            } else {
                removeButton.show();
            }
        }

        // Get item length from multifield
        function getItemLength(multifield) {
            return $(multifield[0]).find('coral-multifield-item').length;
        }

        // Hide reorder button
        // $(multifield[0]).find('button.coral-Multifield-move').hide();


    }

    function addValidator() {
        $.validator.register({
            selector: 'input[name=\'./linkText\']',
            validate: function (el) {
                var field,
                    value;

                field = el.closest(".coral-Form-field");
                value = el.val();

                if (_.isEmpty(value)) {
                    return Granite.I18n.get('The field is required"');
                }
            },
            show: function (el, message) {
                var fieldErrorEl,
                    field,
                    error,
                    arrow;

                fieldErrorEl = $("<span class='coral-Form-fielderror coral-Icon coral-Icon--alert coral-Icon--sizeS' data-init='quicktip' data-quicktip-type='error' />");
                field = el.closest(".coral-Form-field");

                field.attr("aria-invalid", "true").toggleClass("is-invalid", true);

                field.nextAll(".coral-Form-fieldinfo").addClass("u-coral-screenReaderOnly");

                error = field.nextAll(".coral-Form-fielderror");

                if (error.length === 0) {
                    arrow = field.closest("form").hasClass("coral-Form--vertical") ? "right" : "top";

                    fieldErrorEl.attr("data-quicktip-arrow", arrow).attr("data-quicktip-content", message).insertAfter(field);
                } else {
                    error.data("quicktipContent", message);
                }
            },
            clear: function (el) {
                var field = el.closest(".coral-Form-field");

                field.removeAttr("aria-invalid").removeClass("is-invalid");

                field.nextAll(".coral-Form-fielderror").tooltip("hide").remove();
                field.nextAll(".coral-Form-fieldinfo").removeClass("u-coral-screenReaderOnly");
            }
        });

        function validate() {
            if (MAX && (count == MAX)) {
                return "Maximum allowed : " + MAX + " items";
            }

            if (MIN && (count == MIN)) {
                return "Minimum required : " + MIN + " items";
            }

            return null;
        }
    }

    // This method is used to get dialog path in /apps from current dialog.
    function getDialogPath() {
        var gAuthor = Granite.author,
            currentDialog = gAuthor.DialogFrame.currentDialog, dialogPath;

        if (currentDialog instanceof gAuthor.actions.PagePropertiesDialog) {
            var dialogSrc = currentDialog.getConfig().src;
            dialogPath = dialogSrc.substring(0, dialogSrc.indexOf(".html"));
        } else {
            var editable = gAuthor.DialogFrame.currentDialog.editable;

            if (!editable) {
                console.log("EAEM - editable not available");
                return;
            }

            dialogPath = editable.config.dialog;
        }

        return dialogPath;
    }

    // This method is used to get multifield data from dialog xml content
    // It checks where the multifield sling resource type is return the multifield xml data in object.
    function fillItemsOfMultifield(data, mfProperties) {
        if (!_.isObject(data) || _.isEmpty(data)) {
            return mfProperties;
        }

        _.each(data, function (value, key) {
            if (_.isObject(value) && !_.isEmpty(value)) {
                mfProperties = fillItemsOfMultifield(value, mfProperties);
            }
            else {
                if ((key == SLING_RES_TYPE) && (value == RS_MULTIFIELD)) {
                    mfProperties = data;
                }
            }
        });

        return mfProperties;
    }
}(jQuery));
