sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("in.protiviti.newprojectrequisition.controller.View1", {
            onInit: function () {
                var that = this;
            
                var oViewModel = new JSONModel({
                    tableData: [{}],
                    resourseName: false,
                    create: true,
                    showAvailablebtn: true,
                    addRowbtn: true,
                    deleteRowbtn: true,
                    duplicateRowBtn : true
                }),
                oFormModel = new JSONModel();
                var oDataModel = new JSONModel();

                this.getView().setModel(oViewModel, "oViewModel");
                this.getView().setModel(oFormModel, "oFormModel");
                this.getView().setModel(oDataModel, "oDataModel");

                this.oModel = this.getOwnerComponent().getModel("ZPRO_RMG_PROJECT_MASTER_SRV");

                this.oModel.read("/es_customer_master", {
                    success: function (oData) {
                        oFormModel.setData(oData.results);
                    }.bind(this),
                    error: function (oError) {
                        console.error("Error reading es_customer_master:", oError);
                    },
                });
            
                var oSkillModel = new JSONModel(),    
                oRoleModel = new JSONModel(),               
                oDesignationModel = new JSONModel(),          
                oNameModel = new JSONModel(),                
                oProjectAllocModel = new JSONModel(),                
                oBillingModel = new JSONModel(),              
                oProjectTypeModel = new JSONModel();

                this.getView().setModel(oSkillModel, "oSkillModel");
                this.getView().setModel(oRoleModel, "oRoleModel");
                this.getView().setModel(oDesignationModel, "oDesignationModel");
                this.getView().setModel(oNameModel, "oNameModel");
                this.getView().setModel(oProjectAllocModel, "oProjectAllocModel");
                this.getView().setModel(oBillingModel, "oBillingModel");
                this.getView().setModel(oProjectTypeModel, "oProjectTypeModel");

                this.readValue("ZEMP_SUB_MODULE", "oSkillModel");
                this.readValue("ZASSIGNMENT_TYPE", "oRoleModel");
                this.readValue("ZEMP_DESIGNATION", "oDesignationModel");
                this.readValue("EMPLOYEE_LIST", "oNameModel");
                this.readValue("ZPROJECT_LOCATION", "oProjectAllocModel");
                this.readValue("ZPRO_BILLING_TYPE", "oBillingModel");
                this.readValue("ZPROJECT_TYPE", "oProjectTypeModel");
            },

            readValue: function (domainName, modelName) {
                var that = this;
                var filter = new sap.ui.model.Filter({
                    path: "Domname",
                    operator: "EQ",
                    value1: domainName
                });
            
                this.oModel.read("/es_value_helps", {
                    filters: [filter],
                    success: function (oData) {
                        var model = that.getView().getModel(modelName);
                        model.setData(oData.results);
                        // If domain name = "EMPLIST"
                        if (domainName === "EMPLOYEE_LIST") {
                            that.setComboBoxData(oData.results);
                        }
                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });
            },

            setComboBoxData: function(aEmpList) {
                var oDirList = this.getEngagementDirectorList(aEmpList);
                var oDirModel = new JSONModel();
                oDirModel.setData(oDirList);
                this.getView().setModel(oDirModel, "DirectorModel");
                // Set model for Engagement Manage
                var oEngMngList = this.getEngagementManagerList(aEmpList);
                var oEngMngModel = new JSONModel();
                oEngMngModel.setData(oEngMngList);
                this.getView().setModel(oEngMngModel, "EngMngModel");
                // Set model for Responsible Manage
                var oResMngList = this.getEngagementManagerList(aEmpList);
                var oResMngModel = new JSONModel();
                oResMngModel.setData(oResMngList);
                this.getView().setModel(oResMngModel, "ResMngModel");
            },

            getEngagementDirectorList: function(aEmpList) {
                var newDirectorArr = new Array();
                for(var i = 0; i < aEmpList.length; i++) {
                    if (aEmpList[i].DomvalLd === "01" || aEmpList[i].DomvalLd === "02" || aEmpList[i].DomvalLd === "03" || aEmpList[i].DomvalLd === "04") {
                        newDirectorArr.push(aEmpList[i]);
                    }
                }
                return newDirectorArr;
            },

            getEngagementManagerList: function(aEmpList) {
                var newManagerArr = new Array();
                for(var i = 0; i < aEmpList.length; i++) {
                    if (aEmpList[i].DomvalLd === "03" || aEmpList[i].DomvalLd === "04" || aEmpList[i].DomvalLd === "05" 
                            || aEmpList[i].DomvalLd === "06" || aEmpList[i].DomvalLd === "07") {
                        aEmpList[i].Desg = this.getDesgCode(aEmpList[i].DomvalLd);
                        newManagerArr.push(aEmpList[i]);
                    }
                }
                return newManagerArr;
            },

            getDesgCode: function(iVal) {
                var newDesgArray = ["MD", "SD", "D", "AD", "SM", "M", "DM"];
                var DesgIndex = parseInt(iVal, 10) - 1;
                return newDesgArray[DesgIndex];
            },

            onCreate: function() {
                if (this.validateMandatoryFields()) {
                    if (this.validateTableRows()) {
                            var oDataModel =  this.getView().getModel("oDataModel");
                            var oModelData = new JSONModel();
                            this.getView().setModel("oModelData", oModelData);
                            var oData = oDataModel.getData();
                            var oViewModel = this.getView().getModel("oViewModel");
                            var aTableData = oViewModel.getProperty("/tableData");
                            var newArray = [];
                            for(var i=0;i < aTableData.length;i++){
                                var oNewData = {
                                    "PernrD" : aTableData[i].name,
                                    "EmployeeSkill" : aTableData[i].skill,
                                    "AssignmentType" : aTableData[i].role,
                                    "DesignationReq" : aTableData[i].design,
                                    "AllocationPer" : aTableData[i].allocation,
                                    "StartDate" : aTableData[i].startDate,
                                    "EndDate" : aTableData[i].endDate,
                                    "ProjectLocation" : aTableData[i].depLocation,
                            }
                            newArray.push(oNewData);
                        }
                        var oNewData = {
                            "ProjectType" : oData.ProjectType,
                            "CustomerCode" : oData.CustomerCode,
                            "ResponsibleManager" : oData.ResponsibleManager,
                            "EngagmentDirector" : oData.EngagmentDirector,
                            "EngagmentManager" : oData.EngagmentManager,
                            "CustomerName" : oData.CustomerName,
                            "ProjcetName" : oData.ProjcetName,
                            "CrmCode" : oData.CrmCode,
                            "ProjectCode" : oData.ProjectCode,
                            "BillingType" : oData.BillingType,
                            "ProjectLocation" : oData.ProjectLocation,
                            "ProjectCity" : oData.ProjectCity,
                            "StartDate" : oData.StartDate,
                            "EndDate" : oData.EndDate,
                            "mapping" : newArray
                        };
                        //return;
                        this.oModel.create("/es_project_new", oNewData,  {
                            success: function (oData) {
                                oModelData.setData(oData);
                                MessageBox.success("Successfully Created!");
                                this.getView().getModel("oViewModel").setProperty("/create", false);
                                this.getView().getModel("oViewModel").setProperty("/showAvailablebtn", false);
                                //MessageToast.show("Requisition created successfully");
                            }.bind(this),
                            error: function (oError) {
                                console.error("Error in creating entry", oError);
                            },
                        });
                        
                    } else {
                        MessageToast.show("Please enter at least one row with all column values in the table");
                    }
                } else {
                MessageToast.show("Please fill in all mandatory fields in the form");
                }
            },

                onChangeProjLoc: function(oEvent) {
                    var sSelectedItem = oEvent.getSource().getSelectedKey();
                    var oViewModel = this.getView().getModel("oViewModel");
                    oViewModel.getData().tableData[0].depLocation = sSelectedItem;
                    oViewModel.setProperty("/depLocation", sSelectedItem);
                },

                onAddRow: function() {
                    var oModel = this.getView().getModel("oViewModel");
                    var aTableData = oModel.getProperty("/tableData");
                    var oNewRow = {
                        skillSet: "",
                        role: "",
                        desig: "",
                        depLocation: this.getView().getModel("oDataModel").getProperty("/ProjectLocation"),
                        startDate: this.getView().getModel("oDataModel").getProperty("/StartDate"),
                        endDate: this.getView().getModel("oDataModel").getProperty("/EndDate"),
                        allocation: "",
                        resourse: ""
                    };
                    aTableData.push(oNewRow);
                    oModel.setProperty("/tableData", aTableData);
                },
            
            onDeleteRow: function() {
                var oTable = this.byId("myTable");
                var aSelectedItems = oTable.getSelectedItems();
                if (aSelectedItems.length > 0) {
                    var oModel = this.getView().getModel("oViewModel");
                    var aTableData = oModel.getProperty("/tableData");
                    // aSelectedItems.forEach(function (oSelectedItem) {
                    //     var oContext = oSelectedItem.getBindingContext("oViewModel");
                    //     var nIndex = oContext.getPath().substr(1);
                    //     aTableData.splice(nIndex, 1);
                    // });
                    for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                        var oSelectedItem = aSelectedItems[i];
                        var oContext = oSelectedItem.getBindingContext("oViewModel");
                        var nIndex = oContext.getPath().substr(1).split("/")[1];
                        aTableData.splice(nIndex, 1);
                    }
                    oModel.setProperty("/tableData", aTableData);
                    oTable.removeSelections();
                } else {
                    MessageBox.error("Please select at least one row to delete.");
                }
            },
       
            onStartDateChange: function (oEvent) {
                var oStartDatePicker = oEvent.getSource();
                var oViewModel = this.getView().getModel("oViewModel");
                oViewModel.getData().tableData[0].startDate = oStartDatePicker.getDateValue();
                oViewModel.setProperty("/startDate", oStartDatePicker.getDateValue());
                var oEndDatePicker = this.getView().byId("enddate"); 
                this._validateDateRange(oStartDatePicker, oEndDatePicker);
            },
            
            onEndDateChange: function (oEvent) {
                var oEndDatePicker = oEvent.getSource();
                var oViewModel = this.getView().getModel("oViewModel");
                oViewModel.getData().tableData[0].endDate = oEndDatePicker.getDateValue();
                oViewModel.setProperty("/endDate", oEndDatePicker.getDateValue());
                var oStartDatePicker = this.getView().byId("startdate");
                this._validateDateRange(oStartDatePicker, oEndDatePicker);
            },
            
            _validateDateRange: function (oStartDatePicker, oEndDatePicker) {
                var oStartDate = oStartDatePicker.getDateValue();
                var oEndDate = oEndDatePicker.getDateValue();
            
                if (oStartDate && oEndDate && oEndDate < oStartDate) {
                    oEndDatePicker.setValueState(sap.ui.core.ValueState.Error);
                    oEndDatePicker.setValueStateText("End Date cannot be before Start Date");
                    MessageToast.show("End Date cannot be before Start Date");
                } else {
                    oEndDatePicker.setValueState(sap.ui.core.ValueState.None);
                    oEndDatePicker.setValueStateText("");
                }
            },  

            onStartDateChange1: function (oEvent) {
                var oTable = this.getView().byId("myTable");
                var aItems = oTable.getItems();
                for (var i = 0; i < aItems.length; i++) {
                var oRow = aItems[i];
                var oStartDatePicker1 = oRow.getCells()[4];
                var oEndDatePicker1 = oRow.getCells()[5];
                this._validateDateRange1(oStartDatePicker1, oEndDatePicker1);
                }
            },
            
            onEndDateChange1: function (oEvent) {
                var oTable = this.getView().byId("myTable");
                var aItems = oTable.getItems();
                for (var i = 0; i < aItems.length; i++) {
                var oRow = aItems[i];
                var oStartDatePicker1 = oRow.getCells()[4];
                var oEndDatePicker1 = oRow.getCells()[5];
                this._validateDateRange1(oStartDatePicker1, oEndDatePicker1, i);
                }
            },

            _validateDateRange1: function(oStartDatePicker1, oEndDatePicker1, rowIndex) {
                var oStart = oStartDatePicker1.getDateValue();
                var oEnd = oEndDatePicker1.getDateValue();
            
                if (oStart && oEnd) {
                    if (oEnd < oStart) {
                        oEndDatePicker1.setValueState(sap.ui.core.ValueState.Error);
                        oEndDatePicker1.setValueStateText("End Date cannot be before Start Date");
                        MessageToast.show("End Date cannot be before Start Date for row " + (rowIndex + 1));
                    } else {
                        oEndDatePicker1.setValueState(sap.ui.core.ValueState.None);
                        oEndDatePicker1.setValueStateText("");
                    }
                } else {
                    oEndDatePicker1.setValueState(sap.ui.core.ValueState.None);
                    oEndDatePicker1.setValueStateText("");
                }
            },
            
            validateTableRows: function () {
                var oTable = this.getView().byId("myTable");
                var aItems = oTable.getItems();
                for (var i = 0; i < aItems.length; i++) {
                var oRow = aItems[i];
                var [oSkillSet, oRoleComboBox, oDesignComboBox, oProjAllocComboBox, oStartDatePicker1, oEndDatePicker1, oAllocationInput] = oRow.getCells();
                if (!oSkillSet.getSelectedKey() || !oRoleComboBox.getSelectedKey() || !oDesignComboBox.getSelectedKey() ||
                    !oProjAllocComboBox.getSelectedKey() || !oStartDatePicker1.getDateValue() || !oEndDatePicker1.getDateValue() ||
                    !oAllocationInput.getValue()) {
                    [oSkillSet, oRoleComboBox, oDesignComboBox, oProjAllocComboBox, oStartDatePicker1, oEndDatePicker1, oAllocationInput].forEach(this.setFieldErrorState.bind(this));
                    return false;
                }
            }
            return true;
            },
  
            setFieldErrorState: function (oControl) {
                if (oControl.setValueState) {
                oControl.setValueState("Error");
                }
            },

            validateMandatoryFields: function () {
                var fieldsToValidate = [
                    this.getView().byId("cust1"), this.getView().byId("projloc"), this.getView().byId("projtype"),
                    this.getView().byId("billing"), this.getView().byId("manager"), this.getView().byId("director"),
                    this.getView().byId("engagemanager"), this.getView().byId("projname"), this.getView().byId("city"),
                    this.getView().byId("crm"), this.getView().byId("startdate"), this.getView().byId("enddate")
                ];
            
                return fieldsToValidate.every(this.validateField, this);
            },

            validateField: function (field) {
                if (field instanceof sap.m.ComboBox || field instanceof sap.m.Input) {
                    return this.validateFieldControl(field);
                } else if (field instanceof sap.m.DatePicker) {
                    return this.validateFieldControl(field, true);
                }
                return true;
            },
            
            validateFieldControl: function (oFieldControl, isDatePicker) {
                var value = isDatePicker ? oFieldControl.getDateValue() : oFieldControl.getValue();
                if (!value) {
                    oFieldControl.setValueState("Error");
                    oFieldControl.setValueStateText("This field is required");
                    return false;
                } else {
                    oFieldControl.setValueState("None");
                    oFieldControl.setValueStateText("");
                    return true;
                }
            },
            
            onDuplicateRow: function () {
                var oTable = this.getView().byId("myTable");
                var aSelectedItems = oTable.getSelectedItems();
                if (aSelectedItems.length === 1) {
                    var oSelectedRow = aSelectedItems[0];
                    var oSelectedRowContext = oSelectedRow.getBindingContext("oViewModel");
                    var oDataModel = oSelectedRowContext.getProperty();
                    var oNewData = jQuery.extend({}, oDataModel);
                    var oTableData = this.getView().getModel("oViewModel").getProperty("/tableData");
                    oTableData.push(oNewData);
                    this.getView().getModel("oViewModel").setProperty("/tableData", oTableData);
                } else {
                    MessageToast.show("Please select one row to duplicate.");
                }
            },            

            onSelectionChange: function () {
                var oTable = this.getView().byId("myTable");
                var aSelectedIndices = oTable.getSelectedIndices();
                var bEnableDuplicateBtn = aSelectedIndices.length === 1;
                this.getView().getModel("oViewModel").setProperty("/duplicateRowBtn", bEnableDuplicateBtn);
            }
        });
    });