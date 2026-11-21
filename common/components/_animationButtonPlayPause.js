import { $_ } from "../utils/create.dom";
// const SPACE = 50
export const initDownloadButton = async function(element, id, title, initialDelay = 1000) {
        const textConteiner = Array(60);
        // for (let i = 0; i < SPACE; i++) {
        //     textConteiner[i] = '\u00A0';
        // }
        for (let ch in title) {
            textConteiner[ch] = title[ch]
        }
        //console.log(textConteiner);
        var markup = `  
    <div id = "${id}" class="download-btn_conteiner">
    <div class="download-btn">
    <div class="btn__circle"> <svg width="40" height="40"> 
    <circle r="15" cx="20" cy="20"
            class='download' stroke-width="4" />
    </circle>
    <circle class="bar" stroke-width="4" r="15" cx="20" cy="20" fill="transparent" stroke ='red' stroke-dasharray="565.48" stroke-dashoffset="565.48"></circle>
    </svg>
    </div>
    <div class="btn__arrow btn--icon"><i class="" uk-icon="icon:download; ratio: 1.2" aria-hidden="true"></i></div>
    <div class="btn__stop btn--icon"><i class="" uk-icon="icon:more; ratio: 1.2" aria-hidden="true"></i></div>
    <div class="btn__done btn--icon"><i class="" uk-icon="icon:check; ratio: 1.2" aria-hidden="true"></i></div>
    </div>    
    ${title ? `<span class="uk-uk-text-secondary">${textConteiner.join("")}</span>` : ``}

    </div>
    `;
    //await $_.pause(initialDelay).then(() => { element.innerHTML += markup; });
    element.innerHTML += markup;
    //console.log("after");
    var isPlaying = false;
    return (promise) => {
        //animation trigger on click and continues as long as sent promise took time to resolves
        return (async function () {///$(".download-btn").click(async function () {
            if (isPlaying === true) {
                return Promise.resolve("Playing");
            }
            isPlaying = true;
            $("#" + id + " .download").toggleClass("download--animate");
            $("#" + id + " .bar").toggleClass("bar--animate");
            $("#" + id + " .btn__arrow").toggleClass("btn__arrow--animate");
            await promise();
            $("#" + id + " .btn__stop").toggleClass("btn__stop--animate");
            $("#" + id + " .btn__done").toggleClass("btn__done--animate");
            return await $_.pause(6000).then(() => { // RESET ALL EXEPT FOR .bar--animate 
                isPlaying = false;
                $("#" + id + " .download").toggleClass("download--animate");
                //$(".bar").toggleClass("bar--animate");
                $("#" + id + " .btn__arrow").toggleClass("btn__arrow--animate");
                $("#" + id + " .btn__stop").toggleClass("btn__stop--animate");
                $("#" + id + " .btn__done").toggleClass("btn__done--animate");
                return Promise.resolve("Done");
            })
        })();
    };
}