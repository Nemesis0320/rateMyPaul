//DISCLAIMRER: 
//We, Ozer Chagatai and Serguei Fedorov are not responsible for third party modification, repackaging and redistribution of this source code. 
//Please be aware that third party distribution of this extention may contain melicious source code which is beyond our control.

//The source code of RateMyPaul, produced by Ozer Chagatai and Serguei Fedorov does not collect and will never collect student and faculty data protected by FERPA.
//This extention only uses the names of DePaul faculty to produce search results. DePaul faculty names are publicly available both through a guest Campus Connect account
//as well as the public facing DePaul Website.

//The complete source code is available on: https://github.com/ochagata/rateMyPaul
//The master branch contains the source code shipped with the extention

function ClosePopup() {
    if (PopupIsOpen()) {
        $(".RMPDisplayArea").remove();
    }
}

function PopupIsOpen() {
    return $(".RMPDisplayArea").length > 0;
}

 function CreatePopup(result, profName, pageUrl) {
        
 		console.log("opening")

	    //Sudo-Constant Vars (no such thing as constants in JavaScript)
	    var PROFESSOR_NAME_FIELD = /__PROFESSOR_NAME__/g;
	    var OVERALL_QUALITY_FIELD = /__OVERALL_QUALITY__/g;
	    var AVERAGE_GRADE_FIELD = /__AVERAGE_GRADE__/g;
	    var HELPFULNESS_FIELD = /__HELPFULNESS__/g;
	    var CLARITY_FIELD = /__CLARITY__/g;
	    var EASINESS_FIELD = /__EASINESS__/;
	    var LINK_TO_PROFESSOR_PAGE = /__LINK_TO_PROFESSOR_PAGE__/g;
	    var CLOSE_BUTTON = /__CLOSE_BUTTON__/g;
	    var LINK_ICON = /__LINK_ICON__/g;

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