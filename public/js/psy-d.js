categoryUrls = {
	newCategory: "/category/",
	allCategory: "/category/",
	deleteCategory: "/category/"
};
illnessUrls = {
	newIllness: "/illness/",
	allIllness: "/illness/",
	deleteIllness: "/illness/"
};
symptomUrls = {
	newSymptom: "/symptom/",
	allSymptoms: "/symptom/",
	deleteSymptom: "/symptom/"
};
relationUrls = {
	newIllnessSymptoms: "/relations/createIllnessSymptomRelations"
};
filterUrls = {
	filter: "/filter"
}



var categories = [];
var illnesses = [];
var symptoms = [];

var filterOn = false;

//get all categories
var categoryList = $("#category-list");
//get all illnesses
var illnessList = $("#illness-list");
//get all symptoms
var symptomList = $("#symptom-list");


$(document).ready(function () {

	getAll();

});

//supply a type, if non supplied then all are loaded
function getAll(type) {
	type = type || "";
	if (type === "CATEGORIES" || type === "") {
		makeRequest("GET", categoryUrls.allCategory, null, function (data) {
			if (data.success) {
				categoryList.find('ul').empty();
				categories = data.categories;
				loadCategories(data.categories);
			}
			// reloadHandlers();

		});
	}
	if (type === "ILLNESSES" || type === "") {
		makeRequest("GET", illnessUrls.allIllness, null, function (data) {
			if (data.success) {
				illnessList.find('ul').empty();
				illnesses = data.illnesses;
				loadIllnesses(data.illnesses);
			}
			// reloadHandlers();
		});
	}
	if (type === "SYMPTOMS" || type === "") {
		makeRequest("GET", symptomUrls.allSymptoms, null, function (data) {
			if (data.success) {
				symptomList.find('ul').empty();
				symptoms = data.symptoms;
				loadSymptoms(data.symptoms);
			}
			// reloadHandlers();
		});
	}

}

function loadCategories(cat) {
	categoryList.find('ul').empty();
	cat = cat || categories;
	for (var i = 0; i < cat.length; i++) {
		createCategoryBlock(cat[i].category);
	}
	reloadHandlers();
}
function loadIllnesses(ill) {
	illnessList.find('ul').empty();

	ill = ill || illnesses;
	for (var i = 0; i < ill.length; i++) {
		createIllnessBlock(ill[i].illness);
	}
	reloadHandlers();
}
function loadSymptoms(symp) {
	symptomList.find('ul').empty();

	symp = symp || symptoms;
	for (var i = 0; i < symp.length; i++) {
		createSymptomBlock(symp[i].symptom);
	}
	reloadHandlers();
}


function reloadHandlers() {
	if (!filterOn) {
		$('div.check-div').hide();
	}

	$('div.check-div input[type="checkbox"]').off().click(function () {
		console.log("CLICK");
		if (filterOn) {
			var id = $(this).attr('id');

			var catIds = [];
			if (id.includes("cat")) {
				var selectedBtns = $('#category-list').find('input[type="checkbox"]:checked');
				$.each(selectedBtns, function () {
					catIds.push($(this).attr("data-cat-id"));
				});
			}

			var illIds = [];
			if (id.includes("ill")) {
				var selectedBtns = $('#illness-list').find('input[type="checkbox"]:checked');
				$.each(selectedBtns, function () {
					illIds.push($(this).attr("data-ill-id"));
				});
			}

			var sympIds = [];
			if (id.includes("symp")) {
				var selectedBtns = $('#symptom-list').find('input[type="checkbox"]:checked');

				$.each(selectedBtns, function () {
					sympIds.push($(this).attr("data-symp-id"));
				});
			}

			filter(catIds, illIds, sympIds);

		} else if (filterOn) {
			loadCategories();
			loadSymptoms();
		}
	});
}


$('div.container-title-options span.glyphicon-search').click(function () {
	var searchBar = $(this).parent().siblings('form.search-bar');

	searchBar.slideToggle();
	searchBar.find('input').focus();
});

$('div.container-title-options span.glyphicon-filter').click(function () {
	//to turn off
	if ($(this).hasClass("state-ON")) {
		console.log("TURN OFF FILTER");
		$(this).removeClass("state-ON");
		$(this).addClass("state-OFF");
		$('div.check-div').hide();
		filterOn = false;
		getAll();
	} else {//to turn on
		console.log("TURN ON FILTER");
		//$('div.container-title-options span.glyphicon-filter').addClass("state-OFF").removeClass("state-ON");
		$(this).removeClass("state-OFF");
		$(this).addClass("state-ON");
		// $('div.check-div').hide();
		$(this).parent().siblings('ul').find('div.check-div').show();
		filterOn = true;
	}
});


function newSymptom(newSympElem) {
	console.log($(newSympElem));
	var name = $(newSympElem).parent().siblings('input').val();
	if (name) {
		console.log("CREATE NEW SYMPTOM");
		var symptom = {
			symptom: {
				id: null,
				name: name
			}
		};
		console.log(symptom);
		makeRequest('POST', symptomUrls.newSymptom, symptom, function (data) {
			if (data.success) {
				cancelNew(newSympElem);
				getAll("SYMPTOMS");
			} else {
				alert("Server Problem! Contact Cameron");
			}

		});
	}
}

function newCategory(newCatElem) {
	console.log($(newCatElem));
	var name = $(newCatElem).parent().siblings('input').val();
	if (name) {
		console.log("CREATE NEW SYMPTOM");
		var category = {
			category: {
				id: null,
				name: name
			}
		};
		console.log(category);
		makeRequest('POST', categoryUrls.newCategory, category, function (data) {
			if (data.success) {
				cancelNew(newCatElem);
				getAll("CATEGORIES");
			} else {
				alert("Server Problem! Contact Cameron");
			}

		});
	}
}

function newIllness(newIllElem) {
	console.log($(newIllElem));
	var name = $(newIllElem).parent().siblings('input#new-illness-name').val();
	var code = $(newIllElem).parent().siblings('input#new-illness-code').val();

	var checkedCategory = $('#category-list').find('div.check-div').children('input[type="checkbox"]:checked').first();
	var categoryId = checkedCategory.parent().parent().data('category-id');
	console.log(categoryId);

	var symptoms = $('#symptom-list').find('div.check-div').children('input[type="checkbox"]:checked');
	console.log(symptoms);
	var symptomIds = [];
	symptoms.each(function (index, val) {
		symptomIds.push($(val).parent().parent().data('symptom-id'));
	});
	// console.log(symptomIds)


	if (name && code) {
		if (!symptomIds || symptomIds.length < 1) {
			alert("No symptoms selected");
		} else if (!categoryId) {
			alert("No category selected");
		} else {
			console.log("CREATE NEW ILLNESS");
			var illness = {
				illness: {
					id: null,
					name: name,
					code: code,
					category: categoryId
				}
			};
			console.log(illness);
			makeRequest('POST', illnessUrls.newIllness, illness, function (data) {
				if (data.success) {
					cancelNew(newIllElem);
					console.log("RELATE NOW");

					var relations = {
						illnessId: data.newId,
						symptomIds: symptomIds
					};

					console.log(relations);

					makeRequest('POST', relationUrls.newIllnessSymptoms, relations, function (data) {
						if (data.success) {
							console.log("ITS GOOD");
							getAll("ILLNESSES");

						} else {
							console.log("Bad relation");
						}
					});

				} else {
					alert("Server Problem! Contact Cameron");
				}

			});
		}
	}
}

function cancelNew(cancelElem) {
	$('div.check-div').hide();
	console.log($(cancelElem));
	$(cancelElem).parent().parent().parent().remove();
}

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


//new symptom plus
$('#symptom-list div span.glyphicon-plus').click(function () {
	if (symptomList.find('li.new').length < 1) {

		symptomList.find('ul').prepend("" +
			"<li class='symptom-data well new'>" +
			"<div>" +
			"<div class='create-new-ico'>" +
			"<span class='glyphicon glyphicon-ok' aria-hidden='true' onclick='newSymptom(this)'></span>" +
			"<span class='glyphicon glyphicon-remove' aria-hidden='true' onclick='cancelNew(this)'></span>" +
			"</div>" +
			"<label for='new-symptom-name'>Symptom Name:</label>" +
			"<input type='text' class='form-control' id='new-symptom-name' placeholder='Name'>" +
			"</div>" +
			"</li>");
	} else {
		symptomList.find('li.new').remove();
	}
});
//new category plus
$('#category-list div span.glyphicon-plus').click(function () {
	if (categoryList.find('li.new').length < 1) {

		categoryList.find('ul').prepend("" +
			"<li class='category-data well new'>" +
			"<div>" +
			"<div class='create-new-ico'>" +
			"<span class='glyphicon glyphicon-ok' aria-hidden='true' onclick='newCategory(this)'></span>" +
			"<span class='glyphicon glyphicon-remove' aria-hidden='true' onclick='cancelNew(this)'></span>" +
			"</div>" +
			"<label for='new-category-name'>Category Name:</label>" +
			"<input type='text' class='form-control' id='new-category-name' placeholder='Name'>" +
			"</div>" +
			"</li>");
	} else {
		categoryList.find('li.new').remove();
	}
});
//new category plus
$('#illness-list div span.glyphicon-plus').click(function () {
	if (illnessList.find('li.new').length < 1) {

		$('#category-list').find('div.check-div').show();
		$('#symptom-list').find('div.check-div').show();
		illnessList.find('ul').prepend("" +
			"<li class='illness-data well new'>" +
			"<div>" +
			"<div class='create-new-ico'>" +
			"<span class='glyphicon glyphicon-ok' aria-hidden='true' onclick='newIllness(this)'></span>" +
			"<span class='glyphicon glyphicon-remove' aria-hidden='true' onclick='cancelNew(this)'></span>" +
			"</div>" +
			"<label for='new-illness-name'>Illness Name:</label>" +
			"<input type='text' class='form-control' id='new-illness-name' placeholder='Name'>" +
			"<label for='new-illness-code'>Illness Code:</label>" +
			"<input type='text' class='form-control' id='new-illness-code' placeholder='Code'>" +
			"<p>Please select a Category for this illness.</p>" +
			"<p>Please select some Symptom(s) for this illness.</p>" +
			"</div>" +
			"</li>");
	} else {
		illnessList.find('li.new').remove();
		$('#category-list').find('div.check-div').hide();
		$('#symptom-list').find('div.check-div').hide();
	}
});

//search category
$('#category-list-search').keyup(function () {
	var text = $(this).val();
	var reducedCategories = search("category", "name", categories, text);

	categoryList.find('ul').empty();
	for (var i = 0; i < reducedCategories.length; i++) {
		var id = reducedCategories[i].category.id;
		var name = reducedCategories[i].category.name;
		createCategoryBlock(reducedCategories[i].category);
	}

});
//search illness
$('#illness-list-search').keyup(function () {
	var text = $(this).val();
	var reducedIllnesses = search("illness", "name", illnesses, text);

	illnessList.find('ul').empty();
	for (var i = 0; i < reducedIllnesses.length; i++) {
		var id = reducedIllnesses[i].illness.id;
		var name = reducedIllnesses[i].illness.name;
		var code = reducedIllnesses[i].illness.code;
		createIllnessBlock(reducedIllnesses[i].illness);
	}

});
//search symptom
$('#symptom-list-search').keyup(function () {
	var text = $(this).val();
	var reducedSymptoms = search("symptom", "name", symptoms, text);

	symptomList.find('ul').empty();
	for (var i = 0; i < reducedSymptoms.length; i++) {
		var id = reducedSymptoms[i].symptom.id;
		var name = reducedSymptoms[i].symptom.name;
		createSymptomBlock(reducedSymptoms[i].symptom);
	}

});
//search
function search(type, comparisonType, collection, comparator) {
	var matching = [];
	for (var i = 0; i < collection.length; i++) {
		if (collection[i][type][comparisonType].toUpperCase().includes(comparator.toUpperCase())) {
			matching.push(collection[i]);
		}
	}
	return matching;
}


function createCategoryBlock(category) {
	var hidden = "";
	if (!categoryList.find('span.glyphicon-filter').hasClass("state-ON")) {
		hidden = "style='display: none;'";
	}

	categoryList.find('ul').prepend("" +
		"<li class='category-data well' data-category-id='" + category.id + "'>" +
		"<div class='check-div'" + hidden + "><input type='checkbox' id='cat-" + category.id + "' data-cat-id='" + category.id + "'/>" +
		"<label for='cat-" + category.id + "'><span></span></label></div>" +
		"<div class='info-div'>" +
		"<h4>" + category.name + "</h4>" +
		"<span><b></b></span>&nbsp;" +
		"<span><a class='remove-btn' onclick='removeCategory("+ category.id +")'>Remove</a></span>" +
		"</div>" +
		"</li>");
}

function createIllnessBlock(illness) {
	var hidden = "";
	if (!illnessList.find('span.glyphicon-filter').hasClass("state-ON")) {
		hidden = "style='display: none;'";
	}

	var illnessLIString = "<li class='illness-data well' data-illness-id='" + illness.id + "'>" +
		"<div class='check-div'" + hidden + "><input type='checkbox' id='ill-" + illness.id + "' data-ill-id='" + illness.id + "'/> <label for='ill-" + illness.id + "'><span></span></label></div>" +
		"<div class='info-div'><h4>" + illness.name + "</h4>" +
		"<span><b>ID: </b>" + illness.id + ", </span>&nbsp;" +
		"<span><b>Code: </b>" + illness.code + "</span>&nbsp;" +
		"<span><a class='remove-btn' onclick='removeIllness("+ illness.id +")'>Remove</a></span>" +
		"</div>" +
		"</li>";

	var illnessLI = $.parseHTML(illnessLIString);
	$(illnessLI).data('illness', illness);
	illnessList.find('ul').prepend(illnessLI);
}

function createSymptomBlock(symptom) {
	var hidden = "";
	if (!symptomList.find('span.glyphicon-filter').hasClass("state-ON")) {
		hidden = "style='display: none;'";
	}

	symptomList.find('ul').prepend("" +
		"<li class='symptom-data well' data-symptom-id='" + symptom.id + "'>" +
		"<div class='check-div'" + hidden + "><input type='checkbox' id='symp-" + symptom.id + "' data-symp-id='" + symptom.id + "'/> <label for='symp-" + symptom.id + "'><span></span></label></div>" +
		"<div class='info-div'><h4>" + symptom.name + "</h4>" +
		"<span><b>ID: </b>" + symptom.id + "</span>&nbsp;" +
		"<span><a class='remove-btn' onclick='removeSymptom("+ symptom.id +")'>Remove</a></span>" +
		"</div>" +
		"</li>");
}

function removeCategory(id) {
	console.log("remove Category with id: ", id);
	makeRequest("DELETE", categoryUrls.deleteCategory + id, null, function (data) {
		console.log("successful delete");
		getAll("CATEGORIES");
	});
}

function removeIllness(id) {
	makeRequest("DELETE", illnessUrls.deleteIllness + id, null, function (data) {
		console.log("successful delete");
		getAll("ILLNESSES");
	});
}

function removeSymptom(id) {
	console.log("remove symptom with id: ", id);
	makeRequest("DELETE", symptomUrls.deleteSymptom + id, null, function (data) {
		console.log("successful delete");
		getAll("SYMPTOMS");
	});
}


function filter (categoryIds, illnessIds, symptomIds) {
	var request = {
		categories: categoryIds,
		illnesses: illnessIds,
		symptoms: symptomIds
	};
	console.log(request);
	makeRequest("POST", filterUrls.filter, request, function (data) {
		console.log(data);
		if (data.success) {
			if (data.categories) {
				loadCategories(data.categories);
			}
			if (data.illnesses) {
				loadIllnesses(data.illnesses);
			}
			if (data.symptoms) {
				loadSymptoms(data.symptoms);
			}
		}
	});
}