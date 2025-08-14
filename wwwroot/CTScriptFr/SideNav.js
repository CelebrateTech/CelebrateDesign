

class SideNavBar {
    constructor(obj) {

        this.hotReload = obj?.hotReload || null;
        this.scrollBar = obj?.scrollBar || false;
        this.scrollBarDirectionLeft = obj?.scrollBarDirectionLeft || false;
        this.scrollTopOnReaload = obj?.scrollTopOnReaload || 20;
        this.scrollBarHideTime = obj?.scrollBarHideTime || 2000;
        this.scrollTop = 0;
        this.documentState = document.readyState;

        this.dropdownContainerMaxHeight = obj?.dropdownContainerMaxHeight || '200px';

        // Button: Partially Minimize Maximize Button
        this.NvSdMin = document.getElementsByClassName('NvSdMin');

        // Button: When side is full closed it will open side navbar
        this.NvSdOnBn = document.getElementsByClassName('NvSdOnBn');

        // Button: To full close sidenav
        this.NvSdHide = document.getElementsByClassName('NvSdHide');

        document.addEventListener('DOMContentLoaded', () => {
            this.createSideDropdown();
            this.attachEventListeners();
            this.handleNavSideLink();
            this.handleNavSideSubLink();
            this.handleNavSideSubSubLink();
            this.handleActiveStates();
            this.handleSideNavDropdown();
            this.handleScrollBar();
        });

    }

    /* 
        Attach event listeners to the side navigation elements.
        This function binds click events to the side navigation buttons and links.
    */
    attachEventListeners() {
        for (const el of this.NvSdMin) el.addEventListener('click', this.navPartialOpenClose.bind(this));
        for (const el of this.NvSdHide) el.addEventListener('click', this.handleNavSideHideUnHide.bind(this));
        for (const el of this.NvSdOnBn) el.addEventListener('click', this.handleNavSideHideUnHide.bind(this));
    }

    /* 
        Adding Event Listener To The Side Nav Links
        This function handles the click events for links in the side navigation bar.
        It manages the UI states and ensures that only the relevant link is expanded.
    */
    handleNavSideLink() {
        // Get all containers with the class 'NvSdLkCr'
        const containerList = document.querySelectorAll('.NvSdLkCr');

        containerList.forEach((container) => {

            const heading = container.querySelector('.NvSdLk');
            const subLinkSection = container.querySelector('.NvSdSbLkSn');

            // Make sure the heading exist
            if (!heading) return;

            const all_aTag = heading.querySelectorAll('a');
            if (this.hotReload) {
                this.handleHotReloadLink(all_aTag)
            }

            if (!this.isClickListernerAdded(heading)) {
                heading.addEventListener('click', (e) => {

                    const partiallyClosed = container.classList.contains('NvSdLkCrPlCe'); // side menu is partially closed: because it will work on onhover not on click
                    if (partiallyClosed) return;

                    // link exist but not clicked on it: so don't do anything
                    const aTag = heading.querySelector('a');
                    if (aTag && e.target !== aTag) return;

                    if (this.hotReload) {
                        e.stopPropagation();
                        e.preventDefault();
                    }

                    // Use closest() to efficiently find if an ancestor is an <a> tag
                    const linkElement = e.target.closest('a');

                    // close the side nav if clicked on link in mobile nav
                    if (linkElement) {
                        if (window.innerWidth < 768) {
                            this.handleNavSideHideUnHide();
                        }
                    }

                    // Determine the current status of the clicked link.
                    let currentLinkStatus = heading.classList.contains('NvSdLkAe') ? 'Active' : 'Inactive';

                    // Check the clicked element and its parent for the active class.
                    const headingContainer = heading.parentElement;
                    if (currentLinkStatus === 'Inactive' && headingContainer && headingContainer.classList.contains('NvSdLkAe')) {
                        currentLinkStatus = 'Active';
                    }

                    // Hide or show the subLinkSection based on its current status.
                    this.hideUnHideSubLinkSection({ subLinkSection });

                    // Remove the active headings from all containers and close the sub-link sections except the one that was clicked.
                    this.removeAllActiveLink({ containerList, subLinkSection });

                    // Remove the active class from all sub-link containers.
                    this.removeAllActiveSubLink();

                    // Remove active classes from any sub-sub links.
                    this.removeActiveSideSubSubLink();

                    // Collapse any open sub-sub link containers.
                    this.hideSubSubLinkContainer();

                    // If the current link was inactive, expand the subLinkSection and mark the heading active.
                    this.showNavLinkSection({ currentLinkStatus, heading, subLinkSection });

                    // keep all arrow icons of heading to the down direction
                    this.resetAllNavLinkArrowIcons();

                    // keep all sub link arrow icons to down direction
                    this.resetAllNavSubLinkArrowIcons();

                    // Rotate the arrow icon based on the current status. Either up or down
                    this.rotateNavLinkArrowIcon({ heading });
                });
            }
        });
    }

    /* 
        Adding Event Listener To The Side Nav SubLinks
        This function handles the click events for sub-links in the side navigation bar.
        It manages the UI states and ensures that only the relevant sub-link is expanded.
    */
    handleNavSideSubLink() {
        // Adding Event Listener To The Side Nav SubLinks
        document.querySelectorAll('.NvSdSbLkCr').forEach((subLinkContainer) => {
            // Cache the first sub-link element inside this container.
            const subLink = subLinkContainer.querySelector('.NvSdSbLk');

            const all_aTag = subLink.querySelectorAll('a');
            if (this.hotReload) {
                this.handleHotReloadLink(all_aTag)
            }
            if (!this.isClickListernerAdded(subLink)) {
                subLink.addEventListener('click', (e) => {
                    // link exist but not clicked on it: so don't do anything
                    const aTag = subLink.querySelector('a');
                    if (aTag && e.target !== aTag) return;

                    if (this.hotReload) {
                        e.stopPropagation();
                        e.preventDefault();
                    }

                    // Use closest() to efficiently find if an ancestor is an <a> tag
                    const linkElement = e.target.closest('a');

                    // close the side nav if clicked on link in mobile nav
                    if (linkElement) {
                        if (window.innerWidth < 768) {
                            this.handleNavSideHideUnHide();
                        }
                    }

                    // Determine the current status by checking if the subLink or its container is active.
                    let currentSbLinkStatus = subLink.classList.contains('NvSdLkSbAe') ? 'Active' : 'Inactive';

                    // Check the parent container for the active class.
                    if (currentSbLinkStatus === 'Inactive' && subLink && subLink.classList.contains('NvSdLkSbAe')) {
                        currentSbLinkStatus = 'Active';
                    }

                    // Remove the active class from all sub-links.
                    this.removeAllActiveSubLink();

                    //Remove the active class from all links when the side navigation is partially closed.
                    this.removeActiveLinksWhenPartiallyClosed({ all_aTag });

                    // Close any open sub-sub link containers.
                    this.hideSubSubLinkContainer();

                    // Remove active classes from sub-sub links.
                    this.removeActiveSideSubSubLink();

                    // If the current sub link was inactive, expand the subSubLinkSection and mark the sub-heading active.
                    this.showNavSubLinkSection({ currentSbLinkStatus, subLink, subLinkContainer });

                    // keep all arrow icon direction to down
                    this.resetAllNavSubLinkArrowIcons();

                    // Rotate the arrow icon based on the current status. Either up or down
                    this.rotateNavSubLinkArrowIcon({ subLink })

                });
            }
        });
    }

    /* 
        Adding Event Listener To The Side Nav SubSubLinks
        This function handles the click events for sub-sub links in the side navigation bar.
        It manages the UI states and ensures that only the relevant sub-sub link is expanded.
    */
    handleNavSideSubSubLink() {
        const subSubLinks = document.querySelectorAll('.NvSdSbSbLk');

        subSubLinks.forEach(link => {
            const all_aTag = link.querySelectorAll('a');
            if (this.hotReload) {
                this.handleHotReloadLink(all_aTag)
            }

            if (!this.isClickListernerAdded(link)) {
                link.addEventListener('click', (e) => {
                    // link exist but not clicked on it: so don't do anything
                    const aTag = link.querySelector('a');
                    if (aTag && e.target !== aTag) return;

                    if (this.hotReload) {
                        e.stopPropagation();
                        e.preventDefault();
                    }

                    // Use closest() to efficiently find if an ancestor is an <a> tag
                    const linkElement = e.target.closest('a');

                    // close the side nav if clicked on link in mobile nav
                    if (linkElement) {
                        if (window.innerWidth < 768) {
                            this.handleNavSideHideUnHide();
                        }
                    }

                    // Handle UI states
                    subSubLinks.forEach(l => l.classList.remove('NvSdLkSbSbAe'));

                    //Remove the active class from all links.
                    this.removeActiveLinksWhenPartiallyClosed({ all_aTag });

                    this.removeActiveSideSubSubLink();

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
            }
        });
    }

    /* 
        Remove the active class from all sub-sub links.
        This function ensures that no sub-sub links are marked as active.
    */
    removeActiveSideSubSubLink() {
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

    /* 
        Remove the active class from all main links when the side navigation is partially closed.
        This function ensures that no main links are marked as active when the side navigation is in a partially closed state.
        Reason: When the side navigation is partially closed, it should not show any active main links.
    */
    removeActiveLinksWhenPartiallyClosed({ all_aTag }) {
        all_aTag.forEach((a) => {
            if (a?.getAttribute('href') != '#') {
                document.querySelectorAll('.NvSdLkCrPlCe').forEach(con => {
                    con.querySelectorAll('.NvSdLk').forEach(conLinks => {
                        conLinks.classList.remove('NvSdLkAe');
                    });
                });
            }
        })
    }

    /* 
        Handle the active states of all links in the side navigation bar.
        This function checks if any link is active and updates the classes accordingly.
    */
    handleActiveStates() {
        const All_NvSdLkCr = document.getElementsByClassName('NvSdLkCr'); // main container of headings

        for (let NvSdLkCr of All_NvSdLkCr) {
            const All_NvSdLk = NvSdLkCr.getElementsByClassName('NvSdLk'); // all first layer headings

            for (let NvSdLk of All_NvSdLk) {
                if (NvSdLk.classList.contains('NvSdLkAe')) { // if first layer heading is active

                    // rotate the arrow icon of first layer heading
                    this.rotateNavLinkArrowIcon({ heading: NvSdLk });

                    const NvSdSbLkSn = NvSdLkCr.getElementsByClassName('NvSdSbLkSn')?.[0]; // all sub headings of first layer

                    if (NvSdSbLkSn && NvSdSbLkSn.classList.contains('DyNe')) {
                        NvSdSbLkSn.classList.remove('DyNe');
                        NvSdSbLkSn.classList.add('DyBk');

                        const All_NvSdSbLkCr = NvSdSbLkSn.getElementsByClassName('NvSdSbLkCr');

                        for (let NvSdSbLkCr of All_NvSdSbLkCr) {
                            const NvSdSbLk = NvSdSbLkCr.getElementsByClassName('NvSdSbLk')?.[0]; // sub heading

                            if (NvSdSbLk.classList.contains('NvSdLkSbAe')) {

                                // rotate the arrow icon of sub heading
                                this.rotateNavSubLinkArrowIcon({ subLink: NvSdSbLk });  

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

    /* 
        Handle the hot reload functionality for all anchor tags.
        This function adds an event listener to each anchor tag to prevent default behavior and call the hotReload function.
    */
    handleHotReloadLink(all_aTag) {
        all_aTag.forEach((a) => {
            if (!this.isClickListernerAdded(a)) {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hotReload.initATag(e, a);
                });
            }
        });
    }

    /* 
        Handle the side navigation hide/unhide functionality.
        This function toggles the side navigation bar between a fully closed and fully open state.
    */
    handleNavSideHideUnHide() {
        const NavSection = document.getElementsByClassName('NvSdSn')[0];
        const NvSdEm = document.getElementsByClassName('NvSd')[0];
        const NvUeDv = document.getElementsByClassName('NvSdOpenDv')[0];

        //fully closed 
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
            NavSection.style.zIndex = '1000';

            setTimeout(() => { NvUeDv.style.visibility = "visible"; }, 500);
        }
    }

    /* 
        Handle the side navigation partial open/close functionality.
        This function toggles the side navigation bar between a partially closed and fully open state.
    */
    navPartialOpenClose() {
        // Select the first element with the class 'NvSdSn'
        const navSection = document.querySelector('.NvSdSn');
        // Select all elements with the class 'NvSdLkCr'
        const navContainers = document.querySelectorAll('.NvSdLkCr');

        // [Nav Side Partial Close] Toggle the class 'NvSdPlCe' on the navSection
        const isClosing = navSection.classList.toggle('NvSdPlCe');

        // Select the main button container and the arrow element inside it
        const navButtonLink = document.querySelector('.NvSdBnLk');
        const arrowIcon = navButtonLink?.querySelector('.NvSdMin');

        if (navButtonLink && arrowIcon) {
            // Apply layout class changes based on toggle state
            const fromClass = isClosing ? 'FxJyCtFxEd' : 'FxJyCtSeBn';
            const toClass = isClosing ? 'FxJyCtSeBn' : 'FxJyCtFxEd';
            navButtonLink.classList.replace(fromClass, toClass);

            // Apply rotation
            arrowIcon.style.transform = `rotate(${isClosing ? 180 : 0}deg)`;
            arrowIcon.style.transition = 'transform 0.3s ease'; // Smooth transition
        }


        // Loop through each navContainer and toggle the class 'NvSdLkCrPlCe'
        navContainers.forEach(container => {
            container.classList.toggle('NvSdLkCrPlCe');
        });
    }

    /* 
        Handle the side navigation dropdown functionality.
        This function manages the display and positioning of dropdowns when hovering over side navigation links, when sidenav is partially closed.
    */
    handleSideNavDropdown() {

        const container = document.getElementsByClassName('NvSdLkCr');

        // Your existing mouseenter logic
        for (let con of container) {
            con.addEventListener('mouseenter', () => {
                if (con.classList.contains('NvSdLkCrPlCe')) {
                    const dropdown = con.querySelector('.NvSdDpDnCr');

                    // Hide all other dropdowns first
                    for (let _con of container) {
                        if (_con.classList.contains('NvSdLkCrPlCe')) {
                            const _dropdown = _con.querySelector('.NvSdDpDnCr');
                            if (_dropdown) {
                                _dropdown.style.display = 'none';
                            }
                        }
                    }

                    // Show and position current dropdown
                    if (dropdown) {
                        dropdown.style.display = 'block';
                        const rect = con.getBoundingClientRect();
                        dropdown.style.top = rect.top + 'px';
                        dropdown.style.left = rect.right + 'px';
                    }
                }
            });
        }

        // Hide dropdown only when click on document except current dropdown container
        document.addEventListener('click', function (event) {
            // Check if click is outside dropdown containers
            const isClickOutside = !event.target.closest('.NvSdDpDnCr') &&
                !event.target.closest('.NvSdLkCr');

            if (isClickOutside) {
                // Hide all dropdowns
                for (let con of container) {
                    const dropdown = con.querySelector('.NvSdDpDnCr');
                    if (dropdown) {
                        dropdown.style.display = 'none';
                    }
                }
            }
        });

    }

    /* 
        Highlight the active link in the side navigation bar.
        @param {string} ActiveLink - The name of the active main link.
        @param {string} ActiveSubLink - The name of the active sub-link.
        @param {string} ActiveSubSubLink - The name of the active sub-sub-link.
    */
    highlightActiveLinks({ activeLink, activeSubLink, activeSubSubLink }) {
        const safeAddClass = (selector, className) => {
            const element = document.querySelector(selector);
            if (element) element.classList.add(className);
        };

        safeAddClass(`[LkName="${activeLink}"]`, 'NvSdLkAe');
        safeAddClass(`[SbLkName="${activeSubLink}"]`, 'NvSdLkSbAe');
        safeAddClass(`[SbSbLkName="${activeSubSubLink}"]`, 'NvSdLkSbSbAe');

        /*
            Opening the user’s default active links on page load
            The first frame schedules the measurement
            The second frame ensures the DOM is ready and measurements are accurate
        */   
        let pageLoad = false;
        if (document.readyState === "loading" || document.readyState === "uninitialized") {
            pageLoad = true;
        }
        function openDefaultActiveLink() {
            requestIdleCallback(() => {
                const _activeSubLink = document.querySelector('.NvSdLkSbAe');
                let targetElement = null;
                let preActiveSublinkHeight = 0;
                let resizeObserver = null;

                //scroll to either active link -> sub link -> sub sub link
                const scrollToTarget = () => {
                    const NvSdDnLtRtCt = document.querySelector('.NvSdDnLtRtCt');
                    let debounceTimer = null;
                    const performScroll = () => {
                        if (!pageLoad || !targetElement || !NvSdDnLtRtCt) return;
                        if (debounceTimer) clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            const containerRect = NvSdDnLtRtCt.getBoundingClientRect();
                            const targetRect = targetElement.getBoundingClientRect();

                            /*
                                sometimes browser like mozila, brave cache state when we continuously reload page.
                                so use below logic reliably scroll
                            */

                            // Calculate the target position relative to the container
                            const targetPositionInContainer = targetRect.top - containerRect.top;

                            // Add current scroll position to get the absolute position within the container
                            const targetScrollPosition = NvSdDnLtRtCt.scrollTop + targetPositionInContainer;

                            const finalScrollPosition = Math.max(0, targetScrollPosition - this.scrollTopOnReaload);

                            NvSdDnLtRtCt.scrollTo({ top: finalScrollPosition, behavior: 'smooth' });
                            resizeObserver.disconnect();
                        }, 50)
                    };

                    // Observe the elements that are actually changing size
                    resizeObserver = new ResizeObserver(() => {
                        performScroll();
                    });
                };

                scrollToTarget()

                if (_activeSubLink) {
                    const subSubLinkContainer = _activeSubLink.parentElement.querySelector('.NvSdSbSbLkCr');
                    if (subSubLinkContainer) {
                        if (pageLoad) {
                            resizeObserver.observe(subSubLinkContainer)
                        }
                        preActiveSublinkHeight = subSubLinkContainer.scrollHeight;
                        subSubLinkContainer.style.maxHeight = `${preActiveSublinkHeight}px`;
                        const _activeSubSubLink = subSubLinkContainer.querySelector('.NvSdLkSbSbAe');
                        if (_activeSubSubLink) {
                            targetElement = _activeSubSubLink;
                        }
                    }
                    // If no sub-sub link, target the sub link
                    if (!targetElement) {
                        targetElement = _activeSubLink;
                    }
                }

                const _activeLink = document.querySelector('.NvSdLkAe');
                if (_activeLink) {
                    const subLinkContainer = _activeLink.parentElement.querySelector('.NvSdSbLkSn');
                    if (subLinkContainer) {
                        if (pageLoad) {
                            resizeObserver.observe(subLinkContainer);
                        }
                        subLinkContainer.style.maxHeight = `${subLinkContainer.scrollHeight + preActiveSublinkHeight}px`;
                    }
                    // Handle the arrow rotation
                    const arrowIcon = _activeLink.querySelector('.CT-ArrowDownCircleSolid');
                    if (arrowIcon) {
                        arrowIcon.style.transition = 'transform 0.3s ease';
                        arrowIcon.style.transformOrigin = 'center';
                        arrowIcon.style.transform = 'rotate(180deg)';
                    }
                    // If no target element yet, use the main active link
                    if (!targetElement) {
                        targetElement = _activeLink;
                    }
                }

            });
        }

        // Start the process
        openDefaultActiveLink = openDefaultActiveLink.bind(this); // 👈 Bind class context
        openDefaultActiveLink(); // 👈 Then call it
    }

    /* 
        Create a dropdown for side navigation links.
        This function fetches all elements with the class 'NvSdSbLkSn' and creates a dropdown for each Dynamically
    */
    createSideDropdown() {
        // Fetch all elements with class NvSdSbLkSn
        const linkContainers = document.querySelectorAll('.NvSdLkCr');

        linkContainers.forEach((linkContainer) => {
            const link = linkContainer.querySelector('.NvSdSbLkSn');
            if (!link) {
                // We don't have any sub link container: we need to show main link as a sublilnk here

                let dropdownItem = document.createElement('div');
                dropdownItem.classList.add('NvSdSbLkSn', 'HtMx100p', 'CrBdWe', 'sideDropDown');

                let subLinkContainer = document.createElement('div');
                subLinkContainer.classList.add('NvSdSbLkCr');

                dropdownItem.appendChild(subLinkContainer);

                // Main Link
                let navSideLink = linkContainer.querySelector('.NvSdLk');
                if (!navSideLink) return;

                // Keep a clone: don't affect original one
                let navSideLinkClone = navSideLink.cloneNode(true);
                navSideLinkClone.setAttribute('class', 'NvSdSbLk'); // change class Only: now it's sub link

                subLinkContainer.appendChild(navSideLinkClone);

                // Create dropdown wrapper and append dropdown item inside
                const dropdownContainer = document.createElement('div');
                dropdownContainer.classList.add('NvSdDpDnCr');
                dropdownContainer.appendChild(dropdownItem);
                dropdownContainer.style.maxHeight = this.dropdownContainerMaxHeight;

                linkContainer.appendChild(dropdownContainer);

            } else {
                // Clone the element to create a deep copy
                const linkClone = link.cloneNode(true); // true ensures deep copy

                // Add classes MxHt100p and CrBdWe to the cloned element
                linkClone.setAttribute('class', 'NvSdSbLkSn HtMx100p CrBdWe sideDropDown');

                // Create a new div with class NvSdDpDnCr
                const dropdownContainer = document.createElement('div');
                dropdownContainer.classList.add('NvSdDpDnCr');
                dropdownContainer.style.maxHeight = this.dropdownContainerMaxHeight;

                // Append the cloned link inside the dropdown container
                dropdownContainer.appendChild(linkClone);

                linkContainer.appendChild(dropdownContainer);
            }
        })
    }

    /*
        Rotate the heading's arrow icon based on the current status. Either up or down
        @param {HTMLElement} heading - The heading element containing the arrow icon.
    */
    rotateNavLinkArrowIcon({ heading }) {

        let arrowIcon = heading.querySelector('.CT-ArrowDownCircleSolid');
        if (arrowIcon) {

            // Apply the rotation with !important to override any conflicting styles
            arrowIcon.style.display = 'inline-block';
            arrowIcon.style.transition = 'transform 0.3s ease';
            arrowIcon.style.transformOrigin = 'center';

            // Try swapping the rotation values
            let currentLinkStatus = heading.classList.contains('NvSdLkAe'); // Active or Inactive

            if (currentLinkStatus) {
                arrowIcon.style.transform = 'rotate(180deg)';
            } else {
                arrowIcon.style.transform = 'rotate(0deg)';
            }
        }
    }

    /* 
        Reset all heading arrow icons to the down direction
    */
    resetAllNavLinkArrowIcons() {
        const allHeading = document.querySelectorAll('.NvSdLk');
        allHeading.forEach((head) => {
            const arrowIcon = head.querySelector('.CT-ArrowDownCircleSolid');
            if (arrowIcon) {
                arrowIcon.style.display = 'inline-block';
                arrowIcon.style.transition = 'transform 0.3s ease';
                arrowIcon.style.transform = 'rotate(0deg)';
            }
        });
    }

    /* 
        Rotate the subheading's arrow icon based on the current status. Either up or down
        @param {HTMLElement} subLink - The sub-link element containing the arrow icon.
        @param {string} currentSbLinkStatus - The current status of the sub-link (Active or Inactive).
    */
    rotateNavSubLinkArrowIcon({ subLink }) {

        let arrowIcon = subLink.querySelector('.CT-ArrowDownCircleSolid');
        if (arrowIcon) {

            // Apply the rotation with !important to override any conflicting styles
            arrowIcon.style.display = 'inline-block';
            arrowIcon.style.transition = 'transform 0.3s ease';
            arrowIcon.style.transformOrigin = 'center';

            // Try swapping the rotation values
            let currentSbLinkStatus = subLink.classList.contains('NvSdLkSbAe'); // Active or Inactive
            if (currentSbLinkStatus) {
                arrowIcon.style.transform = 'rotate(180deg)';
            } else {
                arrowIcon.style.transform = 'rotate(0deg)';
            }
        }
    }

    /* 
        Reset all sub link arrow icons to the down direction
    */
    resetAllNavSubLinkArrowIcons() {
        const allSubHeading = document.querySelectorAll('.NvSdSbLk');
        allSubHeading.forEach((subHead) => {
            const arrowIcon = subHead.querySelector('.CT-ArrowDownCircleSolid');
            if (arrowIcon) {
                arrowIcon.style.display = 'inline-block';
                arrowIcon.style.transition = 'transform 0.3s ease';
                arrowIcon.style.transform = 'rotate(0deg)';
            }
        });
    }

    /* 
        Hide or show the subLinkSection based on its current status.
        @param {HTMLElement} subLinkSection - The sub-link section to be toggled.
    */
    hideUnHideSubLinkSection({ subLinkSection }) {
        if (!subLinkSection) return;

        if (!subLinkSection.classList.contains('DyBk')) {
            subLinkSection.classList.remove('DyNe');
            subLinkSection.classList.add('DyBk');

            // Set max-height to the full scrollHeight to enable transition.
            subLinkSection.style.maxHeight = `${subLinkSection.scrollHeight}px`;
        } else {
            // collapse only if it not sideDropDown
            if (!subLinkSection.classList.contains('sideDropDown')) {

                // Collapse the subLinkSection.
                subLinkSection.style.maxHeight = '0px';

                // Delay the class change so that the CSS transition can occur.
                setTimeout(() => {
                    subLinkSection.classList.add('DyNe');
                    subLinkSection.classList.remove('DyBk');
                }, 500);
            }
        }
    }

    /* 
        Remove the active class from all main links and close their sub-link sections.
        @param {NodeList} containerList - List of all main link containers.
        @param {HTMLElement} subLinkSection - The sub-link section to be excluded from removal.
    */
    removeAllActiveLink({ containerList, subLinkSection }) {
        containerList.forEach((cont) => {
            const contHeading = cont.querySelector('.NvSdLk');
            contHeading.classList.remove('NvSdLkAe');

            //close all sub link sections
            const all_SubLinkSection = cont.querySelectorAll('.NvSdSbLkSn');
            all_SubLinkSection.forEach((sublink) => {

                // collapse only if it not sideDropDown
                if (!sublink.classList.contains('sideDropDown')) {
                    // skip this one: it is element on that user has clicked
                    if (subLinkSection && subLinkSection === sublink) return;

                    sublink.style.maxHeight = '0px';
                    sublink.classList.add("DyNe");
                    sublink.classList.remove("DyBk");
                }
            });
        });
    }

    /* 
        Remove the active class from all sub-links.
        This function ensures that no sub-links are marked as active.
    */
    removeAllActiveSubLink() {
        const subLinkContainers = document.querySelectorAll('.NvSdSbLkCr');
        subLinkContainers.forEach((subLinkContainer) => {
            const subLink = subLinkContainer.querySelector('.NvSdSbLk');
            if (subLink && subLink.classList.contains('NvSdLkSbAe')) {
                subLink.classList.remove('NvSdLkSbAe');
            }
        });
    }

    /* 
        Hide all sub-sub link containers.
        This function collapses all sub-sub link containers by setting their max-height to 0.
    */
    hideSubSubLinkContainer() {
        const subSubLinkContainers = document.querySelectorAll('.NvSdSbSbLkCr');
        subSubLinkContainers.forEach((subSubContainer) => {
            subSubContainer.style.maxHeight = '0px';
        });
    }

    /* 
        Show the sub-link section if it is inactive.
        @param {string} currentLinkStatus - The current status of the link (Active or Inactive).
        @param {HTMLElement} heading - The heading element to be marked active.
        @param {HTMLElement} subLinkSection - The sub-link section to be shown.
    */
    showNavLinkSection({ currentLinkStatus, heading, subLinkSection }) {
        if (currentLinkStatus === 'Inactive') {

            //mark heading as active 
            heading.classList.add('NvSdLkAe');

            //show if sub link section exist 
            if (subLinkSection) {
                subLinkSection.classList.add('DyBk');
                subLinkSection.classList.remove('DyNe');
                subLinkSection.style.maxHeight = `${subLinkSection.scrollHeight}px`;
            }
        }
    }

    /* 
        Show the sub-sub link section if it is inactive.
        @param {string} currentSbLinkStatus - The current status of the sub-link (Active or Inactive).
        @param {HTMLElement} subLink - The sub-link element to be marked active.
        @param {HTMLElement} subLinkContainer - The container element of the sub-link.
    */
    showNavSubLinkSection({ currentSbLinkStatus, subLink, subLinkContainer }) {
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
    }

    /*  
        Check if a click listener has already been added to the element.
        @param {HTMLElement} element - The element to check for a click listener.
        @returns {boolean} - Returns true if a click listener has been added, false otherwise.
    */
    isClickListernerAdded(element){
        if (!element) return false;
        if (element.hasAttribute('data-hot-reload-initialized')) {
            return true;
        } else {
            element.setAttribute('data-hot-reload-initialized', 'true');
            return false;
        }
    }

    /* 
        Handle the scroll bar visibility for the side navigation.
        This function adds or removes a scrollbar class based on the addScrollbar property.
    */
    handleScrollBar() {
        let NvSdDnLtRt = document.querySelector('.NvSdDnLtRt');
        let NvSdDnLtRtCt = document.querySelector('.NvSdDnLtRtCt');
        if (NvSdDnLtRt && NvSdDnLtRtCt) {
            if (this.scrollBar) {
                NvSdDnLtRt.classList.add('NvSdDnLtRtScrollBar');

                //custom scrollbar structure
                //<div class="NvSdCmSr" id="NvSdCmSr">
                //    <div class="NvSdCmSlTb" id="NvSdCmSlTb"></div>
                //</div>

                const createCustomScrollBar = () => {
                    let customScrollBarDiv = document.createElement('div');
                    customScrollBarDiv.classList.add('NvSdCmSr');
                    customScrollBarDiv.setAttribute('id', 'NvSdCmSr');

                    let customScrollBarThumb = document.createElement('div');
                    customScrollBarThumb.classList.add('NvSdCmSlTb');
                    customScrollBarThumb.setAttribute('id', 'NvSdCmSlTb');
                    customScrollBarDiv.appendChild(customScrollBarThumb);

                    if (this.scrollBarDirectionLeft) {
                        customScrollBarDiv.classList.add('NvSdCmSrLt');
                    } else {
                        customScrollBarDiv.classList.add('NvSdCmSrRt');
                    }
                    return customScrollBarDiv;
                }

                NvSdDnLtRtCt.appendChild(createCustomScrollBar());

                this.updateScrollBarOnScroll();

            } else {
                NvSdDnLtRt.classList.remove('NvSdDnLtRtScrollBar');
            }
        }
    }

    updateScrollBarOnScroll() {
        const content = document.querySelector('.NvSdDnLtRtCt');
        const scrollThumb = document.getElementById('NvSdCmSlTb');
        const customScrollbar = document.getElementById('NvSdCmSr');
        const NvSdDnLtRtScrollBar = document.querySelector('.NvSdDnLtRtScrollBar');

        if (!content || !scrollThumb || !customScrollbar || !NvSdDnLtRtScrollBar) console.error('custom scroll did not get element: NvSdDnLtRtCt || NvSdCmSlTb || NvSdCmSr');

        //add scrollbar on mousemove on.NvSdDnLtRtScrollBar
        //if mouse is not moving for 2 seconds then hide the scrollbar 
        let interval = null;
        NvSdDnLtRtScrollBar.addEventListener('mousemove', () => {
            customScrollbar.style.opacity = '1';
            customScrollbar.style.transform = 'translateX(0)';
            clearInterval(interval)
            interval = setInterval(() => {
                customScrollbar.style.opacity = '0';
                customScrollbar.style.transform = '';
            }, this.scrollBarHideTime);

        });

        //on mouse out hide scrollbar 
        NvSdDnLtRtScrollBar.addEventListener('mouseout', () => {
                customScrollbar.style.opacity = '0';
                customScrollbar.style.transform = '';
        });

        function updateScrollThumb() {
            const scrollTop = content.scrollTop;
            const scrollHeight = content.scrollHeight;
            const clientHeight = content.clientHeight;

            // Calculate thumb height based on content ratio
            const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * clientHeight);

            // Calculate thumb position
            const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);

            scrollThumb.style.height = thumbHeight + 'px';
            scrollThumb.style.transform = `translateY(${thumbTop}px)`;

            //on scroll visible scrollbar 
            if (!interval) return; // prevent unnecessary updates
            customScrollbar.style.opacity = '1';
            customScrollbar.style.transform = 'translateX(0)';
        }

        // Update thumb on scroll
        content.addEventListener('scroll', updateScrollThumb);

        // Initialize thumb
        updateScrollThumb();

        // Handle scrollbar dragging
        let isDragging = false;
        let startY = 0;
        let startScrollTop = 0;

        scrollThumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startScrollTop = content.scrollTop;
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaY = e.clientY - startY;
            const scrollRatio = deltaY / content.clientHeight;
            const maxScroll = content.scrollHeight - content.clientHeight;

            content.scrollTop = startScrollTop + (scrollRatio * maxScroll);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.userSelect = '';
        });

        // Handle scrollbar track clicks
        customScrollbar.addEventListener('click', (e) => {
            if (e.target === scrollThumb) return;

            const rect = customScrollbar.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const scrollRatio = clickY / customScrollbar.clientHeight;
            const maxScroll = content.scrollHeight - content.clientHeight;

            content.scrollTop = scrollRatio * maxScroll;
        });

    }
}
