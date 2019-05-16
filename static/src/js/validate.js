$.validator.addMethod(
    "regex",
    function (value, element, regexp) {
        var re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
    },
    "Please check your email"
);

$(window).on("load", () => {
    validate("#register-form", {
        login: {
            required: true,
            regex: "^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$",
            minlength: 6,
            maxlength: 100,
        },
        password: {
            required: true,
            minlength: 5,
            maxlength: 100
        },
        confirmpassword: {
            equalTo: "#password"
        }
    });

    validate("#login-form", {
        login: {
            required: true,
            regex: "^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$",
            minlength: 6,
            maxlength: 100,
        },
        password: {
            required: true,
            minlength: 5,
            maxlength: 100
        },
    });
});

function validate(form, rules) {
    $(form).validate({
        rules: rules,
        messages: {
            login: {
                required: "Please provide a login",
                minlength: "Your login must be at least 6 characters long",
                maxlength: "Your login is too long"
            },
            password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 5 characters long",
                maxlength: "Your password is too long"
            },
            confirmpassword: {
                equalTo: "Please enter the same password as above"
            }
        },
        errorPlacement: function (error, element) {
            var name = $(element).attr("name");
            var $obj = $("#" + name + "_validate");
            $(error).addClass("error-box error");
            if ($obj.length) {
                error.appendTo($obj);
            } else {
                error.insertAfter(element);
            }
        },
    });
}