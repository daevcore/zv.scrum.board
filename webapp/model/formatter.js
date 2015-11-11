sap.ui.define([], function () {
	"use strict";

	return {
		storyProgressIcon: function (oData) {
			var sIcon = "";
			if(oData === "01"){
				sIcon = "sap-icon://status-inactive";
			}else if(oData === "02"){
				sIcon = "sap-icon://status-in-process";
			}else if(oData === "03"){
				sIcon = "sap-icon://status-completed";
			}
			return sIcon;
		},
		
		storyProgressColor: function (oData) {
			var sColor = "#666666";
			if(oData === "01"){
				sColor = "#cc1919";
			}else if(oData === "02"){
				sColor = "#d14900";
			}else if(oData === "03"){
				sColor = "#007833";
			}
			return sColor;
		},
		
		activityDateTime: function (oData) {
			var dDateTime = new Date(Date.UTC(oData.slice(0, 4), oData.slice(4, 6) - 1, oData.slice(6, 8), oData.slice(8, 10), oData.slice(10, 12), oData.slice(12, 14)));
			//dDateTime.setTime(dDateTime.getTime() + dDateTime.getTimezoneOffset()*60*1000);
			return dDateTime;
		}
	};
});