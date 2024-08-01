sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "in/protiviti/employeeallocation/model/formatter",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",

  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, formatter, Fragment, MessageBox, MessageToast, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("in.protiviti.employeeallocation.controller.Detail", {
      formatter: formatter,
      onInit: function () {
        var oViewModel = new JSONModel({
          tableData: [{}],
          resourseName: false,
          showResourcebtn: true,
          create: true,
          showAvailablebtn: false,
          addRowbtn: true,
          deleteRowbtn: true,
          duplicateRowBtn: true,
          //Save,cancel,edit btn visiblity, editable
          editable: false,
          visible: true,
        });
        this.getView().setModel(oViewModel, "oViewModel");
        this.oRouter = this.getOwnerComponent().getRouter();
        this.getView().getModel("oViewModel").setProperty("/editable", false);
        this.getView().getModel("oViewModel").setProperty("/visible", true);

        this.oModel = this.getOwnerComponent().getModel();

        var oNameModel = new JSONModel();
        this.getView().setModel(oNameModel, "oNameModel");

        var filter2 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "EMPLOYEE_LIST",
        });

        this.oModel.read("/es_value_helps", {
          filters: [filter2],
          success: function (oData) {
            oNameModel.setData(oData.results);
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          },
        });

        this.oModel.read("/es_availaible_employees", {
          success: function (oData) {
            this.getView().setModel(new JSONModel(oData.results), "oEmployeeModel");
          }.bind(this),
        });

        // this.oRouter = this.getOwnerComponent().getRouter();
        // this.oRouter.getRoute().attachPatternMatched(this.onObjectMatched, this);
        this.oRouter.getRoute("Detail").attachPatternMatched(this.onObjectMatched, this);
        //this.getDetailsViewData();
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
          value1: domainName,
        });

        this.oModel.read("/es_value_helps", {
          filters: [filter],
          success: function (oData) {
            var model = that.getView().getModel(modelName);
            model.setData(oData.results);

            // if (domainName === "EMPLOYEE_LIST") {
            //     that.setComboBoxData(oData.results);
            // }
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          },
        });
      },

      onObjectMatched: function (oEvent) {
        this.getView().setBusy(true);
        var sProjectId = oEvent.getParameter("arguments").Id;
        this.oModel.read("/es_availaible_employees", {
          success: function (oData) {
            this.getView().setModel(new JSONModel(oData.results), "oEmployeeModel");
            this.getProjectDetails(sProjectId);
          }.bind(this),
        });
      },

      getProjectDetails: function (sProjectId) {
        var oProjectModel = new JSONModel();
        this.getView().getModel("oViewModel").setProperty("/editable", false);
              this.getView().getModel("oViewModel").setProperty("/visible", true);
        var cusFilter = new sap.ui.model.Filter({
          path: "ProjectCode",
          operator: "EQ",
          value1: sProjectId,
        });
        this.oModel = this.getOwnerComponent().getModel();
        this.oModel.read("/es_project_new", {
          filters: [cusFilter],
          urlParameters: {
            $expand: "mapping",
          },
          success: function (oData) {
            var oHeaderModel = new JSONModel();
            oHeaderModel.setData(oData.results[0]);
            // console.log(oData.results[0]);
            this.getView().setModel(oHeaderModel, "HeaderData");
            // Set Mapping data to a model
            var oResMapping = new JSONModel();
            oResMapping.setData(oData.results[0].mapping.results);

            // console.log(oData.results[0].mapping.results);
            var oMapData = oData.results[0].mapping.results;
            //Filter using start Date

            let sortedInput = oMapData.slice().sort((a, b) => b.StartDate - a.StartDate);
            console.log(sortedInput);

            //***end***/
            this.getView().setModel(oResMapping, "ResMapping");
            //this.mappingEmployeeOnSkillSet(oData.results[0].mapping.results);
            this.getView().setBusy(false);
            // console.log(oFormModel);
          }.bind(this),
          error: function (oError) {
            console.error("Error reading es_customer_master:", oError);
            this.getView().setBusy(false);
          }.bind(this),
        });
      },
      getEmployeeNameDetails: function (value) {
        if (this.getView().getModel("oEmployeeModel") && this.getView().getModel("oViewModel").getProperty("/editable") === false) {
          var aEmployees = this.getView().getModel("oEmployeeModel").getData();
          // var value= oData.results[0].mapping.results.PernrD

          for (var i = 0; i < aEmployees.length; i++) {
            if (aEmployees[i].EmployeeId === value) {
              return aEmployees[i].EmployeeName;
            }
          }
        } else if (this.getView().getModel("oViewModel").getProperty("/editable") === true) {
          return value;
        }
      },
      mappingEmployeeOnSkillSet: function (arrResults) {
        debugger;
        var filerArray = new Array();
        var cusFilter = new sap.ui.model.Filter({
          path: "Module",
          operator: "EQ",
          value1: arrResults[0].EmployeeSkill,
        });
        filerArray.push(cusFilter);

        var sDateFilter = new sap.ui.model.Filter({
          path: "StartDate",
          operator: "EQ",
          value1: arrResults[0].StartDate,
        });
        filerArray.push(sDateFilter);

        var eDateFilter = new sap.ui.model.Filter({
          path: "EndDate",
          operator: "EQ",
          value1: arrResults[0].EndDate,
        });
        filerArray.push(eDateFilter);
        //return;
        this.oModel.read("/es_availaible_employees", {
          filters: filerArray,
          success: function (oData) {
            var oHeaderModel = new JSONModel();
            oHeaderModel.setData(oData.results);
            this.getView().setModel(oHeaderModel, "HeaderData");
            debugger;
            // Set Mapping data to a model
            // var oResMapping = new JSONModel();
            // oResMapping.setData(oData.results[0].mapping.results);
            // this.getView().setModel(oResMapping, "ResMapping");
            //this.mappingEmployeeOnSkillSet(oData.results[0].mapping.results);
            this.getView().setBusy(false);
            // console.log(oFormModel);
          }.bind(this),
          error: function (oError) {
            console.error("Error reading es_customer_master:", oError);
            this.getView().setBusy(false);
          },
        });
      },

      onValueHelpRequestResource: function (oEvent) {
        var oButton = oEvent.getSource(),
          oView = this.getView();
        this.index = parseInt(oEvent.getSource().getParent().getId().split("myTable-")[1]);
        if (!this._pDialogPrdList) {
          this._pDialogPrdList = Fragment.load({
            id: oView.getId(),
            name: "in.protiviti.employeeallocation.view.EmployeeListonSkill",
            controller: this,
          }).then(function (oDialogList) {
            oView.addDependent(oDialogList);
            return oDialogList;
          });
        }

        this._pDialogPrdList.then(
          function (oDialogPrdList) {
            var oSelectedObject = this.getView().getModel("ResMapping").getData()[this.index];
            var filterArray = new Array();
            var cusFilter = new sap.ui.model.Filter({
              path: "Module",
              operator: "EQ",
              value1: "00", //oSelectedObject.EmployeeSkill
            });
            filterArray.push(cusFilter);

            var sDateFilter = new sap.ui.model.Filter({
              path: "StartDate",
              operator: "EQ",
              value1: oSelectedObject.StartDate,
            });
            filterArray.push(sDateFilter);

            var eDateFilter = new sap.ui.model.Filter({
              path: "EndDate",
              operator: "EQ",
              value1: oSelectedObject.EndDate,
            });
            filterArray.push(eDateFilter);

            var oTable = this.getView().byId("idResourceListTable");
            var sTemp = new sap.m.ColumnListItem({
              cells: [
                new sap.m.Text({
                  text: "{EmployeeId}",
                }),

                new sap.m.Text({
                  text: "{EmployeeName}",
                }),

                new sap.m.Text({
                  text: "{EmployeDesig}",
                }),
                new sap.m.Text({
                  text: "{CurrentMtd}",
                }),
                new sap.m.Text({
                  text: "{Ytd}",
                }),
              ],
            });
            var oTableABindingInfo = {
              path: "/es_availaible_employees",
              template: sTemp,
              filters: filterArray,
            };

            oTable.bindAggregation("items", oTableABindingInfo);
            oDialogPrdList.open();
          }.bind(this)
        );
        // debugger;
      },

      handleCloseResourceDialog: function () {
        if (this._pDialogPrdList) {
          //this.getView().getDependents()[1].close();
          // this.getView().getModel("oFormModel").setProperty("/Satnr", "");
        }
      },

      handleConfirmResourceDialog: function (oEvent) {
        var obj = oEvent.getParameter("selectedItems")[0].getBindingContext().getObject();
        this.getView().byId("myTable").getItems()[this.index].getCells()[7].setValue(obj.EmployeeName);
        this.getView()
          .getModel("ResMapping")
          .setProperty("/" + this.index + "/PernrD", obj.EmployeeName);
        //obj.EmployeeId
        this.getView().byId("idResourceName").setValue(obj.EmployeeName);
      },

      handleSearchResource: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var arrFilters = [];
        // var oFilter1 = new Filter("EmployeeId", FilterOperator.EQ, sValue);
        var oFilter1 = new sap.ui.model.Filter({
          path: "EmployeeName",
          operator: "EQ",
          value1: sValue,
        });
        arrFilters.push(oFilter1);
        // var oBinding = oEvent.getSource().getBinding("items");
        // oBinding.filter(arrFilters);
        var sTemp = new sap.m.ColumnListItem({
          cells: [
            new sap.m.Text({
              text: "{EmployeeId}",
            }),

            new sap.m.Text({
              text: "{EmployeeName}",
            }),

            new sap.m.Text({
              text: "{EmployeDesig}",
            }),
            new sap.m.Text({
              text: "{LastMtd}",
            }),
            new sap.m.Text({
              text: "{Ytd}",
            }),
          ],
        });
        var oTableABindingInfo = {
          path: "/es_availaible_employees",
          template: sTemp,
          filters: arrFilters,
        };
        oEvent.getSource().bindAggregation("items", oTableABindingInfo);
      },
      onAddRow: function () {
        var oHeaderData = this.getView().getModel("HeaderData").getData();
        var oModel = this.getView().getModel("ResMapping");
        var aTableData = oModel.getData();

        var oNewRow = {
          AllocationPer: "",
          AssignmentCode: "",
          AssignmentType: "",
          AssignmentTypeText: "",
          City: "",
          CustomerCode: "",
          CustomerName: "",
          DesignationReq: "",
          DesignationText: "",
          EmployeeSkill: "",
          EmployeeSkillText: "",
          EndDate: oHeaderData.EndDate,
          PernrD: "",
          ProjectCode: "",
          ProjectLocation: "",
          ProjectName: "",
          ProjectType: "",
          ProjectTypeText: "",
          Remarks: "",
          StartDate: oHeaderData.StartDate,
        };
        aTableData.push(oNewRow);
        oModel.setData(aTableData);
        // oModel.setData(aTableData);
        this.getView().setModel(oModel, "ResMapping");
      },
      onDeleteRows: function () {
        var oTable = this.byId("myTable");
        var aSelectedItems = oTable.getSelectedItems();
        if (aSelectedItems.length > 0) {
            var oModel = this.getView().getModel("ResMapping");
            var aTableData = oModel.getData();
            for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                var oSelectedItem = aSelectedItems[i];
                var oContext = oSelectedItem.getBindingContext("ResMapping");
                var nIndex = oContext.getPath().substr(1);
                aTableData.splice(nIndex, 1);
            }
            oModel.setData(aTableData);
            oTable.removeSelections();
        } else {
          sap.m.MessageBox.error("Please select at least one row to delete.");
        }
    },    
      onDuplicateRow: function () {
        var oTable = this.getView().byId("myTable");
        var aSelectedItems = oTable.getSelectedItems();
        if (aSelectedItems.length === 1) {
            var oSelectedRow = aSelectedItems[0];
            var oSelectedRowContext = oSelectedRow.getBindingContext("ResMapping");
            var oDataModel = oSelectedRowContext.getProperty();
            var oNewData = jQuery.extend({}, oDataModel);
            var oTableData = this.getView().getModel("ResMapping").getData();
            oTableData.push(oNewData);
            this.getView().getModel("ResMapping").setData(oTableData);
        } else {
          sap.m.MessageToast.show("Please select one row to duplicate.");
        }
    },  

      onBack: function () {
        this.getView().getModel("oViewModel").setProperty("/editable", false);
        this.getView().getModel("oViewModel").setProperty("/visible", true);
        this.oRouter.navTo("RouteView1");
        
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
      onSave: function () {
       
      
        this.getView().setBusy(true);
        var oHeaderData = this.getView().getModel("HeaderData").getData();
        var aEmployees = this.getView().getModel("oEmployeeModel").getData();
         var oResourceMappingData = this.getView().getModel("ResMapping").getData();
        for (var j = 0; j < oResourceMappingData.length; j++) {
          for (var i = 0; i < aEmployees.length; i++) {
            if (aEmployees[i].EmployeeName === oResourceMappingData[j].PernrD) {
              oResourceMappingData[j].PernrD = aEmployees[i].EmployeeId;
              oResourceMappingData[j].ProjectCode=oHeaderData.ProjectCode;
              oResourceMappingData[j].City = oHeaderData.ProjectCity;
              oResourceMappingData[j].ProjectName = oHeaderData.ProjcetName;
              oResourceMappingData[j].CustomerName = oHeaderData.CustomerName;
              oResourceMappingData[j].DesignationReq = oResourceMappingData[j].DesignationReq;
              oResourceMappingData[j].ProjectLocation = oHeaderData.ProjectLocation;
              oResourceMappingData[j].ProjectType = oHeaderData.ProjectType;
              oResourceMappingData[j].CustomerCode = oHeaderData.CustomerCode;


            }
          }
          
        }
        // console.log(oResourceMappingData);
        
        
        var oNewData = {
          ProjectType: oHeaderData.ProjectType,
          CustomerCode: oHeaderData.CustomerCode,
          ResponsibleManager: oHeaderData.ResponsibleManager,
          EngagmentDirector: oHeaderData.EngagmentDirector,
          EngagmentManager: oHeaderData.EngagmentManager,
          CustomerName: oHeaderData.CustomerName,
          ProjcetName: oHeaderData.ProjcetName,
          CrmCode: oHeaderData.CrmCode,
          ProjectCode: oHeaderData.ProjectCode,
          BillingType: oHeaderData.BillingType,
          ProjectLocation: oHeaderData.ProjectLocation,
          ProjectCity: oHeaderData.ProjectCity,
          StartDate: oHeaderData.StartDate,
          EndDate: oHeaderData.EndDate,
          mapping: oResourceMappingData,
        };
// console.log(oNewData);
        this.getView()
          .getModel()
          .create("/es_project_new", oNewData, {
            success: function (data, response) {
              this.getView().setBusy(false);
              // MessageToast.show(data.RETURN.results[1].Message);
              this.getView().getModel("oViewModel").setProperty("/editable", false);
              this.getView().getModel("oViewModel").setProperty("/visible", true);
              sap.m.MessageToast.show("Saved Successfully");
              
              // this.onCancel();
             
            }.bind(this),
            error: function (error) {
              this.getView().setBusy(false);
              sap.m.MessageToast.show("Failed to save Data", error);
            }.bind(this),
          });

        //this.oRouter.navTo("RouteView1");
      },

      onCancel: function () {
        
        this.getView().getModel("oViewModel").setProperty("/editable", false);
        this.getView().getModel("oViewModel").setProperty("/visible", true);
      },
      onEdit: function () {
        this.getView().getModel("oViewModel").setProperty("/visible", false);
        this.getView().getModel("oViewModel").setProperty("/editable", true);
      },
    });
  }
);
