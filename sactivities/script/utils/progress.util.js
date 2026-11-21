import UIkit from 'uikit';
export function initProgressBar(cb) {
    //console.log("document loaded");
    UIkit.util.ready(function () {

        var bar = document.getElementById('js-progressbar');
       

        var animate = setInterval(function () {

            bar.value += 33.333;

            if (bar.value >= bar.max) {
                clearInterval(animate);
                $('.report-loader').addClass('loaded');
                return cb ? cb() : '';
            }

        }, 1000);

    });

    // This could controll time line switch at the header
    // const switches = document.querySelectorAll('.js-year-switcher');
    // for (let switchee of switches) {
    //     $on(switchee, 'click', (e) => switchTabs(e.currentTarget));
    // }
}
