import * as UIkit from 'uikit';
export const ajaxModal = ()=>$(function () {
	//'use strict';
	(function () {
		//document.addEventListener('DOMContentLoaded', function () {
			var DynamicModals = document.querySelectorAll('[data-toggle="ajaxModal"]');
			console.log('Dynamic Modal Buttons found: ' + DynamicModals.length);

			if (DynamicModals.length > 0) {
				DynamicModals.forEach(function (el) {
					el.addEventListener('click', function () {
						var url = el.getAttribute('data-url');
						console.log('AjaxUrl: ' + url);

						// Check if AjaxModal still exists in node
						var AjaxModal = document.getElementById('ajaxModal');
						if (AjaxModal) {
							var modalDiv = AjaxModal;
						}
						// AjaxModal doesn't exist, so we create a new one
						else {
							var modalDiv = document.createElement('div');
							document.body.appendChild(modalDiv);
							modalDiv.id = 'ajaxModal';
							modalDiv.setAttribute("uk-modal", "");
						}
						// Ajax Settings
						// This is my ajax function, You can customize it for your needs
						// I'm using this small library: https://github.com/fdaciuk/ajax

						/*
						ajax({
							headers: {
							'content-type': 'application/json',
							//'ci_csrf_token': Intra.ci_csrf_token()
							}
						})
						ajax().get( url ).then(function (response, xhr) {
							//console.log(response);
							var code		= response.code;
							var modal		= document.getElementById(modalDiv.id);
							console.log(response.code.id);
							modal.innerHTML = code;
							UIkit.modal(modal).show();
						})
			  */

						// Helper function to simulate ajaxCall
						//var code = "<div class='uk-modal-dialog uk-modal-body'><h2 class='uk-modal-title'>Dynamic Modal</h2><button class='uk-button uk-button-default uk-modal-close' type='button'>Close</button></div>";
						var code = `<div class='uk-modal-dialog uk-modal-body'><h2 class='uk-modal-title'> ایجاد نود</h2><button class='uk-button uk-button-default uk-modal-close' type='button'>Close</button>
				  <button id="openModal" class="uk-button">Unique search</button>
				  </div>
				  `
						var modal = document.getElementById(modalDiv.id);
						modal.innerHTML = code;
						UIkit.modal(modal).show();
					})
				});
			}
		//});
	}());
});