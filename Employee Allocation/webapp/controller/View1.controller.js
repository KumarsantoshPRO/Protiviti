sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "in/protiviti/employeeallocation/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",

  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, formatter, Filter, FilterOperator, Fragment) {
    let custName = [];
    ("use strict");
    return Controller.extend("in.protiviti.employeeallocation.controller.View1", {
      formatter: formatter,
      onInit: function () {
        var ofilterDataModel = new JSONModel({
          customerName: "",
          ProjectName: "",
          ProjectStatus: "",
          AllocationStatus: ""
        });
        this.getView().setModel(ofilterDataModel, "FilterDataModel");

        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter.getRoute("RouteView1").attachPatternMatched(this.onObjectMatched, this);
        var oFormModel = new JSONModel({
          cusCode: "",
        });
        this.getView().setModel(oFormModel, "oFormModel");

        this.getCustomerDetails();
        this.getProjectNamelist();
        this.onSerachFilter();

        this.oModel = this.getOwnerComponent().getModel();

        var oProjectAllocModel = new JSONModel();
        this.getView().setModel(oProjectAllocModel, "oProjectAllocModel");

        var filter2 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "ZPROJECT_LOCATION",
        });

        this.oModel.read("/es_value_helps", {
          filters: [filter2],
          success: function (oData) {
            oProjectAllocModel.setData(oData.results);
            //this.handleProjectLocationFormatting();
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          },
        });

        var oProjectTypeModel = new JSONModel();
        this.getView().setModel(oProjectTypeModel, "oProjectTypeModel");

        var filter3 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "ZALLOCATION_STATUS",
        });

        var ostatusModel = new JSONModel();
        this.getView().setModel(ostatusModel, "ostatusModel");

        this.oModel.read("/es_value_helps", {
          filters: [filter3],
          success: function (oData) {
            ostatusModel.setData(oData.results);
            // this.handleProjectTypeFormatting();
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          },
        });

        var oEmployeeModel = new JSONModel([]);
        this.getView().setModel(oEmployeeModel, "oEmployeeModel");

        var FilterModel = new JSONModel({
          selectedValue: "",
          selectedProjName: "",
        });
        this.getView().setModel(FilterModel, "oFilterModel");
        var oModel = this.getView().getModel("oDataModel");
        this.getView().setModel(oModel);
        var ValueHelpModel = new JSONModel();
        this.getView().setModel(ValueHelpModel, "oValueHelpModel");
      },
      // for Table DropDown
      onSerachFilter: function () {
        this.getTableData();
      },
      onReset: function(){
        var ofilterDataModel = new JSONModel({
          customerName: "",
          ProjectName: "",
          ProjectStatus: "",
          AllocationStatus: ""
        });
        this.getView().setModel(ofilterDataModel, "FilterDataModel");
        this.getTableData();
      },
      _onObjectMatched: function (oEvent) {
        var sId = oEvent.getParameter("arguments").Id;
        var sSelectedData = oEvent.getParameter("arguments").SelectedData;
        var oSelectedData = JSON.parse(sSelectedData);
        console.log("Selected Data:", oSelectedData);
      },
      onCustomerFilterSelection: function (oEvent) {
        // var oComboBox = oEvent.getSource();
        // var aSelectedItems =  oComboBox.getselectedItem;
        // if(!aSelectedItems || aSelectedItems.length === 0){
        //     custName = [];
        // } else{
        //     custName = aSelectedItems.map(function (oSelectedItem){
        //         return oSelectedItem.getText();
        //     });
        //     console.log("Updated Custname", custName);
        //     setTimeout(function (){
        //         this.applyFilters();
        //     }.bind(this), 0);
        // }
        var sKey = this.getView().getModel("oDataModel").getProperty("/CustomerCode");
        var oTable = this.getView().byId("idEmployeeAllocation");
        var oBinding = oTable.getBinding("items");

        if (sKey) {
          var oFilter = new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.EQ, sKey);
          oBinding.filter([oFilter]);
        } else {
          oBinding.filter([]);
        }
      },
      applyFilters: function () {
        var aFilters = [];
        var oTable = this.getView().by("idEmployeeAllocation");
        var oTableBiding = oTable.getBinding("rows");
        var oDataModel = this.getView().getModel("oDataModel");

        if (oTableBiding && oDataModel && oDataModel.getData()) {
          custName.forEach(function (sCustName) {
            aFilters.push(new sap.ui.model.Filter("CustomerName", sap.ui.FIlterOpertator.EQ, sCustName));
          });

          var oCombinedFilter = new sap.ui.model.Filter(aFilters, false);
          oTableBiding.filter(oCombinedFilter);
        }
      },
      handleProjectLocationFormatting: function () {
        var oProjectAllocModel = this.getView().getModel("oProjectAllocModel");
        var aProjectLocations = oProjectAllocModel ? oProjectAllocModel.getData() : [];
        var oTable = this.getView().byId("idEmployeeAllocation");
        var oItems = oTable.getItems();

        oItems.forEach(function (oItem) {
          var oBindingContext = oItem.getBindingContext("oDataModel");
          var sProjectLocationCode = oBindingContext.getProperty("ProjectLocation");
          var oProjectLocation = aProjectLocations.find(function (item) {
            return item.DomvalueL === sProjectLocationCode;
          });
          var sFormattedText = oProjectLocation ? oProjectLocation.Ddtext : sProjectLocationCode;
          oItem.getCells()[4].setText(sFormattedText);
        });
      },

      handleProjectTypeFormatting: function () {
        var oProjectTypeModel = this.getView().getModel("oProjectTypeModel");
        var aProjectTypes = oProjectTypeModel ? oProjectTypeModel.getData() : [];
        var oTable = this.getView().byId("idEmployeeAllocation");
        var oItems = oTable.getItems();

        oItems.forEach(function (oItem) {
          var oBindingContext = oItem.getBindingContext("oDataModel");
          var sProjectTypeCode = oBindingContext.getProperty("ProjectType");
          var oProjectType = aProjectTypes.find(function (item) {
            return item.DomvalueL === sProjectTypeCode;
          });
          var sFormattedText = oProjectType ? oProjectType.Ddtext : sProjectTypeCode;
          oItem.getCells()[5].setText(sFormattedText);
        });
      },

      onClickofItem: function (oEvent) {
        this.oRouter1 = this.getOwnerComponent().getRouter();
        this.oRouter1.navTo("Detail", {
          Id: oEvent.getSource().getCells()[0].getText(),
        });
      },

      getCustomerDetails: function () {
        var oCustModel = new JSONModel();
        this.oModel = this.getOwnerComponent().getModel();
        this.oModel.read("/es_customer_master", {
          success: function (oData) {
            oCustModel.setData(oData.results);
            this.getView().setModel(oCustModel, "CustModel");
            // console.log(oFormModel);\
            const arr = oData.results;
            // console.log(arr);
          }.bind(this),
          error: function (oError) {
            console.error("Error reading es_customer_master:", oError);
          },
        });
      },
      getProjectNamelist: function () {
        var oProjName = new JSONModel();
        this.getView().setModel(oProjName, "oProjectNameModel");
        this.oModel = this.getOwnerComponent().getModel();
        var filter2 = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: "PROJECT_NAME",
        });

        this.oModel.read("/es_value_helps", {
          filters: [filter2],
          success: function (oData) {
            this.getView().getModel("oProjectNameModel").setData(oData.results);
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          },
        });
      },
      getTableData: function () {
        this.getView().setBusy(true);
        var newArrayFilter = new Array();
        // Customer Name
        var cusNameFilter = new sap.ui.model.Filter({
          path: "CustomerCode",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/customerName"),
          // value1: "26"
        });
        newArrayFilter.push(cusNameFilter);

        //Project Name
        var ProjNameFilter = new sap.ui.model.Filter({
          path: "ProjectCode",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/ProjectName"),
          // value1: "2054502024"
        });
        newArrayFilter.push(ProjNameFilter);
        // Project status
        var ProjStatusFilter = new sap.ui.model.Filter({
          path: "ProjectStatus",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/ProjectStatus"),
          // value1: "2054502024"
        });
        newArrayFilter.push(ProjStatusFilter);
        // Allocation status
        var allocStatusFilter = new sap.ui.model.Filter({
          path: "AllocationStatus",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: this.getView().getModel("FilterDataModel").getProperty("/AllocationStatus"),
          // value1: "2054502024"
        });
        newArrayFilter.push(allocStatusFilter);
        // User id
        var sUserId = sap.ushell.Container.getUser().getId();
        // var sUserId = "amol.k"
        var UseridFilter = new sap.ui.model.Filter({
          path: "UserId",
          operator: sap.ui.model.FilterOperator.EQ,
          value1: sUserId
        });
        newArrayFilter.push(UseridFilter);

        var oDataModel = new JSONModel();
        this.getView().setModel(oDataModel, "oDataModel");
        this.oModel = this.getOwnerComponent().getModel();
        this.oModel.read("/es_project_new", {
          filters: newArrayFilter,
          success: function (oData) {
            oDataModel.setData(oData.results.reverse());
            this.getView().setModel(oDataModel, "oDataModel");
            this.getView().getModel("oDataModel").refresh();
            // console.log(oDataModel);
            this.getView().setBusy(false);
          }.bind(this),
          error: function (oError) {
            console.error("Error in raeding entry", oError);
            this.getView().setBusy(false);
          },
        });
      },
    //   handleSearchResource: function(oEvent){
    //     var newArrayFilter = new Array();
    //     // Emp Id
    //     var empNameFilter = new sap.ui.model.Filter({
    //       path: "CustomerCode",
    //       operator: sap.ui.model.FilterOperator.EQ,
    //     //   value1: this.getView().getModel("FilterDataModel").getProperty("/customerName"),
    //       value1: "00095544"
    //     });
    //     newArrayFilter.push(empNameFilter);

    //   }
    });
  }
);
