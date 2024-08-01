/*global QUnit*/

sap.ui.define([
	"comzskrep/zskillreport/controller/skillReport.controller"
], function (Controller) {
	"use strict";

	QUnit.module("skillReport Controller");

	QUnit.test("I should test the skillReport controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
