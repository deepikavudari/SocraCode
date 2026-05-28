// chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{
//     if(tab.url && tab.url.includes("leetcode.com/problems")){
//             console.log("background");
//             chrome.tabs.sendMessage(tabId,{
//                 type : "NEW"
//             });
        
//     }
// })