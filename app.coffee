NEW_VISIT_MEMORY_CL = 30
NEW_VISIT_MEMORY_LL = 5
CL_KEY = 'cl'
PB_KEY = 'pb'
LL_KEY = 'll'
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
    createLinkList()

createLinkList = () =>
    getModel().getRoot().set LL_KEY, getModel().createList()

getLinkList = () =>
    getModel().getRoot().get LL_KEY

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
    $("#authorizeButton").hide()
    $("#share").show()
    setDocument doc
    setModel doc.getModel()
    fetchName()
    fetchTitle()
    populateTailList NEW_VISIT_MEMORY_CL
    populateLinkList NEW_VISIT_MEMORY_LL
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

populateLinkList = (nElem) =>
    lastIndex = getLinkList().length - 1
    firstIndex = Math.max 0, (lastIndex - nElem)
    addLinkToDOM(link) for link in getLinkList().asArray()[firstIndex..lastIndex]

setupListeners = () =>
    setupChatListener()
    setupPictureBoxListener()
    setupLinkListListener()
    setupDOMListeners()
    setupUpdateCollaboratorsListener()

setupUpdateCollaboratorsListener = () =>
    doc = getDocument()
    doc.addEventListener gapi.drive.realtime.EventType.COLLABORATOR_JOINED, (event) =>
        addCollaboratorToDOM event.collaborator

    doc.addEventListener gapi.drive.realtime.EventType.COLLABORATOR_LEFT, (event) =>
        alert event.collaborator['displayName'] + " left the room."

postMessage = () =>
    msg = $('#send-msg-input').val()
    addMsgToModel msg
    $('#send-msg-input').val('')
    handleSmartMessage msg
    clearTitlePing()

handleSmartMessage = (msg) =>
    if msg.length > 4 and msg[..3] == 'pic:'
        setPicture msg[4..]
    if msg.length > 5 and msg[..4] == 'link:'
        addLinkToModel msg[5..]
    if msg == 'bees'
        setPicture "http://stream1.gifsoup.com/view1/1416886/oprah-s-bees-o.gif"

addLinkToModel = (link) =>
    getLinkList().push link


setupDOMListeners = () =>
    $("#send-msg-input").bind "keypress", (event) =>
        if (event.which == 13)
            event.preventDefault()
            postMessage()
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
    $("#share").click share

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

setupLinkListListener = () =>
    list = getLinkList()
    list.addEventListener gapi.drive.realtime.EventType.VALUES_ADDED, () =>
        last = list.get(list.length - 1)
        addLinkToDOM last

addLinkToDOM = (link) =>
    $("#top-links").append($("<li>").append($("<a>").attr("href", link).text(link)))

alertPageTitle = () =>
    document.title = "Yokel (ping)"

clearTitlePing = () =>
    document.title = "Yokel"


fileId = () => rtclient.getParams().fileId

share = () =>
    client = new gapi.drive.share.ShareClient('761917360771')
    client.setItemIds [fileId()]
    client.showSettingsDialog()


structureMessage = (msg) =>
    msg[MSG_USER_KEY] + ": " + msg[MSG_MSG_KEY]

addMsgToDOM = (msg) =>
    $("#chat-box").append $("<li>").text structureMessage msg


fetchTitle = () =>
    rtclient.getFileMetadata fileId(), (resp) =>
      setTitle resp.title
      setTitleInDOM()

setTitle = (title) =>
    document.docTitle = title

getTitle = () => document.docTitle

setTitleInDOM = () =>
    $("#doc-title").text ": " + getTitle()


$ () =>
    $(".alert").alert()
    $("#share").hide()

    realtimeOptions =
      clientId: '761917360771.apps.googleusercontent.com',
      authButtonElementId: 'authorizeButton',
      initializeModel: initializeModel,
      autoCreate: true,
      defaultTitle: "Yokel Chat",
      onFileLoaded: initializeDocument

    realtimeLoader = new rtclient.RealtimeLoader realtimeOptions
    realtimeLoader.start()
