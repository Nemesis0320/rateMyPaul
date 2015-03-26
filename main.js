function main() {
    setInterval(AugmentPage, 3000);
}   //end main()

function CreatePopup(result, profName) {
    if ($("body").find(".RMPDisplayArea").length != 0) {
        $("body").find(".RMPDisplayArea").remove();
    }

    var parsedProfessor = [];
    var hasData = true;

    try {
         parsedProfessor = JSON.parse(result);
    } catch(err){
        hasData = false;
    }

    //Load the template HTML file
    $.get(chrome.extension.getURL("popup.html"), function(html) {

        if (hasData == true) {

            html = html.replace("__PROFESSOR_NAME__", profName);
            html = html.replace("__OVERALL_QUALITY__", parsedProfessor.Grades[0].Rating);
            html = html.replace("__AVERAGE_GRADE__", parsedProfessor.Grades[1].Rating);

            html = html.replace("__HELPFULNESS__", parsedProfessor.Ratings[0].Rating);
            html = html.replace("__CLARITY__", parsedProfessor.Ratings[1].Rating);
            html = html.replace("__EASINESS__", parsedProfessor.Ratings[2].Rating);
        } else {

            var naString = "N/A";

            html = html.replace("__PROFESSOR_NAME__", profName);
            html = html.replace("__OVERALL_QUALITY__", naString);
            html = html.replace("__AVERAGE_GRADE__", naString);

            html = html.replace("__HELPFULNESS__", naString);
            html = html.replace("__CLARITY__", naString);
            html = html.replace("__EASINESS__", naString);
        }
        $("body").append(html);
    });
}

function AugmentPage() {
    if (document.getElementById('ptifrmtgtframe') !== null)
    {
        var iframe = document.getElementById('ptifrmtgtframe');
        var innerDoc   = iframe.contentDocument || iframe.contentWindow.document;
        var cells      = innerDoc.getElementsByClassName('PSLEVEL1GRIDNBONBO');
        var length     = cells.length;
        var professors = [];
        var profCount = 0;

        //This line doesn't work for me. It's always 0 : Serguei
        if(innerDoc.getElementsByClassName("ratingButton").length == 0) {
            $.each(innerDoc.querySelectorAll("span[id ^= 'MTG_INSTR']"), function(index, professor) {
                var profName = $(professor)[0].innerText;
                if (profName != 'Staff') {
                    $(professor).append("'<input class='ratingButton' type='button' value='SHOW RATING' />'").click(function () {

                        var searchProfString = profName.split(" ").join("%20");

                        //Does jQuery really not have a param/arg string?
                        var searchUrl = 'http://www.sergueifedorov.com/rmpapi/search/' + searchProfString;
                        console.log(searchUrl);

                        chrome.runtime.sendMessage({
                                method: "GET",
                                url: searchUrl
                            },
                            function (response) {

                                //Obtain the actual link to the page
                                var searchResult = JSON.parse(response);

                                if (searchResult.length == 0) {
                                    //We don't have any data from the web service
                                    CreatePopup(searchResult, profName);
                                } else {
                                    var pageURL = searchResult[0].URL;

                                    var professorPageURL = 'http://www.sergueifedorov.com/rmpapi/Professor?url=' + pageURL;

                                    chrome.runtime.sendMessage({
                                        method: "GET",
                                        url: professorPageURL
                                    }, function(result) {
                                        CreatePopup(result, profName);
                                    });
                                }
                            });
                    });
                }
            });
        } 
    } 
}

main();