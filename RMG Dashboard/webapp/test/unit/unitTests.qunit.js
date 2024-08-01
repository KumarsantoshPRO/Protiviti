/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"rmg/rmg_dashboard/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
