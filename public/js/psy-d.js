// urls to make requests to
urls = {
	category: "/category/",
	illness: "/illness/",
	symptom: "/symptom/",
	relation: "/relations/createIllnessSymptomRelations",
	filter: "/filter"

};

// lists of each model
var categories = [];
var illnesses = [];
var symptoms = [];

// boolean to indicate whether filtering is on or off
var filterOn = false;

//get all categories in the dom list
var categoryList = $("#category-list");
//get all illnesses in the dom list
var illnessList = $("#illness-list");
//get all symptoms in the dom list
var symptomList = $("#symptom-list");

// once the page has loaded.. get everything from the database
$(document).ready(function () {
	getAll();
});

// supply a type, if non supplied then all are loaded
function getAll(type) {
	type = type || "";
	if (type === "CATEGORIES" || type === "") {
		makeRequest("GET", urls.category, null, function (data) {
			if (data.success) {
				categoryList.find('ul').empty();
				categories = data.categories;
				insertCategories(data.categories);
			}
			// reloadHandlers();

		});
	}
	if (type === "ILLNESSES" || type === "") {
		makeRequest("GET", urls.illness, null, function (data) {
			if (data.success) {
				illnessList.find('ul').empty();
				illnesses = data.illnesses;
				insertIllnesses(data.illnesses);
			}
			// reloadHandlers();
		});
	}
	if (type === "SYMPTOMS" || type === "") {
		makeRequest("GET", urls.symptom, null, function (data) {
			if (data.success) {
				symptomList.find('ul').empty();
				symptoms = data.symptoms;
				insertSymptoms(data.symptoms);
			}
			// reloadHandlers();
		});
	}

}

// inserts an array of categories into the dom
function insertCategories(cats) {
	categoryList.find('ul').empty();
	cats = cats || categories;
	for (var i = 0; i < cats.length; i++) {
		createCategoryBlock(cats[i].category);
	}
	reloadHandlers();
}
// inserts an array of illnesses into the dom
function insertIllnesses(ills) {
	illnessList.find('ul').empty();

	ills = ills || illnesses;
	for (var i = 0; i < ills.length; i++) {
		createIllnessBlock(ills[i].illness);
	}
	reloadHandlers();
}
// inserts an array of symptoms into the dom
function insertSymptoms(symps) {
	symptomList.find('ul').empty();

	symps = symps || symptoms;
	for (var i = 0; i < symps.length; i++) {
		createSymptomBlock(symps[i].symptom);
	}
	reloadHandlers();
}

// reloads jquery listeners that should be updated when new things are added
function reloadHandlers() {
	// if the filter is not on then hide the checkboxes
	if (!filterOn) {
		$('div.check-div').hide();
	}

	// listener for any checkboxes
	$('div.check-div input[type="checkbox"]').off().click(function () {

		// if the filter is on then get each all of the selected models and send those arrays to the filter
		if (filterOn) {
			var id = $(this).attr('id');

			// get selected categories
			var categoryIds = [];
			var selectedCategoryButtons = $('#category-list').find('input[type="checkbox"]:checked');
			$.each(selectedCategoryButtons, function () {
				categoryIds.push($(this).attr("data-cat-id"));
			});

			// get selected illnesses
			var illnessIds = [];
			var selectedIllnessButtons = $('#illness-list').find('input[type="checkbox"]:checked');
			$.each(selectedIllnessButtons, function () {
				illnessIds.push($(this).attr("data-ill-id"));
			});

			// get selected symptoms
			var symptomIds = [];
			var selectedSymptomIds = $('#symptom-list').find('input[type="checkbox"]:checked');
			$.each(selectedSymptomIds, function () {
				symptomIds.push($(this).attr("data-symp-id"));
			});

			// filter with the the selected arrays
			filter(categoryIds, illnessIds, symptomIds);
		}
	});
}

// listener for the filter button. There is only one so no need for reloading
$('#filter-btn').click(function () {
	if (filterOn) {
		$('div.check-div').hide();
		filterOn = false;
	} else {
		$('div.check-div').show();
		filterOn = true;
	}
	resetCheckboxes()
});

// listener for the search glyphicons. There are a set number so no need for reloading
$('div.container-title-options span.glyphicon-search').click(function () {
	var searchBar = $(this).parent().siblings('form.search-bar');

	searchBar.slideToggle();
	searchBar.find('input').focus();
});

// generalized ajax request for making requests to the server
function makeRequest(method, url, data, callback) {
	//get all of the illnesses
	if (!data) {
		data = "{}";
	} else {
		data = JSON.stringify(data)
	}
	$.ajax({
		method: method,
		url: url,
		contentType: 'application/json',
		dataType: 'json',
		data: data,
		error: function (request, status, error) {
			console.log(request);
			console.log(status);
			console.log(error);
			callback();
		},
		success: function (data) {
			callback(data);
		}
	});
}


/* LIST SEARCHING FUNCTIONS */

//search category list
$('#category-list-search').keyup(function () {
	var text = $(this).val();
	var reducedCategories = search("category", "name", categories, text);

	categoryList.find('ul').empty();
	for (var i = 0; i < reducedCategories.length; i++) {
		// var id = reducedCategories[i].category.id;
		// var name = reducedCategories[i].category.name;
		createCategoryBlock(reducedCategories[i].category);
	}

});

//search illness list
$('#illness-list-search').keyup(function () {
	var text = $(this).val();
	var reducedIllnesses = search("illness", "name", illnesses, text);

	illnessList.find('ul').empty();
	for (var i = 0; i < reducedIllnesses.length; i++) {
		// var id = reducedIllnesses[i].illness.id;
		// var name = reducedIllnesses[i].illness.name;
		// var code = reducedIllnesses[i].illness.code;
		createIllnessBlock(reducedIllnesses[i].illness);
	}

});

//search symptomlist
$('#symptom-list-search').keyup(function () {
	var text = $(this).val();
	var reducedSymptoms = search("symptom", "name", symptoms, text);

	symptomList.find('ul').empty();
	for (var i = 0; i < reducedSymptoms.length; i++) {
		// var id = reducedSymptoms[i].symptom.id;
		// var name = reducedSymptoms[i].symptom.name;
		createSymptomBlock(reducedSymptoms[i].symptom);
	}

});

// generalized for searching any list for any type and then putting it back into the list
function search(type, comparisonType, collection, comparator) {
	var matching = [];
	for (var i = 0; i < collection.length; i++) {
		if (collection[i][type][comparisonType].toUpperCase().includes(comparator.toUpperCase())) {
			matching.push(collection[i]);
		}
	}
	return matching;
}

// creates a block for an already defined category
// this is used to display a category from the database
function createCategoryBlock(category) {
	var hidden = "";
	if (!filterOn) {
		hidden = "style='display: none;'";
	}

	categoryList.find('ul').prepend("" +
		"<li class='category-data well' data-category-id='" + category.id + "'>" +
		"<div class='check-div'" + hidden + "><input type='checkbox' id='cat-" + category.id + "' data-cat-id='" + category.id + "'/>" +
		"<label for='cat-" + category.id + "'><span></span></label></div>" +
		"<div class='info-div'>" +
		"<h4>" + category.name + "</h4>" +
		"<span><b></b></span>&nbsp;" +
		"</div>" +
		"</li>");
}

// creates a block for an already defined illness
// this is used to display a illness from the database
function createIllnessBlock(illness) {
	var hidden = "";
	if (!filterOn) {
		hidden = "style='display: none;'";
	}

	var illnessLIString = "<li class='illness-data well' data-illness-id='" + illness.id + "'>" +
		"<div class='check-div'" + hidden + "><input type='checkbox' id='ill-" + illness.id + "' data-ill-id='" + illness.id + "'/> <label for='ill-" + illness.id + "'><span></span></label></div>" +
		"<div class='info-div'><h4>" + illness.name + "</h4>" +
		"<span><b>ID: </b>" + illness.id + ", </span>&nbsp;" +
		"<span><b>Code: </b>" + illness.code + "</span>&nbsp;" +
		"<span><a class='remove-btn admin-only' onclick='removeIllness(" + illness.id + ")'>Remove</a></span>" +
		"</div>" +
		"</li>";

	var illnessLI = $.parseHTML(illnessLIString);
	$(illnessLI).data('illness', illness);
	illnessList.find('ul').prepend(illnessLI);
}

// creates a block for an already defined symptom
// this is used to display a symptom from the database
function createSymptomBlock(symptom) {
	var hidden = "";
	if (!filterOn) {
		hidden = "style='display: none;'";
	}

	symptomList.find('ul').prepend("" +
		"<li class='symptom-data well' data-symptom-id='" + symptom.id + "'>" +
		"<div class='check-div'" + hidden + "><input type='checkbox' id='symp-" + symptom.id + "' data-symp-id='" + symptom.id + "'/> <label for='symp-" + symptom.id + "'><span></span></label></div>" +
		"<div class='info-div'><h4>" + symptom.name + "</h4>" +
		"<span><b>ID: </b>" + symptom.id + "</span>&nbsp;" +
		"<span><a class='remove-btn admin-only' onclick='removeSymptom(" + symptom.id + ")'>Remove</a></span>" +
		"</div>" +
		"</li>");
}

// reset's all checkboxes on category, symptom, and illness blocks
function resetCheckboxes() {
	$('input[type="checkbox"]:checked').each(function () {
		$(this).prop('checked', false);
	});
}

// filters out categories, illnesses, and symptoms based on a list
// of each. Finds the intersection of the provided lists related.
function filter(categoryIds, illnessIds, symptomIds) {
	var request = {
		categories: categoryIds,
		illnesses: illnessIds,
		symptoms: symptomIds
	};
	console.log(request);
	makeRequest("POST", urls.filter, request, function (data) {
		console.log(data);
		if (data.success) {
			if (data.categories) {
				insertCategories(data.categories);
			}
			if (data.illnesses) {
				insertIllnesses(data.illnesses);
			}
			if (data.symptoms) {
				insertSymptoms(data.symptoms);
			}
		}
	});
}