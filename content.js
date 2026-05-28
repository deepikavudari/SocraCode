(()=>{

    console.log("content script loaded");

    onPageChange();
    observeUrlChange();

    async function onPageChange(){
        await waitForElement('.text-title-large a');

        const questionData = getQuestionData();
        chrome.storage.sync.set({
            questionData
        });
    }

    function getQuestionData(){
        const title =
        document.querySelector(
            '.text-title-large a'
        )?.innerText;


        // contains description, examples and constraints along with follow ups
        const desc = document.querySelector('[data-track-load="description_content"]')?.innerText;

        return {
            title,
            desc
        };

    }

    function waitForElement(selector){
        return new Promise((resolve)=>{
            const interval = setInterval(()=>{
                const element = document.querySelector(selector);
                if(element){
                    clearInterval(interval);
                    resolve(element);
                }
            },300);
        });
    }

    function observeUrlChange(){
        let oldHref = location.href;
        const body = document.querySelector("body");
        const observer = new MutationObserver(async()=>{
            if(oldHref!=location.href){
                oldHref = location.href;
                await onPageChange();
            }
        });
        observer.observe(body,{
            childList : true,
            subtree : true
        });
    }


})();