var listsArr = [];

document.addEventListener("DOMContentLoaded", openIndexedDB, false);

/*
*  Function reads TODO Lists from the DB
*/
function init() {
	data_context.get_lists(function (result) {
			listsArr = result;
			createToDoList(listsArr);
		});
}

/*
*  Function creates dropdown of ToDo Lists
*/
function createToDoList (listsArr) {
	var select = document.querySelector('select[name="all-todo-lists"]'),
		i;

	for (i = 0; i < listsArr.length; i++ ) {
		var key = listsArr[i],
			option = document.createElement('option');
		option.innerHTML = key
						.split('_')
						.join(' ');
		option.value = key;
		select.appendChild(option);
	}
}

/*
*  Function addes one more ToDo List to dropdown and LocalStorage (or IndexedDB)
*/
function newList() {
	var listName = document.querySelector('input[name="add-todo-list"]').value,
		listNameValue = listName
						.split(' ')
						.join('_'),
		i;
	listName = listName.trim();

	if (listName) {
		for (i = 0; i < listsArr.length; i++ ) {
			// If new title of ToDo list already exist,
			if(listsArr[i] == listNameValue) {
			// ignore it
				document.querySelector('input[name="add-todo-list"]').value = '';
				return false;
			}
		}

		// Add one more option to dropdown
		var select = document.querySelector('select[name="all-todo-lists"]'),
			option = document.createElement('option');
		option.innerHTML = listName;
		option.value = listNameValue;
		select.appendChild(option);

		// Add new key to LocalStorage (IndexedDB)
		data_context.add_list(listNameValue);
		listsArr.push(listNameValue);
		document.querySelector('input[name="add-todo-list"]').value = '';
	} else {
		document.querySelector('input[name="add-todo-list"]').value = '';
		return false;
	}
}

/*
*  Function shows the items (if exist) of selected List
*/
function showSelectedList() {
	var select = document.querySelector('select[name="all-todo-lists"]').value,
		title = document.querySelector('h1'),
		itemTo = document.getElementById('added-item'),
		children = itemTo.children,
		i;

	title.innerHTML = select
					.split('_')
					.join(' ');
	document.getElementById("to-do-form-box").style.display = "block";

	// Remove items of previous list
	if (children.length) {
		for (i = children.length-1; i >= 0; i--) {
			children[i].remove();
		}
	}

	// If "Select List" option is selected, hide all items
	if(select == 'select') {
		document.getElementById("to-do-form-box").style.display = "none";
		return false;
	} else {
		data_context.get_list_by_name(select, function (result) {
			var dataItem = [];
			dataItem = result;
			//Show Items
			drawItems(dataItem);
		});
	}
}

/*
*  If selected in dropdown option (List) has Items - show them
*/
function drawItems(dataItem) {
	var itemTo = document.getElementById('added-item'),
		i;
	if(dataItem) {
		for (i = 0; i < dataItem.length; i++) {
			var newItem = document.createElement('p');
			if (dataItem[i].isChecked == true) {
				// draw checked checkbox (complited task)
				newItem.innerHTML = '<input type="checkbox" name="complited" onchange="done(this)" checked /><span style="text-decoration: line-through">' + dataItem[i].description + '</span><a id="' + dataItem[i].itemId + '" class="btn delete-item" onclick="deleteItem(this)">-</a>';
			} else if (dataItem[i].isChecked == false) {
				// draw unchecked checkbox (uncomplited task)
				newItem.innerHTML = '<input type="checkbox" name="complited" onchange="done(this)" /><span>' + dataItem[i].description + '</span><a id="' + dataItem[i].itemId + '" class="btn delete-item" onclick="deleteItem(this)">-</a>';
			}
			itemTo.appendChild(newItem);
		}
	} else {
		return false;
	}
}

/*
*  Function adds new Item to 'ToDo List' and LocalStorage (IndexedDB)
*/
function addItem() {
	var select = document.querySelector('select[name="all-todo-lists"]').value,
    	item = document.querySelector('input[name="add-item"]'),
		itemValue = item.value;
	itemValue = itemValue.trim();
    if (itemValue) {
		var itemTo = document.getElementById('added-item'),
	    	newItem = document.createElement('p'),
	    	uuid = guid(),
        	new_todo_item = new Todo(),
        	dataItem = [];

        new_todo_item.description = itemValue;
        new_todo_item.isChecked = false;
        new_todo_item.itemId = uuid;

		// Read TODO Lists from the Localstorage (IndexedDB)
        data_context.get_list_by_name(select, function (result) {
			dataItem = result;

			if (dataItem) {
				// Add new Item
				dataItem.push(new_todo_item);
				data_context.add_todo(select, dataItem);
			} else {
				dataItem = [];
				dataItem.push(new_todo_item);
				// Add new Item
				data_context.add_todo(select, dataItem);
			}
		});

		// Add new Item to the List of Items (UI)
        newItem.innerHTML = '<input type="checkbox" name="complited" onchange="done(this)" /><span>' + itemValue + '</span><a id="' + new_todo_item.itemId + '"class="btn delete-item" onclick="deleteItem(this)">-</a>';
        itemTo.appendChild(newItem);
    } else {
    	item.value = '';
		return false;
    }
    item.value = '';
}

/*
*  Function deletes particular Item from 'ToDo List' and LocalStorage (IndexedDB)
*/
function deleteItem(el) {
	var select = document.querySelector('select[name="all-todo-lists"]').value,
		id = el.id,
		dataItemArr = [],
		dataItem = [],
		i;

		data_context.get_list_by_name(select, function (result) {
			dataItem = result;

			for (i = 0; i < dataItem.length; i++) {

				// Add all items to Array except сurrent
				if (dataItem[i].itemId != id) {
					dataItemArr.push(dataItem[i]);
				} else {
					continue;
				}
			}

			// Add new Array to LocalStorage (IndexedDB)
			data_context.add_todo(select, dataItemArr);
		});
	el.parentNode.remove();
}

/*
*  Function deletes particular Item from 'ToDo List' and LocalStorage (IndexedDB)
*/
function done(el) {
	var select = document.querySelector('select[name="all-todo-lists"]').value;
		dataItem = [];

		data_context.get_list_by_name(select, function (result) {
			dataItem = result;
			drawComplitedItem(dataItem, el);
		});
}

function drawComplitedItem(dataItem, el) {
	var select = document.querySelector('select[name="all-todo-lists"]').value;
		id = el.nextSibling.nextSibling.id;
		i;

	for (var i = 0; i < dataItem.length; i++) {
		if (dataItem[i].itemId == id) {
			if(el.checked) {
				dataItem[i].isChecked = true;
				el.nextSibling.style.textDecoration = 'line-through';
			} else {
				el.nextSibling.style.textDecoration = 'none';
				dataItem[i].isChecked = false;
			}
		}
	}
	data_context.add_todo(select, dataItem);
}

/*
*  GUID
*/
function guid() {
    function s4() {
    	return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
}
