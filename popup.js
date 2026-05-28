import { getCurrentTab } from "./utils.js";


const container = document.getElementsByClassName("container")[0];

document.addEventListener("DOMContentLoaded", async()=>{
    const activeTab = await getCurrentTab();

    if(activeTab.url.includes("leetcode.com/problems/")){

        container.innerHTML = "";
        createAttributes("getHints",onGetHints,container,"Hints");
        createAttributes("getTcAndSc",onGetTcAndSc,container,"Expected space and time complexity");
        createAttributes("generateTestcases",onGenerateTestcases,container,"Generate testcases");
    }

    else{
        container.innerHTML = `<h4><i> This is not a leetcode problems page</i></h4>`
    }

})


function createAttributes(src, eventListener, controlParentElement, text){
    const card = document.createElement("div");
    const controlElement = document.createElement("img");
    const para = document.createElement("p");

    para.innerHTML = `${text}`;
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;

    card.addEventListener("click", eventListener);

    card.classList.add("control-card");
    controlElement.classList.add("control-img");
    para.classList.add("control-text");

    card.appendChild(controlElement);
    card.appendChild(para)
    controlParentElement.appendChild(card);
}

async function onGetHints(){
    console.log("clicked get hints");
    // const API_KEY = "AIzaSyC6RWwCyXNlV_ne3JhY8Ei9-brnaURmo0M";
    // const response = await fetch( `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,{
    //     method : "POST",

    // })
    chrome.storage.sync.get(
        ["questionData"],
        (result) =>{
            console.log(result.questionData);
        }
    )
}

function onGetTcAndSc(){
    console.log("clicked get tc and sc");
}

function onGenerateTestcases(){
    console.log("clicked generate testcases");
}

