// Generated by CoffeeScript 1.4.0
(function() {
  var CL_KEY, LL_KEY, MSG_MSG_KEY, MSG_USER_KEY, NEW_VISIT_MEMORY_CL, NEW_VISIT_MEMORY_LL, PB_KEY, addCollaboratorToDOM, addLinkToDOM, addLinkToModel, addMsgToDOM, addMsgToModel, alertPageTitle, clearTitlePing, createChatList, createLinkList, createPictureBox, fetchName, getChatList, getCollaborators, getDocument, getLinkList, getModel, getName, getPicture, handleSmartMessage, initializeDocument, initializeModel, populateLinkList, populateTailList, postMessage, setDocument, setModel, setName, setPicture, setPictureBoxLocal, setupChatListener, setupCollaboratorsDOM, setupDOMListeners, setupLinkListListener, setupListeners, setupPictureBoxListener, setupUpdateCollaboratorsListener, share, structureMessage,
    _this = this;

  NEW_VISIT_MEMORY_CL = 30;

  NEW_VISIT_MEMORY_LL = 5;

  CL_KEY = 'cl';

  PB_KEY = 'pb';

  LL_KEY = 'll';

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
    createPictureBox();
    return createLinkList();
  };

  createLinkList = function() {
    return getModel().getRoot().set(LL_KEY, getModel().createList());
  };

  getLinkList = function() {
    return getModel().getRoot().get(LL_KEY);
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
    $("#authorizeButton").hide();
    $("#share").show();
    setDocument(doc);
    setModel(doc.getModel());
    fetchName();
    populateTailList(NEW_VISIT_MEMORY_CL);
    populateLinkList(NEW_VISIT_MEMORY_LL);
    setPictureBoxLocal();
    setupListeners();
    return setupCollaboratorsDOM();
  };

  setupCollaboratorsDOM = function() {
    var collab, _i, _len, _ref, _results;
    _ref = getCollaborators();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      collab = _ref[_i];
      _results.push(addCollaboratorToDOM(collab));
    }
    return _results;
  };

  addCollaboratorToDOM = function(collab) {
    var dom;
    dom = $("#who-in-room");
    return dom.append($("<li>").text(collab['displayName']));
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

  populateLinkList = function(nElem) {
    var firstIndex, lastIndex, link, _i, _len, _ref, _results;
    lastIndex = getLinkList().length - 1;
    firstIndex = Math.max(0, lastIndex - nElem);
    _ref = getLinkList().asArray().slice(firstIndex, +lastIndex + 1 || 9e9);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      link = _ref[_i];
      _results.push(addLinkToDOM(link));
    }
    return _results;
  };

  setupListeners = function() {
    setupChatListener();
    setupPictureBoxListener();
    setupLinkListListener();
    setupDOMListeners();
    return setupUpdateCollaboratorsListener();
  };

  setupUpdateCollaboratorsListener = function() {
    var doc;
    doc = getDocument();
    doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, function(event) {
      return addCollaboratorToDOM(event.collaborator);
    });
    return doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, function(event) {
      return alert(event.collaborator['displayName'] + " left the room.");
    });
  };

  postMessage = function() {
    var msg;
    msg = $('#send-msg-input').val();
    addMsgToModel(msg);
    $('#send-msg-input').val('');
    handleSmartMessage(msg);
    return clearTitlePing();
  };

  handleSmartMessage = function(msg) {
    if (msg.length > 4 && msg.slice(0, 4) === 'pic:') {
      setPicture(msg.slice(4));
    }
    if (msg.length > 5 && msg.slice(0, 5) === 'link:') {
      addLinkToModel(msg.slice(5));
    }
    if (msg === 'bees') {
      return setPicture("http://stream1.gifsoup.com/view1/1416886/oprah-s-bees-o.gif");
    }
  };

  addLinkToModel = function(link) {
    return getLinkList().push(link);
  };

  setupDOMListeners = function() {
    var keepScrollBottom, postDateToChatBox;
    $("#send-msg-input").bind("keypress", function(event) {
      if (event.which === 13) {
        event.preventDefault();
        return postMessage();
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
    $("body").click(clearTitlePing);
    return $("#share").click(share);
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

  setupLinkListListener = function() {
    var list;
    list = getLinkList();
    return list.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, function() {
      var last;
      last = list.get(list.length - 1);
      return addLinkToDOM(last);
    });
  };

  addLinkToDOM = function(link) {
    return $("#top-links").append($("<li>").append($("<a>").attr("href", link).text(link)));
  };

  alertPageTitle = function() {
    return document.title = "Yokel (ping)";
  };

  clearTitlePing = function() {
    return document.title = "Yokel";
  };

  share = function() {
    var client;
    client = new gapi.drive.share.ShareClient('761917360771');
    client.setItemIds([rtclient.getParams().fileId]);
    return client.showSettingsDialog();
  };

  structureMessage = function(msg) {
    return msg[MSG_USER_KEY] + ": " + msg[MSG_MSG_KEY];
  };

  addMsgToDOM = function(msg) {
    return $("#chat-box").append($("<li>").text(structureMessage(msg)));
  };

  $(function() {
    var realtimeLoader, realtimeOptions;
    $(".alert").alert();
    $("#share").hide();
    realtimeOptions = {
      clientId: '761917360771.apps.googleusercontent.com',
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
