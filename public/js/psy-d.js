categoryUrls = {
	newCategory: "/category/",
	allCategory: "/category/",
	byIdSymptom: ""
};
illnessUrls = {
	newIllness: "/illness/",
	allIllness: "/illness/",
	byIdIllness: ""
};
symptomUrls = {
	newSymptom: "/symptom/",
	allSymptoms: "/symptom/",
	byIdSymptom: ""
};

relationUrls = {
	newIllnessSymptoms: "relations/createIllnessSymptomRelations"
};

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
				for (var i = 0; i < data.categories.length; i++) {
					var obj = data.categories[i];
					createCategoryBlock(obj.category.id, obj.category.name);
				}
			}
			reloadHandlers();

		});
	}
	if (type === "ILLNESSES" || type === "") {
		makeRequest("GET", illnessUrls.allIllness, null, function (data) {
			if (data.success) {
				illnessList.find('ul').empty();
				illnesses = data.illnesses;
				for (var i = 0; i < data.illnesses.length; i++) {
					var obj = data.illnesses[i];
					createIllnessBlock(obj.illness.id, obj.illness.name, obj.illness.code);
				}
			}
			reloadHandlers();
		});
	}
	if (type === "SYMPTOMS" || type === "") {
		makeRequest("GET", symptomUrls.allSymptoms, null, function (data) {
			if (data.success) {
				symptomList.find('ul').empty();
				symptoms = data.symptoms;
				for (var i = 0; i < data.symptoms.length; i++) {
					var obj = data.symptoms[i];
					createSymptomBlock(obj.symptom.id, obj.symptom.name);
				}
			}
			reloadHandlers();
		});
	}

}


function reloadHandlers() {
	$('div.check-div').hide();

	// $('div.psy-list ul li').off().click(function () {
	// 	var checkbox = $(this).children('div.check-div').children('input[type="checkbox"]');
	// 	if (!checkbox.is(':hidden')) {
	//
	//
	// 		if (!checkbox.prop("checked")) {
	// 			checkbox.prop("checked", true);
	// 			console.log("NOW");
	//
	//
	// 			if (filterOn) {
	// 				var id = $(this).attr('id');
	// 				if (id.includes("cat")) {
	// 					console.log("category box");
	// 				} else if (id.includes("ill")) {
	// 					console.log("illness box");
	// 				} else if (id.includes("symp")) {
	// 					console.log("symptom box");
	// 				}
	// 			}
	//
	//
	// 		} else {
	// 			checkbox.prop("checked", false);
	// 		}
	// 	}
	// });


	$('div.check-div input[type="checkbox"]').off().click(function () {
		console.log("CLICK");
		if ($(this).prop("checked") && filterOn) {
			var id = $(this).attr('id');
			if (id.includes("cat")) {
				console.log("category box");
			} else if (id.includes("ill")) {
				console.log("illness box");
			} else if (id.includes("symp")) {
				console.log("symptom box");
			}

		}
	})

}


$('div.container-title-options span.glyphicon-search').click(function () {
	var searchBar = $(this).parent().siblings('form.search-bar');

	searchBar.slideToggle();
	searchBar.find('input').focus();
});

$('div.container-title-options span.glyphicon-filter').click(function () {
	//to turn off
	if ($(this).hasClass("state-ON")) {
		$(this).removeClass("state-ON");
		$(this).addClass("state-OFF");
		$('div.check-div').hide();
		filterOn = false;
		getAll();
	} else {//to turn on
		$('div.container-title-options span.glyphicon-filter').addClass("state-OFF").removeClass("state-ON");
		$(this).removeClass("state-OFF");
		$(this).addClass("state-ON");
		$('div.check-div').hide();
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
					getAll("ILLNESSES");
					console.log("RELATE NOW");

					var relations = {
						illnessId: data.newId,
						symptomIds: symptomIds
					};

					console.log(relations);

					makeRequest('POST', relationUrls.newIllnessSymptoms, relations, function (data) {
						if (data.success) {
							console.log("ITS GOOD");
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
	$.ajax({
		method: method,
		url: url,
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify(data),
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
		createCategoryBlock(id, name);
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
		createIllnessBlock(id, name, code);
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
		createSymptomBlock(id, name);
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


function createCategoryBlock(id, name) {
	categoryList.find('ul').prepend("" +
		"<li class='category-data well' data-category-id='" + id + "'>" +
		"<div class='check-div'><input type='checkbox' id='cat-" + id + "'/>" +
		"<label for='cat-" + id + "'><span></span></label></div>" +
		"<div class='info-div'><h4>" + name + "</h4></div>" +
		"</li>");
}

function createIllnessBlock(id, name, code) {
	illnessList.find('ul').prepend("" +
		"<li class='illness-data well' data-illness-id='" + id + "'>" +
		"<div class='check-div'><input type='checkbox' id='ill-" + id + "'/> <label for='ill-" + id + "'><span></span></label></div>" +
		"<div class='info-div'><h4>" + name + "</h4>" +
		"<span><b>ID: </b>" + id + ", </span>&nbsp;" +
		"<span><b>Code: </b>" + code + "</span>" +
		"</div>" +
		"</li>");
}

function createSymptomBlock(id, name) {
	symptomList.find('ul').prepend("" +
		"<li class='symptom-data well' data-symptom-id='" + id + "'>" +
		"<div class='check-div'><input type='checkbox' id='symp-" + id + "'/> <label for='symp-" + id + "'><span></span></label></div>" +
		"<div class='info-div'><h4>" + name + "</h4>" +
		"<span><b>ID: </b>" + id + "</span>" +
		"</div>" +
		"</li>");
}