// Generated by CoffeeScript 1.4.0
(function() {
  var CL_KEY, LL_KEY, MSG_MSG_KEY, MSG_USER_KEY, NEW_VISIT_MEMORY_CL, NEW_VISIT_MEMORY_LL, PB_KEY, TITLE_KEY, addChatLineToDOM, addCollaboratorToDOM, addLinkToDOM, addLinkToModel, addMsgToDOM, addMsgToModel, addRecentChatToDOM, alertPageTitle, clearTitlePing, createChatList, createLinkList, createPictureBox, fetchName, fetchTitle, fileId, getChatList, getCollaborators, getDocument, getLinkList, getModel, getName, getPicture, getTitle, handleSmartMessage, initializeDocument, initializeModel, isUntrashedYokelChat, playYoutubeUrl, populateLinkList, populateRecentChats, populateTailList, postMessage, setDocument, setModel, setName, setPicture, setPictureBoxLocal, setTitle, setTitleInDOM, setTitleInDOMText, setYoutube, setupChangeTitleListener, setupChatListener, setupCollaboratorsDOM, setupDOMListeners, setupLinkListListener, setupListeners, setupPictureBoxListener, setupTitleListener, setupUpdateCollaboratorsListener, share, structureMessage, titleInitialized, updateTitle,
    _this = this;

  NEW_VISIT_MEMORY_CL = 30;

  NEW_VISIT_MEMORY_LL = 5;

  CL_KEY = 'cl';

  PB_KEY = 'pb';

  LL_KEY = 'll';

  TITLE_KEY = 'title';

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

  setYoutube = function(url) {
    return setPicture(url);
  };

  getPicture = function() {
    return getModel().getRoot().get(PB_KEY);
  };

  initializeDocument = function(doc) {
    $("#authorizeButton").remove();
    $("#right").show();
    $("#loading").remove();
    $("#share").show();
    setDocument(doc);
    setModel(doc.getModel());
    fetchName();
    if (titleInitialized()) {
      setTitleInDOM();
    } else {
      fetchTitle();
    }
    populateTailList(NEW_VISIT_MEMORY_CL);
    populateLinkList(NEW_VISIT_MEMORY_LL);
    populateRecentChats();
    setPictureBoxLocal();
    setupListeners();
    return setupCollaboratorsDOM();
  };

  populateRecentChats = function() {
    return gapi.client.load("drive", "v2", function() {
      return gapi.client.drive.files.list({
        'maxResults': 50
      }).execute(function(list) {
        var doc, _i, _len, _ref, _results;
        $("#loading-recent").remove();
        console.log(list);
        _ref = list.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          doc = _ref[_i];
          if (isUntrashedYokelChat(doc)) {
            _results.push(addRecentChatToDOM(doc));
          }
        }
        return _results;
      });
    });
  };

  isUntrashedYokelChat = function(doc) {
    var mime;
    console.log('checking untrashed');
    mime = "application/vnd.google-apps.drive-sdk.761917360771";
    return doc.mimeType === mime && !doc.labels.trashed;
  };

  addRecentChatToDOM = function(chat) {
    var link, title;
    console.log('adding recent to dom');
    link = chat.alternateLink;
    title = chat.title;
    return $("#recent-chats").append($("<li>").append($("<a>").attr("href", link).text(title)));
  };

  titleInitialized = function() {
    return getModel().getRoot().has(TITLE_KEY);
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
    setupTitleListener();
    setupDOMListeners();
    return setupUpdateCollaboratorsListener();
  };

  setupTitleListener = function() {
    return getModel().getRoot().addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, function(event) {
      if (event.property === TITLE_KEY) {
        return setTitleInDOM();
      }
    });
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
    if (msg.length > 2 && msg.slice(0, 3) === 'yt:') {
      setYoutube(msg.slice(3));
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
    $("#share").click(share);
    $("#send-msg-input").focus();
    return setupChangeTitleListener();
  };

  setupChangeTitleListener = function() {
    $("#doc-title").tooltip({
      'placement': 'bottom',
      'title': 'Click to change chat title'
    });
    $("#doc-title-modal").hide().modal({
      show: false,
      keyboard: true
    });
    $("#new-title-input").bind("keypress", function(event) {
      if (event.which === 13) {
        event.preventDefault();
        updateTitle($("#new-title-input").val());
        $("#new-title-input").val("");
        return $('#doc-title-modal').modal('hide');
      }
    });
    return $("#doc-title").click(function() {
      $('#doc-title-modal').modal('show');
      return $("#new-title-input").focus();
    });
  };

  setupPictureBoxListener = function() {
    return getModel().getRoot().addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, function() {
      return setPictureBoxLocal();
    });
  };

  setPictureBoxLocal = function() {
    var url;
    url = getPicture();
    if ((url.indexOf("youtube.com")) > -1) {
      $("#picbox img").hide();
      return playYoutubeUrl(url);
    } else {
      $("#ytapiplayer").empty();
      return $("#picbox img").show().attr('src', getPicture());
    }
  };

  playYoutubeUrl = function(url) {
    var html, vId;
    vId = url.slice(url.indexOf("=") + 1);
    html = '<iframe width="420" height="315" src="http://www.youtube.com/embed/' + vId + '" frameborder="0" allowfullscreen></iframe>';
    return $("#ytapiplayer").html(html);
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

  fileId = function() {
    return rtclient.getParams().fileId;
  };

  share = function() {
    var client;
    client = new gapi.drive.share.ShareClient('761917360771');
    client.setItemIds([fileId()]);
    return client.showSettingsDialog();
  };

  structureMessage = function(msg) {
    return msg[MSG_USER_KEY] + ": " + msg[MSG_MSG_KEY];
  };

  addChatLineToDOM = function(txt) {
    return $("#chat-box").append($("<li>").text(txt));
  };

  addMsgToDOM = function(msg) {
    return addChatLineToDOM(structureMessage(msg));
  };

  fetchTitle = function() {
    return rtclient.getFileMetadata(fileId(), function(resp) {
      setTitle(resp.title);
      return setTitleInDOM();
    });
  };

  setTitle = function(title) {
    return getModel().getRoot().set(TITLE_KEY, title);
  };

  getTitle = function() {
    return getModel().getRoot().get(TITLE_KEY);
  };

  setTitleInDOM = function() {
    return setTitleInDOMText(getTitle());
  };

  setTitleInDOMText = function(txt) {
    return $("#doc-title").text(": " + txt);
  };

  updateTitle = function(title) {
    var requestData;
    setTitleInDOMText(title);
    requestData = {
      'path': '/drive/v2/files/' + fileId(),
      'method': 'PUT',
      'params': {
        'uploadType': 'resumable',
        'alt': 'json'
      },
      'headers': {
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
        'title': title
      })
    };
    return gapi.client.request(requestData).execute(function() {
      return setTitle(title);
    });
  };

  $(function() {
    var realtimeLoader, realtimeOptions;
    $(".alert").alert();
    $("#share").hide();
    $("#right").hide();
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
