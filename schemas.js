/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
optVal = "opt";

schemas = {
	opt: optVal,
	illness: {
		id: optVal,
		name: null,
		code: null,
		category: null
	},
	symptom: {
		id: optVal,
		name: null
	},
	category: {
		id: optVal,
		name: null
	},
	category_symptoms: {
		category_id: null,
		symptom_id: null
	},
	illness_symptoms: {
		illness_id: null,
		symptom_id: null
	}

};

schemas.validateDataWithSchema = function (data, schema) {
	if (!data || !schema) {
		return {valid: false, missingProperty: null};
	} else {
		//get the coupon from the schemas
		var optVal = this.opt;
		//loop over every property from the schema
		for (var property in schema) {
			//check for a non default property in both the schema and data
			if (schema.hasOwnProperty(property) && schema[property] !== optVal) {
				if (!data.hasOwnProperty(property)) {
					//doesn't have the property. return the property
					return {valid: false, missingProperty: property};
				} else if (data.hasOwnProperty(property) && data[property] === null) {
					//the data has the property but it is null. return the property
					return {valid: false, missingProperty: property};
				}
			}
		}
		return {valid: true, missingProperty: null};
	}
};

module.exports = schemas;