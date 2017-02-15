window.addEventListener("load", function () {
    "use strict";

    var accordeon = {
        "items": [
            {
                "name": "Basics",
                "items": [
                    {
                        "name": "Default options",
                        "href": "examples/basics/default.html"
                    },
                    {
                        "name": "Visual changes",
                        "href": "examples/basics/visual.html"
                    },
                    {
                        "name": "Locked pieces",
                        "href": "examples/basics/locked.html"
                    },
                    {
                        "name": "Orientation",
                        "href": "examples/basics/orientation.html"
                    },
                    {
                        "name": "Squares highlighting",
                        "href": "examples/basics/highlighting.html"
                    }
                ]
            },
            {
                "name": "Methods",
                "items": [
                    {
                        "name": "Flip",
                        "href": "examples/methods/flip.html"
                    },
                    {
                        "name": "Play",
                        "href": "examples/methods/play.html"
                    },
                    {
                        "name": "Set FEN",
                        "href": "examples/methods/set-fen.html"
                    },
                    {
                        "name": "Get FEN",
                        "href": "examples/methods/get-fen.html"
                    },
                    {
                        "name": "Get active color",
                        "href": "examples/methods/get-active-color.html"
                    }
                ]
            },
            {
                "name": "Advanced",
                "items": [
                    {
                        "name": "Random moves",
                        "href": "examples/advanced/random-moves.html"
                    }
                ]
            }
        ]
    };
    var css = {
        activeHeader: "list__header_active",
        activeSubList: "sub-list_active",
        header: "list__header",
        item: "list__item",
        link: "example-link",
        list: "list",
        selectedItem: "sub-list__item_selected",
        selectedLink: "example-link_selected",
        subItem: "sub-list__item",
        subList: "sub-list"
    };
    var activeHeader = document.getElementsByClassName(css.activeHeader)[0];
    var activeSubList = document.getElementsByClassName(css.activeSubList)[0];
    var links = document.getElementsByClassName(css.link);
    var lists = document.getElementsByClassName(css.list);
    var navigation = document.getElementById("navigation_fixed");
    var subLists = document.getElementsByClassName(css.subList);

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

    function getAccordeon() {
        var list = document.createElement("UL");
        list.className = css.list;
        accordeon.items.forEach(function (item) {
            var header = document.createElement("H4");
            var htmlItem = document.createElement("LI");
            var subList = document.createElement("UL");
            htmlItem.className = css.item;
            subList.className = css.subList;
            header.innerHTML = item.name;
            header.className = css.header;
            htmlItem.appendChild(header);
            item.items.forEach(function (subItem) {
                var htmlSubItem = document.createElement("LI");
                var link = document.createElement("A");
                htmlSubItem.className = css.subItem;
                link.innerHTML = subItem.name;
                link.href = subItem.href;
                link.className = css.link;
                htmlSubItem.appendChild(link);
                subList.appendChild(htmlSubItem);
            });
            htmlItem.appendChild(subList);
            list.appendChild(htmlItem);
        });
        return list;
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
        header.className = css.header;
        list.className = css.subList;
        activeSubList = undefined;
    }

    function openList(header, list) {
        var listItems = getItemsFromList(list);
        header.className = css.activeHeader;
        list.className = css.activeSubList;
        listItems.forEach(function (item) {
            item.style.height = 0;
            item.style.display = "block";
            changeHeight(item, 4, 36);
        });
        if (activeSubList !== undefined) {
            closeList(activeHeader, activeSubList);
        }
        activeHeader = header;
        activeSubList = list;
    }

    function selectByIndex(listIndex, itemIndex) {
        var header = {};
        var item = {};
        var link = {};
        var subList = subLists[listIndex];
        header = subLists[listIndex].parentElement.firstElementChild;
        item = getItemsFromList(subList)[itemIndex];
        link = item.children[0];
        requestAnimationFrame(function () {
            openList(header, subList);
            selectLink(link);
        });
    }

    function selectLink(link) {
        var selectedLink = document.getElementsByClassName(css.selectedLink);
        if (selectedLink.length > 0) {
            selectedLink[0].className = css.link;
        }
        link.className = css.selectedLink;
    }

    navigation.appendChild(getAccordeon());

    Object.keys(subLists).forEach(function (key) {
        var subList = subLists[key];
        var parent = subList.parentElement;
        var listHeader = parent.firstElementChild;
        listHeader.addEventListener("click", function () {
            if (subList === activeSubList) {
                closeList(listHeader, subList);
            } else {
                openList(listHeader, subList);
            }
        });
    });

    Object.keys(links).forEach(function (key) {
        var link = links[key];
        if (key.search(/^\d+$/) !== -1) {
            link.addEventListener("click", function () {
                selectLink(link);
            });
        }
    });

    window.selectByIndex = selectByIndex;
});

