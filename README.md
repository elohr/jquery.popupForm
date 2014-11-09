# Popup Form

jQuery Popup Form takes a regular html form element and converts it into a popup. Open it programmtically, or assign it to an existing link or button. It works on all major browsers (including mobile). You can specify several steps for easier completion. Easily integrate it with external form validation plugins.

## Setup

Add the .js and .css files to your site. Copy the close.png file to the same folder as the .css file.

```html
<link rel="stylesheet" href="css/popupForm.css"/>
<script src="js/jquery.popupForm.min.js"></script>
```

## Usage

### HTML
```html
<button id="btn-movie">Create a Movie</button>

<form action="/popup-form-example.html" id="popupform1" class="popup-form" method="get" >
    <div class="steps-popup">
        <div class="step-one-popup active-step-popup">1</div>
        <div class="step-two-popup">2</div>
    </div>
    
    <div class="steps-container-popup">
        <div class="step-one-container-popup">
            <label for="movie-title">Movie Title</label>
            <input id="movie-title" type="text" name="movie-title" autocomplete="off">
            <label for="rating">Rating (optional)</label>
            <input id="rating" type="text" name="rating" autocomplete="off">
            <button class="button-popup-form normal-button-popup-form next-button-popup" type="button">Next</button>
        </div>

        <div class="step-two-container-popup">
            <label for="director">Director (optional)</label>
            <input id="director" type="text" name="director" autocomplete="off">
            <button class="button-popup-form highlight-button-popup-form">Create Movie</button>
        </div>
    </div>
</form>
```

### js
```js
$('#popupform1').PopupForm({
	openPopupButton: $('#btn-movie')[0],
	formTitle: 'Create a Movie',

	validateStepOne: function (container) {
		// Or used validation plugin, we recommend: http://jqueryvalidation.org/
		if($('#movie-title').val().length > 0) {
			return true;
		} else {
			alert('Movie title is a required field');
			return false;
		}
	},
	submitted: function() {
		console.log('Form just submitted.');
	},
	submitSuccess: function(data) {
		alert('Form submitted successfully.')
	},
	submitFailed: function(xhr) {
		console.log('Form submit failed.')
	},
	closed: function() {
		console.log('Form closed.')
	}
});
```

## Examples, Demo and Documentation
For more examples and documentation go to [elohr.me](http://elohr.me/jquery-popup-form.html)