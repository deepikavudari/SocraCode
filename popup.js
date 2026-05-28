import { getCurrentTab } from "./utils.js";


const container = document.getElementsByClassName("container")[0];
let hints = null;
let tcAndsc = null;

document.addEventListener("DOMContentLoaded", async()=>{
    const activeTab = await getCurrentTab();

    if(activeTab.url.includes("leetcode.com/problems/")){
        renderHome();        
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
    if(hints){
        console.log("using precomputed hints");
        renderHints(hints);
        return;
    }
    chrome.storage.sync.get(
        ["questionData"],
        async (result) =>{
            const question = result.questionData;
            const API_KEY = "AIzaSyC6RWwCyXNlV_ne3JhY8Ei9-brnaURmo0M";
            const response = await fetch( `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`,{
                method : "POST",

                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    contents : [
                        {
                            parts : [
                                {
                                    text : `
                                    Your are a DSA mentor.
                                    For this leetcode problem : ${question.title},
                                    ${question.desc}
                                    Give 3 progressive hints that guide the user toward the solution WITHOUT giving away the answer. Start vague, get more specific. ONLY GIVE HINTS and nothing else
                                    The hints should not be too big one or two liners but they should be explanatory and it should develop the thought process of the user instead of spoon feeding the ans.
                                    Don't make any font bold or use any styles on it.
                                    `
                                }
                            ]
                        }
                    ]
                })

            })
            const data = await response.json();
            console.log(data);

            if(!response.ok){
                renderError(data.error?.message || "Failed to fetch hints");
                return;
            }

            const rawHints = data.candidates[0].content.parts[0].text;
            hints = rawHints.split(/Hint \d:/).filter(hint => hint.trim() !== "");
            renderHints(hints);
        })
        
}

function onGetTcAndSc(){
    console.log("clicked get tc and sc");

    if(tcAndsc){
        console.log("using precomputed tc and sc");
        renderTcandSc(tcAndsc);
        return;
    }
    chrome.storage.sync.get(
        ["questionData"],
        async (result) =>{
            const question = result.questionData;
            const API_KEY = "AIzaSyC6RWwCyXNlV_ne3JhY8Ei9-brnaURmo0M";
            const response = await fetch( `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`,{
                method : "POST",

                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    contents : [
                        {
                            parts : [
                                {
                                    text : `
                                    Your are a DSA mentor.
                                    For this leetcode problem : ${question.title},
                                    ${question.desc}
                                    Give the expected time complexity and space complexity for the optimized solution of the give question
                                    Give the answer in this format -> Time complexity : and then give explanation mostly one line as to why it should be that and do the same for space complexity in the next line.
                                    Don't make any font bold or use any styles on it.
                                    `
                                }
                            ]
                        }
                    ]
                })

            })
            const data = await response.json();

            if(!response.ok){
                renderError(data.error?.message || "Failed to expected time and space complexity");
                return;
            }

            tcAndsc = data.candidates[0].content.parts[0].text;
            renderTcandSc(tcAndsc);
        })
        

}

function onGenerateTestcases(){
    console.log("clicked generate testcases");
}

function renderHome(){
    container.innerHTML = "";
    createAttributes("getHints",onGetHints,container,"Hints");
    createAttributes("getTcAndSc",onGetTcAndSc,container,"Expected space and time complexity");
    createAttributes("generateTestcases",onGenerateTestcases,container,"Generate testcases");
}

function renderHints(hints){
    if(hints===null){
        container.innerHTML = `
            <div class="screen-title">
                Some error occured, try again later!
            </div>
        `;
        return;
    }
    container.innerHTML = `

        <button class="back-btn">
            ← Back
        </button>

        <div class="screen-title">
            Progressive Hints
        </div>

        <div class="hints-wrapper">

            ${hints.map((hint, index) =>
                createCard(`Hint ${index+1}`,hint)
            ).join("")}

        </div>
    `;

    document.querySelector(".back-btn").addEventListener("click",renderHome);
}

function renderTcandSc(tcsc){
    console.log(tcsc);
    const tc = tcsc.match(/Time complexity\s*:\s*(.*)/i)?.[1];
    const sc = tcsc.match(/Space complexity\s*:\s*(.*)/i)?.[1];

        container.innerHTML = `

        <button class="back-btn">
            ← Back
        </button>
        ${createCard("Time Complexity",tc)}
        ${createCard("Space Complexity",sc)}
    `;

    document.querySelector(".back-btn").addEventListener("click",renderHome);

}

function createCard(title,content){
    return `
    <div class="card">
        <div class="card-pill">
            ${title}
        </div>
        <div class="card-content">
            ${content}
        </div>
    </div>
    `
}

function renderError(message){
    container.innerHTML = `
    <div class="error-card">
        <div class="screen-title">
            Something went wrong
        </div>
        <p class="error-text">
            ${message}
        </p>
        <button class="back-btn">
            ← Back
        </button>
    </div>
    `;

    document.querySelector(".back-btn").addEventListener("click",renderHome);

}