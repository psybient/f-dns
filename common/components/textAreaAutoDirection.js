import {Lang } from '../utils/lang';
//console.log(Lang)
let isUnicode = Lang.isUnicode;
export const rtl = inputs=>(function () {
	inputs.forEach(d => {
		//console.log(d)
		d.addEventListener('keyup', function (e) {
			if (e.target.classList.contains('uk-text-right'))
				d.classList.remove('uk-text-right');
			//console.log(d.value)
			if (d.value)
				if (isUnicode(d.value)) {
					$(this).css('direction', 'rtl');
				}
				else {
					$(this).css('direction', 'ltr');
				}
			else
				if (isUnicode(d.placeholder)) {
					$(this).css('direction', 'rtl');
				}
				else {
					$(this).css('direction', 'ltr');
				}
		});
	});
})();