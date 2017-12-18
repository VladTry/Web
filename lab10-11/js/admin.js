var i = 0;

function isOnline() {
    return window.navigator.onLine;
}

function AddNews() {
    if (($('#longdescription').val()==="") || ($('#shortdescription').val()==="") || ($('#namearticle').val()==="")) {
        alert('Заповніть всі дані');
        return false;
    }

    if (isOnline()) {
        alert('Новину успішно додано');
        
    }
    else {
        if (useLocalStorage){
            i++;
            var list = [];
            list.push({
                "name": $('#namearticle').val(),
                "shortdescription": $('#shortdescription').val(),
                "longdescription": $('#longdescription').val()
            });
            localStorage.setItem(i, JSON.stringify(list));
        }
        else {
            var transaction = db.transaction(["news"], "readwrite");
            var store = transaction.objectStore("news");
            var news1 = {
                name: $('#namearticle').val(),
                shortdescription: $('#shortdescription').val(),
                longdescription: $('#longdescription').val()
            };
            store.add(news1);
        }
    }
    $('#longdescription').val('');
    $('#shortdescription').val('');
    $('#namearticle').val('');
}
