/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"project9/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});