// Generated by CoffeeScript 1.4.0
(function() {
  var CL_KEY, MSG_MSG_KEY, MSG_USER_KEY, NEW_VISIT_MEMORY, PB_KEY, addMsgToDOM, addMsgToModel, alertPageTitle, clearTitlePing, createChatList, createPictureBox, fetchName, getChatList, getCollaborators, getDocument, getModel, getName, getPicture, initializeDocument, initializeModel, populateTailList, setDocument, setModel, setName, setPicture, setPictureBoxLocal, setupChatListener, setupCollaboratorsDOM, setupDOMListeners, setupListeners, setupPictureBoxListener, structureMessage,
    _this = this;

  NEW_VISIT_MEMORY = 20;

  CL_KEY = 'cl';

  PB_KEY = 'pb';

  MSG_USER_KEY = 'msg-user';

  MSG_MSG_KEY = 'msg-msg';

  document.name = "unknown";

  setModel = function(model) {
    return document.model = model;
  };

  setDocument = function(doc) {
    return document.document = doc;
  };

  getDocument = function() {
    return document.document;
  };

  getCollaborators = function() {
    return getDocument().getCollaborators();
  };

  getModel = function() {
    return document.model;
  };

  initializeModel = function(model) {
    setModel(model);
    createChatList();
    return createPictureBox();
  };

  addMsgToModel = function(msg) {
    var msgObj;
    msgObj = {};
    msgObj[MSG_USER_KEY] = getName();
    msgObj[MSG_MSG_KEY] = msg;
    return getChatList().push(msgObj);
  };

  createChatList = function() {
    var list;
    list = getModel().createList();
    return getModel().getRoot().set(CL_KEY, list);
  };

  getChatList = function() {
    return getModel().getRoot().get(CL_KEY);
  };

  createPictureBox = function() {
    return setPicture("http://placekitten.com/300/200");
  };

  setPicture = function(url) {
    return getModel().getRoot().set(PB_KEY, url);
  };

  getPicture = function() {
    return getModel().getRoot().get(PB_KEY);
  };

  initializeDocument = function(doc) {
    setDocument(doc);
    setModel(doc.getModel());
    fetchName();
    populateTailList(NEW_VISIT_MEMORY);
    setPictureBoxLocal();
    setupListeners();
    return setupCollaboratorsDOM();
  };

  setupCollaboratorsDOM = function() {
    var collab, dom, _i, _len, _ref, _results;
    dom = $("#who-in-room");
    _ref = getCollaborators();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      collab = _ref[_i];
      _results.push(dom.append($("<li>").text(collab['displayName'])));
    }
    return _results;
  };

  populateTailList = function(nElem) {
    var firstIndex, lastIndex, msg, _i, _len, _ref, _results;
    lastIndex = getChatList().length - 1;
    firstIndex = Math.max(0, lastIndex - nElem);
    _ref = getChatList().asArray().slice(firstIndex, +lastIndex + 1 || 9e9);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      msg = _ref[_i];
      _results.push(addMsgToDOM(msg));
    }
    return _results;
  };

  setupListeners = function() {
    setupChatListener();
    setupPictureBoxListener();
    return setupDOMListeners();
  };

  setupDOMListeners = function() {
    var keepScrollBottom, postDateToChatBox;
    $("#send-msg").click(function() {
      addMsgToModel($('#send-msg-input').val());
      return $('#send-msg-input').val('');
    });
    $("#send-msg-input").bind("keypress", function(event) {
      if (event.which === 13) {
        event.preventDefault();
        addMsgToModel($('#send-msg-input').val());
        return $('#send-msg-input').val('');
      }
    });
    $("#picbox-input").bind('keypress', function(event) {
      if (event.which === 13) {
        event.preventDefault();
        setPicture($("#picbox-input").val());
        return $("#picbox-input").val('');
      }
    });
    keepScrollBottom = function() {
      var elem;
      elem = $("#chatboxdiv")[0];
      return elem.scrollTop = elem.scrollHeight;
    };
    window.setInterval(keepScrollBottom, 200);
    postDateToChatBox = function() {
      var date, dateText;
      date = new Date();
      dateText = date.getHours() + ":" + date.getMinutes();
      return $("#chat-box").append($("<li>").text(dateText));
    };
    window.setInterval(postDateToChatBox, 600000);
    return $("body").click(clearTitlePing);
  };

  setupPictureBoxListener = function() {
    return getModel().getRoot().addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, function() {
      return setPictureBoxLocal();
    });
  };

  setPictureBoxLocal = function() {
    return $("#picbox img").attr('src', getPicture());
  };

  fetchName = function() {
    var collab;
    return setName(((function() {
      var _i, _len, _ref, _results;
      _ref = getCollaborators();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        collab = _ref[_i];
        if (collab['isMe']) {
          _results.push(collab['displayName']);
        }
      }
      return _results;
    })())[0]);
  };

  setName = function(name) {
    return document.name = name;
  };

  getName = function() {
    return document.name;
  };

  setupChatListener = function() {
    var list;
    list = getChatList();
    return list.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, function() {
      var last;
      last = list.get(list.length - 1);
      alertPageTitle();
      return addMsgToDOM(last);
    });
  };

  alertPageTitle = function() {
    return document.title = "Yokel (ping)";
  };

  clearTitlePing = function() {
    return document.title = "Yokel";
  };

  structureMessage = function(msg) {
    return msg[MSG_USER_KEY] + ": " + msg[MSG_MSG_KEY];
  };

  addMsgToDOM = function(msg) {
    return $("#chat-box").append($("<li>").text(structureMessage(msg)));
  };

  $(function() {
    var realtimeLoader, realtimeOptions;
    realtimeOptions = {
      clientId: '1054403106878-921pg354ijlmghqhfu1kc5tb9jjfsbm7.apps.googleusercontent.com',
      authButtonElementId: 'authorizeButton',
      initializeModel: initializeModel,
      autoCreate: true,
      defaultTitle: "Yokel Chat",
      onFileLoaded: initializeDocument
    };
    realtimeLoader = new rtclient.RealtimeLoader(realtimeOptions);
    return realtimeLoader.start();
  });

}).call(this);
