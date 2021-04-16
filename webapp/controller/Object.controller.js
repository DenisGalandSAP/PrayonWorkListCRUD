sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessagePopover",
    "sap/m/MessagePopoverItem",
    "../model/formatter"

], function (BaseController, JSONModel, History, MessagePopover, MessagePopoverItem, formatter) {
    "use strict";

    return BaseController.extend("project9.controller.Object", {

        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("object").attachMatched(this._onObjectMatched, this);

        },

        handleSave: function (oEvent) {
            this.oMessagePopover.openBy(oEvent.getSource());
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;
            this.sAction = oEvent.getParameter("arguments").sAction;
            //If the page has been refreshed, we wait that the metadata is loaded to proceed with the binding 
            this.getModel().metadataLoaded().then(() => {
                this._oMessageManager = sap.ui.getCore().getMessageManager();
                this._oMessageManager.registerObject(this.getView(), true);
                this.setModel(this._oMessageManager.getMessageModel(), "message");
                this._initializeMessageManager();
                if (this.sAction === "add") {
                    //Create a temporary entry in the request queue
                    var oContext = this.getModel().createEntry("ZCDSPINBALL", {
                        properties: {
                            "Tableid": sObjectId,
                            "Tablename": "",
                            "Vendorid": 1,
                            "VendorName": "",
                            "Tableyear": new Date(),
                            "Produced": 0,
                            "Units": "EA"
                        }
                    });
                    this.sPath = oContext.sPath;
                    this.getView().bindElement({
                        path: this.sPath
                    });
                    var aInputs = [this.getView().byId("inputTablename")];
                    //Retrieve error message based on the constraint
                    for (let oInput of aInputs) {
                        oInput.setValueState("Error");
                        try {
                            oInput.getBinding("value").getType().validateValue("");
                        } catch (oException) {
                            oInput.setValueStateText(oException.message);
                            this._oMessageManager.addMessages([
                                new sap.ui.core.message.Message({
                                    "message": oException.message,
                                    "target": oInput.getId(),
                                    "type": "Error"
                                })]);
                        }
                    }
                } else {
                    var sObjectPath = this.getModel().createKey("ZCDSPINBALL", {
                        Tableid: sObjectId
                    });
                    this.sPath = `/${sObjectPath}`;
                    this.getView().bindElement({
                        path: this.sPath
                    });
                }
            });
        },

        _initializeMessageManager: function () {
            this.oMessageTemplate = new MessagePopoverItem({
                type: "{message>type}",
                title: "{message>message}",
                subtitle: "{message>additionalText}",
                description: "{message>description}"
            });

            this.oMessagePopover = new MessagePopover({
                items: {
                    path: "message>/",
                    template: this.oMessageTemplate
                }
            });
            this.byId("popover").addDependent(this.oMessagePopover);
        },

        //At each focus lost or enter press in a field, the onChange event is triggered
        onChange: function (oEvent) {
            //Manually bind the vendor id and name based on the selection
            if (oEvent.getParameter("selectedItem")) {
                this.getModel().setProperty(`${this.sPath}/Vendorid`, oEvent.getParameter("selectedItem").getKey());
                this.getModel().setProperty(`${this.sPath}/VendorName`, oEvent.getParameter("selectedItem").getText());
                //For Tableyear and Produced field, manually insert or delete in the Message Manager Model 
            } else if (["Tableyear", "Produced"].includes(oEvent.getSource().getBinding("value").sPath)) {
                if (!!oEvent.getSource().getValue()) {
                    var oMessage = this._oMessageManager.getMessageModel().getData().filter((oMessage) => {
                        return oMessage.target === oEvent.getSource().getId()
                    });
                    if (oMessage) {
                        this._oMessageManager.removeMessages(oMessage);
                        oEvent.getSource().setValueState("None");
                    }
                } else {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Enter a value");
                    this._oMessageManager.addMessages([
                        new sap.ui.core.message.Message({
                            "message": "Enter a value",
                            "target": oEvent.getSource().getId(),
                            "type": "Error"
                        })]);
                }
            }
            this.getModel("app").setProperty("/objectView/saveEnabled", true);
        },

        onSave: function () {
            //The application submits the changes if there is at least one pending and the Message Manager Model is empty
            if (this.getModel().hasPendingChanges() && this._oMessageManager.getMessageModel().getData().length === 0) {
                this.getModel().submitChanges({
                    success: () => {
                        this.onNavBack()
                    }
                });
            }
        },

        onBack: function () {
            if (this.getModel().hasPendingChanges()) {
                this.getModel().resetChanges();
            }
            this._oMessageManager.removeAllMessages();
            this.onNavBack();
        }

    });

});