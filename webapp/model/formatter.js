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
		}
	};
});