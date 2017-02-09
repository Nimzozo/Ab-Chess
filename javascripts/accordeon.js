window.addEventListener("load", function () {
    "use strict";

    var activeHeaderClassName = "list__header_active";
    var activeListClassName = "sub-list_active";
    var activeHeader = document.getElementsByClassName(activeHeaderClassName)[0];
    var activeList = document.getElementsByClassName(activeListClassName)[0];
    var defaultHeaderClassName = "list__header";
    var defaultListClassName = "sub-list";
    var itemClassName = "example-link";
    var items = document.getElementsByClassName(itemClassName);
    var lists = document.getElementsByClassName(defaultListClassName);
    var selectedItemClassName = "example-link_selected";

    function changeHeight(element, step, limit) {
        var clientHeight = element.clientHeight;
        var newHeight = clientHeight + step;
        var strHeight = newHeight + "px";
        element.style.height = strHeight;
        if ((step > 0 && newHeight < limit) ||
            (step < 0 && newHeight > limit)) {
            requestAnimationFrame(function () {
                changeHeight(element, step, limit);
            });
        } else if (limit === 0) {
            element.style.display = "none";
        }
    }

    function getItemsFromList(list) {
        var arrayChildren = [];
        var children = list.children;
        Object.keys(children).forEach(function (key) {
            var child = children[key];
            if (child.tagName === "LI") {
                arrayChildren.push(child);
            }
        });
        return arrayChildren;
    }

    function closeList(header, list) {
        var listItems = getItemsFromList(list);
        listItems.forEach(function (item) {
            item.style.display = "block";
            changeHeight(item, -4, 0);
        });
        header.className = defaultHeaderClassName;
        list.className = defaultListClassName;
        activeList = undefined;
    }

    function openList(header, list) {
        var listItems = getItemsFromList(list);
        header.className = activeHeaderClassName;
        list.className = activeListClassName;
        listItems.forEach(function (item) {
            item.style.height = 0;
            item.style.display = "block";
            changeHeight(item, 4, 36);
        });
        if (activeList !== undefined) {
            closeList(activeHeader, activeList);
        }
        activeHeader = header;
        activeList = list;
    }

    function selectItem(item) {
        var selectedLink = document.getElementsByClassName(selectedItemClassName);
        if (selectedLink.length > 0) {
            selectedLink[0].className = itemClassName;
        }
        item.className = selectedItemClassName;
    }

    Object.keys(lists).forEach(function (key) {
        var list = lists[key];
        var listHeader = list.firstElementChild;
        listHeader.addEventListener("click", function () {
            if (list === activeList) {
                closeList(listHeader, list);
            } else {
                openList(listHeader, list);
            }
        });
    });

    Object.keys(items).forEach(function (key) {
        var item = items[key];
        if (key.search(/^\d+$/) !== -1) {
            item.addEventListener("click", function () {
                selectItem(item);
            });
        }
    });

});

