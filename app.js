// Generated by CoffeeScript 1.4.0
(function() {
  var CL_KEY, MSG_MSG_KEY, MSG_USER_KEY, NEW_VISIT_MEMORY, addMsgToDOM, addMsgToModel, createChatList, createPictureBox, fetchName, getChatList, getCollaborators, getDocument, getModel, getName, initializeDocument, initializeModel, populateTailList, setDocument, setModel, setName, setupChatListener, setupCollaboratorsDOM, setupListeners, structureMessage,
    _this = this;

  NEW_VISIT_MEMORY = 20;

  CL_KEY = 'cl';

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
    return 'hello';
  };

  initializeDocument = function(doc) {
    setDocument(doc);
    setModel(doc.getModel());
    fetchName();
    populateTailList(NEW_VISIT_MEMORY);
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
    return setupChatListener();
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
      return addMsgToDOM(last);
    });
  };

  structureMessage = function(msg) {
    return msg[MSG_USER_KEY] + ": " + msg[MSG_MSG_KEY];
  };

  addMsgToDOM = function(msg) {
    return $("#chat-box").append($("<li>").text(structureMessage(msg)));
  };

  $(function() {
    var realtimeLoader, realtimeOptions;
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
