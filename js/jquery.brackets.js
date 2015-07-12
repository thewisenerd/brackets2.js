/*!jQuery brackets*/
/**
 * silly textbox/input enhancements written in boredom
 *
 * Version: 0.0.1
 * Requires: jQuery v2.1+ (?)
 *
 * Copyright (c) 2015 Vineeth Raj <contact.twn@openmailbox.org
 * Under GPLv3 (http://www.gnu.org/licenses/gpl-3.0.en.html)
 *
 * Thanks to Tim Down, Erik Pukinskis, Vishal Monpara
 *
 * todo:
 *  - fix browsers other than chrome
 *  - support ie in the long run?
 *  - greasemonkey-ify ?
 *
 */

/* 01: Tim Down : http://stackoverflow.com/a/5379408 */
function getSelectionText() {
  var text = "";
  if (window.getSelection) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
  }
  return text;
}
/* 01: end */

/* 02: Vishal Monpara: http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea */
function doGetCaretPosition (ctrl) {
	var CaretPos = 0;	// IE Support
	if (document.selection) {
	ctrl.focus ();
		var Sel = document.selection.createRange ();
		Sel.moveStart ('character', -ctrl.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else if (ctrl.selectionStart || ctrl.selectionStart == '0')
		CaretPos = ctrl.selectionStart;
	return (CaretPos);
}
/* 02: end */

/* 04: Erik Pukinskis: http://stackoverflow.com/a/29862280 */
/* modifications: thewisenerd: 12jul2015:0521 */
function typeInTextarea(el, newText) {
  var start = el.prop("selectionStart");
  var end = el.prop("selectionEnd");

  /* thewisenerd */
  if (document.queryCommandSupported('insertText')) {
    var ev = document.createEvent('TextEvent');
    if (newText == "")
      newText = " "; // placeholder ' ' (space)
    ev.initTextEvent('textInput', false, true, null, newText, 9, "en-US");
    el.focus();
    el.get(0).setSelectionRange(start, end);
    el.get(0).dispatchEvent(ev);
    if (newText != " ") { // if ! placeholder ' ' (space)
      el.prop("selectionStart", start + 1);
      el.prop("selectionEnd",   end + 1);
      el.focus();
    }
  } else {
  /* thewisenerd: end */
    var text = el.val();
    var before = text.substring(0, start);
    var after  = text.substring(end, text.length);
    el.val(before + newText + after);
    /* el[0].selectionStart = el[0].selectionEnd = start + newText.length; */
    /* thewisenerd : */
    el[0].selectionStart = start;
    el[0].selectionEnd = start + newText.length;
    /* thewisenerd: end */
    el.focus();
  }
}
/* 04: end */

/* brackets: begin */
var map = {
  39:  Array(39,   39, 0), // single quotes
  34:  Array(34,   34, 1), // double quotes
  91:  Array(91,   93, 0), // square brackets
  123: Array(123, 125, 1), // curly  brackets
  40:  Array(40,   41, 0), // normal brackets
  60:  Array(60,   62, 1), // lt     tag
  96:  Array(96,   96, 0), // tilde
};

var pos = {
  'LEFT'    : 0,
  'RIGHT'   : 1,
  'MODIFIER': 2,
};

var key = {
  'BACKSPACE' : 8, // backspace
  'TAB'       : 9, // tab
};

(function (factory) {
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $('input,textarea').keypress(function (event) {
    var modifiers = event.shiftKey;
    var mapped    = map[event.which];

    var text = getSelectionText();
    if (text == "") {
      if (mapped == undefined) {
        return true;
      } else {
        var caretptr = doGetCaretPosition(this);
        var left  = $(this).val().substring(caretptr - 1, caretptr);;
        var right = $(this).val().substring(caretptr, caretptr + 1);;
        if ((left == "" || left == " ") && (right == "" || right == " ")) {

          this.selectionStart = caretptr;
          this.selectionEnd   = caretptr;

          typeInTextarea(
            $(this),
            String.fromCharCode(mapped[pos.LEFT]) +
            String.fromCharCode(mapped[pos.RIGHT])
          );

          return false;
        }
      } /* mapped != undefined */

      // return true anyways
      return true;
    }

    if (mapped == undefined) {
      return true;
    }

    // if we get a keypress that involves shift, however shift wasn't pressed
    if (!modifiers) {
      if (mapped[pos.MODIFIER] == 1) {
        return true;
      }
    }

    text =
      String.fromCharCode(mapped[pos.LEFT]) +
      text +
      String.fromCharCode(mapped[pos.RIGHT]);

    typeInTextarea($(this), text);

    return false;
  }).keydown( function(event) {
    if(event.which == key.BACKSPACE) {
      var caretptr = doGetCaretPosition(this);
      var chr      = $(this).val().substring(caretptr - 1, caretptr).charCodeAt(0);;
      var mapped   = map[chr];

      if (mapped == undefined) {
        return true;
      }

      var __left  = $(this).val().substring(caretptr - 2, caretptr - 1);;
      var left    = $(this).val().substring(caretptr - 1, caretptr - 0);;
      var right   = $(this).val().substring(caretptr + 0, caretptr + 1);;
      var __right = $(this).val().substring(caretptr + 1, caretptr + 2);;

      if (
        left  == String.fromCharCode(mapped[pos.LEFT]) &&
        right == String.fromCharCode(mapped[pos.RIGHT]) &&
        (__left == "" || __left == " ") &&
        (__right == "" || __right == " ")
      ) {

        this.selectionStart = caretptr - 1;
        this.selectionEnd   = caretptr + 1;

        this.setSelectionRange(caretptr - 1, caretptr + 1);

        /* we send an empty str */
        typeInTextarea($(this), "");

        /* we should return true since we have a BACKSPACE undone */
        //return false;
      }

      /* return true if none */
      return true;
    }
  });

}));
