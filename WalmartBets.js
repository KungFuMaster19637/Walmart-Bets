//#region Loading Shop and Balance Notes ---------------------------------------------
function readTextFile(file) {
    let connection = new XMLHttpRequest();
    connection.open("GET", file, false);
    connection.onreadystatechange = function () {
        if (connection.readyState === 4) {
            if (connection.status === 200 || connection.status == 0) {

                // Removes all text of the balancetext div
                const resetText = document.getElementById("balance-text");
                while (resetText.lastElementChild) {
                    resetText.removeChild(resetText.lastElementChild);
                }

                // Writes the new text of balancetext div
                let allText = connection.responseText;
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
    connection.send(null);
}

function loadShop(cycle) {
    document.getElementById("shop-cycle").setAttribute("src", `/ProjectWB/Shop/TierlistCycle${cycle}.png`)
}

function loadCycle(cycle) {
    loadShop(cycle);
    readTextFile(`BalanceNotes/Cycle${cycle}.txt`);
    cycle != 7 ? document.getElementById("discounts").style.display = "none" : document.getElementById("discounts").style.display = "block";
}

function loadBalanceHistory(cycle) {
    for (let count = 1; count <= cycle; count++) {
        let listItem;
        listItem = document.createElement("li");
        listItem.setAttribute("onclick", `loadCycle(${count})`);
        listItem.textContent = `Cycle ${count}`;
        document.getElementById("balance-list").appendChild(listItem);
    }
}

function openHistory() {
    let list = document.getElementById("balance-list");
    if (list.style.display === "block") {
        list.style.display = "none";
    }
    else {
        list.style.display = "block";
    }
}
//#endregion

//#region Loading Nav ---------------------------------------------

function collapseNav() {
    let nav = document.getElementById("myNavBar");
    if (nav.className === "navBar") {
        nav.className += " responsive";
    } else {
        nav.className = "navBar";
    }
}

//#endregion

//#region Loading Leaderboard

function readFromExcel(excelFile) {
    let connection = new XMLHttpRequest();
    connection.open("GET", excelFile, true);
    connection.responseType = "blob";
    connection.onload = function () {
        let fullData = [];
        let file = this.response;
        let reader = new FileReader();

        //For browsers that arent IE
        reader.onload = function (e) {
            ProcessExcel(e.target.result);
        };

        reader.readAsBinaryString(file);

    };
    connection.send();
}
function ProcessExcel(data) {

    let workbook = XLSX.read(data, {
        type: "binary"
    });

    //Fetch the name of First Sheet.
    let firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    let excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    let fullData = [];

    for (let i = 0; i < excelRows.length; i++) {

        let leaderboardObject = { playerName: "", cycle: "", video: "", time: "", team1: "", team2: "" };
        leaderboardObject.playerName = excelRows[i].Player;
        leaderboardObject.cycle = excelRows[i].Cycle;
        leaderboardObject.video = excelRows[i].Video;
        leaderboardObject.time = excelRows[i].Time;
        leaderboardObject.team1 = `${excelRows[i].Character1}-${excelRows[i].Character2}-${excelRows[i].Character3}-${excelRows[i].Character4}`;
        leaderboardObject.team2 = `${excelRows[i].Character5}-${excelRows[i].Character6}-${excelRows[i].Character7}-${excelRows[i].Character8}`;
        fullData.push(leaderboardObject);
    }

    let buttonFormatter = function (cell, formatterParams, onRendered) {
        return "<i class='fa fa-youtube-play'></i>";
    };

    let imageFormatter = function (cell, formatterParams, onRendered, team) {

        let imageString = "";
        for (let i = 0; i < 4; i++) {
            imageString += `<img class = 'leaderboard-character-image' 
            src='${loadPictures(cell.getValue().split('-').map(item => item.trim())[i])}'
            >`;
        }
        return imageString;
    };

    let currentCycleDir = "desc";

    let sortWithFixedCycle = function(e, column) {
        let dir = "desc";
        table.getSorters().forEach(function(sort){
            if (column.getField() === sort.column.getField())
            {
                dir = sort.dir;
            }
        });

        table.setSort([
            {column: column, dir: dir},
            {column:"cycle", dir: currentCycleDir },
        ])
    }

    let changeCycleDir = function(e, column) {
        currentCycleDir = table.getSorters()[0].dir;
    }

    let table = new Tabulator("#leaderboard-table", {
        layout: "fitColumns",
        rowHeight: 80,
        responsiveLayout: "hide",
        autoResize: true,

        initialSort:[
            {column:"time", dir:"asc"},
            {column:"cycle", dir: currentCycleDir},
        ],

        groupBy: ["cycle"],
        groupHeader: function(value, count){
            return "Cycle " + value + "<span style='color:#2196c4'; margin-left:10px;'>("+  + count + " runs)</span>";
        },

        columnDefaults: {
            resizable: false,
            vertAlign: "middle",
            hozAlign: "center",
            headerHozAlign: "center",
            headerSort: false
        },
        columns: [
            { title: "Total Time", field: "time", headerClick: sortWithFixedCycle, headerSort: true },
            { title: "Cycle", field: "cycle", headerClick: changeCycleDir, headerSort: true },
            { title: "Name", field: "playerName", headerClick: sortWithFixedCycle, headerSort: true, formatter: "textarea" },
            { title: "Video", field: "video",
                formatter: buttonFormatter, cellClick: function (e, cell) {
                    let Btn = document.createElement('Button');
                    Btn.id = "video-link-button";
                    if (cell.getValue() === "No Link") {
                        Btn.onclick = alert("This video is not available anymore :( ");
                    }
                    else{
                        Btn.onclick = window.open(cell.getValue());
                    }
                }
            },
            { title: "Team 1", field: "team1", widthGrow: 2, formatter: imageFormatter },
            { title: "Team 2", field: "team2", widthGrow: 2, formatter: imageFormatter},
        ],
        data: fullData,
    });
    
    table.on("tableBuilt", () => {
        table.setPage(2);
    });

}

function loadPictures(imageName) {
    let fullLink = "/ProjectWB/Images/Characters/" + imageName + ".png"
    return fullLink;
}

//#endregion



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