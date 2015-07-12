/*! brackets2 */
/**
 * silly textbox/input enhancements written in boredom
 *
 * Version: 0.0.1
 * Requires: plain old javascript
 *
 * Copyright (c) 2015 Vineeth Raj <contact.twn@openmailbox.org
 * Under GPLv3 (http://www.gnu.org/licenses/gpl-3.0.en.html)
 *
 * Thanks to Tim Down, Vishal Monpara
 *
 * todo:
 *  - fix browsers other than chrome
 *  - support ie in the long run (?)
 *  - greasemonkey-ify
 *  - support indentation
 *  - support hard tabs
 *
 */

var map = {
    39: Array( 39,  39, 0), // single quotes   '''
    34: Array( 34,  34, 1), // double quotes   '"'
    91: Array( 91,  93, 0), // square brackets '['
    93: Array( 91,  93, 0), // square brackets ']'
   123: Array(123, 125, 1), // curly  brackets '{'
   125: Array(123, 125, 1), // curly  brackets '}'
    40: Array( 40,  41, 1), // normal brackets '('
    41: Array( 40,  41, 1), // normal brackets ')'
    60: Array( 60,  62, 1), // lt     tag      '<'
    62: Array( 60,  62, 1), // lt     tag      '>'
    96: Array( 96,  96, 0), // tilde           '`'
};

var pos = {
  'LEFT'    : 0,
  'RIGHT'   : 1,
  'MODIFIER': 2,
};

var keymap = {
    8 : 'BACKSPACE', // backspace
    9 : 'TAB'      , // tab
   39 : 'RIGHT'    , // Right
   37 : 'LEFT'     , // Left
};

var tab = new function() {
  this.LENGTH = 4;
  this.STR    = Array(this.LENGTH + 1).join(" ");
};

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
function setCaretPosition(ctrl, pos){
	if(ctrl.setSelectionRange)
	{
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	}
	else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}
/* 02: end */

function typeInTextarea(el, newText) {
  var start = el.selectionStart;
  var end   = el.selectionEnd;

  /* thewisenerd */
  if (!document.queryCommandSupported('insertText')) {
    console.log('insertText queryCommand not supported!');
    return;
  }

  var ev = document.createEvent('TextEvent');
  if (newText == "")
    newText = " "; // placeholder ' ' (space); usually accompanied by delete/bcksp
  ev.initTextEvent('textInput', false, true, null, newText, 9, "en-US");
  el.focus();
  el.setSelectionRange(start, end);
  el.dispatchEvent(ev);
  if (newText != " ") { // if not action delete
    var mapped = map[newText[0].charCodeAt(0)];
    if (
      start == end &&
      newText.length == 2 &&
      newText[0] == String.fromCharCode(mapped[pos.LEFT]) &&
      newText[1] == String.fromCharCode(mapped[pos.RIGHT])
    ){
      /* this is a char pair */
      el.selectionStart = start + 1;
      el.selectionEnd   =   end + 1;
    } else {
      if (
        mapped !== undefined &&
        newText[0] == String.fromCharCode(mapped[pos.LEFT]) &&
        newText[newText.length - 1] == String.fromCharCode(mapped[pos.RIGHT])
      ) {
        /* this is a text selection being wrapped */
        el.selectionStart = start + 1;
        el.selectionEnd   = start + newText.length - 1;
      } else {
        /* not a selection being wrapped */
        /* lose focus, we aren't wrapping */
        setCaretPosition(el, start + newText.length);
      }
    }
    el.focus();
  } else {
    /* delete action */
    /* todo: handle selected text delete/replace */
    /*       or do we even need to? */
  }
}
/* 04: end */

var brackets2 = function (el, event) {

  var modifiers = event.shiftKey;
  var mapped    = map[event.which];
  var text      = getSelectionText();
  var caretptr  = doGetCaretPosition(el);

  if (mapped == undefined) // === ?
    return true;

  /* if modifier required, yet not pressed */
  if (mapped[pos.MODIFIER] == 1) {
    if (!modifiers) {
      return true;
    }
  } else { /* if modifiers not required, yet pressed */
    if (modifiers) {
      return true;
    }
  }

  if (text == "") { /* if empty selection */
    var left  = el.value.substring(caretptr - 1, caretptr);
    var right = el.value.substring(caretptr, caretptr + 1);

    if ((left == "" || left == " ") && (right == "" || right == " ")) {

      el.selectionStart = caretptr;
      el.selectionEnd   = caretptr;

      typeInTextarea(
        el,
        String.fromCharCode(mapped[pos.LEFT]) +
        String.fromCharCode(mapped[pos.RIGHT])
      );

      return false;
    }

    // return true anyways
    return true;
  } /* empty text selection */

  text =
    String.fromCharCode(mapped[pos.LEFT]) +
    text +
    String.fromCharCode(mapped[pos.RIGHT]);

  typeInTextarea(el, text);

  return false;

};

var brackets3 = function(el, event) {
  var caretptr = doGetCaretPosition(el);
  var keycode  = keymap[event.which];

  if(keycode == 'BACKSPACE') {

    var mapped   = map[el.value.substring(caretptr - 1, caretptr).charCodeAt(0)];

    if (mapped !== undefined) {

      var __left  = el.value.substring(caretptr - 2, caretptr - 1);;
      var left    = el.value.substring(caretptr - 1, caretptr - 0);;
      var right   = el.value.substring(caretptr + 0, caretptr + 1);;
      var __right = el.value.substring(caretptr + 1, caretptr + 2);;

      if (
        left  == String.fromCharCode(mapped[pos.LEFT]) &&
        right == String.fromCharCode(mapped[pos.RIGHT]) &&
        (__left == "" || __left == " ") &&
        (__right == "" || __right == " ")
      ) {

        el.selectionStart = caretptr - 1;
        el.selectionEnd   = caretptr + 1;

        el.setSelectionRange(caretptr - 1, caretptr + 1);

        /* we send an empty str */
        typeInTextarea(el, "");

        /* we should return true since we have a BACKSPACE undone */
        //return true;
      }
    } /* mapped !== undefined */

    /* return true if none */
    //return true;
  } else if (keycode == 'TAB') {

    if (getSelectionText() == "") {
      el.selectionStart = caretptr;
      el.selectionEnd   = caretptr;
    }

    typeInTextarea(el, tab.STR);

    return false;
  }

  /* return true by default */
  return true;
};

[].forEach.call(document.querySelectorAll('textarea,input'), function (el) {
  if (typeof el.addEventListener != "undefined") {
      el.addEventListener("keypress", function(event) {
          if (!brackets2(this, event)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
          return true;
      });
      el.addEventListener("keydown", function(event) {
        if (!brackets3(this, event)) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        return true;
      });
  }
  /* ie support ? fuck it. */
  /*
  else if (typeof el.attachEvent != "undefined") { //incase you support IE8
      el.attachEvent("onkeyup", function(event) {
          return brackets2(this, event);
      });
  }
  */
});
