sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"

], function(Controller, JSONModel) {
	"use strict";

	var buildPageContent = function(sId, oContext) {
		var oContent = null;

		var sText = oContext.getProperty("title");
		var sJira = oContext.getProperty("jira");
		var sJiraHref = "https://jira.zv.de/browse/" + sJira;
		var sDescription = oContext.getProperty("description");
		var iStorypoints = oContext.getProperty("storypoints");
		
		oContent = new sap.m.ObjectHeader({
			title: sText,
			intro: sJira,
			introActive: true,
			introHref: sJiraHref,
			introTarget: "_blank",
			number: iStorypoints,
			numberUnit: "SP",
			//showTitleSelector: true,
			responsive: true,
			//fullScreenOptimized: true,
			//backgroundDesign: "Translucent",
			//firstStatus: new sap.m.ObjectStatus({ text: "Open", state: sap.ui.core.ValueState.Error })
			
			statuses: [
				new sap.m.ObjectStatus({
					text: "Open",
					state: sap.ui.core.ValueState.Error
				})
			]
			/*
			attributes: [
				new sap.m.ObjectAttribute({
					text: sDescription
				})
			]
			*/
		});

		var aTasks = oContext.getProperty("tasks");
		var aTiles = new Array();
		
		aTasks.forEach(function(element, index, array){
			var oTile = new sap.suite.ui.commons.GenericTile({
				header : element.title,
				//subheader : "Task description with a bit more text than in header",
				frameType: sap.suite.ui.commons.FrameType.OnebyOne,
				size: "S",
				tileContent: [
					new sap.suite.ui.commons.TileContent({
						//footer : "hours",
						//unit : "h",
						//size: "S",
						content: [
							new sap.suite.ui.commons.NumericContent({
								value: element.hours,
								scale: "h",
								size: "S"
								//valueColor: sap.suite.ui.commons.InfoTileValueColor.Good,
								//indicator: "Down"
							})
						]
					})
				],
				press: function(oControlEvent){
					alert("PRESSED: " + oControlEvent.getSource());
				}
			});
			aTiles.push(oTile);
		});

		var itb1 = new sap.m.IconTabBar({
			//selectedKey: "key3",
			upperCase: true,
			items: [
				new sap.m.IconTabFilter({
					icon: "sap-icon://task",
					iconColor: sap.ui.core.IconColor.Default,
					//key: "key1",
					content: aTiles
				}),
				new sap.m.IconTabFilter({
					icon: "sap-icon://hint",
					iconColor: sap.ui.core.IconColor.Default,
					//key: "key1",
					content: [
						new sap.m.Text({
							text: sDescription
						})
					]
				})
			]
		});
		
		oContent.setHeaderContainer(itb1);
		
		/*
		oContent = new sap.m.Button({
			//text: { path: "sprints>number" }
			text: sText
		});
		*/
		return oContent;
	};

	return Controller.extend("zv.scrum.board.controller.SprintStories", {
		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData("./_data/SprintSet.json");
			this.getView().setModel(oModel, "sprints");

			var oPage = this.getView().byId("pageSprintStories");
			//oPage.bindElement("sprints>/sprints/0");
			oPage.bindAggregation("content", "sprints>/sprints/0/stories", buildPageContent);
		}
	});

});