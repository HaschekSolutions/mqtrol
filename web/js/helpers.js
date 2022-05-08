function nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function isJson(str) {
    try {
        const obj = JSON.parse(str);
        if (obj && typeof obj === `object`) {
          return true;
        }
      } catch (err) {
        return false;
      }
     return false;
  }