//DISCLAIMRER: 
//We, Ozer Chagatai and Serguei Fedorov are not responsible for third party modification, repackaging and redistribution of this source code. 
//Please be aware that third party distribution of this extention may contain melicious source code which is beyond our control.

//The source code of RateMyPaul, produced by Ozer Chagatai and Serguei Fedorov does not collect and will never collect student and faculty data protected by FERPA.
//This extention only uses the names of DePaul faculty to produce search results. DePaul faculty names are publicly available both through a guest Campus Connect account
//as well as the public facing DePaul Website.

//The complete source code is available on: https://github.com/ochagata/rateMyPaul
//The master branch contains the source code shipped with the extention

//This file relies on:
//LoadingAreaFunctionality.js
//PopupFunctionality.js
//Make sure they are imported


(function() {

    //Entry point
    main();

    function main() {
        setInterval(AugmentPage, 3000);
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
