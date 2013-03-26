NEW_VISIT_MEMORY = 20
CL_KEY = 'cl'
PB_KEY = 'pb'
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
    setPicture "http://placekitten.com/300/200"

setPicture = (url) =>
    getModel().getRoot().set PB_KEY, url

getPicture = () =>
    getModel().getRoot().get PB_KEY

initializeDocument = (doc) =>
    setDocument doc
    setModel doc.getModel()
    fetchName()
    populateTailList NEW_VISIT_MEMORY
    setPictureBoxLocal()
    setupListeners()
    setupCollaboratorsDOM()

setupCollaboratorsDOM = () =>
    addCollaboratorToDOM collab for collab in getCollaborators()

addCollaboratorToDOM = (collab) =>
    dom = $("#who-in-room")
    dom.append($("<li>").text(collab['displayName']))



populateTailList = (nElem) =>
    lastIndex = getChatList().length - 1
    firstIndex = Math.max 0, (lastIndex - nElem)
    addMsgToDOM(msg) for msg in getChatList().asArray()[firstIndex..lastIndex]

setupListeners = () =>
    setupChatListener()
    setupPictureBoxListener()
    setupDOMListeners()
    setupUpdateCollaboratorsListener()

setupUpdateCollaboratorsListener = () =>
    doc = getDocument()
    doc.addEventListener gapi.drive.realtime.CollaboratorJoinedEvent, (event) =>
        addCollaboratorToDOM event.collaborator

    doc.addEventListener gapi.drive.realtime.CollaboratorJoinedEvent, (event) =>
        alert event.collaborator['displayName'] + " left the room."


setupDOMListeners = () =>
    $("#send-msg").click () =>
        addMsgToModel $('#send-msg-input').val()
        $('#send-msg-input').val('')

    $("#send-msg-input").bind "keypress", (event) =>
        if (event.which == 13)
            event.preventDefault()
            addMsgToModel $('#send-msg-input').val()
            $('#send-msg-input').val('')
    $("#picbox-input").bind 'keypress', (event) =>
        if (event.which == 13)
            event.preventDefault()
            setPicture $("#picbox-input").val()
            $("#picbox-input").val('')
    keepScrollBottom = () =>
        elem = $("#chatboxdiv")[0]
        elem.scrollTop = elem.scrollHeight
    window.setInterval keepScrollBottom, 200

    postDateToChatBox = () =>
        date = new Date()
        dateText = date.getHours()+":"+date.getMinutes()
        $("#chat-box").append $("<li>").text dateText

    window.setInterval postDateToChatBox, 600000

    $("body").click clearTitlePing

setupPictureBoxListener = () =>
    getModel().getRoot().addEventListener gapi.drive.realtime.EventType.VALUE_CHANGED, () =>
        setPictureBoxLocal()

setPictureBoxLocal = () =>
    $("#picbox img").attr 'src', getPicture()


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
        alertPageTitle()
        addMsgToDOM last

alertPageTitle = () =>
    document.title = "Yokel (ping)"

clearTitlePing = () =>
    document.title = "Yokel"




structureMessage = (msg) =>
    msg[MSG_USER_KEY] + ": " + msg[MSG_MSG_KEY]

addMsgToDOM = (msg) =>
    $("#chat-box").append $("<li>").text structureMessage msg


$ () =>
    realtimeOptions =
      clientId: '1054403106878-921pg354ijlmghqhfu1kc5tb9jjfsbm7.apps.googleusercontent.com',
      authButtonElementId: 'authorizeButton',
      initializeModel: initializeModel,
      autoCreate: true,
      defaultTitle: "Yokel Chat",
      onFileLoaded: initializeDocument

    realtimeLoader = new rtclient.RealtimeLoader realtimeOptions
    realtimeLoader.start()
