sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/m/library"
], function (Controller, UIComponent, History, mobileLibrary) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("../controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
        onShareEmailPress: function () {
            var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },

        navTo: function (psTarget, pmParameters, pbReplace) {
            this.getRouter().navTo(psTarget, pmParameters, pbReplace);
        },

        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.back();
            } else {
                var sDefaultRoot = this.getOwnerComponent().getManifestEntry("sap.ui5").routing.routes.find((oRoute) => {
                    return oRoute.pattern === ""
                }).name;
                this.getRouter().navTo(sDefaultRoot, {}, false);
            }
        }
    });

});