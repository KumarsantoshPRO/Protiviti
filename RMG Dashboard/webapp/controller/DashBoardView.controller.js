sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format",
    "sap/m/MessageBox",
    "sap/ui/core/IconPool",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Text",
    "sap/ui/model/Sorter"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, ChartFormatter, Format, Sorter, MessageBox, IconPool, Dialog, Button, mobileLibrary, List, StandardListItem, Text) {
    "use strict";

    return Controller.extend("rmg.rmgdashboard.controller.DashBoardView", {
      dataPointStyle: {
        rules: [
          {
            dataContext: { Mtd: { min: 80 } },
            properties: {
              color: "sapUiChartPaletteSemanticGood",
            },
            displayName: "> 80%",
          },
          {
            dataContext: { Mtd: { min: 50, max: 80 } },
            properties: {
              color: "sapUiChartPaletteSemanticCritical",
            },
            displayName: "50% - 80%",
          },
          {
            dataContext: { Mtd: { max: 50 } },
            properties: {
              color: "sapUiChartPaletteSemanticBad",
            },
            displayName: "< 50%",
          },
        ],
      },

      onInit: function () {
        Format.numericFormatter(ChartFormatter.getInstance());
        var formatPattern = ChartFormatter.DefaultPattern;

        var oData = {
          Resources: [
            //   { "Module": "SD", MTD: 85, Month:"NOV" },
            //   { "Module": "MM", MTD: 65, Month:"NOV" },
            //   { "Module": "ABAP", MTD: 55, Month:"NOV" },
            //   { "Module": "FIORI", MTD: 87, Month:"NOV" },
            //   { "Module": "FI", MTD: 45, Month:"NOV" },
            //   { "Module": "SD", MTD: 70, Month:"DEC" },
            //   { "Module": "MM", MTD: 65, Month:"DEC" },
            //   { "Module": "ABAP", MTD: 88, Month:"DEC" },
            //   { "Module": "FIORI", MTD: 48, Month:"DEC" },
            //   { "Module": "FI", MTD: 45, Month:"DEC" },
            //   { "Module": "SD", MTD: 50, Month:"JAN" },
            //   { "Module": "MM", MTD: 70, Month:"JAN" },
            //   { "Module": "ABAP", MTD: 78, Month:"JAN" },
            //   { "Module": "FIORI", MTD: 30, Month:"JAN" },
            //   { "Module": "FI", MTD: 85, Month:"JAN" },
          ],
        };

        var oHeatMapDataModel = new JSONModel(oData);
        this.getView().setModel(oHeatMapDataModel, "HeatMapDataModel");

        this.oVizFrame = this.getView().byId("idVizFrameMTD");

        this.oVizFrame.setVizProperties({
          plotArea: {
            dataPointStyle: this.dataPointStyle,
            drawingEffect: "glossy",
          },
        });

        this.oVizFrame.setVizProperties({
          valueAxis: {
            title: {
              visible: true,
            },
          },
          categoryAxis: {
            title: {
              visible: true,
            },
          },
          categoryAxis2: {
            title: {
              visible: true,
            },
          },
          legend: {
            visible: true,
            title: {
              visible: true,
            },
          },
          title: {
            visible: true,
            text: "MTD by Module",
          },
        });

        var oPopOver = this.getView().byId("idPopOver");
        // oPopOver.connect(this.oVizFrame.getVizUid());
        // oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

        var oHost = new sap.ui.integration.Host({
          actions: [
            {
              type: "Custom",
              icon: "sap-icon://add",
              text: "View",
              action: function (oCard, oButton) {
                // do some action
              },
              enabled: function (oCard) {
                // return whether this host action
                // should be enabled in the card
                return true;
              },
              visible: function (oCard) {
                // return whether this host action
                // should be visible in the card
                return true;
              },
            },
          ],
        });

        this.getView().byId("card1").setHost(oHost);

        var stacked = [
          {
            Technology: "ABAP",
            OnBench: 23,
            OnProject: 27,
            Total: 50,
          },
          {
            Technology: "FIORI",
            OnBench: 15,
            OnProject: 20,
            Total: 35,
          },
          {
            Technology: "SuccessFactors",
            OnBench: 10,
            OnProject: 30,
            Total: 40,
          },
        ];

        var ostackedModel = new JSONModel({
          data: stacked,
        });
        var oSkillData = new JSONModel();
        this.getView().setModel(oSkillData,"oSkillData");
        var oUtilData = new JSONModel();
        this.getView().setModel(oUtilData,"oUtiliModel");
        var oUpcomgprj = new JSONModel();
        this.getView().setModel(oUpcomgprj,"oUpcmgprjModel")
        this.getView().setModel(ostackedModel);
        var oLastUpdateUtil = new JSONModel({
          LastupdUtilDate: "",
          startDate: "",
          EndDate: ""
        });
        this.getView().setModel(oLastUpdateUtil,"oUtilDateModel")
        this.getUpcomingprojects();
        this.getSkillupdatedDetails();
        this.getUtilizationBarChart();
        this.getBenchStrengthDetails();
        this.getLocationDetails();
        this.getLastUpdUtilDate();
        //this.getView().setModel(new JSONModel(this.getBenchStrengthChart()), "BenchStrengthChart");

        // var oAppModel = new JSONModel(this.getLocationDonutChart());
        // this.getView().setModel(oAppModel, "manifests");

        this.getHeatMapdata();

        var ototalEmp = new JSONModel({
            totalEmpcount: ""
        });
        this.getView().setModel(ototalEmp, "TotEmpModel");
        var moduleName = new JSONModel({
          moduleName: "",
          monthName: "",
        });
        this.getView().setModel(moduleName, "HeatMapModuleName")
        var selectionModel = new JSONModel({
          selectedKey: "0",
          donutvisible: true,
          barvisible: false
        });
        this.getView().setModel(selectionModel,"selectionModel");
        // this.setChartType();
      },
      //set chart based on selection
      setChartType: function(){
        var selectionModel = this.getView().getModel("selectionModel");
        var selectedKey = selectionModel.getProperty("/selectedKey");
        if (selectedKey === "0"){
          selectionModel.setProperty("/donutvisible" , true)
          selectionModel.setProperty("/barvisible", false)
        }
        else if(selectedKey === "1"){
          selectionModel.setProperty("/donutvisible" , false)
          selectionModel.setProperty("/barvisible", true)
        }
        else{
          selectionModel.getProperty("/donutvisible" , true)
        }
      },

      // Skillnot Updated Get Call
      getSkillupdatedDetails: function(){
        this.getOwnerComponent().getModel().read("/es_skillnotupdated",{
          success: function(oData){
            this.getView().setModel( oData.results[0],"oSkillData");
            this.getView().setModel(new JSONModel(this.getListData()), "listData");
            
            // this.getView().getModel("oSkillData").setProperty("/count", count);
          }.bind(this),
          error: function(response){
            console.log(response)
          }.bind(this)
        });
        
      },
      // Utilization Bar Chart Get Call
      getUtilizationBarChart: function(){
        this.getOwnerComponent().getModel().read("/es_utilization",{
          success: function(oData){
            this.getView().setModel(oData.results[0], "oUtiliModel");
           this.getView().setModel(new JSONModel(this.getBarData()), "barChart");
          }.bind(this),
          error: function(response){
            console.log(response)
          }.bind(this)
        });
      },
      // upcomming projects get call
      getUpcomingprojects: function(){
        this.getOwnerComponent().getModel().read("/es_upcomingprojects",{
          success: function(oData){
            this.getView().setModel(oData.results[0], "oUpcmgprjModel");
          }.bind(this),
          error:function(response){
            console.log(response);
          }.bind(this)
        });
      },
      // Last Updated Date on Mtd ytd
      getLastUpdUtilDate: function () {
        this.getOwnerComponent()
          .getModel()
          .read("/es_utilupdated", {
            success: function (oData) {
              this.getView().getModel("oUtilDateModel").setData(oData.results[0]);
              var lastupdate = this.getView().getModel("oUtilDateModel").getProperty("/LastUpdateddate");
              var startDate = this.getView().getModel("oUtilDateModel").getProperty("/StartDate");
              var endDate = this.getView().getModel("oUtilDateModel").getProperty("/EndDate");
              this.getView().getModel("oUtilDateModel").setProperty("/LastupdUtilDate", this.formatUtilDate(lastupdate));
              this.getView().getModel("oUtilDateModel").setProperty("/startDate", this.formatUtilDate(startDate));
              this.getView().getModel("oUtilDateModel").setProperty("/EndDate", this.formatUtilDate(endDate));

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
        var formattedDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();

        return formattedDate;
      },
      getBenchStrengthDetails: function (oData) {
        this.getOwnerComponent()
          .getModel()
          .read("/es_employee_level_data", {
            success: function (oData, response) {
              //var oBenchStrengthModel = new JSONModel(this.getBenchStrengthChart(oData));
              for(var i= 0; i<oData.results.length;i++){
                oData.results[i].Name = oData.results[i].Name.replaceAll("Managing Director", "MD");
                oData.results[i].Name = oData.results[i].Name.replaceAll("Associate Director", "AD");
                oData.results[i].Name = oData.results[i].Name.replaceAll("Senior Manager", "Senior Mngr");
                oData.results[i].Name = oData.results[i].Name.replaceAll("Deputy Manager", "Deputy Mngr");
                oData.results[i].Name = oData.results[i].Name.replaceAll("Senior Consultant", "Senior Con");
              }
              var oBenchStrengthModel = new JSONModel(oData.results);
              //     {
              //         "stackedColumn": oData.results,
              //         "Total": ""
              //     }
              // );
              this.getView().setModel(oBenchStrengthModel, "BenchStrengthChart");
              
            }.bind(this),
            error: function (response) {
              console.log(response);
            },
          });
      },

      getLocationDetails: function () {
        this.getOwnerComponent()
          .getModel()
          .read("/es_location_data", {
            success: function (oData, response) {
              var oLocationDetailsModel = new JSONModel(this.getLocationDonutChart(oData));
              this.getView().setModel(oLocationDetailsModel, "LocationDetailsModel");

              var oLocationDetailsbar = new JSONModel(this.getLocationBarChart(oData));
              this.getView().setModel(oLocationDetailsbar, "LocationDetailsBar");

              var totalEmp = oData.results[0].TotalEmployee;
              this.getView().getModel("TotEmpModel").setProperty("/totalEmpcount", totalEmp);
            }.bind(this),
            error: function (response) {
              console.log(response);
            },
          });
      },

      // Location donut chart
      getLocationDonutChart: function (oData) {
        // var arrLocMeasureData = this.getLocationMeasure();
        var arrMeasures = this.getLocationMeasure(oData);
        return {
          donut: {
            "sap.app": {
              id: "sample.CardsLayout.model.donut",
              type: "card",
            },
            "sap.card": {
              type: "Analytical",
              header: {
                title: "Employee By locations",
              },
              content: {
                chartType: "donut",
                legend: {
                  visible: true,
                  position: "Bottom",
                  alignment: "Left",
                },
                plotArea: {
                  drawingEffect: "glossy",
                  dataLabel: {
                    visible: true,
                    showTotal: true,
                  },
                },
                title: {
                  visible: false,
                },
                measureAxis: "size",
                dimensionAxis: "color",
                data: {
                  json: {
                    measures: arrMeasures,
                  },
                  path: "/measures",
                },
                dimensions: [
                  {
                    label: "Location",
                    value: "{location}",
                  },
                ],
                measures: [
                  {
                    label: "Employee",
                    value: "{value}",
                  },
                ],
              },
            },
          },
        };
      },
      // location Bar chart
      getLocationBarChart: function(oData){
        var arrMeasures = this.getLocationMeasure(oData);
        var totalCount = this.getTotalCount(arrMeasures);
        return {
          stackedColumn: {
            "sap.app": {
              id: "sample.CardsLayout.model.Analytical",
              type: "card",
            },
            "sap.card": {
              type: "Analytical",
              header: {
                type: "Numeric",
                data: {
                  json: {
                    n: totalCount,
                    // "u": "%",
                    // "trend": "Down",
                    // "valueColor": "Good"
                  },
                },
                title: "Employee By Locations",
                mainIndicator: {
                  number: "{n}",
                  unit: "{u}",
                  trend: "{trend}",
                  state: "{valueColor}",
                },
              },
              content: {
                chartType: "StackedColumn",
                legend: {
                  visible: false,
                  position: "Bottom",
                  alignment: "Left",
                },
                plotArea: {
                  drawingEffect:"glossy",
                  dataLabel: {
                    visible: false,
                    showTotal: true, 
                  },
                  
                  categoryAxisText: {
                    visible: true,
                  },
                  valueAxisText: {
                    visible: true,
                  },
                
                },
                title: {
                  visible: false,
                },
                measureAxis: "valueAxis",
                dimensionAxis: "categoryAxis",
                data: {
                  json: {
                    list: arrMeasures,
                  },
                  path: "/list",
                },
                dimensions: [
                  {
                    label: "Location",
                    value: "{location}",
                  },
                ],
                measures: [
                  {
                    label: "Employees",
                    value: "{value}",
                  },
                ],
              },
            },
          },
        };
      },
      getLocationMeasure: function (oData) {
        var arrMeasure = [];
        for (var i = 0; i < oData.results.length; i++) {
          var newLocObj = {
            location: oData.results[i].Name + " (" + oData.results[i].Count + ")",
            value: oData.results[i].Count,
          };
          arrMeasure.push(newLocObj);
        }

        return arrMeasure;
      },

      getBenchStrengthData: function (oData) {
        var arrBenchStrenth = new Array();
        for (var i = 0; i < oData.results.length; i++) {
          var newLocObj = {
            Name: oData.results[i].Name,
            Count: oData.results[i].Count,
            Bench: oData.results[i].Bench,
          };
          arrBenchStrenth.push(newLocObj);
        }

        return arrBenchStrenth;
      },

      getTotalCount: function (ArrData) {
        var total = 0;
        for (var i = 0; i < ArrData.length; i++) {
          total = total + parseInt(ArrData[i].Count);
        }

        return total;
      },

      getBenchStrengthChart: function (oData) {
        var arrMeasures = this.getBenchStrengthData(oData);
        var totalCount = this.getTotalCount(arrMeasures);
        return {
          stackedColumn: {
            "sap.app": {
              id: "sample.CardsLayout.model.Analytical",
              type: "card",
            },
            "sap.card": {
              type: "Analytical",
              header: {
                type: "Numeric",
                data: {
                  json: {
                    n: totalCount,
                    // "u": "%",
                    // "trend": "Down",
                    // "valueColor": "Good"
                  },
                },
                title: "Total Strength",
                mainIndicator: {
                  number: "{n}",
                  unit: "{u}",
                  trend: "{trend}",
                  state: "{valueColor}",
                },
              },
              content: {
                chartType: "StackedColumn",
                legend: {
                  visible: true,
                  position: "Bottom",
                  alignment: "Left",
                },
                plotArea: {
                  dataLabel: {
                    visible: false,
                    showTotal: false,
                  },
                  categoryAxisText: {
                    visible: false,
                  },
                  valueAxisText: {
                    visible: false,
                  },
                },
                title: {
                  visible: false,
                },
                measureAxis: "valueAxis",
                dimensionAxis: "categoryAxis",
                data: {
                  json: {
                    list: arrMeasures,

                    // [
                    //     {
                    //         "Category": "Weather",
                    //         "Revenue": 431000.22,
                    //         "Cost": 230000.00,
                    //         "Target": 500000.00,
                    //         "Budget": 210000.00
                    //     },
                    //     {
                    //         "Category": "Mechanics",
                    //         "Revenue": 494000.30,
                    //         "Cost": 238000.00,
                    //         "Target": 500000.00,
                    //         "Budget": 224000.00
                    //     },
                    //     {
                    //         "Category": "Software",
                    //         "Revenue": 491000.17,
                    //         "Cost": 221000.00,
                    //         "Target": 500000.00,
                    //         "Budget": 238000.00
                    //     }
                    // ]
                  },
                  path: "/list",
                },
                dimensions: [
                  {
                    label: "Categories",
                    value: "{Name}",
                  },
                ],
                measures: [
                  {
                    label: "OnBench",
                    value: "{Bench}",
                  },
                  {
                    label: "On Project",
                    value: "{Count}",
                  },
                ],
              },
            },
          },
        };
      },

      getBarData: function () {
        var Mtd = this.getView().getModel("oUtiliModel").Mtd;
        var ytd = this.getView().getModel("oUtiliModel").Ytd;
        return {
          donut: {
            "sap.app": {
              id: "sample.CardsLayout.model.barchart",
              type: "card",
            },
            "sap.card": {
              type: "Analytical",
              header: {
                title: "Utilization of SAP Practice",
                action: "Navigate",
              },
              content: {
                chartType: "StackedBar",
                legend: {
                  visible: true,
                  position: "Right",
                  alignment: "Left",
                },
                plotArea: {
                  dataLabel: {
                    visible: true,
                    showTotal: true,
                  },
                  categoryAxisText: {
                    visible: true,
                  },
                  valueAxisText: {
                    visible: true,
                  },
                },
                title: {
                  visible: false,
                },
                measureAxis: "valueAxis",
                dimensionAxis: "categoryAxis",
                data: {
                  json: {
                    measures: [
                      {
                        location: "YTD",
                        value: ytd,
                      },
                      {
                        location: "MTD",
                        value: Mtd,
                      },
                    ],
                  },
                  path: "/measures",
                },
                dimensions: [
                  {
                    label: "Hours Measure",
                    value: "{location}",
                  },
                ],
                measures: [
                  {
                    label: "Hours (%)",
                    value: "{value}",
                  },
                ],
              },
            },
          },
        };
      },

      getListData: function () {
        var count = this.getView().getModel("oSkillData").Count;
        var upcmgPrj = this.getView().getModel("oUpcmgprjModel").Count;
        // var oskillData = this.getView().getModel("oSkillData");
        return {
          ListNumericHeader: {
            "sap.card": {
              type: "List",
              header: {
                title: "Others",
                subTitle: "",
                type: "Numeric",
                unitOfMeasurement: "",
                sideIndicators: [
                  // {
                  //   title: "Open Positions",
                  //   number: "20",
                  //   unit: "",
                  // },
                  {
                    title: "Skills not Updated",
                    number: count,
                    unit: "",
                  },
                  {
                    title: "Up Coming Projects",
                    number: upcmgPrj,
                    unit: "",
                  },
                ],
              },
            },
          },
        };
      },

      onLocationDonutPress: function () {
        alert("on Location donut clicked.");
      },

      // get the Table Data Based on module and Month 
      onSelectHeatMap: function (oEvent) {
        // debugger;
        var oItem = oEvent;
        var oTableData = new JSONModel({
          moduleName:"",
          monthName:"",
        });
        this.getView().setModel(oTableData, "TableDataModel");
        // MessageBox.information("Hello");
        // this.onResponsivePaddingDialogPress();
        var moduleName = oEvent.getParameters().data[0].data.Module;
        var monthName = oEvent.getParameters().data[0].data.Month;
        this.getView().getModel("HeatMapModuleName").setProperty("/moduleName", moduleName );
        this.getView().getModel("HeatMapModuleName").setProperty("/monthName", monthName );
        
        var newArrayFilter = new Array();
        // SubModule Filter
        var submodFilter = new sap.ui.model.Filter({
          path: "SubModule",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: oEvent.getParameters().data[0].data.Module, // Read Module Name From the Heat Map
        });
        newArrayFilter.push(submodFilter);
        // Month  Filter
        var monthFilter = new sap.ui.model.Filter({
          path: "Month",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: oEvent.getParameters().data[0].data.Month, //Read Month From the Heat Map
        });
        newArrayFilter.push(monthFilter);

        // Get Call for Table 
        this.getOwnerComponent()
          .getModel()
          .read("/et_emp_wise_mtdSet", {
            filters: newArrayFilter,  // applying the Filters
            success: function (oData) {
              var results = oData.results;
              results.forEach(function(result){
                var mtd = result.CurrentMtd;
                var Pernr = result.Pernr;
                var Ytd = result.Ytd;
                result.CurrentMtd = parseInt(mtd,10).toString();
                result.Pernr = parseInt(Pernr, 10).toString();
                result.Ytd = parseInt(Ytd, 10).toString();
              });
              this.getView().getModel("TableDataModel").setData(oData.results); // set Data to the Table model
              
            }.bind(this),
            error: function (oError) {
              console.log(oError);
            },
          });

        this.openDialog();
      },
      openDialog: function () {
        var oView = this.getView();
        if (!this.openTable) {
          this.openTable = sap.ui.xmlfragment("TableFrag","rmg.rmgdashboard.view.fragments.Table", this);
          oView.addDependent(this.openTable);
        }
        this.openTable.open();
      },
      closeDialog: function () {
        this.openTable.close();
      },

      onViewDetailsOfModule: function () {
        // Step 1: Get Service for app to app navigation
        var navigationService = sap.ushell.Container.getService("CrossApplicationNavigation");

        // Step 2: Navigate using your semantic object
        navigationService.toExternal({
          target: {
            semanticObject: "znewresource",
            action: "display",
          },
          //params : { A : "B" } // optionally
        });
      },

      // onResponsivePaddingDialogPress: function () {
      //     if (!this.oResponsivePaddingDialog) {
      //         this.oResponsivePaddingDialog = new Dialog({
      //             title: "On SAP Quartz and Horizon themes, the padding will adjust based on the width of the Dialog",
      //             contentWidth: "760px",
      //             contentHeight: "450px",
      //             resizable: true,
      //             draggable: true,
      //             content: new List({
      //                 items: {
      //                     path: "",
      //                     template: new StandardListItem({
      //                         title: "Name",
      //                         counter: ""
      //                     })
      //                 }
      //             }),
      //             beginButton: new Button({
      //                 type: ButtonType.Emphasized,
      //                 text: "OK",
      //                 press: function () {
      //                     this.oResponsivePaddingDialog.close();
      //                 }.bind(this)
      //             }),
      //             endButton: new Button({
      //                 text: "Close",
      //                 press: function () {
      //                     this.oResponsivePaddingDialog.close();
      //                 }.bind(this)
      //             })
      //         });

      //         // Enable responsive padding by adding the appropriate classes to the control
      //         this.oResponsivePaddingDialog.addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader");

      //         //to get access to the controller's model
      //         this.getView().addDependent(this.oResponsivePaddingDialog);
      //     }

      //     this.oResponsivePaddingDialog.open();
      // },

      // Heatmap details below here
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////

      getHeatMapdata: function () {
        //debugger;
        this.getOwnerComponent()
          .getModel()
          .read("/es_module_data", {
            success: function (oData, response) {
              var newSetData = new Array();
              for (var i = 0; i < oData.results.length; i++) {
                if (oData.results[i].Name) {
                  oData.results[i].Mtd = parseInt(oData.results[i].Mtd, 10);
                  oData.results[i].Ytd = parseInt(oData.results[i].Ytd, 10);
                  newSetData.push(oData.results[i]);
                }
              }
              // var oHeatMapModel = new JSONModel();
              // oHeatMapModel.setData(oData);
              this.getView().getModel("HeatMapDataModel").setProperty("/Resources", newSetData);
            }.bind(this),
            error: function (response) {
              console.log(response);
            },
          });
      },
      ExporttoExcelMtdReport: function(){
        var aData = this.getView().getModel("TableDataModel").getProperty("/");
        // Define custom column names
        var columnNames = {
          Pernr: "Employee ID",
          Name: "Employee Name",
          DesignationText: "Designation",
          CurrentMtd: "Current Mtd",
          LastMtd: "Last MTD",
          Ytd: "YTD",
        };

        var selectedColumns = ["Pernr", "Name", "DesignationText", "CurrentMtd", "LastMtd", "Ytd"];
        var csvContent = selectedColumns.map((col) => columnNames[col] || col).join(",") + "\n";

        aData.forEach(function (row) {
          csvContent += selectedColumns.map((key) => row[key]).join(",") + "\n";
        });

        var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Employee_wise_MTD_Report.csv");
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      getPendingData: function () {
        var empModel = new JSONModel();
        empModel.setData({
          Table: [
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
            {
              empid: "RN123456801",
              name: "NI-Chandigarh",
              desig: "Aman Sharma",
              mtd: "TN0S0117",
            },
          ],
        });

        this.getView().setModel(empModel, "tmodel");
      },
      // Sorting Table Data 
      onDescendingPress: function () {
        this._sortTable("EmployeeNo", false);
    },
    onAscendingPress: function () {
        this._sortTable("EmployeeNo", true);
    },
    _sortTable: function (sSortProperty, bDescending) {
      var oTable = sap.ui.core.Fragment.byId("TableFrag", "mtdtable");
      var oBinding = oTable.getBinding("rows").oList;
      
      // Create a sorter with the sort path and direction
      var oSorter = new sap.ui.model.Sorter( "EmployeeNo", "Ascending");
      
      // Apply the sorter to the table binding
      oBinding.sort(oSorter);
  }
    });
  }
);
