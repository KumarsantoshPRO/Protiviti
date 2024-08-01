/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "rmtool1/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";
      
        return UIComponent.extend("rmtool1.Component", {
            metadata: {
                manifest: "json"
            },
   /**
            * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
                 * @public
                * @override
                 */
            init: function () {
                // call the base component's init function
                // var oRenderer = sap.ushell.Container.getRenderer("fiori2");
                // oRenderer.setHeaderVisibility(false, false, ["home", "app"]);

                // var feederModel= new sap.ui.model.json.JSONModel();
                // var localGlobalModel = new sap.ui.model.json.JSONModel();
                UIComponent.prototype.init.apply(this, arguments);
                // sap.ui.getCore().setModel(feederModel, "FeederModelForApproveType");
                // sap.ui.getCore().setModel(localGlobalModel, "localGlobalModel");
                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                var jQueryScript = document.createElement('script');
                jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/jszip.js');
                document.head.appendChild(jQueryScript);


                var jQueryScript = document.createElement('script');
                jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/xlsx.js');
                document.head.appendChild(jQueryScript);
        }
        });
    }
);