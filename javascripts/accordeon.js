window.addEventListener("load", function () {
    "use strict";

    var activeHeaderClassName = "list__header_active";
    var activeListClassName = "sub-list_active";
    var activeHeader = document.getElementsByClassName(activeHeaderClassName)[0];
    var activeList = document.getElementsByClassName(activeListClassName)[0];
    var defaultHeaderClassName = "list__header";
    var defaultListClassName = "sub-list";
    var lists = document.getElementsByClassName(defaultListClassName);

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
        var items = getItemsFromList(list);
        items.forEach(function (item) {
            item.style.display = "block";
            changeHeight(item, -4, 0);
        });
        header.className = defaultHeaderClassName;
        list.className = defaultListClassName;
        activeList = undefined;
    }

    function openList(header, list) {
        var items = getItemsFromList(list);
        header.className = activeHeaderClassName;
        list.className = activeListClassName;
        items.forEach(function (item) {
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

});

