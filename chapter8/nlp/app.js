window.onload = function () {
  var _lexer, _trie, dict;

  var clock = 0;
  var deviceId = 0;
  var open = false;

  _lexer = new Geng.lexer();
  _trie = new Geng.trie();

  dict = ['晚上', '八点', '打开', '开启', '电暖'];
  _trie.init(dict);

  document.getElementById('dict').innerText = dict.toString();

  _lexer.addRule(/晚上/, function () {
    clock = clock + 12;
  });

  _lexer.addRule(/八点/, function () {
    clock = clock + 8;
  });

  _lexer.addRule(/开启|打开/, function () {
    open = true;
  });

  _lexer.addRule(/电暖气|电暖|暖气/, function () {
    deviceId = 1;
  });

  var test_words = '晚上八点打开电暖气';
  var words = _trie.splitWords(test_words);

  function devices(id) {
    this.deviceId = id;
  }

  devices.prototype.openAt = function (clock) {
    console.log("Device " + this.deviceId + " will open at" + clock);
  };

  words.forEach(function (word) {
    _lexer.setInput(word);
    _lexer.lex();
  });

  if (open) {
    var device = new devices(deviceId);
    device.openAt(clock);
  }
};
