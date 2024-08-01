sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/zskrep/zskillreport/model/formatter",
    "sap/ui/export/Spreadsheet",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Filter, FilterOperator, formatter, Spreadsheet) {
    "use strict";

    return Controller.extend("com.zskrep.zskillreport.controller.skillReport", {
      formatter: formatter,
      onInit: function () {
        // this.tableData();
        var oFormModel = new JSONModel();
        this.getView().setModel(oFormModel, "oEmployeeListModel");

        var ofilterDataModel = new JSONModel({
          location: "",
          primarySkill: "",
          secSkill: "",
          totExp: "",
          indExp: "",
          profUpdate: "0",
        });
        this.getView().setModel(ofilterDataModel, "FilterDataModel");

        this.getDropDownValues("BASELOCATION", "BaseLocModel");
        this.getDropDownValues("SECONDARY", "PrSkillModel");
        this.getDropDownValues("PRIMARY", "ScSkillModel");
        this.getDropDownValues("INDUSTRIES", "IndExpModel");
        this.getDropDownValues("TOTAL_EXP", "TotExpModel");
        this.createYearModel();
        //this.getEmployeeList();
      },

      onSearch: function () {
        this.getEmployeeList();
      },

      getEmployeeList: function () {
        this.getView().setBusy(true);
        var newArrayFilter = new Array();
        var locFilter = new sap.ui.model.Filter({
          path: "BaseLocCode",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/location"),
          // value1: "01"
        });
        newArrayFilter.push(locFilter);

        // DateFilter
        var updDateFilter = new sap.ui.model.Filter({
          path: "Datefilter",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/profUpdate"),
          // value1: "0"
        });
        newArrayFilter.push(updDateFilter);
        // Total Experience
        var TotExpFilter = new sap.ui.model.Filter({
          path: "TotalExp",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/totExp"),
          // value1: "0"
        });
        newArrayFilter.push(TotExpFilter);
        // Primary Skill
        var PriSkilFilter = new sap.ui.model.Filter({
          path: "PrimarySkill",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/primarySkill"),
          // value1: "0"
        });
        newArrayFilter.push(PriSkilFilter);
        // Secondary Skill
        var SecSkilFilter = new sap.ui.model.Filter({
          path: "SecondarySkill",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/secSkill"),
          // value1: "0"
        });
        newArrayFilter.push(SecSkilFilter);
        //Industry Expertise Filter
        var IndExpFilter = new sap.ui.model.Filter({
          path: "IndustryExpertise",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/indExp"),
          // value1: "0"
        });
        newArrayFilter.push(IndExpFilter);

        this.getOwnerComponent()
          .getModel()
          .read("/et_userdetailsSet", {
            filters: newArrayFilter,
            success: function (oData) {
              for(var i=0; i<oData.results.length; i++){
                oData.results[i].SecondarySkill = oData.results[i].SecondarySkill.replaceAll(",", ";");
                oData.results[i].IndustryExpertise = oData.results[i].IndustryExpertise.replaceAll(",", ";");
              }
              var responseData = this.getPrimarySkillText(oData.results);
              this.getView().getModel("oEmployeeListModel").setData(responseData);

              const arr = oData.results;

              this.getView().setBusy(false);
              console.log(arr);
            }.bind(this),
            error: function (oError) {
              this.getView().setBusy(false);
              console.log(oError);
            },
          });
      },
      getPrimarySkillText: function (oData) {
        for (var i = 0; i < oData.length; i++) {
          var mappedObj = this.mapText(oData[i]);
          oData[i].PrimarySkillText = mappedObj.PrimarySkillText;
          // oData[i].SecondarySkill = mappedObj.SecondarySkill;
          // oData[i].IndustryExpText = mappedObj.IndustryExpText;
        }

        return oData;
      },
      mapText: function (obj) {
        var newObj = {
          PrimarySkillText: ""
          // SecondarySkill: "",
          // IndustryExpText: "",
        };
        var PrSkillModelData = this.getView().getModel("PrSkillModel").getData();
        for (var i = 0; i < PrSkillModelData.length; i++) {
          if (obj.PrimarySkill === PrSkillModelData[i].DomvalueL || obj.PrimarySkill === PrSkillModelData[i].Ddtext) {
            //return PrSkillModelData[i].Ddtext;
            newObj.PrimarySkillText = PrSkillModelData[i].Ddtext;
          }
        }

        // var ScSkillModelData = this.getView().getModel("ScSkillModel").getData();
        // for (var i = 0; i < ScSkillModelData.length; i++) {
        //  var secondarySkills = ScSkillModelData[i].DomvalueL.split(", ");
        //  var primarySkill = ScSkillModelData[i].Ddtext;
 
        // if (secondarySkills.includes(obj.SecondarySkill) || primarySkill === obj.PrimarySkill) {
        //     newObj.SecondarySkill = primarySkill;
        //     break; 
        //   }
        // }
        // var IndExpModelData = this.getView().getModel("IndExpModel").getData();
        // for (var i = 0; i < IndExpModelData.length; i++) {
        //   if (obj.IndustryExpertise === IndExpModelData[i].DomvalueL || obj.IndustryExpertise === IndExpModelData[i].Ddtext) {
        //     newObj.IndustryExpText = IndExpModelData[i].Ddtext;
        //   }
        // }

        return newObj;
      },
      getDropDownValues: function (sDomValue, sModelName) {
        var oNewModel = this.getOwnerComponent().getModel("Skill_Portal");
        this.getView().setBusy(true);
        var oBaseLocModel = new JSONModel();
        this.getView().setModel(oBaseLocModel, sModelName);
        var filter = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: sDomValue,
        });

        oNewModel.read("/es_value_helps", {
          filters: [filter],
          success: function (oData) {
            var model = this.getView().getModel(sModelName);
            model.setData(oData.results);
            this.getView().setModel(model, sModelName);
            this.getView().setBusy(false);
          }.bind(this),
          error: function (oError) {
            this.getView().setBusy(false);
            console.log(oError);
          }.bind(this),
        });
      },

      createYearModel: function () {
        var aYears = [];
        for (var i = 0; i <= 30; i++) {
          if (i < 30) {
            if (i < 10) {
              aYears.push({
                key: ("0" + i).toString(),
                text: i.toString() + " Years",
              });
            } else {
              aYears.push({
                key: i.toString(),
                text: i.toString() + " Years",
              });
            }
          } else {
            aYears.push({
              key: "30+",
              text: "30+" + " Years",
            });
          }
        }
        var oYearsModel = new JSONModel({ years: aYears });
        this.getView().setModel(oYearsModel, "YearsModel");
      },

      onClearFilter: function () {
        var ofilterDataModel = new JSONModel({
          location: "",
          primarySkill: "",
          secSkill: "",
          totExp: "",
          profUpdate: "0",
        });
        this.getView().setModel(ofilterDataModel, "FilterDataModel");
        this.getEmployeeList();
      },
      onClickofItem: function (oEvent) {
        this.oRouter1 = this.getOwnerComponent().getRouter();
        this.oRouter1.navTo("EmployeeSkillPortal", {
          Id: oEvent.getSource().getCells()[10].getText(),
        });
      },
      // exportToExcel:function(){
      //   var oTable = this.getView().byId("idSkillReport");
      //   var aData = oTable.getModel("oEmployeeListModel").getProperty("/");
      //   var dateFromBackend = this.getView().getModel("oEmployeeListModel").getProperty("/LastUpdateddate");
      //   var selectedColumns = [
      //       "Pernr", "Name", "PrimarySkillText", "CurrentLocation", "TotalExp", "LastUpdateddate"
      //   ];
      //   var csvContent = selectedColumns.join(",") + "\n";

      //   aData.forEach(function(row){
      //       csvContent += selectedColumns.map(key => row[key]).join(",") + "\n";
      //   });

      //   var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      //   var link = document.createElement("a");
      //   var url = URL.createObjectURL(blob);
      //   link.setAttribute("href", url);
      //   link.setAttribute("download", "SkillPortalReport.csv");
      //   document.body.appendChild(link);

      //   link.click();

      //   document.body.removeChild(link);
      //   URL.revokeObjectURL(url);
      // }
      //   exportToExcel: function () {
      //     var oTable = this.getView().byId("idSkillReport");
      //     var aData = oTable.getModel("oEmployeeListModel").getProperty("/");
      //     var selectedColumns = [
      //         "Pernr", "Name", "PrimarySkillText", "CurrentLocation", "TotalExp", "LastUpdateddate"
      //     ];
      //     var csvContent = selectedColumns.join(",") + "\n";

      //     // Function to format date to "DD MONTH YEAR"
      //     function formatDate(dateString) {
      //         var date = new Date(dateString);
      //         var options = { day: '2-digit', month: 'long', year: 'numeric' };
      //         return date.toLocaleDateString('en-US', options);
      //     }

      //     aData.forEach(function (row) {
      //         // Format the date field before appending
      //         row.LastUpdateddate = formatDate(row.LastUpdateddate);
      //         csvContent += selectedColumns.map(key => {
      //             // Check if the key is for date field, if yes then format it
      //             return key === "LastUpdateddate" ? formatDate(row[key]) : row[key];
      //         }).join(",") + "\n";
      //     });

      //     var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      //     var link = document.createElement("a");
      //     var url = URL.createObjectURL(blob);
      //     link.setAttribute("href", url);
      //     link.setAttribute("download", "SkillPortalReport.csv");
      //     document.body.appendChild(link);

      //     link.click();

      //     document.body.removeChild(link);
      //     URL.revokeObjectURL(url);
      // }
      //   {
      //     property: "Duedate",
      //     label: "Due date (islamic)",
      //     type: sap.ui.export.EdmType.Date,
      //     calendar: "islamic"
      // },

      exportToExcel: function () {
        var oTable = this.getView().byId("idSkillReport");
        var aData = oTable.getModel("oEmployeeListModel").getProperty("/");
        // Define custom column names
        var columnNames = {
            "Pernr": "Employee ID",
            "Name": "Employee Name",
            "CurrentLocation": "Location",
            "PrimarySkillText": "Primary Skill",
            "SecondarySkill": "Secondary Skill",
            "IndustryExpertise": "Industry Expertise",
            "TotalExp": "Total Experience",
            "RelevantExp": "SAP Experience",
            "CurrentMtd": "MTD", 
            "Ytd": "YTD",
            "LastUpdateddate": "Last Updated Date"
        };
     
        var selectedColumns = [
            "Pernr", "Name", "CurrentLocation", "PrimarySkillText", "SecondarySkill", "IndustryExpertise", "TotalExp","RelevantExp", "CurrentMtd", "Ytd", "LastUpdateddate"
        ];
        var csvContent = selectedColumns.map(col => columnNames[col] || col).join(",") + "\n";
     
        // Function to format date to "DD MONTH YEAR"
        function formatDate(dateString) {
            if (!dateString) {
                return ""; // If date string is empty, return empty string
            }
            var date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original string if unable to parse as date
            }
            var day = ("0" + date.getDate()).slice(-2);
            var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()];
            var year = date.getFullYear();
            return day + ' ' + month + ' ' + year;
        }
     
        aData.forEach(function (row) {
            // Format the date field before appending
            csvContent += selectedColumns.map(key => {
                // Check if the key is for date field, if yes then format it
                return key === "LastUpdateddate" ? formatDate(row[key]) : row[key];
            }).join(",") + "\n";
        });
     
        var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
     
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "SkillPortalReport.csv");
        document.body.appendChild(link);
     
        link.click();
     
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    });
  }
);
