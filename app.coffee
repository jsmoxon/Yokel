NEW_VISIT_MEMORY = 20
CL_KEY = 'cl'
MSG_USER_KEY = 'msg-user'
MSG_MSG_KEY = 'msg-msg'
document.name = "unknown"
setModel = (model) =>
    document.model = model

setDocument = (doc)=>
    document.document = doc

getDocument = ()=> document.document

getCollaborators = () =>
    getDocument().getCollaborators()

getModel = () => document.model

initializeModel = (model) =>
    setModel model
    createChatList()
    createPictureBox()

addMsgToModel = (msg) =>
    msgObj = {}
    msgObj[MSG_USER_KEY] = getName()
    msgObj[MSG_MSG_KEY] = msg
    getChatList().push msgObj



createChatList = () =>
    list = getModel().createList()
    getModel().getRoot().set(CL_KEY,list)

getChatList = () =>
    getModel().getRoot().get(CL_KEY)

createPictureBox = () =>
    'hello'

initializeDocument = (doc) =>
    setDocument doc
    setModel doc.getModel()
    fetchName()
    populateTailList NEW_VISIT_MEMORY
    setupListeners()
    setupCollaboratorsDOM()

setupCollaboratorsDOM = () =>
    dom = $("#who-in-room")
    dom.append($("<li>").text(collab['displayName'])) for collab in getCollaborators()

populateTailList = (nElem) =>
    lastIndex = getChatList().length - 1
    firstIndex = Math.max 0, (lastIndex - nElem)
    addMsgToDOM(msg) for msg in getChatList().asArray()[firstIndex..lastIndex]

setupListeners = () =>
    setupChatListener()


fetchName = () =>
  setName ((collab['displayName'] for collab in getCollaborators() when collab['isMe'])[0])

setName = (name) =>
    document.name = name

getName = () =>
    document.name

setupChatListener = () =>
    list = getChatList()
    list.addEventListener gapi.drive.realtime.EventType.VALUES_ADDED, () =>
        last = list.get(list.length - 1)
        addMsgToDOM(last)

structureMessage = (msg) =>
    msg[MSG_USER_KEY] + ": " + msg[MSG_MSG_KEY]

addMsgToDOM = (msg) =>
    $("#chat-box").append $("<li>").text structureMessage msg


$ () =>
    $("#send-msg").click () =>
        addMsgToModel $('#send-msg-input').val()
        $('#send-msg-input').val('')
    realtimeOptions =
      clientId: '1054403106878-921pg354ijlmghqhfu1kc5tb9jjfsbm7.apps.googleusercontent.com',
      authButtonElementId: 'authorizeButton',
      initializeModel: initializeModel,
      autoCreate: true,
      defaultTitle: "Yokel Chat",
      onFileLoaded: initializeDocument

    realtimeLoader = new rtclient.RealtimeLoader realtimeOptions
    realtimeLoader.start()
