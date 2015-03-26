(function() {

    console.log("here");

    main();

    //Sudo-Constant Vars (no such thing as constants in JavaScript)
    var PROFESSOR_NAME_FIELD = "__PROFESSOR_NAME__";
    var OVERALL_QUALITY_FIELD = "__OVERALL_QUALITY__";
    var AVERAGE_GRADE_FIELD = "__AVERAGE_GRADE__";
    var HELPFULNESS_FIELD = "__HELPFULNESS__";
    var CLARITY_FIELD = "__CLARITY__";
    var EASINESS_FIELD = "__EASINESS__";

    function main() {
        setInterval(AugmentPage, 3000);
    } //end main()

    function CreatePopup(result, profName) {
        

        var parsedProfessor = [];
        var hasData = true;

        //Not a big fan of try catches but this seems to be the only way: Serguei
        try {
            parsedProfessor = JSON.parse(result);
        } catch (err) {
            hasData = false;
        }

        //Remove the loading animation if it's showing
        if ($(".LoadingArea").length > 0) {
            $(".LoadingArea").remove();
        }

        //Load the template HTML file
        $.get(chrome.extension.getURL("popup.html"), function(html) {

            if (hasData == true) {

                html = html.replace(PROFESSOR_NAME_FIELD, profName);
                html = html.replace(OVERALL_QUALITY_FIELD, parsedProfessor.Grades[0].Rating);
                html = html.replace(AVERAGE_GRADE_FIELD, parsedProfessor.Grades[1].Rating);

                html = html.replace(HELPFULNESS_FIELD, parsedProfessor.Ratings[0].Rating);
                html = html.replace(CLARITY_FIELD, parsedProfessor.Ratings[1].Rating);
                html = html.replace(EASINESS_FIELD, parsedProfessor.Ratings[2].Rating);
            } else {

                var naString = "N/A";

                html = html.replace(PROFESSOR_NAME_FIELD, profName);
                html = html.replace(OVERALL_QUALITY_FIELD, naString);
                html = html.replace(AVERAGE_GRADE_FIELD, naString);

                html = html.replace(HELPFULNESS_FIELD, naString);
                html = html.replace(CLARITY_FIELD, naString);
                html = html.replace(EASINESS_FIELD, naString);
            }
            $("body").append(html);
        });
    }

    function ProcessSearchResults(response, popupDelegate, professorName) {
        //Obtain the actual link to the page
        var searchResult = JSON.parse(response);

        if (searchResult.length == 0) {
            //We don't have any data from the web service
            popupDelegate(searchResult, professorName);

        } else {
            var pageURL = searchResult[0].URL;
            var professorPageURL = 'http://www.sergueifedorov.com/rmpapi/Professor?url=' + pageURL;

            chrome.runtime.sendMessage({
                method: "GET",
                url: professorPageURL
            }, function(result) {
                popupDelegate(result, professorName);
            });
        }
    }

    function AugmentPage() {
        if (document.getElementById('ptifrmtgtframe') !== null) {
            var iframe = document.getElementById('ptifrmtgtframe');
            var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            //This line doesn't work for me. It's always 0 : Serguei
            if (innerDoc.getElementsByClassName("ratingButton").length == 0) {
                $.each(innerDoc.querySelectorAll("span[id ^= 'MTG_INSTR']"), function(index, professor) {
                    var profName = $(professor)[0].innerText;
                    if (profName != 'Staff') {
                        $(professor).append("'<input class='ratingButton' type='button' value='SHOW RATING' />'").click(function() {

                            //Having spaces in between names can create issues for HTTP GET.
                            //format them properly
                            var searchProfString = profName.split(" ").join("%20");

                            //Does jQuery really not have a param/arg string?
                            var searchUrl = 'http://www.sergueifedorov.com/rmpapi/search/' + searchProfString;

                            if ($("body").find(".RMPDisplayArea").length != 0) {
                                $("body").find(".RMPDisplayArea").remove();
                            }

                            $.get(chrome.extension.getURL("loading.html"), function(html) {
                                $("Body").append(html);
                                $(".LoadingArea").append("<img src='" +  chrome.extension.getURL('loading.GIF') + "'/>")
                            });

                            chrome.runtime.sendMessage({
                                    method: "GET",
                                    url: searchUrl
                                },
                                function(response) {
                                    ProcessSearchResults(response, CreatePopup, profName);
                                });
                        });
                    }
                });
            }
        }
    }
})();