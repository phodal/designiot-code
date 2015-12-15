(function (root, undefined) {

  "use strict";

//(The MIT License)
//
//Copyright (c) by Tolga Tezel tolgatezel11@gmail.com
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
//	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// keys we use to serialize a classifier's state

  var defaultTokenizer = function (text) {
    //remove punctuation from text - remove anything that isn't a word char or a space
    var rgxPunctuation = /[^\w\s]/g;
    var sanitized = text.replace(rgxPunctuation, ' ');
    return sanitized.split(/\s+/);
  };

  var ChineseTokenizer = function (text) {
    //remove punctuation from text - remove anything that isn't a word char or a space
    return text.split(/\s+/);
  };

  /**
   * Naive-Bayes Classifier
   *
   * This is a naive-bayes classifier that uses Laplace Smoothing.
   *
   * Takes an (optional) options object containing:
   *   - `tokenizer`  => custom tokenization function
   *
   */
  function Bayes(options) {
    // set options object
    this.options = {};
    if (typeof options !== 'undefined') {
      if (!options || typeof options !== 'object' || Array.isArray(options)) {
        throw new TypeError('Bayes got invalid `options`: `' + options + '`. Pass in an object.');
      }
      this.options = options;
    }

    this.tokenizer = this.options.tokenizer || defaultTokenizer;

    if (this.options.tokenizer === "Chinese") {
      this.tokenizer = ChineseTokenizer;
    }

    //initialize our vocabulary and its size
    this.vocabulary = {};
    this.vocabularySize = 0;

    //number of documents we have learned from
    this.totalDocuments = 0;

    //document frequency table for each of our categories
    //=> for each category, how often were documents mapped to it
    this.docCount = {};

    //for each category, how many words total were mapped to it
    this.wordCount = {};

    //word frequency table for each category
    //=> for each category, how frequent was a given word mapped to it
    this.wordFrequencyCount = {};

    //hashmap of our category names
    this.categories = {};
  }

  /**
   * Initialize each of our data structure entries for this new category
   *
   * @param  {String} categoryName
   */
  Bayes.prototype.initializeCategory = function (categoryName) {
    if (!this.categories[categoryName]) {
      this.docCount[categoryName] = 0;
      this.wordCount[categoryName] = 0;
      this.wordFrequencyCount[categoryName] = {};
      this.categories[categoryName] = true;
    }
    return this;
  };

  /**
   * train our naive-bayes classifier by telling it what `category`
   * the `text` corresponds to.
   *
   * @param  {String} text
   * @param  {String} class
   */
  Bayes.prototype.learn = function (text, category) {
    var self = this;

    //initialize category data structures if we've never seen this category
    self.initializeCategory(category);

    //update our count of how many documents mapped to this category
    self.docCount[category]++;

    //update the total number of documents we have learned from
    self.totalDocuments++;

    //normalize the text into a word array
    var tokens = self.tokenizer(text);

    //get a frequency count for each token in the text
    var frequencyTable = self.frequencyTable(tokens);

    /*
     Update our vocabulary and our word frequency count for this category
     */

    Object
      .keys(frequencyTable)
      .forEach(function (token) {
        //add this word to our vocabulary if not already existing
        if (!self.vocabulary[token]) {
          self.vocabulary[token] = true;
          self.vocabularySize++;
        }

        var frequencyInText = frequencyTable[token];

        //update the frequency information for this word in this category
        if (!self.wordFrequencyCount[category][token]) {
          self.wordFrequencyCount[category][token] = frequencyInText;
        } else {
          self.wordFrequencyCount[category][token] += frequencyInText;
        }

        //update the count of all words we have seen mapped to this category
        self.wordCount[category] += frequencyInText;
      });

    return self;
  };

  /**
   * Determine what category `text` belongs to.
   *
   * @param  {String} text
   * @return {String} category
   */
  Bayes.prototype.categorize = function (text) {
    var self = this;
    var maxProbability = -Infinity;
    var chosenCategory = null;

    var tokens = self.tokenizer(text);
    var frequencyTable = self.frequencyTable(tokens);

    //iterate thru our categories to find the one with max probability for this text
    Object
      .keys(self.categories)
      .forEach(function (category) {

        //start by calculating the overall probability of this category
        //=>  out of all documents we've ever looked at, how many were
        //    mapped to this category
        var categoryProbability = self.docCount[category] / self.totalDocuments;

        //take the log to avoid underflow
        var logProbability = Math.log(categoryProbability);

        //now determine P( w | c ) for each word `w` in the text
        Object
          .keys(frequencyTable)
          .forEach(function (token) {
            var frequencyInText = frequencyTable[token];
            var tokenProbability = self.tokenProbability(token, category);
            // console.log('token: %s category: `%s` tokenProbability: %d', token, category, tokenProbability)

            //determine the log of the P( w | c ) for this word
            logProbability += frequencyInText * Math.log(tokenProbability);
          });

        if (logProbability > maxProbability) {
          maxProbability = logProbability;
          chosenCategory = category;
        }
      });

    return chosenCategory;
  };

  /**
   * Calculate probability that a `token` belongs to a `category`
   *
   * @param  {String} token
   * @param  {String} category
   * @return {Number} probability
   */
  Bayes.prototype.tokenProbability = function (token, category) {
    //how many times this word has occurred in documents mapped to this category
    var wordFrequencyCount = this.wordFrequencyCount[category][token] || 0;
    //what is the count of all words that have ever been mapped to this category
    var wordCount = this.wordCount[category];

    //use laplace Add-1 Smoothing equation
    return ( wordFrequencyCount + 1 ) / ( wordCount + this.vocabularySize );
  };

  /**
   * Build a frequency hashmap where
   * - the keys are the entries in `tokens`
   * - the values are the frequency of each entry in `tokens`
   *
   * @param  {Array} tokens  Normalized word array
   * @return {Object}
   */
  Bayes.prototype.frequencyTable = function (tokens) {
    var frequencyTable = {};

    tokens.forEach(function (token) {
      if (!frequencyTable[token]) {
        frequencyTable[token] = 1;
      } else {
        frequencyTable[token]++;
      }
    });

    return frequencyTable;
  };

// code base on http://my.oschina.net/goal/blog/201674

// 停止词
  var stop = {
    "的": 1
  };

// 节点
  function Node() {
    this.childs = {}; // 子节点集合
    this._isWord = false; // 边界保存，表示是否可以组成一个词
    this._count = 0;
  }

  Node.prototype = {
    isWord: function () {
      return (this._isWord && (this._count === 0));
    },
    asWord: function () {
      this._isWord = true;
    },
    addCount: function () {
      this._count++;
    }
  };

// Trie树
  function Trie() {
    this.root = new Node();
  }

  Trie.prototype = {
    /**
     * 将Unicode转成UTF8的三字节
     */
    toBytes: function (word) {
      var result = [];
      for (var i = 0; i < word.length; i++) {
        var code = word.charCodeAt(i);
        // 单字节
        if (code < 0x80) {
          result.push(code);
        } else {
          // 三字节
          result = result.concat(this.toUTF8(code));
        }
      }

      return result;
    },
    toUTF8: function (c) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      // 1110xxxx
      var byte1, byte2, byte3;
      byte1 = 0xE0 | ((c >> 12) & 0x0F);
      // 10xxxxxx
      byte2 = 0x80 | ((c >> 6) & 0x3F);
      // 10xxxxxx
      byte3 = 0x80 | (c & 0x3F);

      return [byte1, byte2, byte3];
    },
    toUTF16: function (b1, b2, b3) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      var byte1, byte2, utf16;
      byte1 = (b1 << 4) | ((b2 >> 2) & 0x0F);
      byte2 = ((b2 & 0x03) << 6) | (b3 & 0x3F);
      utf16 = ((byte1 & 0x00FF) << 8) | byte2;
      return utf16;
    },
    /**
     * 添加每个词到Trie树
     */
    add: function (word) {
      var node = this.root, bytes = this.toBytes(word), len = bytes.length;
      for (var i = 0; i < len; i++) {
        var c = bytes[i];
        // 如果不存在则添加，否则不需要再保存了，因为共用前缀
        if (!(c in node.childs)) {
          node.childs[c] = new Node(c);
        }
        node = node.childs[c];
      }
      node.asWord(); // 成词边界
    },
    /**
     * 按字节在Trie树中搜索
     */
    search: function (bytes) {
      var node = this.root, len = bytes.length, result = [];
      var word = [], j = 0;
      for (var i = 0; i < len; i++) {
        var c = bytes[i], childs = node.childs;
        if (!(c in childs)) {
          return result;
        }

        if (c < 0x80) {
          word.push(String.fromCharCode(c));
        } else {
          j++;
          if (j % 3 === 0) {
            var b1 = bytes[i - 2];
            var b2 = bytes[i - 1];
            var b3 = c;
            word.push(String.fromCharCode(this.toUTF16(b1, b2, b3)));
          }
        }
        // 如果是停止词，则退出
        if (word.join('') in stop) {
          return result;
        }

        // 成词
        var cnode = childs[c];
        if (cnode.isWord()) {
          cnode.addCount(); // 用于计数判断
          result.push(word.join(''));
        }

        node = cnode;
      }

      return result;
    },
    /**
     * 分词
     */
    splitWords: function (words) {
      // 转换成单字节进行搜索
      var bytes = this.toBytes(words);
      var start = 0, end = bytes.length - 1, result = [];

      while (start != end) {
        var word = [], b, finds;
        for (var i = start; i <= end; i++) {
          b = bytes[i]; // 逐个取出字节
          word.push(b);

          finds = this.search(word);
          if (finds !== false && finds.length > 0) {
            // 如果在字典中，则添加到分词结果集
            result = result.concat(finds);
          }
        }

        start++;
      }

      return result;
    },
    /**
     * 词始化整棵Trie树
     */
    init: function (dict) {
      for (var i = 0; i < dict.length; i++) {
        this.add(dict[i]);
      }
    }
  };


//The MIT License (MIT)
//
//Copyright (c) 2013 Aadit M Shah
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
//Github: https://github.com/aaditmshah/lexer

//Lexer.defunct = function (char) {
//	throw new Error("Unexpected character at index " + (this.index - 1) + ": " + char);
//};

  /*jshint curly: false */

  function Lexer(defunct) {
    if (typeof defunct !== "function") {
      defunct = function (char) {
        throw new TypeError("Unexpected character at index " + (this.index - 1) + ": " + char);
      };
    }

    var tokens = [];
    var rules = [];
    var remove = 0;
    this.state = 0;
    this.index = 0;
    this.input = "";

    this.addRule = function (pattern, action, start) {
      var global = pattern.global;

      if (!global) {
        var flags = "g";
        if (pattern.multiline) flags += "m";
        if (pattern.ignoreCase) flags += "i";
        pattern = new RegExp(pattern.source, flags);
      }

      if (Object.prototype.toString.call(start) !== "[object Array]") start = [0];

      rules.push({
        pattern: pattern,
        global: global,
        action: action,
        start: start
      });

      return this;
    };

    this.setInput = function (input) {
      remove = 0;
      this.state = 0;
      this.index = 0;
      tokens.length = 0;
      this.input = input;
      return this;
    };

    this.lex = function () {
      if (tokens.length) return tokens.shift();

      this.reject = true;

      while (this.index <= this.input.length) {
        var matches = scan.call(this).splice(remove);
        var index = this.index;

        while (matches.length) {
          if (this.reject) {
            var match = matches.shift();
            var result = match.result;
            var length = match.length;
            this.index += length;
            this.reject = false;
            remove++;

            var token = match.action.apply(this, result);
            if (this.reject) this.index = result.index;
            else if (typeof token !== "undefined") {
              switch (Object.prototype.toString.call(token)) {
                case "[object Array]":
                  tokens = token.slice(1);
                  token = token[0];
                  break;
                default:
                  if (length) remove = 0;
                  return token;
              }
            }
          } else break;
        }

        var input = this.input;

        if (index < input.length) {
          if (this.reject) {
            remove = 0;
            var token2 = defunct.call(this, input.charAt(this.index++));
            if (typeof token2 !== "undefined") {
              if (Object.prototype.toString.call(token2) === "[object Array]") {
                tokens = token2.slice(1);
                return token2[0];
              } else return token2;
            }
          } else {
            if (this.index !== index) remove = 0;
            this.reject = true;
          }
        } else if (matches.length)
          this.reject = true;
        else break;
      }
    };

    function scan() {
      /*jshint validthis: true */
      var that = this;
      var matches = [];
      var index = 0;

      for (var i = 0, length = rules.length; i < length; i++) {
        var rule = rules[i];
        var start = rule.start;
        var states = start.length;

        if ((!states || start.indexOf(that.state) >= 0) ||
          (that.state % 2 && states === 1 && !start[0])) {
          var pattern = rule.pattern;
          pattern.lastIndex = that.index;
          var result = pattern.exec(that.input);

          if (result && result.index === that.index) {
            var j = matches.push({
              result: result,
              action: rule.action,
              length: result[0].length
            });

            if (rule.global) index = j;

            while (--j > index) {
              var k = j - 1;

              if (matches[j].length > matches[k].length) {
                var temple = matches[j];
                matches[j] = matches[k];
                matches[k] = temple;
              }
            }
          }
        }
      }

      return matches;
    }
  }

  var dict = ['古代', '现在', '此时', '此刻', '等于', '是', '今天'];
  var combinedDict = [];

//子丑寅卯辰巳午未申酉戌亥
  var oldTime = [
    {time: '子时', from: '23', to: '1'},
    {time: '丑时', from: '1', to: '3'},
    {time: '寅时', from: '3', to: '5'},
    {time: '卯时', from: '5', to: '7'},
    {time: '辰时', from: '7', to: '9'},
    {time: '巳时', from: '9', to: '11'},
    {time: '午时', from: '11', to: '13'},
    {time: '未时', from: '13', to: '15'},
    {time: '申时', from: '15', to: '17'},
    {time: '酉时', from: '17', to: '19'},
    {time: '戌时', from: '19', to: '21'},
    {time: '亥时', from: '21', to: '23'}
  ];

  var nowWords = ['现在', 'Today', '此时', '此刻', '今天'];
  var eq = ['是', '等于'];

  var Utils = {};

  Utils.combinedObjString = function (dict, str) {
    if (typeof str[0] !== 'object') {
      str.forEach(function (data) {
        dict.push(data);
      });
    } else {
      str.forEach(function (time) {
        dict.push(time.time);
      });
    }

    return dict;
  };

  Utils.objectToStringRegex = function (str) {
    var result = "";
    str.forEach(function (time) {
      result = result + time.time + "|";
    });

    return result.substring(0, result.length - 1);
  };

  Utils.arrayToStringRegex = function (str) {
    var result = "";
    str.forEach(function (data) {
      result = result + data + "|";
    });

    return result.substring(0, result.length - 1);
  };

  Utils.stringToRegex = function (str) {
    return new RegExp(str);
  };

  Utils.extend = function (object) {
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
          object[prop] = source[prop];
        }
      }
    }
    return object;
  };

  combinedDict = Utils.combinedObjString(dict, oldTime);
  combinedDict = Utils.combinedObjString(combinedDict, nowWords);
  combinedDict = Utils.combinedObjString(combinedDict, eq);

  var Geng = function () {
  };

  Geng.parser = function (time) {
    this.time = time;
    return this;
  };

  Geng.convert = function () {
    var results = {},
      result,
      trieTree = new Geng.trie(),
      lexer = new Geng.lexer();

    trieTree.init(combinedDict);

    var oldTimeRegex = Utils.stringToRegex(Utils.objectToStringRegex(oldTime));
    lexer.addRule(oldTimeRegex, function (lexme) {
      var result = {};
      oldTime.forEach(function (time) {
        if (time.time === lexme) {
          result = time;
          delete result.time;
        }
      });

      return {time: result};
    });

    var newWordsRegex = Utils.stringToRegex(Utils.arrayToStringRegex(nowWords));
    lexer.addRule(newWordsRegex, function () {
      return {now: true};
    });

    var eqRegex = Utils.stringToRegex(Utils.arrayToStringRegex(eq));
    lexer.addRule(eqRegex, function () {
      return {condition: "equal"};
    });

    var words = trieTree.splitWords(this.time);
    words.forEach(function (word) {
      lexer.setInput(word);
      result = lexer.lex();
      Utils.extend(results, result);
    });

    return results.time;
  };

  Geng.version = Geng.VERSION = '0.0.2';

  Geng.trie = Trie;
  Geng.lexer = Lexer;
  Geng.bayes = Bayes;

  root.Geng = Geng;

}(this));
