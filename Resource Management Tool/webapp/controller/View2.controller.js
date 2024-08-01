sap.ui.define([

    "sap/ui/core/mvc/Controller",

    'sap/ui/model/json/JSONModel',

    'sap/m/Label',

    'sap/ui/model/Filter',

    'sap/ui/model/FilterOperator',
    
    'sap/ui/core/Fragment'


],

/**

 * @param {typeof sap.ui.core.mvc.Controller} Controller

 */

function (Controller, JSONModel, Filter, FilterOperator, Fragment) {

    "use strict";
    return Controller.extend("rmtool1.controller.View2", {
        onInit: function () {
            this.empName = "";
            this.getOwnerComponent().getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

            // itemCount:0
            // // this.getView().setModel(localGlobalModel);
            // this.updateItemCount();

        },
        onRouteMatched: function (oEvent) {
            var selectedEmployeeId = oEvent.getParameter("arguments").employeeId;
            var selectedEmployeeLevel = oEvent.getParameter("arguments").empLevel;
            var selectedTrackLead = oEvent.getParameter("arguments").trackLead;
            
            
            
            var that = this;
            var vLength=sap.ui.getCore().getModel("FeederModelForApproveType").getData().items.length;
            // sap.ui.getCore().getModel("FeederModelForApproveType").getData()
            this.empName = "";
            for (var i = 0; i < vLength; i++) {
                var empCode = sap.ui.getCore().getModel("FeederModelForApproveType").getData().items[i].EmpCode;
                
                var trackLead = sap.ui.getCore().getModel("FeederModelForApproveType").getData().items[i].TrackLead;

                if (selectedEmployeeId === empCode) {
                    
                    if(!this.empName){
                    this.empName = sap.ui.getCore().getModel("localGlobalModel").getData().items[i].ResourceName;
                 
                    }
                    var localJSONModel = new sap.ui.model.json.JSONModel(sap.ui.getCore().getModel("localGlobalModel").getData().items[i]);
                    that.getView().setModel(localJSONModel, "localModel");
                    for(var j=0;j<vLength;j++){
                        if(this.empName === sap.ui.getCore().getModel("localGlobalModel").getData().items[j].TrackLead){
                    this._isLead = true;
                        }
                        
                    }
                   
                }
                // if (selectedEmployeeLevel === empLevel) {
                //     var localJSONModel = new sap.ui.model.json.JSONModel(sap.ui.getCore().getModel("FeederModelForApproveType").getData().items[i]);
                //     that.getView().setModel(localJSONModel, "localModel");
                // }
                // if (selectedTrackLead === trackLead) {
                //     var localJSONModel = new sap.ui.model.json.JSONModel(sap.ui.getCore().getModel("FeederModelForApproveType").getData().items[i]);
                //     that.getView().setModel(localJSONModel, "localModel");
                // }
            }
            
            if(this._isLead){
                this._localData = [];
                for(var k=0;k<sap.ui.getCore().getModel("localGlobalModel").getData().items.length;k++){
                    if(this.empName === sap.ui.getCore().getModel("localGlobalModel").getData().items[k].TrackLead)
                    {
                        this._localData.push(sap.ui.getCore().getModel("localGlobalModel").getData().items[k]);
                    }
                }
            }
            
            var _localModelForEmployee = {"employeeList":this._localData}
            var _localJSONModelForEmployee = new sap.ui.model.json.JSONModel(_localModelForEmployee);
            this.getView().setModel(_localJSONModelForEmployee,"_localJSONModelForEmployee");
            var oModel = this.getView().getModel("_localJSONModelForEmployee");
            
            this.getView().getModel("_localJSONModelForEmployee").refresh();
            var aEmployeeList = {"employeeList":this._localData}
            this.getView().byId("itemCountLabel").setText("No of Reportees:" + aEmployeeList.length);
            
            var numberofRows = this.getView().byId("tblEmployeeList").getItems().length;
            this.getView().byId("itemCountLabel").setText(numberofRows);
            var numofItems = new sap.ui.model.json.JSONModel({
                rowCount: numberofRows
            });
            that.getView().setModel(numofItems, "numofItems");
            that.getView().byId("tblEmployeeList").setText("No of Reportees:" + numberofRows);

        },
        // updateItemCount: function(){
        //     // var oModel = sap.ui.getCore().getModel("localGlobalModel").getData().items;
        //     // // var aItems = oModel.getData().items.length;
        //     // oModel.setProperty("/itemCount",oModel.length);
        // },

        // viewData: function(oEvent){
        //     this.feeederModel = that.localModel;
        //     var localJSONModel2 = new sap.ui.getCore().getModel("FeederModelForApproveTypes").getData().items
        //     var that = this;
        //     that.getView().setModel(localJSONModel2, "localModel2");
        // },

        EmpLevel: function (oEvent) {
            // var selectedEmployeeLevel = oEvent.getParameter("arguments").EmpLevel;
            // var that = this;
            // for (var i = 0; i < sap.ui.getCore().getModel("FeederModelForApproveType").getData().items.length; i++){
            // var EmpLevel =  sap.ui.getCore().getModel("FeederModelForApproveType").getData().items[i].Level;
            // // var User1 = Managing Director;
            // // var User2 = Director;
            // // var User3 = Associate Director;
            // // var User4 = Senior Manager;
            // // var User5 = Deputy Manager;
            // // var User6 = Manager;

            //     if (selectedEmployeeLevel === EmpLevel){
            //         var localJSONModel1 = new sap.ui.model.json.JSONModel(sap.ui.getCore().getModel("FeederModelForApproveType").getData().items[i]);
            //         that.getView().setModel(localJSONModel1, "localModel1"); 
            //     }
            // }
            
            var selectedEmployeeLevel = oEvent.getParameter("arguments").EmpLevel;
            
            var that = this;
            // var topManagementLevels = selectedEmployeeLevel;
            var topManagementLevels = ["Managing Director", "Director", "Associate Director", "Senior Manager", "Deputy Manager", "Manager"];
            var topManagementUsers = [];

            // Iterate through the data to find top management users
            for (var i = 0; i < sap.ui.getCore().getModel("FeederModelForApproveType").getData().items.length; i++) {
                var user = sap.ui.getCore().getModel("FeederModelForApproveType").getData().items[i].Level;
                
                if (topManagementLevels.includes(user.Level) && selectedEmployeeLevel === EmpLevel) {
                    topManagementUsers.push(user);
                }
            }

            // Get the resource names for top management users
            var topManagementResourceNames = topManagementUsers.map(function (user) {
                return user.ResourceName;
            });

            // Find users with the same resource name in the track lead column
            var usersWithSameResourceName = sap.ui.getCore().getModel("FeederModelForApproveType").getData().items.filter(function (user) {
                return topManagementResourceNames.includes(user.TrackLead);
            });

            // Display the data of users with the top management resource name in their track lead column
            usersWithSameResourceName.forEach(function (user) {
                var localJSONModel1 = new sap.ui.model.json.JSONModel(user);
                that.getView().setModel(localJSONModel1, "localModel1");
            });

        },
        RepData: function (oEvent) {
            this.EmpLevel();



        },
        // onClickofItem: function (oEvent) {
        //     // var empCode =  oEvent.get
        //     this.getOwnerComponent().getRouter().navTo("RouteView2", {
               
        //         employeeId: oEvent.getSource().getAggregation("cells")[0].getText(),
        //         empLevel: oEvent.getSource().getAggregation("cells")[1].getText(),
        //         trackLead: oEvent.getSource().getAggregation("cells")[3].getText()
                
        //     });
           
        // },



        // onLocationChange: function (oEvent) {
        //     // const selectedValues = oEvent.mParameters.value;
        //     var selectedValues = oEvent.getParameter("changedItem").getText();
        //     if (this.selectedLocationArr.includes(selectedValues)) {
        //         const index = this.selectedLocationArr.indexOf(selectedValues);
        //         this.selectedLocationArr.splice(index, 1);
        //     } else
        //     {
        //         this.selectedLocationArr.push(selectedValues);
        //     }

        //     // this.onLocationChange.refresh(true);
        // },
        // onLocationChange: function (oEvent) {

        //     var selectedValues = oEvent.getParameter("changedItem").getText();

        //     if (this.selectedLocationArr.includes(selectedValues)) {

        //         const index = this.selectedLocationArr.indexOf(selectedValues);

        //         this.selectedLocationArr.splice(index, 1);

        //     } else

        //     {

        //         this.selectedLocationArr.push(selectedValues);

        //     }
        // },
        // onLevelChange: function (oEvent) {

        //     // const selectedValues = oEvent.mParameters.value;
        //     var selectedValues = oEvent.getParameter("changedItem").getText();
        //     if (this.selectedLevelArr.includes(selectedValues)) {
        //         const index = this.selectedLevelArr.indexOf(selectedValues);
        //         this.selectedLevelArr.splice(index, 1);
        //     } else {
        //         this.selectedLevelArr.push(selectedValues);
        //     }
        // },
        // onTrackModuleChange: function (oEvent) {

        //     // const selectedValues = oEvent.mParameters.value;
        //     var selectedValues = oEvent.getParameter("changedItem").getText();
        //     if (this.selectedTrackModArr.includes(selectedValues)) {

        //         const index = this.selectedTrackModArr.indexOf(selectedValues);

        //         this.selectedTrackModArr.splice(index, 1);

        //     } else {

        //         this.selectedTrackModArr.push(selectedValues);

        //     }

        //     // this.onTrackModuleChange.refresh(true);

        // },
        // onUpload: function (e) {

        //     this._import(e.getParameter("files") && e.getParameter("files")[0]);

        // },
        // _import: function (file) {

        //     var that = this;

        //     var excelData = {};

        //     if (file && window.FileReader) {

        //         var reader = new FileReader();

        //         reader.onload = function (e) {

        //             var data = e.target.result;

        //             var workbook = XLSX.read(data, {

        //                 type: 'binary'

        //             });

        //             workbook.SheetNames.forEach((sheetName) => {

        //                 excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

        //                 // console.log(excelData)

        //                 excelData.map(data => {

        //                     that.excelDataArr.push(data);

        //                 });

        //                 that.localModel.setData({

        //                     items: excelData

        //                 });
        //                 that.getView().setModel(this.localModel, "localModel")

        //             });

        //             that.localModel.refresh(true);

        //         };

        //         reader.onerror = function (ex) {

        //             console.log(ex);

        //         };

        //         reader.readAsBinaryString(file);

        //     }

        // },
        // onSelectionChange: function (oEvent) {
        //     this._applyFilters();
        // },
        // onSearch: function () {

        //     const combDataSet = new Set([...this.selectedLocationArr, ...this.selectedLevelArr, ...this.selectedTrackModArr]);

        //     if ([...combDataSet].length > 0) {
        //         if (this.selectedLocationArr.length > 0) {

        //             console.log(this.excelDataArr.filter(item => this.selectedLocationArr.includes(item.Location)));

        //             this._dynamicGenTable(this.excelDataArr.filter(item => this.selectedLocationArr.includes(item.Location)));

        //         }

        //         if (this.selectedLevelArr.length > 0) {

        //             this._dynamicGenTable(this.excelDataArr.filter(item => this.selectedLevelArr.includes(item.Level)));

        //         }

        //         if (this.selectedTrackModArr.length > 0) {

        //             this._dynamicGenTable(this.excelDataArr.filter(item => this.selectedTrackModArr.includes(item.TrackModule)));

        //         }

        //     } else {

        //         this._dynamicGenTable(this.excelDataArr);

        //     }

        //     this.onSelectionChange;

        // },
        // _dynamicGenTable: function (data) {

        //     this.localModel.setData({

        //         items: data

        //     });
        //     this.getView().setModel(this.localModel, "localModel")

        // },
        // onNextPage: function () {
        //     this.getOwnerComponent().getRouter().navTo("RouteView2", {

        //         employeeId: "91681"
        //     });

        // },
        onBackPage: function () {

            this.getOwnerComponent().getRouter().navTo("RouteView1", {
                employeeId: "0001"
                
            });
        // _localJSONModelForEmployee.refresh(true);
        },
        // onListItemPress: function () {

        // }
        // // _applyFilters: function () {
        // //     var aFilters = [];
        // //     var filterBar = this.getView().byId("filterbar");

        // //     filterBar.getFilterGroupItems().forEach(function (filterGroupItem) {
        // //         var control = filterGroupItem.getControl();
        // //         var selectedKeys = control.getSelectedKeys();

        // //         if (selectedKeys.length > 0) {
        // //             var filter = new sap.ui.model.Filter(filterGroupItem.getName(), sap.ui.model.FilterOperator.EQ, selectedKeys);
        // //             aFilters.push(filter);
        // //         }
        // //     });

        // //     var table = this.getView().byId("_IDGenTable1");
        // //     var binding = table.getBinding("items");
        // //     binding.filter(aFilters);

        // //     // Refresh the table
        // //     table.getModel("localModel").refresh(true);
        // // },
        onBlock: function(oEvent){
            var oView = this.getView();
           if(!this.byId("reasonDialog")){
            sap.ui.core.Fragment.load({
                id:oView.getId(),
                name:"rm.rmtool.view.fragments.reasonDialog",
                Controller: this
            }).then(function(oDialog){
                oView.addDependent(oDialog);
                oDialog.open();
            });
           }else{
            this.byId("reasonDialog").open();
           }
        },
        onPressCancel: function(){
            var oView = this.getView();

            this.byId("reasonDialog").close();
        }

    });

});