NEW_VISIT_MEMORY_CL = 30
NEW_VISIT_MEMORY_LL = 5
CL_KEY = 'cl'
PB_KEY = 'pb'
LL_KEY = 'll'
TITLE_KEY = 'title'
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

setYoutube = (url) =>
    setPicture url

getPicture = () =>
    getModel().getRoot().get PB_KEY

initializeDocument = (doc) =>
    $("#authorizeButton").remove()
    $("#right").show()
    $("#loading").remove()
    $("#share").show()
    setDocument doc
    setModel doc.getModel()
    fetchName()
    if titleInitialized() then setTitleInDOM() else fetchTitle()
    populateTailList NEW_VISIT_MEMORY_CL
    populateLinkList NEW_VISIT_MEMORY_LL
    populateRecentChats()
    setPictureBoxLocal()
    setupListeners()
    setupCollaboratorsDOM()

populateRecentChats = () =>
    gapi.client.load "drive", "v2", () =>
        gapi.client.drive.files.list({'maxResults': 50}).execute (list) =>
            $("#loading-recent").remove()
            console.log list
            addRecentChatToDOM(doc) for doc in list.items when (isUntrashedYokelChat(doc))

isUntrashedYokelChat = (doc) =>
    console.log 'checking untrashed'
    mime = "application/vnd.google-apps.drive-sdk.761917360771"
    doc.mimeType == mime and not doc.labels.trashed


addRecentChatToDOM = (chat) =>
    console.log 'adding recent to dom'
    link = chat.alternateLink
    title = chat.title
    $("#recent-chats").append(
      $("<li>").append(
        $("<a>").attr("href", link).text(title)
        ))

titleInitialized = () =>
    getModel().getRoot().has TITLE_KEY

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
    setupTitleListener()
    setupDOMListeners()
    setupUpdateCollaboratorsListener()

setupTitleListener = () =>
    getModel().getRoot().addEventListener gapi.drive.realtime.EventType.VALUE_CHANGED, (event) =>
        if event.property == TITLE_KEY
            setTitleInDOM()

setupUpdateCollaboratorsListener = () =>
    doc = getDocument()
    doc.addEventListener gapi.drive.realtime.EventType.COLLABORATOR_JOINED, (event) =>
        addCollaboratorToDOM event.collaborator

    doc.addEventListener gapi.drive.realtime.EventType.COLLABORATOR_LEFT, (event) =>
        console.log(event.collaborator['displayName'] + " left the room.")

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
    if msg.length > 2 and msg[..2] == 'yt:'
        setYoutube msg[3..]
    if msg == 'bees'
        setPicture "http://stream1.gifsoup.com/view1/1416886/oprah-s-bees-o.gif"



addLinkToModel = (link) =>
    getLinkList().push link


setupDOMListeners = () =>
    $("#send-msg-input").bind "keypress", (event) =>
        if (event.which == 13)
            event.preventDefault()
            postMessage()

    postDateToChatBox = () =>
        date = new Date()
        dateText = date.getHours()+":"+date.getMinutes()
        $("#chat-box").append $("<li>").text dateText

    window.setInterval postDateToChatBox, 600000

    $("body").click clearTitlePing
    $("#share").click share
    $("#send-msg-input").focus()

    setupChangeTitleListener()

setupChangeTitleListener = () =>
    $("#doc-title").tooltip
      'placement': 'bottom'
      'title': 'Click to change chat title'
    $("#doc-title-modal")
     .hide()
     .modal({show: false, keyboard: true})

    $("#new-title-input").bind "keypress", (event) =>
        if (event.which == 13)
            event.preventDefault()
            updateTitle $("#new-title-input").val()
            $("#new-title-input").val("")
            $('#doc-title-modal').modal 'hide'


    $("#doc-title").click () =>
        $('#doc-title-modal').modal 'show'
        $("#new-title-input").focus()


setupPictureBoxListener = () =>
    getModel().getRoot().addEventListener gapi.drive.realtime.EventType.VALUE_CHANGED, () =>
        setPictureBoxLocal()

setPictureBoxLocal = () =>
    url = getPicture()
    if (url.indexOf "youtube.com") > -1
        $("#picbox img").hide()
        playYoutubeUrl url
    else
        $("#ytapiplayer").empty()
        $("#picbox img").show().attr 'src', getPicture()

playYoutubeUrl = (url) =>
    vId = url[(url.indexOf("=") + 1)..]
    html = '''<iframe width="420" height="315" src="http://www.youtube.com/embed/''' + vId + '''" frameborder="0" allowfullscreen></iframe>'''
    $("#ytapiplayer").html html


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
    $("#top-links").prepend($("<li>").prepend($("<a>").attr("href", link).text(link)))

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

addChatLineToDOM = (txt) =>
    $("#chat-box").append $("<li>").text txt
    $('#chatboxdiv').stop().animate({ scrollTop: $("#chatboxdiv")[0].scrollHeight }, 800)

addMsgToDOM = (msg) =>
    addChatLineToDOM structureMessage msg


fetchTitle = () =>
    rtclient.getFileMetadata fileId(), (resp) =>
      setTitle resp.title
      setTitleInDOM()

setTitle = (title) =>
    getModel().getRoot().set TITLE_KEY, title

getTitle = () => 
  getModel().getRoot().get TITLE_KEY

setTitleInDOM = () =>
    setTitleInDOMText getTitle()

setTitleInDOMText = (txt) =>
    $("#doc-title").text(": " + txt)

updateTitle = (title) =>
  setTitleInDOMText title
  requestData =
        'path': '/drive/v2/files/' + fileId()
        'method': 'PUT'
        'params': 
          'uploadType': 'resumable'
          'alt': 'json'
        'headers':
          'Content-Type': 'application/json'
        'body': JSON.stringify
          'title': title
  gapi.client.request(requestData).execute () =>
    setTitle title



$ () =>
    $(".alert").alert()
    $("#share").hide()
    $("#right").hide()
    

    realtimeOptions =
      clientId: '761917360771.apps.googleusercontent.com',
      authButtonElementId: 'authorizeButton',
      initializeModel: initializeModel,
      autoCreate: true,
      defaultTitle: "Yokel Chat",
      onFileLoaded: initializeDocument

    realtimeLoader = new rtclient.RealtimeLoader realtimeOptions
    realtimeLoader.start()
