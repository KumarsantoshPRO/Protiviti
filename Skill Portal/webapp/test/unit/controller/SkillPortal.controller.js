/*global QUnit*/

sap.ui.define([
	"comzsp/skillportal/controller/SkillPortal.controller"
], function (Controller) {
	"use strict";

	QUnit.module("SkillPortal Controller");

	QUnit.test("I should test the SkillPortal controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
