sap.ui.define(
  [
    "sap/ui/core/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageItem",
    "sap/m/MessageToast",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/format/DateFormat",
    "sap/gantt/misc/Format",
    "sap/m/MessageBox",
    "znewresource/model/formatter",
  ],

  /**
 
     * @param {typeof sap.ui.core.mvc.Controller} Controller
 
     */

  function (
    library,
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    Fragment,

    MessageItem,
    MessageToast,
    FlattenedDataset,
    FeedItem,
    Spreadsheet,
    DateFormat,
    Format,
    MessageBox,
    formatter
  ) {
    let levelArr = [];
    let locArr = [];
    let resourceArr = [];
    let subModArr = [];
    let selectedDate;

    ("use strict");

    let SortOrder = library.SortOrder;
    return Controller.extend("znewresource.controller.View1", {
      formatter: formatter,
      onInit: function () {
        this.addNewUser();
        var chartModel = new JSONModel({
          baseLoc: true,
          currLoc: false,
          subModChart: false,
          editable: false,
          locVisible: true,
          canVisible: false,
          saveLocVisible: false,
        });
        var oTable = this.byId("table");
        var oLevelComboBox = this.byId("levelComboBox");
        var visibleModel = new JSONModel({
          textVisible: true,
          dropDownVisible: false,
        });
        this.getView().setModel(visibleModel, "oVisibleModel");
        this.getView().byId("filterbar");
        this.getView().setModel(chartModel, "oChartModel");
        // this.getView().byId("Assignmenttable").setVisible(false);
        var oFormModel = new JSONModel({
          currentDate: this.getFormattedDate(),
        });

        this.getView().setModel(oFormModel, "oFormModel");

        var ofilterDataModel = new JSONModel({
          level: "",
          location: "",
          resourcename: "",
          submodule: "",
          utilization: "",
          lastupdate: "",
          LastupdUtilDate: "",
          operator: "01",
        });
        this.getView().setModel(ofilterDataModel, "FilterDataModel");
        var oLastUpdateUtil = new sap.ui.model.json.JSONModel();
        this.getView().setModel(oLastUpdateUtil, "oUtilDateModel");

        this.getDropDownValues("ZEMP_DESIGNATION", "LevelModel");
        this.getDropDownValues("ZPRO_OFFICE_LOCATION", "LocationModel");
        this.getDropDownValues("PAD_CNAME", "ResourceModel");
        this.getDropDownValues("ZEMP_SUB_MODULE", "SubmoduleModel");
        this.getDropDownValues("ZUTIL_RANGE", "UtilizationModel");
        this.oGlobalFilter = null;
        var oDateModel = new JSONModel({
          currentDate: this.getFormattedDate(),
        });
        this.getView().setModel(oDateModel, "oDateModel");
        this.getOwnerComponent()
          .getModel()
          .read("/es_rmg_main_data", {
            // filters: aFilters,
            success: function (oData) {
              this.getView().getModel("oFormModel").setData(oData.results);

              const arr = oData.results;
              const count = {};
              arr.forEach((element) => {
                count[element.Location] = (count[element.Location] || 0) + 1;
              });

              var locs = [];
              for (var i = 0; i < Object.keys(count).length; i++) {
                locs.push({
                  loc: Object.keys(count)[i],
                  value: count[Object.keys(count)[i]],
                });
              }

              var locations = {
                locations: locs,
              };
              this.getView().setModel(new JSONModel(locations), "locChart");
              this.getView().setModel(new JSONModel(locs), "locFilter");

              // task chart
              const arr2 = oData.results;
              const task = {};
              arr2.forEach((element) => {
                task[element.TaskText] = (task[element.TaskText] || 0) + 1;
              });

              var tasks = [];
              for (var i = 0; i < Object.keys(task).length; i++) {
                tasks.push({
                  tas: Object.keys(task)[i],
                  value: task[Object.keys(task)[i]],
                });
              }

              var taskproject = {
                task: tasks,
              };
              this.getView().setModel(new JSONModel(taskproject), "taskChart");
              //LocLevChart
              const loclev = oData.results;
              const loclevel = {};
              const levlevel = {};

              loclev.forEach(
                (element) => {
                  loclevel[element.DesinationText] =
                    (loclevel[element.DesinationText] || 0) + 1;
                }
                // ,{
                // loclevel,[element.Location] : (loclevel[element.Location]|| 0) + 1
                // }
              );
              loclev.forEach((element) => {
                levlevel[element.Location] =
                  (levlevel[element.Location] || 0) + 1;
              });

              var levsloc = [];
              for (var i = 0; i < Object.keys(loclevel).length; i++) {
                levsloc.push({
                  Desig: Object.keys(loclevel)[i],
                  value: loclevel[Object.keys(loclevel)[i]],
                  Loca: Object.keys(levlevel)[i],
                  count: levlevel[Object.keys(levlevel)[i]],
                });
              }

              var desigLevelloc = {
                desgLevelloc: levsloc,
              };
              this.getView().setModel(
                new JSONModel(desigLevelloc),
                "levlocChart"
              );
              this.getView().setModel(new JSONModel(levsloc), "levlocFilter");

              const sub = oData.results;
              const subMod = {};
              sub.forEach((element) => {
                subMod[element.SubModule] =
                  (subMod[element.SubModule] || 0) + 1;
              });

              var subs = [];
              for (var i = 0; i < Object.keys(subMod).length; i++) {
                subs.push({
                  sub: Object.keys(subMod)[i],
                  value: subMod[Object.keys(subMod)[i]],
                });
              }

              var submodule = {
                submodules: subs,
              };
              this.getView().setModel(new JSONModel(submodule), "subChart");
              this.getView().setModel(new JSONModel(subs), "subFilter");

              //levelchart
              const lev = oData.results;
              const level = {};
              lev.forEach((element) => {
                level[element.DesinationText] =
                  (level[element.DesinationText] || 0) + 1;
              });

              var levs = [];
              for (var i = 0; i < Object.keys(level).length; i++) {
                levs.push({
                  Desig: Object.keys(level)[i],
                  value: level[Object.keys(level)[i]],
                });
              }

              var desigLevel = {
                desgLevel: levs,
              };
              this.getView().setModel(new JSONModel(desigLevel), "levChart");
              this.getView().setModel(new JSONModel(levs), "levFilter");
            }.bind(this),
            error: function (oError) {},
          });

        var oProjectModel = new JSONModel();
        this.getView().setModel(oProjectModel, "oProjectModel");
        var filter = [];
        var option = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "ZPROJECT_TYPE",
        });

        var oGenderModel = new JSONModel();
        this.getView().setModel(oGenderModel, "oGenderModel");
        var filter1 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "HRPAD_GENDER",
        });

        this.getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: [filter1],
            success: function (oData) {
              var model2 = that.getView().getModel("oGenderModel");
              model2.setData(oData.results);
            }.bind(this),
            error: function (oError) {},
          });

        var AssignmentFilter = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "ZASSIGNMENT_TYPE",
        });

        var oAssignModel = new JSONModel();
        this.getView().setModel(oAssignModel, "oAssignModel");
        this.getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: [AssignmentFilter],
            success: function (oData) {
              var modelAssign = that.getView().getModel("oAssignModel");
              modelAssign.setData(oData.results);
            }.bind(this),
            error: function (oError) {},
          });

        //Project value help
        var ProjectFilter = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "PROJECT_NAME",
        });
        var oProjectValueHelpModel = new JSONModel();
        this.getView().setModel(
          oProjectValueHelpModel,
          "oProjectValueHelpModel"
        );
        this.getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: [ProjectFilter],
            success: function (oData) {
              var modelprj = that.getView().getModel("oProjectValueHelpModel");
              modelprj.setData(oData.results);
            }.bind(this),
            error: function (oError) {},
          });

        //Customer value help
        var CustFilter = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "CUSTOMER_NAME",
        });
        var oCustValueHelpModel = new JSONModel();
        this.getView().setModel(oCustValueHelpModel, "oCustValueHelpModel");
        this.getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: [CustFilter],
            success: function (oData) {
              var modelcust = that.getView().getModel("oCustValueHelpModel");
              modelcust.setData(oData.results);
            }.bind(this),
            error: function (oError) {},
          });

        //main module
        var oMModuleModel = new JSONModel();
        this.getView().setModel(oMModuleModel, "oMModuleModel");
        var filter1 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "ZEMP_MODULE",
        });

        this.getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: [filter1],
            success: function (oData) {
              var model2 = that.getView().getModel("oMModuleModel");
              model2.setData(oData.results);
            }.bind(this),
            error: function (oError) {},
          });

        //sub-Module
        var oSuModuleModel = new JSONModel();
        this.getView().setModel(oSuModuleModel, "oSuModuleModel");
        var filter1 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "ZEMP_SUB_MODULE",
        });

        this.getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: [filter1],
            success: function (oData) {
              var model2 = that.getView().getModel("oSuModuleModel");
              model2.setData(oData.results);
            }.bind(this),
            error: function (oError) {},
          });

        //BaseLocation

        var oDesigModel = new JSONModel();
        this.getView().setModel(oDesigModel, "oDesigModel");
        var filter1 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "ZEMP_DESIGNATION",
        });

        this.getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: [filter1],
            success: function (oData) {
              var model2 = that.getView().getModel("oDesigModel");
              model2.setData(oData.results);
            }.bind(this),
            error: function (oError) {},
          });

        this.getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: [filter1],
            success: function (oData) {
              var model2 = that.getView().getModel("oDesigModel");
              model2.setData(oData.results);
              //var table1 = this.getView().byId("Assignmenttable");
              //table1.setVisible(true);
              // MessageBox.information("oData Read Succesful");
            }.bind(this),
            error: function (oError) {},
          });
        var oModel = new JSONModel();
        var employeeData = [
          {
            name: "John Doe",
            project: "Project A",
            startDate: new Date("2023-01-01"),
            endDate: new Date("2023-02-15"),
            mtd: 30,
            ytd: 120,
          },
          {
            name: "Jane Smith",
            project: "Project B",
            startDate: new Date("2023-02-16"),
            endDate: new Date("2023-04-30"),
            mtd: 40,
            ytd: 160,
          },
        ];

        var that = this;
        filter.push(option);
        that
          .getOwnerComponent()
          .getModel()
          .read("/es_value_helps", {
            filters: filter,
            success: function (oData) {
              var model1 = that.getView().getModel("oProjectModel");
              model1.setData(oData.results);
              //var table1 = this.getView().byId("Assignmenttable");
              //table1.setVisible(true);
              // MessageBox.information("oData Read Succesful");
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });

        this.excelDataArr = [];
        this.localModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(this.localModel, "localModel");
        var testData = new sap.ui.model.json.JSONModel();
        var oModel = new JSONModel({
          ResourceManagementTool: [],
        });
        this.getView().setModel(oModel);
        this.byId("table").setFixedColumnCount(3);
        var oData = {};
        this.getView().setModel(oModel);
        testData.setData(oData);
        this.getView().setModel(testData, "myModel");
        this.oRouter = this.getOwnerComponent().getRouter;
        this.getView().setModel(
          new sap.ui.model.json.JSONModel({
            columns: {
              Name: true,
              Level: true,
              Location: true,
              TrackModule: true,
              TaskProject: true,
              MTD: true,
              YTD: true,
              Project1: true,
              Project2: true,
              Project3: true,
              Project4: true,
              UpcomingProj1: true,
              UpcomingProj2: true,
            },
          }),
          "settingsDialog"
        );
        this.getView().setModel(
          new sap.ui.model.json.JSONModel({
            columns: {
              MTD: true,
              YTD: true,
            },
          }),
          "gant"
        );

        this.onSearchFilter();
        // this.onListItemPress();

        //Santosh Kumar: for keybord shortcut actions
        this.setKeyboardShortcuts();

        //Initial sorting
        var oView = this.getView();
        var oEmployeeNameColumn = oView.byId("idClEmpName");
        oView.byId("table").sort(oEmployeeNameColumn, SortOrder.Ascending);
      },
      //Santosh Kumar: Method to handle shortcut
      setKeyboardShortcuts: function () {
        //here in this example, I have attached to 'document', you may attach to specific view or control
        $(document).keydown(
          $.proxy(function (evt) {
            switch (evt.keyCode) {
              case 117: //F6 key
                var control = this.byId("filterbar");
                control.fireSearch();

                break;
              case 118: //F7 key
                var control = this.byId("filterbar");

                control.fireClear();

                break;

              case 119: //F8 key
                var control = this.byId("idAvailableResoures");
                control.firePress();

                break;
              case 120: //F9 key
                var control = this.byId("idBtnEmployeeDetails");
                control.firePress();

                break;

              default:
                break;
            }
          }, this)
        );
      },
      // last updated Date on utilization
      getLastUpdUtilDate: function () {
        this.getOwnerComponent()
          .getModel()
          .read("/es_utilupdated", {
            success: function (oData) {
              this.getView()
                .getModel("oUtilDateModel")
                .setData(oData.results[0]);
              var lastupdate = this.getView()
                .getModel("oUtilDateModel")
                .getProperty("/LastUpdateddate");
              this.getView()
                .getModel("FilterDataModel")
                .setProperty(
                  "/LastupdUtilDate",
                  this.formatUtilDate(lastupdate)
                );
            }.bind(this),
            error: function (response) {
              console.log(response);
            }.bind(this),
          });
      },
      //format util Date
      formatUtilDate: function (dateString) {
        // Convert the date string from "YYYYMMDD" to a JavaScript Date object
        var year = dateString.substring(0, 4);
        var month = dateString.substring(4, 6);
        var day = dateString.substring(6, 8);
        var date = new Date(year, month - 1, day); // Note: Month is zero-based in JavaScript Date object

        // Format the date to "dd/mm/yyyy" format
        var formattedDate =
          ("0" + date.getDate()).slice(-2) +
          "/" +
          ("0" + (date.getMonth() + 1)).slice(-2) +
          "/" +
          date.getFullYear();

        return formattedDate;
      },
      // upload Excel Codes Below
      handleUploadFile: function (e) {
        var data = e.getParameter("files");
        this._import(data && data[0]);
        // e.setParameter("files", null);
      },
      _import: function (file) {
        var that = this;
        var excelData = {};
        if (file && window.FileReader) {
          var reader = new FileReader();
          reader.onload = function (e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, {
              type: "binary",
            });
            workbook.SheetNames.forEach((sheetName) => {
              excelData = XLSX.utils.sheet_to_row_object_array(
                workbook.Sheets[sheetName]
              );
              that.uploadExcelDataToServer(excelData);
            });
          };
          reader.onerror = function (ex) {
            console.log(ex);
          };
          reader.readAsBinaryString(file);
        } else {
        }
      },
      // Upload the excel data to server.
      uploadExcelDataToServer: function (arrExcelData) {
        var newEntryArr = this.getFormattedDataToUpload(arrExcelData);
        if (newEntryArr.UPLOAD_EMPLOYEE.length === 0) {
          sap.m.MessageBox.error("Uploaded excel file is blank.");

          return;
        }
        this.getOwnerComponent()
          .getModel()
          .create("/es_uploadexcel", newEntryArr, {
            // entity set will be added here
            success: function (oData, oResponse) {
              // this.getView().getModel("oFormModel").setData(oResponse);
              this.getEmployeeList();
              sap.m.MessageToast.show(
                "Excel Data Uploaded SuccesFully",
                oResponse
              );

              // this.getView().setBusy(false);
              //  this.downloadUploadedExcelWithStatus(oData.UPLOADENAM.results); //commented: Download excel
              //MessageToast.show(data.CREATERETURN.results[1].Message);
            }.bind(this),
            error: function (error) {
              sap.m.MessageToast.show("Failed Uploading the Data", error);
            }.bind(this),
          });
      },

      //format upload excel Data
      getFormattedDataToUpload: function (excelDataArr) {
        var newOrderArr = new Array();
        for (var i = 0; i < excelDataArr.length; i++) {
          var newObj = {
            Pernr: excelDataArr[i].Pernr,
            EmpType: excelDataArr[i].EmpType,
            FirstName: excelDataArr[i].FirstName,
            LastName: excelDataArr[i].LastName,
            MiddleName: excelDataArr[i].MiddleName,
            EmailId: excelDataArr[i].EmailId,
            Gender: excelDataArr[i].Gender,
            Doj: new Date(excelDataArr[i].Doj),
            MainModule: excelDataArr[i].MainModule,
            Designation: excelDataArr[i].Designation,
            BaseLocation: excelDataArr[i].BaseLocation,
          };
          newOrderArr.push(newObj);
        }
        var oUploadObject = {};
        return (oUploadObject = {
          Pernr: "C",
          UPLOAD_EMPLOYEE: newOrderArr,
          UPLOAD_MESSAGE: [{}],
        });
      },

      getDropDownValues: function (sDomValue, sModelName) {
        var oNewModel = this.getOwnerComponent().getModel();
        var oBaseLocModel = new JSONModel();
        this.getView().setModel(oBaseLocModel, sModelName);
        var filterDD = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: sDomValue,
        });

        oNewModel.read("/es_value_helps", {
          filters: [filterDD],
          success: function (oData) {
            var model = this.getView().getModel(sModelName);
            model.setData(oData.results);
            this.getView().setModel(model, sModelName);
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          }.bind(this),
        });
      },

      date: function () {
        this.getFormattedDate();
        var oFormModel = this.getView().getModel("oDateModel");
        oFormModel.setProperty("/currentDate", this.getFormattedDate());
      },
      _handleSelectionChange: (oEvent, arr) => {
        const aChangedItems = oEvent.getParameter("changedItems");
        const bSelected = oEvent.getParameter("selected");
        if (bSelected) {
          aChangedItems.forEach(function (oItem) {
            arr.push(oItem.getText());
          });
        } else {
          arr = arr.filter(
            (item) =>
              !aChangedItems.some(
                (selectedItem) => selectedItem.setText() === item
              )
          );
          console.log(arr);
        }
      },

      onReset: function (oEvent) {
        var ofilterDataModel = new JSONModel({
          level: "",
          location: "",
          resourcename: "",
          submodule: "",
          utilization: "",
          operator: "01",
        });
        this.getView().setModel(ofilterDataModel, "FilterDataModel");
        this.onSearchFilter();
      },

      onRestore: function () {
        for (
          var i = 0;
          i < this.getView().byId("idFilterBar").getAllFilterItems().length;
          i++
        ) {
          this.getView()
            .byId("idFilterBar")
            .getAllFilterItems()
            [i].setVisibleInFilterBar(false);
        }
      },
      onSelectionChangeCustName: function (oEvent) {
        var oModel = this.getView().getModel("oFormModel1");
        var CustCode = oEvent.getSource().getSelectedKey();
        var sPath = oEvent
          .getSource()
          .getBindingContext("oFormModel1")
          .getPath();
        var sPath = sPath.replace("/", "");
        var AssignmentTypeNum = oModel.getData()[sPath].AssignmentType;
        var oAssignFilter = new sap.ui.model.Filter({
          path: "CustomerCode",
          operator: "EQ",
          value1: CustCode,
        });
        var oAssignFilter1 = new sap.ui.model.Filter({
          path: "AssignmentType",
          operator: "EQ",
          value1: AssignmentTypeNum,
        });

        var FilterArray = new Array();
        FilterArray.push(oAssignFilter1);
        FilterArray.push(oAssignFilter);
        this.getOwnerComponent()
          .getModel()
          .read("/es_project_details", {
            filters: FilterArray,
            success: function (oData) {
              // come back here
              var JSONModelForProjectCode = new JSONModel(oData.results);
              sap.ui.core.Fragment.byId("sampleFrag", "Assignmenttable")
                .getItems()
                [this.sPath].setModel(JSONModelForProjectCode, "ArrPrj");
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });
      },

      onSelectionChangeProjectName: function (oEvent) {
        var oModel = this.getView().getModel("oFormModel1");
        var ProjectCode = oEvent.getSource().getSelectedKey();
        var sPath = oEvent
          .getSource()
          .getBindingContext("oFormModel1")
          .getPath();
        var sPath = sPath.replace("/", "");
        var AssignmentTypeNum = oModel.getData()[sPath].AssignmentType;
        var CustomerCode = oModel.getData()[sPath].CustomerCode;

        var ProjectCodeFilter = new sap.ui.model.Filter({
          path: "ProjectCode",
          operator: "EQ",
          value1: ProjectCode,
        });
        var CustomerCodeFilter = new sap.ui.model.Filter({
          path: "CustomerCode",
          operator: "EQ",
          value1: CustomerCode,
        });
        var AssignmentTypeNumFilter = new sap.ui.model.Filter({
          path: "AssignmentType",
          operator: "EQ",
          value1: AssignmentTypeNum,
        });

        var FilterArray = new Array();
        FilterArray.push(CustomerCodeFilter);
        FilterArray.push(AssignmentTypeNumFilter);
        FilterArray.push(ProjectCodeFilter);

        this.getOwnerComponent()
          .getModel()
          .read("/es_project_details", {
            filters: FilterArray,
            success: function (oData) {
              var tempData = this.getView().getModel("oFormModel1").getData();

              tempData[Number(this.sPath)].ProjectType =
                oData.results[0].ProjectType;
              tempData[Number(this.sPath)].ProjectTypeText =
                oData.results[0].ProjectTypeText;
              tempData[Number(this.sPath)].StartDate =
                oData.results[0].ProjectStartDate;
              tempData[Number(this.sPath)].EndDate =
                oData.results[0].ProjectEndDate;
              this.getView().getModel("oFormModel1").refresh();
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });
      },

      // Assignment Type - combobox selection change
      onSelectAssignmentType: function (oEvent) {
        this.sPath = oEvent
          .getSource()
          .getBindingContext("oFormModel1")
          .getPath()
          .replace("/", "");
        var AssignmentTypeNum = oEvent.getSource().getSelectedKey();
        this.vAssignmentTypeNum = oEvent.getSource().getSelectedKey();

        var aNewAssignment = this.getView().getModel("oFormModel1").getData();
        var aExistingAssignment = this.getView()
          .getModel("oFormModel1")
          .getData();

        // No repeat value validation for AssignmentType
        var flagAssignmentTypeNum = 1;
        // if (aExistingAssignment.length > 0) {
        //   for (var i = 0; i < aExistingAssignment.length - 1; i++) {
        //     if (AssignmentTypeNum === aExistingAssignment[i].AssignmentType) {
        //       sap.m.MessageBox.error("Assignment Type already exists");
        //       this.onRemoveRow(oEvent);
        //       this.onAddNewRow();
        //       // aExistingAssignment[i].AssignmentType = "";
        //       // this.getView().getModel("oFormModel1").refresh();

        //       // var emptyJSONModelForCustName = new JSONModel({})
        //       // sap.ui.core.Fragment.byId("sampleFrag", "Assignmenttable").getItems()[this.sPath].setModel(emptyJSONModelForCustName, "ArrCust");

        //       flagAssignmentTypeNum = 0;
        //     } else {
        //       flagAssignmentTypeNum = 1;
        //     }
        //   }
        // } else {
        //   flagAssignmentTypeNum = 1;
        // }

        if (flagAssignmentTypeNum === 1) {
          var aFiltersAssignmentType = [];
          var oFilter = new sap.ui.model.Filter({
            path: "AssignmentType",
            operator: "EQ",
            value1: AssignmentTypeNum,
          });

          aFiltersAssignmentType.push(oFilter);

          this.getOwnerComponent()
            .getModel()
            .read("/es_project_details", {
              filters: aFiltersAssignmentType,
              success: function (oData) {
                var JSONModelForCustName = new JSONModel(oData.results);
                sap.ui.core.Fragment.byId("sampleFrag", "Assignmenttable")
                  .getItems()
                  [this.sPath].setModel(JSONModelForCustName, "ArrCust");
                //Start:  To clear remaining entries
                var oViewModel = this.getView().getModel("oFormModel1");
                var sPath = "/" + this.sPath;
                oViewModel.setProperty(sPath + "/CustomerName", "");
                oViewModel.setProperty(sPath + "/EmployeeSkillText", "");
                oViewModel.setProperty(sPath + "/ProjectName", "");
                oViewModel.setProperty(sPath + "/ProjectTypeText", "");
                oViewModel.setProperty(sPath + "/StartDate", "");
                oViewModel.setProperty(sPath + "/EndDate", "");
                oViewModel.setProperty(sPath + "/AllocationPer", "");
                //End:  To clear remaining entries
                this.getView().setBusy(false);
              }.bind(this),
              error: function (oError) {
                console.log(oError);
              },
            });
        }
      },
      //Start: Customer code F4
      onCustCodeF4: function (oEvent) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        if (!this._pDialogPrdList) {
          this._pDialogPrdList = sap.ui.core.Fragment.load({
            id: oView.getId(),
            name: "znewresource.view.fragments.custCodeF4",
            controller: this,
          }).then(function (oDialogList) {
            oView.addDependent(oDialogList);
            return oDialogList;
          });
        }

        this._pDialogPrdList.then(
          function (oDialogPrdList) {
            var aFiltersAssignmentType = [];

            var oFilter = new sap.ui.model.Filter({
              path: "AssignmentType",
              operator: "EQ",
              value1: this.vAssignmentTypeNum,
            });

            aFiltersAssignmentType.push(oFilter);
            this.getOwnerComponent()
              .getModel()
              .read("/es_project_details", {
                filters: aFiltersAssignmentType,
                success: function (oData) {
                  var JSONModelForCustName = new JSONModel(oData.results);
                  var oTable = this.getView().byId("idCustomerAndListTable");
                  oTable.setModel(JSONModelForCustName, "ArrCustF4");

                  oTable.setTitle(
                    "Customer list ( " + oData.results[0].AssignmentText + " )"
                  );
                  oDialogPrdList.open();
                }.bind(this),
                error: function (oError) {},
              });
          }.bind(this)
        );
      },
      handleCloseProductDialog: function () {
        if (this._pDialogPrdList) {
          //this.getView().getDependents()[1].close();
          // this.getView().getModel("oFormModel").setProperty("/Satnr", "");
        }
      },

      handleConfirmProductDialog: function (oEvent) {
        var selectedIndex = oEvent
          .getParameter("selectedItems")[0]
          .getBindingContextPath()
          .split("/")[1];
        var selectedObject = oEvent
          .getParameter("selectedItems")[0]
          .getModel("ArrCustF4")
          .getData()[selectedIndex];
        var aTableData = this.getView().getModel("oFormModel1").getData();
        aTableData[this.sPath].CustomerName = selectedObject.CustomerName;
        aTableData[this.sPath].CustomerCode = selectedObject.CustomerCode;
        aTableData[this.sPath].ProjectName = selectedObject.ProjectName;
        aTableData[this.sPath].ProjectCode = selectedObject.ProjectCode;
        aTableData[this.sPath].AssignmentCode = selectedObject.AssignmentId;
        aTableData[this.sPath].ProjectType = selectedObject.ProjectType;
        aTableData[this.sPath].ProjectTypeText = selectedObject.ProjectTypeText;
        aTableData[this.sPath].StartDate = selectedObject.ProjectStartDate;
        aTableData[this.sPath].EndDate = selectedObject.ProjectEndDate;

        aTableData[this.sPath].EmployeeSkillText =
          selectedObject.EmployeeSkillText;
        // aTableData[this.sPath].Role=   selectedObject.Role ;
        // aTableData[this.sPath].Designation=   selectedObject.Designation ;
        // aTableData[this.sPath].Location=   selectedObject.Location ;
        this.getView().getModel("oFormModel1").setData(aTableData);
        this.getView().getModel("oFormModel1").refresh();
      },
      onSuggestionItemSelected: function (oEvent) {
        var selectedObject = oEvent
          .getParameter("selectedRow")
          .getBindingContext("ArrCust")
          .getObject();
        var aTableData = this.getView().getModel("oFormModel1").getData();
        aTableData[this.sPath].CustomerName = selectedObject.CustomerName;
        aTableData[this.sPath].CustomerCode = selectedObject.CustomerCode;
        aTableData[this.sPath].ProjectName = selectedObject.ProjectName;
        aTableData[this.sPath].ProjectCode = selectedObject.ProjectCode;
        aTableData[this.sPath].AssignmentCode = selectedObject.AssignmentId;
        aTableData[this.sPath].ProjectType = selectedObject.ProjectType;
        aTableData[this.sPath].ProjectTypeText = selectedObject.ProjectTypeText;
        aTableData[this.sPath].StartDate = selectedObject.ProjectStartDate;
        aTableData[this.sPath].EndDate = selectedObject.ProjectEndDate;

        aTableData[this.sPath].EmployeeSkillText =
          selectedObject.EmployeeSkillText;
        // aTableData[this.sPath].Role=   selectedObject.Role ;
        // aTableData[this.sPath].Designation=   selectedObject.Designation ;
        // aTableData[this.sPath].Location=   selectedObject.Location ;
        this.getView().getModel("oFormModel1").setData(aTableData);
        this.getView().getModel("oFormModel1").refresh();
      },

      handleSearchProduct: function (oEvent) {
        var sValue = oEvent.getParameter("value");

        var oFilters = new sap.ui.model.Filter({
          filters: [
            new sap.ui.model.Filter(
              "CustomerName",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
            new sap.ui.model.Filter(
              "ProjectName",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
            new sap.ui.model.Filter(
              "ProjectTypeText",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
          ],
          and: false,
        });

        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter([oFilters]);
      },

      onSelectionChange: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("listItem");
        var oModel = oSelectedItem.getBindingContext().getObject();
        //alert(JSON.stringify(oModel));
        this.onCloseDialogList();
      },
      //End: Customer code F4

      getCallTable: function (perx) {
        var oFormModel1 = new sap.ui.model.json.JSONModel();
        this.getView().setModel(oFormModel1, "oFormModel1");
        var oFormModel2 = new sap.ui.model.json.JSONModel();
        this.getView().setModel(oFormModel2, "oFormModel2");
        var P = [];
        var I = new sap.ui.model.Filter({
          path: "PernrD",
          operator: "EQ",
          value1: perx,
        });

        P.push(I);

        this.getOwnerComponent()
          .getModel()
          .read("/es_project_code", {
            filters: P,
            success: function (oData) {
              // if (oData.results.length < 1) {
              //   sap.ui.core.Fragment.byId(
              //     "sampleFrag",
              //     "Assignmenttable1"
              //   ).setVisible(false);
              // } else {
              //   sap.ui.core.Fragment.byId(
              //     "sampleFrag",
              //     "Assignmenttable1"
              //   ).setVisible(true);
              // }
              var model = this.getView().getModel("oFormModel1");

              for (var k = 0; k < oData.results.length; k++) {
                oData.results[k].AllocationPer = oData.results[
                  k
                ].AllocationPer.replace(/^0+/, "");
              }

              model.setData(oData.results);
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });
      },
      onValueHelpChange: function () {},
      onRemoveRow: function (oEvent) {
        var oModel = this.getView().getModel("oFormModel1");
        var oTable = oModel.getData();
        var sPath = oEvent
          .getSource()
          .getBindingContext("oFormModel1")
          .getPath();
        var iIndex = parseInt(sPath.split("/")[1]);
        oTable.splice(iIndex, 1);
        oModel.refresh();
      },
      onRemoveExistingRow: function (oEvent) {
        var oModel = this.getView().getModel("oFormModel2");
        var oTable = oModel.getData();
        var sPath = oEvent
          .getSource()
          .getBindingContext("oFormModel2")
          .getPath();
        var iIndex = parseInt(sPath.split("/")[1]);
        oTable.splice(iIndex, 1);
        oModel.refresh();
      },
      onAddNewRow: function () {
        var oModelNewAssignment = this.getView().getModel("oFormModel1");

        var pernrx = this.getView()
          .getModel("SelectedRowModel")
          .getProperty("/Pernr");
        var aNewAssignment;
        if (oModelNewAssignment.getData().length === undefined) {
          aNewAssignment = [];
        } else {
          aNewAssignment = oModelNewAssignment.getData();
        }

        aNewAssignment.push({
          AssignmentCode: "",
          AssignmentType: "",
          PernrD: pernrx,
          CustomerName: "",
          Remarks: "",
          ProjectName: "",
          ProjectType: "",
          AllocationPer: "",
          StartDate: "",
          EndDate: "",
        });

        oModelNewAssignment.setData(aNewAssignment);
      },
      // NewRow: function (oEvent) {
      //   var oModel = this.getView().getModel("oFormModel1");
      //   var data = oModel.getData();
      //   data.push({});
      //   oModel.setData(data);
      // },

      onCloseProjectAssignDialog: function (oEvent) {
        this.onSearchFilter();
        this.getView()
          .getModel("oVisibleModel")
          .setProperty("/dropDownVisible", false);
        this.getView()
          .getModel("oVisibleModel")
          .setProperty("/textVisible", true);
        this._oFragmentsamp.close();
      },

      exportToExcel: function () {
        var oTable = this.getView().byId("table");
        var aData = oTable.getModel("oFormModel").getProperty("/");
        var columnNames = {
          Pernr: "Employee Id",
          DesinationText: "Designation",
          Location: "Base Location",
          SecondarySkill: "Secondary Skill",
          IndustryExpertise: "IndustryExpertise",
          Task: "Task",
          TaskText: "Task Text",
          Mtd: "MTD",
          Ytd: "YTD",
          Project01: "Project 01",
          Customer01: "Customer 01",
          Per01: "Per 01",
          Project02: "Project 02",
          Customer02: "Customer 02",
          Per02: "Per 02",
          Project03: "Project 03",
          Customer03: "Customer 03",
          Per03: "Per 03",
          Project04: "Project 04",
          Customer04: "Customer 04",
          Per04: "Per 04",
          Planned01: "Planned 01",
          PlannedCust01: "Planner customer 01",
          PlannedPer01: "Planned Per 01",
          Planned02: "Planned 02",
          PlannedCust02: "Planned Customer 02",
          PlannedPer02: "Planned Per 02",
          Planned03: "Planned 03",
          PlannedCust03: "Planned Customer 03",
          PlannedPer03: "Planned Per 03",
          WeekExecution: "Week Execution",
          End01: "End 01",
          End02: "End 02",
          End03: "End 03",
          End04: "End 04",
          StartDatePlannned01: "Start Date Planned 01",
          EndDatePlanned01: "End Date Planned 01",
          StartDatePlannned02: "Start Date Planned 02",
          EndDatePlanned02: "End Date Planned 02",
          StartDatePlannned03: "Start Date Planned 03",
          EndDatePlanned03: "End Date Planned 03",
          Allocation: "Allocation",
        };
        var selectedColumns = [
          "Pernr",
          "DesinationText",
          "Name",
          // "SubModule",
          "Location",
          "Module",
          "SecondarySkill",
          "IndustryExpertise",
          "Task",
          "TaskText",
          "Mtd",
          "Ytd",
          "Project01",
          "Customer01",
          "Per01",
          "Project02",
          "Customer02",
          "Per02",
          "Project03",
          "Customer03",
          "Per03",
          "Project04",
          "Customer04",
          "Per04",
          "Planned01",
          "PlannedCust01",
          "PlannedPer01",
          "Planned02",
          "PlannedCust02",
          "PlannedPer02",
          "Planned03",
          "PlannedCust03",
          "PlannedPer03",
          "WeekExecution",
          "End01",
          "End02",
          "End03",
          "End04",
          "StartDatePlannned01",
          "EndDatePlanned01",
          "StartDatePlannned02",
          "EndDatePlanned02",
          "StartDatePlannned03",
          "EndDatePlanned03",
          "Allocation",
        ];
        var csvContent =
          selectedColumns.map((col) => columnNames[col] || col).join(",") +
          "\n";

        aData.forEach(function (row) {
          csvContent += selectedColumns.map((key) => row[key]).join(",") + "\n";
        });

        var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "rmtool.csv");
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },

      getFormattedDate: function () {
        var options = { year: "numeric", month: "short", day: "2-digit" };
        return new Date().toLocaleDateString("en-US", options);
      },
      onSaveEmpDetail: function () {
        var oFormModel = this.getView().getModel("SelectedRowModel");
        var oData = oFormModel.getData();

        this.getOwnerComponent()
          .getModel()
          .create("/et_employee_detailsSet", oData, {
            success: function (oResponse) {
              this.getView().getModel("oFormModel").setData(oResponse);
              this.getView().getModel("oFormModel").refresh(true);
              this.getView().getModel("SelectedRowModel").refresh(true);
              this.editTableData();
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });

        // this.getView().getModel("oVisibleModel").setProperty("/dropDownVisible", false);
        // this.getView().getModel("oVisibleModel").setProperty("/textVisible", true);
      },

      editTableData: function () {
        if (this.getView().getModel("oFormModel1").getData().length) {
          var oModelData = this.getView().getModel("oFormModel1").getData();
        } else {
          var oModelData = [];
        }

        // var aDataExisting = this.getView().getModel("oFormModel1").getData();
        // for (var i = 0; i < aDataExisting.length; i++) {
        //   oModelData.push(aDataExisting[i]);
        // }

        var arrProjectUpdate = [];
        var nAllocationPer = 0;

        for (var i = 0; i < oModelData.length; i++) {
          nAllocationPer = nAllocationPer + Number(oModelData[i].AllocationPer);
          var newObj = {
            CustomerCode: oModelData[i].CustomerCode,
            CustomerName: "",
            PernrD: oModelData[i].PernrD,
            CustomerName: "",

            AssignmentType: oModelData[i].AssignmentType,
            AssignmentCode: oModelData[i].AssignmentCode,
            Remarks: oModelData[i].Remarks,
            ProjectCode: oModelData[i].ProjectCode,
            ProjectName: "",
            ProjectType: oModelData[i].ProjectType,
            AllocationPer: oModelData[i].AllocationPer,
            StartDate: oModelData[i].StartDate,
            EndDate: oModelData[i].EndDate,
          };

          arrProjectUpdate.push(newObj);
        }

        var oEntry = {
          Pernr: this.getView()
            .getModel("SelectedRowModel")
            .getProperty("/Pernr"),
          project_update: arrProjectUpdate,
        };
        var sMsg = 0;
        for (var i = 0; i < oEntry.project_update.length; i++) {
          if (!oEntry.project_update[i].AssignmentType) {
            sap.m.MessageBox.error(
              "Select  Assignment Type at line Number " + (i + 1)
            );
            sMsg = 1;
            i = oEntry.project_update.length;
          } else if (!oEntry.project_update[i].CustomerCode) {
            sap.m.MessageBox.error(
              "Select Customer Name at line Number " + (i + 1)
            );
            sMsg = 1;
            i = oEntry.project_update.length;
          } else if (!oEntry.project_update[i].ProjectCode) {
            sap.m.MessageBox.error(
              "Select Project Name at line Number " + (i + 1)
            );
            sMsg = 1;
            i = oEntry.project_update.length;
          } else if (!oEntry.project_update[i].ProjectType) {
            sap.m.MessageBox.error(
              "Select Project Type at line Number " + (i + 1)
            );
            sMsg = 1;
            i = oEntry.project_update.length;
          } else if (!oEntry.project_update[i].StartDate) {
            sap.m.MessageBox.error(
              "Enter Start Date at line Number " + (i + 1)
            );
            sMsg = 1;
            i = oEntry.project_update.length;
          } else if (!oEntry.project_update[i].EndDate) {
            sap.m.MessageBox.error("Enter End Date at line Number " + (i + 1));
            sMsg = 1;
            i = oEntry.project_update.length;
          } else if (!oEntry.project_update[i].AllocationPer) {
            sap.m.MessageBox.error(
              "Enter Allocation % at line Number " + (i + 1)
            );
            sMsg = 1;
            i = oEntry.project_update.length;
          } else {
            sMsg = 0;
          }
        }
        if (sMsg === 0) {
          // if (nAllocationPer >= 100) {
          //   sap.m.MessageBox.error("Total allocation % exceeding limit")
          // } else {
          //return;
          this.getOwnerComponent()
            .getModel()
            .create("/es_project_update", oEntry, {
              success: function (data, response) {
                this.getCallTable(oModelData[0].PernrD);

                sap.m.MessageToast.show("Data saved successfully.");
              }.bind(this),
              error: function (error) {
                sap.m.MessageToast.show(error);
              },
            });
          this.getView().getModel("oFormModel").refresh();
          this.getView()
            .getModel("oVisibleModel")
            .setProperty("/dropDownVisible", false);
          this.getView()
            .getModel("oVisibleModel")
            .setProperty("/textVisible", true);
        }

        // }
      },

      formatDate: function (dateString) {
        // Convert the date string from "YYYYMMDD" to a JavaScript Date object
        var year = dateString.substring(0, 4);
        var month = dateString.substring(4, 6);
        var day = dateString.substring(6, 8);
        var date = new Date(year, month - 1, day); // Note: Month is zero-based in JavaScript Date object

        // Format the date to "dd/mm/yyyy" format
        var formattedDate =
          ("0" + date.getDate()).slice(-2) +
          "/" +
          ("0" + (date.getMonth() + 1)).slice(-2) +
          "/" +
          date.getFullYear();

        return formattedDate;
      },
      handleMessagePopoverPress: function (oEvent) {
        var oTable = this.getView().byId("table");
        var selectedIndices = oTable.getSelectedIndices();

        if (selectedIndices.length !== 1) {
          sap.m.MessageBox.information(
            "Please select one resource to generate the table."
          );
          return;
        }

        var iSelectedIndex = selectedIndices[0];

        var model = oTable.getModel("oFormModel");
        var idx = iSelectedIndex;
        var pernr = model.oData[idx].Pernr;
        var oSelectedRowModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(oSelectedRowModel, "SelectedRowModel");

        var Q = [];
        var filterD = new sap.ui.model.Filter({
          path: "Pernr",
          operator: "EQ",
          value1: pernr,
        });
        Q.push(filterD);

        this.getOwnerComponent()
          .getModel()
          .read("/et_employee_detailsSet", {
            filters: Q,
            success: function (oData) {
              //  console.log(oData.results);
              this.getView()
                .getModel("SelectedRowModel")
                .setData(oData.results[0]);
              var lastupdate = this.getView()
                .getModel("SelectedRowModel")
                .getProperty("/LastUpdateddate");
              this.getView()
                .getModel("FilterDataModel")
                .setProperty("/lastupdate", this.formatDate(lastupdate));
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });
        this.getCallTable(pernr);

        // var oFormModel1 = new sap.ui.model.json.JSONModel();
        // this.getView().setModel(oFormModel1, "oFormModel1");

        // var P = [];
        // var I = new sap.ui.model.Filter({
        //   path: "PernrD",
        //   operator: "EQ",
        //   value1: pernr,
        // });
        //
        // P.push(I);

        // this.getOwnerComponent()
        //   .getModel()
        //   .read("/es_project_code", {
        //     filters: P,
        //     success: function (oData) {
        //       var model = this.getView().getModel("oFormModel1");
        //       model.setData(oData.results);
        //       console.log(oData.results);
        //
        //       this.setProjectType(oData.results);
        //       var table1 = this.getView().byId("Assignmenttable");
        //     }.bind(this),
        //     error: function (oError) {
        //       console.log(oError);
        //     },
        //   });

        var oView = this.getView();
        if (!this._oFragmentsamp) {
          this._oFragmentsamp = sap.ui.xmlfragment(
            "sampleFrag",
            "znewresource.view.fragments.sample",
            this
          );
          oView.addDependent(this._oFragmentsamp);
        }
        this._oFragmentsamp.open();
      },

      setProjectType: function (aResults) {
        // var table1 = sap.ui.getCore().byId("Assignmenttable");
        for (var i = 0; i < aResults.length; i++) {
          // table1.getRows()[i].getCells()[2].setSelectedKey(aResults[i].ProjectType);
        }
      },

      // onBaseLocation:function(oEvent){
      //   var selectedItem = oEvent.getParameter("selectedItem");
      //   var selectedKey = selectedItem.getKey(); // Get the key of the selected item
      //   var selectedText = selectedItem.getText(); // Get the text of the selected item
      //   // Do something with the selected item
      //   this.getView().getModel("SelectedRowModel").setProperty("/BaseLocation",selectedText);

      // },

      DeleteRow: function (oEvent) {
        var oTable = sap.ui.getCore().byId("Assignmenttable");
        var idx = oTable.getSelectedIndex();

        if (idx !== -1) {
          var oModel = this.getView().getModel("oFormModel1");
          var data = oModel.getData();
          var selectedRow = data[idx];

          // Check if the selected row is empty
          if (this.isRowEmpty(selectedRow)) {
            data.splice(idx, 1);
            oModel.setData(data);
            oTable.removeSelectionInterval(idx, idx);
          } else {
            sap.m.MessageToast.show("Please select an empty row to delete");
          }
        } else {
          sap.m.MessageToast.show("Please select a row to delete");
        }
      },

      isRowEmpty: function (row) {
        for (var key in row) {
          if (
            row.hasOwnProperty(key) &&
            row[key] !== "" &&
            row[key] !== undefined
          ) {
            return false;
          }
        }
        return true;
      },

      onSearchFilter: function (oEvent) {
        this.getEmployeeList();
      },
      // validation for utilization
      validateUtilization: function () {
        var valid = true;
        var utilData = this.getView()
          .getModel("FilterDataModel")
          .getProperty("/utilization");
        if (utilData.length > 0) {
          if (parseInt(utilData) > 300) {
            sap.m.MessageBox.error("Eneter Valid Utilization Value");
            valid = false;
          } else {
            valid = true;
          }
        }
        return valid;
      },
      onOperatorChnage: function () {
        var FilterDataModel = this.getView().getModel("FilterDataModel");
        var value = FilterDataModel.getProperty("/operator");
        var operator = sap.ui.model.FilterOperator.EQ;
        if (value === "01") {
          operator = sap.ui.model.FilterOperator.EQ;
        } else if (value === "02") {
          operator = sap.ui.model.FilterOperator.LT;
        } else if (value === "03") {
          operator = sap.ui.model.FilterOperator.GT;
        } else if (value === "04") {
          operator = sap.ui.model.FilterOperator.LE;
        } else if (value === "05") {
          operator = sap.ui.model.FilterOperator.GE;
        }
        return operator;
      },
      getEmployeeList: function () {
        var operator = this.onOperatorChnage();
        var valid = this.validateUtilization();
        if (!valid) {
          return;
        } else {
          var newArrayFilter = new Array();
          // Name
          var NameFilter = new sap.ui.model.Filter({
            path: "Name",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: this.getView()
              .getModel("FilterDataModel")
              .getProperty("/resourcename"),
            // value1: ""
          });
          newArrayFilter.push(NameFilter);
          // Designation
          var DesignationFilter = new sap.ui.model.Filter({
            path: "Designation",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: this.getView()
              .getModel("FilterDataModel")
              .getProperty("/level"),
            // value1: ""
          });
          newArrayFilter.push(DesignationFilter);
          // location
          var LocationFilter = new sap.ui.model.Filter({
            path: "Location",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: this.getView()
              .getModel("FilterDataModel")
              .getProperty("/location"),
            // value1: ""
          });
          newArrayFilter.push(LocationFilter);
          //submodule Filter
          var SubmoduleFilter = new sap.ui.model.Filter({
            path: "SubModule",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: this.getView()
              .getModel("FilterDataModel")
              .getProperty("/submodule"),
            // value1: ""
          });
          newArrayFilter.push(SubmoduleFilter);
          //Utilization Filter
          var utilizationFilter = new sap.ui.model.Filter({
            path: "Mtd",

            operator: operator,
            value1: this.getView()
              .getModel("FilterDataModel")
              .getProperty("/utilization"),
          });
          newArrayFilter.push(utilizationFilter);

          this.getOwnerComponent()
            .getModel()
            .read("/es_rmg_main_data", {
              filters: newArrayFilter,

              success: function (oData) {
                for (var i = 0; i < oData.results.length; i++) {
                  oData.results[i].SecondarySkill = oData.results[
                    i
                  ].SecondarySkill.replaceAll(",", ";");
                  oData.results[i].IndustryExpertise = oData.results[
                    i
                  ].IndustryExpertise.replaceAll(",", ";");
                }

                this.getView().getModel("oFormModel").setData(oData.results);

                const arr = oData.results;
              }.bind(this),
              error: function (oError) {
                console.log(oError);
              },
            });
          this.getLastUpdUtilDate();
        }
      },
      update: function (oEvent) {
        alert("datasaved");
      },
      clearAllFilters: function (oEvent) {
        this.onReset();
      },
      _filter: function () {
        var oFilter = null;

        if (this._oGlobalFilter && this._oPriceFilter) {
          oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
        } else if (this._oGlobalFilter) {
          oFilter = this._oGlobalFilter;
        } else if (this._oPriceFilter) {
          oFilter = this._oPriceFilter;
        }

        this.byId("table").getBinding().filter(oFilter, "Application");
      },

      filterGlobally: function (oEvent) {
        var sQuery = oEvent.getParameter("query").toLowerCase();
        this._oGlobalFilter = null;
        this.getOwnerComponent()
          .getModel()
          .read("/es_rmg_main_data", {
            success: function (oData) {
              const filteredArray = oData.results.filter(function (item) {
                return item.Name.toLowerCase().includes(sQuery);
              });
              this.getView().getModel("oFormModel").setData(filteredArray);
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });
      },

      handleSettingsButtonPress: function () {
        var oModel = this.getView().getModel("settingsDialog");
        var oTable = this.byId("table");
        var oColumns = oTable.getColumns();

        oColumns.forEach(function (oColumn) {
          var sColumnId = oColumn.getId();
          var bColumnVisible = oColumn.getVisible();
          oModel.setProperty("/columns/" + sColumnId, bColumnVisible);
        });

        if (!this._settingsDialog) {
          this._settingsDialog = sap.ui.xmlfragment(
            "znewresource.view.fragments.SettingsDialog",
            this
          );
          this.getView().addDependent(this._settingsDialog);
        }
        this._settingsDialog.open();
      },
      _dateObject: (timestampString) => {
        return new Date(
          parseInt(timestampString.substr(0, 4)), // Year
          parseInt(timestampString.substr(4, 2)) - 1, // Month (0-indexed)
          parseInt(timestampString.substr(6, 2)), // Day
          parseInt(timestampString.substr(8, 2)), // Hour
          parseInt(timestampString.substr(10, 2)), // Minutes
          parseInt(timestampString.substr(12, 2))
        );
      },
      onOpenGant: function () {
        var oFormModel = this.getView().getModel("oFormModel");
        var oTable = this.byId("table");
        var aSelectedIndices = oTable.getSelectedIndices();

        var aSelectedEmployees = [];
        const childrenArr = [];

        const generateChildren = (object) => {
          return [
            {
              id: "line1",
              text: "MTD",
              resourceName: object.name,
              MTD: object.mtd,
              location: object.location,
              startTime: this._dateObject("20231101090000"),
              endTime: this._dateObject("20231127090000"),
              subtask: [
                {
                  id: "chevron1",
                  startTime: this._dateObject("20231101090000"),
                  endTime: this._dateObject("20231127090000"),
                  MTD: object.mtd,
                },
              ],
            },
          ];
        };
        if (aSelectedIndices.length > 0) {
          aSelectedIndices.forEach(function (iSelectedIndex) {
            var oSelectedEmployee = oTable
              .getContextByIndex(iSelectedIndex)
              .getObject();
            aSelectedEmployees.push({
              name: oSelectedEmployee.Name,
              location: oSelectedEmployee.Location,
              mtd: oSelectedEmployee.Mtd,
              pernr: oSelectedEmployee.Pernr,
            });
          });
          var oModel = this.getView().getModel();
          oModel.setProperty("/selectedEmployees", aSelectedEmployees);

          if (!this._gantDialog) {
            this._gantDialog = sap.ui.xmlfragment(
              "znewresource.view.fragments.Gant",
              this
            );
            this.getView().addDependent(this._gantDialog);
          }
          setTimeout(() => {
            this._gantDialog.open();
          }, 0);
          aSelectedEmployees.map((item) =>
            childrenArr.push(generateChildren(item))
          );
        } else {
        }
        console.log(childrenArr);
        const oModel2 = new JSONModel({
          root: {
            children: childrenArr,
          },
        });
        this.getView().setModel(oModel2);
      },
      colorFormatter: function (mtd) {
        console.log(typeof mtd);
        if (mtd >= 70 && mtd <= 100) {
          return "sapUiAccent1";
        }
        if (mtd > 100) {
          return "sapUiAccent2";
        }
        if (mtd < 70 && mtd > 0) {
          return "sapUiAccent8";
        }
        if (mtd == 0) {
          return "";
        }
      },

      onClosegant: function () {
        this._gantDialog.close();
      },

      onCalendarPress: function () {
        var oView = this.getView();
        if (!this._oCalendar) {
          this._oCalendar = sap.ui.xmlfragment(
            "znewresource.view.fragments.calendar",
            this
          );
          oView.addDependent(this._oCalendar);
        }
        this._oCalendar.open();
      },
      handleCalendarSelect: function (oEvent) {
        var oCalendar = oEvent.getSource();
        var aSelectedDates = oCalendar.getSelectedDates();
        var oDate = aSelectedDates[0].getStartDate();
        selectedDate = oDate;
      },
      handleSelectToday: function () {
        var oCalendar = this.byId("calendar");
        oCalendar.removeAllSelectedDates();
        oCalendar.addSelectedDate(
          new DateRange({ startDate: UI5Date.getInstance() })
        );
      },
      handleOkCalendar: function () {
        console.log(selectedDate);
        this._oCalendar.close();
      },
      // formatDate: function (date) {
      //   var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
      // },

      _refreshTable: function () {
        // Assuming your table has an ID "_IDGenTable1"
        var oTable = this.getView().byId("table");

        oTable.bindItems({
          path: "localModel>/items",
        });
      },

      onCloseSettingsDialog: function () {
        // Handle close button press event

        // Close the settings dialog
        if (this._settingsDialog) {
          this._settingsDialog.close();
        }
      },

      handleSettingsDialogOK: function () {
        var oModel = this.getView().getModel("settingsDialog");
        var oColumnsData = oModel.getProperty("/columns");

        var selectedColumns = [];
        for (var columnId in oColumnsData) {
          if (
            oColumnsData.hasOwnProperty(columnId) &&
            oColumnsData[columnId] === true
          ) {
            selectedColumns.push(columnId);
          }
        }

        if (selectedColumns.length > 0) {
          var message = "Selected columns: " + selectedColumns.join(", ");
          sap.m.MessageBox.confirm(message, {
            title: "Confirmation",
            actions: [sap.m.MessageBox.Action.OK],
            onClose: function (action) {
              if (action === sap.m.MessageBox.Action.OK) {
              }
            },
          });
        } else {
          sap.m.MessageToast.show("No columns selected.");
        }

        this._settingsDialog.close();
      },

      onSelectionProjectType: function (oEvent) {
        var oSelectedKey = oEvent
          .getSource()
          .getParent()
          .getId()
          .split("Assignmenttable-rows-row")[1];
        console.log(oSelectedKey);
        var oModelData = this.getView().getModel("oFormModel1").getData();
        oModelData[oSelectedKey].ProjectType = oEvent
          .getSource()
          .getSelectedKey();
        console.log(oModelData);

        // this.getView().getModel("oFormModel1").setData(oModelData);
      },

      onSaveProject: function () {
        // var oFormModel = this.getView().getModel("oFormModel");
        var oModelData = this.getView().getModel("oFormModel1").getData();
        var arrProjectUpdate = [];
        for (var i = 0; i < oModelData.length; i++) {
          var newObj = {
            CustomerName: oModelData[i].CustomerName,
            AssignmentCode: oModelData[i].AssignmentCode,
            Remarks: oModelData[i].Remarks,
            ProjectName: oModelData[i].ProjectName,
            ProjectType: oModelData[i].ProjectType,
            AllocationPer: oModelData[i].AllocationPer,
            StartDate: oModelData[i].StartDate,
            EndDate: oModelData[i].EndDate,
          };

          arrProjectUpdate.push(newObj);
        }
        var oEntry = {
          Pernr: oModelData[0].PernrD,
          project_update: arrProjectUpdate,
        };
        //return;
        this.getOwnerComponent()
          .getModel()
          .create("/es_project_update", oEntry, {
            success: function (data, response) {
              //this.getView().setBusy(false);
              sap.m.MessageToast.show("Data saved successfully.");
              // oFormModel.refresh();
            }.bind(this),
            error: function (error) {
              //this.getView().setBusy(false);
              sap.m.MessageToast.show(error);
            },
          });
        this.getView().getModel("oFormModel").refresh();
        this.onSearch();
        // this.getView().byId("table").getBinding("rows").refresh();
        // var saveDate =  new Date();
        // MessageBox.error(saveDate);
        this.saveDate();
      },

      saveNewProject: function () {
        var oNewProjMod = new JSONModel();
        this.getView().setModel(oNewProjMod, "oNewProjMod");
        this.getOwnerComponent()
          .getModel()
          .read("/ZEMP_MODULE", {
            success: function (oData) {
              this.getView().getModel("oNewProjMod").setData(oData.results);
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });
      },

      addUser: function () {
        var oView = this.getView();
        // var oModel = new JSONModel(oData);
        this.oUserModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(this.oUserModel, "oUserModel");
        this.getOwnerComponent()
          .getModel()
          .create("/et_team_master", {
            success: function (oResponse) {
              MessageBox.success(oResponse.Message);
              this.getView().getModel("oUserModel").setData(oResponse);
            }.bind(this),
            error: function () {
              MessageBox.error("Odata not Loaded ");
            }.bind(this),
          });
        if (!this._oFragmentUser) {
          this._oFragmentUser = sap.ui.xmlfragment(
            "znewresource.view.fragments.adduser",
            this
          );
          oView.addDependent(this._oFragmentUser);
        }
        this._oFragmentUser.open();
      },

      addNewProject: function () {
        var oView = this.getView();
        if (!this._oFragmentProj) {
          this._oFragmentProj = sap.ui.xmlfragment(
            "znewresource.view.fragments.addNewProject",
            this
          );
          oView.addDependent(this._oFragmentProj);
        }
        this._oFragmentProj.open();
      },
      onCloseProject: function () {
        this._oFragmentProj.close();
      },

      addNewUser: function () {
        var oNewUserModel = new JSONModel({
          Pernr: "",
          ModuleCode: "",
          // SubModuleCode: "",
          FirstName: "",
          MiddleName: "",
          LastName: "",
          Designation: "",
          Doj: "",
          BaseLocation: "",
          // CurrentLocation: "",
          EmailAddress: "",
          Gender: "",
        });
        this.getView().setModel(oNewUserModel, "NewUserModel");
      },

      onChangeGender: function (oEvent) {
        var oSelectedItem = oEvent.getSource().getSelectedKey();
        this.getView()
          .getModel("NewUserModel")
          .setProperty("/Gender", oSelectedItem);
      },
      // onChangeMainModule: function (oEvent) {
      //   var oSelectedItem = oEvent.getSource().getSelectedKey();
      //   this.getView().getModel("NewUserModel").setProperty("/ModuleCode", oSelectedItem);
      // },
      onChangeSubModule: function (oEvent) {
        var oSelectedItem = oEvent.getSource().getSelectedKey();
        this.getView()
          .getModel("NewUserModel")
          .setProperty("/SubModuleCode", oSelectedItem);
      },
      onChangeDesignation: function (oEvent) {
        var oSelectedItem = oEvent.getSource().getSelectedKey();
        this.getView()
          .getModel("NewUserModel")
          .setProperty("/Designation", oSelectedItem);
      },

      onSaveUser: function () {
        var oUserData = this.getView().getModel("NewUserModel").getData();

        if (!this.isUserDataValid(oUserData)) {
          // sap.m.MessageToast.show("Please fill in all required fields");
          return;
        }

        oUserData.Doj = new Date(oUserData.Doj);

        this.getOwnerComponent()
          .getModel()
          .create("/es_employee_add", oUserData, {
            success: function (data, response) {
              sap.m.MessageBox.success("New user added successfully.");
              this.addNewUser();
              this.onSearch();
              this.getEmployeeList();
            }.bind(this),
            error: function (error) {
              sap.m.MessageBox.error("Error adding new employee");
            },
          });

        // this.getDropDownValues();
      },

      isUserDataValid: function (userData) {
        var requiredFields = [
          "Pernr",
          "FirstName",
          "LastName",
          "Doj",
          "Gender",
          "Designation",
          "BaseLocation",
          // "CurrentLocation",
          "EmailAddress",
          "ModuleCode",
          // "SubModuleCode",
        ];
        var emptyFields = [];

        for (var i = 0; i < requiredFields.length; i++) {
          var fieldName = requiredFields[i];
          var displayName = this.getFieldDisplayName(fieldName);

          if (!userData[fieldName]) {
            sap.m.MessageBox.error(displayName + " Field Can not be Empty");
            emptyFields.push(displayName);
          }
        }

        if (emptyFields.length > 0) {
          sap.m.MessageBox.error(
            "Please fill in the following required fields: " +
              emptyFields.map(this.getFieldDisplayName).join(", ")
          );
          return false;
        }

        return true;
      },

      getFieldDisplayName: function (fieldName) {
        // Map field names to display names as needed
        var fieldDisplayNames = {
          Pernr: "Employee ID",
          FirstName: "First Name",
          LastName: "Last Name",
          Doj: "Date of Joining",
          Gender: "Gender",
          Designation: "Designation",
          ModuleCode: "Track/Module",
          // SubModuleCode: "Sub Module",
          EmailAddress: "Email address",
          // CurrentLocation: "Current Location",
          BaseLocation: "Base Location",

          // Add other mappings as needed
        };

        // Use the display name if available, otherwise use the original field name
        return fieldDisplayNames[fieldName] || fieldName;
      },

      resetUserData: function () {
        var oModel = this.getView().getModel("NewUserModel");

        oModel.setData({
          Pernr: "",
          FirstName: "",
          MiddleName: "",
          LastName: "",
          Doj: "",
          Gender: "",
          Designation: "",
          BaseLocation: "",
          CurrentLocation: "",
          EmailAddress: "",
          ModuleCode: "",
          SubModuleCode: "",
        });
        // sap.ui.getCore().byId("idMainModule").setSelectedKey("");
        sap.ui.getCore().byId("idSubModule").setSelectedKey("");
        sap.ui.getCore().byId("idDesignation").setSelectedKey("");
        sap.ui.getCore().byId("idGender").setSelectedKey("");
      },

      //
      onCloseUser: function () {
        this.resetUserData();
        this._oFragmentUser.close();
        this.getEmployeeList();
        this.getDropDownValues("PAD_CNAME", "ResourceModel");
      },
      openHome: function (oEvent) {
        open(
          "https://103.162.247.67:4443/sap/bc/ui2/flp?sap-client=100&sap-language=EN#Shell-home"
        );
      },
      onEditEmpDetails: function () {
        this.getView()
          .getModel("oVisibleModel")
          .setProperty("/textVisible", false);
        this.getView()
          .getModel("oVisibleModel")
          .setProperty("/dropDownVisible", true);
      },
      onCancelEmp: function () {
        // this.handleMessagePopoverPress();
        var pernrx = this.getView()
          .getModel("SelectedRowModel")
          .getProperty("/Pernr");

        this.getCallTable(pernrx);

        this.getView()
          .getModel("oVisibleModel")
          .setProperty("/dropDownVisible", false);
        this.getView()
          .getModel("oVisibleModel")
          .setProperty("/textVisible", true);
      },

      onListItemPress: function () {
        var desName = new JSONModel();
        this.getView().setModel(desName, "oLevelModel");
        this.oModel = this.getOwnerComponent().getModel();
        var filter2 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "ZEMP_DESIGNATION",
        });

        this.oModel.read("/es_value_helps", {
          filters: [filter2],
          success: function (oData) {
            // aFilteredData.push(oData);
            this.getView().getModel("oLevelModel").setData(oData.results);
            // oProjectTypeModel.setData(oData.results);
            // this.handleProjectTypeFormatting();
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          },
        });
      },
      availResource: function () {
        var oView = this.getView();
        if (!this._oFragmentavail) {
          this._oFragmentavail = sap.ui.xmlfragment(
            "znewresource.view.fragments.availRes",
            this
          );
          oView.addDependent(this._oFragmentavail);
        }
        this._oFragmentavail.open();
        this.getavailableResources();
      },
      getavailableResources: function () {
        var oAvailResModel = new JSONModel();
        this.getView().setModel(oAvailResModel, "availResModel");
        // ;
        this.getOwnerComponent()
          .getModel()
          .read("/es_availableresourcesSet", {
            // filters: aFilters,
            success: function (oData) {
              this.getView().getModel("availResModel").setData(oData.results);
              // ;
            }.bind(this),
            error: function (oError) {
              // this.getView().setBusy(false);
              console.log(oError);
            },
          });
      },
      availResourceClose: function () {
        this._oFragmentavail.close();
      },
      availableResExporttoExcel: function () {
        var oTable = this.getView().byId("idAvailResTable");
        // var aData = oTable.getModel("oFormModel").getProperty("/");
        var aData = this.getView().getModel("availResModel").getProperty("/");
        // Define custom column names
        var columnNames = {
          Pernr: "Employee ID",
          Name: "Employee Name",
          BaseLocation: "Location",
          DesignationText: "Designation",
          CurrentMtd: "Current Mtd",
          LastMtd: "Last MTD",
          Ytd: "YTD",
        };

        var selectedColumns = [
          "Pernr",
          "Name",
          "BaseLocation",
          "DesignationText",
          "CurrentMtd",
          "LastMtd",
          "Ytd",
        ];
        var csvContent =
          selectedColumns.map((col) => columnNames[col] || col).join(",") +
          "\n";

        aData.forEach(function (row) {
          csvContent += selectedColumns.map((key) => row[key]).join(",") + "\n";
        });

        var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Available_Resources_Report.csv");
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
    });
  }
);
