const ScrollManager = {
    ScrollInterval: null
};

class Utils {
    static generateRandomString(length = 10) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    }

    static normalizeData(obj, keyMap) {
        for (const oldKey in keyMap) {
            if (obj.hasOwnProperty(oldKey)) {
                const newKey = keyMap[oldKey];
                if(newKey != oldKey){
                    obj[newKey] = obj[oldKey];
                    delete obj[oldKey];
                }
            }
        }
    }

    //JSON.parse will not handle functions so use custom deep clone function 
    static deepCloneWithFunctions(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepCloneWithFunctions(item));
        if (typeof obj === 'function') return obj; // Keep functions as-is

        const cloned = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepCloneWithFunctions(obj[key]);
            }
        }
        return cloned;
    }
}

class AutoSuggestion {
    constructor() {
        this.version = '1.0.0.1';
        this.requestAnimationFrameId = null;
    }

    normalizeData(obj) {
        const keyMap = {
            ItId: 'inputId',
            TeMnLr: 'typeMinLetter',
            URL: 'url',
            SeAy: 'suggestionData',
            UrlAt: 'urlParams', // url argument -> url params
            ClBkFn: 'callbackFunction',

            ShCy: 'showCategory',
            WidthMin: 'widthMin',

            SnLtHTML: 'suggestionListHTML',
            SnLtCyHTML: 'suggestionListCategoryHTML',

            SnLtCnCs: 'suggestionListCaptionClass',
            SnLtCyCs: 'suggestionListCategoryClass',
            SnLtDnCs: 'suggestionListDescriptionClass',
            SnLtCnTt: 'suggestionListContentText',
            SnLtCyTt: 'suggestionListCategoryText',
            SnLtCnTt: 'suggestionListCaptionText',
            SnLtDnTt: 'suggestionListDescriptionText',
            SnLtInCs: 'suggestionListIconClass',

            SnItId: 'suggestionInputId',
            SnItTt: 'suggestionInputText',
        };

        Utils.normalizeData(obj, keyMap);
    }

    setDefaultValues(obj) {
        obj.widthMin = obj.widthMin || 'WhMn40p';
        obj.showCategory = obj.showCategory || false;
        obj.suggestionListCaptionClass = obj.suggestionListCaptionClass || "FtSe18 FtWt600";
        obj.suggestionListCategoryClass = obj.suggestionListCategoryClass || "FtSe18 FtWt600 HrCrTe CrBdTe BrBm1 CrBrTe20Lt50 BrRs2 Pg10";
        obj.suggestionListDescriptionClass = obj.suggestionListDescriptionClass || "FtSe12";
    }

    addSuggestion(obj) {
        this.normalizeData(obj);

        if (!obj.inputId) {
            console.error('Error: input id is not provided');
            return;
        }

        this.setDefaultValues(obj);

        let inputElement = document.getElementById(obj.inputId);

        inputElement?.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {  // Instead of e.which === 9 - it is depricated
                this.suggestionClose(obj);
            }
        });

        inputElement?.addEventListener('keyup', (e) => {
            e.preventDefault();
            this.suggestionKeyPress(obj, inputElement.value, e.key);
        });
    }

    suggestionKeyPress(obj, inputValue, keyCode) {
        switch (keyCode) {
            case 'ArrowUp':
                this.suggestionNavigate(obj.inputId + "_0");
                break;
            case 'ArrowDown':
                this.suggestionNavigate(obj.inputId + "_0");
                break;
            case 'Enter':
                break;
            default:
                this.suggestion(obj, inputValue);
                break;
        }
    }

    suggestion(obj, inputValue) {

        // Check If the Minimum Character typed for search
        if (inputValue.length > obj.typeMinLetter) {

            /* Check Data To Be Obtained From Url Or Client is Providing Json Array */
            if (obj.url) {
                let getURL = `${obj.url}?term=${inputValue}`;

                // Adds Additional Parameters To Be Passed In URL
                for (let param in obj.urlParams) {
                    if (obj.urlParams.hasOwnProperty(param)) {
                        let id = obj.urlParams[param];
                        let val = document.getElementById(id)?.value;
                        getURL = `${getURL}&${param}=${val}`;
                    }
                }

                fetch(getURL)
                    .then(response => response.json())
                    .then(data => {
                        // if suggestion is found then show it else show nothing found div
                        this.suggestionContainer(data, obj);
                    });
            }
            else if (obj.suggestionData) {
                // find the data
                let data = obj.suggestionData.filter(item =>
                    (item.suggestionListContentText || item.SnLtCnTt).toLowerCase().includes(inputValue.toLowerCase())
                );
                this.suggestionContainer(data, obj);
            }

        } else {
            const div = document.createElement('div');
            let noSuggestionMsg = `Type Minimum ${obj.typeMinLetter + 1} Letter`;
            let suggestionInfo = `<div class="DyFx Pg3 BrBm1 CrBrTe20Lt50 HrCrTe BrRs2">
                                <div class="DyFx FxDnCn FxGw1 Pg5">
                                    <div class="FtSe18 FtWt600"> 
                                        <i class="CT-GearLine AnReIe"></i> ${noSuggestionMsg} 
                                    </div>
                                </div>
                              </div>`;

            div.insertAdjacentHTML('beforeend', suggestionInfo);
            this.addSuggestionBox(obj, div);
        }
    }

    suggestionContainer(data, obj) {
        let suggestionBox = document.createElement('div');
        if (data.length > 0) {
            // Loop the suggestion if category is not present ie Category ==False
            if (!obj.showCategory) {
                for (let i = 0; i < data.length; i++) {
                    let listItem = document.createElement('div');
                    listItem.setAttribute('id', obj.inputId + '_' + i);
                    listItem.setAttribute('tabindex', i);
                    listItem.classList.add('CrurPr');


                    // Get Html of Suggestion From the function
                    listItem.innerHTML = this.suggestionHTML(obj, data[i]);

                    listItem.addEventListener('click', (e) => {
                        this.selectSuggestion(obj, e);
                    }, false);

                    listItem.addEventListener('keydown', (e) => { this.suggestionSelectKey(obj, e); }, false);

                    listItem.InputId = obj.inputId;

                    listItem.suggestionInputId = (data[i].suggestionInputId || data[i].SnItId)
                    listItem.suggestionListCaptionText = (data[i].suggestionListCaptionText || data[i].SnLtCnTt)
                    listItem.suggestionInputText = (data[i].suggestionInputText || data[i].SnItTt)
                    listItem.obj = (data[i].obj || data[i].Ot)

                    listItem.next = (i === data.length - 1) ? `${obj.inputId}_${data.length - 1}` : `${obj.inputId}_${i + 1}`;
                    listItem.prev = (i === 0) ? `${obj.inputId}_0` : `${obj.inputId}_${i - 1}`;

                    suggestionBox.appendChild(listItem);

                }
                this.addSuggestionBox(obj, suggestionBox);
                return true;
            }
            else {
                // Set The Counter 
                let i = 0;
                // Group by 'SnLtCyTt' field
                const groupedData = data.reduce((group, item) => {
                    const { SnLtCyTt } = item;
                    if (!group[SnLtCyTt]) {
                        group[SnLtCyTt] = [];
                    }
                    group[SnLtCyTt].push(item);
                    return group;
                }, {});

                let categorySnDv = document.createElement('div');
                categorySnDv.classList.add("DyFx", "FxDnCn", "BxSwCrGy", "BrRs2", "Wh100p");

                // Get group names (keys) as an array
                const groupNames = Object.keys(groupedData);

                // for loop to iterate over group names
                for (let k = 0; k < groupNames.length; k++) {
                    const groupName = groupNames[k];
                    let categoryCrDv = document.createElement('div');
                    let categoryHTML;
                    // User Customized HTML Usage
                    if (obj.suggestionListCategoryHTML) {
                        categoryHTML = obj.suggestionListCategoryHTML.replace('--Category', groupName);
                    }
                    else {
                        categoryHTML = `<div class="DyFx PnSy PnTp0">
                                            <div class="DyFx FxDnCn  FxGw1">
                                                <div class="${obj.suggestionListCategoryClass}"> ${groupName} </div>
                                            </div>
                                        </div>`;
                    }

                    categoryCrDv.innerHTML = categoryHTML;
                    //
                    // Get the members of the current group
                    const members = groupedData[groupName];

                    // for loop to iterate over members
                    for (let j = 0; j < members.length; j++) {
                        let listItem = document.createElement('div');
                        listItem.setAttribute('id', obj.inputId + '_' + i);
                        listItem.setAttribute('tabindex', i);
                        // Get Html of Suggestion From the function
                        listItem.innerHTML = this.suggestionHTML(obj, members[j]);
                        listItem.addEventListener('click', (e) => {
                            this.selectSuggestion(obj, e);
                        }, false);

                        listItem.addEventListener('keydown', (e) => { this.suggestionSelectKey(obj, e); }, false);
                        listItem.InputId = obj.inputId;
                        listItem.suggestionInputId = (members[j].suggestionInputId || members[j].SnItId)
                        listItem.suggestionListCaptionText = (members[j].suggestionListCaptionText || members[j].SnLtCnTt)
                        listItem.suggestionInputText = (members[j].suggestionInputText || members[j].SnItTt)
                        listItem.obj = (data[i].obj || members[j].Ot)

                        listItem.next = (i === data.length - 1) ? `${obj.inputId}_${data.length - 1}` : `${obj.inputId}_${i+1}`;
                        listItem.prev = (i === 0) ? `${obj.inputId}_0` : `${obj.inputId}_${i - 1}`;

                        categoryCrDv.appendChild(listItem);

                        i++;
                    }

                    //Category wise Child Items
                    categorySnDv.appendChild(categoryCrDv);
                }


                this.addSuggestionBox(obj, categorySnDv);
            }
        }
        else {

            const div = document.createElement('div');
            let NoSuggestionMsg = 'No Suggestions Found';
            let SuggestionInfo = `<div class="DyFx Pg3 BrBm1 CrBrTe20Lt50 HrCrTe BrRs2">
                                        <div class="DyFx FxDnCn  FxGw1 Pg5">
                                            <div class="FtSe18 FtWt600"> ${NoSuggestionMsg} </div>
                                        </div>
                                  </div>`
            div.insertAdjacentHTML('beforeend', SuggestionInfo);
            this.addSuggestionBox(obj, div);
        }
    }

    suggestionHTML(obj, data) {

        //[Todo: instead of create variables use data.[anyKey] directly]
        let html, suggestionInputText = data.SnItTt, suggestionListIconClass = data.SnLtInCs, suggestionListCaptionText = data.SnLtCnTt, suggestionListDiscriptionText = data.SnLtDnTt;

        if (!obj.suggestionListHTML) {
            if (suggestionListCaptionText != undefined &&
                suggestionListDiscriptionText == undefined &&
                suggestionListIconClass == undefined) {
                html = `<div class="DyFx Pg3 BrBm1 CrBrTe20Lt50 HrCrTe BrRs2 CrurPr">
                                <div class="DyFx FxDnCn  FxGw1 Pg5">
                                <div class="${obj.suggestionListCaptionClass}"> ${suggestionListCaptionText} </div>
                                </div>
                             </div>`;

            }
            else if (suggestionListCaptionText != undefined &&
                suggestionListDiscriptionText != undefined &&
                suggestionListIconClass == undefined) {
                html = `<div class="DyFx Pg3 BrBm1 CrBrTe20Lt50 HrCrTe BrRs2 CrurPr">
                                <div class="DyFx FxDnCn  FxGw1 Pg5">
                                    <div class="${obj.suggestionListCaptionClass}"> ${suggestionListCaptionText} </div>
                                    <div class="${obj.suggestionListDiscriptionClass}"> ${suggestionListDiscriptionText} </div>
                                </div>
                              </div>`;
            }

            else if (suggestionListCaptionText != undefined &&
                suggestionListDiscriptionText == undefined &&
                suggestionListIconClass != undefined) {
                html = `<div class="DyFx Pg3 BrBm1 CrBrTe20Lt50 HrCrTe BrRs2 CrurPr">
                            <div class="DyFx FxJyCtCr FxAnIsCr FtSe20 PgLtRt5"> <i class=${suggestionListIconClass}></i></div>
                            <div class="DyFx FxDnCn  FxGw1 Pg5">
                                <div class="${obj.suggestionListCaptionClass}"> ${suggestionListCaptionText} </div></div>
                            </div>
                            </div>`;
            }

            else if (suggestionListCaptionText != undefined &&
                suggestionListDiscriptionText != undefined &&
                suggestionListIconClass != undefined) {
                html = `<div class="DyFx Pg3 BrBm1 CrBrTe20Lt50 HrCrTe BrRs2 CrurPr">
                                <div class="DyFx FxJyCtCr FxAnIsCr FtSe20 PgLtRt5">
                                        <i class=${suggestionListIconClass}></i>
                                </div>
                                <div class="DyFx FxDnCn  FxGw1 Pg5">
                                    <div class="${obj.suggestionListCaptionClass}"> ${suggestionListCaptionText} </div>
                                    <div class="${obj.suggestionListDiscriptionClass}"> ${suggestionListDiscriptionText} </div>
                                </div>
                            </div>`;
            }

            else {
                html = `<div class="DyFx Pg3 BrBm1 CrBrTe20Lt50 HrCrTe BrRs2 CrurPr">
                                <div class="DyFx FxDnCn  FxGw1 Pg5">
                                <div class="${obj.suggestionListCaptionClass}"> ${suggestionInputText} </div>
                                </div>
                             </div>`;
            }
        }
        else {

            if (suggestionListCaptionText == undefined &&
                suggestionListDiscriptionText == undefined &&
                suggestionListIconClass != undefined) {

                html = obj.suggestionListHTML.replace('--Icon', suggestionListIconClass);

            }
            else if (suggestionListCaptionText != undefined &&
                suggestionListDiscriptionText != undefined &&
                suggestionListIconClass == undefined) {
                html = obj.suggestionListHTML.replace('--Caption', suggestionListCaptionText).replace('--Description', suggestionListDiscriptionText);

            }

            else if (suggestionListCaptionText != undefined &&
                suggestionListDiscriptionText == undefined &&
                suggestionListIconClass != undefined) {
                html = obj.suggestionListHTML.replace('--Icon', suggestionListIconClass).replace('--Caption', suggestionListCaptionText);

            }

            else if (suggestionListCaptionText != undefined &&
                suggestionListDiscriptionText != undefined &&
                suggestionListIconClass != undefined) {
                html = obj.suggestionListHTML.replace('--Icon', suggestionListIconClass).replace('--Caption', suggestionListCaptionText).replace('--Description', suggestionListDiscriptionText);
            }
        }

        return html;
    }

    suggestionSelectKey(obj, e) {
        //To Stop Page Scroll Results from arrow key and Form Submission from Enter Key
        e.preventDefault();
        let index = parseInt(e.target.getAttribute('tabindex'));

        switch (e.which) {
            case 38:
                //MoveUp
                this.suggestionNavigate(e.target.prev);
                break;
            case 40:
                //MoveDown;
                //index = index + 1;
                this.suggestionNavigate(e.target.next);
                break;
            case 13:
                this.selectSuggestion(obj, e);
                break;
            default:
                break;
        }
    }

    selectSuggestion(obj, e) {        
        this.suggestionClose(obj);
        document.getElementById(obj.inputId).value = e.currentTarget.suggestionInputText || e.currentTarget.SnItTt;
        if (obj.callbackFunction) {
            obj.callbackFunction(e);
        }
    }

    suggestionNavigate(listId) {
        // instead of finding in the document get the obj and find the particular suggestion and write the logic for that to reduce time-complexity
        let stateActive = document.getElementsByClassName('SeAe');
        for (let i = 0; i < stateActive.length; i++) {
            stateActive[i].classList.remove('SeAe');
        }
        try {
            let suggestItem = document.getElementById(listId);
            suggestItem.classList.add('SeAe');
            suggestItem.focus();
        }
        catch (e) { }
    }

    suggestionClose(obj) {
        //obj - either object or string
        const inputId = (typeof obj === "string") ? obj : obj?.inputId;
        if (!inputId) return; // nothing to do if no id

        // Find and remove suggestion box
        const oldSBox = document.getElementById(inputId + "SBoxUT");
        if (oldSBox) {
            oldSBox.remove();
        }

        // Cancel animation frame if exists
        if (this.requestAnimationFrameId) {
            cancelAnimationFrame(this.requestAnimationFrameId);
            this.requestAnimationFrameId = null;
        }

        document.body.removeAttribute('mouseup');
    }

    addSuggestionBox(obj, Suggestion) {
        // Close any old suggestion box present
        this.suggestionClose(obj);

        const displaySuggestionDiv = document.createElement('div');

        const inputParentElement = document.getElementById(obj.inputId)?.parentElement;

        if (!inputParentElement) return;

        inputParentElement.classList.add('PnRe');

        displaySuggestionDiv.classList.add("CrBdWe", "BrRs5", "DyBk", "PnAe", obj.widthMin, "ZIx10000000000");
        displaySuggestionDiv.setAttribute('id', obj.inputId + 'SBoxUT');

        const SuggestBox = document.createElement('div');
        SuggestBox.classList.add("CrBdWe", "BrRs5", 'BxSwFgCrGy', 'OwYAo', 'Wh100p', 'HtMx35vh');
        SuggestBox.appendChild(Suggestion);
        displaySuggestionDiv.appendChild(SuggestBox);
        //inputParentElement.appendChild(displaySuggestionDiv);
        document.body.appendChild(displaySuggestionDiv);
        this.setSuggestionAbsolutePosition(obj.inputId, displaySuggestionDiv)


        // Adding event to close the suggestion box on body click, but not on the suggestion box itself
        document.addEventListener('mouseup', function handleClickOutside(event) {
            const suggestionBox = document.getElementById(obj.inputId + 'SBoxUT');
            const inputElement = document.getElementById(obj.inputId);
            if (suggestionBox && !suggestionBox.contains(event.target) && !inputElement.contains(event.target)) {
                this.suggestionClose(obj);
                document.removeEventListener('mouseup', handleClickOutside);
            }
        }.bind(this));
    }

    setSuggestionAbsolutePosition(inputElementId, element) {
        let inputElement = document.getElementById(inputElementId)

        const updatePosition = () => {
            // Make sure elements exist
            if (!inputElement || !element) {
                return;
            }

            // Get input element's position and dimensions
            const inputRect = inputElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const scrollTop = window.scrollY;
            const scrollLeft = window.scrollX;

            // Get calendar dimensions
            const calendarHeight = element.clientHeight;
            const calendarWidth = element.clientWidth;

            // Set initial position to make the calendar visible for height calculation
            element.style.display = 'block';

            // Calculate available space
            const spaceBelow = viewportHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const spaceRight = viewportWidth - inputRect.left;
            const offset = 5; // Reduced offset for closer positioning

            // Clear all positions first to avoid conflicts
            element.style.top = 'auto';
            element.style.bottom = 'auto';
            element.style.left = 'auto';
            element.style.right = 'auto';

            // Vertical positioning
            if (spaceBelow >= calendarHeight) {
                // Enough space below
                element.style.top = `${inputRect.bottom + scrollTop + offset}px`;
            } else if (spaceAbove >= calendarHeight) {
                // Enough space above
                element.style.top = `${inputRect.top + scrollTop - element.offsetHeight - offset}px`;
            } else {
                // Not enough space either way - place where there's more space
                if (spaceBelow >= spaceAbove) {
                    element.style.top = `${inputRect.bottom + scrollTop + offset}px`;
                } else {
                    element.style.top = `${inputRect.top + scrollTop - element.offsetHeight - offset}px`;
                }
            }

            // Horizontal positioning
            // Try to align with input field first
            if (inputRect.left + calendarWidth <= viewportWidth) {
                // Calendar fits when aligned with input left edge
                element.style.left = `${inputRect.left}px`;
            } else if (inputRect.right - calendarWidth >= 0) {
                // Calendar fits when aligned with input right edge
                element.style.left = `${inputRect.right - calendarWidth}px`;
            } else {
                // Center the calendar if it doesn't fit aligned with input
                const leftPosition = Math.max(0, Math.min(inputRect.left, viewportWidth - calendarWidth));
                element.style.left = `${leftPosition}px`;
            }
            this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
        };

        // Run once immediately and then on animation frame
        this.requestAnimationFrameId = requestAnimationFrame(updatePosition);

        // Optional: Add resize listener to handle window resize
        if (!this.resizeListener) {
            this.resizeListener = () => {
                this.suggestionClose(inputElementId);
            };
            window.addEventListener('resize', this.resizeListener);
        }
    }

}

class CsTopNav {
    constructor() {
        this.version = '1.0.0.1';
        this.AddEvent();
    }

    // Add Active Class to The Links that user have selected
    TopNavActive(Ot) {
        var ActiveLink = Ot.AeLk;
        var ActiveSubLink = Ot.AeSbLk;
        var ActiveSubSubLink = Ot.AeSbSbLk;
        try {
            if (ActiveLink != null) {
                document.querySelector('[NvTpLkNe="' + ActiveLink + '"]').classList.add('NvTpLkAe');
            }
        }
        catch
        { }
        try {
            if (ActiveSubLink != null) {
                document.querySelector('[NvTpSbLkNe="' + ActiveSubLink + '"]').classList.add('NvTpLkSbAe');
            }
        } catch { }
        try {
            if (ActiveSubSubLink != null) {
                document.querySelector('[NvTpSbSbLkNe="' + ActiveSubSubLink + '"]').classList.add('NvTpLkSbSbAe');
            }
        } catch { }


        // Opened in Mobile Or Tab Then Open the Navigation

        //User is in Tablet Or Mobile

        //User is in Tablet Or Mobile
        const VwPtWidth = window.innerWidth;

        if (VwPtWidth < 768) {
            //Opening Up The User Default Pre Active Links On the Page Load
            var PreActiveSubLink = document.getElementsByClassName('NvTpLkSbAe');
            var PreActiveSublinkHeight = 0;

            if (PreActiveSubLink.length > 0) {
                var SubSubLinkSn = PreActiveSubLink[0].parentElement.parentElement.getElementsByClassName('NvTpSbSbLkSn');

                if (SubSubLinkSn.length > 0) {
                    SubSubLinkSn[0].style.maxHeight = SubSubLinkSn[0].scrollHeight + "px";
                    PreActiveSublinkHeight = parseInt(SubSubLinkSn[0].scrollHeight);
                }
            }

            var PreActiveLink = document.getElementsByClassName('NvTpLkAe');

            if (PreActiveLink.length > 0) {
                var NvTpSbLkSnEmPre = PreActiveLink[0].parentElement.getElementsByClassName('NvTpSbLkSn')[0];
                if (NvTpSbLkSnEmPre != null && NvTpSbLkSnEmPre != "" && NvTpSbLkSnEmPre != undefined) {
                    NvTpSbLkSnEmPre.style.maxHeight = (parseInt(NvTpSbLkSnEmPre.scrollHeight) + parseInt(PreActiveSublinkHeight)) + "px";
                }
            }

            //Ends: Opening Up The User Default Pre Active Links On the Page Load
        }
    }

    // Adds all the event required to Operate Top Nav;
    AddEvent() {
        var NvTp = document.getElementsByClassName('NvTpSn');
        if (NvTp.length > 0) {
            // Check if ResizeObserver is supported
            if (typeof ResizeObserver !== 'undefined') {
                const resizeObserver = new ResizeObserver(function (entries) {
                    //User is in PC or DeskTop
                    const VwPtWidth = window.innerWidth;
                    if (VwPtWidth > 768) {
                        //Start Closes NvTpSbLkSn && Remove the Style Attribute to make it Responsively Work
                        var NvTpSbLkSn = document.getElementsByClassName('NvTpSbLkSn');
                        for (var k = 0; k < NvTpSbLkSn.length; k++) {
                            NvTpSbLkSn[k].removeAttribute("style");
                        }
                        //Ends Closes NvTpSbLkSn
                        // Closing if any NvTpSbSbLkSn(SubSubLink) is opened

                        var NvTpSbSbLkSn = document.getElementsByClassName('NvTpSbSbLkSn');
                        for (var nvsb = 0; nvsb < NvTpSbSbLkSn.length; nvsb++) {
                            NvTpSbSbLkSn[nvsb].removeAttribute("style");
                        }

                        var NvTpLkSn = document.getElementsByClassName('NvTpLkSn');
                        for (var nvsb = 0; nvsb < NvTpSbSbLkSn.length; nvsb++) {
                            NvTpLkSn[nvsb].removeAttribute("style");
                        }
                    }
                });
                resizeObserver.observe(NvTp[0]);
            } else {
                //console.log('ResizeObserver is not supported in this browser.');
            }
        }
        // Adding Hover MouseEnter And Leave Event Listner to Links
        var NvTpLkCr = document.getElementsByClassName('NvTpLkCr');
        for (var i = 0; i < NvTpLkCr.length; i++) {
            NvTpLkCr[i].addEventListener('mouseenter', function (e) {
                //User is in desktop
                const VwPtWidth = window.innerWidth;
                if (VwPtWidth > 768) {
                    const linkSection = e.target.getElementsByClassName('NvTpSbLkSn');
                    if (linkSection.length > 0) {
                        linkSection[0].style.display = "block";
                        const LinkSectionPn = linkSection[0].getBoundingClientRect();
                        const LtWh = parseInt(LinkSectionPn.left);
                        const RtWh = parseInt(VwPtWidth - LinkSectionPn.right);
                        LtWh > RtWh ? linkSection[0].style.right = 0 : linkSection[0].style.left = 0;
                    }
                }
            })
            NvTpLkCr[i].addEventListener('mouseleave', function (e) {
                //User is in desktop
                const VwPtWidth = window.innerWidth;
                if (VwPtWidth > 768) {
                    const linkSection = e.target.getElementsByClassName('NvTpSbLkSn');
                    if (linkSection.length > 0) {
                        linkSection[0].style.display = "none";
                    }


                }
            })
        }
        // Adding Hover MouseEnter And Leave Event Listner to Links
        // Adding Event Listner to Sub Links
        var NvTpSbLkCr = document.getElementsByClassName('NvTpSbLkCr');
        for (var i = 0; i < NvTpSbLkCr.length; i++) {
            NvTpSbLkCr[i].addEventListener('mouseenter', function (e) {
                //User is in desktop
                if (window.innerWidth > 768) {
                    const subLinkSection = e.target.getElementsByClassName('NvTpSbSbLkSn');

                    if (subLinkSection.length > 0) {
                        subLinkSection[0].style.display = "block";
                        const VwPtWidth = window.innerWidth;
                        const LinkSectionPn = subLinkSection[0].getBoundingClientRect();
                        const LtWh = parseInt(LinkSectionPn.left);
                        const RtWh = parseInt(VwPtWidth - LinkSectionPn.right);
                        LtWh > RtWh ? subLinkSection[0].style.transform = 'translateX(-100%)' : subLinkSection[0].style.transform = 'translateX(100%)';
                    }
                }
            })

            NvTpSbLkCr[i].addEventListener('mouseleave', function (e) {
                //User is in desktop
                if (window.innerWidth > 768) {
                    const subLinkSection = e.target.getElementsByClassName('NvTpSbSbLkSn');
                    if (subLinkSection.length > 0) {
                        subLinkSection[0].style.display = "none";
                    }
                }
            })
        }
        // Hover Event Listner
        //Adding Event Close Open Button
        var NvTpCeBn = document.getElementsByClassName('NvTpMuBn');
        for (var i = 0; i < NvTpCeBn.length; i++) {
            NvTpCeBn[i].addEventListener('click', function (e) {
                //Start Animates to Close And Menu Lines
                this.classList.toggle('active');
                // Ends Animates to Close And Menu Lines

                var NvTpLkSn = document.getElementsByClassName('NvTpLkSn');
                var NvTpSn = document.getElementsByClassName('NvTpSn');

                if (NvTpLkSn.length > 0 && NvTpSn.length > 0) {
                    var NavLkSn = NvTpLkSn[0];

                    if (NvTpSn[0].getAttribute('Ot') != null || NvTpSn[0].getAttribute('Ot') != "") {
                        var OtAe = JSON.parse(NvTpSn[0].getAttribute('Ot'));
                        //Opens Nav As Per User Direction
                        if (OtAe != null) {
                            if (OtAe.Show == "Left") {
                                NavLkSn.style.left = 0;
                            }
                        }
                    }

                    //Open Nav at the end of Top Nav
                    NavLkSn.style.transform = `translateY(${NvTpSn[0].getBoundingClientRect().height}px)`;

                    if (NavLkSn.style.maxWidth !== "" && NavLkSn.style.maxWidth != "0px") {
                        NavLkSn.style.minWidth = "0px";

                        NavLkSn.style.maxWidth = 0;
                        NavLkSn.style.opacity = 0;

                    }
                    else {
                        NavLkSn.style.minWidth = "80%";
                        NavLkSn.style.maxWidth = NavLkSn.scrollWidth + 'px';
                        NavLkSn.style.opacity = "100%";


                    }
                }
            });
        }
        //Ends Adding Event Close Open Button

        // Starts Adding Click Event On Link and Sub Links
        ///1st Starts Adding Event Listner To TopLinks
        var NvTpLkCr = document.getElementsByClassName('NvTpLkCr');

        for (var i = 0; i < NvTpLkCr.length; i++) {
            NvTpLkCr[i].getElementsByClassName('NvTpLk')[0].addEventListener('click', function (e) {


                //User is in Tablet Or Mobile
                const VwPtWidth = window.innerWidth;
                if (VwPtWidth < 768) {


                    var CurrentLinkStatus = e.target.classList.contains('NvTpLkAe') ? 'Active' : 'Inactive';
                    if (CurrentLinkStatus == 'Inactive') {
                        CurrentLinkStatus = e.target.parentElement.classList.contains('NvTpLkAe') ? 'Active' : 'Inactive';
                    }
                    //Removes the active Class From TpLink

                    for (var j = 0; j < NvTpLkCr.length; j++) {
                        if (NvTpLkCr[j].getElementsByClassName('NvTpLk')[0].classList.contains('NvTpLkAe')) {
                            NvTpLkCr[j].getElementsByClassName('NvTpLk')[0].classList.remove('NvTpLkAe');
                        }

                    }
                    //Removes the active Class From TpSbLink

                    var NvTpSbLkCr = document.getElementsByClassName('NvTpSbLkCr');
                    for (var k = 0; k < NvTpSbLkCr.length; k++) {
                        if (NvTpSbLkCr[k].getElementsByClassName('NvTpSbLk')[0].classList.contains('NvTpLkSbAe')) {
                            NvTpSbLkCr[k].getElementsByClassName('NvTpSbLk')[0].classList.remove('NvTpLkSbAe');
                        }
                    }

                    //Removes the active Class From SdSbSbLink
                    CT.ReAeTpSbSbLk();

                    //Start Closes NvTpSbLkSn && Remove the Style Attribute to make it Responsively Work
                    var NvTpSbLkSn = document.getElementsByClassName('NvTpSbLkSn');
                    for (var k = 0; k < NvTpSbLkSn.length; k++) {
                        NvTpSbLkSn[k].removeAttribute("style");
                        NvTpSbLkSn[k].style.maxHeight = 0;
                    }
                    //Ends Closes NvTpSbLkSn
                    // Closing if any NvTpSbSbLkSn(SubSubLink) is opened

                    var NvTpSbSbLkSn = document.getElementsByClassName('NvTpSbSbLkSn');
                    for (var nvsb = 0; nvsb < NvTpSbSbLkSn.length; nvsb++) {
                        NvTpSbSbLkSn[nvsb].style.maxHeight = 0;
                    }
                    //Removes the active Class From SbSbLink
                    CT.ReAeTpSbSbLk();
                    // Add Height to the SubLinkSection
                    if (CurrentLinkStatus === 'Inactive') {
                        // Adding ActiveClass To Clicked Link
                        if (!this.classList.contains("NvTpLkAe")) {
                            this.classList.add("NvTpLkAe");
                        }
                        var NvTpSbLkSnEm = this.parentElement.getElementsByClassName('NvTpSbLkSn')[0];
                        if (NvTpSbLkSnEm != null && NvTpSbLkSnEm != "" && NvTpSbLkSnEm != undefined) {
                            NvTpSbLkSnEm.style.maxHeight = NvTpSbLkSnEm.scrollHeight + "px";
                        }
                    }
                }
            });

        }
        /// Ends Adding Event Listner To TopLinks

        // 2nd Starts Adding Event Listner To The Top Nav SubLinks
        var NvTpSbLk = document.getElementsByClassName('NvTpSbLk');

        for (var nv = 0; nv < NvTpSbLk.length; nv++) {
            NvTpSbLk[nv].addEventListener('click', function (e) {
                //User is in Tab Or Mobile
                const VwPtWidth = window.innerWidth;
                if (VwPtWidth < 768) {
                    var CurrentSbLinkStatus = e.target.classList.contains('NvTpLkSbAe') ? 'Active' : 'Inactive';
                    if (CurrentSbLinkStatus == 'Inactive') {
                        CurrentSbLinkStatus = e.target.parentElement.classList.contains('NvTpLkSbAe') ? 'Active' : 'Inactive';
                    }

                    for (var nv = 0; nv < NvTpSbLk.length; nv++) {
                        if (NvTpSbLk[nv].classList.contains('NvTpLkSbAe')) {
                            NvTpSbLk[nv].classList.remove('NvTpLkSbAe');
                        }
                    }

                    // Closing if any NvTpSbSbLkSn(SubSubLink) is opened
                    var NvTpSbSbLkSn = document.getElementsByClassName('NvTpSbSbLkSn');
                    for (var nvsb = 0; nvsb < NvTpSbSbLkSn.length; nvsb++) {
                        NvTpSbSbLkSn[nvsb].removeAttribute('style');
                        NvTpSbSbLkSn[nvsb].style.maxHeight = 0;
                    }

                    //Removes the active Class From TpSbLink
                    CT.ReAeTpSbSbLk();


                    // Add Scroll Height to The SubSubLink Container
                    if (CurrentSbLinkStatus === 'Inactive') {
                        if (!this.classList.contains('NvTpLkSbAe')) {
                            this.classList.add('NvTpLkSbAe');
                        }

                        var SubSubLinkContainer = this.parentElement.getElementsByClassName('NvTpSbSbLkSn')[0];

                        if (SubSubLinkContainer != null && SubSubLinkContainer != "" && SubSubLinkContainer != undefined) {
                            SubSubLinkContainer.style.maxHeight = SubSubLinkContainer.scrollHeight + "px";

                            //Adding Height to the Main Parent Div As Well
                            this.parentElement.parentElement.style.maxHeight = (parseInt(this.parentElement.parentElement.style.maxHeight) + parseInt(SubSubLinkContainer.scrollHeight)) + "px";
                        }
                    }
                }
            });
        }
        // 2nd Ends Adding Event Listner To The Top Nav SubLinks

        // 3rd Starts Adding Event Listner to the Top Nav sub sub link

        var NvTpSbSbLk = document.getElementsByClassName('NvTpSbSbLk');

        for (var nvs = 0; nvs < NvTpSbSbLk.length; nvs++) {
            NvTpSbSbLk[nvs].addEventListener('click', function (e) {
                //User is in Tab Or Mobile
                const VwPtWidth = window.innerWidth;
                if (VwPtWidth < 768) {

                    for (var nvs1 = 0; nvs1 < NvTpSbSbLk.length; nvs1++) {
                        if (NvTpSbSbLk[nvs1].classList.contains('NvTpLkSbSbAe')) {
                            NvTpSbSbLk[nvs1].classList.remove('NvTpLkSbSbAe');
                        }
                    }
                    //Remove the Active Class If Present
                    CT.ReAeTpSbSbLk();
                    if (!this.classList.contains('NvTpLkSbSbAe')) {
                        this.classList.add('NvTpLkSbSbAe');
                    }
                }
            });
        }
        // 3rd Ends Adding Event Listner to the Top Nav sub sub link
    }

    //Removes the active Class From SbSbLink
    RemoveActiveTpSbSbLk() {
        var NvTpSbSbLkCr = document.getElementsByClassName('NvTpSbSbLkCr');
        for (var l = 0; l < NvTpSbSbLkCr.length; l++) {

            var NvTpSbSbLk = NvTpSbSbLkCr[l].getElementsByClassName('NvTpSbSbLk');

            for (var m = 0; m < NvTpSbSbLk.length; m++) {
                if (NvTpSbSbLk[m].classList.contains('NvTpLkSbSbAe')) {
                    NvTpSbSbLk[m].classList.remove('NvTpLkSbSbAe');
                }
            }
            if (NvTpSbSbLkCr[l].getElementsByClassName('NvTpSbSbLk')[0].classList.contains('NvTpLkSbSbAe')) {
                NvTpSbSbLkCr[l].getElementsByClassName('NvTpSbSbLk')[0].classList.remove('NvTpLkSbSbAe');
            }

        }
    }
}

class CsClientPosition {
    constructor() {
        this.version = '1.0.0.1';
    }

    DeviceTypeByScreenSize() {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 767) {
            return "Mobile";
        } else if (screenWidth >= 768 && screenWidth <= 1024) {
            return "Tablet";
        } else {
            return "Desktop";
        }


    }

    ElementLocation(Ot, e) {
        var element = e.target;
        const rect = element.getBoundingClientRect();
        const scroll = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        const VwPtWidth = window.innerWidth;
        const VwPtHeight = window.innerHeight;

        const OpenLeft = VwPtWidth - rect.right > rect.left ? true : false;
        const OpenTop = VwPtHeight - rect.bottom > rect.top ? false : true;

        return {
            Top: rect.top,
            Right: rect.right,
            Bottom: rect.bottom,
            Left: rect.left,
            Width: rect.width,
            Height: rect.height,
            Scrolled: scroll,
            VwPtHeight: VwPtHeight,
            VwPtWidth: VwPtWidth,
            SnWidth: window.screen.width,
            SnHeight: window.screen.width,
            OpenLeft: OpenLeft,
            OpenTop: OpenTop
        };
    }
}

class CsFunction {
    constructor() {
        this.version = '1.0.0.0';
    }
    //Function Elements
    AddEvent() {
        var FnEt = document.querySelectorAll('[Ot]');
        for (var i = 0; i < FnEt.length; i++) {
            // Object Argument Passed
            let Ot = JSON.parse(FnEt[i].getAttribute('Ot'));
            /// If Ot have Property Cl only then add event
            if (Ot.hasOwnProperty('Cl')) {
                let Listner = Ot.Et ? Ot.Et : 'click';
                let Method = Ot.Cl;
                if (Method != null && Method != "") {
                    switch (Method) {
                        ///This Copies content
                        case 'Copy': FnEt[i].addEventListener(Listner, function (e) { CT.CopyToClipboard(Ot, e); });
                            break;
                    }
                }
            }
        }
    }

    /********************************** Ends Tool Tip *****************************/

    /********************************** CopyToClipboard *****************************/
    /* CopyToClipboard Start */
    CopyToClipboard(Ot, e) {
        //For Adding ToolTip Setting Id
        e.target.setAttribute('id', 'NumC23');
        var element = document.getElementById(Ot.Id);
        if (!element) {
            console.error("Element with ID '" + Ot.ID + "' not found.");
            return;
        }
        var content = element.textContent || element.innerText;

        //Copies Content to clipboard
        navigator.clipboard.writeText(content).then(function () {

            //Shows Selected Range
            if (document.selection) {
                // For old  browsers
                var range = document.body.createTextRange();
                range.moveToElementText(element);
                range.select().createTextRange();
            } else if (window.getSelection) {
                // For modern browsers
                var range = document.createRange();
                range.selectNode(element);
                window.getSelection().addRange(range);
            }
            // Clear selection after copying
            var OtToolTip = { Id: "NumC23", Cl: "ToolTip", Tt: "Copied", Pn: "Top", Cr: "White", CrBd: "Green", Num: "NumC23" };

            CsFunction.prototype.ToolTipCreate.call(this, OtToolTip, e);
        }).catch(function (err) {
            var OtToolTip1 = { Id: "NumC23", Cl: "ToolTip", Tt: "Error Copying", Pn: "Top", Cr: "White", CrBd: "Red", Num: "NumC23" };
            CsFunction.prototype.ToolTipCreate.call(this, OtToolTip1, e);

        });
        setTimeout(function () {
            var selection = window.getSelection(); selection.removeAllRanges();
            CsFunction.prototype.ToolTipRemove.call(this, { Num: "NumC23" }, e);
        }, 1000)

        setTimeout(function () { e.target.removeAttribute('id'); }, 1200);
    }
    /* CopyToClipboard End */

}

class Animation {
    constructor() {
        this.initAnimation();
    }

    initAnimation() {
        let buttons = document.querySelectorAll('.Bn[AnNe]'); // Select only buttons with 'AnNe' attribute

        buttons.forEach(button => {
            button.addEventListener('click', function () {
                let animationType = this.getAttribute('AnNe');
                let box = document.querySelector('.box');

                if (box) {
                    // Remove existing animation classes starting with 'AnFeIn' or 'AnFeOut'
                    box.className = box.className.replace(/\bAnFe(?:In|Out)\b/g, '').trim();

                    // Add the new animation class
                    box.classList.add(animationType);

                    // Remove the animation class after 2 seconds
                    setTimeout(() => {
                        box.classList.remove(animationType);
                    }, 2000);
                }
            });
        });
    }

}

class Accordion {
    constructor() {
        this.version = '1.0.0';
        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.init();
            });
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.init();
                    }, 1);
                });
            });
        }
    }

    normalizeData(obj) {
        const keyMap = {
            Id: 'id',
            Active: 'active',
            InActive: 'inActive',
            Enable: 'enable',
            Disable: 'disable',
            Hide: 'hide',
            UnHide: 'unHide',
            MultipleOpen: 'multipleOpen'
        };

        Utils.normalizeData(obj, keyMap);
    }

    setDefaultValues(obj) {
        obj.active = obj.active || [];
        obj.inActive = obj.inActive || [];
        obj.disable = obj.disable || [];
        obj.hide = obj.hide || [];
        obj.unHide = obj.unHide || [];
        obj.multipleOpen = obj.multipleOpen || false;
    }

    create(obj) {

        this.normalizeData(obj);

        if (!obj.id) {
            console.error('Accordion: id does not exist');
            return;
        }

        this.setDefaultValues(obj);

        let accordion = document.getElementById(obj.id);

        accordion.setAttribute('data-multiopen', obj.multipleOpen);

        let accordionContainers = accordion.querySelectorAll('.AnCr');
        accordionContainers.forEach((accordionContainer, i) => {
            if (obj.active.includes(i)) {
                accordionContainer.classList.add('AnAe');
                this.handleOpen(accordion, accordionContainer)
            } else if (obj.disable.includes(i)) {
                accordionContainer.classList.add('CrurNtAd');
            } else if (obj.hide.includes(i)) {
                accordionContainer.classList.add('DyNe');
            }
        })
    }

    init() {

        // Accordion Sections
        let accordionSections = document.querySelectorAll('.AnSn');

        accordionSections.forEach((section, i) => {
            if (!section.getAttribute('id')) {
                section.setAttribute('id', Utils.generateRandomString());
            }

            //Set number on Accordion Section
            section.setAttribute("AnSn", i);

            //Get all the Accordion Container 
            let containers = section.querySelectorAll(".AnCr");

            containers.forEach((container, j) => {
                try {
                    // Set attributes on container
                    container.setAttribute("AnSn", i);
                    container.setAttribute("AnCr", j);

                    let header = container.getElementsByClassName("AnCrHr")[0];
                    let panel = container.getElementsByClassName("AnCrPl")[0];

                    if (!header || !panel) {
                        console.warn(`Accordion container [AnCr=${j}] is missing header or panel`);
                        return; // skip this container safely
                    }

                    // Set attributes on header and panel
                    header.setAttribute("AnSn", i);
                    panel.setAttribute("AnSn", i);
                    header.setAttribute("AnCr", j);
                    panel.setAttribute("AnCr", j);

                    header.setAttribute("AnCrHr", j);
                    panel.setAttribute("AnCrPl", j);

                    // Add event listener on header
                    header.addEventListener("click", (e) => {
                        let sectionNumber = e.currentTarget.getAttribute("AnSn");
                        let containerNumber = e.currentTarget.getAttribute("AnCr");

                        let currentSection = document.querySelector(`[AnSn='${sectionNumber}']`);
                        if (!currentSection) {
                            console.error("Accordion section not found:", sectionNumber);
                            return;
                        }

                        let currentContainer = currentSection.querySelector(`[AnCr='${containerNumber}']`);
                        if (!currentContainer) {
                            console.error("Accordion container not found:", containerNumber);
                            return;
                        }

                        this.handleOpen(currentSection, currentContainer);
                    });
                } catch (err) {
                    console.error(`Error initializing accordion container [AnCr=${j}]`, err);
                }
            });

        })
    }

    active(obj, isCalledByUser = true) {

        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        if (!obj.active) {
            return;
        }

        let accordion = document.getElementById(obj.id);
        if (!accordion) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        let accordionContainers = accordion.querySelectorAll('.AnCr');
        accordionContainers.forEach((accordionContainer, i) => {
            if (obj.active.includes(i)) {
                accordionContainer.classList.add('AnAe');
                this.handleOpen(accordion, accordionContainer)
            }
        })

    }

    inActive(obj, isCalledByUser = true) {
        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        if (!obj.inActive) {
            return;
        }

        let accordion = document.getElementById(obj.id);
        if (!accordion) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        let accordionContainers = accordion.querySelectorAll('.AnCr');
        accordionContainers.forEach((container, i) => {
            if (obj.inActive.includes(i)) {
                container.classList.remove('AnAe');
                this.handleClose(container);
            }
        })

    }

    disable(obj, isCalledByUser = true) {

        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        if (!obj.disable) {
            return;
        }

        let accordion = document.getElementById(obj.id);
        if (!accordion) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        let accordionContainers = accordion.querySelectorAll('.AnCr');
        accordionContainers.forEach((container, i) => {
            if (obj.disable.includes(i)) {
                container.classList.add('CrurNtAd');
                this.handleClose(container);
            }
        })
    }

    enable(obj, isCalledByUser = true) {
        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        if (!obj.enable) {
            return;
        }

        let accordion = document.getElementById(obj.id);
        if (!accordion) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        let accordionContainers = accordion.querySelectorAll('.AnCr');
        accordionContainers.forEach((container, i) => {
            if (obj.enable.includes(i)) {
                container.classList.remove('CrurNtAd');
            }
        })
    }

    hide(obj, isCalledByUser = true) {
        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        if (!obj.hide) {
            return;
        }

        let accordion = document.getElementById(obj.id);
        if (!accordion) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        let accordionContainers = accordion.querySelectorAll('.AnCr');
        accordionContainers.forEach((container, i) => {
            if (obj.hide.includes(i)) {
                this.handleClose(container);
                container.classList.add('DyNe');
            }
        })
    }

    unHide(obj, isCalledByUser = true) {
        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        if (!obj.unHide) {
            return;
        }

        let accordion = document.getElementById(obj.id);
        if (!accordion) {
            console.warn('Accordion not found! Check you Id');
            return;
        }

        let accordionContainers = accordion.querySelectorAll('.AnCr');
        accordionContainers.forEach((container, i) => {
            if (obj.unHide.includes(i)) {
                container.classList.remove('DyNe');
            }
        })
    }

    handleOpen(currentSection, currentContainer) {
        if (!currentSection || !currentContainer) return;
        if (currentContainer.classList.contains('CrurNtAd')) return;

        let clickedPanel = currentContainer.querySelector('.AnCrPl');

        let clickedPanelHeight = window.getComputedStyle(clickedPanel).maxHeight;

        let multiOpen = currentSection.dataset.multiopen === 'true';
        if (multiOpen) {
            // if clicked on the opened panel then close it
            if (clickedPanelHeight != '0px') {
                this.handleClose(currentContainer);
                return;
            }
        } else {
            // step 1: close all panel 
            let allContainer = currentSection.querySelectorAll(".AnCr");
            allContainer.forEach((container) => {
                this.handleClose(container);
            })

            //step 2: if click on the open panel then it close and don't open again
            if (clickedPanelHeight != '0px') return;
        }

        // open this panel 
        clickedPanel.style.maxHeight = clickedPanel.scrollHeight + "px";

        // add up arrow icon 
        let icon = currentContainer.querySelector('.AnIn');
        if (icon) icon.classList.add('AnAeIn');
    }

    handleClose(accordionContainer) {
        if (!accordionContainer) return;

        const element = accordionContainer.querySelector('.AnCrPl');
        if (element) {
            element.style.maxHeight = '0px';
        }

        accordionContainer.querySelector('.AnIn')?.classList.remove('AnAeIn');
    }

}

class Tab {
    constructor() {
        this.version = '1.0.0';
    }

    normalizeData(obj) {
        const keyMap = {
            Id: 'id',
            Active: 'active',
            Disable: 'disable',
            Hide: 'hide',
            NavAlign: 'placement',
            NavWidthPercent: 'tabWidth',
            NavLinkHeightPx: 'tabHeight',
            NavScroll: 'scroll',
            ClBkFn: 'callback',
            scrollSpeedByHolding: 'scrollSpeedByHolding',
            scrollUnitByClick: 'scrollUnitByClick',
        };

        Utils.normalizeData(obj, keyMap);
    }

    setDefaultValues(obj) {
        obj.active = obj.active || 0;
        obj.disable = obj.disable || [];
        obj.hide = obj.hide || [];
        obj.placement = obj.placement?.toLowerCase() || 'top';
        obj.tabHeight = obj.tabHeight || 40;
        obj.tabWidth = obj.tabWidth || 23;
        switch (obj.scroll) {
            case 'Y':
                obj.scroll = true;
                break;
            case 'N':
                obj.scroll = false;
                break;
            default:
                obj.scroll = obj.scroll || true;
                break;
        }
        obj.scrollSpeedByHolding = obj.scrollSpeedByHolding || 100;
        obj.scrollUnitByClick = obj.scrollUnitByClick || 25;
        obj.tabContainerHeight = obj.tabContainerHeight || 'HtMx50vh';
    }

    create(objData) {

        this.normalizeData(objData);

        if (!objData.id) {
            console.error('Tab not Found! Please Check your Id');
            return;
        }

        let obj = Utils.deepCloneWithFunctions(objData);

        this.setDefaultValues(obj);

        obj.tabLinksContainerId = `${obj.id}Lk`;
        let tabContainer = document.getElementById(obj.id + 'Cr');
        let tabContent = document.getElementById(obj.id + 'Ct');

        //Add Classes to Container Div
        if (!tabContainer.classList.contains('DyFx')) {
            tabContainer.classList.add('DyFx');
        }

        switch (obj.placement) {
            case 'left':
                tabContainer.classList.add('FxDnRw');
                break;
            case 'bottom':
                tabContainer.classList.add('FxDnCnRe');
                break;
            case 'right':
                tabContainer.classList.add('FxDnRwRe');
                break;
            default: // 'top':
                tabContainer.classList.add('FxDnCn');
                break;
        }

        let tabLinksContainer = document.getElementById(obj.tabLinksContainerId);

        let wrapper = document.createElement('div');
        wrapper.setAttribute('id', obj.tabLinksContainerId)
        wrapper.innerHTML = tabLinksContainer.innerHTML;
        tabLinksContainer.innerHTML = "";
        tabLinksContainer.appendChild(wrapper);
        tabLinksContainer.setAttribute('id', obj.tabLinksContainerId + 'Parent');

        if (obj.placement == 'left' || obj.placement == 'right') {
            tabLinksContainer.style.minWidth = parseFloat(obj.tabWidth) + '%';

            wrapper.classList.add("CTabs", "CTabVertical");
            wrapper.classList.add("FxDnCn");
            wrapper.style.height = '10px'; // temp

            setTimeout(() => {
                wrapper.style.height = tabLinksContainer.clientHeight + 'px';
            }, 1);

        } else {
            wrapper.classList.add("CTabs", "CTabHorizontal");
        }

        let tabLink = wrapper.children;
        let tabContentArr = [];
        Array.from(tabLink).forEach((link, i) => {
            // Get the content tab element
            const contentTab = document.getElementById(`${obj.id}Ct${i}`);
            tabContentArr.push(contentTab);

            // Configure tab link styles and attributes
            link.style.minHeight = `${obj.tabHeight}px`;
            link.setAttribute("id", `${obj.id}${i}`);
            link.setAttribute("Num", i);

            link.addEventListener('click', (e) => {
                let disabled = e.currentTarget.classList.contains('CTabDeactive') == true;
                if (disabled) return;

                obj.click = e.currentTarget.getAttribute('num');
                this.click(obj);
            });

            // Add alignment class if needed
            if (obj.placement === 'top' || obj.placement === 'bottom') {
                link.classList.add("WeSeNoWp");
            }

            // Add standard tab classes
            link.classList.add('CTabLink');
            contentTab.classList.add('CTabCont');

            // Hide all tab content initially
            contentTab.style.display = 'none';

            // Set default active tab (first tab)
            if (i === 0) {
                link.classList.add('CTabActive');
                contentTab.style.display = 'block';
            }

            // Override default if specific tab should be active
            if (obj.active === i) {
                tabLink[0].classList.remove('CTabActive');
                link.classList.add('CTabActive');
                tabContentArr[0].style.display = 'none';
                contentTab.style.display = 'block';
            }
        });

        this.disable(obj, false);
        this.hide(obj, false);

        // Scrolling Funcitonality
        if (obj.scroll) {

            //Relative: To set next and prev button 
            tabLinksContainer.classList.add('PnRe');

                // Let the browser complete rendering
                requestAnimationFrame(() => {

                    // [placement: top/bottom - arrow: left/right] or [placement: left/right - arrow: top/bottom]
                    if ((obj.placement == 'top' || obj.placement == 'bottom')) {
                        let { arrowLt, arrowRt } = this.addPrevNextButton(obj, wrapper, tabLinksContainer);

                        // show or hide button
                        this.showHidePrevNextButton(wrapper, tabLinksContainer, arrowLt, arrowRt, true);

                        // Resizing: show or hide button
                        window.addEventListener('resize', () => {
                            this.showHidePrevNextButton(wrapper, tabLinksContainer, arrowLt, arrowRt, true);
                        })
                    } else {
                        let { arrowTp, arrowBm } = this.addPrevNextButton(obj, wrapper, tabLinksContainer);

                        // show or hide button
                        this.showHidePrevNextButton(wrapper, tabLinksContainer, arrowTp, arrowBm, false);

                        // Resizing: show or hide button
                        window.addEventListener('resize', () => {
                            this.showHidePrevNextButton(wrapper, tabLinksContainer, arrowTp, arrowBm, false);
                        })
                    }

                });
        }
    }

    // show prev-next btn when tabs width > clientWidth
    showHidePrevNextButton(tabLinksContainer, tabLinkParent, btnA, btnB, isHorizonal) {

        if (isHorizonal) {
            let scrollWidth = tabLinksContainer.scrollWidth;
            let clientWidth = tabLinkParent.clientWidth;
            if (clientWidth < scrollWidth) {
                btnA.style.display = 'flex';
                btnB.style.display = 'flex';
            } else {
                btnA.style.display = 'none';
                btnB.style.display = 'none';
            }
        } else {
            let scrollHeight = tabLinksContainer.scrollHeight;
            let clientHeight = tabLinkParent.clientHeight;
            if (clientHeight < scrollHeight) {
                btnA.style.display = 'flex';
                btnB.style.display = 'flex';
            } else {
                btnA.style.display = 'none';
                btnB.style.display = 'none';
            }
        }

    }

    addPrevNextButton(obj, tabLinksContainer, tabLinkParent) {
        // Todo: Organize this code - create function to generate button

        let holdInterval;
        let pressTimer;
        let isHeld = false;
        let debounce = null;

        const startHold = (direction) => {
            holdInterval = setInterval(() => {
                this.handleScrollByMouseHold(obj, direction);
            }, obj.scrollSpeedByHolding); // Adjust speed as needed
        };

        const stopHold = () => {
            clearInterval(holdInterval);
        };

        const leftRightArrow = () => {
            //Left Arrow Button
            let arrowLt = document.createElement('div');
            arrowLt.classList.add('CTabScrollBnLt');
            arrowLt.style.display = 'none';
            arrowLt.setAttribute('id', obj.tabLinksContainerId + 'ArLt');
            arrowLt.innerHTML = '<div class="CTabBn"><div class="CTabBnLt"></div></div>';

            //Right Arrow Button 
            let arrowRt = document.createElement('div');
            arrowRt.classList.add('CTabScrollBnRt');
            arrowRt.style.display = 'none';
            arrowRt.setAttribute('id', obj.tabLinksContainerId + 'ArRt');
            arrowRt.innerHTML = '<div class="CTabBn"><div class="CTabBnRt"></div></div>';


            //Append Buttons 
            tabLinkParent.appendChild(arrowLt);
            tabLinkParent.appendChild(arrowRt);

            // LEFT ARROW
            arrowLt.addEventListener('mousedown', () => {
                isHeld = false;
                pressTimer = setTimeout(() => {
                    isHeld = true;
                    startHold('L');
                }, 200); // Hold threshold
            });

            arrowLt.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
                if (!isHeld) {
                    this.handleScrollByClick(obj, 'L'); // Treat as single click
                }
                stopHold();
            });

            arrowLt.addEventListener('mouseleave', () => {
                clearTimeout(pressTimer);
                stopHold();
            });

            // RIGHT ARROW
            arrowRt.addEventListener('mousedown', () => {
                isHeld = false;
                pressTimer = setTimeout(() => {
                    isHeld = true;
                    startHold('R');
                }, 200);
            });

            arrowRt.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
                if (!isHeld) {
                    this.handleScrollByClick(obj, 'R'); // Treat as single click
                }
                stopHold();
            });

            arrowRt.addEventListener('mouseleave', () => {
                clearTimeout(pressTimer);
                stopHold();
            });

            tabLinksContainer.addEventListener("scroll", () => {

                if (debounce) {
                    clearTimeout(debounce); // Clear existing timeout
                }

                debounce = setTimeout(() => {
                    this.handleTabArrowVisibility(obj, arrowLt, arrowRt);
                    debounce = null; // Reset to null, don't clear here
                }, 100);
            });
            return { arrowLt, arrowRt };
        }

        const topBottomArrow = () => {
            //Top Arrow Button
            let arrowTp = document.createElement('div');
            arrowTp.classList.add('CTabScrollBnTp');
            //arrowTp.style.display = 'none';
            arrowTp.setAttribute('id', obj.tabLinksContainerId + 'ArTp');
            arrowTp.innerHTML = '<div class="CTabBn"><div class="CTabBnTp"></div></div>';

            //Bottom Arrow Button 
            let arrowBm = document.createElement('div');
            arrowBm.classList.add('CTabScrollBnBm');
            //arrowBm.style.display = 'none';
            arrowBm.setAttribute('id', obj.tabLinksContainerId + 'ArBm');
            arrowBm.innerHTML = '<div class="CTabBn"><div class="CTabBnBm"></div></div>';

            tabLinkParent.appendChild(arrowTp);
            tabLinkParent.appendChild(arrowBm);

            // TOP ARROW
            arrowTp.addEventListener('mousedown', () => {
                isHeld = false;
                pressTimer = setTimeout(() => {
                    isHeld = true;
                    startHold('T');
                }, 200); // Hold threshold
            });

            arrowTp.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
                if (!isHeld) {
                    this.handleScrollByClick(obj, 'T'); // Treat as single click
                }
                stopHold();
            });

            arrowTp.addEventListener('mouseleave', () => {
                clearTimeout(pressTimer);
                stopHold();
            });

            // BOTTOM ARROW
            arrowBm.addEventListener('mousedown', () => {
                isHeld = false;
                pressTimer = setTimeout(() => {
                    isHeld = true;
                    startHold('B');
                }, 200); // Hold threshold
            });

            arrowBm.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
                if (!isHeld) {
                    this.handleScrollByClick(obj, 'B'); // Treat as single click
                }
                stopHold();
            });

            arrowBm.addEventListener('mouseleave', () => {
                clearTimeout(pressTimer);
                stopHold();
            });

            tabLinksContainer.addEventListener("scroll", () => {

                if (debounce) {
                    clearTimeout(debounce); // Clear existing timeout
                }

                debounce = setTimeout(() => {
                    this.handleTabArrowVisibility(obj, arrowTp, arrowBm, false);
                    debounce = null; // Reset to null, don't clear here
                }, 100);
            });
            return { arrowTp, arrowBm };
        }

        if (obj.placement == 'top' || obj.placement == 'bottom') {
            return leftRightArrow();
        } else {
            return topBottomArrow();
        }
    }

    active(obj, isCalledByUser = true) {

        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.error('Tab Not Found! Please Check Your Id');
            return;
        }

        let tab = document.getElementById(obj.id + 'Cr');

        if (!tab) {
            console.error('Tab Not Found! Please Check Your Id');
            return;
        }

        let tabLinkContainer = document.getElementById(obj.id + 'Lk');

        if (!tabLinkContainer) {
            console.error('Tab Link Not Found! Please Check Your Id: Id + Lk');
            return;
        }

        tabLinkContainer.classList.add("CTabs");

        let tabLinks = tabLinkContainer.children;
        for (let i = 0; i < tabLinks.length; i++) {

            //Adds TabContent
            let content = document.getElementById(obj.id + "Ct" + i);;

            //Hide All Tab Content First
            content.style.display = 'none'
            if (tabLinks[i].classList.contains('CTabActive')) {
                tabLinks[i].classList.remove('CTabActive');
            }

            if (obj.active === i) {
                if (tabLinks[i].classList.contains('CTabDeactive')) {
                    tabLinks[i].classList.remove('CTabDeactive');
                }
                tabLinks[i].classList.add('CTabActive');
                tabLinks[i].style.display = 'flex';
                if (tabLinks[i].hasAttribute('Dd')) tabLinks[i].removeAttribute('Dd');
                content.style.display = 'block';
            }
        }
    }

    disable(obj, isCalledByUser = true) {

        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.error('Tab Not Found! Please Check Your Id');
            return;
        }

        if (!obj.disable) {
            return;
        }

        let tab = document.getElementById(obj.id + 'Cr');

        if (!tab) {
            console.error('Tab Not Found! Please Check Your Id');
            return;
        }

        let allTabItems = tab.querySelectorAll('.CTabLink');

        allTabItems.forEach((item, i) => {
            if (obj.disable.includes(i)) {
                // disable
                item.classList.remove('CTabActive');
                item.classList.add('CTabDeactive');
                item.setAttribute("Dd", "");
            } else {
                item.classList.remove('CTabDeactive');
                item.removeAttribute("Dd", "");
            }
        });
    }

    click(obj) {
        let clickedTab = document.getElementById(`${obj.id}${obj.click}`);

        if (!clickedTab.hasAttribute('Dd')) {

            let tablink = document.getElementById(obj.tabLinksContainerId).children;
            let tabContent = [];
            for (let i = 0; i < tablink.length; i++) {

                //Adds TabContent
                let getContentTab = document.getElementById(obj.id + "Ct" + i);
                tabContent.push(getContentTab);
            }
            for (let i = 0; i < tablink.length; i++) {
                try { tabContent[i].style.display = 'none'; } catch { }
                try { tablink[i].classList.remove("CTabActive"); } catch { }
            }
            clickedTab.classList.add("CTabActive");
            tabContent[clickedTab.getAttribute("Num")].style.display = "block";

            ///Start Execute  CallBack Function On the Base Of Clicked tab
            if (obj.callback) {
                if (obj.callback.hasOwnProperty(obj.click)) {
                    obj.callback[obj.click]();
                }
            }
        }
    }

    hide(obj, isCalledByUser = true) {

        if (isCalledByUser) {
            this.normalizeData(obj);
            this.setDefaultValues(obj);
        }

        if (!obj.id) {
            console.error('Tab Not Found! Please Check Your Id');
            return;
        }

        if (!obj.hide) {
            return;
        }

        let tab = document.getElementById(obj.id + 'Cr');

        if (!tab) {
            console.error('Tab Not Found! Please Check Your Id');
            return;
        }

        //Todo: fetch all tabs and make tabs hidden which is in obj.hide and unhide remaining
        for (let i = 0; i < obj.hide.length; i++) {
            let tabLink = document.getElementById(obj.id + obj.hide[i]);
            if (!tabLink) continue;

            let tabContent = document.getElementById(obj.id + "Ct" + obj.hide[i]);
            if (!tabContent) continue;

            tabLink.style.display = "none";
            tabContent.style.display = "none";

            if (tabLink.classList.contains("CTabActive")) {
                tabLink.classList.remove('CTabActive');
            }
        }
    }

    handleScrollByMouseHold(obj, direction) {
        switch (direction) {
            case 'L':
                document.getElementById(obj.id + 'Lk').scrollLeft -= 1;
                break;
            case 'R':
                document.getElementById(obj.id + 'Lk').scrollLeft += 1;
                break;
            case 'T':
                document.getElementById(obj.id + 'Lk').scrollTop -= 1;
                break;
            case 'B':
                document.getElementById(obj.id + 'Lk').scrollTop += 1;
                break;
        }
    }

    handleScrollByClick(obj, direction) {
        switch (direction) {
            case 'L':
                document.getElementById(obj.id + 'Lk').scrollLeft -= obj.scrollUnitByClick;
                break;
            case 'R':
                document.getElementById(obj.id + 'Lk').scrollLeft += obj.scrollUnitByClick;
                break;
            case 'T':
                document.getElementById(obj.id + 'Lk').scrollTop -= obj.scrollUnitByClick;
                break;
            case 'B':
                document.getElementById(obj.id + 'Lk').scrollTop += obj.scrollUnitByClick;
                break;
        }
    }

    // hide show left right arrow button based on scroll position
    handleTabArrowVisibility(obj, btnA, btnB, isHorizotal = true) {
        const parent = document.getElementById(obj.id + 'Lk' + 'Parent');
        const content = document.getElementById(obj.id + 'Lk');

        if (!parent || !content) return;

        if (isHorizotal) {
            const containerSize = parent.clientWidth;
            const scrollPos = content.scrollLeft;
            const scrollSize = content.scrollWidth;

            // Hide left button if no content to the left
            btnA.style.display = scrollPos <= 5 ? 'none' : 'block';

            // Hide right button if no content to the right
            btnB.style.display = (scrollPos + containerSize + 5) >= scrollSize ? 'none' : 'block';
        } else{
            const containerSize = parent.clientHeight;
            const scrollPos = content.scrollTop;
            const scrollSize = content.scrollHeight;

            // Hide top button if no content above
            btnA.style.display = scrollPos <= 5 ? 'none' : 'block';

            // Hide bottom button if no content below
            btnB.style.display = (scrollPos + containerSize + 5) >= scrollSize ? 'none' : 'block';
        }
    }


}

class DropDown {

    requestAnimationFrameId = null;
    constructor() {
        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.init();
                this.initClickDropDown();
            });
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.init();
                        this.initClickDropDown();
                    }, 1);
                });
            });
        }
    }

    init() {
        // Hover dropdowns: show on mouseover, hide on mouseout
        this.setupDropdowns('.dropdownBtn', 'mouseover', 'mouseout');
    }

    initClickDropDown() {
        // Click dropdowns: toggle on click, don't hide on mouseout
        this.setupClickDropdowns('.dropdownClickBtn');
    }

    setupDropdowns(buttonSelector, showEvent, hideEvent) {
        const autoDropdowns = document.querySelectorAll('.DpDnAo');

        autoDropdowns.forEach(autoDropdown => {
            const button = autoDropdown.querySelector(buttonSelector);
            if (!button) return;

            const dropdown = autoDropdown.querySelector('.dropdownContent');
            if (!dropdown) {
                console.error('Dropdown content not found! Check your HTML');
                return;
            }

            button.addEventListener(showEvent, () => this.showDropdown(button, dropdown));
            button.addEventListener(hideEvent, () => this.hideDropdown(dropdown));
        });
    }

    setupClickDropdowns(buttonSelector) {
        const autoDropdowns = document.querySelectorAll('.DpDnAo');

        autoDropdowns.forEach(autoDropdown => {
            const button = autoDropdown.querySelector(buttonSelector);
            if (!button) return;

            const dropdown = autoDropdown.querySelector('.dropdownContent');
            if (!dropdown) {
                console.error('Dropdown content not found! Check your HTML');
                return;
            }

            // For click dropdowns, we'll track visibility state and toggle it
            button.addEventListener('click', () => {
                const isVisible = dropdown.classList.contains('show');
                if (isVisible) {
                    this.hideDropdown(dropdown);
                } else {
                    //this.showDropdown(button, dropdown);
                    this.getDropdownAbsolutePosition(button, dropdown);
                }
            });

            // Close when clicking outside the dropdown
            document.addEventListener('click', (event) => {
                if (!dropdown.contains(event.target) && !button.contains(event.target)) {
                    this.hideDropdown(dropdown);
                }
            });
        });
    }

    getDropdownAbsolutePosition(dropdownBtn, dropdown) {

        if (!dropdownBtn || !dropdown) return;

        // Remove dropdown from its current parent if it has one
        if (dropdown.parentElement) {
            dropdown.parentElement.removeChild(dropdown);
        }

        // Append to <body> for absolute positioning
        document.body.appendChild(dropdown);

        const updatePosition = () => {

            // Get input element's position and dimensions
            const inputRect = dropdownBtn.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const scrollTop = window.scrollY;
            const scrollLeft = window.scrollX;

            // Get dropdown dimensions
            const dropdownHeight = dropdown.clientHeight;
            const dropdownWidth = dropdown.clientWidth;

            // Set initial position to make the dropdown visible for height calculation
            dropdown.style.display = 'block';
            dropdown.style.visibility = 'visible';
            dropdown.classList.add('show');


            // Calculate available space
            const spaceBelow = viewportHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const spaceRight = viewportWidth - inputRect.left;
            const offset = 5; // Reduced offset for closer positioning

            // Clear all positions first to avoid conflicts
            dropdown.style.top = 'auto';
            dropdown.style.bottom = 'auto';
            dropdown.style.left = 'auto';
            dropdown.style.right = 'auto';

            // Vertical positioning
            if (spaceBelow >= dropdownHeight) {
                // Enough space below
                dropdown.style.top = `${inputRect.bottom + scrollTop + offset}px`;
            } else if (spaceAbove >= dropdownHeight) {
                // Enough space above
                dropdown.style.top = `${inputRect.top + scrollTop - dropdown.offsetHeight - offset}px`;
            } else {
                // Not enough space either way - place where there's more space
                if (spaceBelow >= spaceAbove) {
                    dropdown.style.top = `${inputRect.bottom + scrollTop + offset}px`;
                } else {
                    dropdown.style.top = `${inputRect.top + scrollTop - dropdown.offsetHeight - offset}px`;
                }
            }

            // Horizontal positioning
            // Try to align with input field first
            if (inputRect.left + dropdownWidth <= viewportWidth) {
                // dropdown fits when aligned with input left edge
                dropdown.style.left = `${inputRect.left}px`;
            } else if (inputRect.right - dropdownWidth >= 0) {
                // dropdown fits when aligned with input right edge
                dropdown.style.left = `${inputRect.right - dropdownWidth}px`;
            } else {
                // Center the dropdown if it doesn't fit aligned with input
                const leftPosition = Math.max(0, Math.min(inputRect.left, viewportWidth - dropdownWidth));
                dropdown.style.left = `${leftPosition}px`;
            }
            this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
        };

        // Run once immediately and then on animation frame
        this.requestAnimationFrameId = requestAnimationFrame(updatePosition);

        // Optional: Add resize listener to handle window resize
        if (!this.resizeListener) {
            this.resizeListener = () => {
                if (this.requestAnimationFrameId) {
                    cancelAnimationFrame(this.requestAnimationFrameId);
                }
                this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
            };
            window.addEventListener('resize', this.resizeListener);
        }
    }

    showDropdown(button, dropdown) {
        // Temporarily make the dropdown visible but hidden to measure its height
        dropdown.style.display = 'block';
        dropdown.style.visibility = 'hidden';
        dropdown.style.height = 'auto'; // Temporary to get the full height

        const buttonRect = button.getBoundingClientRect();
        const dropdownHeight = dropdown.offsetHeight;
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Reset height to zero for animation
        dropdown.style.height = '0';
        dropdown.style.overflow = 'hidden';
        dropdown.style.transition = 'height 0.3s ease-in-out, opacity 0.2s ease-in-out';
        dropdown.style.opacity = '0';

        // Position the dropdown based on available space
        if (spaceBelow >= dropdownHeight) {
            dropdown.classList.remove('top');
            dropdown.classList.add('bottom');
        } else if (spaceAbove >= dropdownHeight) {
            dropdown.classList.remove('bottom');
            dropdown.classList.add('top');
        } else {
            // If no space available, show with scrollbar
            dropdown.classList.remove('top');
            dropdown.classList.add('bottom');
            const availableSpace = Math.max(spaceBelow, spaceAbove);
            dropdown.style.maxHeight = `${availableSpace - 10}px`; // 10px buffer
        }

        // Make visible and start animation
        dropdown.style.visibility = 'visible';
        dropdown.classList.add('show');

        // Trigger animation in next frame
        requestAnimationFrame(() => {
            dropdown.style.height = `${dropdownHeight}px`;
            dropdown.style.opacity = '1';
        });

        // Once animation completes, remove fixed height to allow content changes
        setTimeout(() => {
            if (dropdown.classList.contains('show')) {
                dropdown.style.height = 'auto';
            }
        }, 300); // Match the transition duration
    }

    hideDropdown(dropdown) {
        if (!dropdown.classList.contains('show')) return;

        if (this.requestAnimationFrameId) {
            cancelAnimationFrame(this.requestAnimationFrameId);
        }

        // Get current height before collapsing
        const height = dropdown.offsetHeight;

        // Set explicit height for animation
        dropdown.style.height = `${height}px`;
        dropdown.style.overflow = 'hidden';

        // Force a repaint to ensure the starting height is applied
        let temp = dropdown.offsetHeight;

        // Start animation
        dropdown.style.height = '0';
        dropdown.style.opacity = '0';

        // Remove 'show' class when animation completes
        setTimeout(() => {
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';

            // Reset styles after hiding
            dropdown.style.height = '';
            dropdown.style.overflow = '';
            dropdown.style.opacity = '';
        }, 300); // Match the transition duration
    }

}

class DragAndDrop {

    init() {

        let dragSource = document.querySelectorAll('.dragSource');
        let dropTarget = document.querySelectorAll('.dropTarget');

        if (!dragSource || !dropTarget) {
            console.log('Source and target are required for drag and drop functionality.');
            return;
        }

        //handle drag source
        this.handleDragSource(dragSource);
        this.handleDropTarget(dropTarget);

    }

    handleDragSource(dragSource) {

        function generateRandomId() {
            return Math.random().toString(36).substr(2, 9);
        }

        dragSource.forEach(sourceElement => {
            sourceElement.setAttribute('id', generateRandomId());
            sourceElement.setAttribute('draggable', 'true');
            sourceElement.addEventListener('dragstart', this.dragstartHandler.bind(this));
        })

    }

    handleDropTarget(dropTarget) {

        dropTarget.forEach(targetElement => {
            targetElement.addEventListener('dragover', this.dragoverHandler.bind(this));
            targetElement.addEventListener('drop', this.dropHandler.bind(this));
        })

    }

    dragstartHandler(ev) {
        ev.dataTransfer.setData("elementId", ev.target.id);
    }

    dragoverHandler(ev) {
        ev.preventDefault(); // Necessary to allow drop
    }

    dropHandler(ev) {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("elementId");
        const draggedEl = document.getElementById(data);
        if (draggedEl) {
            ev.target.appendChild(draggedEl);
        }
    }
}

class Keypad {

    constructor(obj) {
        if (!obj || !obj.id || !obj.values) return;

        this.id = obj.id;

        this.values = obj.values;

        this.columns = obj.columns || 1; // Default to 1 columns if not specified
        this.callback = obj.callback || function () { }; // Default callback if not provided

        this.type = obj.type || null;

        this.keypadBackground = obj.keypadBackground || 'CrBdGy80Lt';

        this.createKeypad();
    }

    createKeypad() {

        switch (this.type) {
            case 'floating':
                this.createFloatingKeypad()
                break;
            default:
                this.createDefaultKeypad();
                break;
        }
    }

    generateKeypad({
        keypadContainer
    }) {
        let keyPad = document.createElement("div");
        keyPad.className = `DyFx FxDnCn Gp2 ${this.keypadBackground}`;

        let i = 0;
        while (i < this.values.length) {
            let row = document.createElement("div");
            row.className = 'DyFx Gp2';
            let j = 0;
            for (j = 0; j < this.columns && (i + j) < this.values.length; j++) {
                let button = document.createElement("button");
                button.className = "Bn";
                let value = this.values[i + j]
                button.style.color = value.color;
                button.style.background = value.background;
                button.style.width = value.width;
                button.textContent = value.key;
                button.addEventListener("click", () => {
                    // Add your logic here for what happens when the button is clicked
                    let inputField = keypadContainer.querySelector("input");
                    if (inputField) {
                        this.onPress({ key: value.key, inputField });
                    }
                });
                row.appendChild(button);
            }
            i = i + j;
            keyPad.appendChild(row);
        }
        return keyPad;
    }

    createDefaultKeypad() {
        let keypadContainer = document.getElementById(this.id);

        let keyPad = this.generateKeypad({
            keypadContainer
        })

        keypadContainer.appendChild(keyPad);
    }

    createFloatingKeypad() {
        let keypadContainer = document.getElementById(this.id);

        let keyPad = this.generateKeypad({
            keypadContainer,
        })

        keyPad.classList.add('PnAe');
        let inputField = keypadContainer.querySelector('input');
        if (!inputField) return;

        keyPad.setAttribute('id', this.id + 'KeyPad');
        if (inputField) {
            inputField.addEventListener('focus', () => {
                document.body.appendChild(keyPad);
                this.setKeypadAbsolutePosition(this.id, inputField);
            })
            document.body.addEventListener('click', (e) => {
                if (!keyPad || keyPad.contains(e.target) || e.target === inputField) return;
                if (document.body.contains(keyPad)) {
                    document.body.removeChild(keyPad);
                }
            })
        }
    }

    onPress({ key, inputField }) {
        // Handle special control keys
        switch (key) {
            case "Del":
            case "Delete":
                inputField.value = inputField.value.slice(0, -1);
                break;

            case "Clear":
            case "Escape":
                inputField.value = "";
                break;

            case "Enter":
                this.callback(inputField.value);
                // Optional: Clear after submit
                inputField.value = "";
                break;

            case "Tab":
                // Add tab spacing (4 spaces) or handle tab navigation
                inputField.value += "    "; // 4 spaces for tab
                break;

            case "Space":
            case " ":
                inputField.value += " ";
                break;

            case "Backspace":
                inputField.value = inputField.value.slice(0, -1);
                break;

            // Control key combinations (if event is provided)
            case "Select All":
                if (inputField.select) {
                    inputField.select(); // Select all text
                }
                break;

            case "Copy":
                // Copy selected text to clipboard
                const selectedText = getSelectedText(inputField);
                if (selectedText) {
                    copyToClipboard(selectedText);
                    console.log("Copied to clipboard:", selectedText);
                } else {
                    console.log("No text selected to copy");
                }
                break;

            case "Paste":
                // Paste from clipboard (you'd need to handle this with clipboard API)
                console.log("Paste triggered");
                handlePaste(inputField);
                break;


            case "Shift+Tab":
                // Reverse tab or remove indentation
                const lines = inputField.value.split('\n');
                const lastLine = lines[lines.length - 1];
                if (lastLine.startsWith('    ')) {
                    lines[lines.length - 1] = lastLine.slice(4);
                    inputField.value = lines.join('\n');
                }
                break;

            default:
                // Handle regular character input
                if (key && key.length === 1) {
                    // Single character - add to input
                    inputField.value += key;
                } else if (key && key.length > 1) {
                    // Multi-character string - add as is
                    inputField.value += key;
                }
                break;
        }

        // Trigger input event to notify of changes
        if (inputField.dispatchEvent) {
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // Helper function for paste handling
    async handlePaste(inputField) {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                inputField.value += text;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
            }
        } catch (err) {
            console.log('Paste not available or permission denied');
        }
    }

    // Helper function to get selected text from input field
    getSelectedText(inputField) {
        if (inputField.selectionStart !== undefined && inputField.selectionEnd !== undefined) {
            // For input/textarea elements
            const start = inputField.selectionStart;
            const end = inputField.selectionEnd;
            return inputField.value.substring(start, end);
        } else if (window.getSelection) {
            // For other elements or general selection
            return window.getSelection().toString();
        }
        return '';
    }

    // Helper function to copy text to clipboard
    async copyToClipboard(text) {
        try {
            // Modern clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback method
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                textArea.setSelectionRange(0, 99999); // For mobile

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    return true;
                } else {
                    throw new Error('Copy command failed');
                }
            }
        } catch (err) {
            console.error('Failed to copy text:', err);
            return false;
        }
    }

    // Enhanced version that can detect key combinations from keyboard events
    onKeyDown(event, inputField) {
        const key = event.key;
        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;
        const alt = event.altKey;

        // Build key combination string
        let keyCombo = '';
        if (ctrl) keyCombo += 'Ctrl+';
        if (shift) keyCombo += 'Shift+';
        if (alt) keyCombo += 'Alt+';
        keyCombo += key;

        // Prevent default for special combinations
        if (ctrl && ['a', 'c', 'v', 'x', 'z'].includes(key.toLowerCase())) {
            event.preventDefault();
        }

        if (key === 'Tab') {
            event.preventDefault();
        }

        // Call the main handler
        onPress({ value: keyCombo, inputField, event });
    }

    setKeypadAbsolutePosition(inputElementId, inputElement) {
        const keypadElement = document.getElementById(inputElementId + 'KeyPad');

        const updatePosition = () => {
            // Make sure elements exist
            if (!inputElement || !keypadElement) {
                return;
            }

            // Get input element's position and dimensions
            const inputRect = inputElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const scrollTop = window.scrollY;
            const scrollLeft = window.scrollX;

            // Get keypad dimensions
            const keypadHeight = keypadElement.clientHeight;
            const keypadWidth = keypadElement.clientWidth;

            // Set initial position to make the keypad visible for height calculation
            keypadElement.style.display = 'flex';

            // Calculate available space
            const spaceBelow = viewportHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const spaceRight = viewportWidth - inputRect.left;
            const offset = 5; // Reduced offset for closer positioning

            // Clear all positions first to avoid conflicts
            keypadElement.style.top = 'auto';
            keypadElement.style.bottom = 'auto';
            keypadElement.style.left = 'auto';
            keypadElement.style.right = 'auto';

            // Vertical positioning
            if (spaceBelow >= keypadHeight) {
                // Enough space below
                keypadElement.style.top = `${inputRect.bottom + scrollTop + offset}px`;
            } else if (spaceAbove >= keypadHeight) {
                // Enough space above
                keypadElement.style.top = `${inputRect.top + scrollTop - keypadElement.offsetHeight - offset}px`;
            } else {
                // Not enough space either way - place where there's more space
                if (spaceBelow >= spaceAbove) {
                    keypadElement.style.top = `${inputRect.bottom + scrollTop + offset}px`;
                } else {
                    keypadElement.style.top = `${inputRect.top + scrollTop - keypadElement.offsetHeight - offset}px`;
                }
            }

            // Horizontal positioning
            // Try to align with input field first
            if (inputRect.left + keypadWidth <= viewportWidth) {
                // keypad fits when aligned with input left edge
                keypadElement.style.left = `${inputRect.left}px`;
            } else if (inputRect.right - keypadWidth >= 0) {
                // keypad fits when aligned with input right edge
                keypadElement.style.left = `${inputRect.right - keypadWidth}px`;
            } else {
                // Center the keypad if it doesn't fit aligned with input
                const leftPosition = Math.max(0, Math.min(inputRect.left, viewportWidth - keypadWidth));
                keypadElement.style.left = `${leftPosition}px`;
            }
            this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
        };

        // Run once immediately and then on animation frame
        this.requestAnimationFrameId = requestAnimationFrame(updatePosition);

        // Optional: Add resize listener to handle window resize
        if (!this.resizeListener) {
            this.resizeListener = () => {
                if (this.requestAnimationFrameId) {
                    cancelAnimationFrame(this.requestAnimationFrameId);
                }
                this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
            };
            window.addEventListener('resize', this.resizeListener);
        }
    }

}
    
class ToastHelper {

    static createElement(obj) {
        if (!obj || !obj.element) {
            throw new Error("The 'element' property is required to create an element.");
        }

        const el = document.createElement(obj.element);

        for (const [key, value] of Object.entries(obj)) {
            switch (key) {
                case 'element':
                    break; // Skip as it was already used
                case 'class':
                    el.className = value; // Handle class property
                    break;
                case 'style':
                    Object.assign(el.style, value); // Apply styles as an object
                    break;
                case 'innerText':
                    el.innerText = value; // Handle innerText
                    break;
                case 'innerHTML':
                    el.innerHTML = value; // Handle innerHTML
                    break;
                default:
                    el.setAttribute(key, value); // Set all other attributes
                    break;
            }
        }

        return el;
    }

}

class Toast {
    constructor() {

        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.initToast();
            });
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.initToast();
                    }, 1);
                });
            });
        }

    }

    initToast() {

        // get all toaster from the dom
        let toasters = document.getElementsByClassName('ToastCT');

        Array.from(toasters).forEach((toast, index) => {

            // setting unique attribute to indentify particular toast
            toast.setAttribute('toast-number', index);

            // Initially hide all the toast 
            toast.classList.add('DyNe');

            toast.setAttribute('data-initialRender', true); // to check initial rendering !important to attach even listeners
            toast.setAttribute('data-timeout', null); // to prevent autoclose 

        });

    }

    showToast(obj) {

        // get all toaster in the dom
        let toast = document.getElementById(obj.id);

        if (!toast) return;

        obj.width = obj.width || 40;
        obj.textColor = obj.textColor || 'CrWe';
        obj.animation = obj.animation || '';

        let placement = '';
        if (!obj.placement) {
            placement = 'PnBm5 PnLt5'; // default;
        } else {
            if (obj.placement.top) {
                placement = `PnTp${obj.placement.top}`;
            }
            else {
                placement += `PnBm${obj.placement.bottom}`;
            }
            if (obj.placement.left) {
                placement += ` PnLt${obj.placement.left}`;
            }
            else {
                placement += ` PnRt${obj.placement.right}`;
            }
        }

        obj.zIndex = obj.zIndex || 'ZIx10000000000'; // default zIndex

        obj.classes = {
            toastCT: `ToastCT DyFx FxDnCn PnFd ${placement} ${obj.zIndex} ${obj.textColor} ${obj.animation} WhMx97vw WhMn${obj.width}vw`,
            hiddenToastCT: 'ToastCT DyNe',
        };

        let dontShow = this.handleDontShowAgainHelper(toast); // return boolean

        if (dontShow) return;

        toast.setAttribute('class', obj.classes.toastCT);

        const initialRender = toast.getAttribute('data-initialRender') === 'true';
        if (initialRender) { // only first time attach evenListener
            this.handleDontShowAgain(toast);
            this.handleSuccessFailBtn(obj, toast);
            toast.setAttribute('data-initialRender', false);
        }

        //clear timeout first
        const timeoutId = toast.dataset.timeout !== 'null' ? Number(toast.dataset.timeout) : null;
        if (timeoutId) {
            clearTimeout(timeoutId);
            toast.dataset.timeout = ''; // Reset dataset value
        }

        if (obj.closeBtn) {
            this.handleCloseBtn(obj, toast);
        } else {
            toast.querySelector('.ToastCloseBtn')?.remove();
        }

        if (obj.autoClose > 0) {
            this.autoClose(obj, toast);
        }

    }

    handleCloseBtn(obj, toast) {

        const toastHeadingContainer = toast.getElementsByClassName('ToastHeadingContainer')[0];
        const checkCloseBtnExist = toastHeadingContainer.getElementsByClassName("ToastCloseBtn");

        if (checkCloseBtnExist.length > 0) {
            checkCloseBtnExist[0].addEventListener('click', () => {
                if (obj.id == "StackingToast") {
                    this.removeElementFromDOM(toast);
                    return;
                }
                toast.setAttribute('class', 'ToastCT DyNe')
            });
            return;
        }

        const closeBtn = ToastHelper.createElement({
            element: 'span',
            class: obj.classes.closeBtn,
            innerText: 'X',
        });

        toastHeadingContainer.appendChild(closeBtn);

        closeBtn.addEventListener('click', () => {
            if (obj.id == "StackingToast") {
                this.removeElementFromDOM(toast);
                return;
            }
            toast.setAttribute('class', 'ToastCT DyNe')
        });

    }

    autoClose(obj, toast) {
        toast.dataset.timeout = setTimeout(() => {
            if (obj.id == "StackingToast") {
                this.removeElementFromDOM(toast)
            } else {
                toast.setAttribute('class', obj.classes.hiddenToastCT);
            }
        }, obj.autoClose);
    }

    handleDontShowAgain(toast) {
        const inputCheckBox = toast.querySelector('.toastCheckbox');
        if (inputCheckBox) {
            inputCheckBox.addEventListener('click', (e) => {
                this.handleDontShowAgainHelper(toast);
            })
        }
    }

    handleDontShowAgainHelper(toast) {

        // Find the checkbox element inside the toast
        const checkbox = toast.querySelector('input[type="checkbox"]');

        // Check if the checkbox exists and determine if it is checked
        if (checkbox) {
            return checkbox.checked;
        }

        return false;

    }

    handleSuccessFailBtn(obj, toast) {
        const successBtn = toast.querySelector('.toastBtnSuccess');
        const failedBtn = toast.querySelector('.toastBtnFailed');

        if (successBtn) {
            successBtn.addEventListener('click', () => {
                this.handleSuccessFailBtnHelper('success', obj, toast);
            })
        }
        if (failedBtn) {
            failedBtn.addEventListener('click', () => {
                this.handleSuccessFailBtnHelper('failed', obj, toast);
            })
        }
    }

    handleSuccessFailBtnHelper(btnType, obj, toast) {
        switch (btnType) {
            case 'success':
                obj.onSuccess();
                break;
            case 'failed':
                obj.onFail();
                break;
            default:
                break;
        }
    }

    showStackingToast(obj) {

        const stackingToasts = document.getElementsByClassName('StackingToast');
        const count = stackingToasts.length;
        const toastElement = this.convertStringHTMLtoHTMLElement(obj.customHTML);

        obj.width = obj.width || 40;
        obj.textColor = obj.textColor || 'CrWe';

        let placement = '';
        if (!obj.placement) {
            placement = 'PnLt5'; // default;
            obj.position = 'bottom';
        } else {
            if (obj.placement.top >= 0) {
                obj.position = 'top';
            }
            else {
                obj.position = 'bottom';
            }
            if (obj.placement.left >= 0) {
                placement += ` PnLt${obj.placement.left} `;
            }
            else {
                placement += ` PnRt${obj.placement.right} `;
            }
        }

        obj.classes = {
            hiddenToastCT: 'StackingToast ToastCT DyNe',
            toastCT: `StackingToast ToastCT DyFx FxDnCn PnFd ${placement} ZIx10000000000 ${obj.textColor} WhMx97vw WhMn${obj.width}vw`,
        };

        if (count == 0) {

            toastElement.setAttribute('stack-number', 0);
            let positionX = this.getPosition(obj, 0, 0);
            toastElement.setAttribute('class', obj.classes.toastCT);
            toastElement.style = obj.position == 'bottom' ? `bottom: ${positionX}` : `top: ${positionX}`;
            document.body.appendChild(toastElement);

            const deepObj = { ...obj }; // deep copy: other json.parse(json.stringify(obj)) remove the callback functions

            if (deepObj.closeBtn) {
                this.handleCloseBtn(deepObj, toastElement);
            } else {
                toastElement.querySelector('.ToastCloseBtn')?.remove();
            }

            if (deepObj.autoClose > 0) {
                this.autoClose(deepObj, toastElement);
            }

            this.handleSuccessFailBtn(deepObj, toastElement);

            const toastHeight = this.getElementHeight(toastElement);

            toastElement.setAttribute('toast-height', toastHeight);

        } else {

            let numberOfLastStack = stackingToasts[count - 1].getAttribute('stack-number');
            if (numberOfLastStack == obj.maxStack - 1) return;

            let toastHeight = stackingToasts[count - 1].getAttribute('toast-height');
            toastElement.setAttribute('toast-height', toastHeight);

            toastElement.setAttribute('stack-number', parseInt(numberOfLastStack) + 1);
            let positionX = this.getPosition(obj, parseInt(numberOfLastStack) + 1, toastHeight);
            toastElement.setAttribute('class', obj.classes.toastCT);
            toastElement.style = obj.position == 'bottom' ? `bottom: ${positionX}` : `top: ${positionX}`;

            document.body.appendChild(toastElement);

            const deepObj = { ...obj }; // deep copy: other json.parse(json.stringify(obj)) remove the callback functions

            if (deepObj.closeBtn) {
                this.handleCloseBtn(deepObj, toastElement);
            } else {
                toastElement.querySelector('.ToastCloseBtn')?.remove();
            }

            if (deepObj.autoClose > 0) {
                this.autoClose(deepObj, toastElement);
            }

            this.handleDontShowAgain(toastElement);

            this.handleSuccessFailBtn(deepObj, toastElement);

        }

    }

    getPosition(obj, currentToastNumber, toastHeight) {

        const offset = 5; // Space between toasts (in pixels)
        let positionValue = 0;

        // Common logic for vertical stacking is the same:
        // offset = (number of previous toasts * toastHeight) + ((number of previous toasts + 1) * offset)
        // That is: currentToastNumber * toastHeight + (currentToastNumber + 1) * offset
        switch (obj.position) {
            case 'bottom':
                // Stack from bottom-left: first toast sits at the bottom (with an offset)
                positionValue = `${(currentToastNumber * toastHeight + obj.placement.bottom) + ((currentToastNumber + 1) * offset)}px`;
                break;

            case 'top':
                // Stack from bottom-right: first toast sits at the bottom (with an offset)
                positionValue = `${(currentToastNumber * toastHeight + obj.placement.top) + ((currentToastNumber + 1) * offset)}px`;
                break;

            default:
                console.error('Unknown position:', obj.position);
                return null;
        }

        return positionValue;
    }

    convertStringHTMLtoHTMLElement(customHTML) {
        // Use a <template> to parse the HTML string
        const template = document.createElement('template');
        template.innerHTML = customHTML.trim(); // Parse the HTML

        // Extract the first element from the template
        const toastElement = template.content.firstChild;
        return toastElement;
    }

    getElementHeight(element) {
        if (!element || !(element instanceof HTMLElement)) {
            console.error('Invalid element: Please provide a valid HTML element.');
            return 0;
        }

        // Temporarily attach the element to the DOM if not already present
        const isDetached = !document.body.contains(element);
        if (isDetached) {
            // Temporarily hide the element off-screen if not in DOM
            element.style.position = 'fixed';
            element.style.visibility = 'hidden';
            element.style.top = '-9999px';
            document.body.appendChild(element);
        }

        // Force reflow to ensure correct layout before measurement
        element.getBoundingClientRect();

        // Measure the height
        const height = element.offsetHeight;

        // Clean up by removing the element if it was temporarily attached
        if (isDetached) {
            document.body.removeChild(element);
        }

        return height;
    }

    removeElementFromDOM(toast) {
        if (!toast || !(toast instanceof HTMLElement)) {
            console.error('Invalid toast element provided.');
            return;
        }

        // Remove the toast element from the DOM
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }

        // Perform additional cleanup
        if (toast.dataset.timeout) {
            clearTimeout(toast.dataset.timeout);
        }
    }

}

class ToolTip {

    //[TODO: use position absolute with transform: translate3d to settting positioning]

    timeoutEnter; // for handling timeout of when mouseenter
    timeoutLeave; // for handling timeout of when mouseleave
    requestAnimationFrameId;

    constructor() {
        this.timeoutEnter = null;
        this.timeoutLeave = null;

        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.initAttributeBasedToolTip();
            });
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.initAttributeBasedToolTip();
                    }, 1);
                });
            });
        }

        // scroll cleanup function
        this.cleanUp = null;
        this.requestAnimationFrameId = null;
    }

    init(toolTipConfig) {
        const toolTipButton = document.querySelector(`#${toolTipConfig.Id}`);

        if (!toolTipButton) {
            console.error('No tooltip button found with the provided ID');
            return;
        }

        this.addTooltipEventListeners({ toolTipButton, toolTipConfig });

        toolTipButton.addEventListener('mouseenter', (e) => {
            clearTimeout(this.timeoutEnter);
            clearTimeout(this.timeoutLeave);
            if (this.requestAnimationFrameId) {
                cancelAnimationFrame(this.requestAnimationFrameId);
            }

            // first remove if older tooltip exist 
            this.removeImmediately(e);

            this.create(toolTipConfig, e);
        });

    }

    initAttributeBasedToolTip() {
        let toolTipButtons = document.querySelectorAll('.ToolTipButton');
        toolTipButtons.forEach((toolTipButton) => {
            let toolTipConfig = toolTipButton.getAttribute('ot');
            if (toolTipConfig) {
                toolTipConfig = JSON.parse(toolTipConfig);
                let buttonId = toolTipButton.getAttribute('id');
                if (!buttonId) {
                    let dynamicId = Utils.generateRandomString();
                    buttonId = dynamicId;
                    toolTipButton.setAttribute('id', dynamicId);
                    //console.log('dynamic id added');
                }

                toolTipConfig.Id = buttonId;

                this.addTooltipEventListeners({ toolTipButton, toolTipConfig });

            }
        })
    }

    create(tooltipOptions, event) {

        // The button is our relative container.
        const button = event.target;

        // Create the tooltip element.
        const tooltip = document.createElement('div');
        tooltip.classList.add('ToolTip');
        tooltip.textContent = tooltipOptions.Tt;

        this.setAbsolutePosition({ tooltipOptions, tooltip, button });
        //if (tooltipOptions.Fixed) {
        //    this.setFixedPosition({ tooltipOptions, tooltip, button });
        //} else {
        //    this.setAbsolutePosition({ tooltipOptions, tooltip, button });
        //}

        // Add opacity after some time of rendering so our animation can take action
        this.timeoutEnter = setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 200);

        // Set custom CSS variables for colors if provided.
        if (tooltipOptions.Cr) {
            tooltip.style.setProperty('--CrTeTlTpTt', tooltipOptions.Cr);
        }
        if (tooltipOptions.CrBd) {
            tooltip.style.setProperty('--CrTeTlTpBd', tooltipOptions.CrBd);
        }
    }

    remove(e) {
        // Use e.currentTarget to reliably reference the button element.
        const button = e.currentTarget;
        const tooltip = document.body.querySelector(`.ToolTip`);
        if (!tooltip) return;

        // Fade out the tooltip
        tooltip.style.opacity = '0';

        // Remove the tooltip after the fade-out transition
        this.timeoutLeave = setTimeout(() => {
            tooltip.remove();
        }, 300);
    }

    removeImmediately(e) {
        // Use e.currentTarget to reliably reference the button element.
        const button = e.currentTarget;
        const tooltip = document.body.querySelector(`.ToolTip`);
        if (!tooltip) return;
        tooltip.remove();
    }

    getToolTipPosition(elementId, element) {
        // Get input element's position and dimensions
        const buttonRect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Get tooltip dimensions
        const toolTipElement = document.getElementById(elementId)?.querySelector('.ToolTip');
        const toolTipHeight = toolTipElement.clientHeight;
        const toolTipWidth = toolTipElement.clientWidth;

        // Calculate available space in all four directions
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const spaceRight = viewportWidth - buttonRect.right;
        const spaceLeft = buttonRect.left;

        let position = {
            top: 'auto',
            bottom: 'auto',
            left: 'auto',
            right: 'auto'
        };

        // First, try to position below if there's enough space
        if (spaceBelow >= toolTipHeight) {
            position.top = '105%';
            return position;
        }

        // Second, try to position above if there's enough space
        if (spaceAbove >= toolTipHeight) {
            position.bottom = '105%';
            return position;
        }

        // Third, try to position to the right if there's enough space
        if (spaceRight >= toolTipWidth) {
            position.left = '105%';
            return position;
        }

        // Finally, position to the left if all else fails
        position.right = '105%';
        return position;
    }

    setAbsolutePosition({ tooltipOptions, tooltip, button }) {

        tooltip.style.position = 'absolute';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease-in';
        tooltip.style.maxWidth = tooltipOptions.Width || '200px';
        tooltip.style.wordBreak = 'break-word';

        document.body.appendChild(tooltip);

        const toolTipElement = document?.querySelector('.ToolTip');

        const offset = 10;

        const updatePosition = () => {
            const buttonRect = button.getBoundingClientRect();
            const scrollTop = window.scrollY;
            const scrollLeft = window.scrollX;

            const toolTipWidth = toolTipElement.clientWidth;

            function alignHorizontally() {
                let buttonCenter = buttonRect.left + (buttonRect.width / 2);
                let halfOfToolTipWidth = toolTipWidth / 2;

                if (buttonCenter - halfOfToolTipWidth < 0) {
                    tooltip.style.left = '0px';
                }
                else if (buttonCenter + halfOfToolTipWidth > window.innerWidth) {
                    tooltip.style.right = '0px';
                } else {
                    // align center
                    tooltip.style.left = `${buttonCenter - halfOfToolTipWidth}px`;
                }
            }

            function alignVertically() {
                let buttonCenter = buttonRect.top + (buttonRect.height / 2);
                let halfOfToolTipHeight = tooltip.offsetHeight / 2;

                if (buttonCenter - halfOfToolTipHeight < 0) {
                    // If tooltip would go above viewport, align to top of viewport
                    tooltip.style.top = '0px';
                    tooltip.style.transform = 'none';
                }
                else if (buttonCenter + halfOfToolTipHeight > window.innerHeight) {
                    // If tooltip would go below viewport, align to bottom of viewport
                    tooltip.style.bottom = '0px';
                    tooltip.style.top = 'auto';
                    tooltip.style.transform = 'none';
                } else {
                    // align center
                    tooltip.style.top = `${buttonCenter - halfOfToolTipHeight}px`;
                    tooltip.style.transform = 'none';
                }
            }

            switch (tooltipOptions.Pn) {
                case 'Top':
                    tooltip.classList.add('Top');
                    tooltip.classList.remove('Bottom', 'Left', 'Right');
                    tooltip.style.bottom = 'auto';
                    tooltip.style.top = `${buttonRect.top + scrollTop - tooltip.offsetHeight - offset}px`;

                    // Calculate and set arrow position for Top tooltip
                    const buttonCenterXTop = buttonRect.left + buttonRect.width / 2;
                    const tooltipLeftTop = tooltip.offsetLeft;
                    const arrowOffsetTop = buttonCenterXTop - tooltipLeftTop;
                    tooltip.style.setProperty('--arrow-left', `${arrowOffsetTop}px`);

                    alignHorizontally();
                    break;

                case 'Bottom':
                    tooltip.classList.add('Bottom');
                    tooltip.classList.remove('Top', 'Left', 'Right');
                    tooltip.style.bottom = 'auto';
                    tooltip.style.top = `${buttonRect.bottom + scrollTop + offset}px`;

                    // Calculate and set arrow position for Bottom tooltip
                    const buttonCenterXBottom = buttonRect.left + buttonRect.width / 2;
                    const tooltipLeftBottom = tooltip.offsetLeft;
                    const arrowOffsetBottom = buttonCenterXBottom - tooltipLeftBottom;
                    tooltip.style.setProperty('--arrow-left', `${arrowOffsetBottom}px`);

                    alignHorizontally();
                    break;

                case 'Right':
                    tooltip.classList.add('Right');
                    tooltip.classList.remove('Top', 'Bottom', 'Left');
                    tooltip.style.right = 'auto';
                    tooltip.style.left = `${buttonRect.right + scrollLeft + offset}px`;
                    tooltip.style.top = `${buttonRect.top + scrollTop + buttonRect.height / 2}px`;
                    tooltip.style.transform = 'translateY(-50%)';

                    // Calculate and set arrow position for Right tooltip (vertical position)
                    const tooltipTopRight = tooltip.getBoundingClientRect().top;
                    const buttonCenterYRight = buttonRect.top + buttonRect.height / 2;
                    const arrowOffsetRight = buttonCenterYRight - tooltipTopRight;
                    tooltip.style.setProperty('--arrow-top', `${arrowOffsetRight}px`);
                    break;

                case 'Left':
                    tooltip.classList.add('Left');
                    tooltip.classList.remove('Top', 'Bottom', 'Right');
                    tooltip.style.right = 'auto';
                    tooltip.style.left = `${buttonRect.left + scrollLeft - tooltip.offsetWidth - offset}px`;
                    tooltip.style.top = `${buttonRect.top + scrollTop + buttonRect.height / 2}px`;
                    tooltip.style.transform = 'translateY(-50%)';

                    // Calculate and set arrow position for Left tooltip (vertical position)
                    const tooltipTopLeft = tooltip.getBoundingClientRect().top;
                    const buttonCenterYLeft = buttonRect.top + buttonRect.height / 2;
                    const arrowOffsetLeft = buttonCenterYLeft - tooltipTopLeft;
                    tooltip.style.setProperty('--arrow-top', `${arrowOffsetLeft}px`);
                    break;

                default:
                    // Auto-position tooltip where space is available
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;

                    // Reset classes and styles
                    tooltip.classList.remove('Top', 'Bottom', 'Left', 'Right');
                    tooltip.style.transform = '';

                    // Check if tooltip fits below the button
                    if (buttonRect.bottom + tooltip.offsetHeight + offset <= viewportHeight) {
                        tooltip.classList.add('Bottom');
                        tooltip.style.bottom = 'auto';
                        tooltip.style.top = `${buttonRect.bottom + scrollTop + offset}px`;

                        // Set arrow position
                        const buttonCenterXAuto = buttonRect.left + buttonRect.width / 2;
                        const tooltipLeftAuto = tooltip.offsetLeft;
                        const arrowOffsetAuto = buttonCenterXAuto - tooltipLeftAuto;
                        tooltip.style.setProperty('--arrow-left', `${arrowOffsetAuto}px`);

                        alignHorizontally();
                    }
                    // Check if tooltip fits above the button
                    else if (buttonRect.top - tooltip.offsetHeight - offset >= 0) {
                        tooltip.classList.add('Top');
                        tooltip.style.bottom = 'auto';
                        tooltip.style.top = `${buttonRect.top + scrollTop - tooltip.offsetHeight - offset}px`;

                        // Set arrow position
                        const buttonCenterXAuto = buttonRect.left + buttonRect.width / 2;
                        const tooltipLeftAuto = tooltip.offsetLeft;
                        const arrowOffsetAuto = buttonCenterXAuto - tooltipLeftAuto;
                        tooltip.style.setProperty('--arrow-left', `${arrowOffsetAuto}px`);

                        alignHorizontally();
                    }
                    // Check if tooltip fits to the right of the button
                    else if (buttonRect.right + tooltip.offsetWidth + offset <= viewportWidth) {
                        tooltip.classList.add('Right');
                        tooltip.style.right = 'auto';
                        tooltip.style.left = `${buttonRect.right + scrollLeft + offset}px`;
                        tooltip.style.top = `${buttonRect.top + scrollTop + buttonRect.height / 2}px`;
                        tooltip.style.transform = 'translateY(-50%)';

                        alignVertically()

                        // Set arrow position
                        const tooltipTopAuto = tooltip.getBoundingClientRect().top;
                        const buttonCenterYAuto = buttonRect.top + buttonRect.height / 2;
                        const arrowOffsetAuto = buttonCenterYAuto - tooltipTopAuto;
                        tooltip.style.setProperty('--arrow-top', `${arrowOffsetAuto}px`);
                    }
                    // Position tooltip to the left as last resort
                    else {
                        tooltip.classList.add('Left');
                        tooltip.style.right = 'auto';
                        tooltip.style.left = `${buttonRect.left + scrollLeft - tooltip.offsetWidth - offset}px`;
                        tooltip.style.top = `${buttonRect.top + scrollTop + buttonRect.height / 2}px`;
                        tooltip.style.transform = 'translateY(-50%)';

                        alignVertically()

                        // Set arrow position
                        const tooltipTopAuto = tooltip.getBoundingClientRect().top;
                        const buttonCenterYAuto = buttonRect.top + buttonRect.height / 2;
                        const arrowOffsetAuto = buttonCenterYAuto - tooltipTopAuto;
                        tooltip.style.setProperty('--arrow-top', `${arrowOffsetAuto}px`);
                    }
                    break;
            }

            this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
        }

        this.requestAnimationFrameId = requestAnimationFrame(updatePosition);

    }

    addTooltipEventListeners({ toolTipButton, toolTipConfig }) {
        // Helper function to clean up animations and timeouts
        const cleanupAnimations = () => {
            clearTimeout(this.timeoutEnter);
            clearTimeout(this.timeoutLeave);
            if (this.requestAnimationFrameId) {
                cancelAnimationFrame(this.requestAnimationFrameId);
            }
            if (this.cleanUp != null) {
                this.cleanUp();
            }
        };

        // Mouse enter event
        toolTipButton.addEventListener('mouseenter', (e) => {
            cleanupAnimations();
            // Remove any existing tooltip
            this.removeImmediately(e);
            // Create new tooltip
            this.create(toolTipConfig, e);
        });

        // Mouse leave event
        toolTipButton.addEventListener('mouseleave', (e) => {
            cleanupAnimations();
            clearTimeout(this.timeoutLeave);
            this.remove(e);
        });

        // Click event
        toolTipButton.addEventListener('click', (e) => {
            cleanupAnimations();
            clearTimeout(this.timeoutLeave);
            this.removeImmediately(e);
        });
    }

    //Not in use 
    setFixedPosition({ tooltipOptions, tooltip, button }) {
        tooltip.style.position = 'fixed';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease-in';
        tooltip.style.maxWidth = tooltipOptions.Width || '200px';
        tooltip.style.wordBreak = 'break-word';

        // Append the tooltip as a child of the button.
        document.body.appendChild(tooltip);

        const toolTipElement = document?.querySelector('.ToolTip');

        // Define a common offset (in pixels) for spacing.
        const offset = 10;

        const updatePosition = () => {

            // Get input element's position and dimensions
            const buttonRect = button.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Get dimensions
            const toolTipHeight = toolTipElement.clientHeight;
            const toolTipWidth = toolTipElement.clientWidth;

            // Calculate available space
            const spaceBelow = viewportHeight - buttonRect.bottom;
            const spaceAbove = viewportHeight - buttonRect.top;

            const positionBelow = buttonRect.bottom;

            function alignHorizontally() {
                let buttonCenter = buttonRect.left + (buttonRect.width / 2);
                let halfOfToolTipWidth = toolTipWidth / 2;

                if (buttonCenter - halfOfToolTipWidth < 0) {
                    tooltip.style.left = '0px';
                }
                else if (buttonCenter + halfOfToolTipWidth > window.innerWidth) {
                    tooltip.style.right = '0px';
                } else {
                    // align center
                    tooltip.style.left = `${buttonCenter - halfOfToolTipWidth}px`;
                }
            }
            switch (tooltipOptions.Pn) {
                case 'Left':
                    tooltip.style.left = `${buttonRect.left - toolTipWidth - offset}px`;
                    tooltip.style.top = `${((buttonRect.bottom + buttonRect.top) / 2) - (toolTipHeight / 2)}px`;
                    tooltip.classList.add('Left'); // small arrow on left
                    break;
                case 'Top':
                    tooltip.style.bottom = `auto`;
                    tooltip.style.top = `${buttonRect.top - toolTipHeight - offset}px`;
                    tooltip.classList.add('Top'); // small arrow on bottom

                    //horizontally align 
                    alignHorizontally();
                    break;
                case 'Bottom':
                    tooltip.style.top = `${positionBelow + offset}px`;
                    tooltip.style.bottom = 'auto';
                    tooltip.classList.add('Bottom'); // small arrow on top

                    //horizontally align 
                    alignHorizontally();
                    break;
                case 'Right':
                    tooltip.style.left = `${buttonRect.right + offset}px`;
                    tooltip.style.top = `${((buttonRect.bottom + buttonRect.top) / 2) - (toolTipHeight / 2)}px`;
                    tooltip.classList.add('Right'); // small arrow on left
                    break;
                default:
                    if (spaceBelow >= toolTipHeight) {
                        // Enough space below
                        tooltip.style.top = `${positionBelow + offset}px`;
                        tooltip.style.bottom = 'auto';
                        tooltip.classList.add('Bottom'); // small arrow on top
                        tooltip.classList.remove('Top');
                        tooltip.classList.remove('Left');
                        tooltip.classList.remove('Right');
                    } else if (spaceAbove >= toolTipHeight) {
                        // Enough space above
                        tooltip.style.bottom = `auto`;
                        tooltip.style.top = `${buttonRect.top - toolTipHeight - offset}px`;
                        tooltip.classList.add('Top'); // small arrow on bottom
                        tooltip.classList.remove('Bottom');
                        tooltip.classList.remove('Left');
                        tooltip.classList.remove('Right');
                    } else {
                        // Not enough space either way - place where there's more space
                        if (spaceBelow >= spaceAbove) {
                            tooltip.style.top = `${positionBelow + offset}px`;
                            tooltip.style.bottom = 'auto';
                            tooltip.classList.add('Bottom'); // small arrow on bottom
                            tooltip.classList.remove('Top');
                            tooltip.classList.remove('Left');
                            tooltip.classList.remove('Right');
                        } else {
                            tooltip.style.bottom = `auto`;
                            tooltip.style.top = `${buttonRect.top - toolTipHeight - offset}px`;
                            tooltip.classList.add('Top'); // small arrow on top
                            tooltip.classList.remove('Bottom');
                            tooltip.classList.remove('Left');
                            tooltip.classList.remove('Right');
                        }
                    }

                    //horizontally align 
                    alignHorizontally();
                    break;

            }

            this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
        }

        if (tooltipOptions?.Fixed?.Position) {
            // Set the fixed position values directly from the options
            if (tooltipOptions.Fixed.Position.Top) {
                tooltip.style.top = tooltipOptions.Fixed.Position.Top;
            }

            if (tooltipOptions.Fixed.Position.Left) {
                tooltip.style.left = tooltipOptions.Fixed.Position.Left;
            }

            if (tooltipOptions.Fixed.Position.Right) {
                tooltip.style.right = tooltipOptions.Fixed.Position.Right;
            }

            if (tooltipOptions.Fixed.Position.Bottom) {
                tooltip.style.bottom = tooltipOptions.Fixed.Position.Bottom;
            }
            tooltip.classList.add('Bottom');
        } else {
            this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
        }

    }

    //Not In Use [Keep it for fallback]
    setAbsolutePositionPutInsideButton({ tooltipOptions, tooltip, button }) {
        tooltip.style.position = 'absolute';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease-in';
        tooltip.style.width = tooltipOptions.Width || 'auto';

        // Append the tooltip as a child of the button.
        button.appendChild(tooltip);

        // Define a common offset (in pixels) for spacing.
        const offset = 10;
        const offsetPer = 20;

        // Position the tooltip based on the specified placement.
        // Since the tooltip is a child of a relatively positioned element,
        // we can use CSS properties (top, bottom, left, right) relative to the button.
        let buttonRect = button.getBoundingClientRect();
        switch (tooltipOptions.Pn) {
            case 'Top':
                tooltip.classList.add('Top');
                tooltip.style.bottom = `calc(100% + ${offset}px)`;
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'Bottom':
                tooltip.classList.add('Bottom');
                tooltip.style.top = `calc(100% + ${offset}px)`;
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'Right':
                tooltip.classList.add('Right');
                tooltip.style.top = '50%';
                tooltip.style.left = `calc(100% + ${offset}px)`;
                tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'Left':
                tooltip.classList.add('Left');
                tooltip.style.top = '50%';
                tooltip.style.right = `calc(100% + ${offset}px)`;
                tooltip.style.transform = 'translateY(-50%)';
                break;
            default: // auto
                const position = this.getToolTipPosition(tooltipOptions.Id, button);

                // Remove any existing position-related classes
                tooltip.classList.remove('Left', 'Right', 'Top', 'Bottom');

                // Reset transform to avoid conflicts
                tooltip.style.transform = '';

                // Assign styles dynamically based on position
                if (position.top !== 'auto') {
                    tooltip.style.top = `calc(${position.top} + ${offsetPer}%)`;
                    tooltip.classList.add('Bottom'); // small arrow needed in bottom
                    tooltip.style.left = '50%';
                    tooltip.style.transform = 'translateX(-50%)';
                } else if (position.bottom !== 'auto') {
                    tooltip.style.bottom = `calc(${position.bottom} + ${offsetPer}%)`;
                    tooltip.classList.add('Top'); // small arrow needed in top
                    tooltip.style.left = '50%';
                    tooltip.style.transform = 'translateX(-50%)';
                } else if (position.left !== 'auto') {
                    tooltip.style.left = `calc(${position.left} + ${offsetPer}%)`;
                    tooltip.classList.add('Right');
                } else if (position.right !== 'auto') {
                    tooltip.style.right = `calc(${position.right} + ${offsetPer}%)`;
                    tooltip.classList.add('Left');
                }

                break;
        }

    }

    //Not In Use [Keep it for fallback]
    setFixedPositionUsingScroll({ tooltipOptions, tooltip, button }) {

        tooltip.style.position = 'fixed';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease-in';
        tooltip.style.maxWidth = tooltipOptions.Width || '200px';
        tooltip.style.wordBreak = 'break-word';

        // Append the tooltip as a child of the button.
        document.body.appendChild(tooltip);

        const toolTipElement = document?.querySelector('.ToolTip');

        // Define a common offset (in pixels) for spacing.
        const offset = 10;

        function updatePosition() {
            // Get input element's position and dimensions
            const buttonRect = button.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Get dimensions
            const toolTipHeight = toolTipElement.clientHeight;
            const toolTipWidth = toolTipElement.clientWidth;

            // Calculate available space
            const spaceBelow = viewportHeight - buttonRect.bottom;
            const spaceAbove = viewportHeight - buttonRect.top;

            const positionBelow = buttonRect.bottom;

            switch (tooltipOptions.Pn) {
                case 'Left':
                    tooltip.style.left = `${buttonRect.left - toolTipWidth - offset}px`;
                    tooltip.style.top = `${((buttonRect.bottom + buttonRect.top) / 2) - (toolTipHeight / 2)}px`;
                    tooltip.classList.add('Left'); // small arrow on left
                    break;
                case 'Top':
                    tooltip.style.bottom = `auto`;
                    tooltip.style.top = `${buttonRect.top - toolTipHeight - offset}px`;
                    tooltip.classList.add('Top'); // small arrow on bottom
                    break;
                case 'Bottom':
                    tooltip.style.top = `${positionBelow + offset}px`;
                    tooltip.style.bottom = 'auto';
                    tooltip.classList.add('Bottom'); // small arrow on top
                    break;
                case 'Right':
                    tooltip.style.left = `${buttonRect.right + offset}px`;
                    tooltip.style.top = `${((buttonRect.bottom + buttonRect.top) / 2) - (toolTipHeight / 2)}px`;
                    tooltip.classList.add('Right'); // small arrow on left
                    break;
                default:
                    if (spaceBelow >= toolTipHeight) {
                        // Enough space below
                        tooltip.style.top = `${positionBelow + offset}px`;
                        tooltip.style.bottom = 'auto';
                        tooltip.classList.add('Bottom'); // small arrow on top
                        tooltip.classList.remove('Top');
                        tooltip.classList.remove('Left');
                        tooltip.classList.remove('Right');
                    } else if (spaceAbove >= toolTipHeight) {
                        // Enough space above
                        tooltip.style.bottom = `auto`;
                        tooltip.style.top = `${buttonRect.top - toolTipHeight - offset}px`;
                        tooltip.classList.add('Top'); // small arrow on bottom
                        tooltip.classList.remove('Bottom');
                        tooltip.classList.remove('Left');
                        tooltip.classList.remove('Right');
                    } else {
                        // Not enough space either way - place where there's more space
                        if (spaceBelow >= spaceAbove) {
                            tooltip.style.top = `${positionBelow + offset}px`;
                            tooltip.style.bottom = 'auto';
                            tooltip.classList.add('Bottom'); // small arrow on bottom
                            tooltip.classList.remove('Top');
                            tooltip.classList.remove('Left');
                            tooltip.classList.remove('Right');
                        } else {
                            tooltip.style.bottom = `auto`;
                            tooltip.style.top = `${buttonRect.top - toolTipHeight - offset}px`;
                            tooltip.classList.add('Top'); // small arrow on top
                            tooltip.classList.remove('Bottom');
                            tooltip.classList.remove('Left');
                            tooltip.classList.remove('Right');
                        }
                    }

                    //horizontally align 
                    let buttonCenter = buttonRect.left + (buttonRect.width / 2);
                    let halfOfToolTipWidth = toolTipWidth / 2;

                    if (buttonCenter - halfOfToolTipWidth < 0) {
                        tooltip.style.left = '0px';
                    }
                    else if (buttonCenter + halfOfToolTipWidth > window.innerWidth) {
                        tooltip.style.right = '0px';
                    }
                    break;

            }

        }

        // Update position on scroll
        function handleScroll() {
            requestAnimationFrame(updatePosition);
        }

        // Initial position update
        updatePosition();

        let target = window;

        if (tooltipOptions?.Fixed?.ScrollDivId) {
            const scrollDiv = document.getElementById(tooltipOptions.Fixed.ScrollDivId);
            if (scrollDiv) {
                target = scrollDiv;
            }
        }

        target.addEventListener('scroll', handleScroll);

        // cleanup function
        this.cleanUp = () => {
            target.removeEventListener('scroll', handleScroll);
        };

    }
}

class Slider {
    classes;
    constructor() {
        window.onscroll = () => {
            this.LoadImage();
        };

        window.addEventListener('load', (event) => {
            this.LoadImage();
        });
    }

    Slider(ot) {
        this.classes = ot.Classes;
        ot.verticalSlider = ot.verticalSlider || false;
        ot.PreventWheel = ot.PreventWheel || false;

        if (ot.SelfAlign) {
            this.CreateSelfAlignSlider(ot);
            return;
        }

        // Declare initial values
        let Magnify = ot.Magnify || 'N';
        let Content = ot.Content || 'Animate';
        let Load = ot.Load || null;

        // Determine number of slides to show
        let SlideShownNo;
        if (Content === 'SlideMultiple') {
            if (ot.Responsive) {
                SlideShownNo = this.GetNumberOfSlidesToShow(ot);
            } else {
                SlideShownNo = ot.ShowSlide || 2;
            }
        }


        let slideShowSections = document.getElementsByClassName(ot.Class);

        for (let q = 0; q < slideShowSections.length; q++) {
            const section = slideShowSections[q];
            section.classList.add(...this.classes.slideShow.split(' '));
            section.setAttribute('showno', q);

            const SlideContainer = section.getElementsByClassName('SlideContainer');
            const slideShowImg = section.getElementsByClassName('SlideImage');
            const slideShowDIV = section.getElementsByClassName('SlideUT');
            const firstImages = slideShowImg[q]?.getElementsByTagName('img');

            // Prevent wheel scrolling
            if (ot.PreventWheel && SlideContainer) {
                SlideContainer[0].addEventListener('wheel', (e) => {
                    e.preventDefault();
                }, { passive: false });
            }

            if (firstImages?.length) {

                if (Magnify === 'Y') section.classList.add('CrurZmIn');

                if ((Content === 'Animate' || Content === 'Slide') && !Load) {
                    const img1 = slideShowImg[0].getElementsByTagName('img')[0];
                    let srcUt = img1.getAttribute('src-ut');
                    if (srcUt) img1.setAttribute('src', srcUt);
                } else if (Load) {
                    slideShowImg[0].getElementsByTagName('img')[0].setAttribute('loadut', Load);
                } else if (Content === 'SlideMultiple') {
                    for (let n = 0; n < SlideShownNo; n++) {
                        const img = slideShowImg[n]?.getElementsByTagName('img')[0];
                        if (img) {
                            let srcUt = img.getAttribute('src-ut');
                            if (srcUt) img.setAttribute('src', srcUt);
                        }
                    }
                }
            }

            // Setup initial display
            slideShowDIV[0].style.display = 'block';

            // Add identifying attributes
            section.setAttribute('ctslide', q);
            section.setAttribute('id', ot.Class + q);
            section.setAttribute('slideno', slideShowDIV.length);
            section.setAttribute('Content', Content);

            // Add indicator buttons if enabled
            let imageIndicatorContainer = null;
            if (ot.Class.startsWith("AniSlideShow") && ot.Indicators) {
                const aniSlideShow = section.getElementsByClassName('SlideContainer');

                for (let slideShow of aniSlideShow) {
                    const slideUT = slideShow.getElementsByClassName('SlideUT');
                    imageIndicatorContainer = document.createElement('div');
                    imageIndicatorContainer.setAttribute('class', ot.Classes.indicatorButtonContainer);

                    for (let slideTo = 0; slideTo < slideUT.length; slideTo++) {
                        const indicatorButton = document.createElement('button');
                        indicatorButton.setAttribute('class', ot.Classes.indicatorButton);
                        indicatorButton.setAttribute('aria-label', "indicator button");
                        indicatorButton.setAttribute('slideTo', slideTo);
                        indicatorButton.setAttribute('showut', ot.Class + q);
                        indicatorButton.style = slideTo === 0 ? `background-color: ${ot.Classes.indicatorColor}` : 'background: none';
                        indicatorButton.addEventListener("click", (e) => this.SlideImageTo(e, ot, slideTo, imageIndicatorContainer));
                        imageIndicatorContainer.appendChild(indicatorButton);
                    }
                    slideShow.appendChild(imageIndicatorContainer);
                }
            }

            // Add prev/next buttons if enabled
            if (ot.PrevNextButton) {
                this.ShowPrevNextButton({ ot, q, imageIndicatorContainer, slideShowSection: section });
            }

            // Process individual slides
            for (let j = 0; j < slideShowDIV.length; j++) {
                const slideImg = slideShowImg[j]?.getElementsByTagName('img')[0];

                if (slideImg) {
                    slideImg.setAttribute('slide', j);
                    slideImg.setAttribute('showut', ot.Class + q);
                    slideImg.setAttribute('id', ot.Class + q + 'img' + j);
                    slideImg.style.aspectRatio = ot.AspectRatio;

                    //slideImg.addEventListener('load', () => {
                    //    document.getElementById(ot.Class + q).style.height = 'auto';
                    //});

                    if (Magnify === 'Y') {
                        slideImg.addEventListener('click', (ev) => this.EnlargeSlide(ev, ot));
                    }
                }

                slideShowImg[j].setAttribute('slide', j);
                slideShowImg[j].setAttribute('showut', ot.Class + q);
                slideShowImg[j].setAttribute('id', ot.Class + q + 'img' + j);

                if (Content === 'Slide' || Content === 'SlideMultiple') {
                    slideShowDIV[j].style.display = 'block';
                }

                if (ot.TextSize?.Min) {
                    const textEl = slideShowDIV[j].getElementsByClassName("SlideTextUT")[0];
                    if (textEl) textEl.style.fontSize = parseInt(ot.TextSize.Min);
                }

                if (Content === 'Animate' && ot.Animate) {
                    slideShowImg[j].classList.add(ot.Animate);
                }

                if (ot.OverLay === 'Y' && ot.OverLayImg) {
                    const LayDiv = document.createElement('div');
                    LayDiv.setAttribute('class', `SlideOverlay ${this.classes.slideOverlay}`);
                    const LayImage = document.createElement('img');
                    LayImage.setAttribute('class', 'Wh100p Ht100p');
                    LayImage.setAttribute('src', ot.OverLayImg);
                    LayImage.setAttribute('alt', "overlay image");
                    LayDiv.appendChild(LayImage);
                    slideShowDIV[j].appendChild(LayDiv);
                }

                if (Content === "SlideMultiple") {
                    if (ot.VerticalSlider) {
                        slideShowDIV[j].style.padding = ot.SlidePadding || "16px";
                        slideShowDIV[j].style.width = (100) + '%';
                        slideShowDIV[j].style.minHeight = (100 / SlideShownNo) + '%';
                    } else {
                        slideShowDIV[j].style.padding = ot.SlidePadding || "16px";
                        slideShowDIV[j].style.minWidth = (100 / SlideShownNo) + '%';
                    }
                }
            }


            // Variable to store the interval ID so we can clear it
            let sliderInterval = null;

            // Function to start the interval
            const startAutoSlider = () => {
                if (ot.RunSlider && !sliderInterval) {
                    sliderInterval = setInterval(() => {
                        ot.id = ot.Class + q;
                        this.SlideImageHelper(ot.id, 1, ot, imageIndicatorContainer);
                    }, ot.RunSlider);
                }
            }

            // Function to stop the interval
            function stopAutoSlider() {
                if (sliderInterval) {
                    clearInterval(sliderInterval);
                    sliderInterval = null;
                }
            }

            // Start the interval initially if RunSlider is set
            if (ot.RunSlider) {
                startAutoSlider();
                // Add event listeners for mouseenter and mouseleave
                section.addEventListener('mouseenter', stopAutoSlider);
                section.addEventListener('mouseleave', startAutoSlider);
            }

            if (ot.TouchSwipe) {
                this.HandleSwipe(section, ot, imageIndicatorContainer);
            }
        }
    }

    CreateSelfAlignSlider(ot) {
        // Declare initial values
        let Magnify = ot.Magnify || 'N';
        let Content = ot.Content || 'Animate';
        let Load = ot.Load || null;
        ot.ColumnGap = ot.ColumnGap || 10; // pixel

        // Determine number of slides to show
        let SlideShownNo;
        if (Content === 'SlideMultiple') {
            if (ot.Responsive) {
                SlideShownNo = this.GetNumberOfSlidesToShow(ot);
            } else {
                SlideShownNo = ot.ShowSlide || 2;
            }
        }

        let slideShowSections = document.getElementsByClassName(ot.Class);
        for (let q = 0; q < slideShowSections.length; q++) {
            const section = slideShowSections[q];
            section.classList.add(...this.classes.slideShow.split(' '));

            const slideContainer = section.querySelector('.SlideContainer');

            slideContainer.style.columnGap = `${ot.ColumnGap}px`;
            slideContainer.style.display = 'grid';
            slideContainer.style.gridAutoFlow = 'column';

            const sliderContents = section.querySelectorAll('.gridBox');

            // Add identifying attributes
            section.setAttribute('showno', q);
            section.setAttribute('ctslide', q);
            section.setAttribute('id', ot.Class + q);
            section.setAttribute('slideno', sliderContents.length);
            section.setAttribute('Content', Content);

            // Get container width
            const containerWidth = slideContainer?.getBoundingClientRect().width || 100;

            // Calculate total gap width (n-1 gaps for n items)
            const totalGapWidth = ot.ColumnGap * (SlideShownNo - 1);

            // Calculate available width for items after subtracting gaps
            const availableWidth = containerWidth - totalGapWidth;

            // Calculate width for each item
            const widthOfEachSlidePx = availableWidth / SlideShownNo;

            sliderContents.forEach((sliderContent) => {
                sliderContent.style.width = `${widthOfEachSlidePx}px`;
            });

            // Add prev/next buttons if enabled
            if (ot.PrevNextButton) {
                this.ShowPrevNextButton({ ot, q, imageIndicatorContainer: null, slideShowSection: section });
            }


            for (let j = 0; j < sliderContents.length; j++) {
                sliderContents[j].setAttribute('slide', j);
                sliderContents[j].setAttribute('showut', ot.Class + q);
                sliderContents[j].setAttribute('id', ot.Class + q + 'img' + j);
            }
        }

    }

    UpdateSlideMultiple({ SlideShownNo, ot }) {
        let slideShowSections = document.getElementsByClassName(ot.Class);
        for (let q = 0; q < slideShowSections.length; q++) {
            const section = slideShowSections[q];
            const slideShowDIV = section.getElementsByClassName('SlideUT');
            for (let i = 0; i < slideShowDIV.length; i++) {
                const imgEle = slideShowDIV[i].getElementsByTagName('img')[0];
                if (imgEle) {
                    imgEle.setAttribute('src', imgEle.getAttribute('src-ut'));
                    imgEle.removeAttribute('loadut');
                }
                if (ot.VerticalSlider) {
                    slideShowDIV[i].style.padding = ot.SlidePadding || "16px";
                    slideShowDIV[i].style.width = (100) + '%';
                    slideShowDIV[i].style.minHeight = (100 / SlideShownNo) + '%';
                } else {
                    slideShowDIV[i].style.padding = ot.SlidePadding || "16px";
                    slideShowDIV[i].style.minWidth = (100 / SlideShownNo) + '%';
                }
            }
        }
    }

    LoadImage() {
        ['Start', 'Mid', 'End'].forEach(level => {
            document.querySelectorAll(`[loadut="${level}"]`).forEach(imgEl => {
                // preserve original id & loadut for InViewUT check
                const obj = {
                    Id: imgEl.getAttribute('id'),
                    Load: imgEl.getAttribute('loadut')
                };

                if (this.InViewUT(obj)) {
                    imgEl.setAttribute('src', imgEl.getAttribute('src-ut'));
                    imgEl.removeAttribute('loadut');
                }
            });
        });
    }

    HandleSwipe(section, ot, imageIndicatorContainer) {
        let startX = 0;
        let deltaX = 0;
        const threshold = 30; // minimum px to count as swipe

        section.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].clientX;
        }, { passive: true });

        section.addEventListener('touchmove', (e) => {
            deltaX = e.changedTouches[0].clientX - startX;
        }, { passive: true });

        section.addEventListener('touchend', (e) => {
            // Determine swipe direction
            if (Math.abs(deltaX) > threshold) {
                const dir = deltaX > 0 ? -1 : 1; // right swipe = prev, left swipe = next
                const slideShowID = section.getAttribute('id');
                // call your existing helper to move slides
                this.SlideImageHelper(slideShowID, dir, ot, imageIndicatorContainer);
            }
            // reset for next swipe
            startX = 0;
            deltaX = 0;
        }, { passive: true });
    }

    // Show Prev and Next Button
    ShowPrevNextButton(args) {

        const { imageIndicatorContainer, ot, q, slideShowSection } = args;

        var prevbtn = document.createElement('button');
        var nextbtn = document.createElement('button');
        prevbtn.setAttribute('class', this.classes.prevBtn);
        nextbtn.setAttribute('class', this.classes.nextBtn);
        prevbtn.setAttribute('aria-label', "previous button");
        nextbtn.setAttribute('aria-label', "next button");
        prevbtn.addEventListener('click', (ev) => { this.SlideImage(ev, ot, imageIndicatorContainer); });
        nextbtn.addEventListener('click', (ev) => { this.SlideImage(ev, ot, imageIndicatorContainer); });
        prevbtn.setAttribute('ctImg', '-1');
        nextbtn.setAttribute('ctImg', '1');

        function createArrowSVG(direction) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 16 16');
            svg.setAttribute('fill', 'currentColor');
            svg.style.pointerEvents = 'none'; //  This ensures the SVG does not interfere with button clicks

            // Button Size is Mentioned Then Add
            if (ot.ButtonSize && ot.ButtonSize.Min) {
                svg.setAttribute('width', ot.ButtonSize.Min);
                svg.setAttribute('height', ot.ButtonSize.Min);
            } else {
                svg.setAttribute('width', '16px');
                svg.setAttribute('height', '16px');
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            const paths = {
                up: 'M8 2l6 6H10v6H6V8H2l6-6z',
                down: 'M8 14l-6-6h4V2h4v6h4l-6 6z',
                left: 'M2 8l6-6v4h6v4H8v4l-6-6z',
                right: 'M14 8l-6 6V10H2V6h6V2l6 6z'
            };

            path.setAttribute('d', paths[direction]);
            svg.appendChild(path);

            return svg;
        }

        if (ot.VerticalSlider) {
            prevbtn.innerHTML = '';
            nextbtn.innerHTML = '';
            prevbtn.appendChild(createArrowSVG('up'));
            nextbtn.appendChild(createArrowSVG('down'));
        } else {
            prevbtn.innerHTML = '';
            nextbtn.innerHTML = '';
            prevbtn.appendChild(createArrowSVG('left'));
            nextbtn.appendChild(createArrowSVG('right'));
        }

        //Adding Next Previous Button
        prevbtn.setAttribute('showut', ot.Class + q);
        nextbtn.setAttribute('showut', ot.Class + q);

        prevbtn.setAttribute('id', 'PsBn' + ot.Class + q);
        nextbtn.setAttribute('id', 'NtBn' + ot.Class + q);

        // If Button Size Are Mentioned then add - And Hide Previous Button If SlideDirection = "Line"
        if (ot.SlideDirection == "Line") {
            prevbtn.style.display = "none";
        }

        if (ot.HideButton != "Y") {
            slideShowSection.appendChild(nextbtn);
            slideShowSection.appendChild(prevbtn);
        }
    }

    SlideImage(ev, ot, imageIndicatorContainer) {
        var SlideShowID = ev.target.getAttribute('showut');
        var SlideVal = parseInt(ev.target.getAttribute('ctImg'));
        this.SlideImageHelper(SlideShowID, SlideVal, ot, imageIndicatorContainer);
    }

    SlideImageHelper(SlideShowID, SlideVal, ot, imageIndicatorContainer) {

        let SlideShow = document.getElementById(SlideShowID);

        if (!SlideShow) return;

        //Adding Height So That Div Should not minimize while Loading Next Image
        let height = SlideShow.getBoundingClientRect().height;
        SlideShow.style.height = height;

        let TotalSlides = parseInt(SlideShow.getAttribute("slideno"));
        let ButtonValue = parseInt(SlideVal);
        let Content = SlideShow.getAttribute('Content');

        let slideShowDIV = SlideShow.getElementsByClassName('SlideUT');
        let slideShowImg = SlideShow.getElementsByClassName('SlideImage');
        let SlideInView = parseInt(ot.ShowSlide);
        let showImage;

        // Decide If Content has to Be Animated then First Hide All and Show The Next - If Content Is Slide Then Scroll To Particular
        let params = { ot, slideShowDIV, showImage, ButtonValue, imageIndicatorContainer, TotalSlides, slideShowImg, SlideShow, SlideInView };
        switch (Content) {
            case 'Animate':
                this.ContentAnimate(params);
                break;
            case 'Slide':
                this.ContentSlide(params);
                break;
            case 'SlideMultiple':
                if (ot.SelfAlign) {
                    this.ContentSlideMultipleSelfAlign(params);
                } else {
                    params.SlideInView = SlideInView;
                    this.ContentSlideMultiple(params);
                }
                break;
            default:
                break;
        }

        //Removing Added Height So that Slider Remains Responsive
        //setTimeout(() => { SlideShow.style.height = 'auto'; }, 2000);

    }

    // If Content is Animate then Call this Function
    ContentAnimate(args) {
        const { ot, slideShowDIV, ButtonValue, imageIndicatorContainer, TotalSlides, slideShowImg, SlideShow } = args;

        // Determine current visible slide index
        const currentIndex = Array.from(slideShowDIV).findIndex(div => div.style.display === 'block');
        const startIndex = currentIndex >= 0 ? currentIndex : 0;

        // Hide all slides
        Array.from(slideShowDIV).forEach(div => div.style.display = 'none');

        // Calculate next index with wrap-around
        let newIndex = startIndex + ButtonValue;
        if (newIndex >= TotalSlides) newIndex = 0;
        if (newIndex < 0) newIndex = TotalSlides - 1;

        // Highlight the active indicator button
        if (imageIndicatorContainer) {
            this.markIndicator(ot, startIndex, ButtonValue, imageIndicatorContainer);
        }

        // Hide buttons if needed
        if (ot.SlideDirection) {
            this.HideBn(ot, SlideShow, newIndex, TotalSlides);
        }

        // Lazy-load the next image
        const imgTag = slideShowImg[newIndex].querySelector('img');
        if (imgTag) {
            const srcUT = imgTag.getAttribute('src-ut');
            if (srcUT) imgTag.setAttribute('src', srcUT);
        }

        // Show the new slide
        slideShowDIV[newIndex].style.display = 'block';
    }

    // If Content is Slide then Call this Function
    ContentSlide(args) {
        const { ot, slideShowDIV, showImage, ButtonValue, imageIndicatorContainer, TotalSlides, slideShowImg, SlideShow } = args;

        const CurrentSlideNumber = parseInt(SlideShow.getAttribute('ctslide'));
        let UpComingSlideNumber = CurrentSlideNumber + parseInt(ButtonValue);

        // Normalize slide index
        if (UpComingSlideNumber < 0) {
            UpComingSlideNumber = TotalSlides - 1;
        } else if (UpComingSlideNumber >= TotalSlides) {
            UpComingSlideNumber = 0;
        }

        // Lazy load image if needed
        const imgElement = slideShowImg[UpComingSlideNumber]?.getElementsByTagName('img')[0];
        if (imgElement && !imgElement.getAttribute('src')) {
            const fallbackSrc = imgElement.getAttribute('src-ut');
            if (fallbackSrc) imgElement.setAttribute('src', fallbackSrc);
        }

        // Hide button if SlideDirection is set
        if (ot.SlideDirection) {
            this.HideBn(ot, SlideShow, UpComingSlideNumber, TotalSlides);
        }

        // Slide scroll handling
        const SliderWidth = SlideShow.getBoundingClientRect().width;
        const ScrollDiv = SlideShow.querySelector('.SlideContainer');
        ScrollDiv.scrollLeft = SliderWidth * UpComingSlideNumber;

        // Update current slide number
        SlideShow.setAttribute('ctslide', UpComingSlideNumber);
    }

    // If Content is Slide Multiple then Call this Function
    ContentSlideMultiple(args) {
        const { ot, slideShowDIV, showImage, ButtonValue, imageIndicatorContainer, TotalSlides, slideShowImg, SlideShow, SlideInView } = args;
        let CurrentSlideNumber = parseInt(SlideShow.getAttribute('ctslide'));
        let upcomingSlideNumber = CurrentSlideNumber + parseInt(ButtonValue);
        let SlideShownNo = ot.Responsive
            ? parseInt(this.GetNumberOfSlidesToShow(ot))
            : parseInt(ot.ShowSlide || 2);
        // Lazy-load images if needed
        const preloadImage = (index) => {
            const img = slideShowImg[index]?.getElementsByTagName('img')[0];
            if (img && !img.getAttribute('src')) {
                const srcUt = img.getAttribute('src-ut');
                if (srcUt) img.setAttribute('src', srcUt);
            }
        };
        if (slideShowImg[0]?.getElementsByTagName('img').length > 0) {
            if (upcomingSlideNumber >= 0 && (upcomingSlideNumber + SlideShownNo) <= TotalSlides) {
                const index = ButtonValue > 0
                    ? upcomingSlideNumber + SlideShownNo - 1
                    : upcomingSlideNumber - 1;
                preloadImage(index);
            } else if (upcomingSlideNumber < 0) {
                for (let n = 0; n < SlideShownNo; n++) {
                    preloadImage(TotalSlides - n - 1);
                }
            }
        }
        // Handle button visibility
        if (ot.SlideDirection) {
            this.HideBn(ot, SlideShow, upcomingSlideNumber, TotalSlides);
        }
        // Handle slide scrolling
        const SliderWidth = SlideShow.querySelector('.SlideUT').getBoundingClientRect().width;
        const SliderHeight = SlideShow.querySelector('.SlideUT').getBoundingClientRect().height;
        const ScrollDiv = SlideShow.querySelector('.SlideContainer');
        if (ot.VerticalSlider) {
            if (upcomingSlideNumber >= 0 && upcomingSlideNumber <= TotalSlides - SlideInView) {
                ScrollDiv.scrollTop = SliderHeight * upcomingSlideNumber;
                SlideShow.setAttribute('ctslide', upcomingSlideNumber);
            } else if (upcomingSlideNumber > TotalSlides - SlideInView) {
                ScrollDiv.scrollTop = 0;
                SlideShow.setAttribute('ctslide', 0);
            } else if (upcomingSlideNumber < 0) {
                ScrollDiv.scrollTop = SliderHeight * (TotalSlides - SlideInView);
                SlideShow.setAttribute('ctslide', TotalSlides - SlideInView);
            }

            // Update indicator if present
            if (imageIndicatorContainer) {
                const indicators = imageIndicatorContainer.getElementsByClassName('indicator');
                for (let i = 0; i < indicators.length; i++) {
                    indicators[i].classList.remove('active');
                }
                const activeIndex = parseInt(SlideShow.getAttribute('ctslide'));
                if (indicators[activeIndex]) {
                    indicators[activeIndex].classList.add('active');
                }
            }
        } else {
            if (upcomingSlideNumber >= 0 && upcomingSlideNumber <= TotalSlides - SlideInView) {
                ScrollDiv.scrollLeft = SliderWidth * upcomingSlideNumber;
                SlideShow.setAttribute('ctslide', upcomingSlideNumber);
            } else if (upcomingSlideNumber > TotalSlides - SlideInView) {
                ScrollDiv.scrollLeft = 0;
                SlideShow.setAttribute('ctslide', 0);
            } else if (upcomingSlideNumber <= SlideInView) {
                ScrollDiv.scrollLeft = SliderWidth * (TotalSlides - SlideInView);
                SlideShow.setAttribute('ctslide', TotalSlides - SlideInView);
            }
        }
    }

    ContentSlideMultipleSelfAlign(args) {
        const { ot, ButtonValue, imageIndicatorContainer, TotalSlides, SlideShow, SlideInView } = args;

        let CurrentSlideNumber = parseInt(SlideShow.getAttribute('ctslide'));
        let upcomingSlideNumber = CurrentSlideNumber + parseInt(ButtonValue);

        // Handle slide scrolling
        let gridBox = SlideShow.querySelector('.gridBox').getBoundingClientRect();
        const SliderWidth = gridBox.width;
        const ScrollDiv = SlideShow.querySelector('.SlideContainer');

        // Get the column gap value
        const columnGap = parseInt(ot.ColumnGap) || 0;

        // For horizontal scrolling, calculate position including column gaps
        const scrollPosition = (SliderWidth + columnGap) * upcomingSlideNumber;

        if (upcomingSlideNumber >= 0 && upcomingSlideNumber <= TotalSlides - SlideInView) {
            ScrollDiv.scrollLeft = scrollPosition;
            SlideShow.setAttribute('ctslide', upcomingSlideNumber);
        } else if (upcomingSlideNumber > TotalSlides - SlideInView) {
            ScrollDiv.scrollLeft = 0;
            SlideShow.setAttribute('ctslide', 0);
        } else if (upcomingSlideNumber < 0) {
            const lastValidPosition = (SliderWidth + columnGap) * (TotalSlides - SlideInView);
            ScrollDiv.scrollLeft = lastValidPosition;
            SlideShow.setAttribute('ctslide', TotalSlides - SlideInView);
        }

        // Update indicator for horizontal slider too
        if (imageIndicatorContainer) {
            const indicators = imageIndicatorContainer.getElementsByClassName('indicator');
            for (let i = 0; i < indicators.length; i++) {
                indicators[i].classList.remove('active');
            }
            const activeIndex = parseInt(SlideShow.getAttribute('ctslide'));
            if (indicators[activeIndex]) {
                indicators[activeIndex].classList.add('active');
            }
        }

    }

    // When Click on Indicators Button Then Change Image
    SlideImageTo(e, obj, slideTo, imageIndicatorContainer) {
        const imageIndicatorButtons = imageIndicatorContainer.getElementsByTagName('button');
        const SlideShowID = e.target.getAttribute('showut');
        const SlideShowContainer = document.getElementById(SlideShowID);
        const SlideUT = SlideShowContainer.getElementsByClassName('SlideUT');

        Array.from(SlideUT).forEach((slide, index) => {
            const isTargetSlide = index === slideTo;

            if (!isTargetSlide) {
                // Hide only if currently visible
                if (slide.style.display === 'block') {
                    slide.style.display = 'none';
                    if (imageIndicatorButtons[index]) {
                        imageIndicatorButtons[index].style.background = 'none';
                    }
                }
                return;
            }

            // Load image if necessary
            const img = slide.getElementsByTagName('img')[0];
            if (img && !img.getAttribute('src')) {
                const srcUt = img.getAttribute('src-ut');
                if (srcUt) img.setAttribute('src', srcUt);
            }

            // Show target slide
            slide.style.display = 'block';
            if (imageIndicatorButtons[index]) {
                imageIndicatorButtons[index].style.backgroundColor = obj.Classes?.indicatorColor || 'black';
            }
        });
    }

    // Hightlight the Indicator Button That is Currently Active
    markIndicator(ot, currentImageNumber, PrevOrNextNumber, imageIndicatorContainer) {
        const imageIndicatorButtons = imageIndicatorContainer.getElementsByTagName('button');
        const totalLen = imageIndicatorButtons.length;
        const indicatorToHighlight = ((currentImageNumber + PrevOrNextNumber) + totalLen) % totalLen;

        Array.from(imageIndicatorButtons).forEach((currentIndicatorButton, index) => {
            if (index === indicatorToHighlight) {
                currentIndicatorButton.style.backgroundColor = ot.Classes.indicatorColor;
            } else {
                currentIndicatorButton.style.background = 'none';
            }
        });
    }

    HideBn(ot, SlideShow, showslide, TotalSlides) {
        // Do nothing if HideButton is 'Y' or SlideDirection isn't 'Line'
        if (ot.HideButton === 'Y' || ot.SlideDirection !== 'Line') return;

        const ShowNo = SlideShow.getAttribute('showno');
        const bnPrev = document.getElementById(`PsBn${ot.Class}${ShowNo}`);
        const bnNxt = document.getElementById(`NtBn${ot.Class}${ShowNo}`);

        if (ot.Content === 'Slide' || ot.Content === 'Animate') {
            // Single‐slide mode
            bnNxt.style.display = showslide >= TotalSlides - 1 ? 'none' : 'block';
            bnPrev.style.display = showslide <= 0 ? 'none' : 'block';

        } else if (ot.Content === 'SlideMultiple') {
            // Multi‐slide mode
            const SlideShownNo = parseInt(ot.ShowSlide, 10);

            bnNxt.style.display = (showslide + SlideShownNo) >= TotalSlides ? 'none' : 'block';
            bnPrev.style.display = showslide >= 1 ? 'block' : 'none';
        }
    }

    ScrollSlide(SlideShow) {
        const showslide = parseInt(SlideShow.getAttribute('ctslide'), 10);
        const sliderWidth = SlideShow.getBoundingClientRect().width;
        const scrollDiv = SlideShow.querySelector('.SlideContainer');
        scrollDiv.scrollLeft = sliderWidth * showslide;
    }

    EnlargeSlide(ev, ot) {
        let id = ev.target.getAttribute('showut');
        let slideshow = document.getElementById(id);
        let showno = slideshow.getAttribute('showno');

        if (slideshow.classList.contains('SlideFull')) {
            slideshow.classList.remove(...this.classes.slideFull.split(' '));
            slideshow.style = '';
            slideshow.classList.remove('CrurZmOt');
            slideshow.classList.add('CrurZmIn');

            document.getElementById('SlideBackgroundUT').remove();
            document.getElementById('SlideFullCloseBn').remove();

            // Button Size is Mentioned Then Add
            if (ot.ButtonSize != null && ot.ButtonSize != "") {
                if (ot.ButtonSize.Min != null && ot.ButtonSize.Min != "") {
                    document.getElementById('PsBn' + ot.Class + showno).style.fontSize = ot.ButtonSize.Min;
                    document.getElementById('NtBn' + ot.Class + showno).style.fontSize = ot.ButtonSize.Min;
                }
            }

            // If Text Size Is to Minimized
            if (ot.TextSize != null && ot.TextSize != "") {
                if (ot.TextSize.Min != null && ot.TextSize.Min != "") {
                    this.UpdateFontSize(id, ot, 'Min');
                }
            }
        } else {
            slideshow.classList.add(...this.classes.slideFull.split(' '));
            slideshow.style = 'position: fixed; width: 90vw;'; // force
            slideshow.classList.remove('CrurZmIn');
            slideshow.classList.add('CrurZmOt');

            // Create A BackGround Div For Enlarge Transition
            const background = document.createElement('div');
            background.setAttribute('class', this.classes.slideBackground);
            background.setAttribute('id', 'SlideBackgroundUT');
            document.getElementsByTagName('body')[0].appendChild(background);

            // Create A Close Button
            const closeButton = document.createElement('span');
            closeButton.setAttribute('class', this.classes.slideFullCloseBtn);
            closeButton.setAttribute('id', 'SlideFullCloseBn');
            closeButton.setAttribute('showut', ev.target.getAttribute('showut'));
            closeButton.innerText = 'X';
            slideshow.appendChild(closeButton);
            closeButton.addEventListener('click', (ev) => { this.MinimizeSlide(ev, ot); });

            // Button Size is Mentioned Then Add
            if (ot.ButtonSize != null && ot.ButtonSize != "") {
                if (ot.ButtonSize.Min != null && ot.ButtonSize.Min != "") {
                    const prevButton = document.getElementById('PsBn' + ot.Class + showno);
                    const nextButton = document.getElementById('NtBn' + ot.Class + showno);

                    if (prevButton) {
                        prevButton.style.fontSize = ot.ButtonSize.Max;
                    }

                    if (nextButton) {
                        nextButton.style.fontSize = ot.ButtonSize.Max;
                    }
                }
            }

            // If Text Size Is to Minimized
            if (ot.TextSize != null && ot.TextSize != "") {
                if (ot.TextSize.Max != null && ot.TextSize.Max != "") {
                    this.UpdateFontSize(id, ot, 'Max');
                }
            }
        }

        // Slide Show type is Slide Scroll to adjust the Image
        if (ot.Content == 'Slide') {
            this.ScrollSlide(slideshow);
        }

        // Force reflow to ensure the DOM updates
        let temp = slideshow.offsetHeight;
    }

    MinimizeSlide(ev, ot) {
        var id = ev.target.getAttribute('showut');
        var slideshow = document.getElementById(id);
        slideshow.classList.remove(...this.classes.slideFull.split(' '));
        slideshow.style = '';
        // slideshow.setAttribute('class', ""); // remove all clases
        document.getElementById('SlideBackgroundUT').remove();
        document.getElementById('SlideFullCloseBn').remove();
        // Slide Show type is Slide Scroll to adjust the Image
        if (ot.Content == 'Slide') {
            this.ScrollSlide(slideshow);
        }

        // Button Size is Mentioned Then Add
        var showno = slideshow.getAttribute('showno');
        if (ot.ButtonSize != null && ot.ButtonSize != "") {
            if (ot.ButtonSize.Min != null && ot.ButtonSize.Min != "") {
                const prevButton = document.getElementById('PsBn' + ot.Class + showno);
                const nextButton = document.getElementById('NtBn' + ot.Class + showno);

                if (prevButton) {
                    prevButton.style.fontSize = ot.ButtonSize.Min;
                }

                if (nextButton) {
                    nextButton.style.fontSize = ot.ButtonSize.Min;
                }
            }
        }

        //If Text Size Is to Minimized
        if (ot.TextSize != null && ot.TextSize != "") {
            if (ot.TextSize.Min != null && ot.TextSize.Min != "") {
                this.UpdateFontSize(id, ot, 'Min');
            }
        }

    }

    UpdateFontSize(id, ot, update) {
        // Determine target font size once
        const size = update === 'Max'
            ? ot.TextSize.Max
            : update === 'Min'
                ? ot.TextSize.Min
                : null;

        if (!size) return;

        // Select all text elements inside slides
        const textElements = document
            .getElementById(id)
            .querySelectorAll('.SlideContainer .SlideUT .SlideTextUT');

        // Apply the font size
        textElements.forEach(el => {
            el.style.fontSize = size;
        });
    }

    GetNumberOfSlidesToShow(ot) {
        function getSlides() {
            let Breakpoints = ot.Responsive.length;
            let ScWidth = window.innerWidth;
            for (let b = 0; b < Breakpoints; b++) {
                if (ScWidth <= parseInt(ot.Responsive[b].ViewPort)) {
                    return parseInt(ot.Responsive[b].ShowSlides);
                }
            }
            return parseInt(ot.Responsive[Breakpoints - 1].ShowSlides);
        }

        // Debounce function
        function debounce(func, delay) {
            let timeoutId;
            return function (...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        }

        // Check the Width Of the Window If Mentioned to Show the Number Of Slide
        if (ot.Responsive) {
            const debouncedGetSlides = debounce(() => {
                let SlideShownNo = getSlides();
                this.UpdateSlideMultiple({ SlideShownNo, ot })
            }, 250); // 250ms debounce delay

            window.addEventListener('resize', debouncedGetSlides);

            // Call the function once to set the initial value
            return getSlides();
        }
    }

    InViewUT(obj) {
        const Id = obj.Id;
        const Load = obj.Load;
        if (Id !== void (0)) {
            const elem = document.getElementById(Id);
            const posn = elem.getBoundingClientRect();
            const VwPtHt = window.innerHeight || document.documentElement.clientHeight;
            switch (Load) {
                case 'Start', 'Start':
                    return (posn.top || posn.y) < VwPtHt;
                    break;
                case 'Mid', 'Mid':
                    return (posn.top || posn.y) < (VwPtHt - posn.height / 2);
                    break;
                case 'End', 'End':
                    return (posn.top || posn.y) <= (VwPtHt - posn.height) || (posn.top <= 0);
                    break;
            }
        }
    }

    //Infinite Slider 
    getCard(d, classes, caption) {
        return `
        <div class="PnRe Ht100p OwHn">
            <img class="${classes.image}" src="${d.src}" alt="${d.title}">
            ${caption ? `
                <div class="${classes.captionContainer}">
                    <span class="${classes.caption}">${d.title}</span>
                </div>
            ` : ''}
        </div>`;
    }

    getNumberOfInfiniteSlidesToShow(resposiveObj) {
        const w = window.innerWidth;
        return w > 1024 ? resposiveObj.desktop : w > 668 ? resposiveObj.tablet : w > 568 ? resposiveObj.phone : 1;
    }

    infiniteSlider(obj) {
        let { data: baseData } = obj;
        obj.preventWheel = obj.preventWheel || false; // Default to false if not provided
        let sliderContainer = document.querySelector(`#${obj.id}`);

        if (!baseData || !sliderContainer) {
            console.error('Invalid data or slider container not found. Please check the data and container ID.');
            return;
        }

        // Prevent wheel scrolling
        if (obj.preventWheel) {
            sliderContainer.addEventListener('wheel', (e) => {
                e.preventDefault();
            }, { passive: false });
        }

        sliderContainer.classList.add('infiniteScrollSlider');

        obj.interval = obj.interval || 3000; // Default interval if not provided
        obj.caption = obj.caption || false; // Default caption if not provided

        const defaultClasses = {
            image: 'Wh100p Ht100p OtFtCr',
            captionContainer: 'PnAe PnBm6p PnLt50p PgTpBm10 PgLtRt10 Wh80p Br1 CrBrWe BrRs10 CrBk DyFx FxDnCn FxJyCtCr TmTeVe50p0p CrBdBk10Lt91',
            caption: 'CrWe TtAnCr',
        };

        if (!obj.classes) {
            obj.classes = defaultClasses;
        } else {
            // Assign default values if any property is missing
            for (let key in defaultClasses) {
                if (!obj.classes[key]) {
                    obj.classes[key] = defaultClasses[key];
                }
            }
        }

        const defaultResponsive = { // nunmber of slides to show on different devices
            phone: 1,
            tablet: 2,
            desktop: 3,
        };

        if (!obj.responsive) {
            obj.responsive = defaultResponsive;
        } else {
            // Assign default values if any property is missing
            for (let key in defaultResponsive) {
                if (!obj.responsive[key]) {
                    obj.responsive[key] = defaultResponsive[key];
                }
            }
        }

        //Clone Data two times
        const data = [...baseData, ...baseData];

        // create inner div 
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('DyFx', 'Ht100p');
        sliderContainer.appendChild(imgContainer);

        // get device size and manage how many cards to show
        const deviceSize = this.getNumberOfInfiniteSlidesToShow(obj.responsive);
        const cardWidth = imgContainer.clientWidth / deviceSize;

        // Clear previous
        imgContainer.innerHTML = '';

        data.forEach(d => {
            const div = document.createElement('div');
            div.style.minWidth = `${cardWidth}px`;
            div.style.height = `${100}%`;
            div.innerHTML = this.getCard(d, obj.classes, obj.caption);
            imgContainer.appendChild(div);
        });

        // Run the slider
        let index = 0;
        setInterval(() => {
            index++;
            imgContainer.style.transition = 'transform 1s ease-in-out';
            imgContainer.style.transform = `translateX(-${cardWidth * index}px)`;

            if (index >= baseData.length) {
                // Reset after transition completes
                setTimeout(() => {
                    imgContainer.style.transition = 'none';
                    imgContainer.style.transform = `translateX(0px)`;
                    index = 0;
                }, 1000); // match transition duration
            }
        }, obj.interval);
    }
}

class Calendar {
    constructor() {
        // Swipe Function Starts Here
        this.pageWidth = window.innerWidth || document.body.clientWidth;
        this.treshold = Math.max(1, Math.floor(0.01 * (this.pageWidth)));
        this.touchstartX = 0;
        this.touchstartY = 0;
        this.touchendX = 0;
        this.touchendY = 0;
        this.limit = Math.tan(45 * 1.5 / 180 * Math.PI);
        this.requestAnimationFrameId = null;

        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.initAttributeBasedCalendar();
            });
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.initAttributeBasedCalendar();
                    }, 1);
                });
            });
        }
    }

    initAttributeBasedCalendar() {
        const calendars = document.querySelectorAll('.AttributeBasedCalendar');

        calendars.forEach(calendar => {
            let obj = calendar.getAttribute('ot');
            obj = JSON.parse(obj);
            let startInputId = obj.RangeInput.StartDateInput;
            let endInputId = obj.RangeInput.EndDateInput;

            let startInputElement = calendar.querySelector('.StartInputCalendar')
            let endInputElement = calendar.querySelector('.EndInputCalendar')

            if (!startInputId || !startInputElement) {
                console.error('Invalid attribute based calendar configuration. Please ensure that the start and end input IDs are provided in the ot attribute. And start and end input fields are available with StartInputCalendar and EndInputCalendar class respectively');
                return;
            }

            if (startInputElement) {
                startInputElement.setAttribute('id', startInputId);
            }

            if (endInputElement && endInputId) {
                endInputElement.setAttribute('id', endInputId);
            }

            this.ShowCalender(obj);
        });
    }

    ShowCalender(Obj) {
        // Defining the intial value to the variable
        // Defining All Classes
        Obj.CsCalenderDiv = Obj.CsCalenderDiv || 'DyFx TtAnCr FxGw1 BxSwCrGy BrRs5 Pg3 FxDnCn';
        Obj.CsCalenderRowDayDiv = Obj.CsCalenderRowDayDiv || 'Wh100pD7 DyTeCl PgTpBm5 Br1 CrBrGy90Lt HrCrBdTe  CrurPr FtWt600';
        Obj.CsCalenderRowDayDisableDiv = Obj.CsCalenderRowDayDisableDiv || 'Wh100pD7 DyTeCl PgTpBm5 Br1 CrBrGy90Lt FtWt600 CrGy80Lt CrurNtAd';
        Obj.CsToday = Obj.CsToday || 'CrBdTe50Lt';
        Obj.CsWeekDay = Obj.CsWeekDay || 'Wh100pD7 DyTeCl PgTpBm5 Br1 CrBrGy90Lt  CrBdTe80Lt91 FtWt600';
        Obj.CsNextIcon = Obj.CsNextIcon || 'CT-ArrowRightCircleSolid';
        Obj.CsPrevIcon = Obj.CsPrevIcon || 'CT-ArrowLeftCircleSolid';
        Obj.CsSelectedDateStartEnd = Obj.CsSelectedDateStartEnd || ['BxSwItCrTe', 'BrRs3', 'CrBdTe90Lt97'];
        Obj.CsAdditionalInfo = Obj.CsAdditionalInfo || "FxCr FtSe10 CrRd";
        //Can take 'Date','Year','Month'
        Obj.Width = Obj.Width || { Mobile: "90%", Tablet: "253px", Desktop: "253px" };
        Obj.CalendarType = Obj.CalendarType || 'Date';
        Obj.StartYear = Obj.StartYear || new Date().getFullYear();
        Obj.StartMonth = Obj.StartMonth || new Date().getMonth();
        Obj.Language = Obj.Language || 'en-US';
        Obj.DateFormat = Obj.DateFormat || 'D-MM-YYYY';
        Obj.MonthDisplayNumber = Obj.MonthDisplayNumber || 1;
        Obj.CallBackFunc = Obj.CallBackFunc || "";
        Obj.DisablePreviousDays = Obj.DisablePreviousDays || "N";
        Obj.Event = Obj.Event || null;
        //Obj.SelectedStartDate = new Date(Obj.SelectedStartDate);
        //Obj.SelectedEndDate = new Date(Obj.SelectedEndDate);
        Obj.RangeInput = Obj.RangeInput || null;
        Obj.RangeSelectClass = Obj.RangeSelectClass || 'CrBdTe80Lt97';
        Obj.RangeSelectStartEndMarkCs = Obj.RangeSelectStartEndMarkCs || 'CalenderStartEnd';
        Obj.ShowMonths = Obj.ShowMonths || 1;
        Obj.RangeTheme = Obj.RangeTheme || null;
        Obj.PositionCalender = Obj.PositionCalender || null;
        Obj.ZIndex = Obj.ZIndex || `ZIx1000000`;
        Obj.NeverDisable = Obj.NeverDisable || false;


        if (Obj.PositionCalender) {
            Obj.PositionCalender.StartDateId = Obj.PositionCalender.StartDateId || null;
            Obj.PositionCalender.EndDateId = Obj.PositionCalender.EndDateId || null;
        }

        Obj.RangeSameDaySelect = Obj.RangeSameDaySelect || false;

        var CalendarType = Obj.CalendarType;
        var StartDateInput = Obj.StartDateInput;
        var RangeInput = Obj.RangeInput;
        var EndDateInput = null;

        if (RangeInput != null) {
            if (RangeInput.StartDateInput != null) {
                StartDateInput = RangeInput.StartDateInput;
                Obj.StartDateInput = RangeInput.StartDateInput;
            }
            if (RangeInput.EndDateInput != null) {
                EndDateInput = RangeInput.EndDateInput;
                Obj.EndDateInput = RangeInput.EndDateInput;
            }
        }

        if (StartDateInput != null) {
            // Defining the intial value to the Ends
            switch (CalendarType) {
                case 'Date': document.getElementById(StartDateInput)?.addEventListener('click', (e) => { Obj.CurrentSelectedInput = StartDateInput; Obj.Event = e; this.DateCalender(Obj);});
                    if (EndDateInput != null) { document.getElementById(EndDateInput)?.addEventListener('click', (e) => { Obj.CurrentSelectedInput = EndDateInput; Obj.Event = e; this.DateCalender(Obj); }); }
                    break;
                case 'Year': document.getElementById(StartDateInput)?.addEventListener('click', (e) => { Obj.CurrentSelectedInput = StartDateInput; Obj.Event = e; this.YearCalender(Obj); });
                    if (EndDateInput != null) { document.getElementById(EndDateInput)?.addEventListener('click', (e) => { Obj.CurrentSelectedInput = EndDateInput; Obj.Event = e; this.YearCalender(Obj); }); }
                    break;
                case 'Month': document.getElementById(StartDateInput)?.addEventListener('click', (e) => { Obj.CurrentSelectedInput = StartDateInput; Obj.Event = e; this.MonthCalender(Obj); });
                    if (EndDateInput != null) { document.getElementById(EndDateInput)?.addEventListener('click', (e) => { Obj.CurrentSelectedInput = EndDateInput; Obj.Event = e; this.MonthCalender(Obj); }); }
                    break;
            }
            if (document.getElementById(StartDateInput)) {

                this.SelectDefaultProvidedDate(Obj);

                this.SelectSelectedDate(Obj);
            }

        }
    }

    SelectDefaultProvidedDate(Obj) {
        if (!Obj || !Obj.RangeInput || !Obj.DefaultSelectedDate) return; // Ensure Obj and RangeInput exist

        Obj.InitialSelectDate = true;

        if (Obj.RangeInput.StartDateInput && Obj?.DefaultSelectedDate?.Start) {
            Obj.CurrentSelectedInput = Obj.RangeInput.StartDateInput;
            const { year, month, date } = Obj.DefaultSelectedDate.Start;

            // Ensure values are not null or undefined but allow `0` for month
            if (year != null || month != null || date != null) {
                this.DateSelect(year, month, date, Obj);
            }
        }

        if (Obj.RangeInput.EndDateInput && Obj?.DefaultSelectedDate?.End) {
            Obj.CurrentSelectedInput = Obj.RangeInput.EndDateInput;
            const { year, month, date } = Obj.DefaultSelectedDate.End;

            // Ensure values are not null or undefined but allow `0` for month
            if (year != null || month != null || date != null) {
                this.DateSelect(year, month, date, Obj);
            }
        }
    }

    /*
       attribute based calendar may have some date selected when we again initialize it, may remove selected date. So we need to again add back to the input value
    */
    SelectSelectedDate(Obj) {
        let startInputElement = document.getElementById(Obj.RangeInput.StartDateInput);
        let endInputElement = document.getElementById(Obj.RangeInput.EndDateInput);
        var StartDateInputValue = startInputElement?.dataset.selectedstartdate;
        var EndDateInputValue = endInputElement?.dataset.selectedenddate;

        if (StartDateInputValue) {
            // Parse the date directly
            const startDate = new Date(StartDateInputValue);
            Obj.SelectedStartDate = startDate;

            // Extract date components directly from the Date object
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const startDay = startDate.getDate();

            Obj.CurrentSelectedInput = Obj.RangeInput.StartDateInput;
            this.DateSelect(startYear, startMonth, startDay, Obj);
        }

        if (EndDateInputValue) {
            // Parse the date directly
            const endDate = new Date(EndDateInputValue);
            Obj.SelectedEndDate = endDate;

            // Extract date components directly from the Date object
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth();
            const endDay = endDate.getDate();

            // Store reference to which date is being selected (end date)
            Obj.CurrentlySelectingDate = 'end';
            this.DateSelect(endYear, endMonth, endDay, Obj);
        }
    }

    DateExistsInArray(targetDate, dataArray) {
        if (!targetDate || !dataArray) return [];
        return dataArray.filter(item => item.date === targetDate);
    }

    // Swipe Function
    handleGesture(e, Obj) {
        let x = this.touchendX - this.touchstartX;
        let y = this.touchendY - this.touchstartY;
        let xy = Math.abs(x / y);
        let yx = Math.abs(y / x);
        if (Math.abs(x) > this.treshold || Math.abs(y) > this.treshold) {
            if (yx <= this.limit) {
                if (x < 0) {
                    this.DateChangeUT(parseInt(Obj.StartYear), parseInt(Obj.StartMonth + 1), Obj);
                } else {
                    this.DateChangeUT(parseInt(Obj.StartYear), parseInt(Obj.StartMonth - 1), Obj);
                }
            }
        }

    }

    GetDayName(UserLang, dateStr) {
        var date = new Date(dateStr);
        return date.toLocaleDateString(UserLang, { weekday: 'long' });
    }

    generateRandomPrices(lowPrice, highPrice) {
        // Helper function to generate a random integer between low and high (inclusive)
        function getRandomPrice(low, high) {
            return Math.floor(Math.random() * (high - low + 1)) + low;
        }

        // Validate inputs
        if (lowPrice >= highPrice) {
            throw new Error("Low price must be less than high price.");
        }

        // Generate 62 random prices
        const result = Array.from({ length: 62 }, () => getRandomPrice(lowPrice, highPrice));

        return result;
    }

    /*
     @params {boolean} changeDateClick: to identify the date, month, year change
    */
    DateCalender(Obj, changeDateClick = false) {
        // Start Calender Date is Decided In Two Function 1) DateCalender 2) DateSelect
        try {
            if (Obj.Event) {
                Obj.CurrentSelectedInput = Obj.Event.target.id;
                //if null then Calender Not Formed & DateArrowButton becomes nonfunctional as it picks same Date
                //that in the text box
                // if (Obj.Event.target.value != null && Obj.Event.target.value != "" && Obj.DateArrowActive != 'Y') {
                //     console.log('run')
                //     Obj.StartYear = new Date(Obj.Event.target.value).getFullYear();
                //     Obj.StartMonth = new Date(Obj.Event.target.value).getMonth();
                // }
                Obj.DateArrowActive = 'N';
            }
        } catch { }

        //Gets the current Date variables
        var CurrentSelectedInput = Obj.CurrentSelectedInput;
        var CurrentSelectedInputValue = document.getElementById(Obj.CurrentSelectedInput)?.value;
        var StartDateInputValue = document.getElementById(Obj.RangeInput.StartDateInput)?.value;
        var EndDateInputValue = document.getElementById(Obj.RangeInput.EndDateInput)?.value;

        var today = new Date();

        // open the calender as per the selected date
        var UserYear = changeDateClick ? Obj.StartYear : CurrentSelectedInputValue != '' ? new Date(CurrentSelectedInputValue).getFullYear() : StartDateInputValue ? new Date(StartDateInputValue).getFullYear() : today.getFullYear();
        var UserMonth = changeDateClick ? Obj.StartMonth : CurrentSelectedInputValue != '' ? new Date(CurrentSelectedInputValue).getMonth() : StartDateInputValue ? new Date(StartDateInputValue).getMonth() : today.getMonth();
        var UserLang = Obj.Language;
        var StartDateInput = Obj.StartDateInput;
        var EndDateInput = Obj.EndDateInput;
        var DisableCount = null;
        var DisableDate = null;
        var DisableBeforeDateCheck = null;
        var DiasableAfterDateCheck = null;
        var DisableCalenderDate = null;
        var SelectedStartDate = StartDateInputValue ? Obj.SelectedStartDate : today;
        var SelectedEndDate = EndDateInputValue ? Obj.SelectedEndDate : null;

        var RangeCalender = 'N';
        var RangeTheme = Obj.RangeTheme;
        var ShowMonths = (window.innerWidth < 568) ? 1 : Obj.ShowMonths;
        var StartCalenderPosition = null;
        var EndCalenderPosition = null;
        var DisableAfterDays = null;
        var RangeContainer = null;
        var ThemeHeader = null;
        var ThemeFooter = null;
        var ThemeMonthBar = null;
        let todayDateSum = today.getFullYear() + today.getMonth() + today.getDate();

        // Store calender's position
        if (Obj.PositionCalender) {
            if (Obj.PositionCalender.StartDateId) { StartCalenderPosition = Obj.PositionCalender.StartDateId; }
            if (Obj.PositionCalender.EndDateId) { EndCalenderPosition = Obj.PositionCalender.EndDateId; }
        }

        if (Obj.RangeInput != null) RangeCalender = 'Y';
        if (Obj.DisableAfterDays) DisableAfterDays = Obj.DisableAfterDays;

        // Disable Dates On the Basis Of Date Passed
        if (Obj.DisableDate) {
            DisableDate = Obj.DisableDate;
            DisableCalenderDate = true;

            if (DisableDate.Before) {
                DisableBeforeDateCheck = new Date(DisableDate.Before);
            }
            if (DisableDate.After) {
                DiasableAfterDateCheck = new Date(DisableDate.After);
            }
        }

        // Disable Dates On the Basis Of Count
        if (Obj.DisableCount) {
            DisableCount = Obj.DisableCount;
            DisableCalenderDate = true;

            if (DisableCount.Before) {
                DisableBeforeDateCheck = new Date(today.getFullYear(), today.getMonth(), (today.getDate() - DisableCount.Before));
            }
            if (DisableCount.After) {
                DiasableAfterDateCheck = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + DisableCount.After));
            }
        }

        // Checking if the Range Input Calender then if the enddate is selected then disable dates before the check In Dates
        if (Obj.RangeInput) {
            if (CurrentSelectedInput == Obj.EndDateInput) {
                DisableBeforeDateCheck = new Date(document.getElementById(Obj.StartDateInput).value);
            }
        }

        // Disable Dates On the Basis DisableAfterDays
        if (DisableAfterDays) {
            if (CurrentSelectedInput == Obj.EndDateInput) {
                DisableCalenderDate = true;
                DisableBeforeDateCheck = new Date(document.getElementById(Obj.StartDateInput).value);
                DiasableAfterDateCheck = new Date(DisableBeforeDateCheck.getFullYear(), DisableBeforeDateCheck.getMonth(), parseInt(DisableBeforeDateCheck.getDate() + DisableAfterDays));
            }
        }

        if (RangeTheme) {
            var getTheme = this.RangeTheme1(Obj);

            // Range Calender Outer Container
            RangeContainer = document.createElement('div');
            RangeContainer.setAttribute('class', 'Pg0 BrRs5 BxSwCrGy Wh100P Sl:Pg10')

            // Set Header, Footer, and Month Bar
            ThemeHeader = getTheme.Head;
            ThemeFooter = getTheme.Foot;
            ThemeMonthBar = getTheme.MonthBar;
        }

        // Calender Container
        var CalenderDivContainer = document.createElement('div');
        CalenderDivContainer.setAttribute("class", "DyFx Gp5");


        // Adding Event Listner for the swipe functionality
        CalenderDivContainer.addEventListener('touchstart', (event) => {
            this.touchstartX = event.changedTouches[0].screenX;
            this.touchstartY = event.changedTouches[0].screenY;
        }, false);

        CalenderDivContainer.addEventListener('touchend', (event) => {
            this.touchendX = event.changedTouches[0].screenX;
            this.touchendY = event.changedTouches[0].screenY;
            this.handleGesture(event, Obj);
        }, false);
        // Ends Adding Event Listner for the swipe functionality
        // Main Head Ends


        // Get the current screen width
        const screenWidth = window.innerWidth;
        // Determine the width based on screen size
        let width;
        if (screenWidth <= 568) {
            width = Obj.Width.Mobile; // Mobile
        } else if (screenWidth <= 1024) {
            width = Obj.Width.Tablet; // Tablet
        } else {
            width = Obj.Width.Desktop; // Desktop
        }

        // Create DayNameRow
        var WeekDay = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

        // For Comparing Month Start Date DayName
        var WeekDayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        for (var mx = 0; mx < ShowMonths; mx++) { // How many calendar chart to show. Range Calender 2 and otherwise 1
            // Outer Container of a Calender
            const CalenderDiv = document.createElement("div");

            // This Can Customized with the help of Class
            CalenderDiv.setAttribute('class', Obj.CsCalenderDiv);
            CalenderDiv.setAttribute('CalenderCT', 'UTCalenderDateDiv');
            CalenderDiv.setAttribute('id', 'UTCalenderDateDiv' + mx);
            CalenderDiv.setAttribute("style", `width:${width}`);

            var month = new Date(UserYear, UserMonth).toLocaleString(UserLang, { month: 'short' }); // return 'jan' 'feb' ... so on

            // Adding Calender Rows
            var monthDate = 1;

            var CalenderCurrentStartDate = new Date(UserYear, parseInt(UserMonth + mx), monthDate) // return eg: Sun Feb 08 2026 00:00:00 GMT+0530 (India Standard Time)
            var CalenderDayName = this.GetDayName(UserLang, CalenderCurrentStartDate);
            var CalenderYear = CalenderCurrentStartDate.getFullYear();
            var CalenderMonth = CalenderCurrentStartDate.getMonth();
            var CalenderMonthName = new Date(CalenderYear, CalenderMonth).toLocaleString(UserLang, { month: 'short' });
            var MonthDays = new Date(CalenderYear, CalenderMonth + 1, 0).getDate(); // How many days in this month


            if (!RangeTheme) { // Simple Singular Calender

                // Main Header
                const CalenderHeadDiv = document.createElement('div');
                // CalenderHeadDiv.setAttribute('class', 'CalenderHead CalenderRowHighlight');
                CalenderHeadDiv.setAttribute('class', 'DyFx FxAnIsCr FxJyCtCr Wh100P Mn2 Ht40 FtWt600');
                CalenderDiv.appendChild(CalenderHeadDiv);

                // First Container [<- Month ->]
                const CalenderIconMonthDiv = document.createElement('div');
                CalenderIconMonthDiv.setAttribute('class', 'DyFx FxDnRw Wh50p PgRt3');
                CalenderHeadDiv.appendChild(CalenderIconMonthDiv);

                // Previus Icon
                const SubMonthDiv = document.createElement('div');
                SubMonthDiv.addEventListener('click', () => { this.DateChangeUT(parseInt(UserYear), parseInt(UserMonth - 1), Obj); });
                SubMonthDiv.setAttribute('class', "CrurPr FxCrAnJy");
                CalenderIconMonthDiv.appendChild(SubMonthDiv);
                SubMonthDiv.innerHTML = `<i class="${Obj.CsPrevIcon}" > </i>`;

                // Month Name
                const CalenderCurrentMonth = document.createElement('div');
                CalenderCurrentMonth.addEventListener('click', () => { this.MonthCalender(Obj) });
                CalenderCurrentMonth.setAttribute('class', 'CrurPr');
                CalenderCurrentMonth.classList.add('FxGw1');
                CalenderCurrentMonth.classList.add('FxCrAnJy');

                // Next Icon
                CalenderCurrentMonth.innerHTML = month;
                CalenderIconMonthDiv.appendChild(CalenderCurrentMonth);
                const AddMonthDiv = document.createElement('div');
                AddMonthDiv.addEventListener('click', () => { this.DateChangeUT(parseInt(UserYear), parseInt(UserMonth + 1), Obj); });
                AddMonthDiv.setAttribute('class', "CrurPr FxCrAnJy");
                CalenderIconMonthDiv.appendChild(AddMonthDiv);
                AddMonthDiv.innerHTML = `<i class="${Obj.CsNextIcon}" > </i>`;
                // End Month Change Button

                // Second Container: [<- Year ->]
                const CalenderIconYearDiv = document.createElement('div');
                CalenderIconYearDiv.setAttribute('class', 'DyFx FxDnRw Wh50p PgLt3');
                CalenderHeadDiv.appendChild(CalenderIconYearDiv);

                // Previous Icon
                const SubYearDiv = document.createElement('div');
                SubYearDiv.addEventListener('click', () => { this.DateChangeUT(parseInt(UserYear - 1), parseInt(UserMonth), Obj); });
                SubYearDiv.setAttribute('class', "CrurPr FxCrAnJy");
                CalenderIconYearDiv.appendChild(SubYearDiv);
                SubYearDiv.innerHTML = `<i class="${Obj.CsPrevIcon}" > </i>`;

                // Year Number
                const CalenderCurrentYear = document.createElement('div');
                CalenderCurrentYear.addEventListener('click', () => { this.YearCalender(Obj) });
                CalenderCurrentYear.setAttribute('class', 'CrurPr FxGw1 FxCrAnJy');

                //Checks Leap Year
                if (new Date(UserYear, 1, 29).getDate() === 29) {
                    CalenderCurrentYear.innerHTML = `${UserYear} L`;
                }
                else {
                    CalenderCurrentYear.innerHTML = UserYear;
                }
                CalenderIconYearDiv.appendChild(CalenderCurrentYear);

                // Next Icon
                const AddYearDiv = document.createElement('div');
                AddYearDiv.addEventListener('click', () => { this.DateChangeUT(parseInt(UserYear + 1), parseInt(UserMonth), Obj); });
                AddYearDiv.setAttribute('class', "CrurPr FxCrAnJy");
                CalenderIconYearDiv.appendChild(AddYearDiv);
                AddYearDiv.innerHTML = `<i class="${Obj.CsNextIcon}" > </i>`;

            }
            else { // Range Calender

                // Calender Header
                var CalenderMonthDiv = document.createElement('div');
                CalenderMonthDiv.setAttribute('class', 'CrurPr  FxCrAnJy PgTpBm10 Wh100p FtWt700');
                var CalenderMonthIcon = document.createElement('i');
                CalenderMonthIcon.setAttribute('class', 'CT-CalenderSmallLine');
                CalenderMonthIcon.innerHTML = " ";
                CalenderMonthDiv.appendChild(CalenderMonthIcon);
                CalenderMonthDiv.appendChild(document.createTextNode(" " + CalenderMonthName + " - " + CalenderYear));
                CalenderDiv.appendChild(CalenderMonthDiv);
            }

            // Calender Body
            var CalenderDateDiv = document.createElement('div');
            CalenderDateDiv.setAttribute('class', 'DyTe BrCeCe BrSg0 Wh100p')

            // Week Day Header
            var CalenderRowDiv = document.createElement('div');
            CalenderRowDiv.setAttribute('class', 'DyTeRw')

            // Adding the Day Name Mo Tu etc
            WeekDay.forEach((day) => {
                var DayNameDiv = document.createElement('div');
                DayNameDiv.setAttribute('class', Obj.CsWeekDay);
                DayNameDiv.innerHTML = day;
                CalenderRowDiv.appendChild(DayNameDiv);
            })

            CalenderDateDiv.appendChild(CalenderRowDiv);

            // Adds the Dates To Calender
            for (var WeekRow = 0; WeekRow < 6; WeekRow++) {

                // Each Row
                var CalenderRowDiv = document.createElement('div');
                CalenderRowDiv.setAttribute('class', 'DyTeRw');

                for (var weekDay = 0; weekDay < 7; weekDay++) {

                    // Each Date
                    var CalenderRowDayDiv = document.createElement('div');
                    CalenderRowDayDiv.setAttribute('class', Obj.CsCalenderRowDayDiv);

                    let DateVar = monthDate;
                    let MonthVar = CalenderMonth;
                    let YearVar = CalenderYear;

                    if (CalenderDayName == WeekDayName[weekDay] && monthDate <= MonthDays) {

                        CalenderRowDayDiv.setAttribute('CelebrateDate', CalenderYear + '-' + parseInt(CalenderMonth + 1) + '-' + monthDate);

                        var CreatedDate = new Date(CalenderYear, CalenderMonth, monthDate);

                        // Format date as DD-MM-YYYY
                        const formattedDate = CreatedDate.toLocaleDateString('en-GB').split('/').join('-');
                        let extraInfo = this.DateExistsInArray(formattedDate, Obj.AdditionalInfo);
                        if (extraInfo.length > 0) {
                            CalenderRowDayDiv.innerHTML = `<div class="FxCr" >${monthDate} </div>
                            <div class="${Obj.CsAdditionalInfo}">${extraInfo[0].info}</div>`;
                        } else {
                            CalenderRowDayDiv.innerHTML = `<div class="FxCr" > ${monthDate} </div>`;
                        }

                        /* 
                            Check For the PreviousDisable And StartEndDisable And DisableAfter
                            There are conditions 
                            1) Disable before Only
                            2) Disable After Only 
                            3) Disable Before and After Both
                        */
                        if (DisableCalenderDate == true) {
                            //Disable Before and After Both
                            if (DisableBeforeDateCheck != null && DiasableAfterDateCheck != null) {
                                if ((CreatedDate > DisableBeforeDateCheck && CreatedDate < DiasableAfterDateCheck)
                                    || (CreatedDate >= DisableBeforeDateCheck && CreatedDate < DiasableAfterDateCheck && Obj.RangeSameDaySelect == true)) {
                                    CalenderRowDayDiv.addEventListener('click', () => {
                                        this.DateSelect(YearVar, MonthVar, DateVar, Obj)
                                    });
                                    if (RangeCalender == 'Y') {
                                        CalenderRowDayDiv.addEventListener('mouseover', (event) => { this.HighlightDate(Obj, event); });
                                    }
                                }
                                else {
                                    CalenderRowDayDiv.setAttribute('class', Obj.CsCalenderRowDayDisableDiv);
                                }
                            }
                            //Disable Before Only
                            else if (DisableBeforeDateCheck != null && DiasableAfterDateCheck == null) {
                                if ((CreatedDate >= DisableBeforeDateCheck)
                                    || (CreatedDate >= DisableBeforeDateCheck && Obj.RangeSameDaySelect == true)) {
                                    CalenderRowDayDiv.addEventListener('click', () => {
                                        this.DateSelect(YearVar, MonthVar, DateVar, Obj)
                                    });
                                    if (RangeCalender == 'Y') {
                                        CalenderRowDayDiv.addEventListener('mouseover', (event) => { this.HighlightDate(Obj, event); });
                                    }
                                }
                                else {
                                    CalenderRowDayDiv.setAttribute('class', Obj.CsCalenderRowDayDisableDiv);
                                }
                            }
                            // Disable After Only
                            else if (DisableBeforeDateCheck == null && DiasableAfterDateCheck != null) {
                                if (CreatedDate < DiasableAfterDateCheck) {
                                    CalenderRowDayDiv.addEventListener('click', () => {
                                        this.DateSelect(YearVar, MonthVar, DateVar, Obj)
                                    });
                                    if (RangeCalender == 'Y') {
                                        CalenderRowDayDiv.addEventListener('mouseover', (event) => { this.HighlightDate(Obj, event); });
                                    }
                                }
                                else {
                                    CalenderRowDayDiv.setAttribute('class', Obj.CsCalenderRowDayDisableDiv);
                                }
                            }
                        }
                        else {
                            CalenderRowDayDiv.addEventListener('mouseover', (event) => { this.HighlightDate(Obj, event); });

                            if (!Obj.SelectedStartDate) {
                                CalenderRowDayDiv.addEventListener('click', () => {
                                    this.DateSelect(YearVar, MonthVar, DateVar, Obj);
                                    var DatePickerElement = document.getElementById(CurrentSelectedInput);
                                    SelectedStartDate = DatePickerElement.value;
                                    Obj.SelectedStartDate = new Date(DatePickerElement.value);
                                });
                            } else {
                                if (Obj.NeverDisable || CreatedDate > SelectedStartDate) {
                                    CalenderRowDayDiv.addEventListener('click', () => {
                                        this.DateSelect(YearVar, MonthVar, DateVar, Obj);
                                        var DatePickerElement = document.getElementById(CurrentSelectedInput);
                                        SelectedEndDate = DatePickerElement.value;
                                        Obj.SelectedEndDate = new Date(SelectedEndDate);
                                    });
                                } else {
                                    // disable all the previous dates
                                    CalenderRowDayDiv.setAttribute('class', Obj.CsCalenderRowDayDisableDiv);
                                }
                            }
                        }

                        // Highlight Current Date
                        if ((new Date(today.getFullYear(), today.getMonth(), today.getDate())).getTime() === (new Date(YearVar, MonthVar, DateVar)).getTime()) {
                            CalenderRowDayDiv.classList.add(Obj.CsToday);
                        }

                        // Highlight Selected Start Date
                        if (SelectedStartDate != null && SelectedStartDate != undefined) {
                            if (!(SelectedStartDate instanceof Date)) {
                                SelectedStartDate = new Date(SelectedStartDate);
                            }

                            if (CreatedDate.toDateString() === SelectedStartDate.toDateString()) {
                                for (var i = 0; i < Obj.CsSelectedDateStartEnd.length; i++) {
                                    CalenderRowDayDiv.classList.add(Obj.CsSelectedDateStartEnd[i]);
                                }
                            }
                        }

                        // Highlight Selected End Date
                        if (SelectedEndDate != null && SelectedEndDate != undefined) {
                            if (CreatedDate.toDateString() === SelectedEndDate.toDateString()) {
                                for (var i = 0; i < Obj.CsSelectedDateStartEnd.length; i++) {
                                    CalenderRowDayDiv.classList.add(Obj.CsSelectedDateStartEnd[i]);
                                }
                            }
                        }

                        //Add Background color on dates
                        if (CreatedDate >= SelectedStartDate && CreatedDate <= SelectedEndDate) {
                            if (!CalenderRowDayDiv.classList.contains('CrBdTe90Lt97')) {
                                CalenderRowDayDiv.classList.add('CrBdTe90Lt97');
                            }
                        }

                        monthDate++;
                        CalenderDayName = this.GetDayName(UserLang, new Date(CalenderYear, CalenderMonth, monthDate));
                    }
                    else {
                        CalenderRowDayDiv.innerHTML = `<div class="FxCr" ></div>`;
                    }

                    CalenderRowDiv.appendChild(CalenderRowDayDiv);

                }

                CalenderDateDiv.appendChild(CalenderRowDiv);

                CalenderDiv.appendChild(CalenderDateDiv);

                // Month Date exceed the total number of days in the month break loop
                if (monthDate > MonthDays) break;
            }

            //Adding Left Arrow
            if (RangeTheme) {
                if (mx == 0) {
                    var ArrowDiv = document.createElement('div');
                    ArrowDiv.setAttribute('class', 'FxCr Mn5');
                    var ArrowSpan = document.createElement('span');
                    ArrowSpan.setAttribute('class', 'FtSe24 CrTe FxCr FtWt800 CrurPr');
                    ArrowSpan.addEventListener('click', () => { this.DateChangeUT(parseInt(UserYear), parseInt(UserMonth - 1), Obj); });
                    var IconLeft = document.createElement('i');
                    IconLeft.setAttribute('class', Obj.CsPrevIcon);

                    ArrowSpan.appendChild(IconLeft);
                    ArrowDiv.appendChild(ArrowSpan);
                    CalenderDivContainer.appendChild(ArrowDiv);
                }
            }

            //Adding Calenders
            CalenderDivContainer.appendChild(CalenderDiv);

            //Adding Right Arrow
            if (RangeTheme) {
                if (mx == parseInt(ShowMonths - 1)) {
                    var ArrowDiv = document.createElement('div');
                    ArrowDiv.setAttribute('class', 'FxCr Mn5');
                    var ArrowSpan = document.createElement('span');
                    ArrowSpan.setAttribute('class', 'FtSe24 CrTe FxCr FtWt800 CrurPr');
                    ArrowSpan.addEventListener('click', () => { this.DateChangeUT(parseInt(UserYear), parseInt(UserMonth + 1), Obj); });

                    var IconRight = document.createElement('i');
                    IconRight.setAttribute('class', Obj.CsNextIcon)

                    ArrowSpan.appendChild(IconRight);
                    ArrowDiv.appendChild(ArrowSpan);
                    CalenderDivContainer.appendChild(ArrowDiv);
                }
            }
        }

        if (RangeTheme) {
            RangeContainer.appendChild(ThemeHeader);
            RangeContainer.appendChild(CalenderDivContainer);
            RangeContainer.appendChild(ThemeFooter);
            Obj.CreatedCalender = RangeContainer;

            // Checking Where To Open The Calender RangeCalPosition
            if (CurrentSelectedInput == StartDateInput && StartCalenderPosition != null) {
                Obj.PostionCalender = StartCalenderPosition;
            }
            else if (CurrentSelectedInput == EndDateInput && EndCalenderPosition != null) {
                Obj.PostionCalender = EndCalenderPosition;
            }
            else if (StartCalenderPosition == null && EndCalenderPosition == null) {
                Obj.PostionCalender = CurrentSelectedInput;
            }
        }
        else {
            Obj.CreatedCalender = CalenderDivContainer;
            Obj.PostionCalender = CurrentSelectedInput;
        }
        this.AddCalender(Obj);
    }

    RangeTheme1(Obj) {
        var SelectedRange = null;
        var StartDateFo = null;
        var EndDateFo = null;
        var StartMonthName = null;
        var EndMonthName = null;
        var StartYear = null;
        var EndYear = null;

        var StartDate = Obj.SelectedStartDate;
        var EndDate = Obj.SelectedEndDate;
        var CurrentSelectedInput = Obj.CurrentSelectedInput;
        var StartDateInput = Obj.StartDateInput;
        var RangeInput = Obj.RangeInput;
        var EndDateInput = Obj.EndDateInput;

        if (StartDate) {
            StartDateFo = StartDate.getDate() + "/" + (StartDate.getMonth() + 1) + "/" + StartDate.getFullYear();
            StartMonthName = StartDate.toLocaleString(Obj.UserLang, { month: 'short' });
            StartYear = StartDate.getFullYear();
        }

        if (EndDate) {
            EndDateFo = EndDate.getDate() + "/" + (EndDate.getMonth() + 1) + "/" + EndDate.getFullYear();
            EndMonthName = EndDate.toLocaleString(Obj.UserLang, { month: 'short' });
            EndYear = EndDate.getFullYear();
        }

        if (StartDate && EndDate) {
            SelectedRange = (EndDate - StartDate) / (1000 * 60 * 60 * 24);
        }

        var CalenderRangeHead = document.createElement("div");
        CalenderRangeHead.setAttribute('class', 'DyFx Mn10 FxJyCtSeBn');

        var CalenderRangeCalDiv = document.createElement("div");

        var RangeSelected = document.createElement('h2');
        RangeSelected.setAttribute('id', 'RangeDuration');
        RangeSelected.setAttribute('class', 'FtSe10 Sl:FtSe16 Md:FtSe24');

        if (SelectedRange != null) {
            if (SelectedRange == 1) {
                RangeSelected.innerHTML = SelectedRange + ' Night' + " / " + parseInt(SelectedRange + 1) + " Days";
            } else { RangeSelected.innerHTML = SelectedRange + ' Nights' + " / " + parseInt(SelectedRange + 1) + " Days"; }

        } else {
            RangeSelected.innerHTML = 'No Selection';

        }

        CalenderRangeCalDiv.appendChild(RangeSelected);

        var RangeFromTo = document.createElement('p');
        RangeFromTo.setAttribute('id', 'RangeFromTo');
        RangeFromTo.setAttribute('class', 'Mn0 FtSe8 Sl:FtSe14 Md:FtSe20 FtWt600');

        if (SelectedRange != null) {
            RangeFromTo.innerHTML = StartDateFo + " To " + EndDateFo;

        } else {
            RangeFromTo.innerHTML = 'No Date';
        }
        CalenderRangeCalDiv.appendChild(RangeFromTo);

        //First Addition to Calender Range Head
        CalenderRangeHead.appendChild(CalenderRangeCalDiv);

        // Calender Start Date Input Starts
        var CalenderRangeHeadDateDiv = document.createElement('div');
        CalenderRangeHeadDateDiv.setAttribute('class', 'BrRs7 DyFx Br1 MnLt10');

        var CalenderRangeHeadDateDivDate = document.createElement('div');
        CalenderRangeHeadDateDivDate.setAttribute('class', 'DyFx FxDnCn Pg8');

        if (RangeInput != null) {
            if (CurrentSelectedInput == StartDateInput) {
                CalenderRangeHeadDateDivDate.classList.add('FsActive');
            }
        }

        var CalenderRangeHeadDateDivDateCap = document.createElement('div');
        CalenderRangeHeadDateDivDateCap.setAttribute('class', 'MnLt2 FtWt900 FtSe10');
        CalenderRangeHeadDateDivDateCap.innerHTML = 'Check In';

        CalenderRangeHeadDateDivDate.appendChild(CalenderRangeHeadDateDivDateCap);

        var NormalDiv = document.createElement('div');
        NormalDiv.setAttribute('class', 'PnRe');
        var CalenderRangeHeadDateDivDateInp = document.createElement('input');
        CalenderRangeHeadDateDivDateInp.setAttribute('class', 'Mn0 Pg1 FtSe12 FtWt400 Br0 Wh80p CrBdTt CrBrTt');
        CalenderRangeHeadDateDivDateInp.setAttribute('id', 'CalenderStartDateInput');
        CalenderRangeHeadDateDivDateInp.addEventListener('focus', () => { this.SelectStartOrEnd(Obj, 'Start'); });
        CalenderRangeHeadDateDivDateInp.setAttribute('placeholder', "DD/MM/YY");
        if (StartDateFo != null) {
            CalenderRangeHeadDateDivDateInp.value = StartDateFo;
        }
        NormalDiv.appendChild(CalenderRangeHeadDateDivDateInp);

        var CalenderRangeHeadDateDivDateInpClear = document.createElement('div');
        CalenderRangeHeadDateDivDateInpClear.setAttribute('class', 'PnAe FtSe10 Rt20 Tp0');

        NormalDiv.appendChild(CalenderRangeHeadDateDivDateInpClear);

        CalenderRangeHeadDateDivDate.appendChild(NormalDiv);
        CalenderRangeHeadDateDiv.appendChild(CalenderRangeHeadDateDivDate);

        // Calender Start Date Input Ends

        //Calender End Date Input Starts
        var CalenderRangeHeadDateDivDate2 = document.createElement('div');
        CalenderRangeHeadDateDivDate2.setAttribute('class', 'DyFx FxDnCn Pg8');
        if (RangeInput != null) {
            if (CurrentSelectedInput == EndDateInput) {
                CalenderRangeHeadDateDivDate2.classList.add('FsActive');
            }
        }

        var CalenderRangeHeadDateDivDateCap2 = document.createElement('div');
        CalenderRangeHeadDateDivDateCap2.setAttribute('class', 'MnLt2 FtWt900 FtSe10');
        CalenderRangeHeadDateDivDateCap2.innerHTML = 'Check Out';

        CalenderRangeHeadDateDivDate2.appendChild(CalenderRangeHeadDateDivDateCap2);

        var NormalDiv2 = document.createElement('div');
        NormalDiv2.setAttribute('class', 'PnRe');
        var CalenderRangeHeadDateDivDateInp2 = document.createElement('input');
        CalenderRangeHeadDateDivDateInp2.setAttribute('class', 'Mn0 Pg1 FtSe12 FtWt400 Br0 Wh80p CrBdTt CrBrTt');
        CalenderRangeHeadDateDivDateInp2.setAttribute('id', 'CalenderStartDateInput');
        CalenderRangeHeadDateDivDateInp2.addEventListener('focus', () => { this.SelectStartOrEnd(Obj, 'End'); });
        CalenderRangeHeadDateDivDateInp2.setAttribute('oninput', 'CalenderStartCloseButton()');
        CalenderRangeHeadDateDivDateInp2.setAttribute('placeholder', "DD/MM/YY");
        if (EndDateFo != null) {
            CalenderRangeHeadDateDivDateInp2.value = EndDateFo;
        }
        NormalDiv2.appendChild(CalenderRangeHeadDateDivDateInp2);

        var CalenderRangeHeadDateDivDateInpClear2 = document.createElement('div');
        CalenderRangeHeadDateDivDateInpClear2.setAttribute('class', 'PnAe FtSe10 Rt20 Tp0');

        NormalDiv2.appendChild(CalenderRangeHeadDateDivDateInpClear2);

        CalenderRangeHeadDateDivDate2.appendChild(NormalDiv2);
        CalenderRangeHeadDateDiv.appendChild(CalenderRangeHeadDateDivDate2);

        // Calender End Date Input Ends

        //Add To Parent Div
        CalenderRangeHead.appendChild(CalenderRangeHeadDateDiv);
        //Ends

        // Calender Range Foot Starts From Here
        var CalenderRangeFoot = document.createElement('div');
        CalenderRangeFoot.setAttribute('class', 'DyFx Mn10 FxJyCtSeBn');
        var Div1 = document.createElement('div');
        CalenderRangeFoot.appendChild(Div1);
        var CalenderRangeFootBnDv = document.createElement('div');
        CalenderRangeFootBnDv.setAttribute('class', 'DyFx Mn10 Gp6 JyCtCr FxAnIsCr');;

        var ClearAnchor = document.createElement('a');
        ClearAnchor.setAttribute('class', 'TtDnLeUe CrurPr FtWt900 FtSe13 HrCrBdGy');
        ClearAnchor.innerText = "Clear Dates";
        ClearAnchor.addEventListener('click', () => { this.ClearCalenderDates(Obj); });
        CalenderRangeFootBnDv.appendChild(ClearAnchor);

        var CalenderRangeFootCsBn = document.createElement('div');
        CalenderRangeFootCsBn.setAttribute('class', 'Pg6 FtSe13 BrRs5 CrurPr FtWt600');
        CalenderRangeFootCsBn.innerHTML = 'Close';
        CalenderRangeFootCsBn.addEventListener('click', () => { this.CloseCalender(Obj); });
        CalenderRangeFootBnDv.append(CalenderRangeFootCsBn);
        CalenderRangeFoot.appendChild(CalenderRangeFootBnDv);
        // Calender Range Foot Ends  Here

        // Calender Month Head Starts From Here
        var CalenderMonthHeadCont = document.createElement('div');
        CalenderMonthHeadCont.classList.add('DyFx');
        CalenderMonthHeadCont.classList.add('FxJyCtSeBn');

        var CalenderMonthHead1 = document.createElement('div');
        CalenderMonthHead1.setAttribute('class', 'DyFx FxAnIsCr FxJyCtCr Wh100P Mn2 Ht40');
        var CalenderMonthHead1Child = document.createElement('div');
        CalenderMonthHead1Child.setAttribute('class', 'Wh100p');
        var CalenderMonthHead1ChildSpan = document.createElement('span');

        // Set on Click Event on Arrow
        CalenderMonthHead1ChildSpan.innerHTML = '<i class="UT-ArrowLeft"></i>';
        CalenderMonthHead1Child.appendChild(CalenderMonthHead1ChildSpan);

        // CalenderMonthHead1ChildsDiv starts
        var CalenderMonthHead1ChildsDiv = document.createElement('div');
        CalenderMonthHead1ChildsDiv.setAttribute('class', 'CrurPr FxGw1 FxCrAnJy');
        var CalenderMonthHead1ChildsDivIcon = document.createElement('i');
        CalenderMonthHead1ChildsDivIcon.setAttribute('class', 'UT-CalenderSmallLine');
        CalenderMonthHead1ChildsDivIcon.classList.add('FtWt700');
        CalenderMonthHead1ChildsDivIcon.innerHTML = StartMonthName + " " + StartYear;
        CalenderMonthHead1ChildsDiv.appendChild(CalenderMonthHead1ChildsDivIcon);
        // CalenderMonthHead1ChildsDiv Ends

        CalenderMonthHead1Child.appendChild(CalenderMonthHead1ChildsDiv);
        CalenderMonthHead1.appendChild(CalenderMonthHead1Child);
        CalenderMonthHeadCont.appendChild(CalenderMonthHead1);

        var CalenderMonthHead2 = document.createElement('div');
        CalenderMonthHead2.setAttribute('class', 'DyFx FxAnIsCr FxJyCtCr Wh100P Mn2 Ht40');
        var CalenderMonthHead2Child = document.createElement('div');
        CalenderMonthHead2Child.setAttribute('class', 'Wh100p');


        // CalenderMonthHead2ChildsDiv starts
        var CalenderMonthHead2ChildsDiv = document.createElement('div');
        CalenderMonthHead2ChildsDiv.setAttribute('class', 'CrurPr FxGw1 FxCrAnJy');
        var CalenderMonthHead2ChildsDivIcon = document.createElement('i');
        CalenderMonthHead2ChildsDivIcon.setAttribute('class', 'UT-CalenderSmallLine');
        CalenderMonthHead2ChildsDivIcon.classList.add('FtWt700');
        CalenderMonthHead2ChildsDivIcon.innerHTML = EndMonthName + " " + EndYear;
        CalenderMonthHead2ChildsDiv.appendChild(CalenderMonthHead2ChildsDivIcon);
        // CalenderMonthHead2ChildsDiv Ends
        CalenderMonthHead2Child.appendChild(CalenderMonthHead2ChildsDiv);

        var CalenderMonthHead2ChildSpan = document.createElement('span');
        //Set on Click Event on Arrow
        CalenderMonthHead2ChildSpan.innerHTML = '<i class="UT-ArrowRight"></i>';
        CalenderMonthHead2Child.appendChild(CalenderMonthHead2ChildSpan);

        CalenderMonthHead2.appendChild(CalenderMonthHead2Child);
        CalenderMonthHeadCont.appendChild(CalenderMonthHead2);


        var theme = {
            Head: CalenderRangeHead,
            Foot: CalenderRangeFoot,
            MonthBar: CalenderMonthHeadCont
        };

        return theme;

    }

    HighlightDate(Obj, event) {
        var SelectedStartDate = Obj.SelectedStartDate;
        var highlightDiv = document.querySelectorAll('[CelebrateDate]');
        var highLightClass = Obj.RangeSelectClass;
        var HoverDate = new Date(event.currentTarget.getAttribute('CelebrateDate'));
        if (Obj.CurrentSelectedInput != Obj.StartDateInput) {

            if (SelectedStartDate != "" && SelectedStartDate != null) {
                for (var i = 0; i < highlightDiv.length; i++) {
                    var date = new Date(highlightDiv[i].getAttribute('CelebrateDate'));
                    if (date >= SelectedStartDate && date <= HoverDate) {
                        if (!highlightDiv[i].classList.contains(highLightClass)) {
                            highlightDiv[i].classList.add(highLightClass);
                        }
                    }
                    else {
                        if (highlightDiv[i].classList.contains(highLightClass)) {
                            highlightDiv[i].classList.remove(highLightClass);
                        }
                    }
                }
            }
        }
    }

    MonthCalender(Obj) {
        // Outer Div
        const CalenderDiv = document.createElement("div");
        CalenderDiv.setAttribute('class', 'DyFx TtAnCr FxGw1 BxSwCrGy BrRs5 Pg3 FxDnCn');
        CalenderDiv.setAttribute('id', 'UTCalenderMonthDiv');

        // Creating the Calender Header with Icon and Current Month & YearInt
        // Main Head Div
        const CalenderHeadDiv = document.createElement('div');
        CalenderHeadDiv.setAttribute('class', 'DyFx FxAnIsCr FxJyCtSeAd Wh100p Mn2 Ht40 FtWt600');
        CalenderDiv.appendChild(CalenderHeadDiv);

        // Main Heading Month
        const CalenderIconMonthDiv = document.createElement('div');
        CalenderHeadDiv.appendChild(CalenderIconMonthDiv);
        CalenderIconMonthDiv.innerHTML = '<i class="UT-MonthNumberLine FtSe18"></i>' + ' &nbsp; ' + ' Months'

        // Main Heading Year
        const CalenderCurrentYear = document.createElement('div');
        CalenderCurrentYear.setAttribute('class', "CrurPr");
        CalenderCurrentYear.addEventListener('click', () => this.YearCalender(Obj));

        // Checking Leap Year
        const YearInt = Obj.StartYear;
        if (new Date(YearInt, 1, 29).getDate() === 29) {
            CalenderCurrentYear.innerHTML = YearInt + '&nbsp' + 'L' + '&nbsp' + '<i class="UT-CursorHandLine"></i>';
        }
        else {
            CalenderCurrentYear.innerHTML = YearInt + '&nbsp' + '<i class="UT-CursorHandLine"></i>';
        }
        CalenderHeadDiv.appendChild(CalenderCurrentYear);

        //Add Months
        let MonthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let r = 0; r < 3; r++) {

            const CalenderMonthDiv = document.createElement('div');
            CalenderMonthDiv.setAttribute('class', 'DyFx FxDnRw FxAnIsCr JyCtCr Wh100P');
            CalenderDiv.appendChild(CalenderMonthDiv);

            for (let c = 0; c < 4; c++) {
                const MonthInitials = document.createElement('div');
                MonthInitials.setAttribute('class', 'Wh100pD4 DyTeCl Pg10 Br1 CrBrGy90Lt HrCrBdTe  CrurPr FtWt600');

                // 0 to 11 month names [(r*4) + c]
                // current month
                if (MonthName[(r * 4) + c] == new Date().toLocaleString('en-US', { month: 'short' })) {
                    MonthInitials.classList.add("CrBdTe50Lt");
                }

                MonthInitials.innerHTML = MonthName[(r * 4) + c];

                // creating deep copy so  we can pass particular obj to DateCalender without overriding it
                const newObj = JSON.parse(JSON.stringify(Obj));
                newObj.StartMonth = ((r * 4) + c);
                newObj.CallBackFunc = Obj.CallBackFunc;

                // Showing Date Calender
                MonthInitials.addEventListener('click', () => MonthClicked(newObj.StartMonth, newObj.CallBackFunc));

                CalenderMonthDiv.appendChild(MonthInitials);
            }
        }

        const MonthClicked = (StartMonth, CallBackFunc) => {
            Obj.StartMonth = StartMonth;
            Obj.CallBackFunc = CallBackFunc;
            this.DateCalender(Obj, true);
        }

        // if id exist then store it for futher usage
        if (Obj && Obj.Event && Obj.Event.target) Obj.CurrentSelectedInput = Obj.Event.target.id;

        Obj.CreatedCalender = CalenderDiv;
        Obj.PostionCalender = Obj.CurrentSelectedInput;
        this.AddCalender(Obj);
    }

    YearCalender(Obj) {

        const CalenderDiv = document.createElement("div");
        CalenderDiv.setAttribute('class', 'DyFx TtAnCr FxGw1 BxSwCrGy BrRs5 Pg3 FxDnCn');
        CalenderDiv.setAttribute('id', 'UTCalenderYearDiv');

        //Creating the Calender Header with Icon and Current Month & YearInt
        //Main Head Div
        let CalenderHeadDiv = document.createElement('div');
        CalenderHeadDiv.setAttribute('class', 'DyFx FxAnIsCr FxJyCtSeBn Wh100p Mn2 Ht40 FtWt600');
        CalenderDiv.appendChild(CalenderHeadDiv);

        //Main Head child Add - Go to previous year by 25 50 75
        let YearInt = Obj.StartYear;

        let CalenderIconDownYearDiv = document.createElement('div');
        CalenderIconDownYearDiv.setAttribute('class', 'DyFx FxDnRw Gp2 Wh50P');
        CalenderHeadDiv.appendChild(CalenderIconDownYearDiv);

        let YearJumpDn3 = document.createElement('div');
        const ObjJumpDn3 = JSON.parse(JSON.stringify(Obj));
        ObjJumpDn3.StartYear = parseInt(YearInt - 25);
        YearJumpDn3.addEventListener('click', () => this.YearCalender(ObjJumpDn3));
        YearJumpDn3.setAttribute('class', "CrurPr");
        CalenderIconDownYearDiv.appendChild(YearJumpDn3);
        YearJumpDn3.innerHTML = '<i class="CT-ArrowUpOneLineSolid FtSe15"></i>';

        let YearJumpDn2 = document.createElement('div');
        const ObjJumpDn2 = JSON.parse(JSON.stringify(Obj));
        ObjJumpDn2.StartYear = parseInt(YearInt - 50);
        YearJumpDn2.addEventListener('click', () => this.YearCalender(ObjJumpDn2));
        YearJumpDn2.setAttribute('class', "CrurPr");
        CalenderIconDownYearDiv.appendChild(YearJumpDn2);
        YearJumpDn2.innerHTML = '<i class="CT-ArrowUpTwoLineSolid FtSe15"></i>';

        let YearJumpDn1 = document.createElement('div');
        const ObjJumpDn1 = JSON.parse(JSON.stringify(Obj));
        ObjJumpDn1.StartYear = parseInt(YearInt - 75);
        YearJumpDn1.addEventListener('click', () => this.YearCalender(ObjJumpDn1));
        YearJumpDn1.setAttribute('class', "CrurPr");
        CalenderIconDownYearDiv.appendChild(YearJumpDn1);
        YearJumpDn1.innerHTML = '<i class="CT-ArrowUpThreeLineSolid FtSe15"></i>';

        // Year Heading
        const CalenderYears = document.createElement('div');
        CalenderYears.innerHTML = 'Years';
        CalenderHeadDiv.appendChild(CalenderYears);

        // //Main Head child Add - Go to next year by 25 50 75
        let CalenderIconYearDiv = document.createElement('div');
        CalenderIconYearDiv.setAttribute('class', 'DyFx FxDnRw Gp2 Wh50P');
        CalenderHeadDiv.appendChild(CalenderIconYearDiv);

        let YearJump3 = document.createElement('div');

        const ObjJump3 = JSON.parse(JSON.stringify(Obj));
        ObjJump3.StartYear = parseInt(YearInt + 75);
        YearJump3.addEventListener('click', () =>  this.YearCalender(ObjJump3));
        YearJump3.setAttribute('class', "CrurPr");
        CalenderIconYearDiv.appendChild(YearJump3);
        YearJump3.innerHTML = '<i class="CT-ArrowDownThreeLineSolid FtSe15"></i>';

        let YearJump2 = document.createElement('div');
        const ObjJump2 = JSON.parse(JSON.stringify(Obj));
        ObjJump2.StartYear = parseInt(YearInt + 50);
        YearJump2.addEventListener('click', () => this.YearCalender(ObjJump2));
        YearJump2.setAttribute('class', "CrurPr");
        CalenderIconYearDiv.appendChild(YearJump2);
        YearJump2.innerHTML = '<i class="CT-ArrowDownTwoLineSolid FtSe15"></i>';

        let YearJump1 = document.createElement('div');
        const ObjJump1 = JSON.parse(JSON.stringify(Obj));
        ObjJump1.StartYear = parseInt(YearInt + 25);
        YearJump1.addEventListener('click', () => this.YearCalender(ObjJump1));
        YearJump1.setAttribute('class', "CrurPr");
        CalenderIconYearDiv.appendChild(YearJump1);
        YearJump1.innerHTML = '<i class="CT-ArrowDownOneLineSolid FtSe15"></i>';


        // Creating Year Table
        for (let r = 0; r < 5; r++) {
            const CalenderYearRowDiv = document.createElement('div');
            CalenderYearRowDiv.setAttribute('class', 'DyFx FxDnRw FxAnIsCr JyCtCr Wh100P');
            CalenderDiv.appendChild(CalenderYearRowDiv);

            for (let c = 0; c < 5; c++) {
                // year index = (r*5 + c) -> year x to x+25
                let yearUd = YearInt + ((r * 5) + c);
                const YearInit = document.createElement('div');
                YearInit.setAttribute('class', 'Wh100pD5 DyTeCl Pg10 Br1 CrBrGy90Lt HrCrBdTe  CrurPr FtWt600');
                YearInit.innerHTML = yearUd;
                if (yearUd == new Date().getFullYear()) {
                    YearInit.classList.add('CrBdTe50Lt');
                }

                let passYear = parseInt(YearInt + ((r * 5) + c));
                const newObj = JSON.parse(JSON.stringify(Obj));
                newObj.StartYear = passYear;
                newObj.CallBackFunc = Obj.CallBackFunc;
                YearInit.addEventListener('click', () => YearClicked(newObj.StartYear, newObj.CallBackFunc));
                CalenderYearRowDiv.appendChild(YearInit);
            }
        }
        // if id exists then save it for further usage
        if (Obj && Obj.Event && Obj.Event.target) Obj.CurrentSelectedInput = Obj.Event.target.id;

        const YearClicked = (Year, CallBackFunc) => {
            Obj.StartYear = Year;
            Obj.CallBackFunc = CallBackFunc;
            this.MonthCalender(Obj);
        }

        Obj.CreatedCalender = CalenderDiv;
        Obj.PostionCalender = Obj.CurrentSelectedInput;
        this.AddCalender(Obj);
    }

    //Adds Calendar To UI
    AddCalender(Obj) {

        let { CreatedCalender: Calendar, CurrentSelectedInput: CurrentInput } = Obj;

        if (Obj.PostionCalender) {
            CurrentInput = Obj.PostionCalender;
        }

        const currentInputElement = document.getElementById(CurrentInput);
        currentInputElement.classList.add('PnRe');

        // Removing the Previous Created Calendar
        this.CloseCalender(Obj);

        //Create Div To Push Calendar
        const displayCalenderDiv = document.createElement('div');

        Object.assign(displayCalenderDiv.style, {
            backgroundColor: 'rgb(246 243 243 / 0.98)',
            top: '-500px' // out of viewport: it is hidden
        });

        displayCalenderDiv.appendChild(Calendar);

        //Append in the body 
        document.body.appendChild(displayCalenderDiv);

        // Get Position of calendar - open where we have enough space
        Object.assign(displayCalenderDiv, {
            className: `PnAe BrRs5 ${Obj.ZIndex}`,
            id: `${CurrentInput}UT`
        });

        this.getCalendarAbsolutePosition(CurrentInput, currentInputElement);

        //if (Obj.FixedCalendar) {

        //    Object.assign(displayCalenderDiv, {
        //        className: 'PnFd BrRs5 ZIx1000000',
        //        id: `${CurrentInput}UT`
        //    });

        //    if (Obj.FixedCalendar.Position) {
        //        position = Obj.FixedCalendar.Position;
        //    } else {
        //        this.getCalendarFixedPosition(CurrentInput, currentInputElement, Obj.FixedCalendar);
        //    }
        //} else {

        //    Object.assign(displayCalenderDiv, {
        //        className: 'PnAe BrRs5 ZIx1000000',
        //        id: `${CurrentInput}UT`
        //    });

        //    this.getCalendarAbsolutePosition(CurrentInput, currentInputElement);
        //}

        //When click on body remove the calendar 
        document.getElementsByTagName('body')[0].addEventListener('mouseup', (event) => {
            this.RemoveCalendarCheck(event, CurrentInput);
        });

    }

    getCalendarAbsolutePosition(inputElementId, inputElement) {
        const calendarElement = document.getElementById(inputElementId + 'UT');

        const updatePosition = () => {
            // Make sure elements exist
            if (!inputElement || !calendarElement) {
                return;
            }

            // Get input element's position and dimensions
            const inputRect = inputElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const scrollTop = window.scrollY;
            const scrollLeft = window.scrollX;

            // Get calendar dimensions
            const calendarHeight = calendarElement.clientHeight;
            const calendarWidth = calendarElement.clientWidth;

            // Set initial position to make the calendar visible for height calculation
            calendarElement.style.display = 'block';

            // Calculate available space
            const spaceBelow = viewportHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const spaceRight = viewportWidth - inputRect.left;
            const offset = 5; // Reduced offset for closer positioning

            // Clear all positions first to avoid conflicts
            calendarElement.style.top = 'auto';
            calendarElement.style.bottom = 'auto';
            calendarElement.style.left = 'auto';
            calendarElement.style.right = 'auto';

            // Vertical positioning
            if (spaceBelow >= calendarHeight) {
                // Enough space below
                calendarElement.style.top = `${inputRect.bottom + scrollTop + offset}px`;
            } else if (spaceAbove >= calendarHeight) {
                // Enough space above
                calendarElement.style.top = `${inputRect.top + scrollTop - calendarElement.offsetHeight - offset}px`;
            } else {
                // Not enough space either way - place where there's more space
                if (spaceBelow >= spaceAbove) {
                    calendarElement.style.top = `${inputRect.bottom + scrollTop + offset}px`;
                } else {
                    calendarElement.style.top = `${inputRect.top + scrollTop - calendarElement.offsetHeight - offset}px`;
                }
            }

            // Horizontal positioning
            // Try to align with input field first
            if (inputRect.left + calendarWidth <= viewportWidth) {
                // Calendar fits when aligned with input left edge
                calendarElement.style.left = `${inputRect.left}px`;
            } else if (inputRect.right - calendarWidth >= 0) {
                // Calendar fits when aligned with input right edge
                calendarElement.style.left = `${inputRect.right - calendarWidth}px`;
            } else {
                // Center the calendar if it doesn't fit aligned with input
                const leftPosition = Math.max(0, Math.min(inputRect.left, viewportWidth - calendarWidth));
                calendarElement.style.left = `${leftPosition}px`;
            }
            this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
        };

        // Run once immediately and then on animation frame
        this.requestAnimationFrameId = requestAnimationFrame(updatePosition);

        // Optional: Add resize listener to handle window resize
        if (!this.resizeListener) {
            this.resizeListener = () => {
                if (this.requestAnimationFrameId) {
                    cancelAnimationFrame(this.requestAnimationFrameId);
                }
                this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
            };
            window.addEventListener('resize', this.resizeListener);
        }
    }

    //Not in Use 
    getCalendarFixedPosition(inputElementId, inputElement, FixedCalendarObj) {
        const calendarElement = document.getElementById(inputElementId + 'UT');

        // Initial positioning
        function updatePosition() {
            // Get input element's position and dimensions
            const inputRect = inputElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Get calendar dimensions
            const calendarHeight = calendarElement.clientHeight;
            const calendarWidth = calendarElement.clientWidth;

            // Calculate available space
            const spaceBelow = viewportHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const spaceLeft = viewportWidth - (viewportWidth - inputRect.right);

            // Calculate positions
            const positionBelow = inputRect.bottom;

            const offset = 5;

            // Determine best position
            if (spaceBelow >= calendarHeight) {
                // Enough space below
                calendarElement.style.top = `${positionBelow + offset}px`;
                calendarElement.style.bottom = 'auto';
            } else if (spaceAbove >= calendarHeight) {
                // Enough space above
                calendarElement.style.bottom = `auto`;
                calendarElement.style.top = `${inputRect.top - calendarHeight - offset}px`;
            } else {
                // Not enough space either way - place where there's more space
                if (spaceBelow >= spaceAbove) {
                    calendarElement.style.top = `${positionBelow + offset}px`;
                    calendarElement.style.bottom = 'auto';
                } else {
                    calendarElement.style.bottom = `auto`;
                    calendarElement.style.top = `${inputRect.top - calendarHeight - offset}px`;
                }
            }

            // Horizontal positioning
            let spaceRight = viewportWidth - inputRect.left;
            if (spaceLeft >= calendarWidth) {
                // Enough space left
                calendarElement.style.right = `${(viewportWidth - inputRect.right)}px`;
                calendarElement.style.left = `auto`;
            } else if (spaceRight >= calendarWidth) {
                //Enough space right
                calendarElement.style.right = `auto`;
                calendarElement.style.left = `${inputRect.left}px`;
            } else if (inputRect.left < (viewportWidth / 2)) {
                //input box in the left side: so start calendar from left side of the window 
                calendarElement.style.left = `5px`;
                calendarElement.style.right = `auto`;
            } else {
                //input box in the left side: so start calendar from right side of the window 
                calendarElement.style.left = `auto`;
                calendarElement.style.right = `5px`;
            }

        }

        // Update position on scroll
        function handleScroll() {
            requestAnimationFrame(updatePosition);
        }

        // Initial position update
        updatePosition();

        if (FixedCalendarObj.ScrollDivId) {
            let scrollDiv = document.getElementById(FixedCalendarObj.ScrollDivId);
            if (scrollDiv) {
                scrollDiv.addEventListener('scroll', handleScroll);
                // Return cleanup function
                return () => {
                    if (scrollDiv) {
                        scrollDiv.removeEventListener('scroll', handleScroll);
                    }
                }
            }
        } else {
            // Add scroll event listener
            window.addEventListener('scroll', handleScroll);

            // Return cleanup function
            return () => {
                window.removeEventListener('scroll', handleScroll);
            }
        }
    }

    //Closes all the Open Calender Div
    CloseCalender(Obj) {
        var SingleCalender = Obj.StartDateInput;
        var RangeCalender = Obj.RangeInput;

        // Removing the Previous Created Calender
        if (RangeCalender != null && RangeCalender != "") {
            var previousStartCalender = document.getElementById(RangeCalender.StartDateInput + "UT");
            if (previousStartCalender != null) {
                previousStartCalender.remove();
            }
            var previousEndCalender = document.getElementById(RangeCalender.EndDateInput + "UT");
            if (previousEndCalender != null) {
                previousEndCalender.remove();
            }

        }
        else if (SingleCalender != null && SingleCalender != "") {
            var previouscalender = document.getElementById(SingleCalender + "UT");
            if (previouscalender != null) {
                previouscalender.remove();
            }
        }

    }

    RemoveCalendarCheck(event, Id) {
        var calender = document.getElementById(Id + "UT");
        // Stop any existing animation frame to prevent multiple listeners
        if (this.requestAnimationFrameId) {
            cancelAnimationFrame(this.requestAnimationFrameId);
        }
        if (calender && !calender.contains(event.target)) {
            document.body.removeAttribute('onmouseup');
            calender.style.display = 'none';
            setTimeout(function () { calender.remove() }, 1000);
        }
    }

    ClearCalenderDates(Obj) {

        this.CloseCalender(Obj);

        var SingleCalender = Obj.StartDateInput;
        var RangeCalender = Obj.RangeInput;
        // Removing the Previous Created Calender
        if (RangeCalender != null && RangeCalender != "") {

            Obj.StartDate = null;
            Obj.EndDate = null;
            Obj.SelectedStartDate = null;
            Obj.SelectedEndDate = null;
            document.getElementById(RangeCalender.StartDateInput).value = null;
            document.getElementById(RangeCalender.EndDateInput).value = null;
            document.getElementById(RangeCalender.StartDateInput).click();

        }
        else if (SingleCalender != null && SingleCalender != "") {
            document.getElementById(SingleCalender).value = null;
            document.getElementById(SingleCalender).click();
        }
    }

    SelectStartOrEnd(Obj, Select) {
        var RangeCalender = Obj.RangeInput;
        // Removing the Previous Created Calender
        if (RangeCalender != null && RangeCalender != "") {
            if (Select == 'Start') {
                document.getElementById(RangeCalender.StartDateInput).click();
            }
            else {
                document.getElementById(RangeCalender.EndDateInput).click();
            }
        }
    }

    //Arrow Button On the Date Calender Uses This Function
    DateChangeUT(Year, Month, Obj) {
        var GetDate = new Date(Year, Month);
        Obj.StartYear = GetDate.getFullYear();
        Obj.StartMonth = GetDate.getMonth();
        Obj.DateArrowActive = 'Y';
        this.DateCalender(Obj, true);
    }

    //When we select the date in textbox or other it will hide the Calender after selecting
    DateSelect(YearInt, MonthInt, DateInt, Obj) {
        //Object Update with Current Date
        Obj.StartMonth = MonthInt;
        Obj.StartYear = YearInt;

        //Closes Calender On Date Selection
        var CurrentSelectedInput = Obj.CurrentSelectedInput;
        var CallBackFunc = Obj.CallBackFunc;
        var StartDateInput = Obj.StartDateInput;
        var RangeInput = Obj.RangeInput;
        var EndDateInput = Obj.EndDateInput;

        //Checking If Range Calender then Update Obj.SelectedStartDate = null; Obj.SelectedEndDate = null;for highlight;
        if (RangeInput) {
            if (RangeInput.StartDateInput == CurrentSelectedInput) {
                Obj.SelectedStartDate = new Date(YearInt, MonthInt, DateInt);
            }
            if (RangeInput.EndDateInput == CurrentSelectedInput) {
                Obj.SelectedEndDate = new Date(YearInt, MonthInt, DateInt);
            }
        }

        // Hide previously opened calender
        let previouscalender = document.getElementById(CurrentSelectedInput + "UT");
        if (previouscalender) {
            previouscalender.remove();
        }

        if (Obj.PositionCalender && CurrentSelectedInput == RangeInput.EndDateInput) {
            // Hide previously opened calender when position is set
            previouscalender = document.getElementById(Obj.PositionCalender.StartDateId + "UT");
            if (previouscalender) {
                previouscalender.remove();
            }
        }

        //End
        var selectedDate = new Date(YearInt, MonthInt, DateInt);
        var DatePickerElement = document.getElementById(CurrentSelectedInput);

        // Default Format
        var month = 'MMM';
        var year = 'YYYY';
        var format = 'D/MMM/YYYY';

        /// Check the Passed Format in the input
        var passedFormat = Obj.DateFormat;
        var passedMonth = passedFormat.match(/M/gi).length;
        switch (passedMonth) {
            case 1: month = 'M';
                break;
            case 2: month = 'MM';
                break;
            case 3: month = 'MMM';
                break;
        }

        var passedYear = passedFormat.match(/Y/gi).length;
        switch (passedYear) {
            case 2: year = 'YY';
                break;
            case 4: year = 'YYYY';
                break;
        }

        if (passedFormat) format = passedFormat;

        //In these variable we save the date to be put in textbox
        var returnDate;
        var returnMonth;
        var returnYear;

        //Ends
        switch (month) {
            case 'M':
                returnMonth = selectedDate.getMonth();
                break;
            case 'MM':
                returnMonth = selectedDate.toLocaleString('en-US', { month: 'short' });
                break;
            default:
                returnMonth = selectedDate.toLocaleString('en-US', { month: 'long' });
                break;
        }

        switch (year) {
            case "YY": returnYear = selectedDate.getFullYear().toString().slice(-2);
                break;
            default: returnYear = selectedDate.getFullYear();
                break;
        }

        switch (format) {
            case 'D-M-YYYY':
            case 'D-MM-YYYY':
            case 'D-MMM-YYYY':
            case 'D-M-YY':
            case 'D-MM-YY':
            case 'D-MMM-YY': returnDate = DateInt + '-' + returnMonth + '-' + returnYear;
                break;
            case 'M-D-YYYY':
            case 'MM-D-YYYY':
            case 'MMM-D-YYYY':
            case 'M-D-YY':
            case 'MM-D-YY':
            case 'MMM-D-YY': returnDate = returnMonth + '-' + DateInt + '-' + returnYear;
                break;
            case 'M-D-YYYY':
            case 'MM-D-YYYY':
            case 'MMM-D-YYYY':
            case 'M-D-YY':
            case 'MM-D-YY':
            case 'MMM-D-YY': returnDate = returnYear + '-' + returnMonth + '-' + DateInt;
                break;
            default: returnDate = returnYear + '-' + returnMonth + '-' + DateInt;
                break;
        }

        DatePickerElement.value = returnDate;

        // Remove the onmouseup event listener and hide the calendar if it exists
        document.body.removeAttribute('onmouseup');
        var ClickedCalender = document.getElementById(CurrentSelectedInput + "UT");
        if (ClickedCalender) {
            ClickedCalender.style.display = 'none';
            setTimeout(function () { ClickedCalender.remove() }, 1000);
        }

        // If Range Calender and Start date is selected then Fire Click Event on the EndDate Input
        if (RangeInput) {
            if (CurrentSelectedInput == StartDateInput) {

                if (EndDateInput) { // not single calendar
                    //Check If the Date Start Date>= EndDate then Empty End Date
                    var StartDate = new Date(document.getElementById(StartDateInput).value);
                    var EndDate = new Date(document.getElementById(EndDateInput).value);
                    if (StartDate >= EndDate) {
                        document.getElementById(EndDateInput).value = "";
                        Obj.SelectedEndDate = null;
                    }

                    if (Obj.InitialSelectDate) {
                        Obj.InitialSelectDate = false;
                    } else {
                        document.getElementById(EndDateInput).click();
                        Obj.CurrentSelectedInput = EndDateInput;
                    }
                }
            }
        }
        if (CallBackFunc) {
            CallBackFunc(returnDate);
        }
        if (
            StartDateInput &&
            Obj.SelectedStartDate instanceof Date &&
            !isNaN(Obj.SelectedStartDate.getTime())
        ) {
            document.getElementById(StartDateInput).dataset.selectedstartdate = Obj.SelectedStartDate.toISOString();
        }

        if (
            EndDateInput &&
            Obj.SelectedEndDate instanceof Date &&
            !isNaN(Obj.SelectedEndDate.getTime())
        ) {
            document.getElementById(EndDateInput).dataset.selectedenddate = Obj.SelectedEndDate.toISOString();
        }

    }
}

class Gallery {

    createSimpleGalleryItem(id, image) {
        let galleryContainer = document.getElementById(id);
        if (!galleryContainer) {
            return;
        }
        const item = document.createElement('div');
        item.classList.add('gallery-item');

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.title;

        const content = document.createElement('div');
        content.classList.add('content');

        const title = document.createElement('h3');
        title.textContent = image.title;

        const description = document.createElement('p');
        description.textContent = image.description;

        content.appendChild(title);
        content.appendChild(description);

        item.appendChild(img);
        galleryContainer.appendChild(item);
    }

    createMasonryGalleryItem(id, image) {
        let galleryContainer = document.getElementById(id);
        if (!galleryContainer) {
            return;
        }
        const item = document.createElement('div');
        item.classList.add('masonry-item');

        // Randomly assign a class to make some images taller
        if (Math.random() > 0.5) {
            item.classList.add('tall');
        }

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.title;

        item.appendChild(img);
        galleryContainer.appendChild(item);
    }

    createProductGalleryItem(image, isMain = false) {
        const item = document.createElement('div');
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.title;

        if (isMain) {
            item.classList.add('product-gallery-main');
        } else {
            item.classList.add('product-gallery-thumbnail');
        }

        item.appendChild(img);
        return item;
    }

    createLookbookGalleryItem(image, isMain = false) {
        const item = document.createElement('div');
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.title;

        if (isMain) {
            item.classList.add('lookbook-main');
        } else {
            item.classList.add('lookbook-thumbnail');
        }

        item.appendChild(img);
        return item;
    }

    loadGallery(id, images, type) {
        images.forEach((image) => {
            switch (type) {
                case 'simple':
                    this.createSimpleGalleryItem(id, image);
                    break;
                case 'masonry':
                    this.createMasonryGalleryItem(id, image);
                    break;
                //case 'lookbook':
                //    galleryContainer.appendChild(this.createMasonryGalleryItem(image));
                //    break;
                default:
                    break;
            }
        });

        switch (type) {
            case 'product':
                this.loadProductGallery(id, images);
                break;
            case 'lookbook':
                this.loadLookbookGallery(id, images);
                break;
            default:
                break;

        }
    }

    loadProductGallery(id, images) {
        const gallery = document.getElementById(id);

        // Add the main image (first image in the array)
        const mainImage = this.createProductGalleryItem(images[0], true);
        gallery.appendChild(mainImage);

        // Add a container for the thumbnails
        const thumbnailsContainer = document.createElement('div');
        thumbnailsContainer.classList.add('product-gallery-thumbnails');

        // Add the remaining images as thumbnails
        for (let i = 1; i < images.length; i++) {
            const thumbnail = this.createProductGalleryItem(images[i]);
            thumbnailsContainer.appendChild(thumbnail);
        }

        gallery.appendChild(thumbnailsContainer);
    }

    loadLookbookGallery(id, images) {
        const gallery = document.getElementById(id);

        // Add the main image (first image in the array)
        const mainImage = this.createLookbookGalleryItem(images[0], true);
        gallery.appendChild(mainImage);

        // Add a container for the thumbnails
        const thumbnailsContainer = document.createElement('div');
        thumbnailsContainer.classList.add('lookbook-thumbnails');

        // Add the remaining images as thumbnails
        for (let i = 1; i < images.length; i++) {
            const thumbnail = this.createLookbookGalleryItem(images[i]);
            thumbnailsContainer.appendChild(thumbnail);
        }

        gallery.appendChild(thumbnailsContainer);
    }

}

class ModalHelper {

    static createElement(obj) {
        if (!obj || !obj.element) {
            throw new Error("The 'element' property is required to create an element.");
        }

        const el = document.createElement(obj.element);

        for (const [key, value] of Object.entries(obj)) {
            switch (key) {
                case 'element':
                    break; // Skip as it was already used
                case 'class':
                    el.className = value; // Handle class property
                    break;
                case 'style':
                    el.style.cssText = value; // Apply styles as a string
                    break;
                case 'innerText':
                    el.innerText = value; // Handle innerText
                    break;
                case 'innerHTML':
                    el.innerHTML = value; // Handle innerHTML
                    break;
                default:
                    el.setAttribute(key, value); // Set all other attributes
                    break;
            }
        }

        return el;
    }



}

class Modal {
    _ModalHelper;
    constructor() {
        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.initModal();
            });
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.initModal();
                    }, 1);
                });
            });
        }
        this._ModalHelper = new ModalHelper();
        this.zIndexCount = 0;
    }

    initModal() {
        const modals = document.getElementsByClassName('ModalCT');

        Array.from(modals).forEach((modal) => {

            // initially hide modal
            modal.classList.add('DyNe');

            // init close btn
            this.handleCloseBtn(modal);

            modal.setAttribute('data-initialRender', true); // to check initial rendering !important to attach even listeners
            modal.setAttribute('data-timeout', null); // to prevent autoclose 
        })
    }

    initCustomModal({ customHTML }) {
        const fragment = document.createRange().createContextualFragment(customHTML);
        const modal = fragment.firstElementChild; // Get the first real element

        if (!modal) return; // Safety check

        // initially hide modal
        modal.classList.add('DyNe');

        // init close btn
        this.handleCloseBtn(modal);

        modal.setAttribute('data-initialRender', true); // to check initial rendering !important to attach even listeners
        modal.setAttribute('data-timeout', null); // to prevent autoclose 

        document.body.appendChild(modal);
    }

    showModal(obj) {

        let modal = document.getElementById(obj.id);

        if (!modal) {
            console.log('Modal not found!');
            return;
        }

        if (obj && obj.classes && obj.classes.ModalCT) {
            modal.setAttribute('class', obj.classes.ModalCT);
        } else {
            modal.setAttribute('class', 'slideDownFadeIn CrBdWe BrRs5 Wh95vw Sl:Wh70vw Mm:Wh40vw MnLtAo MnRtAo MnTp20');
        }

        //background and z index 
        obj.zIndex = obj.zIndex || 1000000000;
        obj.backgroundColor = obj.backgroundColor || 'rgba(0,0,0,0.6)';

        modal.classList.add('ModalCT');

        const initialRender = modal.getAttribute('data-initialRender') === 'true';
        if (initialRender) {
            // add the event listener only once
            this.handleSuccessFailBtn(obj, modal);
            modal.setAttribute('data-initialRender', false);

        }

        let bgContainerId = this.getRandomString();
        let backgroundBlackContainer = ModalHelper.createElement({
            element: 'div',
            id: bgContainerId,
            class: 'modalBgContainer PnFd PnTp0 PnLt0 Ht100vh Wh100vw OwXHn OwYAo',
            style: `background-color: ${obj.backgroundColor}; z-index: ${this.getBgZIndex(obj.zIndex)};`,
        });

        // Append the container to the body only once
        document.body.appendChild(backgroundBlackContainer);

        modal.dataset.bgContainerId = bgContainerId;

        modal.classList.remove('DyNe');

        backgroundBlackContainer.appendChild(modal);

        this.removeEmptyBgContainer();

        //clear timeout first
        const timeoutId = modal.dataset.timeout !== 'null' ? Number(modal.dataset.timeout) : null;

        if (timeoutId) {
            clearTimeout(timeoutId);
            modal.dataset.timeout = ''; // Reset dataset value
        }

        if (obj.autoClose > 0) {
            this.handleAutoClose(obj, modal);
        }

    }

    removeEmptyBgContainer() {
        let bgContainers = document.querySelectorAll('.modalBgContainer');
        bgContainers.forEach((bgContainer) => {
            if (bgContainer.innerText == '') {
                bgContainer.remove();
            }
        })
    }

    getBgZIndex(zIndex) {
        return zIndex + this.zIndexCount++;
    }

    getRandomString(length = 10) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    }

    handleCloseBtn(modal) {
        const closeBtns = modal.getElementsByClassName('CloseBtn');
        if (closeBtns.length > 0) {
            const closeBtn = closeBtns[0];
            closeBtn.addEventListener('click', () => {
                this.helperHandleCloseBtn(modal)
            });
        }
    }

    helperHandleCloseBtn(modal) {
        modal.classList.add('DyNe'); // Hide the modal
        let bgId = modal.dataset.bgContainerId;

        // Hide the background container
        const backgroundBlackContainer = document.getElementById(bgId)
        backgroundBlackContainer.classList.add('DyNe');
    }

    handleSuccessFailBtn(obj, modal) {
        const successBtn = modal.getElementsByClassName('ModalSuccessBtn');
        const failBtn = modal.getElementsByClassName('ModalFailBtn');

        if (successBtn.length > 0) {
            successBtn[0].addEventListener('click', () => {
                this.helperHandleSuccessFailBtn('success', obj, modal);
            })
        }
        if (failBtn.length > 0) {
            failBtn[0].addEventListener('click', () => {
                this.helperHandleSuccessFailBtn('fail', obj, modal);
            })
        }
    }

    helperHandleSuccessFailBtn(type, obj, modal) {
        switch (type) {
            case 'success':
                if (obj && obj.onSuccess) {
                    obj.onSuccess();
                }
                this.helperHandleCloseBtn(modal);
                break;
            case 'fail':
                if (obj && obj.onSuccess) {
                    obj.onFail();
                }
                this.helperHandleCloseBtn(modal);
                break;
            default:
                break;
        }
    }

    handleAutoClose(obj, modal) {
        modal.dataset.timeout = setTimeout(() => {
            this.helperHandleCloseBtn(modal)
        }, obj.autoClose);
    }

    closeModalById({ id }) {
        const modal = document.getElementById(id);
        if (!modal) {
            console.log('Modal not found!');
            return;
        }
        this.helperHandleCloseBtn(modal);
    }

}

class MultiSelect {

    constructor(options) {
        this.container = options.containerId;
        this.data = options.data || [];
        this.displayValue = options.displayValue || 'key';
        this.selectedValues = options.selectedValues || [];
        this.isObject = typeof options.data?.[0] !== 'string';
        this.showCheckbox = options.showCheckbox || false;
        this.groupBy = options.groupBy;
        this.selectionLimit = options.selectionLimit;
        this.placeholder = options.placeholder || 'Select options';
        this.closeIcon = options.closeIcon || '×';
        this.disableValues = options.disableValues || [];
        this.customStyle = options.customStyle;
        this.closeWhenSelected = options.closeWhenSelected || false;
        this.dropDownHeight = options.dropDownHeight || '200px';
        this.storedData = [];
        this.cb = options.cb || (() => { }); // Default callback function if not provided

        // Default Styles
        const defaultStyles = {
            optionFontSize: '10px',
            optionFontWeight: '500',
            optionColor: '#000000',
            optionBorder: 'none',
            optionBackground: '#FFFFFF',
            optionPadding: '10px',
            optionHoverBackground: '#F0F0F0',
            optionHoverColor: '#000000',
            chipBorder: '1px solid #000000',
            chipColor: '#000000',
            chipBackgroundColor: '#CCCCCC',
        };

        // Merge user-provided styles with defaults
        this.customCss = { ...defaultStyles, ...(options.customCss || {}) };

        this.init();
    }

    init() {
        const container = document.querySelector(`#${this.container}`);
        if (!container) {
            console.error(`Element with id ${this.container} not found`);
            return;
        }

        const input = container.querySelector('input');

        if (!input) {
            console.error(`Input element not found in container ${this.container}`);
            return;
        }

        container.classList.add('PnRe', 'Wh100p');

        const dropdown = document.createElement('div');
        dropdown.classList.add('multiselect-dropdown', 'DyNe', 'PnAe', "PnTp100p", 'PnLt0', 'Wh100p', 'OwYAo', 'Br1', 'CrBrGy80Lt', 'CrBdWe', "ZIx1000");
        input.parentNode.appendChild(dropdown);
        let chipsContainer = this.createChipsContainer(container);
        input.parentNode.appendChild(chipsContainer)
        dropdown.style.maxHeight = this.dropDownHeight;

        input.placeholder = this.placeholder;
        input.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent body click from closing immediately
            this.toggleDropdown();
        });

        this.renderDropdown(dropdown);

        document.body.addEventListener('click', (event) => {
            if (!container.contains(event.target)) {
                dropdown.style.display = 'none';
                dropdown.classList.remove('show');
            }
        });

        // when user select or unselect items then return the stored data
        requestIdleCallback(() => {
            this.initGetData();
        })
    }

    renderDropdown(dropdown) {
        let groupedData = this.groupBy ? this.groupDataByCategory() : null;
        dropdown.innerHTML = '';

        if (groupedData) {
            Object.keys(groupedData).forEach(category => {
                const groupElement = document.createElement('div');
                groupElement.classList.add('multiselect-group');
                groupElement.textContent = category;
                dropdown.appendChild(groupElement);

                groupedData[category].forEach(item => this.createOption(dropdown, item));
            });
        } else {
            this.data.forEach(item => this.createOption(dropdown, item));
        }
    }

    createOption(dropdown, item) {
        const option = document.createElement('div');
        option.classList.add('CrurPr', 'DyFx', 'FxJyCtSeBn', 'multiselect-option');
        option.style.transition = 'all 0.3s ease-in-out';

        option.style.backgroundColor = this.customCss.optionBackground;
        option.style.color = this.customCss.optionColor;
        option.style.border = this.customCss.optionBorder;
        option.style.padding = this.customCss.optionPadding;
        option.style.fontWeight = this.customCss.optionFontWeight;
        option.style.fontSize = this.customCss.optionFontSize;

        const displayText = this.isObject ? item[this.displayValue] : item;

        if (this.showCheckbox) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            option.appendChild(checkbox);
        }

        const label = document.createElement('span');
        label.textContent = displayText;
        option.appendChild(label);

        // Check if item is preselected
        const isPreselected = this.selectedValues.some(
            selected => this.isObject
                ? selected[this.displayValue] === item[this.displayValue]
                : selected === item
        );

        if (isPreselected) {
            setTimeout(() => {
                this.selectOption(option, item)
            }, 100)
        }

        if (this.disableValues.length > 0) {
            // Check if the current item is in the disabled list
            const isDisabled = this.disableValues.some(disabledItem => {
                // Compare objects by display value or simple values directly
                if (this.isObject) {
                    return disabledItem[this.displayValue] === item[this.displayValue];
                } else {
                    return disabledItem === item;
                }
            });
            // Add 'disabled' class if item should be disabled
            if (isDisabled) {
                option.classList.add('disabled', 'CrurNtAd', 'Oy50p');
            }
        }

        dropdown.appendChild(option);

        option.addEventListener('click', () => this.selectOption(option, item));

        // Add Hover Effect
        const originalBg = getComputedStyle(option).backgroundColor; // Store original background color
        const originalColor = getComputedStyle(option).color; // Store original color

        option.addEventListener('mouseover', () => {
            if (this.customCss && this.customCss.optionHoverBackground) {
                option.style.backgroundColor = this.customCss.optionHoverBackground;
            } else {
                option.style.backgroundColor = '#f0f0f0';
            }
            if (this.customCss && this.customCss.optionHoverColor) {
                option.style.color = this.customCss.optionHoverColor;
            } else {
                option.style.color = '#000000';
            }
        });

        option.addEventListener('mouseout', () => {
            if (this.customCss && this.customCss.optionHoverColor) {
                option.style.color = originalColor;
            } else {
                option.style.color = '';
            }
            if (this.customCss && this.customCss.optionHoverBackground) {
                option.style.backgroundColor = originalBg;
            } else {
                option.style.backgroundColor = '';
            }
        });

    }

    selectOption(option, item) {
        if (option.classList.contains('disabled')) return;

        const container = document.querySelector(`#${this.container}`);
        const input = container.querySelector('input');
        const dropdown = container.querySelector('.multiselect-dropdown');
        const chipsContainer = container.querySelector('.multiselect-chips');

        const isSelected = option.classList.toggle('selected');

        if (isSelected) {
            option.style.opacity = '0.5';
            // put data into storedData
            this.storedData.push(item);
        } else {
            option.style.opacity = '';
            // remove data from storedData
            this.storedData = this.storedData.filter(data => data[this.displayValue] !== item[this.displayValue]);
        }

        if (this.showCheckbox) {
            const checkbox = option.querySelector('input');
            checkbox.checked = isSelected;
        }

        // Selection limit handling
        const selectedOptions = dropdown.querySelectorAll('.selected');
        if (this.selectionLimit && selectedOptions.length > this.selectionLimit) {
            option.classList.remove('selected');
            return;
        }

        this.updateChips(chipsContainer, item);

        if (this.closeWhenSelected) {
            this.toggleDropdown();
        }
    }

    createChipsContainer(container) {
        const chipsContainer = document.createElement('div');
        chipsContainer.classList.add('multiselect-chips');
        container.querySelector('.multiselect-input').appendChild(chipsContainer);
        return chipsContainer;
    }

    updateChips(chipsContainer, item) {
        const container = document.querySelector(`#${this.container}`);
        const dropdown = container.querySelector('.multiselect-dropdown');
        const selectedOptions = dropdown.querySelectorAll('.selected');

        // Clear existing chips
        chipsContainer.innerHTML = '';

        selectedOptions.forEach(option => {
            const chipText = option.querySelector('span').textContent;
            const chip = document.createElement('div');
            chip.classList.add(...'CrBdGy80Lt Pg5 BrRs3 DyFx AnIsCr CrurPr'.split(' '));

            if (chip && this.customCss?.chipColor) {
                chip.style.color = this.customCss.chipColor;
            }
            if (chip && this.customCss?.chipBackgroundColor) {
                chip.style.backgroundColor = this.customCss.chipBackgroundColor;
            }

            const chipLabel = document.createElement('span');
            chipLabel.textContent = chipText;

            const closeIcon = document.createElement('span');
            closeIcon.textContent = this.closeIcon;
            closeIcon.classList.add('close-icon');
            closeIcon.addEventListener('click', (e) => {
                /* if chips exist means remove the option - we can simply click on the option */
                option.click();
            });

            chip.appendChild(chipLabel);
            chip.appendChild(closeIcon);
            chipsContainer.appendChild(chip);
        });
    }

    toggleDropdown() {
        const container = document.querySelector(`#${this.container}`);
        const dropdown = container.querySelector('.multiselect-dropdown');
        const show = dropdown.classList.toggle('show');
        if (show) {
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    }

    groupDataByCategory() {
        return this.data.reduce((groups, item) => {
            const category = item[this.groupBy];
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});
    }

    enableOption(obj) {
        let container = document.querySelector(`#${obj.containerId}`);
        let dropdown = container.querySelector('.multiselect-dropdown');
        let options = dropdown.querySelectorAll('.multiselect-option');
        options.forEach(option => {
            let item = this.isObject ? this.data.find(data => data[this.displayValue] === option.querySelector('span').textContent) : option.querySelector('span').textContent;
            let isDisabled = obj.enableValues.some(
                enabled => this.isObject
                    ? enabled[this.displayValue] === item[this.displayValue]
                    : enabled === item
            );
            if (isDisabled) {
                option.classList.remove('disabled');
            }
        })
    }

    // add functionality to get data when user select any option it can we item or object
    initGetData() {
        let container = document.querySelector(`#${this.container}`);
        let dropdown = container.querySelector('.multiselect-dropdown');
        let options = dropdown.querySelectorAll('.multiselect-option');
        // let chipsContainer = container.querySelector('.multiselect-chips');
        options.forEach(option => {
            option.addEventListener('click', () => {
                return this.cb(this.storedData);
            })
        })
    }

}

class TableHelper {

    static sortData(data, order, label) {
        data.sort((a, b) => {
            if (order === 'asc') {
                return a[label] > b[label] ? 1 : -1;
            } else {
                return a[label] < b[label] ? 1 : -1;
            }
        });
    }

    static createDropDown({ th }) {
        let dropdown = document.createElement('div');
        dropdown.classList.add('filter-dropdown');
        dropdown.style.position = 'fixed';
        dropdown.style.display = 'flex';
        dropdown.style.flexDirection = 'column';
        dropdown.style.alignItems = 'flex-start';
        dropdown.style.backgroundColor = 'white';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.borderRadius = '5px';
        dropdown.style.maxHeight = '200px';
        dropdown.style.padding = '5px';
        dropdown.style.zIndex = '1000000';

        let animationFrameId;

        const setPositionFixed = () => {
            let thRect = th.getBoundingClientRect();
            // For position:fixed elements, use position relative to viewport only
            // Don't add window.scrollY or window.scrollX
            let top = thRect.bottom;
            let left = thRect.left;

            // Make sure the dropdown doesn't go below the bottom of the viewport
            const windowHeight = window.innerHeight;
            const dropdownHeight = dropdown.offsetHeight;
            if (top + dropdownHeight > windowHeight) {
                // If it would go below, position it above the element instead
                top = thRect.top - dropdownHeight;
            }

            dropdown.style.top = `${top}px`;

            // Check if dropdown would go off screen on the right
            const windowWidth = window.innerWidth;
            const dropdownWidth = dropdown.offsetWidth;

            if (left + dropdownWidth > windowWidth) {
                // If it goes off the right edge, align with right edge of window
                dropdown.style.left = `${windowWidth - dropdownWidth - 5}px`;
            } else if (left < 0) {
                // If it goes off the left edge, align with left edge of window
                dropdown.style.left = '5px';
            } else {
                // Otherwise, position normally
                dropdown.style.left = `${left}px`;
            }

            animationFrameId = requestAnimationFrame(setPositionFixed);
        };

        // not in use [just for fallback]
        const setPositionAbsolute = () => {
            let thRect = th.getBoundingClientRect();
            let top = thRect.bottom + window.scrollY;
            let left = thRect.left + window.scrollX;

            dropdown.style.top = `${top}px`;

            // Check if dropdown would go off screen on the right
            const windowWidth = window.innerWidth;
            const dropdownWidth = dropdown.offsetWidth;

            if (left + dropdownWidth > windowWidth) {
                // If it goes off the right edge, align with right edge of window
                dropdown.style.left = `${windowWidth - dropdownWidth - 5}px`;
            } else if (left < 0) {
                // If it goes off the left edge, align with left edge of window
                dropdown.style.left = '5px';
            } else {
                // Otherwise, position normally
                dropdown.style.left = `${left}px`;
            }

            animationFrameId = requestAnimationFrame(setPositionAbsolute);
        };

        animationFrameId = requestAnimationFrame(setPositionFixed);

        return {
            dropdown,
            stopPositioning: () => cancelAnimationFrame(animationFrameId)
        };
    }

    static getDropdownOkCloseButton() {
        // Buttons container
        let buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.width = '100%';
        buttonsContainer.style.justifyContent = 'space-between';
        buttonsContainer.style.marginTop = '10px';
        buttonsContainer.style.gap = '10px';

        // OK Button
        let okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.backgroundColor = '#4CAF50';
        okButton.style.color = 'white';
        okButton.style.border = 'none';
        okButton.style.padding = '5px 10px';

        // Cancel Button
        let cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.backgroundColor = '#f44336';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.padding = '5px 10px';

        return { buttonsContainer, okButton, cancelButton };
    }

    static createSelectAllCheckbox({ label, uniqueValues, currentValues }) {
        // Create "Select All" checkbox at the top
        let selectAllWrapper = document.createElement('div');
        selectAllWrapper.style.marginBottom = '10px';
        selectAllWrapper.style.borderBottom = '1px solid #ddd';
        selectAllWrapper.style.paddingBottom = '5px';

        let selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = `filter-${label}-selectAll`;
        // Check if all values are already selected
        let allSelected = uniqueValues.every(value => currentValues.includes(value));
        selectAllCheckbox.checked = allSelected;

        let selectAllLabel = document.createElement('label');
        selectAllLabel.htmlFor = selectAllCheckbox.id;
        selectAllLabel.textContent = 'Select All';
        selectAllLabel.style.marginLeft = '5px';
        selectAllLabel.style.fontWeight = 'bold';

        selectAllWrapper.appendChild(selectAllCheckbox);
        selectAllWrapper.appendChild(selectAllLabel);
        return {
            selectAllWrapper, selectAllCheckbox
        };
    }
}

class Table {

    constructor() {
        this.requestAnimationFrameId = null;
    }

    //Below Code 1: we need to generate the table using js, no html of thead or tbody is provided 
    createTable(obj) {
        const { tableId, data, heading, headerBackground, headerColor, headerContainerMinWidth } = obj;

        let table = document.getElementById(tableId);

        if (!table) {
            console.log('Table not found');
            return;
        }

        this.createTableHeader({ tableId, heading, headerBackground, headerColor, headerContainerMinWidth });

        this.initInputBox({ tableId, data });

        this.initSortButton({ tableId, data });

        this.generateBody({ tableId, data });
    }

    createTableHeader(obj) {
        let { tableId, heading, headerBackground, headerColor, headerContainerMinWidth } = obj;
        let table = document.getElementById(tableId);

        let thead = table.querySelector('thead');
        if (!thead) {
            thead = document.createElement('thead');
            thead.setAttribute('class', 'PnSy PnTp0 ZIx100 WeSeNoWp');
            thead.style.background = headerBackground;
            thead.style.color = headerColor;
        }
        thead.innerHTML = '';
        let tr = document.createElement('tr');
        tr.classList.add('Br1', 'CrBrGy80Lt', 'VlAnTp');

        heading.forEach((h) => {

            let th = document.createElement('th');
            th.style.minWidth = headerContainerMinWidth || '30vw';
            th.innerHTML = `<div class="Pg10 TtAnLt FtWt600 DyFx FxDnCn FxJyCtFxEd" >
                                    <div class="DyFx FxJyCtSeBn Pg5 FxAnIsCr" >
                                        <span class="headerTitle">${h.label}</span>
    ${h.sortButton ? `<svg class= "sortButton CrurPr" xmlns = "http://www.w3.org/2000/svg" viewBox = "0 0 320 512" height = "15" width = "15" data-label="${h.label}"> <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z" /></svg>` : ''}
                                    </div>
                        ${h.searchBox ? `<input class= "inputBox TtBx" type = "${h.type}" placeholder = "Search by ${h.label}" data-label="${h.label}" /> ` : `<div></div>`}
            </div>`;
            tr.appendChild(th);

        });

        thead.appendChild(tr)
        table.appendChild(thead);

        table.style.width = table.clientWidth + 'px';
    }

    initSortButton(obj) {
        let { tableId, data } = obj;
        let table = document.getElementById(tableId);
        let sortButtons = table.querySelectorAll('.sortButton');

        sortButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                let currentTarget = e.currentTarget;
                let label = currentTarget.getAttribute('data-label');
                let order = currentTarget.getAttribute('data-order');
                if (!order) {
                    order = 'asc';
                    currentTarget.setAttribute('data-order', 'desc');
                } else if (order == 'desc') {
                    currentTarget.setAttribute('data-order', 'asc');
                } else {
                    currentTarget.setAttribute('data-order', 'desc');
                }
                this.sortData({ tableId, label, order, data });
            });
        });
    }

    initInputBox(obj) {
        let { tableId, data } = obj;
        let table = document.getElementById(tableId);
        let inputBoxes = table.querySelectorAll('.inputBox');

        inputBoxes.forEach((input) => {
            input.addEventListener('input', (e) => {
                let currentTarget = e.currentTarget;
                let label = currentTarget.getAttribute('data-label')?.toLowerCase();
                let value = currentTarget.value;
                let filteredData = data.filter((item) => {
                    let itemValue = item[label];
                    itemValue = itemValue.toString().toLowerCase();
                    return itemValue.includes(value.toLowerCase());
                });
                this.generateBody({ tableId, data: filteredData });
            });
        });
    }

    sortData(obj) {
        let { tableId, label, order, data } = obj;

        label = label.toLowerCase();
        if (!data || !label) {
            console.log('Data or Label is missing');
            return;
        }

        //data: send by ref so no need to return
        TableHelper.sortData(data, order, label);
        this.generateBody({ tableId, data });
    }

    generateBody(obj) {
        let { tableId, data } = obj;
        let table = document.getElementById(tableId);

        // Make sure the table has the correct display style
        table.style.display = 'block';

        // Find or create tbody
        let tbody = table.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
        }

        tbody.innerHTML = '';

        data.forEach((item) => {
            let tr = document.createElement('tr');

            Object.entries(item).forEach(([key, value], index) => {

                if (index == 0) {
                    tr.innerHTML = `<td class="FtWt600 Pg10">${value}</td>`;
                } else {
                    tr.innerHTML += `<td class="Pg10">${value}</td>`;
                }
            })

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
    }

    //Below Code 2 Start: Html of a table is provided by the user and we just add functionality like: sort, search
    initDatatable(obj) {
        const { tableId } = obj;
        let table = document.getElementById(tableId);
        if (!table) {
            console.log('table has not been defined or Id is wrong');
            return;
        }

        this.initInputBoxDatatable({ tableId });

        this.initSortButtonDatatable({ tableId });

        this.initFilterButtonDatatable({ tableId });

    }

    initSortButtonDatatable(obj) {
        let { tableId } = obj;
        let table = document.getElementById(tableId);
        let theadThs = table.querySelectorAll('thead th');
        let data = this.scrapeDataFromTable({ tableId });

        theadThs.forEach((theadTh) => {
            let sortButton = theadTh.querySelector('.sortButton');
            let label = theadTh.getAttribute('data-label');
            sortButton?.addEventListener('click', (e) => {
                let currentTarget = e.currentTarget;
                let order = currentTarget.getAttribute('data-order');
                if (!order) {
                    order = 'asc';
                    currentTarget.setAttribute('data-order', 'desc');
                } else if (order == 'desc') {
                    currentTarget.setAttribute('data-order', 'asc');
                } else {
                    currentTarget.setAttribute('data-order', 'desc');
                }

                this.sortDataDatatable({ tableId, label, order, data });
            });
        })
    }

    initInputBoxDatatable(obj) {
        let { tableId } = obj;
        let table = document.getElementById(tableId);
        let ths = table.querySelectorAll('thead th');

        ths.forEach((th, idx) => {
            let input = th.querySelector('.inputBox');
            if (input) {
                input.addEventListener('input', (e) => {
                    let currentTarget = e.currentTarget;
                    let value = currentTarget.value.toLowerCase().trim();

                    //Just Filter all the tr that includes our searched value 
                    let trList = table.querySelectorAll('tbody tr');
                    trList.forEach((tr) => {
                        let tdList = tr.querySelectorAll('td');
                        let matchFound = false;

                        if (tdList[idx]) { // Ensure the column index exists
                            matchFound = tdList[idx].textContent.toLowerCase().trim().includes(value);
                        }

                        tr.style.display = matchFound ? '' : 'none';
                    });
                });
            }
        })
    }

    sortDataDatatable(obj) {
        let { tableId, label, order, data } = obj;

        if (!data || !label) {
            console.log('Data or Label is missing');
            return;
        }

        //data: send by ref so no need to return
        TableHelper.sortData(data, order, label);

        this.putDataIntoBody({ tableId, data });
    }

    scrapeDataFromTable({ tableId }) {
        let table = document.getElementById(tableId);
        let headers = [];
        let data = [];

        // Get table headers
        let ths = table.querySelectorAll("thead tr th");
        ths.forEach(th => {
            let title = th.querySelector(".headerTitle");
            headers.push(title ? title.textContent.trim() : "");
        });

        // Get table rows
        let rows = table.querySelectorAll("tbody tr");
        rows.forEach(row => {
            let rowData = {};
            let cells = row.querySelectorAll("td");
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    // Use innerHTML instead of textContent to preserve HTML
                    rowData[headers[index]] = cell.innerHTML.trim();
                }
            });
            data.push(rowData);
        });

        return data;
    }

    putDataIntoBody(obj) {
        let { tableId, data } = obj;
        let table = document.getElementById(tableId);
        let tbody = table.querySelector("tbody");
        // Get the first row as a template
        let templateRow = tbody.querySelector("tr");
        let columnOrder = [];
        // Capture the column order from the table header
        const thead = table.querySelector("thead");
        if (thead) {
            const headerRow = thead.querySelector("tr");
            if (headerRow) {
                Array.from(headerRow.children).forEach(th => {
                    columnOrder.push(th.getAttribute('data-label') || th.textContent.trim());
                });
            }
        }
        tbody.innerHTML = "";
        data.forEach(rowData => {
            let tr = document.createElement("tr");
            // Copy attributes from the template row
            if (templateRow) {
                Array.from(templateRow.attributes).forEach(attr => {
                    tr.setAttribute(attr.name, attr.value);
                });
            }
            // If we have a column order from the header, use it
            if (columnOrder.length > 0) {
                columnOrder.forEach((column, index) => {
                    let td = document.createElement("td");
                    // Copy attributes from template cell
                    let templateTd = templateRow?.children[index];
                    if (templateTd) {
                        Array.from(templateTd.attributes).forEach(attr => {
                            td.setAttribute(attr.name, attr.value);
                        });
                    }
                    // Use innerHTML instead of textContent
                    td.innerHTML = rowData[column] || '';
                    tr.appendChild(td);
                });
            } else {
                // Fallback to original behavior
                Object.keys(rowData).forEach((key, index) => {
                    let td = document.createElement("td");
                    let templateTd = templateRow?.children[index];
                    if (templateTd) {
                        Array.from(templateTd.attributes).forEach(attr => {
                            td.setAttribute(attr.name, attr.value);
                        });
                    }
                    // Use innerHTML instead of textContent
                    td.innerHTML = rowData[key];
                    tr.appendChild(td);
                });
            }
            tbody.appendChild(tr);
        });
    }

    initFilterButtonDatatable(obj) {
        let { tableId } = obj;
        let table = document.getElementById(tableId);
        if (!table) {
            console.error(`Table with ID ${tableId} not found`);
            return;
        }

        let filterButtons = table.querySelectorAll('.filterButton');
        let originalData = this.scrapeDataFromTable({ tableId });

        filterButtons.forEach((filterBtn) => {
            filterBtn.addEventListener('click', (event) => {
                event.stopPropagation();

                // Close any existing dropdowns
                document.querySelectorAll('.filter-dropdown').forEach(d => d.remove());

                // Get closest th
                let th = filterBtn.closest('th');
                if (!th) return;

                // Get data-label from th and column number
                let label = th.getAttribute('data-label');
                let columnNumber = Array.from(th.parentElement.children).indexOf(th);

                // Get unique values from the original data
                let uniqueValues = [...new Set(originalData.map(item => item[label]))];

                // Get current values from the table
                let currentValues = [];
                let trList = table.querySelectorAll('tbody tr');
                trList.forEach((tr) => {
                    // Check if the row is hidden
                    let isHidden = window.getComputedStyle(tr).display === 'none';

                    if (!isHidden) {
                        let tdList = tr.querySelectorAll('td');
                        if (tdList[columnNumber]) {
                            currentValues.push(tdList[columnNumber].textContent.trim());
                        }
                    }
                });

                // Create dropdown
                let dropdownObj = TableHelper.createDropDown({ th });
                let dropdown = dropdownObj.dropdown;

                // Store checkbox states
                let checkboxStates = {};


                let checkboxContainer = document.createElement('div');
                checkboxContainer.classList.add('DyIeBk', 'OwYAo', 'Wh100p');

                // Create "Select All" checkbox
                let { selectAllWrapper, selectAllCheckbox } = TableHelper.createSelectAllCheckbox({ label, uniqueValues, currentValues });
                checkboxContainer.appendChild(selectAllWrapper);

                // Add event listener to "Select All" checkbox
                selectAllCheckbox.addEventListener('change', (e) => {
                    // get all checkboxes except the "Select All" checkbox
                    const checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]:not(#' + selectAllCheckbox.id + ')');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = selectAllCheckbox.checked;
                        checkboxStates[checkbox.value] = selectAllCheckbox.checked;
                    });
                });

                // Create checkboxes for unique values
                uniqueValues.forEach((value) => {
                    let checkboxWrapper = document.createElement('div');
                    checkboxWrapper.style.marginBottom = '5px';

                    let checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = value;
                    checkbox.id = `filter-${label}-${value}`;

                    // Check if value exists in current values
                    let isChecked = currentValues.includes(value);
                    checkbox.checked = isChecked;

                    // Store initial checkbox state
                    checkboxStates[value] = isChecked;

                    // Add event listener to update "Select All" checkbox state
                    checkbox.addEventListener('change', () => {
                        checkboxStates[value] = checkbox.checked;

                        // Check if all checkboxes are checked
                        const allChecked = Array.from(checkboxContainer.querySelectorAll('input[type="checkbox"]:not(#' + selectAllCheckbox.id + ')')).every(cb => cb.checked);

                        // Update "Select All" checkbox without triggering its event listener
                        selectAllCheckbox.checked = allChecked;
                    });

                    let checkboxLabel = document.createElement('label');
                    checkboxLabel.htmlFor = checkbox.id;
                    checkboxLabel.textContent = value;
                    checkboxLabel.style.marginLeft = '5px';

                    checkboxWrapper.appendChild(checkbox);
                    checkboxWrapper.appendChild(checkboxLabel);
                    checkboxContainer.appendChild(checkboxWrapper);
                });

                dropdown.appendChild(checkboxContainer);

                let { buttonsContainer, okButton, cancelButton } = TableHelper.getDropdownOkCloseButton()

                // OK Button Handler
                okButton.addEventListener('click', () => {
                    // Get all checkboxes
                    let checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

                    // Filter rows
                    trList.forEach((tr) => {
                        let tdList = tr.querySelectorAll('td');
                        if (tdList[columnNumber]) {
                            let cellValue = tdList[columnNumber].textContent.trim();

                            // Find corresponding checkbox
                            let checkbox = Array.from(checkboxes).find(cb => cb.value === cellValue);

                            // Hide row if checkbox is not checked
                            tr.style.display = checkbox && checkbox.checked ? '' : 'none';
                        }
                    });

                    // Remove dropdown
                    dropdown.remove();
                    dropdownObj.stopPositioning();
                });

                // Cancel Button Handler
                cancelButton.addEventListener('click', () => {
                    dropdown.remove();
                    dropdownObj.stopPositioning();
                });

                // Append buttons
                buttonsContainer.appendChild(okButton);
                buttonsContainer.appendChild(cancelButton);
                dropdown.appendChild(buttonsContainer);

                // Position and append dropdown
                th.style.position = 'relative';
                document.body.appendChild(dropdown);

                // Close dropdown when clicking outside
                const handleOutsideClick = (e) => {
                    if (!dropdown.contains(e.target)) {
                        dropdown.remove();
                        document.removeEventListener('click', handleOutsideClick);
                        dropdownObj.stopPositioning();
                    }
                };

                // Delay adding the event listener to prevent immediate closure
                setTimeout(() => {
                    document.addEventListener('click', handleOutsideClick);
                }, 0);
            });
        });
    }
}

class ProgressBar {
    dynamicProgressBar(obj) {
        let { id } = obj;

        if (!id) return;

        // Dynamic Progress Bar
        let myProgressBar = document.querySelector(`#${obj.id}`);

        if (!myProgressBar) {
            return;
        }

        let progressBar = myProgressBar.querySelector('[role="progressbar"]');

        if (!progressBar) {
            return;
        }

        progressBar.style.transition = `width 0.5s ease`;

        const updateProgress = (value) => {

            if (value <= 100) {
                progressBar.style.width = value + '%';
                progressBar.setAttribute('data-valuenow', value);
                progressBar.innerHTML = value + '%';
            }
            if (value == 100) {
                obj.onFinish();
            }

        }

        return updateProgress;
    }
}

class TextEditorHelper {

    static createToolbarContainer() {
        let toolbarContainer = document.createElement('div');
        toolbarContainer.className = 'DyFx FxJyCtSt FxAnIsCr Wh100p Pg20 FxWp';
        toolbarContainer.style.backgroundColor = '#f8f9fa';
        toolbarContainer.style.position = 'relative';
        return toolbarContainer;
    }

    static createToolButton(obj) {
        if (!obj || typeof obj !== 'object' || !obj.ot || !obj.icon || !obj.dataName) {
            console.error("Invalid object passed to createToolButton:", obj);
            return null;
        }

        let ot;
        try {
            ot = JSON.parse(obj.ot);
        } catch (error) {
            console.error("Error parsing 'ot' JSON:", error, obj.ot);
            return;
        }

        const button = document.createElement('button');
        button.id = ot.Id || obj.id; // Fallback to obj.id if ot.Id is missing
        button.dataset.name = obj.dataName;
        button.className = 'ToolTipButton tools-btn CrBdWe Br0 PgTpBm8 PgLtRt20 BrRs6 CrurPr Mn2 PnRe';
        button.setAttribute('ot', obj.ot)
        button.setAttribute('type', 'button'); // Prevents form submission

        const icon = document.createElement('i');
        icon.className = obj.icon;

        button.appendChild(icon);
        return button;
    }

    static createColorPaletteButton(obj) {
        const colorButtonContainer = document.createElement('div');
        colorButtonContainer.dataset.name = 'color-button';
        colorButtonContainer.classList.add('color-button');

        const colorButton = TextEditorHelper.createToolButton(obj);

        const colorPalette = document.createElement('div');
        colorPalette.dataset.name = 'colorPalette';
        colorPalette.className = 'colorPalette DyFx FxDnRw FxJyCtSeBn hidden';

        // Text color section
        const textColorSection = document.createElement('div');
        textColorSection.className = 'DyFx FxDnCn FxAnIsCr';

        const textLabel = document.createElement('label');
        textLabel.className = 'Pg5';
        textLabel.textContent = 'Text';

        const textColorInput = document.createElement('input');
        textColorInput.type = 'color';
        textColorInput.dataset.name = 'textColor';

        const clearTextBtn = document.createElement('button');
        clearTextBtn.className = 'transparent-btn';
        clearTextBtn.dataset.name = 'clearTextColor';
        clearTextBtn.textContent = 'Reset';

        textColorSection.appendChild(textLabel);
        textColorSection.appendChild(textColorInput);
        textColorSection.appendChild(clearTextBtn);

        // Background color section
        const bgColorSection = document.createElement('div');
        bgColorSection.className = 'DyFx FxDnCn FxAnIsCr';

        const bgLabel = document.createElement('label');
        bgLabel.className = 'Pg5';
        bgLabel.textContent = 'Background';

        const bgColorInput = document.createElement('input');
        bgColorInput.type = 'color';
        bgColorInput.dataset.name = 'bgColor';

        const clearBgBtn = document.createElement('button');
        clearBgBtn.className = 'transparent-btn';
        clearBgBtn.dataset.name = 'clearBgColor';
        clearBgBtn.textContent = 'Transparent';

        bgColorSection.appendChild(bgLabel);
        bgColorSection.appendChild(bgColorInput);
        bgColorSection.appendChild(clearBgBtn);

        colorPalette.appendChild(textColorSection);
        colorPalette.appendChild(bgColorSection);

        colorButtonContainer.appendChild(colorButton);
        colorButtonContainer.appendChild(colorPalette);
        return colorButtonContainer;
    }

    static createImageButton(obj) {
        const imageButtonContainer = document.createElement('div');
        imageButtonContainer.dataset.name = 'image-button';

        const imageButton = TextEditorHelper.createToolButton(obj);

        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.dataset.name = 'imageInput';
        imageInput.accept = 'image/*';
        imageInput.style.display = 'none';

        imageButtonContainer.appendChild(imageButton);
        imageButtonContainer.appendChild(imageInput);
        return imageButtonContainer;
    }

    static createVideoButton(obj) {
        const videoButtonContainer = document.createElement('div');
        videoButtonContainer.dataset.name = 'video-button';

        const videoButton = TextEditorHelper.createToolButton(obj);

        const videoInput = document.createElement('input');
        videoInput.type = 'file';
        videoInput.dataset.name = 'videoInput';
        videoInput.accept = 'video/*';
        videoInput.style.display = 'none';

        videoButtonContainer.appendChild(videoButton);
        videoButtonContainer.appendChild(videoInput);
        return videoButtonContainer;
    }

    static createImageResizeToolbar() {
        const resizeToolbar = document.createElement('div');
        resizeToolbar.dataset.name = 'resizeToolbar';
        resizeToolbar.className = 'resizeToolbar DyFx FxDnCn Gp5 hidden';

        const widthLabel = document.createElement('label');
        const widthInput = document.createElement('input');
        widthInput.className = 'TtBx';
        widthInput.dataset.name = 'imgWidth';
        widthInput.type = 'number';
        widthInput.placeholder = 'Width in px';
        widthInput.min = '10';
        widthLabel.appendChild(widthInput);

        const heightLabel = document.createElement('label');
        const heightInput = document.createElement('input');
        heightInput.className = 'TtBx';
        heightInput.dataset.name = 'imgHeight';
        heightInput.type = 'number';
        heightInput.placeholder = 'Height in px';
        heightInput.min = '10';
        heightLabel.appendChild(heightInput);

        const applyResizeBtn = document.createElement('button');
        applyResizeBtn.className = 'Bn CrBdTt Br2 CrBrTe CrTe30Lt';
        applyResizeBtn.textContent = 'Apply';
        applyResizeBtn.dataset.name = 'applyResize';

        const closeResizeBtn = document.createElement('button');
        closeResizeBtn.className = 'Bn CrBdTt Br2 CrBrTe CrTe30Lt';
        closeResizeBtn.textContent = 'Close';
        closeResizeBtn.dataset.name = 'closeResize';

        resizeToolbar.appendChild(widthLabel);
        resizeToolbar.appendChild(heightLabel);
        resizeToolbar.appendChild(applyResizeBtn);
        resizeToolbar.appendChild(closeResizeBtn);
        return resizeToolbar;
    }

    static createVideoResizeToolbar() {
        const resizeToolbarVideo = document.createElement('div');
        resizeToolbarVideo.dataset.name = 'resizeToolbarVideo';
        resizeToolbarVideo.className = 'resizeToolbarVideo DyFx FxDnCn Gp5 hidden';

        const videoWidthLabel = document.createElement('label');
        const videoWidthInput = document.createElement('input');
        videoWidthInput.className = 'TtBx';
        videoWidthInput.dataset.name = 'imgWidth';
        videoWidthInput.type = 'number';
        videoWidthInput.placeholder = 'Width in px';
        videoWidthInput.min = '10';
        videoWidthLabel.appendChild(videoWidthInput);

        const videoHeightLabel = document.createElement('label');
        const videoHeightInput = document.createElement('input');
        videoHeightInput.className = 'TtBx';
        videoHeightInput.dataset.name = 'imgHeight';
        videoHeightInput.type = 'number';
        videoHeightInput.placeholder = 'Height in px';
        videoHeightInput.min = '10';
        videoHeightLabel.appendChild(videoHeightInput);

        const applyVideoResizeBtn = document.createElement('button');
        applyVideoResizeBtn.className = 'Bn CrBdTt Br2 CrBrTe CrTe30Lt';
        applyVideoResizeBtn.textContent = 'Apply';
        applyVideoResizeBtn.dataset.name = 'applyResize';

        const closeVideoResizeBtn = document.createElement('button');
        closeVideoResizeBtn.className = 'Bn CrBdTt Br2 CrBrTe CrTe30Lt';
        closeVideoResizeBtn.textContent = 'Close';
        closeVideoResizeBtn.dataset.name = 'closeResize';

        resizeToolbarVideo.appendChild(videoWidthLabel);
        resizeToolbarVideo.appendChild(videoHeightLabel);
        resizeToolbarVideo.appendChild(applyVideoResizeBtn);
        resizeToolbarVideo.appendChild(closeVideoResizeBtn);
        return resizeToolbarVideo;
    }

    static createHeadingButton(obj) {
        const headingButtonContainer = document.createElement('div');
        headingButtonContainer.dataset.name = 'heading-button';
        headingButtonContainer.classList.add('heading-button');

        // Create the main button
        const headingButton = TextEditorHelper.createToolButton(obj);

        // Create the dropdown container
        const headingDropdown = document.createElement('div');
        headingDropdown.dataset.name = 'headingDropdown';
        headingDropdown.className = 'headingDropdown DyFx FxDnRw FxJyCtSeBn hidden';

        // Create the header options (Normal + H1 to H6)
        const headers = ['Normal', 'Header 1', 'Header 2', 'Header 3', 'Header 4', 'Header 5', 'Header 6'];

        headers.forEach((headerText, index) => {
            const headingOption = document.createElement('button');
            headingOption.className = 'heading-option';
            headingOption.textContent = headerText;

            // Assign unique dataset values
            if (index === 0) {
                headingOption.dataset.heading = 'p'; // "Normal" should use <p>
            } else {
                headingOption.dataset.heading = `h${index}`; // H1 to H6 start from index 1
            }

            headingDropdown.appendChild(headingOption);
        });

        headingButtonContainer.appendChild(headingButton);
        headingButtonContainer.appendChild(headingDropdown);

        // Toggle dropdown visibility when the button is clicked
        headingButton.addEventListener('click', () => {
            headingDropdown.classList.toggle('hidden');
        });

        return headingButtonContainer;
    }

    static createTableEditToolbar() {
        // Add row below, add row above, delete row, add column right, add column left, delete column
        const tableEditToolbar = document.createElement('div');
        tableEditToolbar.dataset.name = 'tableEditToolbar';
        tableEditToolbar.className = 'tableEditToolbar DyFx FxDnCn Gp5 CrBdWe Br1 Pg0 hidden PnAe PnTp100p PnLt0';

        const buttonDesign = 'table-edit-option';
        const addRowBelowBtn = document.createElement('button');
        addRowBelowBtn.className = buttonDesign;
        addRowBelowBtn.textContent = 'Add Row Below';
        addRowBelowBtn.dataset.name = 'addRowBelow';

        const addRowAboveBtn = document.createElement('button');
        addRowAboveBtn.className = buttonDesign;
        addRowAboveBtn.textContent = 'Add Row Above';
        addRowAboveBtn.dataset.name = 'addRowAbove';

        const deleteRowBtn = document.createElement('button');
        deleteRowBtn.className = buttonDesign;
        deleteRowBtn.textContent = 'Delete Row';
        deleteRowBtn.dataset.name = 'deleteRow';

        const addColumnRightBtn = document.createElement('button');
        addColumnRightBtn.className = buttonDesign;
        addColumnRightBtn.textContent = 'Add Column Right';
        addColumnRightBtn.dataset.name = 'addColumnRight';

        const addColumnLeftBtn = document.createElement('button');
        addColumnLeftBtn.className = buttonDesign;
        addColumnLeftBtn.textContent = 'Add Column Left';
        addColumnLeftBtn.dataset.name = 'addColumnLeft';

        const deleteColumnBtn = document.createElement('button');
        deleteColumnBtn.className = buttonDesign;
        deleteColumnBtn.textContent = 'Delete Column';
        deleteColumnBtn.dataset.name = 'deleteColumn';

        tableEditToolbar.appendChild(addRowBelowBtn);
        tableEditToolbar.appendChild(addRowAboveBtn);
        tableEditToolbar.appendChild(deleteRowBtn);
        tableEditToolbar.appendChild(addColumnRightBtn);
        tableEditToolbar.appendChild(addColumnLeftBtn);
        tableEditToolbar.appendChild(deleteColumnBtn);

        return tableEditToolbar
    }

    static getRandomString() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    static getButtons() {

        function createToolTipOT(title) {
            return JSON.stringify({
                Id: TextEditorHelper.getRandomString(),
                Tt: title,
                Pn: "Auto",
                Cr: "White",
                CrBd: "Green",
                An: "AnSeLt"
            });
        }

        return [
            { dataName: 'bold', icon: 'fa-solid fa-bold', ot: createToolTipOT("Bold") },
            { dataName: 'italic', icon: 'fa-solid fa-italic', ot: createToolTipOT("Italic") },
            { dataName: 'underline', icon: 'fa-solid fa-underline', ot: createToolTipOT("Underline") },
            { dataName: 'strikethrough', icon: 'fa-solid fa-strikethrough', ot: createToolTipOT("Strikethrough") },
            { dataName: 'justifyLeft', icon: 'fa-solid fa-align-left', ot: createToolTipOT("Align Left") },
            { dataName: 'justifyRight', icon: 'fa-solid fa-align-right', ot: createToolTipOT("Align Right") },
            { dataName: 'justifyFull', icon: 'fa-solid fa-align-justify', ot: createToolTipOT("Justify") },
            { dataName: 'justifyCenter', icon: 'fa-solid fa-align-center', ot: createToolTipOT("Align Center") },
            { dataName: 'unorderedList', icon: 'fa-solid fa-list-ul', ot: createToolTipOT("Unordered List") },
            //{ dataName: 'increaseFontSize', icon: 'fa-solid fa-plus', ot: createToolTipOT("Increase Font Size") },
            //{ dataName: 'decreaseFontSize', icon: 'fa-solid fa-minus', ot: createToolTipOT("Decrease Font Size") },
            { dataName: 'copyBtn', icon: 'fa-regular fa-clipboard', ot: createToolTipOT("Copy") },
            { dataName: 'resetBtn', icon: 'fa-solid fa-rotate-right', ot: createToolTipOT("Reset") },
            { dataName: 'linkButton', icon: 'fa-solid fa-link', ot: createToolTipOT("Insert Link") },
            { dataName: 'expandButton', icon: 'fa-solid fa-expand', ot: createToolTipOT("Expand Editor") },
            { dataName: 'codeViewButton', icon: 'fa-solid fa-code', ot: createToolTipOT("Code View") },
            { dataName: 'tableButton', icon: 'fa fa-table', ot: createToolTipOT("Insert Table") },
            { dataName: 'colorButton', icon: 'fa-solid fa-palette', ot: createToolTipOT("Text Color") },
            { dataName: 'imageButton', icon: 'fa-solid fa-image', ot: createToolTipOT("Insert Image") },
            { dataName: 'videoButton', icon: 'fa-solid fa-video', ot: createToolTipOT("Insert Video") },
            { dataName: 'headingButton', icon: 'fa-solid fa-pencil', ot: createToolTipOT("Headings") },
        ];

    }

}

class TextEditor {

    createEditor(obj) {
        // Get the editor container
        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        // Find the first element child - it is the editor
        const firstElementChild = editorContainer.firstElementChild;

        if (!firstElementChild) {
            console.error('No valid child element found to set contentEditable.');
            return;
        }

        firstElementChild.setAttribute('contentEditable', true);
        firstElementChild.dataset.name = 'editor';

        // Apply styles
        firstElementChild.style.resize = "none";
        firstElementChild.style.outline = "none";

        // create input with hidden state
        let input = document.createElement('input');
        input.style.display = 'none';
        input.setAttribute('name', 'data');
        editorContainer.appendChild(input);

        // Bind input with editor
        firstElementChild.addEventListener('input', () => {
            input.value = firstElementChild.innerHTML;
        })

        // Create the toolbar container
        const toolbarContainer = TextEditorHelper.createToolbarContainer();

        // Define toolbar buttons
        const buttons = TextEditorHelper.getButtons();

        // Create and append basic buttons
        buttons.forEach(btn => {
            let button = null;
            switch (btn.dataName) {
                case 'colorButton':
                    button = TextEditorHelper.createColorPaletteButton(btn);
                    break;
                case 'imageButton':
                    button = TextEditorHelper.createImageButton(btn);
                    break;
                case 'videoButton':
                    button = TextEditorHelper.createVideoButton(btn);
                    break;
                case 'headingButton':
                    button = TextEditorHelper.createHeadingButton(btn);
                    break;
                default:
                    button = TextEditorHelper.createToolButton(btn);
                    break;
            }
            toolbarContainer.appendChild(button);
        });

        // Create resize toolbar
        const imageResizeToolbar = TextEditorHelper.createImageResizeToolbar();
        toolbarContainer.appendChild(imageResizeToolbar);

        // Create resize toolbar for video
        const videoResizeToolbar = TextEditorHelper.createVideoResizeToolbar();
        toolbarContainer.appendChild(videoResizeToolbar);

        // Create table edit toolbar
        const editTableToolbar = TextEditorHelper.createTableEditToolbar();
        toolbarContainer.appendChild(editTableToolbar);

        // Add the toolbar to the editor container
        editorContainer.insertBefore(toolbarContainer, editorContainer.firstChild);

        this.initButtons(obj);

    }

    bindCommand(buttonElement, command, showUi, value) {
        if (!buttonElement || !command) return;
        buttonElement.addEventListener("click", function () {
            document.execCommand(command, showUi, value);
        });
    }

    setFontSize(obj, action) {
        const editorContainer = document.getElementById(obj?.id);
        const editor = editorContainer.querySelector('[data-name="editor"]');
        // Get the current selection
        const selection = window.getSelection();
        console.log(selection)
        // Check if there is a selection and it's within our editor
        if (selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);

            // Check if something is actually selected
            if (!range.collapsed) {
                // Check if selection is entirely within a single span
                const selectedNode = range.commonAncestorContainer;
                let targetNode;

                // Determine if we can modify an existing span
                if (selectedNode.nodeType === 3 && selectedNode.parentNode.tagName === 'SPAN' &&
                    range.startContainer === range.endContainer &&
                    range.startOffset === 0 && range.endOffset === selectedNode.length) {
                    // Selection exactly matches a text node inside a span
                    targetNode = selectedNode.parentNode;

                    // Get current font size
                    const currentSize = parseInt(window.getComputedStyle(targetNode).fontSize, 10);

                    // Update existing span's font size
                    targetNode.style.fontSize = action === 'increase' ?
                        (currentSize + 1) + "px" :
                        (currentSize - 1) + "px";
                } else {
                    // Need to create a new span for the selection
                    const span = document.createElement('span');

                    // Get current font size of the selection or use the editor's font size
                    const currentSize = parseInt(
                        window.getComputedStyle(
                            selectedNode.nodeType === 3 ? selectedNode.parentNode : selectedNode
                        ).fontSize,
                        10
                    );

                    // Set the increased/decreased font size
                    span.style.fontSize = action === 'increase' ?
                        (currentSize + 1) + "px" :
                        (currentSize - 1) + "px";

                    // Wrap the selection with the span
                    const fragment = range.extractContents();
                    span.appendChild(fragment);
                    range.insertNode(span);
                }

                // Preserve the selection
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                console.log("No text selected");
            }
        }
    }

    handleIncreaseFontSize(obj, increaseFontSizeButton) {
        increaseFontSizeButton.addEventListener("click", () => {
            this.setFontSize(obj, 'increase');
        });
    }

    handleDecreaseFontSize(obj, decreaseFontSizeButton) {
        decreaseFontSizeButton.addEventListener("click", () => {
            this.setFontSize(obj, 'decrease');
        });
    }

    handleCopyText(obj, copyButton) {
        const editorContainer = document.getElementById(obj?.id);
        copyButton.addEventListener("click", () => {
            const isCodeView = editorContainer.getAttribute('data-codeview') === "true";
            let textToCopy = '';

            if (isCodeView) {
                const editor = editorContainer.querySelector('textarea');
                if (editor) {
                    // For textareas, use value
                    textToCopy = editor.value;
                }
            } else {
                const editor = editorContainer.querySelector('[data-name="editor"]');
                if (editor) {
                    textToCopy = editor.innerText;
                }
            }

            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        console.log('Text copied to clipboard');
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
            } else {
                console.log('No text to copy');
            }
        });
    }

    handleResetText(obj, resetButton) {
        const editorContainer = document.getElementById(obj?.id);
        resetButton.addEventListener("click", () => {
            let editor = editorContainer.querySelector('[data-name="editor"]');
            editor.innerHTML = "";
        });
    }

    handleColorPalette(obj) {
        // Get the editor container
        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error("Editor container not found.");
            return;
        }

        const colorButton = editorContainer.querySelector('[data-name="colorButton"]');
        const colorPalette = editorContainer.querySelector('[data-name="colorPalette"]');
        const textColor = editorContainer.querySelector('[data-name="textColor"]');
        const bgColor = editorContainer.querySelector('[data-name="bgColor"]');
        const editor = editorContainer.querySelector('[data-name="editor"]');
        const clearTextColor = editorContainer.querySelector('[data-name="clearTextColor"]');
        const clearBgColor = editorContainer.querySelector('[data-name="clearBgColor"]');

        // Toggle color palette visibility
        colorButton.addEventListener("click", function (e) {
            e.stopPropagation(); // Prevents event bubbling
            if (colorPalette.classList.contains("hidden")) {
                colorPalette.classList.remove("hidden");
            } else {
                colorPalette.classList.add("hidden");
            }
        });

        // Change text color
        textColor.addEventListener("input", function () {
            document.execCommand("foreColor", false, this.value);
        });

        // Change background color
        bgColor.addEventListener("input", function () {
            document.execCommand("hiliteColor", false, this.value);
        });

        // Hide color palette when clicking outside
        document.addEventListener("click", function (e) {
            if (!colorButton.contains(e.target) && !colorPalette.contains(e.target)) {
                colorPalette.classList.add("hidden");
            }
        });

        // Remove text color (Transparent)
        clearTextColor.addEventListener("click", function () {
            document.execCommand("foreColor", false, "black");
        });

        // Remove background color (Transparent)
        clearBgColor.addEventListener("click", function () {
            document.execCommand("hiliteColor", false, "transparent");
        });
    }

    handleImage(obj) {

        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        // Get references using data-name attributes within editorContainer
        const imageButton = editorContainer.querySelector('[data-name="imageButton"]');
        const imageInput = editorContainer.querySelector('[data-name="imageInput"]');
        const editor = editorContainer.querySelector('[data-name="editor"]');
        const resizeToolbar = editorContainer.querySelector('[data-name="resizeToolbar"]');
        const imgWidthInput = resizeToolbar.querySelector('[data-name="imgWidth"]');
        const imgHeightInput = resizeToolbar.querySelector('[data-name="imgHeight"]');
        const applyResize = resizeToolbar.querySelector('[data-name="applyResize"]');
        const closeResize = resizeToolbar.querySelector('[data-name="closeResize"]');

        // When the image button is clicked, trigger the file input click
        imageButton.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default button behavior
            imageInput.click();
        });

        // When an image is selected, read it and insert into the editor
        imageInput.addEventListener('change', function (e) {
            const file = this.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    // Insert the image into the editor at the current cursor position
                    document.execCommand('insertImage', false, event.target.result);
                }
                reader.readAsDataURL(file);
            }
            // Reset the file input so the same file can be selected again if needed
            this.value = '';
        });

        let selectedImage = null;

        // When an image inside the editor is clicked, show the resize toolbar
        editor.addEventListener("click", function (e) {
            if (e.target.tagName === "IMG") {
                selectedImage = e.target;
                resizeToolbar.classList.remove("hidden");
                // Set the input values to the current image dimensions
                imgWidthInput.value = selectedImage.width;
                imgHeightInput.value = selectedImage.height;
            } else {
                // If the click is outside the image and the toolbar, hide the toolbar
                if (!resizeToolbar.contains(e.target)) {
                    resizeToolbar.classList.add("hidden");
                    selectedImage = null;
                }
            }
        });

        // When "Apply" is clicked, update the image dimensions
        applyResize.addEventListener("click", function () {
            if (selectedImage) {
                const newWidth = imgWidthInput.value;
                const newHeight = imgHeightInput.value;
                selectedImage.style.width = newWidth + "px";
                selectedImage.style.height = newHeight + "px";
                // Hide the toolbar after applying changes
                resizeToolbar.classList.add("hidden");
            }
        });

        // When "Close" is clicked, hide the toolbar without changes
        closeResize.addEventListener("click", function () {
            resizeToolbar.classList.add("hidden");
            selectedImage = null;
        });



    }

    handleVideo(obj) {
        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        // Get references using data-name attributes within editorContainer
        const videoButton = editorContainer.querySelector('[data-name="videoButton"]');
        const videoInput = editorContainer.querySelector('[data-name="videoInput"]');
        const editor = editorContainer.querySelector('[data-name="editor"]');
        const resizeToolbar = editorContainer.querySelector('[data-name="resizeToolbarVideo"]');
        const imgWidthInput = resizeToolbar.querySelector('[data-name="imgWidth"]');
        const imgHeightInput = resizeToolbar.querySelector('[data-name="imgHeight"]');
        const applyResize = resizeToolbar.querySelector('[data-name="applyResize"]');
        const closeResize = resizeToolbar.querySelector('[data-name="closeResize"]');


        // When the video button is clicked, trigger the file input click
        videoButton.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default behavior
            videoInput.click();
        });

        // When a video is selected, insert it into the editor
        videoInput.addEventListener('change', function (e) {
            const file = videoInput.files[0];
            if (file && file.type.startsWith('video/')) {
                // Create an object URL for the video file
                const videoURL = URL.createObjectURL(file);
                // Create a video element with controls; adjust width/height as needed
                const videoHTML = `<video controls width="320" height="240" src="${videoURL}"></video>`;
                // Insert the video element into the editor at the cursor position
                document.execCommand('insertHTML', false, videoHTML);
                // Reset the file input so the same file can be re-selected if needed
                videoInput.value = '';
            }
        });

        // Use a single variable for both images and videos
        let selectedMedia = null;

        // When an image or video inside the editor is clicked, show the resize toolbar
        editor.addEventListener("click", function (e) {
            if (e.target.tagName === "VIDEO") {
                selectedMedia = e.target;
                resizeToolbar.classList.remove("hidden");

                // Set the input values to the current media dimensions
                imgWidthInput.value = selectedMedia.width;
                imgHeightInput.value = selectedMedia.height;
            } else {
                // Hide the toolbar if clicking outside the media and the toolbar
                if (!resizeToolbar.contains(e.target)) {
                    resizeToolbar.classList.add("hidden");
                    selectedMedia = null;
                }
            }
        });

        // When "Apply" is clicked, update the media dimensions
        applyResize.addEventListener("click", function () {
            if (selectedMedia) {
                const newWidth = imgWidthInput.value;
                const newHeight = imgHeightInput.value;
                selectedMedia.setAttribute('width', newWidth);
                selectedMedia.setAttribute('height', newHeight);
                // Hide the toolbar after applying changes
                resizeToolbar.classList.add("hidden");
            }
        });

        // When "Close" is clicked, hide the toolbar without changes
        closeResize.addEventListener("click", function () {
            resizeToolbar.classList.add("hidden");
            selectedMedia = null;
        });
    }

    handleLink(obj) {
        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        const linkButton = editorContainer.querySelector('[data-name="linkButton"]');

        linkButton.addEventListener("click", function () {
            // Check if there's any selected text
            const selectedText = window.getSelection().toString();
            if (selectedText.length === 0) {
                alert("Please select some text to create a link.");
                return;
            }

            // Ask the user for a URL
            const url = prompt("Enter the URL for the link:");
            if (url) {
                // Apply the link to the selected text using execCommand
                document.execCommand("createLink", false, url);
                document.execCommand("foreColor", false, "blue");
                document.execCommand("underline", false, null);
            }
        });

    }

    handleExpand(obj) {
        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        const expandButton = editorContainer.querySelector('[data-name="expandButton"]');

        expandButton.addEventListener("click", function () {
            editorContainer.classList.toggle("expand");
        });
    }

    handleCodeView(obj) {

        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        const codeViewButton = editorContainer.querySelector('[data-name="codeViewButton"]');

        const editor = editorContainer.querySelector('[data-name="editor"]');
        editor.innerHTML = '<p><br></p>';

        codeViewButton.addEventListener('click', () => {

            // Check if we’re in code view by reading a data attribute on the editor container
            const isCodeView = editorContainer.getAttribute("data-codeview") === "true";

            if (isCodeView) {
                // Switching from Code View to Design View
                editorContainer.setAttribute("data-codeview", "false");
                editorContainer.querySelector("textarea.code-view").remove();
                editor.style.display = '';
            } else {
                // Switching from Design View to Code View
                editorContainer.setAttribute("data-codeview", "true");
                const htmlContent = editor.innerHTML;
                const h = editor.clientHeight + 'px'
                editor.style.display = 'none';

                const textarea = document.createElement("textarea");
                textarea.readOnly = true;
                textarea.className = "code-view";
                textarea.style.width = "100%";
                textarea.style.height = h;
                textarea.value = htmlContent;
                editorContainer.appendChild(textarea);
            }
        });
    }

    handleTable(obj) {

        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error("Editor container not found.");
            return;
        }

        const colorButton = editorContainer.querySelector('[data-name="tableButton"]');

        colorButton.addEventListener("click", function () {
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';

            const rows = prompt('Enter number of rows');
            if (!rows) return;
            const cols = prompt('Enter number of columns');
            if (!cols) return;

            for (let i = 0; i < rows; i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < cols; j++) {
                    const td = document.createElement('td');
                    td.style.border = '1px solid black';
                    td.style.padding = '8px';
                    td.contentEditable = true;
                    td.innerHTML = '<br/>';
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }

            document.execCommand('insertHTML', false, table.outerHTML);
        });
    }

    handleHeading(obj) {

        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error("Editor container not found.");
            return;
        }

        const headingButton = editorContainer.querySelector('[data-name="headingButton"]');
        const headingDropdown = editorContainer.querySelector('[data-name="headingDropdown"]');
        const headingOptions = headingDropdown.querySelectorAll('.heading-option');

        headingOptions.forEach((headingOption) => {
            let heading = headingOption.dataset.heading;
            headingOption.addEventListener("click", (e) => {
                document.execCommand('formatBlock', false, heading);
                headingDropdown.classList.add("hidden");
            })
        })

        // Hide heading dropdown when clicking outside
        document.addEventListener("click", function (e) {
            if (!headingButton.contains(e.target) && !headingDropdown.contains(e.target)) {
                headingDropdown.classList.add("hidden");
            }
        })
    }

    handleEditTable(obj) {
        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error("Editor container not found.");
            return;
        }

        const tableEditToolbar = editorContainer.querySelector('[data-name="tableEditToolbar"]');
        const addRowBelowBtn = tableEditToolbar.querySelector('[data-name="addRowBelow"]');
        const addRowAboveBtn = tableEditToolbar.querySelector('[data-name="addRowAbove"]');
        const deleteRowBtn = tableEditToolbar.querySelector('[data-name="deleteRow"]');
        const addColumnRightBtn = tableEditToolbar.querySelector('[data-name="addColumnRight"]');
        const addColumnLeftBtn = tableEditToolbar.querySelector('[data-name="addColumnLeft"]');
        const deleteColumnBtn = tableEditToolbar.querySelector('[data-name="deleteColumn"]');

        // Track the last clicked cell
        let lastClickedCell = null;

        editorContainer.addEventListener('click', function (e) {
            // Find if a TD was clicked or if we clicked inside a TD
            let targetCell = null;
            let element = e.target;

            // Check if clicked element is a TD or has a TD parent
            while (element && element !== editorContainer) {
                if (element.tagName === 'TD') {
                    targetCell = element;
                    break;
                }
                element = element.parentElement;
            }

            if (targetCell) {
                // Save the selected cell
                lastClickedCell = targetCell;

                // Show toolbar below the selected cell
                const rect = targetCell.getBoundingClientRect();
                const editorRect = editorContainer.getBoundingClientRect();
                tableEditToolbar.style.top = (rect.top - editorRect.top + rect.height) + 'px';
                tableEditToolbar.style.left = (rect.left - editorRect.left) + 'px';

                // Show the toolbar
                tableEditToolbar.classList.remove('hidden');
            } else if (!tableEditToolbar.contains(e.target)) {
                // Hide toolbar if click is outside the toolbar and not on a cell
                tableEditToolbar.classList.add('hidden');
            }
        });

        //Hide toolbar if user is typing
        editorContainer.addEventListener('keydown', function (e) {
            tableEditToolbar.classList.add('hidden');
        })

        addRowBelowBtn.addEventListener("click", function () {
            if (!lastClickedCell) return;

            // Find the actual table that contains the cell
            const table = lastClickedCell.closest('table');
            if (!table) return;

            const currentRow = lastClickedCell.closest('tr');
            if (!currentRow) return;

            const newRow = currentRow.cloneNode(true);

            // Clear content from each cell in the new row
            Array.from(newRow.cells).forEach(cell => {
                cell.innerHTML = '<br>';
            });

            // Make sure we're inserting the new row in its parent
            currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);

            tableEditToolbar.classList.add('hidden');
        });

        addRowAboveBtn.addEventListener("click", function () {
            if (!lastClickedCell) return;

            // Find the actual table that contains the cell
            const table = lastClickedCell.closest('table');
            if (!table) return;

            const currentRow = lastClickedCell.closest('tr');
            if (!currentRow) return;

            const newRow = currentRow.cloneNode(true);

            // Clear content from each cell in the new row
            Array.from(newRow.cells).forEach(cell => {
                cell.innerHTML = '<br>';
            });

            // Make sure we're inserting the new row in its parent
            currentRow.parentNode.insertBefore(newRow, currentRow);

            tableEditToolbar.classList.add('hidden');
        });

        deleteRowBtn.addEventListener("click", function () {
            if (!lastClickedCell) return;

            const table = lastClickedCell.closest('table');
            if (!table) return;

            const selectedRow = lastClickedCell.closest('tr');
            if (!selectedRow) return;

            // Use the parent to remove the row directly
            selectedRow.parentNode.removeChild(selectedRow);
            lastClickedCell = null; // Reset selected cell after deletion

            tableEditToolbar.classList.add('hidden');
        });

        addColumnRightBtn.addEventListener("click", function () {
            if (!lastClickedCell) return;

            const table = lastClickedCell.closest('table');
            if (!table) return;

            const cellIndex = lastClickedCell.cellIndex;
            const rows = table.rows;

            for (let i = 0; i < rows.length; i++) {
                const cell = rows[i].insertCell(cellIndex + 1);
                cell.style.border = '1px solid black';
                cell.style.padding = '8px';
                cell.contentEditable = true;
                cell.innerHTML = '<br/>';
            }

            tableEditToolbar.classList.add('hidden');
        });

        addColumnLeftBtn.addEventListener("click", function () {
            if (!lastClickedCell) return;

            const table = lastClickedCell.closest('table');
            if (!table) return;

            const cellIndex = lastClickedCell.cellIndex;
            const rows = table.rows;

            for (let i = 0; i < rows.length; i++) {
                const cell = rows[i].insertCell(cellIndex);
                cell.style.border = '1px solid black';
                cell.style.padding = '8px';
                cell.contentEditable = true;
                cell.innerHTML = '<br/>';
            }

            tableEditToolbar.classList.add('hidden');
        });

        deleteColumnBtn.addEventListener("click", function () {
            if (!lastClickedCell) return;

            const table = lastClickedCell.closest('table');
            if (!table) return;

            const cellIndex = lastClickedCell.cellIndex;
            const rows = table.rows;

            for (let i = 0; i < rows.length; i++) {
                if (rows[i].cells.length > cellIndex) {
                    rows[i].deleteCell(cellIndex);
                }
            }

            lastClickedCell = null; // Reset selected cell after deletion

            tableEditToolbar.classList.add('hidden');
        });
    }

    initButtons(obj) {

        // Get the editor container
        const editorContainer = document.getElementById(obj?.id);

        if (!editorContainer) {
            console.error("Editor container not found.");
            return;
        }

        // Get Buttons using querySelector
        const boldButton = editorContainer.querySelector('[data-name="bold"]');
        const underlineButton = editorContainer.querySelector('[data-name="underline"]');
        const italicButton = editorContainer.querySelector('[data-name="italic"]');
        const strikethroughButton = editorContainer.querySelector('[data-name="strikethrough"]');
        const justifyRightButton = editorContainer.querySelector('[data-name="justifyRight"]');
        const justifyLeftButton = editorContainer.querySelector('[data-name="justifyLeft"]');
        const justifyCenterButton = editorContainer.querySelector('[data-name="justifyCenter"]');
        const justifyFullButton = editorContainer.querySelector('[data-name="justifyFull"]');
        const unorderedListButton = editorContainer.querySelector('[data-name="unorderedList"]');
        const increaseFontSizeButton = editorContainer.querySelector('[data-name="increaseFontSize"]');
        const decreaseFontSizeButton = editorContainer.querySelector('[data-name="decreaseFontSize"]');
        const copyButton = editorContainer.querySelector('[data-name="copyBtn"]');
        const resetButton = editorContainer.querySelector('[data-name="resetBtn"]');

        // Bind Buttons
        this.bindCommand(boldButton, "bold", false, null);
        this.bindCommand(italicButton, "italic", false, null);
        this.bindCommand(underlineButton, "underline", false, null);
        this.bindCommand(strikethroughButton, "strikethrough", false, null);
        this.bindCommand(justifyRightButton, "justifyRight", false, null);
        this.bindCommand(justifyLeftButton, "justifyLeft", false, null);
        this.bindCommand(justifyCenterButton, "justifyCenter", false, null);
        this.bindCommand(justifyFullButton, "justifyFull", false, null);
        this.bindCommand(unorderedListButton, "insertUnorderedList", false, null);

        //this.handleIncreaseFontSize(obj, increaseFontSizeButton);
        //this.handleDecreaseFontSize(obj, decreaseFontSizeButton);
        this.handleCopyText(obj, copyButton);
        this.handleResetText(obj, resetButton);
        this.handleColorPalette(obj);
        this.handleImage(obj);
        this.handleVideo(obj);
        this.handleLink(obj);
        this.handleExpand(obj);
        this.handleCodeView(obj);
        this.handleTable(obj);
        this.handleHeading(obj);
        this.handleEditTable(obj);
    }

}

class QtySelector {
    constructor(obj) {
        if (!obj.id) {
            console.log('no id was provided');
            return;
        }
        this.id = obj.id;
        this.rows = obj.rows || 5;
        this.columns = obj.columns || 5;
        this.zIndex = obj.zIndex || 'ZIx10000000000';
        this.width = obj.width || { mobile: "70vw", tablet: "250px", desktop: "300px" };
        this.limit = obj.limit || Infinity;
        this.callback = obj.callback || function () { };

        this.requestAnimationFrameId = null;
        this.qtySelectorTable = null;
        this.qtyDisplayContainer = null;
        this.startValueOfQtySelector = 1;

        this.createQtySelector(obj);
    }

    createQtySelector() {
        this.qtySelectorTable = this.createQtySelectorTable();
        document.body.appendChild(this.qtySelectorTable);

        this.setWidth(this.qtySelectorTable)

        this.qtyDisplayContainer = document.getElementById(this.id);

        this.getQtySelectorTableAbsolutePosition();

        this.removeQtySelectorTable()
    }

    createQtySelectorTable() {
        this.startValueOfQtySelector = 1;

        let div = document.createElement('div');

        let upDownArrowDiv = document.createElement('div');
        upDownArrowDiv.classList.add('DyFx', 'FxJyCtSeBn', 'CrBdTe', 'Pg5');

        let downArrowDiv = document.createElement('div');
        let upArrowDiv = document.createElement('div');

        const createNavigationIcon = (iconClassArray, container, fontSize, action) => {
            iconClassArray.forEach((iconClass) => {
                let i = document.createElement('i');
                i.classList.add(iconClass, fontSize, 'CrurPr');
                container.appendChild(i);

                switch (action) {
                    case 'up':
                        if (iconClass.includes('One')) {
                            i.addEventListener('click', () => {
                                this.startValueOfQtySelector = this.startValueOfQtySelector + (this.rows * this.columns);
                                createTable();
                                this.preventFromRemovingQtySelectorTable = true;
                            })
                        } else if (iconClass.includes('Two')) {
                            i.addEventListener('click', () => {
                                this.startValueOfQtySelector = this.startValueOfQtySelector + (this.rows * this.columns) * 2;
                                createTable();
                                this.preventFromRemovingQtySelectorTable = true;
                            })
                        } else {
                            i.addEventListener('click', () => {
                                this.startValueOfQtySelector = this.startValueOfQtySelector + (this.rows * this.columns) * 3;
                                createTable();
                                this.preventFromRemovingQtySelectorTable = true;
                            })
                        }
                        break;
                    case 'down':
                        if (iconClass.includes('One')) {
                            i.addEventListener('click', () => {
                                this.startValueOfQtySelector = Math.max(this.startValueOfQtySelector - (this.rows * this.columns), 1);
                                createTable();
                                this.preventFromRemovingQtySelectorTable = true;
                            })
                        } else if (iconClass.includes('Two')) {
                            i.addEventListener('click', () => {
                                this.startValueOfQtySelector = Math.max(this.startValueOfQtySelector - (this.rows * this.columns) * 2, 1);
                                createTable();
                                this.preventFromRemovingQtySelectorTable = true;
                            })
                        } else {
                            i.addEventListener('click', () => {
                                this.startValueOfQtySelector = Math.max(this.startValueOfQtySelector - (this.rows * this.columns) * 3, 1);
                                createTable();
                                this.preventFromRemovingQtySelectorTable = true;
                            })
                        }
                        break;
                }
            });
        }

        createNavigationIcon(
            ['CT-ArrowDownThreeLineSolid', 'CT-ArrowDownTwoLineSolid', 'CT-ArrowDownOneLineSolid'],
            downArrowDiv,
            'FtSe15',
            'down'
        );

        createNavigationIcon(
            ['CT-ArrowUpOneLineSolid', 'CT-ArrowUpTwoLineSolid', 'CT-ArrowUpThreeLineSolid'],
            upArrowDiv,
            'FtSe15',
            'up'
        );

        upDownArrowDiv.appendChild(downArrowDiv);
        upDownArrowDiv.appendChild(upArrowDiv);
        div.appendChild(upDownArrowDiv)

        // wrap table so it can quickly update or replace with new values
        let tableWrapper = document.createElement('div');

        const createTable = () => {
            tableWrapper.innerHTML = ''
            for (let i = 0; i < this.rows; i++) {
                let rowDiv = document.createElement('div');
                rowDiv.classList.add('DyFx')
                for (let j = 0; j < this.columns; j++) {
                    let button = document.createElement('button');
                    button.classList.add('Pg5')
                    button.style.width = `${100 / this.columns}%`;
                    button.innerText = this.startValueOfQtySelector + (i * this.columns) + j;
                    rowDiv.appendChild(button);

                    // when click on button value in the callback
                    if (this.limit >= parseInt(button.innerText)) {
                        button.addEventListener('click', () => {
                            this.callback(button.innerText);
                            this.preventFromRemovingQtySelectorTable = false;
                        })
                    } else {
                        // disable the button
                        button.disabled = true;
                    }

                }
                tableWrapper.appendChild(rowDiv)
            }

        }

        div.appendChild(tableWrapper);

        createTable()

        div.classList.add('PnAe', this.zIndex)

        return div;
    }

    getQtySelectorTableAbsolutePosition() {
        if (!this.qtySelectorTable || !this.qtyDisplayContainer) return;

        const updatePosition = () => {
            // Make sure elements exist
            if (!this.qtyDisplayContainer || !this.qtySelectorTable) {
                return;
            }

            // Get input element's position and dimensions
            const inputRect = this.qtyDisplayContainer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const scrollTop = window.scrollY;
            const scrollLeft = window.scrollX;

            // Get calendar dimensions
            const calendarHeight = this.qtySelectorTable.clientHeight;
            const calendarWidth = this.qtySelectorTable.clientWidth;

            // Set initial position to make the calendar visible for height calculation
            this.qtySelectorTable.style.display = 'block';

            // Calculate available space
            const spaceBelow = viewportHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const spaceRight = viewportWidth - inputRect.left;
            const offset = 5; // Reduced offset for closer positioning

            // Clear all positions first to avoid conflicts
            this.qtySelectorTable.style.top = 'auto';
            this.qtySelectorTable.style.bottom = 'auto';
            this.qtySelectorTable.style.left = 'auto';
            this.qtySelectorTable.style.right = 'auto';

            // Vertical positioning
            if (spaceBelow >= calendarHeight) {
                // Enough space below
                this.qtySelectorTable.style.top = `${inputRect.bottom + scrollTop + offset}px`;
            } else if (spaceAbove >= calendarHeight) {
                // Enough space above
                this.qtySelectorTable.style.top = `${inputRect.top + scrollTop - this.qtySelectorTable.offsetHeight - offset}px`;
            } else {
                // Not enough space either way - place where there's more space
                if (spaceBelow >= spaceAbove) {
                    this.qtySelectorTable.style.top = `${inputRect.bottom + scrollTop + offset}px`;
                } else {
                    this.qtySelectorTable.style.top = `${inputRect.top + scrollTop - this.qtySelectorTable.offsetHeight - offset}px`;
                }
            }

            // Horizontal positioning
            // Try to align with input field first
            if (inputRect.left + calendarWidth <= viewportWidth) {
                // Calendar fits when aligned with input left edge
                this.qtySelectorTable.style.left = `${inputRect.left}px`;
            } else if (inputRect.right - calendarWidth >= 0) {
                // Calendar fits when aligned with input right edge
                this.qtySelectorTable.style.left = `${inputRect.right - calendarWidth}px`;
            } else {
                // Center the calendar if it doesn't fit aligned with input
                const leftPosition = Math.max(0, Math.min(inputRect.left, viewportWidth - calendarWidth));
                this.qtySelectorTable.style.left = `${leftPosition}px`;
            }
            this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
        };

        // Run once immediately and then on animation frame
        this.requestAnimationFrameId = requestAnimationFrame(updatePosition);

        // Optional: Add resize listener to handle window resize
        if (!this.resizeListener) {
            this.resizeListener = () => {
                if (this.requestAnimationFrameId) {
                    cancelAnimationFrame(this.requestAnimationFrameId);
                }
                this.requestAnimationFrameId = requestAnimationFrame(updatePosition);
            };
            window.addEventListener('resize', this.resizeListener);
        }
    }

    removeQtySelectorTable() {
        document.addEventListener('click', (event) => {
            if (!this.qtyDisplayContainer.contains(event.target)) {
                if (!this.qtySelectorTable.contains(event.target)) {
                    this.preventFromRemovingQtySelectorTable = false;
                }
                if (document.body.contains(this.qtySelectorTable) && !this.preventFromRemovingQtySelectorTable) {
                    document.body.removeChild(this.qtySelectorTable);
                }
                if (this.requestAnimationFrameId) {
                    cancelAnimationFrame(this.requestAnimationFrameId)
                }
            }
        })
    }

    setWidth(div) {
        const screenWidth = window.innerWidth;

        if (screenWidth < 568) { // phone view
            div.style.minWidth = this.width.mobile;
        } else if (screenWidth < 768) { // tablet view
            div.style.minWidth = this.width.tablet;
        } else { // desktop or TV view
            div.style.minWidth = this.width.desktop;
        }
    }

}

class Index {
    constructor() {
        this.version = '1.0.0';
        this.name = 'Index';
    }

    // Function Starts
    CsFunc = new CsFunction();

    //On Load AddEvents
    EeFunc = this.CsFunc.AddEvent();

    //Copy
    CopyToClipboard(Ot, e) { this.CsFunc.CopyToClipboard(Ot, e); }

    //Animation 
    Animation = new Animation();

    // Accordion
    Accordion = new Accordion();
    CeAn(obj) { this.Accordion.create(obj); } /* Depricated CeAn */
    AdAn(obj) { this.Accordion.create(obj); }
    AeAn(obj) { this.Accordion.active(obj); }
    IeAn(obj) { this.Accordion.inActive(obj); }
    EeAn(obj) { this.Accordion.enable(obj); }
    DeAn(obj) { this.Accordion.disable(obj); }
    HeAn(obj) { this.Accordion.hide(obj); }
    UeAn(obj) { this.Accordion.unHide(obj); }
    ItAn() { this.Accordion.init() };

    //DropDown
    TlTpDpDn(Ot, e) { this.CsFunc.DropDown(Ot, e); }
    DropDown = new DropDown();

    //Toast 
    Toast = new Toast();
    CeTt(Obj) { this.Toast.showToast(Obj); }
    CeSgTt(Obj) { this.Toast.showStackingToast(Obj); }
    ItTt() { this.Toast.initToast() };

    // Slider
    Slider = new Slider();
    CeSr(Obj) { this.Slider.Slider(Obj); }
    CeIeSr(Obj) { this.Slider.infiniteSlider(Obj); }

    // Calendar
    Calendar = new Calendar();
    CeCr(Obj) { this.Calendar.ShowCalender(Obj); }
    ItCr() { this.Calendar.initAttributeBasedCalendar(); }

    //Gallery 
    Gallery = new Gallery();
    CeGy(id, images, layout) { this.Gallery.loadGallery(id, images, layout) };

    //Modal
    Modal = new Modal();
    CePp(Obj) { this.Modal.showModal(Obj); }
    ItCmMl(Obj) { this.Modal.initCustomModal(Obj) }
    CePpById(Obj) { this.Modal.closeModalById(Obj) }

    // MultiSelect Dropdown
    CeMiSt(Obj) { new MultiSelect(Obj); }

    // MultiSelect Dropdown
    CeKyPd(Obj) { new Keypad(Obj); }

    //Top Nav
    CsTopNav = new CsTopNav();
    ReAeTpSbSbLk() { this.CsTopNav.RemoveActiveTpSbSbLk(); }
    TpNvAe(ot) { this.CsTopNav.TopNavActive(ot); }

    //Tabs
    Tabs = new Tab();
    TbCt(ot) { this.Tabs.create(ot); }//TabCreate
    TbAe(ot) { this.Tabs.active(ot); }
    TbDe(ot) { this.Tabs.disable(ot); }
    TbHe(ot) { this.Tabs.hide(ot); }
    TbCk(ot) { this.Tabs.click(ot); }
    TbBnDy(ot) { this.Tabs.handleTabArrowVisibility(ot); }
    TbSlCk(ot, v) { this.Tabs.handleScrollByClick(ot, v); }
    TbSl(ot, v) { this.Tabs.handleScrollByMouseHold(ot, v); }

    //Suggestion
    AutoSuggestion = new AutoSuggestion();
    SnAd(ot) { this.AutoSuggestion.addSuggestion(ot); }
    SuggestionClose(inputId) { this.AutoSuggestion.suggestionClose(inputId); }
    SuggestionKeyPress(Ot, InputValStg, KeyCode) { this.AutoSuggestion.suggestionKeyPress(Ot, InputValStg, KeyCode); }
    SuggestionSelectKey(e, CallBack, Ot) { this.AutoSuggestion.suggestionSelectKey(Ot, e); }

    //Table 
    Table = new Table();
    CeTe(Obj) { this.Table.createTable(Obj); }
    ItTe(Obj) { this.Table.initDatatable(Obj); }

    //Text Editor
    TextEditor = new TextEditor();
    CeTtEr(Obj) { this.TextEditor.createEditor(Obj); }

    //Progress Bar 
    ProgressBar = new ProgressBar();
    CePsBr(obj) { return this.ProgressBar.dynamicProgressBar(obj) };

    //ToolTip - Order Matters so keep it at the end
    ToolTip = new ToolTip();
    CeTlTp(Obj) { this.ToolTip.init(Obj); }
    ItTlTp(Obj) { this.ToolTip.initAttributeBasedToolTip(Obj); }

    // Qty Selector
    CeQySr(obj) { new QtySelector(obj); }


    ItDgDp(Obj) {
        const dragAndDrop = new DragAndDrop();
        dragAndDrop.init(Obj);
    }
}

// Create an instance of the class
const CT = new Index();

// Export the instance for use in the browser or with a module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = CT;
}

//Always available on window object
window.CT = CT;