# js-slide-show - simple jQuery SlideShow

## Description

Simple, customizable and small jquery based slideshow.
Supports javascript and/or CSS animation.

## Browser support

Internet Explorer 8 and (almost) anything newer ;)

## Options

Name        | Type        | Default    | Description
:---------- | :---------- | :--------- | :-----------
page        | string      | a          | slider page - html element
arrows      | bool/string | false      | boolean show slider arrows / or slider arrows element id
arrowsClass | string      | slider-arrows | slider arrows parent element class
pager       | bool/string | false      | boolean show slider pagination / or slider pagination element id
pagerClass  | string      | null       | slider pagination parent element class
classActive | string      | null       | the class of the currently displayed slide (when set, it disables the hiding slides via javascript)
classOn     | string      | null       | class of the image to be displayed
classOff    | string      | slide-off  | class of the image to be hidden
effect      | string      | slide      | animation type between slides [slide, drop, toggle]
pause       | int         | 5000       | time between slides
duration    | int         | 1200       | animation time between two slides
blur        | bool/int    | false      | insert image into background for ultrawide monitors

## Usage

```javascript
$("#target").slideShow({page: '.slide'});
```