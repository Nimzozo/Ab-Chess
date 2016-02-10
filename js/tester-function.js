function tester(test, description, idList) {
    "use strict";

    idList = idList || 'testList';
    var color = "";
    var index = 0;
    var li = document.createElement("li");
    var list = document.getElementById(idList);
    var result = "";

    index = list.childElementCount + 1;
    if (test) {
        color = "green";

    } else {
        color = "red";
        description = "<s>" + description + "</s>";
    }
    li.style.margin = "8px";
    li.style.padding = "2px";
    li.style.color = color;
    result = "<b>[" + index + "] </b>" + description;
    li.innerHTML = result;
    list.appendChild(li);
}
