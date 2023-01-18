function readTextFile(file) {
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                
                // Removes all text of the balancetext div
                const resetText = document.getElementById("balance-text");
                while(resetText.lastElementChild){
                    resetText.removeChild(resetText.lastElementChild);
                }
                
                // Writes the new text of balancetext div
                let allText = rawFile.responseText;
                let lines = allText.split('\n');
                for (let line = 0; line < lines.length; line++) {
                    let paragraph;
                    if (line === 0 || line === 1) {
                        paragraph = document.createElement("h1");
                    }
                    else {
                        paragraph = document.createElement("p");
                    }

                    paragraph.textContent += `${lines[line]} \r\n`;
                    document.getElementById("balance-text").appendChild(paragraph);
                }
            }
        }
    }
    rawFile.send(null);
}

function loadShop(cycle) {
    document.getElementById("shop-cycle").setAttribute("src", `/ProjectWB/Shop/TierlistCycle${cycle}.png`)
}

function loadCycle(cycle){
    loadShop(cycle);
    readTextFile(`BalanceNotes/Cycle${cycle}.txt`);
    cycle != 7 ? document.getElementById("discounts").style.display = "none" : document.getElementById("discounts").style.display = "block";
}

function loadBalanceHistory(cycle){
    for (let count = 1; count <= cycle; count++)
    {
        let listItem;
        listItem = document.createElement("li");
        listItem.setAttribute("onclick", `loadCycle(${count})`);
        listItem.textContent = `Cycle ${count}`;
        document.getElementById("balance-list").appendChild(listItem);
    }
}

function loadBudget(cycle)
{

}

function openHistory(){
    let list = document.getElementById("balance-list");
    if (list.style.display === "block"){
        list.style.display = "none";
    }
    else{
        list.style.display = "block";
    }
}

function collapseNav() {
    let nav = document.getElementById("myNavBar");
    if (nav.className === "navBar") {
        nav.className += " responsive";
    } else {
        nav.className = "navBar";
    }
}
/*
let navbar = document.getElementById("myNavBar");
let sticky = navbar.offsetTop;
window.onscroll = function() {stickyNav()};

function stickyNav() {
    console.log(window.scrollY);
  if (window.scrollY >= sticky) {
    alert("smoll");
    navbar.classList.add("sticky");
  } else {
    alert("smoll");

    navbar.classList.remove("sticky");
  }
}*/