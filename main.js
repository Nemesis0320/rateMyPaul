(function() {

    //Entry point
    main();

    //Sudo-Constant Vars (no such thing as constants in JavaScript)
    var PROFESSOR_NAME_FIELD = "__PROFESSOR_NAME__";
    var OVERALL_QUALITY_FIELD = "__OVERALL_QUALITY__";
    var AVERAGE_GRADE_FIELD = "__AVERAGE_GRADE__";
    var HELPFULNESS_FIELD = "__HELPFULNESS__";
    var CLARITY_FIELD = "__CLARITY__";
    var EASINESS_FIELD = "__EASINESS__";
    var LINK_TO_PROFESSOR_PAGE = "__LINK_TO_PROFESSOR_PAGE__";
    var CLOSE_BUTTON = "__CLOSE_BUTTON__";
    var LINK_ICON = "__LINK_ICON__";

    function main() {
        setInterval(AugmentPage, 3000);
    }

    function CloseLoadingArea() {
        if ($(".LoadingArea").length > 0) {
            $(".LoadingArea").remove();
        }
    }

    function CreateLoadingArea() {
        if ($(".LoadingArea").length == 0) {
            $.get(chrome.extension.getURL("loading.html"), function (html) {
                $("Body").append(html);
                $(".LoadingArea").append("<img src='" + chrome.extension.getURL('loading.GIF') + "'/>")
            });
        }
    }

    
    function ClosePopup() {
        if (PopupIsOpen()) {
            $(".RMPDisplayArea").remove();
        }
    }

    function PopupIsOpen() {
        return $(".RMPDisplayArea").length > 0;
    }

    function ProfessorNameStillOnPage(professorName, documentToSearch)
    {
        var professorFound = false;
        $.each(documentToSearch.querySelectorAll("span[id ^= 'MTG_INSTR']"), function(index, professor) {
            var compareToProfessor = $(professor)[0].innerText;
            compareToProfessor = compareToProfessor.replace(/'/g, "");

            if (professorName === compareToProfessor) {
                professorFound = true;
                return false; //Returns out of the the each loop
            }
        });

        return professorFound;
    }

    function CreatePopup(result, profName, pageUrl) {
        
        var parsedProfessor = null;
        var hasData = true;

        try {
            parsedProfessor = JSON.parse(result);
        } catch (err) {
            hasData = false;
        }

        //Remove the loading animation if it's showing
        ClosePopup();

        //If the user keeps clicking, it will open multiple display areas on top of each other
        CloseLoadingArea();

        //Load the template HTML file
        $.get(chrome.extension.getURL("popup.html"), function(html) {

            html = html.replace(CLOSE_BUTTON, chrome.extension.getURL('close.png'));
            html = html.replace(LINK_ICON, chrome.extension.getURL('link.png'));

            if (hasData == true) {

                html = html.replace(PROFESSOR_NAME_FIELD, profName);
                html = html.replace(OVERALL_QUALITY_FIELD, parsedProfessor.Grades[0].Rating);
                html = html.replace(AVERAGE_GRADE_FIELD, parsedProfessor.Grades[1].Rating);

                html = html.replace(HELPFULNESS_FIELD, parsedProfessor.Ratings[0].Rating);
                html = html.replace(CLARITY_FIELD, parsedProfessor.Ratings[1].Rating);
                html = html.replace(EASINESS_FIELD, parsedProfessor.Ratings[2].Rating);

                html = html.replace(LINK_TO_PROFESSOR_PAGE, "http://www.ratemyprofessors.com" + pageUrl);

            } else {

                var naString = "N/A";

                html = html.replace(PROFESSOR_NAME_FIELD, profName);
                html = html.replace(OVERALL_QUALITY_FIELD, naString);
                html = html.replace(AVERAGE_GRADE_FIELD, naString);

                html = html.replace(HELPFULNESS_FIELD, naString);
                html = html.replace(CLARITY_FIELD, naString);
                html = html.replace(EASINESS_FIELD, naString);

                html = html.replace(LINK_TO_PROFESSOR_PAGE, "");
            }
            $("body").append(html);
        });
    }

    function ProcessSearchResults(response, popupDelegate, professorName) {
        //Obtain the actual link to the page
        var searchResult = JSON.parse(response);

        if (searchResult.length == 0) {
            //We don't have any data from the web service
            popupDelegate(searchResult, professorName, "");

        } else {
            var pageURL = searchResult[0].URL;
            var professorPageURL = 'http://www.sergueifedorov.com/rmpapi/Professor?url=' + pageURL;

            chrome.runtime.sendMessage({
                method: "GET",
                url: professorPageURL
            }, function(result) {
                popupDelegate(result, professorName, pageURL);
            });
        }
    }

    function AugmentPage() {
        if (document.getElementById('ptifrmtgtframe') !== null) {

            var iframe = document.getElementById('ptifrmtgtframe');
            var innerDoc = iframe.contentDocument || iframe.contentWindow.document;

            //Close out the popup if the professor's name is no longer there (the search has been updated or you nagivated somewhere else)
            if (PopupIsOpen()) {
                if (ProfessorNameStillOnPage($(".ProfessorName")[0].innerText, innerDoc) == false)
                {
                    ClosePopup();
                }
            }

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

                            ClosePopup();
                            CreateLoadingArea();
                            

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
