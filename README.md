fixedScroll.js V1.0.0
==========

COMMENTS, QUESTIONS, BUGS? FEEL FREE TO CONTACT AT:

info@carminerumma.it

==========

* 1. [About](#about)
* 2. [Use](#how-to-use)
* 3. [Demo](#demo)
* 4. [Download](#download)
* 5. [License](#license)

### ABOUT

fixedScroll.js allows you to fixedly position different sections of your layout for a specific time
fixedScroll.js is intended for easy use and is fully deployable within minutes. The minified version is under 1KB.

### HOW TO USE

**1** - Download the source & upload it to your server.

**2** - Place the script include file on your page: 

Ex:
 ```html
 <script type="text/javascript" src="../js/fixed-scroll.1.0.0.js"></script>
 ```

**3** - Place this trigger script at bottom of body:

Ex:
```html
<script type="text/javascript">
	$('[data-fixed-section]').fixedScroll();
</script>
```

**4** - Add data-fixed-section attribute to each section element. Add a data-duration to specify the scroll duration for section

Ex:
```html
<div data-fixed-section data-duration="1"></div>
```

**5** - Keep the defaults or easily tweak the settings for a custom fit.

### TWEAKS

fixedScroll.js was built with quick and simple customization in mind. You can easily add some callbacks to retrieve the nested scroll event and scroll percentage

Ex:
```html
<script type="text/javascript">
	$('[data-fixed-section]').fixedScroll({
        onEnter: function(index, $element){ 
            console.log('Section enter', index); 
        },
        onExit: function(index, $element){ 
            console.log('Section exit', index); 
        },
        onScroll: function(index, percentage, $element){ 
            console.log('Section index', index, ' scroll progress: ', percentage); 
            $element.find(".text > span").html("(" + (percentage > 0 ? percentage.toFixed(2) : 0) + "%)");
        }
	});
</script>
```

### DEMO

Download repo and view the demo directory for a basic demo.


### LICENSE

(MIT License)

Copyright (C) 2023 Carmine Rumma

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
