
sap.ui.define([], function () {
    "use strict";
    return {
        getDays: function (sDate)
        {
            var days = "";

            if (sDate) {
                var todayData = new Date();
                var time_difference = todayData.getTime() - sDate.getTime();  
                days = time_difference / (1000 * 60 * 60 * 24);  

                return parseInt(days, 10) + " Days Before";
            } else {
                return "Not updated";
            }
            
        },

        getStatusOnSkillUpdate: function (sDate)
        {
            var days = "";

            if (sDate) {
                return "Success";
            } else {
                return "Error";
            }
            
        },

        handleVisiblePhoto: function (sVal) {
            if (sVal !== "") {
                return true;
            } else {
                return false;
            }
        },

        getDestinationDesc: function (sName, sLoc) {
            return sName + " (" + sLoc + ")";
        },

        getFormattedDate: function (sDate) {
            var aMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

            return aMonths[sDate.getMonth()] + " " + sDate.getDate() + ", " + sDate.getFullYear();
        },

        removeZeros: function (sVal) {
            var sNewVal = undefined;
            if (sVal) {
                sNewVal = parseInt(sVal, 10);
            } else {
                sNewVal = sVal;
            }

            return sNewVal;
        }
    };
});