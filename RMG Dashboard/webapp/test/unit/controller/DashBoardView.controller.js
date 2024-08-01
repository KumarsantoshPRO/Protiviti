/*global QUnit*/

sap.ui.define([
	"rmg/rmg_dashboard/controller/DashBoardView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("DashBoardView Controller");

	QUnit.test("I should test the DashBoardView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
