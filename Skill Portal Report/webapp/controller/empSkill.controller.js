sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/util/File",
    "sap/m/MessageBox",
    "com/zskrep/zskillreport/model/formatters",
    "sap/m/MessageToast",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, File, MessageBox, formatters, MessageToast) {
    "use strict";

    return Controller.extend("com.zskrep.zskillreport.controller.empSkill", {
      formatter: formatters,
      onInit: function () {
        // this.onObjectMatched()
        var oView = this.getView();
        this.getView().setBusy(true);
        var oViewModel = new JSONModel();

        this.getView().setModel(oViewModel, "ViewModel");
        // this.getView().getModel("ViewModel").refresh(true);

        // Model used for certification
        var oCertificateModel = new JSONModel();
        this.getView().setModel(oCertificateModel, "CertificateModel");

        // Model used for Project Details
        var oProjectModel = new JSONModel();
        this.getView().setModel(oProjectModel, "ProjectModel");

        // Model used for Education Details
        var oEducationModel = new JSONModel();
        this.getView().setModel(oEducationModel, "EducationModel");

        // Model used for Education Details
        var oVisaModel = new JSONModel();
        this.getView().setModel(oVisaModel, "VisaModel");

        var oAttachmentModel = new JSONModel({
          Attachment: "",
          DocName: "",
        });
        this.getView().setModel(oAttachmentModel, "AttachmentModel");

        var oFormModel = new JSONModel();
        var oDataModel = new JSONModel();
        this.getView().setModel(oFormModel, "oFormModel");
        this.getView().setModel(oDataModel, "oDataModel");
        var visibleModel = new JSONModel({
          editable: false,
          btnEdit: true,
        });
        this.getView().setModel(visibleModel, "visibleModel");
        //this.countryNames();

        const allRegisteredControls = sap.ui.getCore().byFieldGroupId("");
        this.inputControls = allRegisteredControls.filter((c) => c.isA("sap.m.Input"));
        this.selectControls = allRegisteredControls.filter((c) => c.isA("sap.m.Select"));
        this.oModel = this.getOwnerComponent().getModel("ZPRO_RMG_PROJECT_MASTER_SRV");
        var oResumeModel = new sap.ui.model.json.JSONModel([
          { type: "Type1", fileName: "", typeName: "01", fileData: "" },
          { type: "Type2", fileName: "", typeName: "02", fileData: "" },
          { type: "Type3", fileName: "", typeName: "03", fileData: "" },
        ]);
        this.getView().setModel(oResumeModel, "ResumeModel");
        this.createYearModel();
        this.getAllDropdownDetails();
        this.getUserDetails();
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter.getRoute("EmployeeSkillPortal").attachPatternMatched(this.onObjectMatched, this);
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
        this.getView().setModel(oYearsModel, "yearsModel");
      },

      getAllDropdownDetails: function () {
        this.getDropdownValues("BASELOCATION", "BaseLocModel");
        this.getDropdownValues("CURRENT_LOCATION", "CurLocModel");
        this.getDropdownValues("DESIGNATION", "DesgModel");
        this.getDropdownValues("SECONDARY", "PrSkillModel");
        this.getDropdownValues("PRIMARY", "ScSkillModel");
        this.getDropdownValues("INDUSTRIES", "IndExpModel");
        this.getDropdownValues("RESUME", "ResumeTypeModel");
        this.getDropdownValues("COUNTRY", "CountryModel");
        this.getDropdownValues("LANGUAGE", "LanguageModel");
      },

      getDropdownValues: function (sDomValue, sModelName) {
        this.getView().setBusy(true);
        var oBaseLocModel = new JSONModel();
        this.getView().setModel(oBaseLocModel, sModelName);
        var filter = new sap.ui.model.Filter({
          path: "Domname",
          operator: "EQ",
          value1: sDomValue,
        });
        this.getOwnerComponent()
          .getModel("Skill_Portal")
          .read("/es_value_helps", {
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

      getSelectedDropDownObject: function (sValue, sModelName) {
        var oModel = this.getView().getModel(sModelName);
        var oData = oModel.getData();
        var oSelectedObj = { DomvalueL: "", Ddtext: "" };
        for (var i = 0; i < oData.length; i++) {
          if (oData[i].DomvalueL === sValue || oData[i].Ddtext === sValue) {
            return oData[i];
          }
        }

        return oSelectedObj;
      },
      onObjectMatched: function (oEvent) {
        var sProjectId = oEvent.getParameter("arguments").Id;
        console.log(sProjectId);
        this.getUserDetails(sProjectId);
        // return sProjectId;
      },
      getUserDetails: function (sProjectId) {
        this.getView().setBusy(true);
        var sUserId = sProjectId;
        console.log(sUserId);
        var filter = new sap.ui.model.Filter({
          path: "UserId",
          operator: "EQ",
          value1: sUserId,
        });
        this.getOwnerComponent()
          .getModel("Skill_Portal")
          .read("/et_employee_detailsSet", {
            filters: [filter],
            urlParameters: {
              $expand: "Certificationdet,projectexp,education,cvdetails,visa,sskill,industryexp",
            },
            success: function (oData) {
              // this.getView().getModel("ViewModel").refresh(true);
              var model = this.getView().getModel("ViewModel");
              var oSelectedObj = this.getSelectedDropDownObject(oData.results[0].BaseLocation, "BaseLocModel");
              oData.results[0].selectedBaseLocationKey = oSelectedObj.DomvalueL;
              var oSelectedPrimarySkill = this.getSelectedDropDownObject(oData.results[0].SubModule, "PrSkillModel");
              oData.results[0].PRimarySkillKey = oSelectedPrimarySkill.DomvalueL;
              // Set the education passing year
              if (oData.results[0].education.results.length > 0) {
                for (var i = 0; i < oData.results[0].education.results.length; i++) {
                  oData.results[0].education.results[i].DateOfPassing.setDate(oData.results[0].education.results[0].DateOfPassing.getDate() + 1);
                }
              }
              if(oData.results[0].RelevantExp.length === 1){
                oData.results[0].RelevantExp = "0" + oData.results[0].RelevantExp;
              } 
              if(oData.results[0].TotalExp.length === 1){
                oData.results[0].TotalExp = "0" + oData.results[0].TotalExp;
              } 
              model.setData(oData.results[0]);
              this.getView().setModel(model, "ViewModel");
              
              // Set Employee details mapping
              this.setEmployeeDetailsMapping(oData.results[0]);
              this.getView().setBusy(false);
            }.bind(this),
            error: function (oError) {
              this.getView().setBusy(false);
              console.log(oError);
            }.bind(this),
          });
      },

      setEmployeeDetailsMapping: function (oResData) {
        // Set Attachment model

        var oResumeModel = new sap.ui.model.json.JSONModel([
          { type: "Type1", fileName: "", typeName: "01", fileData: "" },
          { type: "Type2", fileName: "", typeName: "02", fileData: "" },
          { type: "Type3", fileName: "", typeName: "03", fileData: "" },
        ]);
        this.getView().setModel(oResumeModel, "ResumeModel");

        for (var i = 0; i < oResData.cvdetails.results.length; i++) {
          if (oResData.cvdetails.results[i].CvName.trim() !== "") {
            this.getView()
              .getModel("ResumeModel")
              .setProperty("/" + i + "/fileName", oResData.cvdetails.results[i].CvName);
            this.getView()
              .getModel("ResumeModel")
              .setProperty("/" + i + "/typeName", oResData.cvdetails.results[i].CvType);
            this.getView()
              .getModel("ResumeModel")
              .setProperty("/" + i + "/fileData", oResData.cvdetails.results[i].CvFile);
          }
        }

        //set Country name visa model
        this.getView().getModel("CertificateModel").setData(oResData.Certificationdet.results);
        this.getView().getModel("ProjectModel").setData(oResData.projectexp.results);
        // this.getView().getModel("EducationModel").setData(oResData.education.results);
        this.getView().getModel("VisaModel").setData(oResData.visa.results);

        //seting the Marks Scored

        var educationModel = this.getView().getModel("EducationModel");
        var results = oResData.education.results;
        results.forEach(function (result) {
          var marksScored = result.MarksScored;
          if (marksScored && marksScored.length > 1 && marksScored.charAt(0) === "0") {
            result.MarksScored = parseInt(marksScored, 10).toString();
          }
        });

        educationModel.setData(results);

        // Below code used for set the secondary skill values coming from backend
        var arrScnSkill = new Array();
        if (oResData.sskill.results.length > 0) {
          for (var i = 0; i < oResData.sskill.results.length; i++) {
            arrScnSkill.push(oResData.sskill.results[i].SecondaryskillId);
          }
        }
        this.getView().byId("idScskill").setSelectedKeys(arrScnSkill);
        // Below code used for setting the Industry Expertise values coming from the Backend
        var arrIndExpid = new Array();
        if (oResData.industryexp.results.length > 0) {
          for (var i = 0; i < oResData.industryexp.results.length; i++) {
            arrIndExpid.push(oResData.industryexp.results[i].IndustryExpertise);
          }
        }
        this.getView().byId("idIndExpid").setSelectedKeys(arrIndExpid);
        // Below code for set the selected language
        var newArrLan = new Array();
        if (oResData.LanguagesKnown.trim() !== "") {
          var arrSelectedLan = oResData.LanguagesKnown.split("/");
          for (var i = 0; i < arrSelectedLan.length - 1; i++) {
            newArrLan.push(arrSelectedLan[i]);
          }
        }
        this.getView().byId("idLanguages").setSelectedKeys(newArrLan);
      },

      onChangeSecndSkill: function (oEvent) {
        var oKeyIndex = oEvent.getSource().getSelectedItems();
        var arrKey = [];
        for (var i = 0; i < oKeyIndex.length; i++) {
          var newSecSkillObj = {
            SecondaryskillId: oKeyIndex[i].getKey(),
            DetailsType: "",
            SkillName: "",
            Pernr: "",
          };
          arrKey.push(newSecSkillObj);
        }
        this.getView().getModel("ViewModel").setProperty("/sskill/results", arrKey);
      },
      onChangeIndusExp: function (oEvent) {
        var oKeyIndex = oEvent.getSource().getSelectedItems();
        var arrKey = [];
        for (var i = 0; i < oKeyIndex.length; i++) {
          var newIndExpObj = {
            IndustryExpertise: oKeyIndex[i].getKey(),
            DetailsType: "",
            Pernr: "",
          };
          arrKey.push(newIndExpObj);
        }
        this.getView().getModel("ViewModel").setProperty("/industryexp/results", arrKey);
      },

      onChangeLanguages: function (oEvent) {
        var oKeyIndex = oEvent.getSource().getSelectedItems();
        //var arrKey = [];
        var sLanStr = "";
        for (var i = 0; i < oKeyIndex.length; i++) {
          sLanStr = sLanStr + oKeyIndex[i].getKey() + "/";
          //arrKey.push(oKeyIndex[i].getKey());
        }
        this.getView().getModel("ViewModel").setProperty("/LanguagesKnown", sLanStr);
      },

      onAddCertificate: function () {
        var oModel = this.getView().getModel("CertificateModel");
        var aTableData = oModel.getData();

        var oNewRow = {
          CertificateId: "",
          CertificateName: "",
          ValidDate: "",
          Score: "",
        };
        aTableData.push(oNewRow);
        oModel.setData(aTableData);
        // oModel.setData(aTableData);
        this.getView().setModel(oModel, "CertificateModel");
      },
      onRemoveCertificate: function (oEvent) {
        var oModel = this.getView().getModel("CertificateModel");
        var aTableData = oModel.getData();
        var sPath = oEvent.getSource().getBindingContext("CertificateModel").getPath();
        var iIndex = parseInt(sPath.split("/")[1]);
        aTableData.splice(iIndex, 1);
        // var nIndex = oEvent.getSource().getBindingContext("oViewModel").getPath().substr(1);
        // aTableData.splice(nIndex, 1);
        oModel.setData(aTableData);
        this.getView().setModel(oModel, "CertificateModel");
      },
      onAddRowProject: function () {
        var oModel = this.getView().getModel("ProjectModel");
        var aTableData = oModel.getData();

        var oNewRow = {
          CustomerName: "",
          Industry: "",
          Region: "",
          LegacySystem: "",
          Role: "",
          StartDate: "",
          EndDate: "",
        };
        aTableData.push(oNewRow);
        oModel.setData(aTableData);
        this.getView().setModel(oModel, "ProjectModel");
      },
      onRemoveRowProject: function (oEvent) {
        var oModel = this.getView().getModel("ProjectModel");
        var aTableData = oModel.getData();
        var sPath = oEvent.getSource().getBindingContext("ProjectModel").getPath();
        var iIndex = parseInt(sPath.split("/")[1]);
        aTableData.splice(iIndex, 1);
        // var nIndex = oEvent.getSource().getBindingContext("oViewModel").getPath().substr(1);
        // aTableData.splice(nIndex, 1);
        oModel.setData(aTableData);
        this.getView().setModel(oModel, "ProjectModel");
      },
      onAddRowEducation: function () {
        var oModel = this.getView().getModel("EducationModel");
        var aTableData = oModel.getData();
        var oNewRow = {
          seqnum: "",
          CourseName: "",
          MarksScored: "",
          DateOfPassing: "",
        };
        aTableData.push(oNewRow);
        oModel.setData(aTableData);
        this.getView().setModel(oModel, "EducationModel");
      },
      onRemoveRowEducation: function (oEvent) {
        var oModel = this.getView().getModel("EducationModel");
        var aTableData = oModel.getData();
        var sPath = oEvent.getSource().getBindingContext("EducationModel").getPath();
        var iIndex = parseInt(sPath.split("/")[1]);
        aTableData.splice(iIndex, 1);
        oModel.setData(aTableData);
        this.getView().setModel(oModel, "EducationModel");
      },
      onAddRowVisa: function () {
        var oModel = this.getView().getModel("VisaModel");
        var aTableData = oModel.getData();

        var oNewRow = {
          seqnum: "",
          VisaName: "",
          Country: "",
          VisaType: "",
          IssueDate: "",
          ValidTill: "",
        };
        aTableData.push(oNewRow);
        oModel.setData(aTableData);
        this.getView().setModel(oModel, "VisaModel");
      },
      onRemoveRowVisa: function (oEvent) {
        var oModel = this.getView().getModel("VisaModel");
        var aTableData = oModel.getData();
        var sPath = oEvent.getSource().getBindingContext("VisaModel").getPath();
        var iIndex = parseInt(sPath.split("/")[1]);
        aTableData.splice(iIndex, 1);
        oModel.setData(aTableData);
        this.getView().setModel(oModel, "VisaModel");
      },

      openFile: function (oEvent) {
        var oResumeModel = this.getView().getModel("ResumeModel");
        var sType = "Type" + (parseInt(oEvent.getSource().getId().slice(-1)) + 1);

        var aFiles = oResumeModel.getProperty("/Files");
        var oFileData = aFiles.find(function (file) {
          return file.Type === sType;
        });

        if (oFileData) {
          var sFileName = oFileData.FileName;
          // var fType = oFileData.FileType;
          var fType = oFileData.FileType;
          var fContent = oFileData.Base64Data;
          var fContent = atob(fContent);
          sap.ui.core.util.File.save(fContent, sFileName, "pdf", fType);
        }
      },

      validateAllFields: function () {
        var isValid = true;

        return isValid;
      },

      // validateSelectField: function(oEvent) {
      //     if (oEvent.getSource().getSelectedKey()) {
      //       oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
      //         return true;
      //     } else {
      //       oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
      //       oEvent.getSource().setValueStateText("Please select a value.");
      //         return false;
      //     }
      // },

      // validateDatePickerField: function(oEvent) {
      //     var dateValue = oEvent.getSource().getDateValue();
      //     if (dateValue && !isNaN(dateValue.getTime())) {
      //       oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
      //         return true;
      //     } else {
      //       oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
      //       oEvent.getSource().setValueStateText("Please enter a valid date.");
      //         return false;
      //     }
      // },

      onUploadChange: function (oEvent) {
        var oFileUploader = oEvent.getSource();
        this.sType = "Type" + oFileUploader.getId().slice(-1);
        this._import(oEvent.getParameter("files") && oEvent.getParameter("files")[0]);
      },
      _import: function (file) {
        if (file && window.FileReader) {
          var reader = new FileReader();
          var fileName = file.name;
          reader.onload = function (e) {
            const data = e.target.result;
            if (this.sType === "Type1") {
              this.getView().getModel("ResumeModel").setProperty("/0/fileName", fileName);
              this.getView().getModel("ResumeModel").setProperty("/0/fileData", btoa(data));
            } else if (this.sType === "Type2") {
              this.getView().getModel("ResumeModel").setProperty("/1/fileName", fileName);
              this.getView().getModel("ResumeModel").setProperty("/1/fileData", btoa(data));
            } else if (this.sType === "Type3") {
              this.getView().getModel("ResumeModel").setProperty("/2/fileName", fileName);
              this.getView().getModel("ResumeModel").setProperty("/2/fileData", btoa(data));
            }
          }.bind(this);
          reader.onerror = function (ex) {
            console.log(ex);
            this.getView().setBusy(false);
          };
          reader.readAsBinaryString(file);
        }
      },

      openFileType1: function () {
        var sFileName = this.getView().getModel("ResumeModel").getProperty("/0/fileName");
        var oFileType = this.getView().getModel("ResumeModel").getProperty("/0/typeName");
        this.getAttachmentData(oFileType, sFileName);
      },
      openFileType2: function () {
        var sFileName = this.getView().getModel("ResumeModel").getProperty("/1/fileName");
        var oFileType = this.getView().getModel("ResumeModel").getProperty("/1/typeName");
        this.getAttachmentData(oFileType, sFileName);
        //this.openFile(sFileName, oFileData);
      },
      openFileType3: function () {
        var sFileName = this.getView().getModel("ResumeModel").getProperty("/2/fileName");
        var oFileType = this.getView().getModel("ResumeModel").getProperty("/2/typeName");
        this.getAttachmentData(oFileType, sFileName);
      },

      getAttachmentData: function (type, fileName) {
        this.getView().setBusy(true);
        var arrFilter = new Array();
        var oUserfilter = new sap.ui.model.Filter({
          path: "Pernr",
          operator: "EQ",
          value1: this.getView().getModel("ViewModel").getProperty("/Pernr"),
        });
        arrFilter.push(oUserfilter);
        var oCvTypefilter = new sap.ui.model.Filter({
          path: "CvType",
          operator: "EQ",
          value1: type,
        });
        arrFilter.push(oCvTypefilter);
        var oCvNamefilter = new sap.ui.model.Filter({
          path: "CvName",
          operator: "EQ",
          value1: fileName,
        });
        arrFilter.push(oCvNamefilter);
        this.getOwnerComponent()
          .getModel("Skill_Portal")
          .read("/es_cvdetails", {
            filters: arrFilter,
            success: function (oData) {
              this.openFile(oData.results[0].CvName, oData.results[0].CvFile);
              this.getView().setBusy(false);
            }.bind(this),
            error: function (oError) {
              this.getView().setBusy(false);
              console.log(oError);
            }.bind(this),
          });
      },

      openFile: function (sFileName, oFileData) {
        var fContent = atob(oFileData);
        var byteNumbers = new Array(fContent.length);
        for (var i = 0; i < fContent.length; i++) {
          byteNumbers[i] = fContent.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        var type = sFileName.split(".")[sFileName.split(".").length - 1];
        if (type.toUpperCase() === "PDF") {
          var blob = new Blob([byteArray.buffer], { type: "application/pdf" });
          var url = URL.createObjectURL(blob);
          window.open(url);
        } else if (type.toUpperCase() === "JPG" || type.toUpperCase() === "JPEG") {
          var blob = new Blob([byteArray.buffer], { type: "image/jpg" });
          var url = URL.createObjectURL(blob);
          window.open(url);
        } else if (type.toUpperCase() === "PNG") {
          var blob = new Blob([byteArray.buffer], { type: "image/png" });
          var url = URL.createObjectURL(blob);
          window.open(url);
        } else {
          var blob = new Blob([byteArray.buffer]);
          if (blob) File.save(blob, sFileName.split(".")[0], type);
        }
      },

      onPhotoUploadChange: function (oEvent) {
        var oFileUploader = oEvent.getSource();
        this.sType = "Type" + oFileUploader.getId().slice(-1);
        this._importPhoto(oEvent.getParameter("files") && oEvent.getParameter("files")[0]);
      },
      _importPhoto: function (file) {
        if (file && window.FileReader) {
          var reader = new FileReader();
          var fileName = file.name;
          reader.onload = function (e) {
            const data = e.target.result;
            if (data.trim() !== "") {
              this.getView()
                .getModel("ViewModel")
                .setProperty("/Photo", "data:image/png;base64," + btoa(data));
            }
          }.bind(this);
          reader.onerror = function (ex) {
            console.log(ex);
            this.getView().setBusy(false);
          };
          reader.readAsBinaryString(file);
        }
      },

      openViewPhoto: function () {
        var oFileData = this.getView().getModel("ViewModel").getProperty("/Photo");
        if (oFileData) {
          var oFileData = oFileData.split(",")[1];
          //var sFileName = this.getView().getModel("ViewModel").getProperty("/Photo");
          var fContent = atob(oFileData);
          var byteNumbers = new Array(fContent.length);
          for (var i = 0; i < fContent.length; i++) {
            byteNumbers[i] = fContent.charCodeAt(i);
          }
          var byteArray = new Uint8Array(byteNumbers);

          var blob = new Blob([byteArray.buffer], { type: "image/jpg" });
          var url = URL.createObjectURL(blob);
          window.open(url);
        } else {
          MessageBox.error("No image uploaded.");
        }
      },

      onSubmit: function () {
        this.getView().setBusy(true);
        //var formData =  this.getView().getModel("ViewModel").getData();
        // if(!this.basicFormValidation(formData)){
        //   return;
        // }

        // var error = this.getErrorMsg();
        // var ermsg = error.length;
        // if(ermsg >0){
        //   sap.m.MessageBox.error(error[0]);
        //   return;
        // }

        // var isValid = this.validateAllFields();
        // if (isValid) {
        //   MessageToast.show("Certificate submitted successfully")

        // }

        var arrErrorMsg = this.getValidateMsg();
        if (arrErrorMsg.length > 0) {
          sap.m.MessageBox.error(arrErrorMsg[0]);
          this.getView().setBusy(false);
          return;
        }

        //this.getView().setBusy(false);
        this.callSave();
      },

      getValidateMsg: function () {
        var arrMsg = [];
        var oViewModelData = this.getView().getModel("ViewModel").getData();
        // Basic details validation
        if (oViewModelData.CurrentLocation.trim() === "" || oViewModelData.CurrentLocation === undefined) {
          arrMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("currentLocationError"));
        }
        if (oViewModelData.MainModule.trim() === "" || oViewModelData.MainModule === undefined) {
          arrMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("primarySkillError"));
        }
        // Secondary field validation
        var oSSkillData = this.getView().getModel("ViewModel").getProperty("/sskill/results");
        if (oSSkillData.length === 0) {
          arrMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("secondarySkillError"));
        }

        if (oViewModelData.TotalExp.trim() === "" || oViewModelData.TotalExp === undefined) {
          arrMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("totalExpError"));
        }
        if (oViewModelData.RelevantExp.trim() === "" || oViewModelData.RelevantExp === undefined) {
          arrMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("sapExpError"));
        }
        if (
          oViewModelData.IndustryExpertise.trim() === "" ||
          oViewModelData.IndustryExpertise === undefined ||
          oViewModelData.IndustryExpertise.trim() === "00"
        ) {
          arrMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("indusExpError"));
        }
        // Validation for Certificatio Details
        var arrCertMsg = this.certificationValidate();
        if (arrCertMsg.length > 0) {
          arrMsg.push(arrCertMsg[0]);
        }
        // Validation for Project experiance details
        var arrProjMsg = this.projectValidate(oViewModelData.TotalExp);
        if (arrProjMsg.length > 0) {
          arrMsg.push(arrProjMsg[0]);
        }
        // Validation for Education details
        var arrEduMsg = this.educationValidate();
        if (arrEduMsg.length > 0) {
          arrMsg.push(arrEduMsg[0]);
        }
        // Validation for Visa details
        var arrVisaMsg = this.visaValidate();
        if (arrVisaMsg.length > 0) {
          arrMsg.push(arrVisaMsg[0]);
        }
        // Validation for attachment details
        var arrAttachMsg = this.attachmentValidate();
        if (arrAttachMsg.length > 0) {
          arrMsg.push(arrAttachMsg[0]);
        }

        if (oViewModelData.Photo.trim() === "" || oViewModelData.Photo === undefined) {
          arrMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("photoError"));
        }
        if (oViewModelData.LanguagesKnown.trim() === "" || oViewModelData.LanguagesKnown === undefined) {
          arrMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("languageSelError"));
        }

        return arrMsg;
      },

      // Certification validation method
      certificationValidate: function () {
        var arrCertMsg = [];
        var oCertData = this.getView().getModel("CertificateModel").getData();
        if (oCertData.length > 0) {
          for (var i = 0; i < oCertData.length; i++) {
            if (oCertData[i].CertificateId.trim() === "" || oCertData[i].CertificateId === undefined) {
              arrCertMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("certIdError"));
            }
            if (oCertData[i].CertificateName.trim() === "" || oCertData[i].CertificateName === undefined) {
              arrCertMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("certNameError"));
            }
            if (oCertData[i].ValidDate === "" || oCertData[i].ValidDate === undefined) {
              arrCertMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("certDateError"));
            }
            if (oCertData[i].Score.trim() === "" || oCertData[i].Score === undefined) {
              arrCertMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("certScoreError"));
            } else if (parseInt(oCertData[i].Score) > 100) {
              arrCertMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("certScoreValueError"));
            }
          }
        }

        return arrCertMsg;
      },

      // Project validation method
      projectValidate: function (sTotalExp) {
        var arrProjMsg = [];
        var arrProjData = this.getView().getModel("ProjectModel").getData();
        if (arrProjData.length > 0) {
          for (var i = 0; i < arrProjData.length; i++) {
            if (arrProjData[i].CustomerName.trim() === "" || arrProjData[i].CustomerName === undefined) {
              arrProjMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("projCustNameError"));
            }
            if (arrProjData[i].Industry.trim() === "" || arrProjData[i].Industry === undefined) {
              arrProjMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("projIndusError"));
            }
            if (arrProjData[i].Region.trim() === "" || arrProjData[i].Region === undefined) {
              arrProjMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("projRegionError"));
            }
            if (arrProjData[i].LegacySystem.trim() === "" || arrProjData[i].LegacySystem === undefined) {
              arrProjMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("projTypeError"));
            }
            if (arrProjData[i].Role.trim() === "" || arrProjData[i].Role === undefined) {
              arrProjMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("projRoleError"));
            }
            if (arrProjData[i].StartDate === "" || arrProjData[i].StartDate === undefined) {
              arrProjMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("projstrtDate"));
            }
            if (arrProjData[i].EndDate === "" || arrProjData[i].EndDate === undefined) {
              arrProjMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("projEndDate"));
            }
          }
        } else {
          if (sTotalExp !== "00") {
            arrProjMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("projExpError"));
          }
        }

        return arrProjMsg;
      },

      // Education validation method
      educationValidate: function () {
        var arrEduMsg = [];
        var arrEduData = this.getView().getModel("EducationModel").getData();
        if (arrEduData.length > 0) {
          for (var i = 0; i < arrEduData.length; i++) {
            if (arrEduData[i].CourseName.trim() === "" || arrEduData[i].CourseName === undefined) {
              arrEduMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("eduCourseNameError"));
            }
            if (arrEduData[i].MarksScored.trim() === "" || arrEduData[i].MarksScored === undefined) {
              arrEduMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("eduScoreError"));
            } else if (parseInt(arrEduData[i].MarksScored) > 100) {
              arrEduMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("eduScoreValError"));
            }
            if (arrEduData[i].DateOfPassing === "" || arrEduData[i].DateOfPassing === undefined) {
              arrEduMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("eduYearPass"));
            }
          }
        } else {
          if (arrEduData.length === 0) {
            arrEduMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("eduDetailEror"));
          }
        }

        return arrEduMsg;
      },

      // Visa validation method
      visaValidate: function () {
        var arrVisaMsg = [];
        var oVisaData = this.getView().getModel("VisaModel").getData();
        if (oVisaData.length > 0) {
          for (var i = 0; i < oVisaData.length; i++) {
            if (oVisaData[i].VisaName.trim() === "" || oVisaData[i].VisaName === undefined) {
              arrVisaMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("visaNameError"));
            }
            if (oVisaData[i].Country.trim() === "" || oVisaData[i].Country === undefined) {
              arrVisaMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("visaCountryError"));
            }
            if (oVisaData[i].VisaType.trim() === "" || oVisaData[i].VisaType === undefined) {
              arrVisaMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("visaTypeError"));
            }
            if (oVisaData[i].IssueDate === "" || oVisaData[i].IssueDate === undefined) {
              arrVisaMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("visaFromDate"));
            }
            if (oVisaData[i].ValidTill === "" || oVisaData[i].ValidTill === undefined) {
              arrVisaMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("visaToDate"));
            }
          }
        }

        return arrVisaMsg;
      },

      // attachment validation method
      attachmentValidate: function () {
        var arrAttachmentMsg = [];
        var oAttachmentData = this.getView().getModel("ResumeModel").getData();
        if (oAttachmentData.length > 0) {
          // for (var i = 0; i < oAttachmentData.length; i++) {
          //   if (oAttachmentData[i].typeName.trim() === "" || oAttachmentData[i].typeName === undefined) {
          //     arrAttachmentMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("cvtypeError") + parseInt(i + 1) + " resume.");
          //   }
          if (oAttachmentData[0].fileName.trim() === "" || oAttachmentData[0].fileName === undefined) {
            arrAttachmentMsg.push(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("cvtFileError"));
          }

          //}
        }

        return arrAttachmentMsg;
      },

      onChangeCountry: function (oEvent) {
        var oSelectedItem = oEvent.getSource().getSelectedKey();
        var sPath = oEvent.getSource().getBindingContext("VisaModel").getPath();
        var iIndex = parseInt(sPath.split("/")[1]);
        this.getView()
          .getModel("VisaModel")
          .setProperty("/" + iIndex + "/Country", oSelectedItem);
      },

      callSave: function () {
        var oViewModelData = this.getView().getModel("ViewModel").getData();
        var oCertificationModelData = this.getView().getModel("CertificateModel").getData();
        var oEducationalModelData = this.getView().getModel("EducationModel").getData();
        var oProjectModelData = this.getView().getModel("ProjectModel").getData();
        var oVisaModelData = this.getView().getModel("VisaModel").getData();
        var oResumeModelData = this.getView().getModel("ResumeModel").getData();
        var oSSkillData = this.getView().getModel("ViewModel").getProperty("/sskill/results");
        var oIndExpData = this.getView().getModel("ViewModel").getProperty("/industryexp/results");

        var arrCertiData = [],
          arrProjectData = [],
          arrEducData = [],
          arrVisaData = [],
          arrResData = [],
          arrSSkill = [],
          arrIndExp = [];

        //this.getView().getModel("ViewModel").setProperty("/sskill", arrKey);

        for (var i = 0; i < oCertificationModelData.length; i++) {
          var oCertObject = {
            Pernr: oViewModelData.Pernr,
            //"DetailsType" : "00",
            CertificateId: oCertificationModelData[i].CertificateId,
            CertificateName: oCertificationModelData[i].CertificateName,
            Industry: "",
            ValidDate: oCertificationModelData[i].ValidDate,
            Score: oCertificationModelData[i].Score,
          };
          arrCertiData.push(oCertObject);
        }

        for (var i = 0; i < oEducationalModelData.length; i++) {
          var oEduObject = {
            Pernr: oViewModelData.Pernr,
            //"DetailsType" : "00",
            //"DetailsId" : oEducationalModelData[i].DetailsId,
            CourseName: oEducationalModelData[i].CourseName,
            Board: "",
            MarksScored: oEducationalModelData[i].MarksScored,
            DateOfPassing: oEducationalModelData[i].DateOfPassing,
          };
          arrEducData.push(oEduObject);
        }

        for (var i = 0; i < oResumeModelData.length; i++) {
          if (oResumeModelData[i].fileName !== "") {
            var oResObject = {
              Pernr: oViewModelData.Pernr,
              DetailsType: "00",
              DetailsId: "",
              CvName: oResumeModelData[i].fileName,
              CvType: oResumeModelData[i].typeName,
              CvFile: oResumeModelData[i].fileData,
            };
            arrResData.push(oResObject);
          }
        }

        for (var i = 0; i < oProjectModelData.length; i++) {
          var oProjObject = {
            Pernr: oViewModelData.Pernr,
            //"DetailsType" : "00",
            //"DetailsId" : oProjectModelData[i].DetailsId,
            CustomerName: oProjectModelData[i].CustomerName,
            LegacySystem: "01", // need to check
            Industry: oProjectModelData[i].Industry,
            Country: "",
            Region: oProjectModelData[i].Region,
            Role: oProjectModelData[i].Role,
            StartDate: oProjectModelData[i].StartDate,
            EndDate: oProjectModelData[i].EndDate,
          };
          arrProjectData.push(oProjObject);
        }

        for (var i = 0; i < oVisaModelData.length; i++) {
          var oVisaObject = {
            Pernr: oViewModelData.Pernr,
            //"DetailsType" : "00",
            //"DetailsId" : oVisaModelData[i].DetailsId,
            VisaName: oVisaModelData[i].VisaName,
            Country: oVisaModelData[i].Country,
            IssueDate: oVisaModelData[i].IssueDate,
            ValidTill: oVisaModelData[i].ValidTill,
            VisaType: oVisaModelData[i].VisaType,
            AuthorizedToWork: "",
          };
          arrVisaData.push(oVisaObject);
        }

        for (var i = 0; i < oSSkillData.length; i++) {
          var oSSkillObj = {
            Pernr: oViewModelData.Pernr,
            SecondaryskillId: oSSkillData[i].SecondaryskillId,
            DetailsType: oSSkillData[i].DetailsType,
          };
          arrSSkill.push(oSSkillObj);
        }

        for (var i = 0; i < oIndExpData.length; i++) {
          var oIndExpObj = {
            Pernr: oViewModelData.Pernr,
            IndustryExpertise: oIndExpData[i].IndustryExpertise,
            DetailsType: oIndExpData[i].DetailsType,
          };
          arrIndExp.push(oIndExpObj);
        }

        var oEntryData = {
          Pernr: oViewModelData.Pernr,
          Doj: oViewModelData.Doj,
          MainModule: oViewModelData.MainModule,
          SubModule: oViewModelData.SubModule,
          Designation: oViewModelData.Designation,
          BaseLocation: oViewModelData.BaseLocation,
          CurrentLocation: oViewModelData.CurrentLocation,
          TotalExp: oViewModelData.TotalExp,
          RelevantExp: oViewModelData.RelevantExp,
          PassportNumb: oViewModelData.PassportNumb,
          PassportValidfrom: oViewModelData.PassportValidfrom,
          PassportValidto: oViewModelData.PassportValidto,
          // "IndustryExpertise": oViewModelData.IndustryExpertise,
          LanguagesKnown: oViewModelData.LanguagesKnown,
          Photo: oViewModelData.Photo,
          LastUpdateddate: new Date(),
          Certificationdet: {
            results: arrCertiData,
          },
          education: {
            results: arrEducData,
          },
          cvdetails: {
            results: arrResData, //oResData
          },
          projectexp: {
            results: arrProjectData,
          },
          visa: {
            results: arrVisaData,
          },
          sskill: {
            results: arrSSkill,
          },
        };
        //return;
        this.getView()
          .getModel()
          .create("/et_employee_detailsSet", oEntryData, {
            success: function (data, response) {
              this.getView().setBusy(false);
              MessageToast.show("Employee details updated succefully.");
              //onCancel
              this.onCancel();
            }.bind(this),
            error: function (error) {
              this.getView().setBusy(false);
              MessageBox.error(error.responseText);
            }.bind(this),
          });
      },

      onEdit: function () {
        // var oVisibleModel =
        this.getView().getModel("visibleModel").setProperty("/editable", true);
        this.getView().getModel("visibleModel").setProperty("/btnEdit", false);
      },
      onCancel: function () {
        this.getUserDetails();
        this.getView().getModel("visibleModel").setProperty("/editable", false);
        this.getView().getModel("visibleModel").setProperty("/btnEdit", true);
      },
      onBack: function () {},
    });
  }
);
