import { InitiateJsGrid, ShowJsGrid } from './jsgrid';
import { GetMemos } from './memoGenerator';
import '../scss/main.scss';
import '../favicon.ico';

function importAll(r) {
    return r.keys().map(r);
}

importAll(require.context('../img', false, /\.(png|jpe?g|svg)$/));

$(document).ready(() => {
    window.history.replaceState(null, null, window.location.href);
});

$(window).on("load", async () => {
    $("#showAnswer").focus();

    $("#questionArea,#answerArea").focus(() => {
        $(".update-group").css("visibility", "visible");
    });

    $("#questionArea,#answerArea").blur(() => {
        if ($(".update-group:hover").length === 0) {
            $(".update-group").css("visibility", "hidden");
        }
    });

    $("#replaceMemos").click(() => {
        let question = $("#questionArea").val();
        let answer = $("#answerArea").val();
        $("#questionArea").val(answer);
        $("#answerArea").val(question);
    });

    let mode = $.cookie("mode") == 'Repeat' ? 'Learn' : 'Repeat'
    $("#switchModeButton").attr('href', `/Home/Mode/${mode}`);
    $("#switchModeButton").text(mode);

    /////////////////modals

    $(window).click((event) => {
        if ($(".navbar-collapse").hasClass("show") && !$(event.target).hasClass("navbar-toggler")) {
            $("button.navbar-toggler").click();
        }
        $(".alert").hide();
    });

    $("#addModal").on("hidden.bs.modal", (event) => {
        $(event.target).find(".modal-body > textarea").val("");
    });

    $("#findNewMemo").click(() => {
        let key = $("#findKey").val();
        let value = $("#findValue").val();

        ShowJsGrid(
            async (filter) => await asyncGet(`/Home/Find/${key}/${value}`),
            (memo) => { asyncPost("/Home/Add", memo); },
            (memo) => { asyncPost("/Home/Update", memo); },
            (memo) => { asyncPost("/Home/Delete/" + memo.id); });

        $("#findModal").find(".modal-dialog").css("max-width", "90%");
    });

    $("#submitNewMemo").click(async () => {
        let body = {
            question: $("#addQuestionArea").val(),
            answer: $("#addAnswerArea").val()
        }

        let result = await asyncPost("/Home/Add", body);
        showMessage(result);

        $("#addModal").modal('hide');
    });

    $("#findModal").on("hidden.bs.modal", (event) => {
        $("#findKey").val("");
        $("#findValue").val("");
        if ($("#jsGrid").children().length > 0)
            $("#jsGrid").jsGrid("destroy");
        $(event.target).find(".modal-dialog").css("max-width", "");
    });

    /////////////////memoUpdate

    $(".lds-ellipsis").css("visibility", "visible");

    const { count, memosGenerator } = await GetMemos();
    let currentMemo = await NextMemo(memosGenerator);

    $(".lds-ellipsis").css("visibility", "hidden");

    $('[name="answer"]').click(async (event) => {
        event.preventDefault();

        let body = {
            id: currentMemo._id,
            answer: $(event.target).val()
        };

        let result = await asyncPost("/Home/SubmitAnswer", body)
        if (result == 'OK') {
            currentMemo = await NextMemo(memosGenerator);
        }
    });

    $("#overall").text(count);

    $("#showAnswer").click(() => {
        $("#answerArea").val(currentMemo.answer);
        $("#answerForm").css("visibility", "visible");
        $("input[value=Cool]").focus();
    });

    $("#updateButton").click(async (event) => {
        event.preventDefault();

        let newQuestion = $("#questionArea").val();
        let newAnswer = $("#answerArea").val();
        currentMemo.question = newQuestion ? newQuestion : currentMemo.question;
        currentMemo.answer = newAnswer ? newAnswer : currentMemo.answer;

        let result = await asyncPost("/Home/Update", currentMemo);
        showMessage(result);

        $(".update-group").css("visibility", "hidden");
    });

    $("#deleteButton").click(async (event) => {
        event.preventDefault();

        let result = await asyncPost(`/Home/Delete/${currentMemo._id}`);
        showMessage(result);

        currentMemo = await NextMemo(memosGenerator);
    });

    InitiateJsGrid();
});

function showMessage(response) {
    $("#message").text(response);
    let className = !response.startsWith("Error") ? "alert-success" : "alert-danger";
    $(".alert").addClass(className);
    $(".alert").show();
}

function finish(mode) {
    $(".summary").css("visibility", "hidden");
    $("#finishMessage").text(mode);
    $("#finishModal").modal();
}

async function NextMemo(memosGenerator) {
    $("#answerArea").val('');
    $("#questionArea").val('');
    $("#answerForm").css("visibility", "hidden");

    let nextMemo = await memosGenerator.next();
    if (!nextMemo.value) {
        finish("Repeat");
        return;
    }

    let currentMemo = nextMemo.value;
    $("#questionArea").val(currentMemo.question);
    $("#level").text(currentMemo.postponeLevel);
    $("#scores").text(currentMemo.scores);
    let overall = $("#overall").text();
    $("#overall").text(overall != 0 ? --overall : overall);

    return currentMemo;
}

async function asyncPost(url, data) {
    let result;
    try {
        $(".lds-ellipsis").css("visibility", "visible");

        result = await $.ajax({
            url: url,
            type: "POST",
            data: data
        });

        console.log(result);
        return result;

    } catch (error) {
        console.error(error);
        return error.responseText;
    }
    finally {
        $(".lds-ellipsis").css("visibility", "hidden");
    }
}

async function asyncGet(url) {
    let result;
    try {
        result = $.ajax({
            url: url,
            type: "GET"
        });
        return result;
    } catch (error) {
        console.error(error);
        return error.responseText;
    }
}