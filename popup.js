import { getCurrentTab } from "./utils.js";

const container = document.getElementsByClassName("container")[0];
let hints = null;
let tcAndsc = null;
let edgeCases = null;
const API_KEY = CONFIG.API_KEY;

document.addEventListener("DOMContentLoaded", async()=>{
    const activeTab = await getCurrentTab();

    if(activeTab.url.includes("leetcode.com/problems/")){
        renderHome();        
    }

    else{
        container.innerHTML = `<h4><i> This is not a leetcode problems page</i></h4>`
    }

});


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
    showLoading("Fetching hints!");
    if(hints){
        console.log("using precomputed hints");
        renderHints(hints);
        return;
    }
    chrome.storage.sync.get(
        ["questionData"],
        async (result) =>{
            const question = result.questionData;
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions",{
                method : "POST",

                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${API_KEY}`
                },
                body : JSON.stringify({
                model : "openai/gpt-oss-120b",
                response_format : {
                    type : "json_object"
                },
                    messages : [
                        {
                            role : "user",
                            content : `
                                    Your are a DSA mentor.
                                    For this leetcode problem : ${question.title},
                                    ${question.desc}
                                    Give 3 progressive hints that guide the user toward the solution WITHOUT giving away the answer. Start vague, get more specific. ONLY GIVE HINTS and nothing else
                                    The hints should not be too big one or two liners but they should be explanatory and it should develop the thought process of the user instead of spoon feeding the ans.
                                    Don't make any font bold or use any styles on it.
                                    Return ONLY valid JSON.
                                    Format : 
                                    {
                                        "hints" : [
                                            "hint 1",
                                            "hint 2",
                                            "hint 3"
                                        ]
                                    }
                                    `
                        }
                    ]
                })

            });
            const data = await response.json();
            console.log(data);

            if(!response.ok){
                renderError(data.error?.message || "Failed to fetch hints");
                return;
            }

            const text = data.choices[0].message.content;
            const parsed = JSON.parse(text);
            hints = parsed.hints;
            renderHints(hints);
        })
        
}

function onGetTcAndSc(){
    showLoading("Fetching time and space complexity");

    if(tcAndsc){
        console.log("using precomputed tc and sc");
        renderTcandSc(tcAndsc);
        return;
    }
    chrome.storage.sync.get(
        ["questionData"],
        async (result) =>{
            const question = result.questionData;
            const response = await fetch( "https://api.groq.com/openai/v1/chat/completions",{
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${API_KEY}`
                },
                body : JSON.stringify({
                    model : "openai/gpt-oss-120b",
                    response_format : {
                        type : "json_object"
                    },
                    messages : [
                        {
                            role : "user",
                            content : `
                            
                            Your are a DSA mentor.
                                    For this leetcode problem : ${question.title},
                                    ${question.desc}
                                    Give the expected time complexity and space complexity for the optimized solution of the give question
                                    Give the answer in this format -> Time complexity : and then give explanation mostly one line as to why it should be that and do the same for space complexity in the next line.
                                    Don't make any font bold or use any styles on it.
                                    Return ONLY valid JSON.
                                    Format : 
                                    {
                                        "tcandsc" : [
                                            "tc",
                                            "sc"
                                        ]
                                    }
                                    `
                        }
                    ]
                })

            })
            const data = await response.json();

            if(!response.ok){
                renderError(data.error?.message || "Failed to get expected time and space complexity");
                return;
            }
            const text = data.choices[0].message.content;
            const parsed = JSON.parse(text);
            tcAndsc = parsed.tcandsc;
            renderTcandSc(tcAndsc);
        })
        

}

function showLoading(text) {
    container.innerHTML = `
        <div class="loading-wrapper">
            <div class="spinner"></div>
            <p>${text}</p>
        </div>
    `;
}

function onGenerateTestcases(){
    
    showLoading("Generating test cases..");

    if(edgeCases){
        console.log("using precomputed tc and sc");
        renderTestcases(edgeCases);
        return;
    }
    chrome.storage.sync.get(
        ["questionData"],
        async (result) =>{
            const question = result.questionData;
            const response = await fetch( "https://api.groq.com/openai/v1/chat/completions",{
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${API_KEY}`
                },
                body : JSON.stringify({
                    model : "openai/gpt-oss-120b",
                    response_format : {
                        type : "json_object"
                    },
                    messages : [
                        {
                            role : "user",
                            content : `
                                    PROBLEM:
                                    Title: ${question.title}
                                    Description: ${question.desc}

                                    You are a competitive programming test case generator.

                                    Generate exactly 8 test cases for the given problem keeping constraints in mind.

                                    Rules:
                                    - Output ONLY valid JSON
                                    - No explanations
                                    - No markdown

                                    Ensure:
                                    - Cases are diverse
                                    - Include edge cases and stress cases
                                    - Cover boundary conditions and worst-case inputs

                                    Before finalizing, ensure that each test case targets a different bug class and no two cases are redundant.

                                    Return format:
                                    {
                                    "edgeCases": ["case1", "case2", "case3", "case4", "case5", "case6", "case7", "case8"]
                                    }
                                    `
                        }
                    ]
                })

            })
            const data = await response.json();

            if(!response.ok){
                renderError(data.error?.message || "Failed to get testcases, try again later");
                return;
            }
            const text = data.choices[0].message.content;
            const parsed = JSON.parse(text);
            edgeCases = Array.isArray(parsed.edgeCases) ? parsed.edgeCases : [];
            renderTestcases(edgeCases);
        })
        


}

function renderHome(){
    container.innerHTML = "";
    createAttributes("getHints",onGetHints,container,"Hints");
    createAttributes("getTcAndSc",onGetTcAndSc,container,"Expected space and time complexity");
    createAttributes("generateTestcases",onGenerateTestcases,container,"Generate testcases");
}

function renderHints(hints){
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

        container.innerHTML = `

        <button class="back-btn">
            ← Back
        </button>
        ${createCard("Time Complexity",tcsc[0])}
        ${createCard("Space Complexity",tcsc[1])}
    `;

    document.querySelector(".back-btn").addEventListener("click",renderHome);

}

function renderTestcases(edgeCases){
    console.log(edgeCases);

    container.innerHTML = `
        <button class="back-btn">
            ← Back
        </button>
        <div>
            ${edgeCases.map((testcase, index) =>
                    createCard(`Case ${index+1}`,testcase)
            ).join("")}
        </div>
    `

    container.querySelector(".back-btn").addEventListener("click",renderHome);
    
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