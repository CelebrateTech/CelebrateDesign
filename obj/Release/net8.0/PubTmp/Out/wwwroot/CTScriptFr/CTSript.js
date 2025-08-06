const ScrollManager = {
    ScrollInterval: null
};

class CsSuggestion {
    constructor() {
        this.version = '1.0.0.1';
    }

    AddSuggestion(Ot) {
        let ItId = Ot.ItId;
        let inputElement = document.getElementById(ItId);
        inputElement?.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {  // Instead of e.which === 9 - it is depricated
                this.SuggestionClose(ItId);
            }
        });

        inputElement?.addEventListener('keyup', (e) => {
            e.preventDefault();
            this.SuggestionKeyPress(Ot, inputElement.value, e.key);
        });
    }

    SuggestionKeyPress(Ot, InputValStg, KeyCode) {
        let ItId = Ot.ItId;
        switch (KeyCode) {
            case 38:
            case 40:
                //MoveDown();
                this.SuggestionNavigate(ItId + "_0");
                break;
            case 13:
                // Add Function To Select The top 1 Suggestion By Default.
                break;
            default:
                this.Suggestion(Ot, InputValStg);
                break;
        }
    }

    Suggestion(Ot, InputValStg) {

        let { TeMnLr, ItId, URL, URLAt: UrlArgument } = Ot;

        if (!Ot.SnLtCnCs) {
            Ot.SnLtCnCs = "FtSz18 FtWt600";
        }
        if (!Ot.SnLtCyCs) {
            Ot.SnLtCyCs = "FtSz18 FtWt600 HrCrTe CrBdTe BrBm1_Cr CrBrTe20Lt50  BrRs2 Pg10";
        }
        if (!Ot.SnLtDnCs) {
            Ot.SnLtDnCs = "FtSz12";
        }

        // Check If the Minimum Character typed for search
        if (InputValStg.length > TeMnLr) {
            /*Check Data To Be Obtained From Url Or Client is Providing Json Array*/
            if (Ot.URL) {
                var GetURL = `${URL}?term=${InputValStg}`;

                // Adds Addition Parameter To Be Passed In URL
                for (let ArgName in UrlArgument) {
                    if (UrlArgument.hasOwnProperty(ArgName)) {
                        let Id = UrlArgument[ArgName];
                        let val = document.getElementById(Id).value;
                        GetURL = GetURL + `&${ArgName}=${val}`
                    }
                }

                fetch(GetURL)
                    .then(response => response.json())
                    .then(data => {
                        //if suggestion is found then show it else show nothing found div
                        this.SuggestionContainer(data, Ot);
                    });
            }
            else if (Ot.SeAy) {
                //find the data 
                let data = Ot.SeAy.filter(item => item.SnLtCnTt.toLowerCase().includes(InputValStg.toLowerCase()));
                this.SuggestionContainer(data, Ot);
            }

        }
        else {
            const div = document.createElement('div');
            var NoSuggestionMsg = `Type Minimum ${TeMnLr + 1} Letter`;
            var SuggestionInfo = `<div class="DyFx Pg3 BrBm1_Cr CrBrTe20Lt50 HrCrTe BrRs2">
                                                       <div class="DyFx FxDnCn  FxGw1 Pg5">
                                                       <div class="FtSz18 FtWt600 "> <i class="CT-GearLine AnReIe"></i> ${NoSuggestionMsg} </div>
                                                       </div>
                                                       </div>`;

            div.insertAdjacentHTML('beforeend', SuggestionInfo);
            this.AddSuggestionBox(ItId, div);
        }
    }

    SuggestionContainer(data, Ot) {
        var SuggestionBox = document.createElement('div');
        var ItId = Ot.ItId;
        var ClBkFn = Ot.ClBkFn;
        var ShCy = Ot.ShCy || false;
        if (data.length > 0) {
            // Loop the suggestion if category is not present ie Category ==False
            if (ShCy == false) {
                for (i = 0; i < data.length; i++) {
                    var ListItem = document.createElement('div');
                    ListItem.setAttribute('id', ItId + '_' + i);
                    ListItem.setAttribute('tabindex', i);


                    // Get Html of Suggestion From the function
                    ListItem.innerHTML = this.SuggestionHTML(Ot, data[i]);

                    ListItem.addEventListener('click', function (event) {
                        document.getElementById(ItId).value = event.currentTarget.SnItTt;
                        CT.SuggestionClose(ItId);
                        if (ClBkFn != null || ClBkFn != undefined) {
                            ClBkFn(event);
                        }
                    }, false);
                    ListItem.addEventListener('keydown', function (e) { CT.SuggestionSelectKey(e, ClBkFn, Ot); }, false);
                    ListItem.InputID = ItId;
                    ListItem.SnItId = data[i].SnItId;
                    ListItem.SnLtCnTt = data[i].SnLtCnTt;
                    ListItem.SnItTt = data[i].SnItTt;
                    ListItem.Ot = data[i].Ot;

                    if (i === (data.length - 1)) { ListItem.Next = ItId + '_' + (data.length - 1); }
                    else {
                        var n = i + 1;
                        ListItem.Next = ItId + '_' + n;
                    }
                    if (i === 0) { ListItem.Prev = ItId + '_' + 0; }
                    else {
                        var p = i - 1;
                        ListItem.Prev = ItId + '_' + p;
                    }
                    SuggestionBox.appendChild(ListItem);

                }
                this.AddSuggestionBox(ItId, SuggestionBox);
                return true;
            }
            else {
                // Set The Counter 
                var i = 0;
                // Group by 'SnLtCyTt' field
                const groupedData = data.reduce((group, item) => {
                    const { SnLtCyTt } = item;
                    if (!group[SnLtCyTt]) {
                        group[SnLtCyTt] = [];
                    }
                    group[SnLtCyTt].push(item);
                    return group;
                }, {});

                var CategorySnDv = document.createElement('div');
                CategorySnDv.classList.add("DyFx", "FxDnCn", "BxSwCrGy", "BrRs2", "Wh100p");

                // Get group names (keys) as an array
                const groupNames = Object.keys(groupedData);

                // for loop to iterate over group names
                for (let k = 0; k < groupNames.length; k++) {
                    const groupName = groupNames[k];
                    var CategoryCrDv = document.createElement('div');
                    var CategoryHTML;
                    // User Customized HTML Usage
                    if (Ot.SnLtCyHTML != undefined && Ot.SnLtCyHTML != null) {
                        CategoryHTML = Ot.SnLtCyHTML.replace('--Category', groupName);
                    }
                    else {
                        CategoryHTML = `<div class="DyFx PnAe PnTp0">
                                                    <div class="DyFx FxDnCn  FxGw1">
                                                        <div class="${Ot.SnLtCyCs} "> ${groupName} </div>
                                                    </div>
                                        </div>`;
                    }

                    CategoryCrDv.innerHTML = CategoryHTML;
                    //
                    // Get the members of the current group
                    const members = groupedData[groupName];

                    // for loop to iterate over members
                    for (let j = 0; j < members.length; j++) {
                        var ListItem = document.createElement('div');
                        ListItem.setAttribute('id', ItId + '_' + i);
                        ListItem.setAttribute('tabindex', i);
                        // Get Html of Suggestion From the function
                        ListItem.innerHTML = this.SuggestionHTML(Ot, members[j]);
                        ListItem.addEventListener('click', function (event) {
                            document.getElementById(ItId).value = event.currentTarget.SnItTt;
                            CT.SuggestionClose(ItId);
                            if (ClBkFn != null || ClBkFn != undefined) {
                                ClBkFn(event);
                            }
                        }, false);


                        ListItem.addEventListener('keydown', function (e) { CT.SuggestionSelectKey(e, ClBkFn, Ot); }, false);
                        ListItem.InputID = ItId;
                        ListItem.SnItId = members[j].SnItId;
                        ListItem.SnLtCnTt = members[j].SnLtCnTt;
                        ListItem.SnItTt = members[j].SnItTt;
                        ListItem.Ot = data[i].Ot;

                        if (i === (data.length - 1)) { ListItem.Next = ItId + '_' + (data.length - 1); }
                        else {
                            var n = i + 1;
                            ListItem.Next = ItId + '_' + n;
                        }
                        if (i === 0) { ListItem.Prev = ItId + '_' + 0; }
                        else {
                            var p = i - 1;
                            ListItem.Prev = ItId + '_' + p;
                        }
                        CategoryCrDv.appendChild(ListItem);
                        // SuggestionBox.appendChild(ListItem);

                        i++;
                    }

                    //Category wise Child Items
                    CategorySnDv.appendChild(CategoryCrDv);
                }


                this.AddSuggestionBox(ItId, CategorySnDv);
            }
        }
        else {

            const div = document.createElement('div');
            var NoSuggestionMsg = 'No Suggestions Found';
            var SuggestionInfo = `<div class="DyFx Pg3 BrBm1_Cr CrBrTe20Lt50 HrCrTe BrRs2">
                                                       <div class="DyFx FxDnCn  FxGw1 Pg5">
                                                       <div class="FtSz18 FtWt600 "> ${NoSuggestionMsg} </div>
                                                       </div>
                                                       </div>`
            div.insertAdjacentHTML('beforeend', SuggestionInfo);
            this.AddSuggestionBox(ItId, div);
        }
    }

    SuggestionHTML(Ot, data) {
        var html;
        var SnLtInCs = data.SnLtInCs;
        var SnLtCnTt = data.SnLtCnTt;
        var SnLtDnTt = data.SnLtDnTt;
        var SnLtCnCs = Ot.SnLtCnCs;
        var SnLtDnCs = Ot.SnLtDnCs;


        if (Ot.SnLtHTML == undefined && Ot.SnLtHTML == null) {
            if (SnLtCnTt != undefined && SnLtDnTt == undefined && SnLtInCs == undefined) {
                html = `<div class="DyFx Pg3 BrBm1_Cr CrBrTe20Lt50 HrCrTe BrRs2">
                                <div class="DyFx FxDnCn  FxGw1 Pg5">
                                <div class="${SnLtCnCs}"> ${SnLtCnTt} </div>
                                </div>
                             </div>`;

            }
            else if (SnLtCnTt != undefined && SnLtDnTt != undefined && SnLtInCs == undefined) {
                html = `<div class="DyFx Pg3 BrBm1_Cr CrBrTe20Lt50 HrCrTe BrRs2">
                                <div class="DyFx FxDnCn  FxGw1 Pg5">
                                    <div class="${SnLtCnCs}"> ${SnLtCnTt} </div>
                                    <div class="${SnLtDnCs}"> ${SnLtDnTt} </div>
                                </div>
                              </div>`;
            }

            else if (SnLtCnTt != undefined && SnLtDnTt == undefined && SnLtInCs != undefined) {
                html = `<div class="DyFx Pg3 BrBm1_Cr CrBrTe20Lt50 HrCrTe BrRs2">
                            <div class="DyFx FxJyCtCr FxAnImCr FtSz20 PgLtRt5"> <i class=${SnLtInCs}></i></div>
                            <div class="DyFx FxDnCn  FxGw1 Pg5">
                                <div class="${SnLtCnCs}"> ${SnLtCnTt} </div></div>
                            </div>
                            </div>`;
            }

            else if (SnLtCnTt != undefined && SnLtDnTt != undefined && SnLtInCs != undefined) {
                html = `<div class="DyFx Pg3 BrBm1_Cr CrBrTe20Lt50 HrCrTe BrRs2">
                                <div class="DyFx FxJyCtCr FxAnImCr FtSz20 PgLtRt5">
                                        <i class=${SnLtInCs}></i>
                                </div>
                                <div class="DyFx FxDnCn  FxGw1 Pg5">
                                    <div class="${SnLtCnCs}"> ${SnLtCnTt} </div>
                                    <div class="${SnLtDnCs}"> ${SnLtDnTt} </div>
                                </div>
                            </div>`;
            }
        }
        else {


            if (SnLtCnTt != undefined && SnLtDnTt == undefined && SnLtInCs == undefined) {

                html = Ot.SnLtHTML.replace('--Icon', SnLtInCs);

            }
            else if (SnLtCnTt != undefined && SnLtDnTt != undefined && SnLtInCs == undefined) {
                html = Ot.SnLtHTML.replace('--Caption', SnLtCnTt).replace('--Description', SnLtDnTt);

            }

            else if (SnLtCnTt != undefined && SnLtDnTt == undefined && SnLtInCs != undefined) {
                html = Ot.SnLtHTML.replace('--Icon', SnLtInCs).replace('--Caption', SnLtCnTt);

            }

            else if (SnLtCnTt != undefined && SnLtDnTt != undefined && SnLtInCs != undefined) {
                html = Ot.SnLtHTML.replace('--Icon', SnLtInCs).replace('--Caption', SnLtCnTt).replace('--Description', SnLtDnTt);
            }
        }
        return html;
    }

    SuggestionSelectKey(event, ClBkFn, Ot) {
        //To Stop Page Scroll Results from arrow key and Form Submission from Enter Key
        event.preventDefault();
        var index = parseInt(event.target.getAttribute('tabindex'));
        var keycode = event.which;

        switch (keycode) {
            case 38:
                //MoveUp
                this.SuggestionNavigate(event.target.Prev);
                break;
            case 40:
                //MoveDown;
                index = index + 1;
                this.SuggestionNavigate(event.target.Next);
                break;
            case 13:
                this.SelectSuggestion(event, Ot);
                break;
        }
    }

    SelectSuggestion(event, Ot) {
        var id = Ot.ItId;
        this.SuggestionClose(id);
        document.getElementById(id).value = event.currentTarget.SnItTt;
        if (Ot.ClBkFn != null || Ot.ClBkFn != undefined) {
            Ot.ClBkFn(event);
        }
    }

    SuggestionNavigate(NavID) {
        var active = document.getElementsByClassName('SeAe');
        for (i = 0; i < active.length; i++) {
            active[i].classList.remove('SeAe');
        }
        try {
            var suggestItem = document.getElementById(NavID);
            suggestItem.classList.add('SeAe');
            suggestItem.focus();
        }
        catch (e) { }
    }

    SuggestionClose(InputId) {
        var oldSBox = document.getElementById(InputId + "SBoxUT");
        if (oldSBox != null) {
            oldSBox.remove();
        }
        document.body.removeAttribute('onclick');

    }

    AddSuggestionBox(InputId, Suggestion) {
        // Close any old suggestion box present
        this.SuggestionClose(InputId);

        const displaySuggestionDiv = document.createElement('div');

        const inputParentElement = document.getElementById(InputId)?.parentElement;

        if (!inputParentElement) return;

        inputParentElement.classList.add('PnRe');
        
        displaySuggestionDiv.classList.add("CrBdWe", "BrRs5", "DyBk", "PnAe", "WhMn40p", "ZIx10000000000", "PnTp100p");
        displaySuggestionDiv.setAttribute('id', InputId + 'SBoxUT');

        const SuggestBox = document.createElement('div');
        SuggestBox.classList.add("CrBdWe", "BrRs5", 'BxSwFgCrGy', 'OwYAo', 'Wh100p', 'HtMx35vh');
        SuggestBox.appendChild(Suggestion);
        displaySuggestionDiv.appendChild(SuggestBox);
        inputParentElement.appendChild(displaySuggestionDiv);

        // Adding event to close the suggestion box on body click, but not on the suggestion box itself
        document.addEventListener('click', function handleClickOutside(event) {
            const suggestionBox = document.getElementById(InputId + 'SBoxUT');
            const inputElement = document.getElementById(InputId);
            if (suggestionBox && !suggestionBox.contains(event.target) && !inputElement.contains(event.target)) {
                this.SuggestionClose(InputId);
                document.removeEventListener('click', handleClickOutside);
            }
        }.bind(this));
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

                console.log(SubSubLinkSn.length);
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

            //Ends //Opening Up The User Default Pre Active Links On the Page Load
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
            console.error("Element with ID '" + ID + "' not found.");
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

class CsAccordion {
    constructor() {
        this.version = '1.0.0';
        this.ActivateAccordions();
    }

    ActivateAccordions() {

        // Accordion Sections
        var AnSn = document.getElementsByClassName('AnSn');

        for (var i = 0; i < AnSn.length; i++) {

            //Set number on Accordion Section
            AnSn[i].setAttribute("AnSn", i);

            //Get all the Accordion Container 
            var AnCrElements = AnSn[i].querySelectorAll(".AnCr");

            for (var j = 0; j < AnCrElements.length; j++) {
                //Set number on Container
                AnCrElements[j].setAttribute("AnSn", i);
                AnCrElements[j].setAttribute("AnCr", j);

                AnCrElements[j].getElementsByClassName("AnCrHr")[0].setAttribute("AnSn", i);
                AnCrElements[j].getElementsByClassName("AnCrPl")[0].setAttribute("AnSn", i);
                AnCrElements[j].getElementsByClassName("AnCrHr")[0].setAttribute("AnCr", j);
                AnCrElements[j].getElementsByClassName("AnCrPl")[0].setAttribute("AnCr", j);

                //Set Attribute on Container's Child Elements
                var CrHr = AnCrElements[j].getElementsByClassName('AnCrHr')[0];
                var CrPl = AnCrElements[j].getElementsByClassName('AnCrPl')[0];
                CrHr.setAttribute("AnCrHr", j);
                CrPl.setAttribute("AnCrPl", j);

                // By Default Open Accordion Panel [ contain Class "AnAe" in its AnCr class ]
                this.openOneDefaultAccordion(AnCrElements);

                // By Default Open All Accordion Panel [ contain Class "AnOnAl" in its AnSn Class ]
                this.openAllAccordion(AnCrElements);

                // These Accordion can't be opened ever [ contain Class "Cr-RNtAd" in its AnCr Class ]
                if (AnCrElements[j].classList.contains("Cr-rNtAd")) {
                    this.accordionNotOpen(AnCrElements[j]);
                }

                // Add Event Listener on Container's Header
                CrHr.addEventListener('click', function (e) {

                    var SnNo = this.getAttribute('AnSn');
                    var CrNo = this.getAttribute('AnCr');

                    var AnSnCu = document.querySelector("[AnSn='" + SnNo + "']"); // whole according section
                    var AnCrCu = AnSnCu.querySelector("[AnCr='" + CrNo + "']"); // accordion container

                    if (AnSnCu.classList.contains("AnSnOnAl")) { // We can Open multiple accordion without closing previous on

                        //if accordion is open 
                        if (AnCrCu.getElementsByClassName('AnCrPl')[0].scrollHeight + "px" == AnCrCu.getElementsByClassName('AnCrPl')[0].style.maxHeight) {

                            //close this accordion 
                            AnCrCu.getElementsByClassName('AnCrPl')[0].style.maxHeight = 0;

                            //remove up arrow icon 
                            AnCrCu.getElementsByClassName('AnIn')[0].classList.remove('AnAeIn');

                        } else {

                            //add up arrow icon 
                            AnCrCu.getElementsByClassName('AnIn')[0].classList.add('AnAeIn');

                            //add height to this accordion 
                            AnCrCu.getElementsByClassName('AnCrPl')[0].style.maxHeight = AnCrCu.getElementsByClassName('AnCrPl')[0].scrollHeight + "px";

                        }

                    } else {

                        var Allpanels = AnSnCu.getElementsByClassName("AnCrPl");
                        var AnIn = AnSnCu.getElementsByClassName('AnIn');
                        var clickedPanel = AnCrCu.getElementsByClassName('AnCrPl')[0];
                        let height = window.getComputedStyle(clickedPanel).maxHeight;

                        for (var k = 0; k < Allpanels.length; k++) {
                            Allpanels[k].style.maxHeight = 0; // close all panel 
                            AnIn[k].classList.remove('AnAeIn'); // remove up arrow icon
                        }


                        //if click on the open panel then it close 
                        if (height != '0px') return;

                        //open this panel 
                        AnCrCu.getElementsByClassName('AnCrPl')[0].style.maxHeight = AnCrCu.getElementsByClassName('AnCrPl')[0].scrollHeight + "px";

                        //add up arrow icon 
                        AnCrCu.getElementsByClassName('AnIn')[0].classList.add('AnAeIn');

                    }

                });

            }

        }
    }

    //By Default Close Some Panel of Accordion Container [With class 'Cr-rNtAd']
    accordionNotOpen(AnCtCr) {
        AnCtCr.addEventListener('click', function () {

            var AnIn = AnCtCr.getElementsByClassName('AnIn')[0];

            //if panel is open 
            if (AnCtCr.getElementsByClassName('AnCrPl')[0].scrollHeight + "px" == AnCtCr.getElementsByClassName('AnCrPl')[0].style.maxHeight) {

                //close this panel
                AnCtCr.getElementsByClassName('AnCrPl')[0].style.maxHeight = 0;
            }

            //remove up arrow icon 
            if (AnIn.classList.contains('AnAeIn')) {
                AnIn.classList.remove('AnAeIn');
            }

        });

    }

    // By Default Open One Panel of Accordion Container 
    openOneDefaultAccordion(ReAnAe) {

        for (var i = 0; i < ReAnAe.length; i++) {
            var activePanel = ReAnAe[i];

            if (activePanel.classList.contains("AnAe")) { // Active 

                //Add height; 
                activePanel.getElementsByClassName('AnCrPl')[0].style.maxHeight = activePanel.getElementsByClassName('AnCrPl')[0].scrollHeight + "px";

                //Use Up Arrow Icon 
                activePanel.getElementsByClassName('AnIn')[0].classList.add('AnAeIn');

            } else { // Not Active
                activePanel.addEventListener('click', function () {

                    // Remove Active Class from all others Except this
                    for (var j = 0; j < ReAnAe.length; j++) {
                        if (ReAnAe[j] !== this) {
                            ReAnAe[j].classList.remove('AnAe');
                        }
                    }

                });
            }
        }

    }

    //By Default Open All Panel of Accordion Container
    openAllAccordion(AnCrEt) {
        for (var i = 0; i < AnCrEt.length; i++) {
            var currentAccordion = AnCrEt[i];

            //if parent contains accordion open all class 
            if (currentAccordion.parentElement.classList.contains("AnOnAl")) {

                //Add height 
                currentAccordion.getElementsByClassName('AnCrPl')[0].style.maxHeight = currentAccordion.getElementsByClassName('AnCrPl')[0].scrollHeight + "px";

                //Use Up arrow icon 
                currentAccordion.getElementsByClassName('AnIn')[0].classList.add('AnAeIn');

            } else {
                currentAccordion.addEventListener('click', function () {
                    for (var j = 0; j < AnCrEt.length; j++) {

                        //Revove Accordion open all class form others Except this 
                        if (AnCrEt[j] !== this) {
                            AnCrEt[j].parentElement.classList.remove('AnOnAl');
                        }

                    }
                });
            }
        }
    }


}

class CsTab {
    constructor() {
        this.version = '1.0.0';
    }

    TabCT(TabOt) {
        let Tab = JSON.parse(JSON.stringify(TabOt));
        var TabId = Tab.Id;
        let TabLinksContainerId = Tab.Id + 'Lk';
        let TabActiveInt = Tab.Active;
        let TabDisableAryInt = Tab.Disable;
        let TabHideAryInt = Tab.Hide;
        let TabNavLinkHeightPx = 28;
        let TabNavWidthPercent = 20;
        let TabContainer = document.getElementById(TabId + 'Cr');
        let TabsContentDiv = document.getElementById(TabId + 'Ct');
        //Assigning the default Values
        let TabNavAlign = "Top";
        let TabNavScroll = 'Y';

        if (Tab.NavScroll) { TabNavScroll = Tab.NavScroll; }
        if (Tab.NavAlign) { TabNavAlign = Tab.NavAlign; }
        if (Tab.NavLinkHeightPx) { TabNavLinkHeightPx = Tab.NavLinkHeightPx; }
        if (Tab.NavWidthPercent) { TabNavWidthPercent = Tab.NavWidthPercent; }

        //Add Classes to Container Div//
        if (!TabContainer.classList.contains('DyFx')) {
            TabContainer.classList.add('DyFx');
        }

        switch (TabNavAlign) {
            case 'Top':
                TabContainer.classList.add('FxDnCn');
                break;
            case 'Bottom':
                TabContainer.classList.add('FxDnCnRe');
                break;
            case 'Right':
                TabContainer.classList.add('FxDnRwRe');
                break;
            default: // 'Left':
                TabContainer.classList.add('FxDnRw');
                break;
        }

        let TabLinksContainer = document.getElementById(TabLinksContainerId);

        let wrapper = document.createElement('div');
        wrapper.setAttribute('id', TabLinksContainerId)
        wrapper.innerHTML = TabLinksContainer.innerHTML;
        TabLinksContainer.innerHTML = "";
        TabLinksContainer.appendChild(wrapper);
        TabLinksContainer.setAttribute('id', TabLinksContainerId + 'Parent');

        let _TabLinksContainer = document.getElementById(TabLinksContainerId);
        _TabLinksContainer.classList.add("CTabs");

        // If the tabs Nav are change to left or right then the flex direction changed
        // TabLink Div Width and Tab Content Width are decided
        if (TabNavAlign == 'Left' || TabNavAlign == 'Right') {
            _TabLinksContainer.classList.add("FxDnCn");
            //Tabs Content Width To Fill THe Empty Space
            TabsContentDiv.classList.add('FxGw1');
            // Tabs Link Div Have the width That user passes
            TabLinksContainer.style.minWidth = parseFloat(TabNavWidthPercent) + '%';
        }

        let tablink = _TabLinksContainer.children;
        let tabcontent = [];

        Array.from(tablink).forEach((link, i) => {
            // Get the content tab element
            const contentTab = document.getElementById(`${TabId}Ct${i}`);
            tabcontent.push(contentTab);

            // Configure tab link styles and attributes
            link.style.height = `${TabNavLinkHeightPx}px`;
            link.setAttribute("id", `${TabId}${i}`);
            link.setAttribute("Num", i);
            link.addEventListener('click', (e) => {
                Tab.Click = e.currentTarget.getAttribute('num');
                CT.TbCk(Tab);
            });

            // Add alignment class if needed
            if (TabNavAlign === 'Top' || TabNavAlign === 'Bottom') {
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
            if (TabActiveInt === i) {
                tablink[0].classList.remove('CTabActive');
                link.classList.add('CTabActive');
                tabcontent[0].style.display = 'none';
                contentTab.style.display = 'block';
            }
        });

        // Check if methods exist before calling them
        if (typeof this?.TabCTDisable === 'function') {
            this.TabCTDisable(Tab);
        }

        if (typeof this?.TabCTHide === 'function') {
            this.TabCTHide(Tab);
        }

        // Scrolling Funcitonality
        if (TabNavScroll == 'Y' && (TabNavAlign == 'Top' || TabNavAlign == 'Bottom')) {

            let TabLinkParent = document.getElementById(TabLinksContainerId + 'Parent');

            //Relative: To set next and prev button 
            TabLinkParent.classList.add('PnRe');

            // Let the browser complete rendering
            requestAnimationFrame(() => {

                // Add Next and Prev Buttons 
                let { arrowLt, arrowRt } = this.addNavScrollButtons({ _TabLinksContainer, TabLinksContainerId, TabLinkParent, Tab });

                // show or hide button 
                this.showHidePrevNextButton({ _TabLinksContainer, TabLinkParent, arrowLt, arrowRt });

                // Resizing: show or hide button 
                window.addEventListener('resize', () => {
                    this.showHidePrevNextButton({ _TabLinksContainer, TabLinkParent, arrowLt, arrowRt });
                })

            });
        }
    }

    showHidePrevNextButton(obj) {
        let { _TabLinksContainer, TabLinkParent, arrowLt, arrowRt } = obj;
        let scrollWidth = _TabLinksContainer.scrollWidth;
        let clientWidth = TabLinkParent.clientWidth;
        if (clientWidth < scrollWidth) {
            arrowLt.style.display = 'flex';
            arrowRt.style.display = 'flex';
        } else {
            arrowLt.style.display = 'none';
            arrowRt.style.display = 'none';
        }
    }

    addNavScrollButtons(obj) {
        let { _TabLinksContainer, TabLinksContainerId, TabLinkParent, Tab } = obj;
        //Left Arrow Button
        let arrowLt = document.createElement('div');
        arrowLt.classList.add('CTabScrollBnLt');
        arrowLt.style.display = 'none';
        arrowLt.setAttribute('id', TabLinksContainerId + 'ArLt');
        arrowLt.innerHTML = '<div class="CTabBn "><div class="CTabBnLt"></div></div>';

        //Right Arrow Button 
        let arrowRt = document.createElement('div');
        arrowRt.classList.add('CTabScrollBnRt');
        arrowRt.style.display = 'none';
        arrowRt.setAttribute('id', TabLinksContainerId + 'ArRt');
        arrowRt.innerHTML = '<div class="CTabBn "><div class="CTabBnRt"></div></div>';

        //Append Buttons 
        TabLinkParent.appendChild(arrowLt);
        TabLinkParent.appendChild(arrowRt);

        //Add Event Listeners
        arrowLt.addEventListener('click', function () {
            CT.TbSlCk(Tab, 'Left')
        });
        arrowRt.addEventListener('click', function () {
            CT.TbSlCk(Tab, 'Right')
        });
        arrowLt.addEventListener('mousedown', function () {
            CT.TbSl(Tab, 'Left')
        });

        arrowRt.addEventListener('mousedown', function () {
            CT.TbSl(Tab, 'Right')
        });
        arrowLt.addEventListener('mouseup', function () {
            clearInterval(ScrollManager.ScrollInterval);
        });

        arrowRt.addEventListener('mouseup', function () {
            clearInterval(ScrollManager.ScrollInterval);
        });

        arrowLt.addEventListener('mouseleave', function () {
            clearInterval(ScrollManager.ScrollInterval);
        });

        arrowRt.addEventListener('mouseleave', function () {
            clearInterval(ScrollManager.ScrollInterval);
        });

        _TabLinksContainer.addEventListener("scroll", (event) => {
            CT.TbBnDy(Tab);
        });

        return { arrowLt, arrowRt };
    }

    TabCTActive(Tab) {
        var TabId = Tab.Id;
        var TabActiveInt = Tab.Active;

        var TabLinkIdStg = TabId + 'Lk';
        var TablinkId = document.getElementById(TabLinkIdStg);
        TablinkId.classList.add("CTabs");
        var tablink = TablinkId.children;
        //let TabClickFnName = 'TabClick' + TabId;
        //tablink[TabActiveInt].setAttribute('onclick', `CT.TbCk({Id:'${TabId}', Click:${TabActiveInt}})`);
        //tablink[TabActiveInt].addEventListener('click', this[TabClickFnName]);

        var tabcontent = [];
        for (var i = 0; i < tablink.length; i++) {

            //Adds TabContent
            var getContentTab = document.getElementById(TabId + "Ct" + i);
            tabcontent.push(getContentTab);

            //Hide All TabContent First
            tabcontent[i].style.display = 'none'
            if (tablink[i].classList.contains('CTabActive')) {
                tablink[i].classList.remove('CTabActive');
            }

            if (TabActiveInt === i) {
                if (tablink[i].classList.contains('CTabDeactive')) {
                    tablink[i].classList.remove('CTabDeactive');
                }
                tablink[i].classList.add('CTabActive');
                tablink[i].style.display = 'flex';
                if (tablink[i].hasAttribute('Dd')) { tablink[i].removeAttribute('Dd'); }
                tabcontent[i].style.display = 'block';
            }

        }
    }

    TabCTDisable(Tab) {
        var TabDisableInt = Tab.Disable;
        var TabId = Tab.Id;
        //let TabClickFnName = 'TabClick' + TabId;
        //let tabClickFn = this[TabClickFnName];
        for (var i = 0; i < TabDisableInt.length; i++) {
            var tabId = TabId + TabDisableInt[i];
            var tab = document.getElementById(tabId);
            // Remove the event listener using the captured this context
            //tab.removeEventListener('click', tabClickFn); Not Working As of Now
            document.getElementById(TabId + "Ct" + TabDisableInt[i]).style.display = "none";
            if (tab.classList.contains("CTabActive")) {
                tab.classList.remove('CTabActive');
            }
            tab.classList.add('CTabDeactive');
            tab.setAttribute("Dd", "");
        }
    }

    TabCTClick(Tab) {

        var TabId = Tab.Id;
        var ClickedTabIdStg = Tab.Id + Tab.Click;
        var clickedtab = document.getElementById(ClickedTabIdStg);

        if (!clickedtab.hasAttribute('Dd')) {

            var tablink = document.getElementById(TabId + "Lk").children;
            var tabcontent = [];
            for (var i = 0; i < tablink.length; i++) {

                //Adds TabContent
                var getContentTab = document.getElementById(TabId + "Ct" + i);
                tabcontent.push(getContentTab);
            }
            for (var i = 0; i < tablink.length; i++) {
                try { tabcontent[i].style.display = 'none'; }
                catch { }
                try {
                    tablink[i].classList.remove("CTabActive");
                }
                catch { }
            }
            clickedtab.classList.add("CTabActive");
            tabcontent[clickedtab.getAttribute("Num")].style.display = "block";

            ///Start Execute  CallBack Function On the Base Of Clicked tab
            if (Tab.ClBkFn) {
                if (Tab.ClBkFn.hasOwnProperty(Tab.Click)) {

                    Tab.ClBkFn[Tab.Click]();
                }
            }
            ///End Execute  CallBack Function On the Base Of Clicked tab
        }
    }

    TabCTHide(Tab) {
        var TabId = Tab.Id;
        var TabHideAryInt = Tab.Hide;
        for (var i = 0; i < TabHideAryInt.length; i++) {
            var tabId = TabId + TabHideAryInt[i];
            var tab = document.getElementById(tabId);
            document.getElementById(TabId + "Ct" + TabHideAryInt[i]).style.display = "none";
            tab.style.display = "none";
            if (tab.classList.contains("CTabActive")) {
                tab.classList.remove('CTabActive');
            }
        }
    }

    TabCTScrollBarInfo(element, dir) {
        dir = (dir === 'vertical') ? 'scrollTop' : 'scrollLeft';
        var res = !!element[dir];
        if (!res) {
            element[dir] = 1;
            res = !!element[dir];
            element[dir] = 0;
        }
        return res;
    }

    TabCTScrollButton(Tab) {
        var div = document.getElementById(Tab.Id + 'LkParent');
        var hs = this.TabCTScrollBarInfo(div, 'horizontal');
        var vs = this.TabCTScrollBarInfo(div, 'vertical');
    }

    TabCTScroll(Tab, Direction) {
        ScrollManager.ScrollInterval = setInterval(function () {
            if (Direction == 'Right') {
                document.getElementById(Tab.Id + 'Lk').scrollLeft += 1;
            }
            else if (Direction == 'Left') {
                document.getElementById(Tab.Id + 'Lk').scrollLeft -= 1;
            }
        }, 5);
    }

    TabCTScrollClick(Tab, Direction) {
        if (Direction == 'Right') {
            document.getElementById(Tab.Id + 'Lk').scrollLeft += 25;
        }
        if (Direction == 'Left') {
            document.getElementById(Tab.Id + 'Lk').scrollLeft -= 25;
        }
    }

    // Decide When To Hide Scroll Button and Remove Scroll Interval
    TabCTButtonDisplay(Tab) {
        let TabLinkIdStg = Tab.Id + 'Lk';
        let TabsWidth = document.getElementById(TabLinkIdStg + 'Parent').clientWidth;
        let TabsLinkScroll = document.getElementById(TabLinkIdStg).scrollLeft;
        let arrowLeft = document.getElementById(TabLinkIdStg + 'ArLt');
        let arrowRight = document.getElementById(TabLinkIdStg + 'ArRt');
        let TabsLinkScrollWidth = document.getElementById(TabLinkIdStg).scrollWidth;

        // Hide Left Arrow 5 Pixel Before
        if (TabsLinkScroll <= 5) {
            clearInterval(ScrollManager.ScrollInterval);
            arrowLeft.classList.add('DyNe');
        }
        else if (TabsLinkScroll >= 5) {
            arrowLeft.classList.remove('DyNe');
            // Hide Right Arrow 5 pixel Before the scroll Reach The End
            if ((TabsLinkScroll + TabsWidth + 5) >= TabsLinkScrollWidth) {
                clearInterval(ScrollManager.ScrollInterval);
                arrowRight.classList.add('DyNe');
            }
            else {
                arrowRight.classList.remove('DyNe');
            }
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

    initToast() {

        // get all toaster from the dom
        let toasters = document.getElementsByClassName('ToastCT');

        Array.from(toasters).forEach((toast, index) => {

            // setting unique attribute to indentify particular toast
            toast.setAttribute('toast-number', index);

            // Initially hide all the toast 
            toast.classList.add('DyNe');

        });

    }

    showToast(obj) {
        // get all toaster in the dom
        let toast = document.getElementById(obj.id);

        let dontShow = this.handleDontShowAgainHelper(toast); // return boolean

        if (dontShow) return;

        toast.setAttribute('class', obj.classes.toastCT);

        //clear timeout first
        if (obj.timeout) {
            clearTimeout(obj.timeout);
            obj.timeout = null;
        }

        if (obj.closeBtn) {
            this.handleCloseBtn(obj, toast);
        }

        if (obj.autoClose > 0) {
            this.autoClose(obj, toast);
        }

        if (obj.initialRender) { // only first time attach evenListener
            this.handleDontShowAgain(toast);
            this.handleSuccessFailBtn(obj, toast);
            obj.initialRender = false;
        }

    }

    handleCloseBtn(obj, toast) {

        const toastHeadingContainer = toast.getElementsByClassName('ToastHeadingContainer')[0];
        const checkCloseBtnExist = toastHeadingContainer.getElementsByClassName("ToastCloseBtn");

        if (checkCloseBtnExist.length > 0) {
            checkCloseBtnExist[0].addEventListener('click', () => {
                if (obj.id == "StackingToast") {
                    this.removeElementFromDOM(obj, toast);
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
                this.removeElementFromDOM(obj, toast);
                return;
            }
            toast.setAttribute('class', 'ToastCT DyNe')
        });

    }

    autoClose(obj, toast) {
        obj.timeout = setTimeout(() => {
            if (obj.id == "StackingToast") {
                this.removeElementFromDOM(obj, toast)
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
        if (count == 0) {
            toastElement.setAttribute('stack-number', 0);
            let positionX = this.getPosition(obj.position, 0, 0);
            toastElement.setAttribute('class', obj.classes.toastCT);
            toastElement.style = `bottom: ${positionX}`;
            document.body.appendChild(toastElement);

            const deepObj = { ...obj }; // deep copy: other json.parse(json.stringify(obj)) remove the callback functions

            if (deepObj.closeBtn) {
                this.handleCloseBtn(deepObj, toastElement);
            }

            //clear timeout first
            if (deepObj.timeout) {
                clearTimeout(deepObj.timeout);
                deepObj.timeout = null;
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
            let positionX = this.getPosition(obj.position, parseInt(numberOfLastStack) + 1, toastHeight);
            toastElement.setAttribute('class', obj.classes.toastCT);
            toastElement.style = `bottom: ${positionX}`;
            document.body.appendChild(toastElement);

            const deepObj = { ...obj }; // deep copy: other json.parse(json.stringify(obj)) remove the callback functions

            if (deepObj.closeBtn) {
                this.handleCloseBtn(deepObj, toastElement);
            }

            //clear timeout first
            if (deepObj.timeout) {
                clearTimeout(deepObj.timeout);
                deepObj.timeout = null;
            }

            if (deepObj.autoClose > 0) {
                this.autoClose(deepObj, toastElement);
            }

            this.handleDontShowAgain(toastElement);

            this.handleSuccessFailBtn(deepObj, toastElement);


        }

    }

    getPosition(position, currentToastNumber, toastHeight) {
        const offset = 5; // Space between toasts (in pixels)
        let positionX = 0;

        // Common logic for vertical stacking
        switch (position) {
            case 'leftBottom':
                // Stack from bottom-left, so first toast goes to bottom and others go upwards
                positionX = `${(currentToastNumber * toastHeight) + (currentToastNumber * offset + offset)}px`;
                break;

            // case 'rightBottom':
            //     // Stack from bottom-right, so first toast goes to bottom and others go upwards
            //     positionStyle.bottom = `${numberOfToasts * (toastHeight + offset)}px`;
            //     positionStyle.right = '5px'; // Adjust the right margin if needed
            //     break;

            // case 'leftTop':
            //     // Stack from top-left, so first toast goes to top and others go downwards
            //     positionStyle.top = `${numberOfToasts * (toastHeight + offset)}px`;
            //     positionStyle.left = '5px'; // Adjust the left margin if needed
            //     break;

            // case 'rightTop':
            //     // Stack from top-right, so first toast goes to top and others go downwards
            //     positionStyle.top = `${numberOfToasts * (toastHeight + offset)}px`;
            //     positionStyle.right = '5px'; // Adjust the right margin if needed
            //     break;

            default:
                console.error('Unknown position:', position);
                return null;
        }

        return positionX;
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
            element.style.position = 'absolute';
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

    removeElementFromDOM(obj, toast) {
        if (!toast || !(toast instanceof HTMLElement)) {
            console.error('Invalid toast element provided.');
            return;
        }

        // Remove the toast element from the DOM
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }

        // Perform additional cleanup
        if (obj && obj.timeout) {
            clearTimeout(obj.timeout);
        }
    }

}

class ToolTip {

    toolTipConfig = {
        Left: { Cl: "ToolTip", Tt: "Left ToolTip", Pn: "Left", Cr: "White", CrBd: "Green", An: "AnSeLt" },
        Top: { Cl: "ToolTip", Tt: "Top ToolTip", Pn: "Top", Cr: "White", CrBd: "Blue", An: "AnSeTp" },
        Bottom: { Cl: "ToolTip", Tt: "Bottom ToolTip", Pn: "Bottom", Cr: "White", CrBd: "Gray", An: "AnSeBm" },
        Right: { Cl: "ToolTip", Tt: "Right ToolTip", Pn: "Right", Cr: "White", CrBd: "Brown", An: "AnSeRt" }
    };

    timeoutEnter; // for handling timeout of when mouseenter
    timeoutLeave; // for handling timeout of when mouseleave

    constructor() {
        this.init();
        this.timeoutEnter = null;
        this.timeoutLeave = null;
    }

    init() {
        const all_toolTipButtons = document.querySelectorAll('.ToolTipButton');

        all_toolTipButtons.forEach((toolTipButton, i) => {

            const direction = toolTipButton.getAttribute('direction');

            // Clone config to avoid mutation and add Num for identify tooltip
            const tooltipConfig = { ...this.toolTipConfig[direction], Num: i };

            toolTipButton.addEventListener('mouseenter', (e) => {
                clearTimeout(this.timeoutEnter);
                clearTimeout(this.timeoutLeave);

                // first remove if older tooltip exist 
                this.removeImmediately(tooltipConfig, e);

                this.create(tooltipConfig, e);
            });

            toolTipButton.addEventListener('mouseleave', (e) => {
                clearTimeout(this.timeoutLeave);
                this.remove(tooltipConfig, e);
            });

        })
    }

    create(tooltipOptions, event) {

        // The button is our relative container.
        const button = event.target;

        // Create the tooltip element.
        const tooltip = document.createElement('div');
        tooltip.classList.add('ToolTip');
        tooltip.setAttribute('id', 'CtToolTip' + tooltipOptions.Num);
        tooltip.textContent = tooltipOptions.Tt;

        tooltip.style.position = 'absolute';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease-in';

        // Append the tooltip as a child of the button.
        button.appendChild(tooltip);

        // Define a common offset (in pixels) for spacing.
        const offset = 10;

        // Position the tooltip based on the specified placement.
        // Since the tooltip is a child of a relatively positioned element,
        // we can use CSS properties (top, bottom, left, right) relative to the button.
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
            default:
                tooltip.classList.add('Left');
                tooltip.style.top = '50%';
                tooltip.style.right = `calc(100% + ${offset}px)`;
                tooltip.style.transform = 'translateY(-50%)';
                break;
        }

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

    remove(Ot, e) {
        // Use e.currentTarget to reliably reference the button element.
        const button = e.currentTarget;
        const tooltip = button.querySelector(`#CtToolTip${Ot.Num}`);
        if (!tooltip) return;

        // Fade out the tooltip
        tooltip.style.opacity = '0';

        // Remove the tooltip after the fade-out transition
        this.timeoutLeave = setTimeout(() => {
            tooltip.remove();
        }, 300);
    }

    removeImmediately(Ot, e) {
        // Use e.currentTarget to reliably reference the button element.
        const button = e.currentTarget;
        const tooltip = button.querySelector(`#CtToolTip${Ot.Num}`);
        if (!tooltip) return;
        tooltip.remove();
    }

}

class SliderManager {
    constructor() {
        this.classes = {
            prevBtn: 'Cr-rPr PnAe PnTp50p Pg6 CrWe BrRs5 DyFx FxAnImCr FxJyCtCr Br0_Cr CrBdBk30Lt91 ZIx100000',
            nextBtn: 'Cr-rPr PnAe PnTp50p PnRt0 Pg6 CrWe BrRs5 DyFx FxAnImCr FxJyCtCr Br0_Cr CrBdBk30Lt91 ZIx100000',
            slideBackground: 'PnFd PnTp0 PnLt0 Ht100vh Wh100vw CrBdBk30Lt91 ZIx1000000',
            slideFull: 'SlideFull PnFd Wh90vw PnLt50p PnTp50p MnWh90p ZIx100000000 TmTeVe50pVe50p',
            slideOverlay: 'PnAe PnTp0 PnLt0 Wh100p Ht100p ZIx-ve1 Oy0p',
            slideFullCloseBtn: 'SlideFullCloseBtn PnAe PnTp1p PnRt1p Wh30 Ht30 BrRs50p Pg8 FtSz16 FtWt600 FtFyAl ZIx10000000000 DyFx FxAnImCr FxJyCtCr Cr-rPr CrBdBk20Lt91 CrWe',
            slideShow: 'SlideShowUT PnRe Wh100p ZIx1',
        };

        window.onscroll = () => {
            this.LoadImage();
        };

        window.addEventListener('load', (event) => {
            this.LoadImage();
        });

        this.initializeSliders();
    }

    initializeSliders() {

        this.Slider({
            Class: 'AniSlideShow',
            classes: {
                indicatorButtonContainer: 'PnAe PnTp45p PnRt10p Pg3 SwBx1Dv-Vn1 DyFx FxDnCn FxAnImCr FxJyCtCr Gp10',
                indicatorButton: 'BrRs50p Br1_Cr CrBrWe CrBrBk Cr-rPr Ht10 Wh10',
                indicatorColor: '#AA8453',
            },
            Magnify: 'Y',
            ButtonSize: { Min: '28px', Max: '46px' },
            ButtonShow: 'N',
            TextSize: { Min: "14px", Max: "22px" },
            AspectRatio: '2.85/1',
            Content: 'Animate',
            Animate: 'SAngular',
            OverLay: 'Y',
            OverLayImg: '/img/fiber01.jpg',
            PrevNextButton: true,
            Indicators: true,
        });

        this.Slider({
            Class: 'MultipleSlideShowAuto',
            classes: {
                indicatorButtonContainer: 'PnAe PnTp45p PnRt10p Pg3 SwBx1Dv-Vn1 DyFx FxDnCn FxAnImCr FxJyCtCr Gp10',
                indicatorButton: 'BrRs50p Br1_Cr CrBrWe CrBrBk Cr-rPr Ht10 Wh10',
                indicatorColor: '#AA8453',
            },
            ButtonSize: { Min: '28px', Max: '46px' },
            Content: 'SlideMultiple',
            ShowSlide: '3',
            //SlideDirection: 'Line',
            SlidePadding: '24px',
            RunSlider: 3000,
            Magnify: 'Y',
            PrevNextButton: true,
            //Responsive: [
            //    { "ViewPort": "768", "ShowSlides": "1" },
            //    { "ViewPort": "1024", "ShowSlides": "2" },
            //    { "ViewPort": "1300", "ShowSlides": "3" }

            //],
        });

        this.Slider({
            Class: 'MySlideShow',
            classes: {
                indicatorButtonContainer: 'PnAe PnTp45p PnRt10p Pg3 SwBx1Dv-Vn1 DyFx FxDnCn FxAnImCr FxJyCtCr Gp10',
                indicatorButton: 'BrRs50p Br1_Cr CrBrWe CrBrBk Cr-rPr Ht10 Wh10',
                indicatorColor: '#AA8453',
            },
            ButtonSize: { Min: '28px', Max: '46px' },
            AspectRatio: '2.85/1',
            Content: 'Animate',
            Animate: 'SZoomOut',
            Magnify: 'Y',
            ButtonSize: { Min: '18px', Max: '28px' },
            TextSize: { Min: "14px", Max: "28px" },
            SlideDirection: 'Line',
            RunSlider: 3000,
            PrevNextButton: true,
        });

        this.Slider({
            Class: 'MultipleSlideShow',
            classes: {
                indicatorButtonContainer: 'PnAe PnTp45p PnRt10p Pg3 SwBx1Dv-Vn1 DyFx FxDnCn FxAnImCr FxJyCtCr Gp10',
                indicatorButton: 'BrRs50p Br1_Cr CrBrWe CrBrBk Cr-rPr Ht10 Wh10',
                indicatorColor: '#AA8453',
            },
            ButtonSize: { Min: '28px', Max: '46px' },
            Content: 'SlideMultiple',
            ShowSlide: '3',
            //SlideDirection: 'Line',
            SlidePadding: '2px',
            PrevNextButton: true,
            //Responsive: [
            //    { "ViewPort": "768", "ShowSlides": "1" },
            //    { "ViewPort": "1024", "ShowSlides": "2" },
            //    { "ViewPort": "1300", "ShowSlides": "3" }
            //],
        });

        this.Slider({
            Class: 'ManualSlideShow',
            classes: {
                indicatorButtonContainer: 'PnAe PnTp45p PnRt10p Pg3 SwBx1Dv-Vn1 DyFx FxDnCn FxAnImCr FxJyCtCr Gp10',
                indicatorButton: 'BrRs50p Br1_Cr CrBrWe CrBrBk Cr-rPr Ht10 Wh10',
                indicatorColor: '#AA8453',
            },
            Magnify: 'Y',
            ButtonSize: { Min: '28px', Max: '46px' },
            TextSize: { Min: "14px", Max: "22px" },
            AspectRatio: '2.85/1',
            Content: 'Slide',
            SlideDirection: 'Line',
            SlidePadding: '24px',
            PrevNextButton: true,
        });

    }

    Slider(ot) {

        //Declare Intial Value to Variables
        let Magnify = 'N';
        let Content = 'Animate';
        let Load = null;

        if (ot.Magnify) Magnify = ot.Magnify;
        if (ot.Content) Content = ot.Content;
        if (ot.Load) Load = ot.Load;

        // var SlideShownNo Used For the Multiple Slide
        let SlideShownNo;
        if (ot.Content == 'SlideMultiple') {
            if (ot.Responsive) {
                SlideShownNo = this.MultipleResponsiveSlide(ot);
            }
            else if (!ot.ShowSlide) {
                SlideShownNo = 2;
            }
            else if (ot.ShowSlide) {
                SlideShownNo = ot.ShowSlide;
            }
        }

        //Declare Intial Value Ends
        let slideShowSections = document.getElementsByClassName(ot.Class); // Each Slide Show Section

        for (let q = 0; q < slideShowSections.length; q++) {

            //add Class & Attribute ShowNumber
            slideShowSections[q].classList.add(...`${this.classes.slideShow}`.split(' '));
            slideShowSections[q].setAttribute('showno', q);

            //Magnify Cursor
            if (Magnify == 'Y') {
                slideShowSections[q].classList.add('Cr-rZmIn');
            }

            //Add Image Src To The First Slide if lazy load is not enabled & activate slideshow
            var slideShowImg = slideShowSections[q].getElementsByClassName('SlideImage');
            let img1;
            if (ot.Content == 'Animate' || ot.Content == 'Slide') {
                if (!Load) {
                    img1 = slideShowImg[0].getElementsByTagName('img')[0].getAttribute('src-ut');
                    slideShowImg[0].getElementsByTagName('img')[0].setAttribute('src', img1);
                }
                else {
                    slideShowImg[0].getElementsByTagName('img')[0].setAttribute('loadut', Load);
                }
            }
            else if (ot.Content == 'SlideMultiple') {
                for (let n = 0; n < SlideShownNo; n++) {
                    img1 = slideShowImg[n].getElementsByTagName('img')[0].getAttribute('src-ut');
                    slideShowImg[n].getElementsByTagName('img')[0].setAttribute('src', img1);
                }
            }

            // Show First Image
            let slideShowDIV = slideShowSections[q].getElementsByClassName('SlideUT');
            slideShowDIV[0].style.display = 'block';

            //Update Showing Image Number
            slideShowSections[q].setAttribute('ctslide', q);

            //Add Ids To All Slide Show & Number Of slides in each
            slideShowSections[q].setAttribute('id', ot.Class + q);
            slideShowSections[q].setAttribute('slideno', slideShowDIV.length);
            slideShowSections[q].setAttribute('Content', Content);

            // If class is aniSlideShow then show Indicators buttons if mentioned
            let imageIndicatorContainer = null;
            if (ot.Class.startsWith("AniSlideShow") && ot.Indicators) {
                const aniSlideShow = slideShowSections[q].getElementsByClassName('SlideContainer');

                for (let slideShow of aniSlideShow) {
                    let slideUT = slideShow.getElementsByClassName('SlideUT');
                    imageIndicatorContainer = document.createElement('div');
                    imageIndicatorContainer.setAttribute('class', ot.classes.indicatorButtonContainer);

                    for (let slideTo = 0; slideTo < slideUT.length; slideTo++) {
                        let indicatorButton = document.createElement('button');
                        indicatorButton.setAttribute('class', ot.classes.indicatorButton);
                        indicatorButton.setAttribute('slideTo', slideTo);
                        indicatorButton.setAttribute('showut', ot.Class + q);
                        indicatorButton.addEventListener("click", (e) => this.SlideImageTo(e, ot, slideTo, imageIndicatorContainer));
                        imageIndicatorContainer.appendChild(indicatorButton);

                        if (slideTo == 0) {
                            indicatorButton.style = `background-color: ${ot.classes.indicatorColor}`;
                        } else {
                            indicatorButton.style = 'background: none';
                        }
                    }
                    slideShow.appendChild(imageIndicatorContainer);
                }
            }

            // Prev Next Button
            if (ot.PrevNextButton) {
                let params = { ot, q, imageIndicatorContainer, slideShowSection: slideShowSections[q] };
                this.ShowPrevNextButton(params);
            }

            //Adding Slide Number & Add  Event Click to magnify &  Displaying All
            for (let j = 0; j < slideShowDIV.length; j++) {

                //setting some attributes
                slideShowImg[j].getElementsByTagName('img')[0].setAttribute('slide', j);
                slideShowImg[j].getElementsByTagName('img')[0].setAttribute('showut', ot.Class + q);
                slideShowImg[j].getElementsByTagName('img')[0].setAttribute('id', ot.Class + q + 'img' + j);

                //Adding Aspect Ratio to avoid content shift.
                slideShowImg[j].getElementsByTagName('img')[0].style.aspectRatio = ot.AspectRatio;

                //Adding Height Till The Image Not Loaded & Then After Making It Auto
                slideShowImg[j].getElementsByTagName('img')[0].addEventListener('load', function () {
                    document.getElementById(ot.Class + parseInt(q)).style.height = 'auto';
                });

                //Adding Click Event TO Enlarge the Slider to Full Screen
                if (Magnify == 'Y') {
                    slideShowImg[j].getElementsByTagName('img')[0].addEventListener('click', (ev) => { this.EnlargeSlide(ev, ot); });
                }

                //If Content Show is Slide then display all
                if (Content == 'Slide' || Content == 'SlideMultiple') {
                    slideShowDIV[j].style.display = 'block';
                }

                // If Text Size Is Mentioned then add font size
                if (ot.TextSize != null && ot.TextSize != "") {
                    if (ot.TextSize.Min != null && ot.TextSize.Min != "") {
                        slideShowDIV[j].getElementsByClassName("SlideTextUT")[0].style.fontSize = parseInt(ot.TextSize.Min);
                    }
                }

                // Adding Animation Class to the Slides
                if (ot.Content == 'Animate' && ot.Animate != "" || ot.Animate != null) {
                    slideShowImg[j].classList.add(ot.Animate);
                }

                // If OverLay Mention And Overlay Image Is there Then;
                if (ot.OverLay === 'Y') {
                    const LayDiv = document.createElement('div');
                    // LayDiv.setAttribute('class', 'SlideOverlay');
                    LayDiv.setAttribute('class', `SlideOverlay ${this.classes.slideOverlay}`);
                    const LayImage = document.createElement('img');
                    LayImage.setAttribute('class', 'Wh100p Ht100p')
                    LayImage.setAttribute('src', ot.OverLayImg);
                    LayDiv.appendChild(LayImage);
                    slideShowDIV[j].appendChild(LayDiv);
                }

                //If SlideMultiple
                //1) Add Padding To The Slides
                //2) Add Width As the Number of the slides to show
                if (ot.Content == "SlideMultiple") {
                    slideShowDIV[j].style.padding = "16px";
                    if (ot.SlidePadding) {
                        slideShowDIV[j].style.padding = ot.SlidePadding;
                    }
                    let width = 100 / SlideShownNo;
                    slideShowDIV[j].style.minWidth = width + '%';
                }
            }

            // Auto Run THe Slider
            if (ot.RunSlider) {
                setInterval(() => {
                    ot.id = ot.Class + q;
                    this.SlideImageHelper(ot.id, 1, ot, imageIndicatorContainer);
                }, ot.RunSlider);
            }

        }
    }

    LoadImage() {
        var lazyimage = document.querySelectorAll('[loadut="Start"]');
        for (let i = 0; i < lazyimage.length; i++) {
            var id = lazyimage[i].getAttribute('id');
            var load = lazyimage[i].getAttribute('loadut');

            var obj = { Id: id, Load: load };

            if (this.InViewUT(obj)) {
                var img1 = lazyimage[i].getAttribute('src-ut');
                lazyimage[i].setAttribute('src', img1);
                lazyimage[i].removeAttribute('loadut');
            }
        }
        var midlazyimage = document.querySelectorAll('[loadut="Mid"]');
        for (let i = 0; i < midlazyimage.length; i++) {
            var id = midlazyimage[i].getAttribute('id');
            var load = midlazyimage[i].getAttribute('loadut');

            var obj = { Id: id, Load: load };

            if (this.InViewUT(obj)) {
                var img1 = midlazyimage[i].getAttribute('src-ut');
                midlazyimage[i].setAttribute('src', img1);
                midlazyimage[i].removeAttribute('loadut');
            }
        }
        var endlazyimage = document.querySelectorAll('[loadut="End"]');
        for (let i = 0; i < endlazyimage.length; i++) {
            var id = endlazyimage[i].getAttribute('id');
            var load = endlazyimage[i].getAttribute('loadut');

            var obj = { Id: id, Load: load };

            if (this.InViewUT(obj)) {
                var img1 = endlazyimage[i].getAttribute('src-ut');
                endlazyimage[i].setAttribute('src', img1);
                endlazyimage[i].removeAttribute('loadut');
            }
        }
    }

    // Show Prev and Next Button
    ShowPrevNextButton(args) {

        const { imageIndicatorContainer, ot, q, slideShowSection } = args;

        var prevbtn = document.createElement('button');
        var nextbtn = document.createElement('button');
        prevbtn.setAttribute('class', this.classes.prevBtn);
        nextbtn.setAttribute('class', this.classes.nextBtn);
        prevbtn.addEventListener('click', (ev) => { this.SlideImage(ev, ot, imageIndicatorContainer); });
        nextbtn.addEventListener('click', (ev) => { this.SlideImage(ev, ot, imageIndicatorContainer); });
        prevbtn.setAttribute('ctImg', '-1');
        nextbtn.setAttribute('ctImg', '1');
        prevbtn.innerText = '❮';
        nextbtn.innerText = '❯';

        //Adding Next Previous Button
        prevbtn.setAttribute('showut', ot.Class + q);
        nextbtn.setAttribute('showut', ot.Class + q);

        prevbtn.setAttribute('id', 'PsBn' + ot.Class + q);
        nextbtn.setAttribute('id', 'NtBn' + ot.Class + q);

        // Button Size is Mentioned Then Add
        if (ot.ButtonSize && ot.ButtonSize.Min) {
            prevbtn.style.fontSize = ot.ButtonSize.Min;
            nextbtn.style.fontSize = ot.ButtonSize.Min;
        }

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
        let params = { ot, slideShowDIV, showImage, ButtonValue, imageIndicatorContainer, TotalSlides, slideShowImg, SlideShow };
        switch (Content) {
            case 'Animate':
                this.ContentAnimate(params);
                break;
            case 'Slide':
                this.ContentSlide(params);
                break;
            case 'SlideMultiple':
                params.SlideInView = SlideInView;
                this.ContentSlideMultiple(params);
                break;
            default:
                break;
        }

        //Removing Added Height So that Slider Remains Responsive
        setTimeout(() => { SlideShow.style.height = 'auto'; }, 2000);

    }

    // If Content is Animate then Call this Function
    ContentAnimate(args) {
        let { ot, slideShowDIV, showImage, ButtonValue, imageIndicatorContainer, TotalSlides, slideShowImg, SlideShow } = args;

        for (let i = 0; i < slideShowDIV.length; i++) {
            if (slideShowDIV[i].style.display == 'block') { // current image that is visible
                showImage = slideShowDIV[i].getElementsByClassName('SlideImage')[0].getElementsByTagName('img')[0].getAttribute('slide');
            }
            slideShowDIV[i].style.display = 'none';
        }

        // Next Image to be shown
        let showNewImage = parseInt(showImage) + parseInt(ButtonValue);

        // Hightlight the active indicator button
        if (imageIndicatorContainer) {
            this.markIndicator(ot, parseInt(showImage), parseInt(ButtonValue), imageIndicatorContainer);
        }

        //Hide Button only if the Slide Direction is mentioned in OT
        if (ot.SlideDirection) {
            this.HideBn(ot, SlideShow, showNewImage, TotalSlides);
        }

        let img1;
        if (showNewImage >= 0 && showNewImage < TotalSlides) {
            img1 = slideShowImg[showNewImage].getElementsByTagName('img')[0].getAttribute('src-ut'); // get the src
            slideShowImg[showNewImage].getElementsByTagName('img')[0].setAttribute('src', img1); // set the src of image
            slideShowDIV[showNewImage].style.display = 'block';
        }
        else if (showNewImage >= TotalSlides) { // show first image
            slideShowDIV[0].style.display = 'block';
        }
        else if (showNewImage < 0) { // show last image
            img1 = slideShowImg[TotalSlides - 1].getElementsByTagName('img')[0].getAttribute('src-ut'); // get the srouce
            slideShowImg[TotalSlides - 1].getElementsByTagName('img')[0].setAttribute('src', img1); // set the source
            slideShowDIV[TotalSlides - 1].style.display = 'block';
        }
    }

    // If Content is Slide then Call this Function
    ContentSlide(args) {
        let { ot, slideShowDIV, showImage, ButtonValue, imageIndicatorContainer, TotalSlides, slideShowImg, SlideShow } = args;

        let CurrentSlideNumber = parseInt(SlideShow.getAttribute('ctslide'));
        let UpComingSlideNumber = parseInt(CurrentSlideNumber) + parseInt(ButtonValue);

        // Add Image Source If Not Updated
        let ImageSrc;
        if (UpComingSlideNumber >= 0 && UpComingSlideNumber < TotalSlides) {
            ImageSrc = slideShowImg[UpComingSlideNumber].getElementsByTagName('img')[0].getAttribute('src');
            if (!ImageSrc) {
                ImageSrc = slideShowImg[UpComingSlideNumber].getElementsByTagName('img')[0].getAttribute('src-ut');
                slideShowImg[UpComingSlideNumber].getElementsByTagName('img')[0].setAttribute('src', ImageSrc);
            }
        }
        else if (UpComingSlideNumber < 0) {
            ImageSrc = slideShowImg[(TotalSlides - 1)].getElementsByTagName('img')[0].getAttribute('src');
            if (!ImageSrc) {
                ImageSrc = slideShowImg[(TotalSlides - 1)].getElementsByTagName('img')[0].getAttribute('src-ut');
                slideShowImg[(TotalSlides - 1)].getElementsByTagName('img')[0].setAttribute('src', ImageSrc);
            }
        }

        //Hide Button only if the Slide Direction is mentioned in OT
        if (ot.SlideDirection) {
            this.HideBn(ot, SlideShow, UpComingSlideNumber, TotalSlides);
        }

        //Scroll Cases
        let SliderWidth = SlideShow.getBoundingClientRect().width;
        let ScrollDiv = SlideShow.getElementsByClassName('SlideContainer')[0];

        //Case When Scroll Right Or Left Is Available
        if (UpComingSlideNumber >= 0 && UpComingSlideNumber < TotalSlides) {
            let ScrollWidth = SliderWidth * UpComingSlideNumber;
            ScrollDiv.scrollLeft = ScrollWidth;
            //Update Current Slide Value
            SlideShow.setAttribute('ctslide', UpComingSlideNumber);
        }
        else if (UpComingSlideNumber >= TotalSlides) {
            ScrollDiv.scrollLeft = 0;
            //Update Current Slide Value
            SlideShow.setAttribute('ctslide', (0));
        }
        else if (UpComingSlideNumber < 0) {
            let ScrollWidth = SliderWidth * (TotalSlides - 1);
            ScrollDiv.scrollLeft = ScrollWidth;
            //Update Current Slide Value
            SlideShow.setAttribute('ctslide', (TotalSlides - 1));
        }
    }

    // If Content is Slide Multiple then Call this Function
    ContentSlideMultiple(args) {

        let { ot, slideShowDIV, showImage, ButtonValue, imageIndicatorContainer, TotalSlides, slideShowImg, SlideShow, SlideInView } = args;

        let CurrentSlideNumber = parseInt(SlideShow.getAttribute('ctslide'));
        let upcomingSlideNumber = parseInt(CurrentSlideNumber) + parseInt(ButtonValue);
        let SlideShownNo = 2;

        if (ot.Responsive) {
            SlideShownNo = parseInt(this.MultipleResponsiveSlide(ot));
        }
        else if (ot.upcomingSlideNumber) {
            SlideShownNo = parseInt(ot.ShowSlide);
        }

        // Add Image Source If Not Updated - Forward Button is Pressed
        let ImageSrc;
        if (upcomingSlideNumber > 0 && (upcomingSlideNumber + SlideShownNo) <= TotalSlides) {
            // Forward Button Pressed
            if (ButtonValue > 0) {
                ImageSrc = slideShowImg[(upcomingSlideNumber + SlideShownNo - 1)].getElementsByTagName('img')[0].getAttribute('src');
                if (!ImageSrc) {
                    ImageSrc = slideShowImg[(upcomingSlideNumber + SlideShownNo - 1)].getElementsByTagName('img')[0].getAttribute('src-ut');
                    slideShowImg[(upcomingSlideNumber + SlideShownNo - 1)].getElementsByTagName('img')[0].setAttribute('src', ImageSrc);
                }
            }
            //Back Button Is Pressed
            else {
                ImageSrc = slideShowImg[(upcomingSlideNumber - 1)].getElementsByTagName('img')[0].getAttribute('src');
                if (!ImageSrc) {
                    ImageSrc = slideShowImg[(upcomingSlideNumber - 1)].getElementsByTagName('img')[0].getAttribute('src-ut');
                    slideShowImg[(upcomingSlideNumber - 1)].getElementsByTagName('img')[0].setAttribute('src', ImageSrc);
                }
            }
        }
        //Back Button Is Pressed from the Start
        else if (upcomingSlideNumber < 0) {
            for (let n = 0; n < ot.ShowSlide; n++) {
                ImageSrc = slideShowImg[(TotalSlides - n - 1)].getElementsByTagName('img')[0].getAttribute('src');
                if (!ImageSrc) {
                    ImageSrc = slideShowImg[(TotalSlides - n - 1)].getElementsByTagName('img')[0].getAttribute('src-ut');
                    slideShowImg[(TotalSlides - n - 1)].getElementsByTagName('img')[0].setAttribute('src', ImageSrc);
                }
            }
        }

        //Ends Add Image Source If Not Updated - Hide Button only if the Slide Direction is mentioned in Ot
        if (ot.SlideDirection != null && ot.SlideDirection != "") {
            this.HideBn(ot, SlideShow, upcomingSlideNumber, TotalSlides);
        }

        //Scroll Cases - Slider Width will be the Class Div with SlideUT
        let SliderWidth = SlideShow.getElementsByClassName('SlideUT')[0].getBoundingClientRect().width;
        let ScrollDiv = SlideShow.getElementsByClassName('SlideContainer')[0];

        //Case When Scroll Right Or Left Is Available
        let ScrollWidth;
        if (upcomingSlideNumber >= 0 && upcomingSlideNumber <= TotalSlides - SlideInView) {
            ScrollWidth = SliderWidth * (upcomingSlideNumber);
            ScrollDiv.scrollLeft = ScrollWidth;
            //Update Current Slide Value
            SlideShow.setAttribute('ctslide', upcomingSlideNumber);
        }
        else if (upcomingSlideNumber > TotalSlides - SlideInView) {
            ScrollDiv.scrollLeft = 0;
            //Update Current Slide Value
            SlideShow.setAttribute('ctslide', (0));
        }
        else if (upcomingSlideNumber <= SlideInView) {
            ScrollWidth = SliderWidth * (TotalSlides - SlideInView);
            ScrollDiv.scrollLeft = ScrollWidth;
            //Update Current Slide Value
            SlideShow.setAttribute('ctslide', (TotalSlides - SlideInView));
        }
    }

    // When Click on Indicators Button Then Change Image
    SlideImageTo(e, obj, slideTo, imageIndicatorContainer) {

        let imageIndicatorButtons = imageIndicatorContainer.getElementsByTagName('button');

        // Get the ID of the slideshow container
        var SlideShowID = e.target.getAttribute('showut');
        let SlideShowContainer = document.getElementById(SlideShowID);
        let SlideUT = SlideShowContainer.getElementsByClassName('SlideUT');

        // Iterate through each slide and update its visibility
        Array.from(SlideUT).forEach((currentSlideUT, index) => {

            // Check if the slide has a style attribute
            if (currentSlideUT.getAttribute('style')) {
                let styleString = currentSlideUT.getAttribute('style');

                // If the style is "display: block"
                if (styleString.includes('display: block')) {

                    // Check if this is the slide to show
                    if (index == slideTo) {
                        return; // Exit loop for this slide
                    } else {
                        // Otherwise, hide the currently active slide
                        imageIndicatorButtons[index].style = "background: none";
                        currentSlideUT.setAttribute('style', 'display: none');
                    }
                }
            }

            // If this is the slide to activate
            if (index == slideTo) {
                // Update the image source
                let imageElement = currentSlideUT.getElementsByTagName('img')[0];
                let imageSource = imageElement.getAttribute('src-ut');
                imageElement.setAttribute('src', imageSource);

                // Make this slide visible
                currentSlideUT.setAttribute('style', 'display: block');

                imageIndicatorButtons[index].style = `background-color: ${obj.classes.indicatorColor}`;
            }
        });
    }

    // Hightlight the Indicator Button That is Currently Active
    markIndicator(ot, currentImageNumber, PrevOrNextNumber, imageIndicatorContainer) {

        let imageIndicatorButtons = imageIndicatorContainer.getElementsByTagName('button');
        let totalLen = imageIndicatorButtons.length;

        const indicatorToHighlight = ((currentImageNumber + PrevOrNextNumber) + totalLen) % totalLen; // cyclic formula

        Array.from(imageIndicatorButtons).forEach((currentIndicatorButton, index) => {
            if (indicatorToHighlight == index) {
                currentIndicatorButton.style = `background-color: ${ot.classes.indicatorColor}`;
            } else {
                currentIndicatorButton.style = "background: none";
            }
        })

    }

    HideBn(ot, SlideShow, showslide, TotalSlides) {

        //Hide Button only if the Slide Direction is mentioned in OT
        if (ot.HideButton != 'Y') {
            if (ot.SlideDirection == 'Line') {

                if (ot.Content == 'Slide' || ot.Content == 'Animate') {
                    var ShowNo = SlideShow.getAttribute('showno');
                    var bnPrev = document.getElementById('PsBn' + ot.Class + ShowNo);
                    var bnNxt = document.getElementById('NtBn' + ot.Class + ShowNo);

                    //alert(showslide +" T-" +TotalSlides);
                    if (showslide >= (TotalSlides - 1)) {
                        bnNxt.style.display = 'none';
                    }
                    else {
                        bnNxt.style.display = 'block';
                    }
                    if (showslide <= 0) {
                        bnPrev.style.display = 'none';
                    }
                    else {
                        bnPrev.style.display = 'block';
                    }
                }
                else if (ot.Content == 'SlideMultiple') {
                    if (ot.SlideDirection == 'Line') {
                        var SlideShownNo = parseInt(ot.ShowSlide);
                        var ShowNo = SlideShow.getAttribute('showno');
                        var bnPrev = document.getElementById('PsBn' + ot.Class + ShowNo);
                        var bnNxt = document.getElementById('NtBn' + ot.Class + ShowNo);
                        if ((showslide + SlideShownNo) >= TotalSlides) {
                            bnNxt.style.display = 'none';
                        }
                        else {
                            bnNxt.style.display = 'block';
                        }
                        if (showslide >= 1) {
                            bnPrev.style.display = 'block';
                        }
                        else {
                            bnPrev.style.display = 'none';
                        }
                    }


                }
            }
            //Ends Hide Button only if the Slide Direction is mentioned in OT
        }
    }

    ScrollSlide(SlideShow) {
        var showslide = parseInt(SlideShow.getAttribute('ctslide'));
        var SliderWidth = SlideShow.getBoundingClientRect().width;
        var ScrollWidth = SliderWidth * showslide;
        var ScrollDiv = SlideShow.getElementsByClassName('SlideContainer')[0];
        ScrollDiv.scrollLeft = ScrollWidth;
    }

    EnlargeSlide(ev, ot) {
        let id = ev.target.getAttribute('showut');
        let slideshow = document.getElementById(id);
        let showno = slideshow.getAttribute('showno');

        if (slideshow.classList.contains('SlideFull')) {
            slideshow.classList.remove(...this.classes.slideFull.split(' '));
            slideshow.style = '';
            slideshow.classList.remove('Cr-rZmOt');
            slideshow.classList.add('Cr-rZmIn');

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
            slideshow.classList.remove('Cr-rZmIn');
            slideshow.classList.add('Cr-rZmOt');

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
                    document.getElementById('PsBn' + ot.Class + showno).style.fontSize = ot.ButtonSize.Max;
                    document.getElementById('NtBn' + ot.Class + showno).style.fontSize = ot.ButtonSize.Max;
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
        slideshow.offsetHeight;
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
                document.getElementById('PsBn' + ot.Class + showno).style.fontSize = ot.ButtonSize.Min;
                document.getElementById('NtBn' + ot.Class + showno).style.fontSize = ot.ButtonSize.Min;
            }
        }
        //

        //If Text Size Is to Minimized
        if (ot.TextSize != null && ot.TextSize != "") {
            if (ot.TextSize.Min != null && ot.TextSize.Min != "") {
                this.UpdateFontSize(id, ot, 'Min');
            }
        }

    }

    UpdateFontSize(id, ot, update) {
        var slideshow = document.getElementById(id);
        var slides = slideshow.getElementsByClassName('SlideContainer')[0].getElementsByClassName('SlideUT');
        for (var i = 0; i < slides.length; i++) {
            if (update == "Max") {
                slides[i].getElementsByClassName("SlideTextUT")[0].style.fontSize = ot.TextSize.Max;
            }

            if (update == "Min") {
                slides[i].getElementsByClassName("SlideTextUT")[0].style.fontSize = ot.TextSize.Min;
            }
        }
    }

    MultipleResponsiveSlide(ot) {
        // Check the Width Of the Window If Mentioned to Show the Number Of Slide
        if (ot.Responsive) {
            let Breakpoints = ot.Responsive.length;
            let ScWidth = window.innerWidth;
            for (let b = 0; b < Breakpoints; b++) {
                if (ScWidth <= parseInt(ot.Responsive[b].ViewPort)) {
                    return parseInt(ot.Responsive[b].ShowSlides);
                }
            }
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
        this.twoMonthsPrices = this.generateRandomPrices(1000, 2000);
        this.init();
    }

    init() {
        const InitValues1 = {
            StartDateInput: 'StartDate',
            RangeInput: { StartDateInput: 'StartDate', EndDateInput: 'EndDate' },
            CalenderType: 'Date',
            //DisableDate      : { Before: '2017/12/1', After: '2026/1/15' },
            DisableCount: { Before: 1, After: 100 },
            RangeSelectClass: '',
            RangeTheme: 'RangeTheme1',
            RangeSameDaySelect: true,// Used For Selecting Same Date
            ShowMonths: 2,
            //PositionCalender : { StartDateId: 'StartDate', EndDateId: 'StartDate' },
            SelectedStartDate: '2025-1-8',//To Show 3 Days Selection Start
            SelectedEndDate: '2025-1-10',
            DisableAfterDays: 10,
            Width: { Mobile: "90%", Tablet: "300px", Desktop: "400px" },
            //Classes For Main Calender Div
            CsCalenderDiv: 'DyFx TtAnCr FxGw1 BxSwCrGy BrRs5 Pg3 FxDnCn',
            CsCalenderRowDayDiv: 'Wh100pD7 DyTeCl PgTpBm5 Br1_Cr CrBrGy90Lt HrCrBdTe  Cr-rPr FtWt600',
            CsCalenderRowDayDisableDiv: 'Wh100pD7 DyTeCl PgTpBm5 Br1_Cr CrBrGy90Lt FtWt600 CrGy80Lt',
            CsToday: 'CrBdTe70Lt',
            CsWeekDay: "Wh100pD7 DyTeCl PgTpBm5 Br1_Cr CrBrGy90Lt  CrBdTe80Lt91 FtWt600",
            CsNextIcon: "CT-ArrowRightCircleSolid",
            CsPrevIcon: "CT-ArrowLeftCircleSolid",
            CsSelectedDateStartEnd: ['BxSwItCrTe', 'BrRs3', 'CrBdTe90Lt97'],// Should Be Array because they are added in loop
        }
        const InitValues2 = {
            RangeInput: { StartDateInput: 'StartDate1', EndDateInput: 'EndDate1' },
            CsNextIcon: "CT-ArrowRightCircleSolid",
            CsPrevIcon: "CT-ArrowLeftCircleSolid",
            //CallBackFunc : function () { alert(1); }
            //DisableAfterDays: 10,
        }

        this.ShowCalender(InitValues1);
        this.ShowCalender(InitValues2);
    }

    ShowCalender(Obj) {
        // Defining the intial value to the variable
        // Defining All Classes
        Obj.CsCalenderDiv = Obj.CsCalenderDiv || 'DyFx TtAnCr FxGw1 BxSwCrGy BrRs5 Pg3 FxDnCn';
        Obj.CsCalenderRowDayDiv = Obj.CsCalenderRowDayDiv || 'Wh100pD7 DyTeCl PgTpBm5 Br1_Cr CrBrGy90Lt HrCrBdTe  Cr-rPr FtWt600';
        Obj.CsCalenderRowDayDisableDiv = Obj.CsCalenderRowDayDisableDiv || 'Wh100pD7 DyTeCl PgTpBm5 Br1_Cr CrBrGy90Lt FtWt600 CrGy80Lt';
        Obj.CsToday = Obj.CsToday || 'CrBdTe50Lt';
        Obj.CsWeekDay = Obj.CsWeekDay || 'Wh100pD7 DyTeCl PgTpBm5 Br1_Cr CrBrGy90Lt  CrBdTe80Lt91 FtWt600';
        Obj.CsNextIcon = Obj.CsNextIcon || 'CT-ArrowRightCircleSolid';
        Obj.CsPrevIcon = Obj.CsPrevIcon || 'CT-ArrowLeftCircleSolid';
        Obj.CsSelectedDateStartEnd = Obj.CsSelectedDateStartEnd || ['BxSwItCrTe', 'BrRs3', 'CrBdTe90Lt97'];

        //Can take 'Date','Year','Month'
        Obj.Width = Obj.Width || { Mobile: "90%", Tablet: "253px", Desktop: "253px" };
        Obj.CalenderType = Obj.CalenderType || 'Date';
        Obj.StartYear = Obj.StartYear || new Date().getFullYear();
        Obj.StartMonth = Obj.StartMonth || new Date().getMonth();
        Obj.Language = Obj.Language || 'en-US';
        Obj.DateFormat = Obj.DateFormat || 'D-MM-YYYY';
        Obj.MonthDisplayNumber = Obj.MonthDisplayNumber || 1;
        Obj.CallBackFunc = Obj.CallBackFunc || "";
        Obj.DisablePreviousDays = Obj.DisablePreviousDays || "N";
        Obj.Event = Obj.Event || null;
        Obj.SelectedStartDate = Obj.SelectedStartDate ? new Date(Obj.SelectedStartDate) : Obj.SelectedStartDate;
        Obj.SelectedEndDate = Obj.SelectedEndDate ? new Date(Obj.SelectedEndDate) : Obj.SelectedEndDate;
        Obj.RangeInput = Obj.RangeInput || null;
        Obj.RangeSelectClass = Obj.RangeSelectClass || 'CrBdTe80Lt97';
        Obj.RangeSelectStartEndMarkCs = Obj.RangeSelectStartEndMarkCs || 'CalenderStartEnd';
        Obj.ShowMonths = Obj.ShowMonths || 1;
        Obj.RangeTheme = Obj.RangeTheme || null;
        Obj.PositionCalender = Obj.PositionCalender || null;

        if (Obj.PositionCalender) {
            Obj.PositionCalender.StartDateId = Obj.PositionCalender.StartDateId || null;
            Obj.PositionCalender.EndDateId = Obj.PositionCalender.EndDateId || null;
        }

        Obj.RangeSameDaySelect = Obj.RangeSameDaySelect || false;

        var CalenderType = Obj.CalenderType;
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
            switch (CalenderType) {
                case 'Date': document.getElementById(StartDateInput)?.addEventListener('click', (e) => { Obj.Event = e; this.DateCalender(Obj); });
                    if (EndDateInput != null) { document.getElementById(EndDateInput)?.addEventListener('click', (e) => { Obj.Event = e; this.DateCalender(Obj); }); }
                    break;
                case 'Year': document.getElementById(StartDateInput)?.addEventListener('click', (e) => { Obj.Event = e; this.YearCalender(Obj); });
                    if (EndDateInput != null) { document.getElementById(EndDateInput)?.addEventListener('click', (e) => { Obj.Event = e; this.YearCalender(Obj); }); }
                    break;
                case 'Month': document.getElementById(StartDateInput)?.addEventListener('click', (e) => { Obj.Event = e; this.MonthCalender(Obj); });
                    if (EndDateInput != null) { document.getElementById(EndDateInput)?.addEventListener('click', (e) => { Obj.Event = e; this.MonthCalender(Obj); }); }
                    break;
            }
        }
    }

    handleGesture(e, Obj) {
        let x = touchendX - touchstartX;
        let y = touchendY - touchstartY;
        let xy = Math.abs(x / y);
        let yx = Math.abs(y / x);
        if (Math.abs(x) > treshold || Math.abs(y) > treshold) {
            if (yx <= limit) {
                if (x < 0) {
                    this.DateChangeUT(parseInt(Obj.StartYear), parseInt(Obj.StartMonth + 1), Obj);
                } else {
                    this.DateChangeUT(parseInt(Obj.StartYear), parseInt(Obj.StartMonth - 1), Obj);
                }
            }
        }

    }
    // Swipe Function Ends Here

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

    DateCalender(Obj) {
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
        var today = new Date();
        var UserYear = Obj.StartYear;
        var UserMonth = Obj.StartMonth;
        var UserLang = Obj.Language;
        var StartDateInput = Obj.StartDateInput;
        var EndDateInput = Obj.EndDateInput;
        var DisableCount = null;
        var DisableDate = null;
        var DisableBeforeDateCheck = null;
        var DiasableAfterDateCheck = null;
        var DisableCalenderDate = null;
        var CurrentSelectedInput = Obj.CurrentSelectedInput;
        var SelectedStartDate = Obj.SelectedStartDate;
        var SelectedEndDate = Obj.SelectedEndDate;
        var RangeSelectClass = Obj.RangeSelectClass;
        var RangeSelectStartEndMarkCs = Obj.RangeSelectStartEndMarkCs;
        var RangeCalender = 'N';
        var RangeTheme = Obj.RangeTheme;
        var ShowMonths = Obj.ShowMonths;
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

        /*
        REDUNDENT
        // Checking if the Range Input Calender then if the enddate is selected then disable dates before the check In Dates
        if (Obj.RangeInput != null && DisableAfterDays == null && Obj.DisableCount == null && Obj.DisableDate == null) {
            if (CurrentSelectedInput == Obj.EndDateInput) {
                DisableCalenderDate = true;
                DisableBeforeDateCheck = new Date(document.getElementById(Obj.StartDateInput).value);
            }
        }
        */
        //Ends Disable Date Check

        if (RangeTheme) {
            var getTheme = this.RangeTheme1(Obj);

            // Range Calender Outer Container
            RangeContainer = document.createElement('div');
            RangeContainer.setAttribute('class', 'Pg10 BrRs5 BxSwCrGy Wh100P')

            // Set Header, Footer, and Month Bar
            ThemeHeader = getTheme.Head;
            ThemeFooter = getTheme.Foot;
            ThemeMonthBar = getTheme.MonthBar;
        }

        // Calender Container
        var CalenderDivContainer = document.createElement('div');
        CalenderDivContainer.setAttribute("class", " DyFx Gp5");

        // Adding Event Listner for the swipe functionality
        CalenderDivContainer.addEventListener('touchstart', function (event) {
            touchstartX = event.changedTouches[0].screenX;
            touchstartY = event.changedTouches[0].screenY;
        }, false);

        CalenderDivContainer.addEventListener('touchend', function (event) {
            touchendX = event.changedTouches[0].screenX;
            touchendY = event.changedTouches[0].screenY;
            this.handleGesture(event, Obj);
        }, false);
        // Ends Adding Event Listner for the swipe functionality
        // Main Head Ends


        // Get the current screen width
        const screenWidth = window.innerWidth;
        // Determine the width based on screen size
        let width;
        if (screenWidth <= 600) {
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

        for (var mx = 0; mx < ShowMonths; mx++) { // How many calender chart to show. Range Calender 2 and otherwise 1

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
                CalenderHeadDiv.setAttribute('class', 'DyFx FxAnImCr FxJyCtCr Wh100P Mn2 Ht40 FtWt600');
                CalenderDiv.appendChild(CalenderHeadDiv);

                // First Container [<- Month ->]
                const CalenderIconMonthDiv = document.createElement('div');
                CalenderIconMonthDiv.setAttribute('class', 'DyFx FxDnRw Wh50p PgRt3');
                CalenderHeadDiv.appendChild(CalenderIconMonthDiv);

                // Previus Icon
                const SubMonthDiv = document.createElement('div');
                SubMonthDiv.addEventListener('click', function () { DateChangeUT(parseInt(UserYear), parseInt(UserMonth - 1), Obj); });
                SubMonthDiv.setAttribute('class', "Cr-rPr FxCrAnJy");
                CalenderIconMonthDiv.appendChild(SubMonthDiv);
                SubMonthDiv.innerHTML = `<i class="${Obj.CsPrevIcon}" > </i>`;

                // Month Name
                const CalenderCurrentMonth = document.createElement('div');
                CalenderCurrentMonth.addEventListener('click', () => { this.MonthCalender(Obj) });
                CalenderCurrentMonth.setAttribute('class', 'Cr-rPr');
                CalenderCurrentMonth.classList.add('FxGw1');
                CalenderCurrentMonth.classList.add('FxCrAnJy');

                // Next Icon
                CalenderCurrentMonth.innerHTML = month;
                CalenderIconMonthDiv.appendChild(CalenderCurrentMonth);
                const AddMonthDiv = document.createElement('div');
                AddMonthDiv.addEventListener('click', () => { this.DateChangeUT(parseInt(UserYear), parseInt(UserMonth + 1), Obj); });
                AddMonthDiv.setAttribute('class', "Cr-rPr FxCrAnJy");
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
                SubYearDiv.setAttribute('class', "Cr-rPr FxCrAnJy");
                CalenderIconYearDiv.appendChild(SubYearDiv);
                SubYearDiv.innerHTML = `<i class="${Obj.CsPrevIcon}" > </i>`;

                // Year Number
                const CalenderCurrentYear = document.createElement('div');
                CalenderCurrentYear.addEventListener('click', () => { this.YearCalender(Obj) });
                CalenderCurrentYear.setAttribute('class', 'Cr-rPr FxGw1 FxCrAnJy');

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
                AddYearDiv.setAttribute('class', "Cr-rPr FxCrAnJy");
                CalenderIconYearDiv.appendChild(AddYearDiv);
                AddYearDiv.innerHTML = `<i class="${Obj.CsNextIcon}" > </i>`;

            }
            else { // Range Calender

                // Calender Header
                var CalenderMonthDiv = document.createElement('div');
                CalenderMonthDiv.setAttribute('class', 'Cr-uPr  FxCrAnJy PgTpBm10 Wh100p FtWt700');
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

                    let futureDateSum = new Date(YearVar, MonthVar, DateVar);

                    if (CalenderDayName == WeekDayName[weekDay] && monthDate <= MonthDays) {

                        CalenderRowDayDiv.setAttribute('CelebrateDate', CalenderYear + '-' + parseInt(CalenderMonth + 1) + '-' + monthDate);

                        // Calculate the difference in days
                        const diffInMs = futureDateSum - today;
                        const priceIndex = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

                        if (priceIndex >= 0 && priceIndex < 62) { // show prices from current date to next 62 days
                            CalenderRowDayDiv.innerHTML = `<div class="FxCr" >${monthDate} </div><div class="FxCr FtSz10 CrRd">${this.twoMonthsPrices[priceIndex]}</div>`;
                        } else {
                            CalenderRowDayDiv.innerHTML = `<div class="FxCr" > ${monthDate} </div>`;
                        }

                        var CreatedDate = new Date(CalenderYear, CalenderMonth, monthDate);

                        // Check For the PreviousDisable And StartEndDisable And DisableAfter
                        // There is conditions 1) Disable before only, 2)Disable After Only 3) Disable Before and After Both
                        if (DisableCalenderDate == true) {
                            //Disable Before and After Both
                            if (DisableBeforeDateCheck != null && DiasableAfterDateCheck != null) {
                                if ((CreatedDate > DisableBeforeDateCheck && CreatedDate < DiasableAfterDateCheck)
                                    || (CreatedDate >= DisableBeforeDateCheck && CreatedDate < DiasableAfterDateCheck && Obj.RangeSameDaySelect == true)) {
                                    CalenderRowDayDiv.addEventListener('click', () => { this.DateSelect(YearVar, MonthVar, DateVar, Obj) });
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
                                    CalenderRowDayDiv.addEventListener('click', () => { this.DateSelect(YearVar, MonthVar, DateVar, Obj) });
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
                                    CalenderRowDayDiv.addEventListener('click', () => { this.DateSelect(YearVar, MonthVar, DateVar, Obj) });
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
                            CalenderRowDayDiv.addEventListener('click', () => {
                                this.DateSelect(YearVar, MonthVar, DateVar, Obj);
                                var DatePickerElement = document.getElementById(CurrentSelectedInput);
                                if (!SelectedStartDate) {
                                    SelectedStartDate = DatePickerElement.value;
                                    Obj.SelectedStartDate = new Date(DatePickerElement.value);
                                } else {
                                    SelectedEndDate = DatePickerElement.value;
                                    Obj.SelectedEndDate = new Date(SelectedEndDate);
                                }
                            });
                        }

                        // If Starting Date is selected then disable all the previous dates
                        if (SelectedStartDate) {
                            if (CreatedDate < SelectedStartDate) {
                                CalenderRowDayDiv.setAttribute('class', Obj.CsCalenderRowDayDisableDiv);
                            }
                        }

                        // Highlight Current Date
                        if ((new Date(today.getFullYear(), today.getMonth(), today.getDate())).getTime() === (new Date(YearVar, MonthVar, DateVar)).getTime()) {
                            CalenderRowDayDiv.classList.add(Obj.CsToday);
                        }

                        // Highlight Selected Start Date
                        if (SelectedStartDate != null && SelectedStartDate != undefined) {
                            if (CreatedDate.toDateString() === SelectedStartDate.toDateString()) {
                                for (var i = 0; i < Obj.CsSelectedDateStartEnd.length; i++) {
                                    CalenderRowDayDiv.classList.add(Obj.CsSelectedDateStartEnd[i]);
                                }
                            }
                        }

                        // Hightlight Selected End Date
                        if (SelectedEndDate != null && SelectedEndDate != undefined) {
                            if (CreatedDate.toDateString() === SelectedEndDate.toDateString()) {
                                for (var i = 0; i < Obj.CsSelectedDateStartEnd.length; i++) {
                                    CalenderRowDayDiv.classList.add(Obj.CsSelectedDateStartEnd[i]);
                                }
                            }
                        }

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
                    ArrowSpan.setAttribute('class', 'FtSz24 CrTe FxCr FtWt800 Cr-uPr');
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

            //Adding RIght Arrow
            if (RangeTheme) {
                if (mx == parseInt(ShowMonths - 1)) {
                    var ArrowDiv = document.createElement('div');
                    ArrowDiv.setAttribute('class', 'FxCr Mn5');
                    var ArrowSpan = document.createElement('span');
                    ArrowSpan.setAttribute('class', 'FtSz24 CrTe FxCr FtWt800 Cr-uPr');
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
        CalenderRangeHead.setAttribute('class', 'DyFx Mn10 FxJySeBn');

        var CalenderRangeCalDiv = document.createElement("div");

        var RangeSelected = document.createElement('h2');
        RangeSelected.setAttribute('id', 'RangeDuration');

        if (SelectedRange != null) {
            if (SelectedRange == 1) {
                RangeSelected.innerHTML = SelectedRange + ' Night' + " / " + parseInt(SelectedRange + 1) + " Days";
            } else { RangeSelected.innerHTML = SelectedRange + ' Nights' + " / " + parseInt(SelectedRange + 1) + " Days"; }

        } else {
            RangeSelected.innerHTML = 'No Selection';

        }

        CalenderRangeCalDiv.appendChild(RangeSelected);

        var RangeFromTo = document.createElement('p');
        RangeFromTo.setAttribute('class', 'Mn0 FtSe15 FtWt600');
        RangeFromTo.setAttribute('id', 'RangeFromTo');

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
        CalenderRangeHeadDateDiv.setAttribute('class', 'BrRs7 DyFx Br1_Cr MnLt10');

        var CalenderRangeHeadDateDivDate = document.createElement('div');
        CalenderRangeHeadDateDivDate.setAttribute('class', 'DyFx FxDnCn Pg8');

        if (RangeInput != null) {
            if (CurrentSelectedInput == StartDateInput) {
                CalenderRangeHeadDateDivDate.classList.add('FsActive');
            }
        }

        var CalenderRangeHeadDateDivDateCap = document.createElement('div');
        CalenderRangeHeadDateDivDateCap.setAttribute('class', 'MnLt2 FtWt900 FtSz10');
        CalenderRangeHeadDateDivDateCap.innerHTML = 'Check In';

        CalenderRangeHeadDateDivDate.appendChild(CalenderRangeHeadDateDivDateCap);

        var NormalDiv = document.createElement('div');
        NormalDiv.setAttribute('class', 'PnRe');
        var CalenderRangeHeadDateDivDateInp = document.createElement('input');
        CalenderRangeHeadDateDivDateInp.setAttribute('class', 'Mn0 Pg1 FtSz12 FtWt400 Br0_Cr Wh80p CrBdTt CrBrTt');
        CalenderRangeHeadDateDivDateInp.setAttribute('id', 'CalenderStartDateInput');
        CalenderRangeHeadDateDivDateInp.addEventListener('focus', () => { this.SelectStartOrEnd(Obj, 'Start'); });
        CalenderRangeHeadDateDivDateInp.setAttribute('placeholder', "DD/MM/YY");
        if (StartDateFo != null) {
            CalenderRangeHeadDateDivDateInp.value = StartDateFo;
        }
        NormalDiv.appendChild(CalenderRangeHeadDateDivDateInp);

        var CalenderRangeHeadDateDivDateInpClear = document.createElement('div');
        CalenderRangeHeadDateDivDateInpClear.setAttribute('class', 'PnAe FtSz10 Rt20 Tp0');

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
        CalenderRangeHeadDateDivDateCap2.setAttribute('class', 'MnLt2 FtWt900 FtSz10');
        CalenderRangeHeadDateDivDateCap2.innerHTML = 'Check Out';

        CalenderRangeHeadDateDivDate2.appendChild(CalenderRangeHeadDateDivDateCap2);

        var NormalDiv2 = document.createElement('div');
        NormalDiv2.setAttribute('class', 'PnRe');
        var CalenderRangeHeadDateDivDateInp2 = document.createElement('input');
        CalenderRangeHeadDateDivDateInp2.setAttribute('class', 'Mn0 Pg1 FtSz12 FtWt400 Br0_Cr Wh80p CrBdTt CrBrTt');
        CalenderRangeHeadDateDivDateInp2.setAttribute('id', 'CalenderStartDateInput');
        CalenderRangeHeadDateDivDateInp2.addEventListener('focus', () => { this.SelectStartOrEnd(Obj, 'End'); });
        CalenderRangeHeadDateDivDateInp2.setAttribute('oninput', 'CalenderStartCloseButton()');
        CalenderRangeHeadDateDivDateInp2.setAttribute('placeholder', "DD/MM/YY");
        if (EndDateFo != null) {
            CalenderRangeHeadDateDivDateInp2.value = EndDateFo;
        }
        NormalDiv2.appendChild(CalenderRangeHeadDateDivDateInp2);

        var CalenderRangeHeadDateDivDateInpClear2 = document.createElement('div');
        CalenderRangeHeadDateDivDateInpClear2.setAttribute('class', 'PnAe FtSz10 Rt20 Tp0');

        NormalDiv2.appendChild(CalenderRangeHeadDateDivDateInpClear2);

        CalenderRangeHeadDateDivDate2.appendChild(NormalDiv2);
        CalenderRangeHeadDateDiv.appendChild(CalenderRangeHeadDateDivDate2);

        // Calender End Date Input Ends

        //Add To Parent Div
        CalenderRangeHead.appendChild(CalenderRangeHeadDateDiv);
        //Ends

        // Calender Range Foot Starts From Here
        var CalenderRangeFoot = document.createElement('div');
        CalenderRangeFoot.setAttribute('class', 'DyFx Mn10 FxJySeBn');
        var Div1 = document.createElement('div');
        CalenderRangeFoot.appendChild(Div1);
        var CalenderRangeFootBnDv = document.createElement('div');
        CalenderRangeFootBnDv.setAttribute('class', 'DyFx Mn10 Gp6 JyCtCr FxAnImCr');;

        var ClearAnchor = document.createElement('a');
        ClearAnchor.setAttribute('class', 'TtDnLeUe Cr-rPr FtWt900 FtSz13 HrCrBdGy');
        ClearAnchor.innerText = "Clear Dates";
        ClearAnchor.addEventListener('click', () => { this.ClearCalenderDates(Obj); });
        CalenderRangeFootBnDv.appendChild(ClearAnchor);

        var CalenderRangeFootCsBn = document.createElement('div');
        CalenderRangeFootCsBn.setAttribute('class', 'Pg6 FtSz13 BrRs5 Cr-rPr FtWt600');
        CalenderRangeFootCsBn.innerHTML = 'Close';
        CalenderRangeFootCsBn.addEventListener('click', () => { this.CloseCalender(Obj); });
        CalenderRangeFootBnDv.append(CalenderRangeFootCsBn);
        CalenderRangeFoot.appendChild(CalenderRangeFootBnDv);
        // Calender Range Foot Ends  Here

        // Calender Month Head Starts From Here
        var CalenderMonthHeadCont = document.createElement('div');
        CalenderMonthHeadCont.classList.add('DyFx');
        CalenderMonthHeadCont.classList.add('FxJySeBn');

        var CalenderMonthHead1 = document.createElement('div');
        CalenderMonthHead1.setAttribute('class', 'DyFx FxAnImCr FxJyCtCr Wh100P Mn2 Ht40');
        var CalenderMonthHead1Child = document.createElement('div');
        CalenderMonthHead1Child.setAttribute('class', 'Wh100p');
        var CalenderMonthHead1ChildSpan = document.createElement('span');

        // Set on Click Event on Arrow
        CalenderMonthHead1ChildSpan.innerHTML = '<i class="UT-ArrowLeft"></i>';
        CalenderMonthHead1Child.appendChild(CalenderMonthHead1ChildSpan);

        // CalenderMonthHead1ChildsDiv starts
        var CalenderMonthHead1ChildsDiv = document.createElement('div');
        CalenderMonthHead1ChildsDiv.setAttribute('class', 'Cr-uPr FxGw1 FxCrAnJy');
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
        CalenderMonthHead2.setAttribute('class', 'DyFx FxAnImCr FxJyCtCr Wh100P Mn2 Ht40');
        var CalenderMonthHead2Child = document.createElement('div');
        CalenderMonthHead2Child.setAttribute('class', 'Wh100p');


        // CalenderMonthHead2ChildsDiv starts
        var CalenderMonthHead2ChildsDiv = document.createElement('div');
        CalenderMonthHead2ChildsDiv.setAttribute('class', 'Cr-uPr FxGw1 FxCrAnJy');
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
        CalenderHeadDiv.setAttribute('class', 'DyFx FxAnImCr FxJySeAd Wh100p Mn2 Ht40 FtWt600');
        CalenderDiv.appendChild(CalenderHeadDiv);

        // Main Heading Month
        const CalenderIconMonthDiv = document.createElement('div');
        CalenderHeadDiv.appendChild(CalenderIconMonthDiv);
        CalenderIconMonthDiv.innerHTML = '<i class="UT-MonthNumberLine FtSz18"></i>' + ' &nbsp; ' + ' Months'

        // Main Heading Year
        const CalenderCurrentYear = document.createElement('div');
        CalenderCurrentYear.setAttribute('class', "Cr-rPr");
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
            CalenderMonthDiv.setAttribute('class', 'DyFx FxDnRw FxAnImCr JyCtCr Wh100P');
            CalenderDiv.appendChild(CalenderMonthDiv);

            for (let c = 0; c < 4; c++) {
                const MonthInitials = document.createElement('div');
                MonthInitials.setAttribute('class', 'Wh100pD4 DyTeCl Pg10 Br1_Cr CrBrGy90Lt HrCrBdTe  Cr-rPr FtWt600');

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
            this.DateCalender(Obj);
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
        CalenderHeadDiv.setAttribute('class', 'DyFx FxAnImCr FxJySeBn Wh100p Mn2 Ht40 FtWt600');
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
        YearJumpDn3.setAttribute('class', "Cr-uPr");
        CalenderIconDownYearDiv.appendChild(YearJumpDn3);
        YearJumpDn3.innerHTML = '<i class="UT-ArrowDownOneLineCircleSolid" > A </i>';

        let YearJumpDn2 = document.createElement('div');
        const ObjJumpDn2 = JSON.parse(JSON.stringify(Obj));
        ObjJumpDn2.StartYear = parseInt(YearInt - 50);
        YearJumpDn2.addEventListener('click', () => this.YearCalender(ObjJumpDn2));
        YearJumpDn2.setAttribute('class', "Cr-uPr");
        CalenderIconDownYearDiv.appendChild(YearJumpDn2);
        YearJumpDn2.innerHTML = '<i class="UT-ArrowDownTwoLineCircleSolid" > B </i>';

        let YearJumpDn1 = document.createElement('div');
        const ObjJumpDn1 = JSON.parse(JSON.stringify(Obj));
        ObjJumpDn1.StartYear = parseInt(YearInt - 75);
        YearJumpDn1.addEventListener('click', () => this.YearCalender(ObjJumpDn1));
        YearJumpDn1.setAttribute('class', "Cr-uPr");
        CalenderIconDownYearDiv.appendChild(YearJumpDn1);
        YearJumpDn1.innerHTML = '<i class="UT-ArrowDownThreeLineCircleSolid" > C </i>';

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
        YearJump3.addEventListener('click', () => this.YearCalender(ObjJump3));
        YearJump3.setAttribute('class', "Cr-uPr");
        CalenderIconYearDiv.appendChild(YearJump3);
        YearJump3.innerHTML = '<i class="UT-ArrowUpThreeLineCircleSolid" > D </i>';

        let YearJump2 = document.createElement('div');
        const ObjJump2 = JSON.parse(JSON.stringify(Obj));
        ObjJump2.StartYear = parseInt(YearInt + 50);
        YearJump2.addEventListener('click', () => this.YearCalender(ObjJump2));
        YearJump2.setAttribute('class', "Cr-uPr");
        CalenderIconYearDiv.appendChild(YearJump2);
        YearJump2.innerHTML = '<i class="UT-ArrowUpTwoLineCircleSolid" > E </i>';

        let YearJump1 = document.createElement('div');
        const ObjJump1 = JSON.parse(JSON.stringify(Obj));
        ObjJump1.StartYear = parseInt(YearInt + 25);
        YearJump1.addEventListener('click', () => this.YearCalender(ObjJump1));
        YearJump1.setAttribute('class', "Cr-uPr");
        CalenderIconYearDiv.appendChild(YearJump1);
        YearJump1.innerHTML = '<i class="UT-ArrowUpOneLineCircleSolid" > F </i>';


        // Creating Year Table
        for (let r = 0; r < 5; r++) {
            const CalenderYearRowDiv = document.createElement('div');
            CalenderYearRowDiv.setAttribute('class', 'DyFx FxDnRw FxAnImCr JyCtCr Wh100P');
            CalenderDiv.appendChild(CalenderYearRowDiv);

            for (let c = 0; c < 5; c++) {
                // year index = (r*5 + c) -> year x to x+25
                let yearUd = YearInt + ((r * 5) + c);
                const YearInit = document.createElement('div');
                YearInit.setAttribute('class', 'Wh100pD5 DyTeCl Pg10 Br1_Cr CrBrGy90Lt HrCrBdTe  Cr-rPr FtWt600');
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

    //Adds Calender To UI
    AddCalender(Obj) {

        const { CreatedCalender: Calendar, CurrentSelectedInput: CurrentInput } = Obj;

        const currentInputElement = document.getElementById(CurrentInput);
        currentInputElement.classList.add('PnRe');

        // Removing the Previous Created Calendar
        this.CloseCalender(Obj);

        //Create Div To Push Calendar
        const displayCalenderDiv = document.createElement('div');

        // Set initial styles and attributes
        Object.assign(displayCalenderDiv, {
            className: 'PnAe BrRs5 ZIx1000000',
            id: `${CurrentInput}UT`
        });

        Object.assign(displayCalenderDiv.style, {
            backgroundColor: 'rgb(246 243 243 / 0.98)',
            top: '-500px' // out of viewport: it is hidden
        });

        displayCalenderDiv.appendChild(Calendar);
        currentInputElement.parentElement.appendChild(displayCalenderDiv)

        // Get Position of calendar - open where we have enough space
        const position = this.getCalendarPosition(CurrentInput, currentInputElement);

        // Apply positions
        Object.assign(displayCalenderDiv.style, position);

        //When click on body remove the calendar 
        document.getElementsByTagName('body')[0].addEventListener('mouseup', (event) => {
            this.RemoveCalendarCheck(event, CurrentInput);
        });

    }

    getCalendarPosition(inputElementId, inputElement) {
        // Get input element's position and dimensions
        const inputRect = inputElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Get calendar dimensions
        const calendarElement = document.getElementById(inputElementId + 'UT');
        const calendarHeight = calendarElement.clientHeight;
        const calendarWidth = calendarElement.clientWidth;

        // Calculate available space
        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceRight = viewportWidth - inputRect.right;

        let position = {
            top: 'auto',
            bottom: 'auto',
            left: 'auto',
            right: 'auto'
        };

        // Vertical positioning
        if (spaceBelow >= calendarHeight) {
            // Enough space below - position below input
            position.top = '105%';
            position.bottom = 'auto';
        } else {
            // Not enough space below - position above input
            position.bottom = '130%';
            position.top = 'auto';
        }

        // Horizontal positioning
        if (spaceRight >= calendarWidth) {
            // Enough space to the right - align with left edge
            position.left = '0';
            position.right = 'auto';
        } else {
            // Not enough space to the right - align with right edge
            position.right = '0';
            position.left = 'auto';
        }

        return position;
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
        this.DateCalender(Obj);
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
        var previouscalender = document.getElementById(CurrentSelectedInput + "UT");
        if (previouscalender) {
            previouscalender.remove();
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

        // If the Range Calender then
        document.body.removeAttribute('onmouseup');
        var ClickedCalender = document.getElementById(CurrentSelectedInput + "UT");
        if (ClickedCalender) {
            ClickedCalender.style.display = 'none';
            setTimeout(function () { ClickedCalender.remove() }, 1000);
        }

        // If Range Calender and Start date is selected then Fire Click Event on the EndDate Input
        if (RangeInput) {
            if (CurrentSelectedInput == StartDateInput) {
                //Check If the Date Start Date>= EndDate then Empty End Date
                var StartDate = new Date(document.getElementById(StartDateInput).value);
                var EndDate = new Date(document.getElementById(EndDateInput).value);
                if (StartDate >= EndDate) {
                    document.getElementById(EndDateInput).value = "";
                    Obj.SelectedEndDate = null;
                }
                document.getElementById(EndDateInput).click();
                Obj.CurrentSelectedInput = EndDateInput;
            }
        }

        if (CallBackFunc != null && CallBackFunc != "undefined" && CallBackFunc != "") {
            CallBackFunc(Obj);
        }
    }
}

class Index {
    constructor() {
        this.version = '1.0.0';
        this.name = 'Index';
    }

    //Suggestion
    CsSuggestion = new CsSuggestion();
    SnAd(ot) { this.CsSuggestion.AddSuggestion(ot); }
    SuggestionClose(InputIDStg) { this.CsSuggestion.SuggestionClose(InputIDStg); }
    SuggestionKeyPress(Ot, InputValStg, KeyCode) { this.CsSuggestion.SuggestionKeyPress(Ot, InputValStg, KeyCode); }
    SuggestionSelectKey(e, CallBack, Ot) { this.CsSuggestion.SuggestionSelectKey(e, CallBack, Ot); }

    //Ends


    //Top Nav
    CsTopNav = new CsTopNav();
    ReAeTpSbSbLk() { this.CsTopNav.RemoveActiveTpSbSbLk(); }
    TpNvAe(ot) { this.CsTopNav.TopNavActive(ot); }
    //Ends

    //Start Tabs variable
    Tabs = new CsTab();
    TbCt(ot) { this.Tabs.TabCT(ot); }//TabCreate
    TbAe(ot) { this.Tabs.TabCTActive(ot); }
    TbDe(ot) { this.Tabs.TabCTDisable(ot); }
    TbHe(ot) { this.Tabs.TabCTHide(ot); }
    TbCk(ot) { this.Tabs.TabCTClick(ot); }
    TbBnDy(ot) { this.Tabs.TabCTButtonDisplay(ot); }
    TbSlCk(ot, v) { this.Tabs.TabCTScrollClick(ot, v); }
    TbSl(ot, v) { this.Tabs.TabCTScroll(ot, v); }
    //Ends Tabs variable

    // Accordion Starts//
    Accordion = new CsAccordion();
    //Accordion Ends

    // Function Starts//
    CsFunc = new CsFunction();
    //On Load AddEvents
    EeFunc = this.CsFunc.AddEvent();
    //Copy Start
    CopyToClipboard(Ot, e) { this.CsFunc.CopyToClipboard(Ot, e); }
    //Copy Ends

    //DropDown Starts
    TlTpDpDn(Ot, e) { this.CsFunc.DropDown(Ot, e); }
    //DropDownEnds
    // Function Ends//

    toast() {
        // Toast Instance 
        const toast = new Toast();

        // initialize all toast
        toast.initToast();

        // static toasts without animation
        const objBottomLeft = {
            id: 'StaticToastBL',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            timeout: null, // to prevent memory leakage !important
            initialRender: true, // don't change this

            classes: {
                toastCT: 'ToastCT DyFx FxDnCn PnFd PnBm5 PnLt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'ToastCT DyNe',
            },

            animation: 'bubbleFade 3s ease-out forwards',

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            }
        }

        const objBottomRight = {
            id: 'StaticToastBR',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            initialRender: true, // don't change this
            timeout: null, // to prevent memory leakage !important

            classes: {
                toastCT: 'ToastCT DyFx FxDnCn PnFd PnBm5 PnRt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'ToastCT DyNe',
            },

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            }
        }

        const objTopLeft = {
            id: 'StaticToastTL',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            initialRender: true, // don't change this
            timeout: null, // to prevent memory leakage !important

            classes: {
                toastCT: 'ToastCT DyFx FxDnCn PnFd PnTp5 PnLt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'ToastCT DyNe',
            },

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            }
        }

        const objTopRight = {
            id: 'StaticToastTR',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            initialRender: true, // don't change this
            timeout: null, // to prevent memory leakage !important

            classes: {
                toastCT: 'ToastCT DyFx FxDnCn PnFd PnTp5 PnRt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'ToastCT DyNe',
            },

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            }
        }

        // execution
        const staticBtnIds = ["staticToastBtnBL",
            "staticToastBtnBR",
            "staticToastBtnTL",
            "staticToastBtnTR",];

        staticBtnIds.forEach((id, idx) => {
            switch (idx) {
                case 0:
                    document.getElementById(id)?.addEventListener('click', () => toast.showToast(objBottomLeft));
                    break;
                case 1:
                    document.getElementById(id)?.addEventListener('click', () => toast.showToast(objBottomRight));
                    break;
                case 2:
                    document.getElementById(id)?.addEventListener('click', () => toast.showToast(objTopLeft));
                    break;
                case 3:
                    document.getElementById(id)?.addEventListener('click', () => toast.showToast(objTopRight));
                    break;
                default:
                    break;
            }
        })

        // static animated toasts
        const objAnimatedBottomLeft = {
            id: 'StaticAnimatedToastBL',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            initialRender: true, // don't change this
            timeout: null, // to prevent memory leakage !important

            classes: {
                toastCT: 'ToastCT bounceFromTop DyFx FxDnCn PnFd PnBm5 PnLt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'ToastCT DyNe',
            },

            animation: 'bubbleFade 3s ease-out forwards',

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            }
        }

        const objAnimatedBottomRight = {
            id: 'StaticAnimatedToastBR',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            initialRender: true, // don't change this
            timeout: null, // to prevent memory leakage !important

            classes: {
                toastCT: 'ToastCT bubbleFadeBottomToTop DyFx FxDnCn PnFd PnBm5 PnRt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'ToastCT DyNe',
            },

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            }
        }

        const objAnimatedTopLeft = {
            id: 'StaticAnimatedToastTL',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            initialRender: true, // don't change this
            timeout: null, // to prevent memory leakage !important

            classes: {
                toastCT: 'ToastCT bubbleFadeTopToBottom DyFx FxDnCn PnFd PnTp5 PnLt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'ToastCT DyNe',
            },

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            }
        }

        const objAnimatedTopRight = {
            id: 'StaticAnimatedToastTR',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            initialRender: true, // don't change this
            timeout: null, // to prevent memory leakage !important

            classes: {
                toastCT: 'ToastCT bubbleFadeLeftToRight DyFx FxDnCn PnFd PnTp5 PnRt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'ToastCT DyNe',
            },

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            }
        }

        // execution
        const staticAnimatedBtnIds = ["staticAnimatedToastBtnBL",
            "staticAnimatedToastBtnBR",
            "staticAnimatedToastBtnTL",
            "staticAnimatedToastBtnTR",];

        staticAnimatedBtnIds.forEach((id, idx) => {
            switch (idx) {
                case 0:
                    document.getElementById(id)?.addEventListener('click', () => toast.showToast(objAnimatedBottomLeft));
                    break;
                case 1:
                    document.getElementById(id)?.addEventListener('click', () => toast.showToast(objAnimatedBottomRight));
                    break;
                case 2:
                    document.getElementById(id)?.addEventListener('click', () => toast.showToast(objAnimatedTopLeft));
                    break;
                case 3:
                    document.getElementById(id)?.addEventListener('click', () => toast.showToast(objAnimatedTopRight));
                    break;
                default:
                    break;
            }
        })

        // stacking Toasts
        const objStacking = {
            id: 'StackingToast',
            closeBtn: true,
            autoClose: 3000, // if zero then don't auto close
            dontShowAgain: false, // true if need don't show again button
            initialRender: true, // don't change this
            timeout: null, // to prevent memory leakage !important
            position: 'leftBottom', // leftBottom, rightBottom, leftTop, rightTop
            maxStack: 4,
            toastHeight: 0,
            classes: {
                toastCT: 'StackingToast ToastCT DyFx FxDnCn PnFd PnLt5 ZIx10000000000 CrWe WhMx97vw',
                hiddenToastCT: 'StackingToast ToastCT DyNe',
            },

            onSuccess: () => {
                console.log('on success');
            },

            onFail: () => {
                console.log('on fail')
            },

            customHTML: `
        <div class="StackingToast ToastCT">
            <div class="ToastHeadingContainer DyFx FxJySeBn CrBdRd PgLt10 PgRt10 PgTp5 PgBm5 BrTpLtRs10 BrTpRtRs10">

                <div class="ToastHeader FtSz20 FtWt600">Title</div>
                <span class="ToastCloseBtn FtWt600 Cr-rPr FtSz20">x</span>

            </div>
            <div class="ToastBodyContainer CrBdBe PgLt10 PgRt10 PgTp20 PgBm20" >
                <div class="ToastBody">Hello, world! This is a toast message from Celebrate Tech</div>
            </div>

            <div class="DyFx FxJySeBn FxAnImCr CrBdBe PgLt10 PgRt10 PgTp5 PgBm5 BrBmLtRs10 BrBmRtRs10">
                <button class="toastBtnSuccess Pg10 PgLt30 PgRt30 Br0_Cr BrRs20 CrBdGn40Lt91 CrWe FtSz16 FtWt600">Yes</button>
                <button class="toastBtnFailed Pg10 PgLt30 PgRt30 Br0_Cr BrRs20 CrBdRd40Lt91 CrWe FtSz16 FtWt600">No</button>
            </div>
        </div>
            `,
        }

        document.getElementById('stackingToastBtn')?.addEventListener('click', () => {
            toast.showStackingToast(objStacking);
        })
    }

    ToolTip = new ToolTip();

    // Initialize the SliderManager class
    SliderManager = new SliderManager();

    Calendar = new Calendar();
}

// Create an instance of the class
const CT = new Index();

CT.toast();

// Export the instance for use in the browser or with a module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = CT;
} else {
    window.CT = CT;
}
