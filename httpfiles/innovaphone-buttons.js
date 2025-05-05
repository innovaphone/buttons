/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var innovaphone = innovaphone || {};
innovaphone.buttons = innovaphone.buttons || function (start, args) {
    this.createNode("body");
    var that = this;

    var ownsip = "";

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };

    var loaded = false;
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(innovaphone.buttonsTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    var main = new innovaphone.ui1.Div("align: center", null, "bodydiv");

    that.add(main);

    start.onargschanged.attach(function () {
        if (start.args.hotkey) {
            app.send({ api: "user", mt: "StartHotkey", hotkey: start.args.hotkey });
        }
    });

    const addDevices_Button = new innovaphone.ui1.Div("margin: 10px", texts.text("add_Device"), "button");
    addDevices_Button.container.addEventListener("click", function () {
        AddDeviceDiv.container.style.display = "block";
    });

    main.add(addDevices_Button);

    const AddDeviceDiv = new innovaphone.ui1.Div(null, texts.text("addnewDevice"), "optionsDiv");
    AddDeviceDiv.container.style.display = "none";

    const AddDeviceLabel = new innovaphone.ui1.Div(null, null, null);
    const adddevice = new innovaphone.ui1.Node("span", null, null, null);
    AddDeviceLabel.add(adddevice)

    const devicetypesselect = new innovaphone.ui1.Node("select", null, null, null);
    const devicestypes = [
        { id: 1, label: texts.text("button") },
        { id: 2, label: texts.text("windowsensor") },
        { id: 3, label: texts.text("motionsensor") },
        { id: 4, label: texts.text("dialinnumber") },
        { id: 5, label: texts.text("hotkey") }
    ];
    devicestypes.forEach(type => {
        const option = new innovaphone.ui1.Node("option", null, type.label, null);
        option.setAttribute("value", type.id);
        devicetypesselect.add(option);
    });

    const addDevice_Mac_Input = new innovaphone.ui1.Input(null, null, "Mac", null, "text", "inputfield");

    const addDevice_submitButton = new innovaphone.ui1.Div(null, texts.text("submit"), "button");
    addDevice_submitButton.container.onclick = function () {
        const macValue = addDevice_Mac_Input.getValue();
        const macClean = macValue.toLowerCase().replace(/:/g, '');
        app.send({
            mt: "SqlInsert",
            src: "add-device",
            statement: "add-device",
            args: {
                id: macClean,
                mac: macClean,
                dtype: devicetypesselect.container.value
            }
        });
    };

    const addDevice_closebutton = new innovaphone.ui1.Div(null, texts.text("close"), "button");
    addDevice_closebutton.container.onclick = function () {
        AddDeviceDiv.container.style.display = "none";
    };

    AddDeviceDiv.add(AddDeviceLabel);
    AddDeviceDiv.add(devicetypesselect);
    AddDeviceDiv.add(addDevice_Mac_Input);
    AddDeviceDiv.add(addDevice_submitButton);
    AddDeviceDiv.add(addDevice_closebutton);

    main.add(AddDeviceDiv);

    const optionsdeviceDiv = new innovaphone.ui1.Div(null, null, "optionsDiv");
    const optionsdeviceDivLabel = optionsdeviceDiv.add(new innovaphone.ui1.Div(null, "Options - ID: ", null));
    optionsdeviceDiv.container.style.display = "none";

    const optionsdeviceLabel = new innovaphone.ui1.Div(null, null, null);
    const optionsdevice = new innovaphone.ui1.Node("span", null, null, null);
    optionsdeviceLabel.add(optionsdevice)

    const buttonsselect = new innovaphone.ui1.Node("select", null, null, null);
    const buttons = [
        { id: 1, label: "1-Click" },
        { id: 2, label: "2-Click" },
        { id: 3, label: "3-Click" },
        { id: 4, label: "Long" },
        { id: 5, label: "Offen" },
        { id: 6, label: "Geschlossen" }
    ];
    buttons.forEach(button => {
        const option = new innovaphone.ui1.Node("option", null, button.label, null);
        option.setAttribute("value", button.id);
        buttonsselect.add(option);
    });

    const windowselect = new innovaphone.ui1.Node("select", null, null, null);
    const windows = [
        { id: 0, label: texts.text("closed") },
        { id: 1, label: texts.text("open") }
    ];
    windows.forEach(window => {
        const option = new innovaphone.ui1.Node("option", null, window.label, null);
        option.setAttribute("value", window.id);
        windowselect.add(option);
    });

    const motionselect = new innovaphone.ui1.Node("select", null, null, null);
    const motions = [
        { id: 0, label: texts.text("nomotion") },
        { id: 1, label: texts.text("motion") }
    ];
    motions.forEach(motion => {
        const option = new innovaphone.ui1.Node("option", null, motion.label, null);
        option.setAttribute("value", motion.id);
        motionselect.add(option);
    });

    const actionsselect = new innovaphone.ui1.Node("select", null, null, null);
    const actions = ["chat", "notify", "chat+notify", "phonemessage", "working", "presence", "connect", "call"];
    actions.forEach(action => {
        const option = new innovaphone.ui1.Node("option", null, action, null);
        option.setAttribute("value", action);
        actionsselect.add(option);
    });
    actionsselect.container.onchange = function () {
        if (actionsselect.container.value === "working") {
            destinationInput.container.style.display = "none";
            destinationText.container.style.display = "none";
            presenceselect.container.style.display = "none";
            workingselect.container.style.display = "block";
            queueeselect.container.style.display = "none";
            destinationInput.setValue(ownsip);
            destinationText.setValue("-");
        }
        else if (actionsselect.container.value === "presence") {
            destinationInput.container.style.display = "none";
            destinationText.container.style.display = "none";
            workingselect.container.style.display = "none";
            presenceselect.container.style.display = "block";
            queueeselect.container.style.display = "none";
            destinationInput.setValue(ownsip);
            destinationText.setValue("-");
        }
        else if (actionsselect.container.value === "call") {
            destinationInput.container.style.display = "none";
            destinationText.container.style.display = "none";
            workingselect.container.style.display = "none";
            presenceselect.container.style.display = "none";
            queueeselect.container.style.display = "block";
            destinationInput.container.style.display = "block";
            destinationText.setValue("-");
        }
        else {
            destinationInput.container.style.display = "block";
            destinationText.container.style.display = "block";
            workingselect.container.style.display = "none";
            presenceselect.container.style.display = "none";
            queueeselect.container.style.display = "none";
        }
    }

    const destinationInput = new innovaphone.ui1.Input(null, null, "SIP-Name", null, "text", "inputfield");
    const destinationText = new innovaphone.ui1.Input(null, null, "Text", null, "text", "inputfield");
    const workingselect = new innovaphone.ui1.Node("select", null, null, null);
    const workingactions = ["start", "stop", "toggle"];
    workingactions.forEach(action => {
        const option = new innovaphone.ui1.Node("option", null, action, null);
        option.setAttribute("value", action);
        workingselect.add(option);
    });
    workingselect.container.style.display = "none";

    const presenceselect = new innovaphone.ui1.Node("select", null, null, null);
    const presenceactions = [
        { id: 1, label: texts.text("online") },
        { id: 2, label: texts.text("away") },
        { id: 3, label: texts.text("busy") },
        { id: 4, label: texts.text("dnd") }
    ];
    presenceactions.forEach(action => {
        const option = new innovaphone.ui1.Node("option", null, action.label, null);
        option.setAttribute("value", action.id);
        presenceselect.add(option);
    });
    presenceselect.container.style.display = "none";

    const queueeselect = new innovaphone.ui1.Node("select", null, null, null);
    queueeselect.container.style.display = "none";

    const submitbutton = new innovaphone.ui1.Div(null, texts.text("submit"), "button");

    submitbutton.container.onclick = function () {
        //Button Submit
        if (choosentype == 1) {
            if (actionsselect.container.value === "working") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + buttonsselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + workingselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "presence") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + buttonsselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + presenceselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "call") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + buttonsselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + queueeselect.container.value + "" } });
            }
            else {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + buttonsselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + destinationText.getValue() + "" } });
            }
        }
        // Window Submit
        if (choosentype == 2) {
            if (actionsselect.container.value === "working") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + windowselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + workingselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "presence") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + windowselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + presenceselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "call") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + windowselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + queueeselect.container.value + "" } });
            }
            else {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + windowselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + destinationText.getValue() + "" } });
            }
        }
        // Motion Submit
        if (choosentype == 3) {
            if (actionsselect.container.value === "working") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + motionselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + workingselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "presence") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + motionselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + presenceselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "call") {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + motionselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + queueeselect.container.value + "" } });
            }
            else {
                app.send({ mt: "SqlExec", src: "set-action", statement: "set-action", args: { actionid: "" + choosenaction + "", button: "" + motionselect.container.value + "", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + destinationText.getValue() + "" } });
            }
        }
        if (choosentype == 4) {
            if (actionsselect.container.value === "working") {
                app.send({ mt: "SqlExec", src: "set-action-phone", statement: "set-action-phone", args: { actionid: "" + choosenaction + "", button: "-", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + workingselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "presence") {
                app.send({ mt: "SqlExec", src: "set-action-phone", statement: "set-action-phone", args: { actionid: "" + choosenaction + "", button: "-", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + presenceselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "call") {
                app.send({ mt: "SqlExec", src: "set-action-phone", statement: "set-action-phone", args: { actionid: "" + choosenaction + "", button: "-", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + queueeselect.container.value + "" } });
            }
            else {
                app.send({ mt: "SqlExec", src: "set-action-phone", statement: "set-action-phone", args: { actionid: "" + choosenaction + "", button: "-", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + destinationText.getValue() + "" } });
            }
        }
        if (choosentype == 5) {
            if (actionsselect.container.value === "working") {
                app.send({ mt: "SqlExec", src: "set-action-hotkey", statement: "set-action-hotkey", args: { actionid: "" + choosenaction + "", button: "-", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + workingselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "presence") {
                app.send({ mt: "SqlExec", src: "set-action-hotkey", statement: "set-action-hotkey", args: { actionid: "" + choosenaction + "", button: "-", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + presenceselect.container.value + "" } });
            }
            else if (actionsselect.container.value === "call") {
                app.send({ mt: "SqlExec", src: "set-action-hotkey", statement: "set-action-hotkey", args: { actionid: "" + choosenaction + "", button: "-", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + queueeselect.container.value + "" } });
            }
            else {
                app.send({ mt: "SqlExec", src: "set-action-hotkey", statement: "set-action-hotkey", args: { actionid: "" + choosenaction + "", button: "-", option: "" + actionsselect.container.value + "", sipuser: "" + destinationInput.getValue() + "", text: "" + destinationText.getValue() + "" } });
            }
        }
    };

    const closebutton = new innovaphone.ui1.Div(null, texts.text("close"), "button");
    closebutton.container.onclick = function () {
        optionsdeviceDiv.container.style.display = "none";
        optionopen = false;
    };

    optionsdeviceDiv.add(optionsdeviceLabel);
    optionsdeviceDiv.add(buttonsselect);
    optionsdeviceDiv.add(windowselect);
    optionsdeviceDiv.add(motionselect);
    optionsdeviceDiv.add(actionsselect);
    optionsdeviceDiv.add(destinationInput);
    optionsdeviceDiv.add(destinationText);
    optionsdeviceDiv.add(destinationText);
    optionsdeviceDiv.add(workingselect);
    optionsdeviceDiv.add(presenceselect);
    optionsdeviceDiv.add(queueeselect);
    optionsdeviceDiv.add(submitbutton);
    optionsdeviceDiv.add(closebutton);

    main.add(optionsdeviceDiv);

    /** Only for Testing of Location
    // Creating the rectangle with a horizontal line in the middle
    const rectangleContainer = new innovaphone.ui1.Div(null, null, "rectangle-container");
    rectangleContainer.container.style.width = "500px";
    rectangleContainer.container.style.height = "500px";
    rectangleContainer.container.style.border = "2px solid black";
    rectangleContainer.container.style.position = "relative";

    // Creating the horizontal line
    const horizontalLine = new innovaphone.ui1.Div(null, null, "horizontal-line");
    horizontalLine.container.style.position = "absolute";
    horizontalLine.container.style.top = "50%";
    horizontalLine.container.style.left = "0";
    horizontalLine.container.style.width = "100%";
    horizontalLine.container.style.height = "2px";
    horizontalLine.container.style.backgroundColor = "black";

    // Adding the horizontal line to the rectangle container
    rectangleContainer.add(horizontalLine);

    // Adding the rectangle container to the main Div
    main.add(rectangleContainer);

    // Create a red circle for the upper half
    const upperCircle = new innovaphone.ui1.Div(null, null, "upper-circle");
    upperCircle.container.style.position = "absolute";
    upperCircle.container.style.top = "25%"; // Middle of the upper half
    upperCircle.container.style.left = "50%";
    upperCircle.container.style.transform = "translate(-50%, -50%)";
    upperCircle.container.style.width = "30px";
    upperCircle.container.style.height = "30px";
    upperCircle.container.style.backgroundColor = "red";
    upperCircle.container.style.borderRadius = "50%";
    upperCircle.container.style.display = "none"; // Initially hidden

    // Create a red circle for the lower half
    const lowerCircle = new innovaphone.ui1.Div(null, null, "lower-circle");
    lowerCircle.container.style.position = "absolute";
    lowerCircle.container.style.top = "75%"; // Middle of the lower half
    lowerCircle.container.style.left = "50%";
    lowerCircle.container.style.transform = "translate(-50%, -50%)";
    lowerCircle.container.style.width = "30px";
    lowerCircle.container.style.height = "30px";
    lowerCircle.container.style.backgroundColor = "red";
    lowerCircle.container.style.borderRadius = "50%";
    lowerCircle.container.style.display = "none"; // Initially hidden

    // Adding circles to the rectangle container
    rectangleContainer.add(upperCircle);
    rectangleContainer.add(lowerCircle);

    // Adding the rectangle container to the main Div
    main.add(rectangleContainer);
    **/

    const searchOptionsDiv = new innovaphone.ui1.Div(null, null, null);
    const searchInputDiv = searchOptionsDiv.add(new innovaphone.ui1.Div(null, null, null));
    const searchInput = searchInputDiv.add(new innovaphone.ui1.Input(null, null, texts.text("searchitem"), null, "text", null));
    searchInput.setAttribute("id", "search-input");
    searchInput.container.addEventListener('input', () => {
        filterTable(searchInput.getValue());
    });

    var tableCfg = new innovaphone.ui1.TableConfig(
        "", // Media or Container Query
        "quotations-table",  //Class         
        "width: 100%; border-collapse: collapse; align-items: center; border-radius: 8px; overflow: auto;", //Style Table
        "position: sticky; top: 0; z-index: 2;", // Style Thead
        "padding: 10px; text-align: left; border-bottom: 1px solid var(--stroke); background-color: var(--bg2); color: var(--c2); font: normal bold normal 16px/24px Titillium Web;", // Style th
        "", // Style tr
        "", // Style Tbody
        "padding: 10px; text-align: left; border: 1px solid var(--stroke); background-color: var(--card-bg);", // Style td
        "", // Style Media-Table
        "", // Style Media Thead
        "", // Style Media th
        "", // Style Media tr
        "", // Style Media Tbody
        ""  // Style Media td
    );

    var table = new innovaphone.ui1.Table(tableCfg);
    table.container.classList.add("main-tables");
    table.container.id = "dataTable";

    var columnNames = texts.text("columnNames_user");

    columnNames.forEach(function (columnName) {
        table.addColumn(null, columnName);
    });

    main.add(searchOptionsDiv);
    main.add(table);

    var buttonDivs = [];
    var choosenaction = "";
    var choosendevice = "";
    var choosentype = "";
    var optionopen = false;
    var editButtons = [];
    var deleteButtons = [];

    function app_connected(domain, user, dn, appdomain) {
        if (!loaded) {
            app.send({ api: "user", mt: "UserMessage" });
            app.send({ mt: "SqlExec", src: "get-actions", statement: "get-actions" });
            app.send({ mt: "SqlExec", src: "get-queues", statement: "get-queues" });
            loaded = true;
        }
        ownsip = app.logindata.sip;
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            if (start.args.hotkey) {
                app.send({ api: "user", mt: "StartHotkey", hotkey: start.args.hotkey });
            }
        }
        if (obj.api == "user" && obj.mt == "getOnlineDevicesResult") {
            buttonDivs[obj.id].container.style.backgroundColor = "green";
        }
        if (obj.mt == "SqlRow" && obj.statement == "get-queues") {
            const option = new innovaphone.ui1.Node("option", null, obj.cn, null);
            option.setAttribute("value", obj.cn);
            queueeselect.add(option);
        }
        if (obj.mt == "SqlRow" && obj.statement == "get-actions") {
            const d_type = devicestypes.find(b => b.id == obj.d_type);

            editButtons[obj.id] = new innovaphone.ui1.Div("margin: 10px", texts.text("edit"), "button");
            editButtons[obj.id].container.addEventListener("click", function () {
                choosenaction = obj.id;
                choosendevice = obj.d_mac;
                choosentype = obj.d_type;
                optionsdeviceDivLabel.addText("Option: " + d_type.label + " ID: " + choosendevice);
                optionsdeviceDiv.container.style.display = "block";
                if (obj.d_type == 1) {
                    buttonsselect.container.style.display = "block";
                    windowselect.container.style.display = "none";
                    motionselect.container.style.display = "none";
                    if (obj.button) {
                        buttonsselect.container.value = obj.button;
                    }
                    else {
                        buttonsselect.container.value = 1;
                    }
                }
                if (obj.d_type == 2) {
                    buttonsselect.container.style.display = "none";
                    windowselect.container.style.display = "block";
                    motionselect.container.style.display = "none";
                    windowselect.container.value = obj.button;
                }
                if (obj.d_type == 3) {
                    buttonsselect.container.style.display = "none";
                    windowselect.container.style.display = "none";
                    motionselect.container.style.display = "block";
                    motionselect.container.value = obj.button;
                }
                if (obj.d_type == 4) {
                    buttonsselect.container.style.display = "none";
                    windowselect.container.style.display = "none";
                    motionselect.container.style.display = "none";
                }
                if (obj.d_type == 5) {
                    buttonsselect.container.style.display = "none";
                    windowselect.container.style.display = "none";
                    motionselect.container.style.display = "none";
                }
                if (obj.action) {
                    if (obj.action == "presence") {
                        destinationInput.container.style.display = "none";
                        destinationText.container.style.display = "none";
                        workingselect.container.style.display = "none";
                        presenceselect.container.style.display = "block";
                        queueeselect.container.style.display = "none";
                        destinationInput.setValue(ownsip);
                        destinationText.setValue("-");
                    }
                    else if (obj.action == "working") {
                        destinationInput.container.style.display = "none";
                        destinationText.container.style.display = "none";
                        workingselect.container.style.display = "block";
                        presenceselect.container.style.display = "none";
                        queueeselect.container.style.display = "none";
                        destinationInput.setValue(ownsip);
                        destinationText.setValue("-");
                    }
                    else if (obj.action == "call") {
                        destinationInput.container.style.display = "none";
                        destinationText.container.style.display = "none";
                        workingselect.container.style.display = "none";
                        presenceselect.container.style.display = "none";
                        queueeselect.container.style.display = "block";
                        destinationInput.container.style.display = "block";
                        destinationText.setValue("-");
                    }
                    else {
                        destinationInput.container.style.display = "block";
                        destinationText.container.style.display = "block";
                        workingselect.container.style.display = "none";
                        presenceselect.container.style.display = "none";
                        queueeselect.container.style.display = "none";
                    }
                    if (obj.sip) {
                        destinationInput.setValue(obj.sip);
                    }
                    else {
                        destinationInput.setValue("");
                    }

                    if (obj.text) {
                        destinationText.setValue(obj.text);
                    }
                    else {
                        destinationText.setValue("");
                    }
                    actionsselect.container.value = obj.action;
                }
            });
            deleteButtons[obj.id] = new innovaphone.ui1.Div(null, texts.text("delete"), "button");
            deleteButtons[obj.id].container.onclick = function () {
                app.send({ mt: "SqlExec", src: "deletedevice", statement: "deletedevice", args: { actionid: "" + obj.id + "" } });
                table.removeRow(obj.id);
            };

            var configContainer = new innovaphone.ui1.Div(null, null, "optionsDiv");
            configContainer.add(editButtons[obj.id]);
            configContainer.add(deleteButtons[obj.id]);

            var command = obj.text;

            if (obj.action === "presence") {
                const presence = presenceactions.find(b => b.id == obj.text);
                command = presence ? presence.label : null;
            }


            var trigger = obj.button;

            buttons.forEach(button => {
                if (button.id == trigger && obj.d_type == 1) {
                    trigger = button.label;
                }
            });

            var rowData = [d_type.label, obj.d_mac, trigger, obj.action, obj.sip, command, configContainer];
            table.addRow(obj.id, rowData);
        }
        if (obj.mt === "SqlInsertResult" && obj.statement == "add-device") {
            location.reload();
        }
        if (obj.mt === "SqlExecResult" && obj.statement === "set-action") {
            location.reload();
        }
        if (obj.mt === "SqlExecResult" && obj.statement === "set-action-phone") {
            location.reload();
        }
        if (obj.mt === "SqlExecResult" && obj.statement === "set-action-hotkey") {
            location.reload();
        }
        /** Only for Testing Location
        if (obj.mt == "Location") {
            if (obj.location == 2) {
                upperCircle.container.style.display = "block";
                lowerCircle.container.style.display = "none";
            }
            if (obj.location == 1) {
                upperCircle.container.style.display = "none";
                lowerCircle.container.style.display = "block";
            }
        }
        */
    }

    function filterTable(value) {
        var filterText = value.toLowerCase();
        var tableRows = table.getRows();

        for (var rowId in tableRows) {
            var row = tableRows[rowId];
            var tds = row.tds;

            var matchFound = tds.some(td => td.container.textContent.toLowerCase().includes(filterText));

            if (matchFound) {
                tds[0].container.parentElement.style.display = "table-row";
            } else {
                tds[0].container.parentElement.style.display = "none";
            }
        }
    }
}

innovaphone.buttons.prototype = innovaphone.ui1.nodePrototype;
