

//We have defined it globally in HotReloader.js 
const hotReloader = new HotReloader();

/********************************* Side Navigation Bar *********************************/
class SideNavBar {
    constructor() {
        // Button: Partially Minimize Maximize Button
        this.NvSdMin = document.getElementsByClassName('NvSdMin');

        // Button: When side is full closed it it open side navbar
        this.NvSdOnBn = document.getElementsByClassName('NvSdOnBn');

        // Button: To full close sidenav
        this.NvSdHide = document.getElementsByClassName('NvSdHide');

        document.addEventListener('DOMContentLoaded', () => {
            this.attachEventListeners();
            this.handleNvSdLkCr();
            this.handleNvSdSbLk();
            this.handleNvSdSbSbLk();
            this.handleActiveStates();
        });
    }

    // It will attach event listeners to all the buttons
    attachEventListeners() {
        for (const el of this.NvSdMin) el.addEventListener('click', this.NavPartialOpenClose.bind(this));
        for (const el of this.NvSdHide) el.addEventListener('click', this.NvSdHideUnHide.bind(this));
        for (const el of this.NvSdOnBn) el.addEventListener('click', this.NvSdHideUnHide.bind(this));
    }

    NvSdHideUnHide() {
        const NavSection = document.getElementsByClassName('NvSdSn')[0];
        const NvSdEm = document.getElementsByClassName('NvSd')[0];
        const NvUeDv = document.getElementsByClassName('NvSdOpenDv')[0];

        if (NvSdEm.clientWidth === 0) {
            if (NavSection.classList.contains("NvSdCe")) {
                NavSection.classList.remove("NvSdCe");
            }
            NavSection.classList.add('NvSdSnOp');
            NvSdEm.style.width = "100%";
            NvUeDv.style.visibility = "hidden";
            NavSection.style.minWidth = null;
            NavSection.style.zIndex = '10000000';
        } else {
            NavSection.classList.add("NvSdCe");
            NvSdEm.style.width = "0";
            NavSection.style.minWidth = "0";
            NavSection.classList.remove('NvSdSnOp');
            NavSection.style.zIndex = '100';

            setTimeout(() => { NvUeDv.style.visibility = "visible"; }, 500);
        }
    }

    NavPartialOpenClose() {
        // Select the first element with the class 'NvSdSn'
        const navSection = document.querySelector('.NvSdSn');
        // Select all elements with the class 'NvSdLkCr'
        const navContainers = document.querySelectorAll('.NvSdLkCr');

        // Toggle the class 'NvSdPlCe' on the navSection
        navSection.classList.toggle('NvSdPlCe');
        const exist = navSection.classList.contains('NvSdPlCe');

        // Loop through each navContainer and toggle the class 'NvSdLkCrPlCe'
        navContainers.forEach(container => {
            container.classList.toggle('NvSdLkCrPlCe');

            const ele = container.querySelector('.side-dropdown-container')?.querySelector('.NvSdSbLkSn');
            if (ele?.classList.contains('DyNe')) {
                ele.classList.remove('DyNe');
                ele.classList.add('DyBk');
                ele.style.maxHeight = `${300}px`;
            }
        });
    }

    SideNavHighLight(ActiveLink, ActiveSubLink, ActiveSubSubLink) {
        const safeAddClass = (selector, className) => {
            const element = document.querySelector(selector);
            if (element) element.classList.add(className);
        };

        safeAddClass(`[LkName="${ActiveLink}"]`, 'NvSdLkAe');
        safeAddClass(`[SbLkName="${ActiveSubLink}"]`, 'NvSdLkSbAe');
        safeAddClass(`[SbSbLkName="${ActiveSubSubLink}"]`, 'NvSdLkSbSbAe');

        // Opening the user’s default active links on page load
        setTimeout(() => {
            const activeSubLink = document.querySelector('.NvSdLkSbAe');
            let preActiveSublinkHeight = 0;

            if (activeSubLink) {
                const subSubLinkContainer = activeSubLink.parentElement.querySelector('.NvSdSbSbLkCr');
                if (subSubLinkContainer) {
                    subSubLinkContainer.style.maxHeight = `${subSubLinkContainer.scrollHeight}px`;
                    preActiveSublinkHeight = subSubLinkContainer.scrollHeight;
                }
            }

            const activeLink = document.querySelector('.NvSdLkAe');
            if (activeLink) {
                const subLinkContainer = activeLink.parentElement.querySelector('.NvSdSbLkSn');
                if (subLinkContainer) {
                    subLinkContainer.style.maxHeight = `${subLinkContainer.scrollHeight + preActiveSublinkHeight}px`;
                }
            }
        }, 700);
    }

    handleNvSdLkCr() {
        // Get all containers with the class 'NvSdLkCr'
        const containerList = document.querySelectorAll('.NvSdLkCr');

        containerList.forEach((container) => {
            const heading = container.querySelector('.NvSdLk');
            const subLinkSection = container.querySelector('.NvSdSbLkSn');

            // Make sure both the heading and the subLinkSection exist
            if (!heading || !subLinkSection) return;

            heading.addEventListener('click', (e) => {
                
                const partiallyClosed = container.classList.contains('NvSdLkCrPlCe'); // side menu is partially closed: because it will work on onhover not on click
                if (partiallyClosed) return;

                const a = e.currentTarget.querySelector('a');

                hotReloader.initATag(e, a)

                // Determine the current status of the clicked link.
                // Check the clicked element and its parent for the active class.
                let currentLinkStatus = heading.classList.contains('NvSdLkAe') ? 'Active' : 'Inactive';
                if (currentLinkStatus === 'Inactive' && heading.parentElement.classList.contains('NvSdLkAe')) {
                    currentLinkStatus = 'Active';
                }

                // Toggle the subLinkSection height based on its current state.
                // The classes 'DyNe' and 'DyBk' are used to manage CSS transitions.
                if (!subLinkSection.classList.contains('DyBk')) {
                    subLinkSection.classList.remove('DyNe');
                    subLinkSection.classList.add('DyBk');
                    // Set max-height to the full scrollHeight to enable transition.
                    subLinkSection.style.maxHeight = `${subLinkSection.scrollHeight}px`;
                } else {
                    // Collapse the subLinkSection.
                    subLinkSection.style.maxHeight = '0px';
                    // Delay the class change so that the CSS transition can occur.
                    setTimeout(() => {
                        subLinkSection.classList.add('DyNe');
                        subLinkSection.classList.remove('DyBk');
                    }, 500);
                }

                // Remove the active class from all headings and subheadings in every container.
                containerList.forEach((cont) => {
                    const contHeading = cont.querySelector('.NvSdLk');
                    contHeading.classList.remove('NvSdLkAe');
                    const all_SubLinkSection = cont.querySelectorAll('.NvSdSbLkSn');
                    all_SubLinkSection.forEach((sublink) => {
                        // skip this one: it is element on that user has clicked
                        if (subLinkSection === sublink) return;
                        sublink.style.maxHeight = '0px';
                        sublink.classList.add("DyNe");
                        sublink.classList.remove("DyBk");
                    });
                });

                // Remove the active class from all sub-link containers.
                const subLinkContainers = document.querySelectorAll('.NvSdSbLkCr');
                subLinkContainers.forEach((subLinkContainer) => {
                    const subLink = subLinkContainer.querySelector('.NvSdSbLk');
                    if (subLink?.classList.contains('NvSdLkSbAe')) {
                        subLink.classList.remove('NvSdLkSbAe');
                    }
                });

                // Remove active classes from any sub-sub links.
                this.removeActiveSdSbSbLk();

                // Collapse any open sub-sub link containers.
                const subSubLinkContainers = document.querySelectorAll('.NvSdSbSbLkCr');
                subSubLinkContainers.forEach((subSubContainer) => {
                    subSubContainer.style.maxHeight = '0px';
                });

                // If the current link was inactive, expand the subLinkSection and mark the heading active.
                if (currentLinkStatus === 'Inactive') {
                    heading.classList.add('NvSdLkAe');
                    // Check if subLinkSection exists before trying to set its height.
                    if (subLinkSection) {
                        subLinkSection.classList.add('DyBk');
                        subLinkSection.classList.remove('DyNe');
                        subLinkSection.style.maxHeight = `${subLinkSection.scrollHeight}px`;
                    }
                }
            });
        });
    }

    handleNvSdSbLk() {
        // Adding Event Listener To The Side Nav SubLinks
        document.querySelectorAll('.NvSdSbLkCr').forEach((subLinkContainer) => {
            // Cache the first sub-link element inside this container.
            const subLink = subLinkContainer.querySelector('.NvSdSbLk');
            subLink.addEventListener('click', (e) => {
                e.preventDefault();
                const a = subLink.querySelector('a');
                hotReloader.initATag(e, a);

                // Determine the current status by checking if the subLink or its container is active.
                let currentSbLinkStatus = subLink.classList.contains('NvSdLkSbAe') ? 'Active' : 'Inactive';
                if (currentSbLinkStatus === 'Inactive' && subLink.classList.contains('NvSdLkSbAe')) {
                    currentSbLinkStatus = 'Active';
                }

                // Remove the active class from all sub-links.
                document.querySelectorAll('.NvSdSbLkCr').forEach((container) => {
                    const link = container.querySelector('.NvSdSbLk');
                    if (link && link.classList.contains('NvSdLkSbAe')) {
                        link.classList.remove('NvSdLkSbAe');
                    }
                });

                //Remove the active class from all links.
                if (a?.getAttribute('href') != '#') {
                    this.removeActiveClassFromMainLinks();
                }

                // Close any open sub-sub link containers.
                document.querySelectorAll('.NvSdSbSbLkCr').forEach((subSubContainer) => {
                    subSubContainer.style.maxHeight = 0;
                });

                // Remove active classes from sub-sub links.
                this.removeActiveSdSbSbLk();

                // Expand the sub-sub link container if the current link is inactive.
                if (currentSbLinkStatus === 'Inactive') {
                    // Add the active class to the clicked sub-link if not already set.
                    if (!subLink.classList.contains('NvSdLkSbAe')) {
                        subLink.classList.add('NvSdLkSbAe');
                    }

                    // Get the sub-sub link container from this element.
                    const subSubLinkContainer = subLinkContainer.querySelector('.NvSdSbSbLkCr');
                    if (subSubLinkContainer) {
                        // Expand the sub-sub container by setting its max-height to its scrollHeight.
                        subSubLinkContainer.style.maxHeight = subSubLinkContainer.scrollHeight + "px";

                        // Increase the parent's max-height by the sub-sub container's height.
                        // We use parseInt to extract numeric values; ensure that parent's maxHeight is defined (default to 0 if empty).
                        const parentElem = subLinkContainer.parentElement;
                        const currentMaxHeight = parseInt(parentElem.style.maxHeight) || 0;
                        const newHeight = currentMaxHeight + subSubLinkContainer.scrollHeight;
                        parentElem.style.maxHeight = newHeight + "px";
                    }
                }
            });
        });
    }

    handleNvSdSbSbLk() {
        const subSubLinks = document.querySelectorAll('.NvSdSbSbLk');

        subSubLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const a = link.querySelector('a');
                hotReloader.initATag(e, a);

                // Handle UI states
                subSubLinks.forEach(l => l.classList.remove('NvSdLkSbSbAe'));

                //Remove the active class from all links.
                if (a?.getAttribute('href') != '#') {
                    this.removeActiveClassFromMainLinks();
                }

                this.removeActiveSdSbSbLk();

                if (!link.classList.contains('NvSdLkSbSbAe')) {
                    link.classList.add('NvSdLkSbSbAe');
                    const subSubLinkContainer = link.parentElement.querySelector('.NvSdSbSbLkCr');
                    if (subSubLinkContainer) {
                        subSubLinkContainer.style.maxHeight = `${subSubLinkContainer.scrollHeight}px`;
                        const mainParent = link.parentElement.parentElement;
                        const currentHeight = parseInt(mainParent.style.maxHeight) || 0;
                        mainParent.style.maxHeight = `${currentHeight + subSubLinkContainer.scrollHeight}px`;
                    }
                }
            });
        });
    }

    // Removes the active Class From SbSbLink
    removeActiveSdSbSbLk() {
        // Get all sub-sub link containers.
        const subSubLinkContainers = document.querySelectorAll('.NvSdSbSbLkCr');

        subSubLinkContainers.forEach((container) => {
            // Remove the active class from each sub-sub link within the container.
            const subSubLinks = container.querySelectorAll('.NvSdSbSbLk');
            subSubLinks.forEach((link) => {
                link.classList.remove('NvSdLkSbSbAe');
            });

            // If needed, ensure the first sub-sub link doesn't retain the active class.
            const firstLink = container.querySelector('.NvSdSbSbLk');
            if (firstLink && firstLink.classList.contains('NvSdLkSbSbAe')) {
                firstLink.classList.remove('NvSdLkSbSbAe');
            }
        });
    }

    //Remove active class from all the links when sidenav is partially closed 
    removeActiveClassFromMainLinks() {
        document.querySelectorAll('.NvSdLkCrPlCe').forEach(con => {
            con.querySelectorAll('.NvSdLk').forEach(conLinks => {
                conLinks.classList.remove('NvSdLkAe');
            });
        });
    }

    handleActiveStates() {
        const All_NvSdLkCr = document.getElementsByClassName('NvSdLkCr'); // main container of headings

        for (let NvSdLkCr of All_NvSdLkCr) {
            const All_NvSdLk = NvSdLkCr.getElementsByClassName('NvSdLk'); // all first layer headings

            for (let NvSdLk of All_NvSdLk) {
                if (NvSdLk.classList.contains('NvSdLkAe')) { // if first layer heading is active
                    const NvSdSbLkSn = NvSdLkCr.getElementsByClassName('NvSdSbLkSn')?.[0]; // all sub headings of first layer

                    if (NvSdSbLkSn && NvSdSbLkSn.classList.contains('DyNe')) {
                        NvSdSbLkSn.classList.add('DyBk');
                        NvSdSbLkSn.classList.remove('DyNe');

                        const All_NvSdSbLkCr = NvSdSbLkSn.getElementsByClassName('NvSdSbLkCr');

                        for (let NvSdSbLkCr of All_NvSdSbLkCr) {
                            const NvSdSbLk = NvSdSbLkCr.getElementsByClassName('NvSdSbLk')?.[0]; // sub heading

                            if (NvSdSbLk.classList.contains('NvSdLkSbAe')) {
                                const NvSdSbSbLkCr = NvSdSbLkCr.getElementsByClassName('NvSdSbSbLkCr')?.[0];

                                if (NvSdSbSbLkCr) {
                                    const All_NvSdSbSbLk = NvSdSbSbLkCr.getElementsByClassName('NvSdSbSbLk');

                                    for (let NvSdSbSbLk of All_NvSdSbSbLk) {
                                        if (NvSdSbSbLk.classList.contains('NvSdLkSbSbAe')) {
                                            NvSdSbSbLkCr.classList.remove('DyNe');
                                            NvSdSbSbLkCr.classList.add('DyBk');
                                        }
                                    }
                                }
                            } else {
                                const NvSdSbSbLkCr = NvSdSbLkCr.getElementsByClassName('NvSdSbSbLkCr')?.[0];
                                if (NvSdSbSbLkCr) {
                                    NvSdSbSbLkCr.style.maxHeight = '0px';
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/************************************ Panel Toggle **************************************/
const PlTe = document.getElementsByClassName('PlTe');

for (let i = 0; i < PlTe.length; i++) {
    //Eye Open and Close Button Toogle 
    let eyeOpenElement = PlTe[i].getElementsByClassName(`CT-EyeOpen`)[0];
    let eyeCloseElement = PlTe[i].getElementsByClassName(`CT-EyeClose`)[0];
    let contentElement = PlTe[i].getElementsByClassName(`contentBody`)[0];
    let copyButton = PlTe[i].getElementsByClassName(`CT-CopyButton`)[0];

    if (!eyeOpenElement || !eyeCloseElement || !contentElement || !copyButton) break;

    eyeOpenElement.addEventListener('click', function () {
        eyeOpenElement.classList.remove('DyBk');
        eyeOpenElement.classList.add('DyNe');
        eyeCloseElement.classList.remove('DyNe');
        eyeCloseElement.classList.add('DyBk');
        contentElement.classList.remove('DyBk');
        contentElement.classList.add('DyNe');
    });

    eyeCloseElement.addEventListener('click', function () {
        eyeCloseElement.classList.remove('DyBk');
        eyeCloseElement.classList.add('DyNe');
        eyeOpenElement.classList.remove('DyNe');
        eyeOpenElement.classList.add('DyBk');
        contentElement.classList.remove('DyNe');
        contentElement.classList.add('DyBk');
    });

    copyButton.addEventListener('click', function () {
        // The text to be copied
        let textToCopy = contentElement.outerHTML;

        // Use the Clipboard API to copy the text
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert('copied');
            })
            .catch(err => {
                alert('failed to copy');
            });
    });
}
