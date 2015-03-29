//DISCLAIMRER: 
//We, Ozer Chagatai and Serguei Fedorov are not responsible for third party modification, repackaging and redistribution of this source code. 
//Please be aware that third party distribution of this extention may contain melicious source code which is beyond our control.

//The source code of RateMyPaul, produced by Ozer Chagatai and Serguei Fedorov does not collect and will never collect student and faculty data protected by FERPA.
//This extention only uses the names of DePaul faculty to produce search results. DePaul faculty names are publicly available both through a guest Campus Connect account
//as well as the public facing DePaul Website.

//The complete source code is available on: https://github.com/ochagata/rateMyPaul
//The master branch contains the source code shipped with the extention


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