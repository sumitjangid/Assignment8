$(document).ready(function() {
    "use strict";

    $.ajax({
            type: "get",
            url: "/top",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
          })
        .done(function(data, status) {
            var i = 0;
            while(i<data.length){
                $(".toplinks").append("<a href='" + data[i].longurl + "' target='_blank'>" + data[i].longurl + "</a><br>");
                i++;
                }
        })
        .fail(function(data, status) {
            console.log("Failed");
        });

    $("#button").click(function() {
        var url = $("#url").val().trim();
        if (url === "") {
            alert("Please enter url in text box");
        } else {
            var UserUrl = JSON.stringify({
                ogurl: url
            });
            $.ajax({
                    type: "POST",
                    url: "/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: UserUrl
                })
                .done(function(data, status) {
                    $("#link").html("");
                    $("#link").append("<a href=" + data.url + ">" + data.url + "</a>");
                })
                .fail(function(data, status) {
                    console.log("Failed");
                });
        }
    });
});