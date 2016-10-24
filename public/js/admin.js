/**
 * Created by Cam on 10/23/16.
 */


//make the .admin-only visible since this is the admin
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.admin-only { display: block; };';
document.getElementsByTagName('head')[0].appendChild(style);

// remove an illness from the database with a particular id
function removeIllness(id) {
	makeRequest("DELETE", urls.illness + id, null, function () {
		console.log("successful delete");
		getAll("ILLNESSES");
	});
}

// remove a symptom from the database with an id of:
function removeSymptom(id) {
	console.log("remove symptom with id: ", id);
	makeRequest("DELETE", urls.symptom + id, null, function () {
		console.log("successful delete");
		getAll("SYMPTOMS");
	});
}

//new category block
function createNewCategoryBlock() {
	if (categoryList.find('li.new').length < 1) {
		filterOn = false;
		resetCheckboxes();
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
		categoryList.find('.new').first().find('input').first().focus();
	} else {
		categoryList.find('li.new').remove();
	}
}

//new illness block
function createNewIllnessBlock() {
	if (illnessList.find('li.new').length < 1) {
		filterOn = false;
		resetCheckboxes();
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
		illnessList.find('.new').first().find('input').first().focus();
	} else {
		illnessList.find('li.new').remove();
		$('#category-list').find('div.check-div').hide();
		$('#symptom-list').find('div.check-div').hide();
	}
}

//new symptom block
function createNewSymptomBlock() {
	if (symptomList.find('li.new').length < 1) {
		filterOn = false;
		resetCheckboxes();
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
		symptomList.find('.new').first().find('input').first().focus();
	} else {
		symptomList.find('li.new').remove();
	}
}


// create a new symptom with a new symptom block
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
		makeRequest('POST', urls.symptom, symptom, function (data) {
			if (data.success) {
				cancelNew(newSympElem);
				getAll("SYMPTOMS");
			} else {
				alert("Server Problem! Contact Cameron");
			}

		});
	}
}

// create a new category with a new category block
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
		makeRequest('POST', urls.category, category, function (data) {
			if (data.success) {
				cancelNew(newCatElem);
				getAll("CATEGORIES");
			} else {
				alert("Server Problem! Contact Cameron");
			}

		});
	}
}

// create a new illness with a new illness block
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
			makeRequest('POST', urls.illness, illness, function (data) {
				if (data.success) {
					cancelNew(newIllElem);
					console.log("RELATE NOW");

					var relations = {
						illnessId: data.newId,
						symptomIds: symptomIds
					};

					console.log(relations);

					makeRequest('POST', urls.relation, relations, function (data) {
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

// cancel the creation of a new entity. Destroys each of the creation blocks and hides checkboxes
function cancelNew(cancelElem) {
	$('div.check-div').hide();
	console.log($(cancelElem));
	$(cancelElem).parent().parent().parent().remove();
}
