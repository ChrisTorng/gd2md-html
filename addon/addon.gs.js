/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// *** addon.gs ***
// Google Docs Converter add-on (g2md-html).
// This is the server-side JavaScript.

/**
 * @OnlyCurrentDoc  Limits the script to only accessing the current document.
 */

// We need the UI to add the menu and show the sidebar.
var ui = DocumentApp.getUi();

// Create the add-on menu item.
function onOpen() {
  ui.createAddonMenu()
    .addItem('Sidebar', 'showSidebar')
    .addSeparator()
    .addItem('Subscribe now', 'insertSubscribeNow')
    .addItem('Share this post', 'insertShareThisPost')
    .addItem('Image caption', 'insertImageCaption')
    .addToUi();
}

// When this is installed, call onOpen.
function onInstall() {
  onOpen();
}

// Display sidebar.html.
function showSidebar() {
  var title = GDC_TITLE;
  var html = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle(title)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  ui.showSidebar(html);
}

// This is the main public function the client will call (from sidebar.html).
function convertToMarkdown(config) {
  gdc.init(gdc.docTypes.md);
  // Pass config to conversion function.
  return md.doMarkdown(config);
}

// This is the main public function the client will call (from sidebar.html).
function convertToHTML(config) {
  console.log('convertToHTML');
//  console.log('convertToHTML', config);
  gdc.init(gdc.docTypes.html);
  console.log('gdc.init');

  // Pass config to conversion function.
  return html.doHtml(config);
}

function convertText(text) {
  return text;
}

function insertSubscribeNow() {
  return insertParagraphAtCursor("[[Subscribe now]]");
}

function insertShareThisPost() {
  return insertParagraphAtCursor("[[Share this post]]");
}

function insertImageCaption() {
  return insertAfterSelectedImage("[[Image caption: ]]", -2);
}

function insertParagraphAtCursor(text, cursorPos) {
  if (cursorPos === undefined) {
    cursorPos = 0;
  }

  var doc = DocumentApp.getActiveDocument();
  var cursor = doc.getCursor();
  if (cursor) {
    var element = cursor.getElement();
    while (element !== null && element.getParent() !== null &&
      element.getParent().getType() !== DocumentApp.ElementType.BODY_SECTION) {
      element = element.getParent();
    }
    if (element !== null && element.getParent() !== null) {
      var body = doc.getBody();
      var index = body.getChildIndex(element);
      var paragraph = body.insertParagraph(index + 1, text);
      var position;
      if (cursorPos > 0) {
        position = doc.newPosition(paragraph.getChild(0), cursorPos);
      } else {
        position = doc.newPosition(paragraph.getChild(0), text.length + cursorPos);
      }
      doc.setCursor(position);
      return text + ' inserted.';
    }
    return alert('Cursor not under body section.');
  }
  return alert('No cursor found.');
}

function insertAfterSelectedImage(text, cursorPos) {
  if (cursorPos === undefined) {
    cursorPos = 0;
  }

  var doc = DocumentApp.getActiveDocument();
  var selection = doc.getSelection();

  if (selection) {
    var elements = selection.getSelectedElements();

    if (elements.length === 1) {
      var element = elements[0].getElement();

      if (element.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
        var parent = element.getParent();
        var body = doc.getBody();
        var parentIndex = body.getChildIndex(parent);

        var paragraph = body.insertParagraph(parentIndex + 1, text);

        if (cursorPos > 0) {
          position = doc.newPosition(paragraph.getChild(0), cursorPos);
        } else {
          position = doc.newPosition(paragraph.getChild(0), text.length + cursorPos);
        }
        doc.setCursor(position);
        return text + ' inserted after image.';
      }
    }
  }
  return alert('Please select a single image first.');
}

function alert(message) {
  ui.alert(message);
  return message;
}