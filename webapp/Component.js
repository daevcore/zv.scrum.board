sap.ui.define([
	"sap/ui/core/UIComponent"
	
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("zv.scrum.board.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			// INIT FUNCTION OF PARENT
			UIComponent.prototype.init.apply(this, arguments);
			
			// MODEL SETTINGS (Event handlers etc.)
			this.getModel("oDataService").setUseBatch(true);
			
			// INITIALIZE ROUTER
			this.getRouter().initialize();
		}
	});
});