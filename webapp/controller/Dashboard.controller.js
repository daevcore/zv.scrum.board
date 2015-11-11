sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"zv/scrum/board/model/formatter",
	"sap/m/MessageBox",
	"sap/ui/table/Table"

], function(Controller, formatter, MessageBox, Table) {
	"use strict";

	return Controller.extend("zv.scrum.board.controller.Dashboard", {
		formatter: formatter,
		
		// --------------------------------------------------
		// INITIALIZATION
		// --------------------------------------------------
		onInit: function() {
			this._initDashboardModel();
			this._initDashboardChartBurndown();
			
			this._loadDashboardModelData();
			this._test();
		},
		
		// --------------------------------------------------
		// ACTIONS in view
		// --------------------------------------------------
		onPressReload: function() {
			this._loadDashboardModelData();
		},
		
		onPressStoryboard: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("storyboard", {});
		},

		onPressChartboard: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartboard", {});
		},
		
		onPressSettings: function(oEvent) {
			var oButton = oEvent.getSource();

			if (!this._menuSettings) {
				this._menuSettings = sap.ui.xmlfragment("zv.scrum.board.view.dashboard.MenuSettings", this);
				this.getView().addDependent(this._menuSettings);
			}
			
			this._menuSettings.open(false, oButton, "end top", "end bottom", oButton);
		},
		
		// --------------------------------------------------
		// SPRINT EDIT
		// --------------------------------------------------
		onPressSprintEdit: function(oEvent) {
			this._oDialogSprintEdit = sap.ui.xmlfragment("zv.scrum.board.view.dashboard.DialogSprintEdit", this);
			
			var oSprintModel = new sap.ui.model.json.JSONModel();
			oSprintModel.setProperty("/SprintId", this.getView().getModel("DashboardData").getProperty("/SprintId"));
			oSprintModel.setProperty("/SprintNr", this.getView().getModel("DashboardData").getProperty("/SprintNr"));
			oSprintModel.setProperty("/SprintStart", this.getView().getModel("DashboardData").getProperty("/SprintStart"));
			oSprintModel.setProperty("/SprintEnd", this.getView().getModel("DashboardData").getProperty("/SprintEnd"));
			
			this._oDialogSprintEdit.setModel(oSprintModel, "SprintData");
			this._oDialogSprintEdit.open();
		},
		onPressSprintEditSave: function(oEvent) {
			var oSprintModel = this._oDialogSprintEdit.getModel("SprintData");

			var dSprintStart = new Date(oSprintModel.getProperty("/SprintStart"));
			dSprintStart.setUTCDate(dSprintStart.getDate());
			var dSprintEnd = new Date(oSprintModel.getProperty("/SprintEnd"));
			dSprintEnd.setUTCDate(dSprintEnd.getDate());
			
			this.getOwnerComponent().getModel("oDataService").update(
				"/SprintSet('" + oSprintModel.getProperty("/SprintId") + "')",
				{
					"SprintNr": oSprintModel.getProperty("/SprintNr"),
					"SprintStart": dSprintStart,
					"SprintEnd": dSprintEnd
				},
				{
					"async": false,
					"success": function() {
						this._oDialogSprintEdit.close();
						this._loadDashboardModelData();
					}.bind(this),
					"error": function(oError) {
						console.log(oError);
					}
				}
			);
		},
		onPressSprintEditCancel: function(oEvent) {
			this._oDialogSprintEdit.close();
		},

		// --------------------------------------------------
		// SPRINT CREATE
		// --------------------------------------------------
		onPressSprintCreate: function(oEvent) {
			this._oDialogSprintCreate = sap.ui.xmlfragment("zv.scrum.board.view.dashboard.DialogSprintCreate", this);
			
			var oSprintModel = new sap.ui.model.json.JSONModel();
			this._oDialogSprintCreate.setModel(oSprintModel, "SprintData");
			this._oDialogSprintCreate.open();
		},
		onPressSprintCreateSave: function(oEvent) {
			var oSprintModel = this._oDialogSprintCreate.getModel("SprintData");
			
			var dSprintStart = new Date(oSprintModel.getProperty("/SprintStart"));
			dSprintStart.setUTCDate(dSprintStart.getDate());
			var dSprintEnd = new Date(oSprintModel.getProperty("/SprintEnd"));
			dSprintEnd.setUTCDate(dSprintEnd.getDate());
			
			this.getOwnerComponent().getModel("oDataService").create(
				"/SprintSet",
				{
					"SprintNr": oSprintModel.getProperty("/SprintNr"),
					"SprintStart": dSprintStart,
					"SprintEnd": dSprintEnd
				},
				{
					"async": false,
					"success": function() {
						this._oDialogSprintCreate.close();
						this._loadDashboardModelData();
					}.bind(this),
					"error": function(oError) {
						var oErrorBody = JSON.parse(oError.responseText);
						MessageBox.show(oErrorBody.error.message.value, sap.m.MessageBox.Icon.ERROR, "Fehler");
					}
				}
			);
		},
		onPressSprintCreateCancel: function(oEvent) {
			this._oDialogSprintCreate.close();
		},
		
		// --------------------------------------------------
		// TIMEBOX CREATE
		// --------------------------------------------------
		onPressSprintTimeboxAdd: function(oEvent) {
			var oTimeboxModel = new sap.ui.model.json.JSONModel();
			this._oDialogSprintTimeboxAdd = sap.ui.xmlfragment("zv.scrum.board.view.dashboard.DialogSprintTimeboxAdd", this);
			this._oDialogSprintTimeboxAdd.setModel(oTimeboxModel, "TimeboxData");
			this._oDialogSprintTimeboxAdd.open();
		},
		
		onPressSprintTimeboxAddSave: function(oEvent) {
			var sSprintId = this.getView().getModel("DashboardData").getProperty("/SprintId");
			var oTimeboxModel = this._oDialogSprintTimeboxAdd.getModel("TimeboxData");
			
			var iTimeboxHours = 0;
			if(oTimeboxModel.getProperty("/TimeboxHours")){
				iTimeboxHours = parseInt(oTimeboxModel.getProperty("/TimeboxHours"));
			}

			this.getOwnerComponent().getModel("oDataService").create(
				"/SprintSet('" + sSprintId + "')/SprintTimeboxSet",
				{
					"TimeboxHours": iTimeboxHours,
					"TimeboxTitle": oTimeboxModel.getProperty("/TimeboxTitle"),
					"TimeboxDescr": oTimeboxModel.getProperty("/TimeboxDescr")
				},
				{
					"async": false,
					"success": function() {
						this._oDialogSprintTimeboxAdd.close();
						this._loadDashboardModelData();
					}.bind(this),
					"error": function(oError) {
						var oErrorBody = JSON.parse(oError.responseText);
						MessageBox.show(oErrorBody.error.message.value, sap.m.MessageBox.Icon.ERROR, "Fehler");
					}
				}
			);
		},
		
		onPressSprintTimeboxAddCancel: function(oEvent) {
			this._oDialogSprintTimeboxAdd.close();
		},
		
		// --------------------------------------------------
		// TIMEBOX REMOVE
		// --------------------------------------------------
		onPressSprintTimeboxRemove: function(oEvent){
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(this.getView().getModel("DashboardData").getProperty("/DashboardTimeboxSet"));
			
			this._oDialogSprintTimeboxRemove = sap.ui.xmlfragment("zv.scrum.board.view.dashboard.DialogSprintTimeboxRemove", this);
			this._oDialogSprintTimeboxRemove.setModel(oModel, "TimeboxData");
			this._oDialogSprintTimeboxRemove.open();
		},
		
		onPressSprintTimeboxRemoveSave: function(oEvent) {
			console.log(this._oDialogSprintTimeboxRemove.byId("selectTimebox").getSelectedKey());
			
			console.log(oEvent.getSource());
			console.log(oEvent.getSource().getBindingContext("TimeboxData").getObject());
			//this._oDialogSprintTimeboxRemove.close();
		},
		
		onPressSprintTimeboxRemoveCancel: function(oEvent) {
			this._oDialogSprintTimeboxRemove.close();
		},
		
		// --------------------------------------------------
		// SPRINT STORY SELECT
		// --------------------------------------------------
		onPressSprintStoryAdd: function(oEvent) {
			this.getOwnerComponent().getModel("oDataService").read("/StorySet", {
				"async": false,
				/*
				"filters": [
					new sap.ui.model.Filter({
						path: "SprintStatus",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "01"
					})
				],
				*/
				"success": function(oData) {
					console.log(oData);
					
					this._oDialogSprintStorySelect = sap.ui.xmlfragment("zv.scrum.board.view.dashboard.DialogSprintStorySelect", this);
					var oStoryModel = new sap.ui.model.json.JSONModel();
					oStoryModel.setProperty("/StorySet", oData.results);
					this._oDialogSprintStorySelect.setModel(oStoryModel, "StoryData");
					this._oDialogSprintStorySelect.open();
				}.bind(this),
				"error": function(oError) {
					console.log(oError);
				}
			});
		},
		onPressSprintStorySelectLine: function(oEvent) {
			//var oModel = oEvent.getSource().getBindingContext("StoryData").getModel();
			//var oData = oModel.getProperty(oEvent.getSource().getBindingContext("StoryData").getPath());
			var oData = oEvent.getSource().getBindingContext("StoryData").getObject();
			var sSprintId = this.getView().getModel("DashboardData").getProperty("/SprintId");
			var sStoryId = oData.StoryId;
			
			this.getOwnerComponent().getModel("oDataService").create(
				"/SprintStorySet",
				{
					"SprintId": sSprintId,
					"StoryId": sStoryId
				},
				{
					"async": false,
					"success": function() {
						this._oDialogSprintStorySelect.close();
						this._loadDashboardModelData();
					}.bind(this),
					"error": function(oError) {
						var oErrorBody = JSON.parse(oError.responseText);
						MessageBox.show(oErrorBody.error.message.value, sap.m.MessageBox.Icon.ERROR, "Fehler");
					}
				}
			);
		}, 
		onPressSprintStorySelectCancel: function(oEvent) {
			this._oDialogSprintStorySelect.close();
		},
		
		// --------------------------------------------------
		// METHODS
		// --------------------------------------------------
		_initDashboardModel: function() {
			var oDashboardData = new sap.ui.model.json.JSONModel();
			
			oDashboardData.setProperty("/SprintId", "0");
			oDashboardData.setProperty("/SprintNr", "000");
			oDashboardData.setProperty("/SprintStatus", "00");
			//oDashboardData.setProperty("/SprintStart", new Date('1900/01/01'));
			//oDashboardData.setProperty("/SprintEnd", new Date('1900/01/01'));
			
			oDashboardData.setProperty("/HoursDelta", 0);
			oDashboardData.setProperty("/HoursRemainingTeam", 0);
			oDashboardData.setProperty("/HoursRemainingUser", 0);
			
			oDashboardData.setProperty("/StoryPointsTotal", 0);
			oDashboardData.setProperty("/StoryPointsOpen", 0);
			oDashboardData.setProperty("/StoryPointsInProcess", 0);
			oDashboardData.setProperty("/StoryPointsDone", 0);
			
			oDashboardData.setProperty("/TimeboxHoursTotal", 0);
			oDashboardData.setProperty("/TimeboxHoursUsed", 0);
			
			oDashboardData.setProperty("/DashboardStorySet", {});
			oDashboardData.setProperty("/DashboardTimeboxSet", {});
			oDashboardData.setProperty("/DashboardDateSet", {});
			oDashboardData.setProperty("/DashboardActivitySet", {});
	
			this.getView().setModel(oDashboardData, "DashboardData");
		},
		
		_loadDashboardModelData: function() {
			var oView = this.getView();
			
			oView.byId("dashboardModuleTitle").setBusy(true);
			oView.byId("dashboardModuleHours").setBusy(true);
			oView.byId("dashboardModuleCapacity").setBusy(true);
			oView.byId("idDashboardChartBurndown").setBusy(true);
			oView.byId("dashboardModuleStorypointsDone").setBusy(true);
			oView.byId("dashboardModuleTimeboxUsage").setBusy(true);
			oView.byId("dashboardModuleStorypointsOverview").setBusy(true);
			oView.byId("dashboardModuleStoryList").setBusy(true);
			oView.byId("dashboardModuleTimeboxList").setBusy(true);
			oView.byId("dashboardModuleActivityList").setBusy(true);
			
			// NEW COMPLETE DATA! // ?$filter=SprintStatus eq '01'&$expand=DashboardDateSet,DashboardStorySet,DashboardTimeboxSet,DashboardActivitySet
			this.getOwnerComponent().getModel("oDataService").read("/DashboardDataSet", {
				"async": false,
				"urlParameters": {"$expand": "DashboardDateSet,DashboardStorySet,DashboardTimeboxSet,DashboardActivitySet"},
				"filters": [
					new sap.ui.model.Filter({
						path: "SprintStatus",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "01"
					})
				],
				"success": function(oData) {
					console.log(oData.results[0]);
					
					oView.getModel("DashboardData").setData(oData.results[0]);
					
					oView.byId("dashboardModuleTitle").setBusy(false);
					oView.byId("dashboardModuleHours").setBusy(false);
					oView.byId("dashboardModuleCapacity").setBusy(false);
					oView.byId("idDashboardChartBurndown").setBusy(false);
					oView.byId("dashboardModuleStorypointsDone").setBusy(false);
					oView.byId("dashboardModuleTimeboxUsage").setBusy(false);
					oView.byId("dashboardModuleStorypointsOverview").setBusy(false);
					oView.byId("dashboardModuleStoryList").setBusy(false);
					oView.byId("dashboardModuleTimeboxList").setBusy(false);
					oView.byId("dashboardModuleActivityList").setBusy(false);
				},
				"error": function(oError) {
					var oErrorBody = JSON.parse(oError.responseText);
					MessageBox.show(oErrorBody.error.message.value, sap.m.MessageBox.Icon.ERROR, "Fehler");
				}
			});
		},
		
		_initDashboardChartBurndown: function(){
			// A Dataset defines how the model data is mapped to the chart 
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				// a Bar Chart requires exactly one dimension (x-axis) 
				dimensions: [{
					axis: 1, // must be one for the x-axis, 2 for y-axis
					name: 'Date',
					value: {
						path: "DashboardData>SprintDate",
						type: new sap.ui.model.type.Date({pattern: "dd.MM."})
					}
				}],
				// it can show multiple measures, each results in a new set of bars in a new color 
				measures: [
					// measure 1
					{
						name: 'Kapazität', // 'name' is used as label in the Legend 
						value: '{DashboardData>HoursRemainingTeam}' // 'value' defines the binding for the displayed value   
					}, {
						name: 'Restschätzung', // 'name' is used as label in the Legend 
						value: '{DashboardData>HoursEstimated}' // 'value' defines the binding for the displayed value   
					}, {
						name: 'Timeboxen', // 'name' is used as label in the Legend 
						value: '{DashboardData>HoursTimebox}' // 'value' defines the binding for the displayed value   
					}
				],
				// 'data' is used to bind the whole data collection that is to be displayed in the chart 
				data: {
					path: "DashboardData>/DashboardDateSet/results"
				}
			});

			// create a Bar chart
			// you also might use Combination, Line, StackedColumn100, StackedColumn or Column
			// for Donut and Pie please remove one of the two measures in the above Dataset.  
			var oLineChart = new sap.viz.ui5.Line({
				width: "100%",
				height: "300px",
				plotArea: {
					//'colorPalette' : d3.scale.category20().range()
				},
				title: {
					visible: false,
					text: 'Profit and Revenue By Country'
				},
				legend: {
					visible: false
				},
				dataset: oDataset
			});

			// attach the model to the chart and display it
			//oBarChart.setModel(oModel);
			oLineChart.placeAt(this.getView().byId("idDashboardChartBurndown"));
		},
		
		_test: function(){
			var dataColumns = [
				{ colID: "member", colTitle: "Member" },
				{ colID: "20.10.2015", colTitle: "20.10." },
				{ colID: "21.10.2015", colTitle: "21.10." }
			];
			
			var dataRows = [
				{ "member": "Dominik", "20.10.2015": "8" },
				{ "member": "Markus", "20.10.2015": "8" }
			];
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({ Columns: dataColumns, Rows: dataRows });  
			
			var oTable = new Table();
			oTable.setModel(oModel);  
			oTable.bindColumns("/Columns", function(index, context) {
				var sColumnId = context.getObject().colID;
				var sColumnTitle = context.getObject().colTitle;
				return new sap.ui.table.Column({
					//id : sColumnId,  <-- kann nur ABC
					label: sColumnTitle,
					
					template: sColumnId,
					sortProperty: sColumnId,  
					filterProperty: sColumnId
					
				});  
			});  
			oTable.bindRows("/Rows");  
			
			oTable.placeAt(this.getView().byId("idDashboardChartBurndown"));
		}
	});
});